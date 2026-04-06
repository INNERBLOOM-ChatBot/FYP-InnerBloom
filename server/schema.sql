CREATE DATABASE IF NOT EXISTS innerbloom;

USE innerbloom;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL, -- FIXED (was 255)
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    age INT,
    role ENUM('user', 'admin') DEFAULT 'user',
    reset_token VARCHAR(255),
    reset_expiry TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mood_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_type VARCHAR(100) NOT NULL,
    method ENUM('face', 'voice') NOT NULL,
    result_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dummy Data
INSERT INTO users (name, email, password, gender, age, role) VALUES 
('Admin User', 'admin@innerbloom.com', '$2b$10$evvSFpuMnoVE0ANN6B9tvem.QEY3bMFTbg.yYTdNTmyZITQBMZdOa', 'Other', 30, 'admin'),
('Test User', 'user@innerbloom.com', '$2b$10$4dkxKYQZ9RLxhrh5xeguIOYRPjHCqY9ZASCJhwUp8gXvQILDMvn8G', 'Female', 25, 'user')
ON DUPLICATE KEY UPDATE email=email;