import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from './db.js';
import axios from 'axios';
import { OpenAI } from 'openai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long-!!!'; // Must be 32 chars
const IV_LENGTH = 16;
const groqOpenAI = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// --- ENCRYPTION HELPERS ---
function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return text; // Fallback for unencrypted messages
    }
}

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROUTES ---

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.post('/api/register', async (req, res) => {
    const { name, email, password, gender, age } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert into authentication
        const [authResult] = await connection.execute(
            'INSERT INTO authentication (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'patient']
        );
        const authId = authResult.insertId;

        // Insert into patients
        await connection.execute(
            'INSERT INTO patients (patient_id, fullname, age, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [authId, name, age, gender, email, hashedPassword]
        );

        await connection.commit();
        res.status(201).json({ message: 'User registered successfully', userId: authId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute(`
            SELECT a.auth_id as id, a.email, a.password, a.role, 
                   COALESCE(p.fullname, adm.name) as name
            FROM authentication a
            LEFT JOIN patients p ON a.auth_id = p.patient_id
            LEFT JOIN admin adm ON a.auth_id = adm.admin_id
            WHERE a.email = ?
        `, [email]);
        
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function getOrCreateChat(userId, module = 'general', chatId = null) {
    if (chatId && chatId !== 0) {
        const [rows] = await pool.execute('SELECT id FROM chats WHERE id = ? AND user_id = ?', [chatId, userId]);
        if (rows.length > 0) return chatId;
    }
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 1. Insert into base chats table
        const [chatResult] = await connection.execute(
            'INSERT INTO chats (user_id, module) VALUES (?, ?)',
            [userId, module]
        );
        const newChatId = chatResult.insertId;

        // 2. Insert into specific module table
        if (module === 'general') {
            await connection.execute(
                'INSERT INTO general_module (g_module_id, patient_id) VALUES (?, ?)',
                [newChatId, userId]
            );
        } else {
            // Specialized module
            await connection.execute(
                'INSERT INTO specialized_module (s_module_id, patient_id) VALUES (?, ?)',
                [newChatId, userId]
            );
            
            // Subtype tables
            const subtypes = ['anxiety', 'depression', 'ocd', 'bipolar', 'phobias'];
            if (subtypes.includes(module)) {
                await connection.execute(
                    `INSERT INTO ${module} (${module}_id, patient_id, s_module_id) VALUES (?, ?, ?)`,
                    [newChatId, userId, newChatId] 
                );
                // Note: using newChatId as subtype ID for simplicity and alignment with existing logic if possible, 
                // but the ERD shows they have their own *_id. Auto-increment will handle it if I don't specify it, 
                // but here I specify it to keep IDs consistent across tables if possible.
                // Looking at my migration, I didn't enforce CONSISTENT IDs for subtypes, only for modules.
                // Let's just let auto-increment handle subtype IDs but link via s_module_id.
            }
        }

        await connection.commit();
        return newChatId;
    } catch (error) {
        await connection.rollback();
        console.error('getOrCreateChat Error:', error);
        throw error;
    } finally {
        connection.release();
    }
}

app.post('/api/chat/general', authenticateToken, async (req, res) => {
    const { message, chatId: providedChatId, chatHistory = [] } = req.body;
    try {
        const chatId = await getOrCreateChat(req.user.id, 'general', providedChatId);

        const recentHistory = chatHistory.slice(-4);
        const messagesToGroq = [
            { role: "system", content: "You are a specialized medical and mental health AI assistant. ONLY answer questions related to physical, mental health, and well-being. If the user asks about anything unrelated (e.g., coding, math, general trivia), politely decline to answer. Keep answers exceptionally concise and to the point to provide immediate support. Do not add disclaimers to every single message. Be empathetic but very direct." },
            ...recentHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: "user", content: message }
        ];

        const groqKey = process.env.GROQ_API_KEY;
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-8b-8192",
                messages: messagesToGroq,
                max_tokens: 300
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const botResponse = response.data.choices[0].message.content;
        const encryptedUserMsg = encrypt(message);
        const encryptedBotMsg = encrypt(botResponse);

        await pool.execute(
            'INSERT INTO messages (chat_id, sender, text, g_module_id) VALUES (?, ?, ?, ?)',
            [chatId, 'user', encryptedUserMsg, chatId]
        );
        await pool.execute(
            'INSERT INTO messages (chat_id, sender, text, g_module_id) VALUES (?, ?, ?, ?)',
            [chatId, 'bot', encryptedBotMsg, chatId]
        );
        res.json({ response: botResponse, chatId });
    } catch (error) {
        console.error('AI Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'AI Error' });
    }
});

app.post('/api/chat/specialized', authenticateToken, async (req, res) => {
    const { message, module, chatId: providedChatId, chatHistory = [] } = req.body;
    try {
        const chatId = await getOrCreateChat(req.user.id, module, providedChatId);

        const recentHistory = chatHistory.slice(-4);
        const systemPrompt = `You are a professional mental health assistant strictly specializing in ${module}. ONLY answer questions related to mental health and the ${module} context. Decline unrelated questions gracefully. Keep answers extremely concise and helpful.`;

        const messagesToGroq = [
            { role: "system", content: systemPrompt },
            ...recentHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: "user", content: message }
        ];

        const groqKey = process.env.GROQ_API_KEY;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-8b-8192",
                messages: messagesToGroq,
                max_tokens: 300
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const botResponse = response.data.choices[0].message.content;
        const encryptedUserMsg = encrypt(message);
        const encryptedBotMsg = encrypt(botResponse);

        const subtypes = ['anxiety', 'depression', 'ocd', 'bipolar', 'phobias'];
        const subtypeCol = subtypes.includes(module) ? `${module}_id` : null;

        let query = 'INSERT INTO messages (chat_id, sender, text, s_module_id' + (subtypeCol ? `, ${subtypeCol}` : '') + ') VALUES (?, ?, ?, ?' + (subtypeCol ? ', ?' : '') + ')';
        let paramsUser = [chatId, 'user', encryptedUserMsg, chatId];
        if (subtypeCol) paramsUser.push(chatId);

        let paramsBot = [chatId, 'bot', encryptedBotMsg, chatId];
        if (subtypeCol) paramsBot.push(chatId);

        await pool.execute(query, paramsUser);
        await pool.execute(query, paramsBot);

        res.json({ response: botResponse, chatId });
    } catch (error) {
        console.error('AI Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'HF API Error' });
    }
});

app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chats/:id/messages', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC', [req.params.id]);
        const decryptedRows = rows.map(r => ({ ...r, text: decrypt(r.text) }));
        res.json(decryptedRows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/chats/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM chats WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const upload = multer({ dest: 'uploads/' });
app.post('/api/chat/voice', authenticateToken, upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No audio provided' });
    const audioPath = req.file.path;
    try {
        const transcription = await groqOpenAI.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-large-v3-turbo"
        });
        const userText = transcription.text;

        const completion = await groqOpenAI.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: "You are a specialized medical and mental health AI assistant. ONLY answer questions related to physical, mental health, and well-being. Keep answers exceptionally concise and to the point." },
                { role: "user", content: userText }
            ],
            max_tokens: 300
        });
        const botText = completion.choices[0].message.content;

        // Remove TTS (Text-To-Speech) generation because Groq does not support the /audio/speech endpoint.
        // The frontend React UI already uses window.speechSynthesis for native text-to-speech fallback playback.

        fs.unlinkSync(audioPath);
        const chatId = await getOrCreateChat(req.user.id, 'general', 0);
        
        const encryptedUserMsg = encrypt(userText);
        const encryptedBotMsg = encrypt(botText);

        await pool.execute(
            'INSERT INTO messages (chat_id, sender, text, g_module_id) VALUES (?, ?, ?, ?)',
            [chatId, 'user', encryptedUserMsg, chatId]
        );
        await pool.execute(
            'INSERT INTO messages (chat_id, sender, text, g_module_id) VALUES (?, ?, ?, ?)',
            [chatId, 'bot', encryptedBotMsg, chatId]
        );
        res.json({ userText, botText, audioUrl: null, chatId });
    } catch (error) {
        console.error(error);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        res.status(500).json({ error: 'Voice processing failed with Groq' });
    }
});

