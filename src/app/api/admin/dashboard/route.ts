import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(created_at) >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(created_at) <= ?';
      params.push(endDate);
    }

    // 1. Total Responden
    const [totalRows]: any = await query(
      `SELECT COUNT(*) as total FROM surveys ${dateFilter}`,
      params
    );
    const totalRespondents = totalRows?.total || 0;

    // 2. Jumlah survei per jenis layanan (Tera vs Tera Ulang)
    const [serviceRows]: any = await query(
      `SELECT 
        SUM(CASE WHEN service_type = 'tera' THEN 1 ELSE 0 END) as total_tera,
        SUM(CASE WHEN service_type = 'tera_ulang' THEN 1 ELSE 0 END) as total_tera_ulang
       FROM surveys ${dateFilter}`,
      params
    );

    // 3. Distribusi Kepuasan (Puas, Cukup Puas, Tidak Puas)
    let answerDateJoin = '';
    if (startDate && endDate) {
      answerDateJoin = 'JOIN surveys s ON sa.survey_id = s.id WHERE DATE(s.created_at) >= ? AND DATE(s.created_at) <= ?';
    } else if (startDate) {
      answerDateJoin = 'JOIN surveys s ON sa.survey_id = s.id WHERE DATE(s.created_at) >= ?';
    } else if (endDate) {
      answerDateJoin = 'JOIN surveys s ON sa.survey_id = s.id WHERE DATE(s.created_at) <= ?';
    }

    const satisfactionDist: any = await query(
      `SELECT 
        sa.answer_value,
        COUNT(sa.id) as count
       FROM survey_answers sa
       ${answerDateJoin}
       GROUP BY sa.answer_value`,
      params
    );

    let puas = 0;
    let cukupPuas = 0;
    let tidakPuas = 0;

    satisfactionDist.forEach((item: any) => {
      if (item.answer_value === 'puas') puas = Number(item.count);
      else if (item.answer_value === 'cukup_puas') cukupPuas = Number(item.count);
      else if (item.answer_value === 'tidak_puas') tidakPuas = Number(item.count);
    });

    const totalAnswers = puas + cukupPuas + tidakPuas;

    // 4. Perhitungan IKM (Rata-rata Konversi Indeks Nilai Kepuasan)
    // Formula: Total Skor didapat / Total Skor Maksimal * 100
    const [scoreRows]: any = await query(
      `SELECT SUM(sa.score) as total_score, COUNT(sa.id) as answer_count
       FROM survey_answers sa
       ${answerDateJoin}`,
      params
    );

    const totalScore = Number(scoreRows?.total_score || 0);
    const scoreCount = Number(scoreRows?.answer_count || 0);
    // Skala 1 - 3, bila dikonversi ke skala 100: ((rata_rata - 1) / 2) * 100 atau langsung persentase kepuasan:
    const avgScore = scoreCount > 0 ? (totalScore / scoreCount) : 0;
    const ikmIndex = scoreCount > 0 ? ((avgScore / 3) * 100).toFixed(1) : '0';

    return NextResponse.json({
      success: true,
      data: {
        totalRespondents,
        totalTera: Number(serviceRows?.total_tera || 0),
        totalTeraUlang: Number(serviceRows?.total_tera_ulang || 0),
        satisfaction: {
          puas,
          cukupPuas,
          tidakPuas,
          totalAnswers,
          puasPct: totalAnswers > 0 ? Math.round((puas / totalAnswers) * 100) : 0,
          cukupPuasPct: totalAnswers > 0 ? Math.round((cukupPuas / totalAnswers) * 100) : 0,
          tidakPuasPct: totalAnswers > 0 ? Math.round((tidakPuas / totalAnswers) * 100) : 0,
        },
        ikm: {
          score: avgScore.toFixed(2),
          indexPercent: ikmIndex,
          predicate: Number(ikmIndex) >= 80 ? 'Sangat Baik' : Number(ikmIndex) >= 60 ? 'Baik' : 'Perlu Evaluasi'
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
