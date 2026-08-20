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


CREATE TABLE stories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    story_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    slug VARCHAR(255) NOT NULL,
    language ENUM('dv', 'en') NOT NULL DEFAULT 'dv',
    cg_text VARCHAR(255) DEFAULT NULL,
    story_text LONGTEXT NOT NULL,
    status ENUM( 'draft', 'ready', 'approved', 'archived') NOT NULL DEFAULT 'draft',
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE run_orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    run_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    air_time TIME DEFAULT NULL,
    status ENUM(
        'draft',
        'ready',
        'live',
        'completed',
        'archived'
    ) NOT NULL DEFAULT 'draft',
    producer_id INT UNSIGNED DEFAULT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE run_order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    run_order_id INT UNSIGNED NOT NULL,
    item_type ENUM('story', 'break') NOT NULL,
    story_id INT UNSIGNED DEFAULT NULL,
    break_name VARCHAR(150) DEFAULT NULL,
    position INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (run_order_id)
        REFERENCES run_orders(id)
        ON DELETE CASCADE,
    FOREIGN KEY (story_id)
        REFERENCES stories(id)
        ON DELETE SET NULL,
    INDEX idx_rundown_position (run_order_id, position)
);