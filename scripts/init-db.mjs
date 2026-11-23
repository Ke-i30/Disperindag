import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'disperindag_skm';

  console.log(`Menghubungkan ke MySQL di ${host}:${port} sebagai ${user}...`);

  try {
    const connection = await mysql.createConnection({ host, port, user, password });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✓ Basis data \`${database}\` siap.`);

    await connection.changeUser({ database });

    // 1. Buat tabel admins
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Buat tabel questions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`questions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`question_text\` VARCHAR(255) NOT NULL,
        \`order_num\` INT DEFAULT 1,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Buat tabel surveys
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`surveys\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`respondent_name\` VARCHAR(100) NOT NULL,
        \`gender\` ENUM('L', 'P') NULL,
        \`age\` INT NULL,
        \`job\` VARCHAR(100) NULL,
        \`service_type\` ENUM('tera', 'tera_ulang') NOT NULL,
        \`critique\` TEXT NULL,
        \`suggestion\` TEXT NULL,
        \`ip_address\` VARCHAR(45) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Buat tabel survey_answers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`survey_answers\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`survey_id\` INT NOT NULL,
        \`question_id\` INT NOT NULL,
        \`answer_value\` ENUM('puas', 'cukup_puas', 'tidak_puas') NOT NULL,
        \`score\` INT NOT NULL DEFAULT 3,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_survey\` FOREIGN KEY (\`survey_id\`) REFERENCES \`surveys\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_question\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Masukkan pertanyaan default jika belum ada
    const [qRows] = await connection.query(`SELECT COUNT(*) as count FROM \`questions\``);
    if (qRows[0].count === 0) {
      await connection.query(`
        INSERT INTO \`questions\` (\`question_text\`, \`order_num\`, \`is_active\`) VALUES
        ('Apakah petugas pelayanan bersikap ramah, sopan, dan komunikatif?', 1, 1),
        ('Apakah waktu pelayanan tera/tera ulang cepat dan sesuai dengan standar yang ditentukan?', 2, 1),
        ('Apakah prosedur dan alur pelayanan mudah dipahami serta tidak berbelit-belit?', 3, 1),
        ('Secara keseluruhan, apakah hasil pelayanan tera/tera ulang sudah memuaskan?', 4, 1);
      `);
      console.log(`✓ 4 pertanyaan default survei berhasil ditambahkan.`);
    }

    // Masukkan admin default jika belum ada
    const [adminRows] = await connection.query(`SELECT COUNT(*) as count FROM \`admins\``);
    if (adminRows[0].count === 0) {
      const defaultPassword = 'admin'; // default login: admin / admin
      const hash = await bcrypt.hash(defaultPassword, 10);
      await connection.query(`
        INSERT INTO \`admins\` (\`username\`, \`password_hash\`, \`full_name\`)
        VALUES ('admin', ?, 'Administrator Disperindag');
      `, [hash]);
      console.log(`✓ Akun admin default berhasil dibuat (username: admin, password: admin).`);
    }

    console.log(`\nSelamat! Inisialisasi basis data selesai dengan sukses.`);
    await connection.end();
  } catch (error) {
    console.error(`Gagal menghubungkan ke MySQL:`, error.message);
    console.log(`Pastikan service MySQL Anda (misal XAMPP/Laragon/MySQL Server) sedang berjalan.`);
  }
}

initDb();
