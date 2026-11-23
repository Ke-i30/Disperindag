import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedAdmin() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'disperindag_skm';

  const connection = await mysql.createConnection({ host, port, user, password, database });

  const adminEmail = '';
  const defaultPassword = 'admin';
  const hash = await bcrypt.hash(defaultPassword, 10);

  const [existing] = await connection.query('SELECT * FROM admins WHERE username = ?', [adminEmail]);
  if (existing.length === 0) {
    await connection.query(
      'INSERT INTO admins (username, password_hash, full_name) VALUES (?, ?, ?)',
      [adminEmail, hash, 'Super Admin Disperindag']
    );
    console.log(`Akun admin utama berhasil dibuat: ${adminEmail} (password: ${defaultPassword})`);
  } else {
    await connection.query(
      'UPDATE admins SET password_hash = ?, full_name = ? WHERE username = ?',
      [hash, 'Super Admin Disperindag', adminEmail]
    );
    console.log(`Akun admin utama ${adminEmail} diperbarui (password: ${defaultPassword})`);
  }

  await connection.end();
}

seedAdmin().catch(console.error);