app.post('/api/mood/log', authenticateToken, async (req, res) => {
    const { mood_type, method, result_data } = req.body;
    try {
        await pool.execute('INSERT INTO mood_detection (patient_id, mood_type, method, result_data) VALUES (?, ?, ?, ?)', [req.user.id, mood_type, method, JSON.stringify(result_data)]);
        res.status(201).json({ message: 'Mood logged' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mood/history', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM mood_detection WHERE patient_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT a.auth_id as id, p.fullname as name, a.email, a.role, a.created_at 
            FROM authentication a
            LEFT JOIN patients p ON a.auth_id = p.patient_id
            LEFT JOIN admin adm ON a.auth_id = adm.admin_id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/moods', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT md.*, p.fullname as user_name 
            FROM mood_detection md 
            JOIN patients p ON md.patient_id = p.patient_id 
            ORDER BY md.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USER PROFILE & SETTINGS ---

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { name, email, age, gender } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.execute(
            'UPDATE authentication SET email = ? WHERE auth_id = ?',
            [email, req.user.id]
        );
        
        await connection.execute(
            'UPDATE patients SET fullname = ?, email = ?, age = ?, gender = ? WHERE patient_id = ?',
            [name, email, age, gender, req.user.id]
        );
        
        await connection.commit();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [rows] = await pool.execute('SELECT password FROM authentication WHERE auth_id = ?', [req.user.id]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute('UPDATE authentication SET password = ? WHERE auth_id = ?', [hashedPassword, req.user.id]);
        // Also update in patients if we store it there (redundant but the ERD shows it)
        await pool.execute('UPDATE patients SET password = ? WHERE patient_id = ?', [hashedPassword, req.user.id]);
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- FORGOT PASSWORD FLOW ---

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await pool.execute('SELECT auth_id as id FROM authentication WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            // Success even if not found (security)
            return res.json({ message: 'If an account exists, a reset link will be sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await pool.execute(
            'UPDATE authentication SET reset_token = ?, reset_expiry = ? WHERE auth_id = ?',
            [token, expiry, user.id]
        );

        // In a real app, send actual email. Here, we log it.
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        console.log(`[PASS_RESET] Sent to ${email}: ${resetLink}`);

        res.json({ message: 'Reset link generated. Check server console for link.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const [rows] = await pool.execute(
            'SELECT auth_id as id FROM authentication WHERE reset_token = ? AND reset_expiry > NOW()',
            [token]
        );
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            'UPDATE authentication SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE auth_id = ?',
            [hashedPassword, user.id]
        );
        await pool.execute('UPDATE patients SET password = ? WHERE patient_id = ?', [hashedPassword, user.id]);

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('uncaughtException', err => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', err => console.error('Unhandled Rejection:', err));