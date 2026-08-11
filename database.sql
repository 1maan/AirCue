CREATE DATABASE IF NOT EXISTS aircue DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE aircue;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('journalist', 'producer', 'presenter', 'admin') NOT NULL DEFAULT 'journalist',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON
  UPDATE
    CURRENT_TIMESTAMP
);

INSERT INTO users (full_name, username, email, role, password_hash)
VALUE ('Hussain imaan', 'A335041', 'imaan.dev@gmail.com', 'admin', '$2b$10$RRhS4brHRykq9FnqnTt5yeG8skFTzHf5gYlO/fdQj2.lo1WQv7UQu');