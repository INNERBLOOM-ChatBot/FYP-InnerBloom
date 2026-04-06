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
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, gender, age) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, gender, age]
        );
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
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
    if (chatId) {
        const [rows] = await pool.execute('SELECT id FROM chats WHERE id = ? AND user_id = ?', [chatId, userId]);
        if (rows.length > 0) return chatId;
    }
    const [result] = await pool.execute('INSERT INTO chats (user_id, module) VALUES (?, ?)', [userId, module]);
    return result.insertId;
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
        await pool.execute('INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)', [chatId, 'user', encrypt(message)]);
        await pool.execute('INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)', [chatId, 'bot', encrypt(botResponse)]);
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
        await pool.execute('INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)', [chatId, 'user', encrypt(message)]);
        await pool.execute('INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)', [chatId, 'bot', encrypt(botResponse)]);
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
        await pool.execute('INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)', [chatId, 'user', encrypt(userText)]);
        await pool.execute('INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)', [chatId, 'bot', encrypt(botText)]);
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
        await pool.execute('INSERT INTO mood_logs (user_id, mood_type, method, result_data) VALUES (?, ?, ?, ?)', [req.user.id, mood_type, method, JSON.stringify(result_data)]);
        res.status(201).json({ message: 'Mood logged' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/mood/history', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/moods', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`SELECT ml.*, u.name as user_name FROM mood_logs ml JOIN users u ON ml.user_id = u.id ORDER BY ml.created_at DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USER PROFILE & SETTINGS ---

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { name, email, age, gender } = req.body;
    try {
        await pool.execute(
            'UPDATE users SET name = ?, email = ?, age = ?, gender = ? WHERE id = ?',
            [name, email, age, gender, req.user.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- FORGOT PASSWORD FLOW ---

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            // Success even if not found (security)
            return res.json({ message: 'If an account exists, a reset link will be sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await pool.execute(
            'UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?',
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
            'SELECT id FROM users WHERE reset_token = ? AND reset_expiry > NOW()',
            [token]
        );
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute(
            'UPDATE users SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

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