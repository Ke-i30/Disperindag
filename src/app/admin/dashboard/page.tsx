'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Scale, 
  FileSpreadsheet, 
  Trash2, 
  LogOut, 
  Search, 
  QrCode, 
  HelpCircle, 
  RefreshCw, 
  X, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Download,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Check
} from 'lucide-react';
import QRCodeComponent from 'qrcode';

interface DashboardStats {
  totalRespondents: number;
  totalTera: number;
  totalTeraUlang: number;
  satisfaction: {
    puas: number;
    cukupPuas: number;
    tidakPuas: number;
    totalAnswers: number;
    puasPct: number;
    cukupPuasPct: number;
    tidakPuasPct: number;
  };
  ikm: {
    score: string;
    indexPercent: string;
    predicate: string;
  };
}

interface SurveyItem {
  id: number;
  respondent_name: string;
  gender: 'L' | 'P' | null;
  age: number | null;
  job: string | null;
  service_type: 'tera' | 'tera_ulang';
  critique: string | null;
  suggestion: string | null;
  avg_score: number;
  created_at: string;
  answers?: {
    id: number;
    question_id: number;
    question_text: string;
    answer_value: 'puas' | 'cukup_puas' | 'tidak_puas';
    score: number;
  }[];
}

interface QuestionItem {
  id: number;
  question_text: string;
  order_num: number;
  is_active: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Sidebar Expand / Collapse State (Persis tombol |← di pojok kiri bawah Aiven Gambar 2)
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Active Tab: 'overview' | 'surveys' | 'questions' | 'qrcode'
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'questions' | 'qrcode'>('overview');
  const [adminUser, setAdminUser] = useState<any>(null);

  // States: Dashboard Metrik
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filter Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // States: Tabel Survei
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [surveysLoading, setSurveysLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSurveyDetail, setSelectedSurveyDetail] = useState<SurveyItem | null>(null);

  // Modal Konfirmasi Hapus
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // States: Kelola Pertanyaan
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

  // QR Code URL state
  const [qrDataUrl, setQrDataUrl] = useState('');

