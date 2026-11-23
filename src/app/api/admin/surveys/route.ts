import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';

// GET: Ambil daftar respon survei dengan pagination, search, dan filter
export async function GET(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const serviceType = searchParams.get('service_type') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 10)));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(s.respondent_name LIKE ? OR s.job LIKE ? OR s.critique LIKE ? OR s.suggestion LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (serviceType) {
      conditions.push('s.service_type = ?');
      params.push(serviceType);
    }

    if (startDate) {
      conditions.push('DATE(s.created_at) >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('DATE(s.created_at) <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Hitung total data
    const [countResult]: any = await query(
      `SELECT COUNT(*) as total FROM surveys s ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;

    // Ambil data survei
    const surveys: any[] = await query(
      `SELECT s.*, 
        (SELECT AVG(score) FROM survey_answers WHERE survey_id = s.id) as avg_score
       FROM surveys s
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Ambil jawaban untuk survei yang ada di halaman ini
    if (surveys.length > 0) {
      const surveyIds = surveys.map(s => s.id);
      const answers: any[] = await query(
        `SELECT sa.*, q.question_text 
         FROM survey_answers sa
         JOIN questions q ON sa.question_id = q.id
         WHERE sa.survey_id IN (${surveyIds.map(() => '?').join(',')})
         ORDER BY q.order_num ASC`,
        surveyIds
      );

      // Kelompokkan jawaban ke masing-masing survei
      const answerMap: Record<number, any[]> = {};
      answers.forEach(ans => {
        if (!answerMap[ans.survey_id]) answerMap[ans.survey_id] = [];
        answerMap[ans.survey_id].push(ans);
      });

      surveys.forEach(s => {
        s.answers = answerMap[s.id] || [];
      });
    }

    return NextResponse.json({
      success: true,
      data: surveys,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus survei berdasarkan ID
export async function DELETE(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID survei wajib diisi' }, { status: 400 });
    }

    // ON DELETE CASCADE pada tabel survey_answers akan menghapus detail jawabannya secara otomatis
    await query(`DELETE FROM surveys WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Data survei berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
