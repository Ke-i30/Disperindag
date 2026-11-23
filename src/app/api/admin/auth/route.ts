import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signAdminToken, getAdminSession } from '@/lib/auth';

// POST: Login admin
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const admins: any[] = await query(
      `SELECT * FROM admins WHERE username = ? LIMIT 1`,
      [username.trim()]
    );

    if (admins.length === 0) {
      return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
    }

    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
    }

    const token = signAdminToken({
      id: admin.id,
      username: admin.username,
      fullName: admin.full_name
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name
      }
    });

    // Pasang HttpOnly cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Cek status sesi admin saat ini
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Belum login' }, { status: 401 });
  }
  return NextResponse.json({ success: true, admin: session });
}

// DELETE: Logout admin
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0)
  });
  return response;
}
