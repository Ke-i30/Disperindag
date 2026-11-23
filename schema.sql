-- Skema Database Sistem Informasi Survei Kepuasan Masyarakat (SKM)
-- Dinas Perdagangan dan Perindustrian (Disperindag) - Layanan Tera & Tera Ulang

CREATE DATABASE IF NOT EXISTS `disperindag_skm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `disperindag_skm`;

-- 1. Tabel Administrator
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Pertanyaan Survei
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `question_text` VARCHAR(255) NOT NULL,
    `order_num` INT DEFAULT 1,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Data Survei (Responden)
CREATE TABLE IF NOT EXISTS `surveys` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `respondent_name` VARCHAR(100) NOT NULL,
    `gender` ENUM('L', 'P') NULL,
    `age` INT NULL,
    `job` VARCHAR(100) NULL,
    `service_type` ENUM('tera', 'tera_ulang') NOT NULL,
    `critique` TEXT NULL,
    `suggestion` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Jawaban Survei
CREATE TABLE IF NOT EXISTS `survey_answers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `survey_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    `answer_value` ENUM('puas', 'cukup_puas', 'tidak_puas') NOT NULL,
    `score` INT NOT NULL DEFAULT 3, -- 3: Puas, 2: Cukup Puas, 1: Tidak Puas
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Default Pertanyaan
INSERT INTO `questions` (`question_text`, `order_num`, `is_active`) VALUES
('Apakah petugas pelayanan bersikap ramah, sopan, dan komunikatif?', 1, 1),
('Apakah waktu pelayanan tera/tera ulang cepat dan sesuai dengan standar yang ditentukan?', 2, 1),
('Apakah prosedur dan alur pelayanan mudah dipahami serta tidak berbelit-belit?', 3, 1),
('Secara keseluruhan, apakah hasil pelayanan tera/tera ulang sudah memuaskan?', 4, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;
