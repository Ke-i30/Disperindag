import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Ambil daftar pertanyaan survei yang aktif
export async function GET() {
  try {
    const questions = await query(
      `SELECT id, question_text, order_num FROM questions WHERE is_active = 1 ORDER BY order_num ASC, id ASC`
    );
    return NextResponse.json({ success: true, data: questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
