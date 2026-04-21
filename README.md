# InnerBloom - Mental Health Support System

InnerBloom is a professional mental health chat application and admin management system built with React, Node.js, and MySQL. It features specialized chat modules, an advanced AI mood-tracking dashboard, and secure user authentication.

## ✨ Key Features

- **Professional UI/UX**: Modern symmetric design with glassmorphism aesthetic and a premium dark-themed sidebar.
- **Unified Mental Health Chat & Voice**: Specialized modules for Anxiety, Depression, and General support. The application features seamless Speech-to-Text (STT) parsing using Whisper—treating voice recordings identically to text sequences so that conversation contexts and diagnostic modules remain perfectly intact.
- **AI Face and Mood Tracker**: Live TensorFlow.js mood scanning and sentiment analysis.
- **Admin Control Center**: Comprehensive dashboard for monitoring user activity, mood logs, and managing registrations. Admins are empowered to test all user chat functionality dynamically without database errors.
- **Secure Authentication**: ROLE-based access control (Admin/User) and Route locking. 

---

## 🚀 Setup & Installation Guide

Here is exactly how to set up the project locally from scratch:

### 1. Database Setup
1. Ensure your local **MySQL/MariaDB** server is running.
2. Because MySQL is often not added to the terminal PATH on Windows, initialize the database by **searching for "MySQL Command Line Client"** in your Windows Start Menu. Open it, enter your password, and run the following commands (replace the path with your actual project directory path using forward slashes):
   ```sql
   mysql> CREATE DATABASE innerbloom;
   mysql> USE innerbloom;
   mysql> SOURCE C:/path/to/FYP-InnerBloom/server/schema.sql;
   ```
   *(This fully creates the `innerbloom` database and all required tables.)*

> **Note**: If you face connection errors like *`Plugin 'mysql_native_password' is not loaded`*, you must ensure your MySQL user uses standard encrypted caching:
> `ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'your_password';`
> `FLUSH PRIVILEGES;`

### 2. Environment Configuration

**1. Backend `.env` (`server/.env`)**
Create a `.env` file directly inside the `server/` directory. Be mindful of the Database Port (if you aren't using the default `3306`), and the Groq Key requirement.
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=innerbloom
DB_PORT=3300 # Only if using a custom MySQL port 

JWT_SECRET=your_super_secret_key
ENCRYPTION_KEY=your_exactly_32_chars_long_key_here

# Groq is used as the primary LLM engine (Llama-3 & Whisper)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**2. Frontend `.env` (`/.env`)**
Create a separate `.env` explicitly in the root directory (where package.json lies) specifically for Vite:
```env
# Frontend Vite environment variables
VITE_API_URL=http://localhost:5001
GROQ_API_KEY=gsk_your_frontend_groq_api_key_here
```

### 3. Installation
Install all Node modules for both ends simultaneously:
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 4. Running the Application
You will need two separate terminals efficiently running the application.

**Terminal 1 (Backend - API Server):**
```bash
cd server
npm run dev
```
*(Runs on `http://localhost:5001`)*

**Terminal 2 (Frontend - React UI):**
```bash
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🔐 Accounts for Testing
When the `schema.sql` database file was imported, it automatically instantiated test accounts for verification use. You can also securely use the signup feature dynamically.

**Admin Management Account:**
- **Email:** `admin@innerbloom.com`
- **Password:** `admin123`
*(Make sure you log out of any patient accounts to access the protected `/admin` route securely. You may test the chat feature as an Admin without crashing the system.)*

**Standard User Account:**
- **Email:** `user@innerbloom.com`
- **Password:** `password123` *(Note: Example password, we recommend simply registering a new generic user account for robust testing).*

---

## 📁 Project Structure Details
- **`/src`**: Frontend React application (Uses absolute routes mapped in `App.jsx`, organized by nested components).
- **`/server`**: Node.js/Express backend server handling Authentication, Groq API interfaces, and MySQL interactions safely.
- **`/public/models`**: Highly important standard folder holding the loaded TensorFlow FaceAPI manifestations securely formatted as `.bin` extensions.

---
*Created with ❤️ for Mental Health Support.*
