import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST(req: Request) {
  const pool = getDbPool();
  const conn = await pool.getConnection();

  try {
    const body = await req.json();
    const { respondent_name, gender, age, job, service_type, answers, critique, suggestion } = body;

    // Validasi field wajib
    if (!respondent_name || respondent_name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama responden wajib diisi' }, { status: 400 });
    }

    if (!service_type || !['tera', 'tera_ulang'].includes(service_type)) {
      return NextResponse.json({ success: false, error: 'Jenis pelayanan tidak valid' }, { status: 400 });
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ success: false, error: 'Jawaban survei wajib diisi' }, { status: 400 });
    }

    // Dapatkan IP klien
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    await conn.beginTransaction();

    // 1. Simpan ke tabel surveys
    const [surveyResult]: any = await conn.query(
      `INSERT INTO surveys (respondent_name, gender, age, job, service_type, critique, suggestion, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        respondent_name.trim(),
        gender || null,
        age ? Number(age) : null,
        job ? job.trim() : null,
        service_type,
        critique ? critique.trim() : null,
        suggestion ? suggestion.trim() : null,
        ip
      ]
    );

    const surveyId = surveyResult.insertId;

    // 2. Simpan setiap jawaban ke survey_answers
    for (const ans of answers) {
      const { question_id, answer_value } = ans;
      if (!question_id || !answer_value) continue;

      let score = 3;
      if (answer_value === 'puas') score = 3;
      else if (answer_value === 'cukup_puas') score = 2;
      else if (answer_value === 'tidak_puas') score = 1;

      await conn.query(
        `INSERT INTO survey_answers (survey_id, question_id, answer_value, score)
         VALUES (?, ?, ?, ?)`,
        [surveyId, question_id, answer_value, score]
      );
    }

    await conn.commit();

    return NextResponse.json({
      success: true,
      message: 'Survei berhasil dikirim. Terima kasih atas partisipasi Anda!',
      surveyId
    });
  } catch (error: any) {
    await conn.rollback();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