  // 1. Cek Autentikasi Admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (!res.ok || !data.success) {
          router.push('/admin/kelola-loket-internal');
        } else {
          setAdminUser(data.admin);
        }
      } catch {
        router.push('/admin/kelola-loket-internal');
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Dashboard Metrics
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/dashboard?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 3. Fetch Surveys Data Table
  const fetchSurveys = async () => {
    setSurveysLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (serviceFilter) params.append('service_type', serviceFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await fetch(`/api/admin/surveys?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSurveys(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSurveysLoading(false);
    }
  };

  // 4. Fetch Questions List
  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await fetch('/api/admin/questions');
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Generate QR Code Loket
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const publicUrl = window.location.origin;
      QRCodeComponent.toDataURL(publicUrl, { width: 400, margin: 2 }, (err, url) => {
        if (!err && url) setQrDataUrl(url);
      });
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [startDate, endDate]);

  useEffect(() => {
    if (activeTab === 'surveys') {
      fetchSurveys();
    } else if (activeTab === 'questions') {
      fetchQuestions();
    }
  }, [activeTab, page, serviceFilter, startDate, endDate]);

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/kelola-loket-internal');
  };

  // Handle Delete Survey Item
  const confirmDeleteSurvey = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/surveys?id=${deleteTargetId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setDeleteTargetId(null);
        fetchSurveys();
        fetchDashboardStats();
      } else {
        alert(json.error || 'Gagal menghapus');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Question CRUD
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: newQuestionText.trim(),
          order_num: questions.length + 1,
          is_active: 1
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewQuestionText('');
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuestion = async (q: QuestionItem) => {
    try {
      await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Hapus butir pertanyaan ini?')) return;
    try {
      await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e6e8eb] flex font-sans selection:bg-[#4f52ff] selection:text-white">
      
      {/* ======================= SIDEBAR (PERSIS AIVEN GAMBAR 2: BISA DIPERLUAS & DIPERKECIL) ======================= */}
      <aside 
        className={`bg-[#0a0c0f] border-r border-[#1e232d] flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
          sidebarExpanded ? 'w-60' : 'w-16'
        }`}
      >
        {/* Top: Logo & Project Info */}
        <div>
          <div className="h-16 flex items-center px-4 border-b border-[#1b1f28] gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#161a22] border border-[#2a303e] flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-white" />
            </div>
            {sidebarExpanded && (
              <div className="overflow-hidden">
                <span className="font-display font-black text-xs text-white uppercase tracking-wider block truncate">
                  DISPERINDAG
                </span>
                <span className="text-[10px] text-[#6b7382] font-mono block truncate">
                  Panel Metrologi
                </span>
              </div>
            )}
          </div>

          {/* Project Label (Persis "PROJECT rizkipasarlama-7f9c" di gambar 2) */}
          {sidebarExpanded ? (
            <div className="px-4 py-3 border-b border-[#1b1f28]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#505766] block">
                AKUN AKTIF
              </span>
              <span className="text-xs font-mono font-bold text-[#c2c7d0] truncate block">
                {adminUser?.username || 'anlstudioteam@gmail.com'}
              </span>
            </div>
          ) : (
            <div className="py-2 border-b border-[#1b1f28]" />
          )}

          {/* Navigation Items (Persis Services, AI gateway, Settings dll di gambar 2) */}
          <nav className="p-2 space-y-1 font-sans text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#1a1f29] text-[#3dd68c] font-bold border-l-2 border-[#3dd68c]'
                  : 'text-[#8c94a3] hover:text-white hover:bg-[#12151b]'
              }`}
              title="Dashboard Statistik"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {sidebarExpanded && <span>Dashboard Statistik</span>}
            </button>

            <button
              onClick={() => setActiveTab('surveys')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'surveys'
                  ? 'bg-[#1a1f29] text-[#3dd68c] font-bold border-l-2 border-[#3dd68c]'
                  : 'text-[#8c94a3] hover:text-white hover:bg-[#12151b]'
              }`}
              title="Data Hasil Survei"
            >
              <Users className="w-4 h-4 shrink-0" />
              {sidebarExpanded && <span>Data Hasil Survei</span>}
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-[#1a1f29] text-[#3dd68c] font-bold border-l-2 border-[#3dd68c]'
                  : 'text-[#8c94a3] hover:text-white hover:bg-[#12151b]'
              }`}
              title="Pengaturan Kuesioner"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {sidebarExpanded && <span>Kuesioner Soal</span>}
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'qrcode'
                  ? 'bg-[#1a1f29] text-[#3dd68c] font-bold border-l-2 border-[#3dd68c]'
                  : 'text-[#8c94a3] hover:text-white hover:bg-[#12151b]'
              }`}
              title="QR Code Loket"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              {sidebarExpanded && <span>QR Code Loket</span>}
            </button>
          </nav>
        </div>

        {/* Bottom: Logout & Tombol Perluas/Perkecil Sidebar (Persis tombol |← di pojok kiri bawah Aiven) */}
        <div className="p-2 border-t border-[#1b1f28] space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-[#8c94a3] hover:text-[#e85368] hover:bg-[#1f1317] transition-colors cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarExpanded && <span>Keluar</span>}
          </button>

          {/* Tombol Collapse / Expand */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full flex items-center justify-center p-2 rounded-md text-[#555d6e] hover:text-white hover:bg-[#161a22] transition-colors cursor-pointer"
            title={sidebarExpanded ? "Kecilkan Sidebar" : "Perluas Sidebar"}
          >
            {sidebarExpanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* ======================= MAIN CONTENT WORKSPACE ======================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Breadcrumb Path (Persis "My Organization / rizkipasarlama / Create new service" di Aiven) */}
        <div className="h-16 border-b border-[#1e232d] flex items-center justify-between px-6 lg:px-8 bg-[#0b0d10]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#636c7c]">
            <span>Disperindag</span>
            <span>/</span>
            <span className="text-[#a4abb8]">Metrologi Legal</span>
            <span>/</span>
            <span className="text-white font-bold">
              {activeTab === 'overview' && 'Dashboard Analitik'}
              {activeTab === 'surveys' && 'Rekap Responden'}
              {activeTab === 'questions' && 'Kuesioner SKM'}
              {activeTab === 'qrcode' && 'Cetak QR Loket'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <main className="p-6 lg:p-8 flex-1 space-y-8">
          
          {/* ===================== TAB 1: OVERVIEW DASHBOARD ===================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Header Title & Date Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight font-display uppercase">
                    Ikhtisar Mutu Pelayanan
                  </h1>
                  <p className="text-xs text-[#717885] mt-0.5">
                    Metrik evaluasi Indeks Kepuasan Masyarakat (IKM) layanan Tera & Tera Ulang.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/admin/export?${new URLSearchParams({
                      ...(startDate && { startDate }),
                      ...(endDate && { endDate })
                    }).toString()}`}
                    className="px-3.5 py-2 bg-white hover:bg-[#e6e8ec] text-black font-mono font-bold text-xs uppercase transition-colors inline-flex items-center gap-1.5"
                    target="_blank"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Ekspor Excel</span>
                  </a>
                  <button
                    onClick={fetchDashboardStats}
                    className="p-2 border border-[#272d39] rounded-md text-[#8c94a3] hover:text-white hover:bg-[#14171e] cursor-pointer"
                    title="Segarkan Data"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Cards Grid (Persis Bento Grid Aiven Gambar 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Responden */}
                <div className="bg-[#12151b] border border-[#212630] rounded-xl p-5 space-y-3 hover:border-[#353c4c] transition-colors">
                  <div className="flex items-center justify-between text-xs text-[#636c7c] font-mono uppercase">
                    <span>Total Responden</span>
                    <Users className="w-4 h-4 text-[#8c94a3]" />
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-white">
                    {statsLoading ? '...' : stats?.totalRespondents || 0}
                  </div>
                  <p className="text-[11px] text-[#636c7c]">Responden terverifikasi</p>
                </div>

                {/* Tera Baru */}
                <div className="bg-[#12151b] border border-[#212630] rounded-xl p-5 space-y-3 hover:border-[#353c4c] transition-colors">
                  <div className="flex items-center justify-between text-xs text-[#636c7c] font-mono uppercase">
                    <span>Pelayanan Tera</span>
                    <Scale className="w-4 h-4 text-[#8c94a3]" />
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-white">
                    {statsLoading ? '...' : stats?.totalTera || 0}
                  </div>
                  <p className="text-[11px] text-[#636c7c]">Alat UTTP baru / impor</p>
                </div>

                {/* Tera Ulang */}
                <div className="bg-[#12151b] border border-[#212630] rounded-xl p-5 space-y-3 hover:border-[#353c4c] transition-colors">
                  <div className="flex items-center justify-between text-xs text-[#636c7c] font-mono uppercase">
                    <span>Tera Ulang</span>
                    <Activity className="w-4 h-4 text-[#8c94a3]" />
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-white">
                    {statsLoading ? '...' : stats?.totalTeraUlang || 0}
                  </div>
                  <p className="text-[11px] text-[#636c7c]">Pengujian periodik tahunan</p>
                </div>

                {/* Nilai IKM */}
                <div className="bg-[#131720] border border-[#273544] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#3dd68c] font-mono uppercase">
                    <span>Indeks IKM</span>
                    <TrendingUp className="w-4 h-4 text-[#3dd68c]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold text-white">
                      {statsLoading ? '...' : stats?.ikm.indexPercent}%
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#16291f] text-[#3dd68c] border border-[#254634]">
                      {stats?.ikm.predicate}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#636c7c]">Skor rata-rata: {stats?.ikm.score} / 3.0</p>
                </div>

              </div>

              {/* Distribusi Tingkat Kepuasan (Horizontal Bars Minimalis) */}
              <div className="bg-[#12151b] border border-[#212630] rounded-xl p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-white text-sm">Distribusi Penilaian Responden</h3>
                  <p className="text-xs text-[#636c7c] mt-0.5">Persentase akumulasi jawaban seluruh butir kuesioner</p>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  {/* Puas */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#3dd68c] font-bold">Puas</span>
                      <span className="text-[#8c94a3]">
                        {stats?.satisfaction.puas || 0} suara ({stats?.satisfaction.puasPct || 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1b2029] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3dd68c] rounded-full transition-all duration-500" style={{ width: `${stats?.satisfaction.puasPct || 0}%` }} />
                    </div>
                  </div>

                  {/* Cukup Puas */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#e0a842] font-bold">Cukup Puas</span>
                      <span className="text-[#8c94a3]">
                        {stats?.satisfaction.cukupPuas || 0} suara ({stats?.satisfaction.cukupPuasPct || 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1b2029] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e0a842] rounded-full transition-all duration-500" style={{ width: `${stats?.satisfaction.cukupPuasPct || 0}%` }} />
                    </div>
                  </div>

                  {/* Tidak Puas */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#e85368] font-bold">Tidak Puas</span>
                      <span className="text-[#8c94a3]">
                        {stats?.satisfaction.tidakPuas || 0} suara ({stats?.satisfaction.tidakPuasPct || 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1b2029] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e85368] rounded-full transition-all duration-500" style={{ width: `${stats?.satisfaction.tidakPuasPct || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================== TAB 2: DATA HASIL SURVEI ===================== */}
          {activeTab === 'surveys' && (
            <div className="space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-[#555d6e] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchSurveys()}
                      placeholder="Cari nama, pekerjaan, kritik/saran..."
                      className="w-full pl-9 pr-3 py-2 border border-[#212630] bg-[#12151b] rounded-md text-xs outline-none focus:border-[#3dd68c] text-white"
                    />
                  </div>
                  <button
                    onClick={() => { setPage(1); fetchSurveys(); }}
                    className="px-3.5 py-2 bg-[#212630] hover:bg-[#2c3442] text-white text-xs font-mono font-bold rounded-md cursor-pointer"
                  >
                    Cari
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={serviceFilter}
                    onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-[#212630] bg-[#12151b] rounded-md text-xs font-mono text-[#c2c7d0] outline-none"
                  >
                    <option value="">Semua Layanan</option>
                    <option value="tera">Tera</option>
                    <option value="tera_ulang">Tera Ulang</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#12151b] border border-[#212630] rounded-xl overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0e1116] text-[10px] text-[#636c7c] uppercase tracking-wider border-b border-[#212630]">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Responden</th>
                      <th className="px-4 py-3">Layanan</th>
                      <th className="px-4 py-3">Skor Rerata</th>
                      <th className="px-4 py-3">Kritik & Saran</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1f28] text-xs">
                    {surveysLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#555d6e]">
                          Memuat data survei...
                        </td>
                      </tr>
                    ) : surveys.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#555d6e]">
                          Tidak ada data survei ditemukan.
                        </td>
                      </tr>
                    ) : (
                      surveys.map((item) => (
                        <tr key={item.id} className="hover:bg-[#161a22] transition-colors">
                          <td className="px-4 py-3 text-[#787f8d] whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-white font-bold">
                            {item.respondent_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              item.service_type === 'tera' ? 'bg-[#16291f] text-[#3dd68c]' : 'bg-[#292419] text-[#e0a842]'
                            }`}>
                              {item.service_type === 'tera' ? 'Tera' : 'Tera Ulang'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                            {item.avg_score ? Number(item.avg_score).toFixed(1) : '-'} / 3.0
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate text-[#8c94a3]">
                            {item.critique || item.suggestion || '-'}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedSurveyDetail(item)}
                                className="px-2 py-1 bg-[#1a202c] hover:bg-[#252f42] text-[#8c94a3] hover:text-white rounded text-[10px] uppercase font-bold cursor-pointer"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(item.id)}
                                className="p-1 text-[#e85368] hover:bg-[#2e171c] rounded cursor-pointer"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="p-3 border-t border-[#1b1f28] flex items-center justify-between text-[11px] text-[#636c7c]">
                  <span>Halaman {page} dari {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="p-1 border border-[#212630] rounded hover:bg-[#1a1f29] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="p-1 border border-[#212630] rounded hover:bg-[#1a1f29] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================== TAB 3: PENGATURAN KUESIONER ===================== */}
          {activeTab === 'questions' && (
            <div className="space-y-6 max-w-4xl font-sans">
              
              <div className="bg-[#12151b] border border-[#212630] rounded-xl p-6 space-y-3">
                <h3 className="font-bold text-white text-sm">Tambah Butir Pertanyaan Baru</h3>
                <form onSubmit={handleAddQuestion} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Tulis butir pertanyaan evaluasi..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-md border border-[#262c37] bg-[#0d0f12] text-xs text-white outline-none focus:border-[#3dd68c]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white hover:bg-[#e6e8ec] text-black font-mono font-bold text-xs uppercase cursor-pointer"
                  >
                    Tambah
                  </button>
                </form>
              </div>

              <div className="bg-[#12151b] border border-[#212630] rounded-xl divide-y divide-[#1b1f28]">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex-1">
                      {editingQuestion?.id === q.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingQuestion.question_text}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                            className="flex-1 px-3 py-1.5 border border-[#272d39] bg-[#0d0f12] text-white text-xs rounded"
                          />
                          <button
                            onClick={() => handleUpdateQuestion(editingQuestion)}
                            className="px-3 py-1 bg-[#3dd68c] text-black font-bold text-[11px] rounded"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingQuestion(null)}
                            className="px-2 py-1 border border-[#272d39] text-[#8c94a3] text-[11px] rounded"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <p className="text-[#e6e8eb]">
                          <span className="font-mono text-[#3dd68c] mr-2">{idx + 1}.</span>
                          {q.question_text}
                        </p>
                      )}
                    </div>

                    {editingQuestion?.id !== q.id && (
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="text-[#8c94a3] hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-[#e85368]"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================== TAB 4: QR CODE LOKET ===================== */}
          {activeTab === 'qrcode' && (
            <div className="max-w-md mx-auto bg-[#12151b] border border-[#212630] rounded-xl p-8 text-center space-y-6 font-sans">
              <div>
                <h3 className="text-base font-bold text-white">QR Code Loket Pelayanan</h3>
                <p className="text-xs text-[#717885] mt-1">
                  Pajang gambar QR ini di loket agar responden dapat langsung scan melalui kamera smartphone.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg inline-block shadow-lg">
                {qrDataUrl && <img src={qrDataUrl} alt="QR Code Loket" className="w-56 h-56 mx-auto" />}
              </div>

              <div>
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download="QR_Code_Loket_Disperindag.png"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#e6e8ec] text-black font-mono font-bold text-xs uppercase cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar QR</span>
                  </a>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL DETAIL SURVEI */}
      {selectedSurveyDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12151b] border border-[#212630] rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1f28]">
              <h3 className="font-bold text-white text-sm">{selectedSurveyDetail.respondent_name}</h3>
              <button onClick={() => setSelectedSurveyDetail(null)} className="text-[#8c94a3] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#8c94a3] uppercase font-mono text-[10px]">Jawaban Responden:</span>
              {selectedSurveyDetail.answers?.map((ans, idx) => (
                <div key={ans.id} className="p-2.5 bg-[#0d0f12] border border-[#1b1f28] rounded flex items-center justify-between gap-2">
                  <span className="text-[#c2c7d0]">{idx + 1}. {ans.question_text}</span>
                  <span className={`font-mono font-bold uppercase text-[10px] shrink-0 ${
                    ans.answer_value === 'puas' ? 'text-[#3dd68c]' : ans.answer_value === 'cukup_puas' ? 'text-[#e0a842]' : 'text-[#e85368]'
                  }`}>
                    {ans.answer_value === 'puas' ? 'Puas' : ans.answer_value === 'cukup_puas' ? 'Cukup Puas' : 'Tidak Puas'}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#1b1f28]">
              <p><strong className="text-white">Kritik:</strong> {selectedSurveyDetail.critique || '-'}</p>
              <p><strong className="text-white">Saran:</strong> {selectedSurveyDetail.suggestion || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12151b] border border-[#212630] rounded-xl max-w-sm w-full p-6 text-center space-y-4 font-sans text-xs">
            <h3 className="font-bold text-white text-sm">Hapus Data Survei?</h3>
            <p className="text-[#8c94a3]">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => setDeleteTargetId(null)} className="py-2 border border-[#272d39] rounded text-white font-mono cursor-pointer">
                Batal
              </button>
              <button disabled={deleteLoading} onClick={confirmDeleteSurvey} className="py-2 bg-[#e85368] hover:bg-[#c93b50] rounded text-white font-mono font-bold cursor-pointer">
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
