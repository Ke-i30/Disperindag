import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';

// GET: Ambil semua pertanyaan (termasuk yang non-aktif) untuk admin
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const questions = await query(
      `SELECT * FROM questions ORDER BY order_num ASC, id ASC`
    );
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah pertanyaan baru
export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { question_text, order_num = 1, is_active = 1 } = body;

    if (!question_text || question_text.trim() === '') {
      return NextResponse.json({ success: false, error: 'Teks pertanyaan wajib diisi' }, { status: 400 });
    }

    const result: any = await query(
      `INSERT INTO questions (question_text, order_num, is_active) VALUES (?, ?, ?)`,
      [question_text.trim(), Number(order_num), is_active ? 1 : 0]
    );

    return NextResponse.json({ success: true, message: 'Pertanyaan berhasil ditambahkan', id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Perbarui pertanyaan
export async function PUT(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, question_text, order_num, is_active } = body;

    if (!id || !question_text) {
      return NextResponse.json({ success: false, error: 'ID dan teks pertanyaan wajib diisi' }, { status: 400 });
    }

    await query(
      `UPDATE questions SET question_text = ?, order_num = ?, is_active = ? WHERE id = ?`,
      [question_text.trim(), Number(order_num), is_active ? 1 : 0, id]
    );

    return NextResponse.json({ success: true, message: 'Pertanyaan berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus pertanyaan
export async function DELETE(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pertanyaan diperlukan' }, { status: 400 });
    }

    await query(`DELETE FROM questions WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Pertanyaan berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
