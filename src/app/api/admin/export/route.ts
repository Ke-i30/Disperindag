import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const serviceType = searchParams.get('service_type') || '';

    const conditions: string[] = [];
    const params: any[] = [];

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

    const surveys: any[] = await query(
      `SELECT s.* FROM surveys s ${whereClause} ORDER BY s.created_at DESC`,
      params
    );

    if (surveys.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data untuk diekspor' }, { status: 404 });
    }

    const surveyIds = surveys.map(s => s.id);
    const answers: any[] = await query(
      `SELECT sa.survey_id, sa.answer_value, q.question_text 
       FROM survey_answers sa
       JOIN questions q ON sa.question_id = q.id
       WHERE sa.survey_id IN (${surveyIds.map(() => '?').join(',')})
       ORDER BY q.order_num ASC`,
      surveyIds
    );

    const answerMap: Record<number, Record<string, string>> = {};
    answers.forEach(a => {
      if (!answerMap[a.survey_id]) answerMap[a.survey_id] = {};
      let valLabel = a.answer_value;
      if (a.answer_value === 'puas') valLabel = 'Puas';
      else if (a.answer_value === 'cukup_puas') valLabel = 'Cukup Puas';
      else if (a.answer_value === 'tidak_puas') valLabel = 'Tidak Puas';
      answerMap[a.survey_id][a.question_text] = valLabel;
    });

    const exportRows = surveys.map((s, idx) => {
      const row: Record<string, any> = {
        'No': idx + 1,
        'Tanggal': new Date(s.created_at).toLocaleString('id-ID'),
        'Nama Responden': s.respondent_name,
        'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-',
        'Umur': s.age ? `${s.age} Tahun` : '-',
        'Pekerjaan': s.job || '-',
        'Jenis Pelayanan': s.service_type === 'tera' ? 'Tera' : 'Tera Ulang',
      };

      const ans = answerMap[s.id] || {};
      Object.keys(ans).forEach(qText => {
        row[qText] = ans[qText];
      });

      row['Kritik'] = s.critique || '-';
      row['Saran'] = s.suggestion || '-';

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Survei');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Laporan_Survei_Disperindag_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
