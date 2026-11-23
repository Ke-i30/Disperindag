'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  useScroll, 
  AnimatePresence 
} from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Scale, 
  Check,
  Clock3,
  BarChart3,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  question_text: string;
  order_num: number;
}

// Data Section untuk Scroll-Spy Navigasi Kanan (Persis video PhotoCraft: HIGHLIGHTS, GET IT, THE FAMILY)
const SECTIONS = [
  { id: 'hero', index: '01', title: 'PELAYANAN' },
  { id: 'prosedur', index: '02', title: 'ALUR KERJA' },
  { id: 'layanan', index: '03', title: 'JENIS TERA' },
  { id: 'faq', index: '04', title: 'STANDAR UKUR' },
  { id: 'survei-cta', index: '05', title: 'MULAI SURVEI' },
];

// Mitra institusi dengan tipografi monokrom bersih persis Aiven
const PARTNERS = [
  { name: 'KEMENDAG RI', label: 'KEMENTERIAN PERDAGANGAN' },
  { name: 'DIREKTORAT METROLOGI', label: 'STANDAR TEKNIS NASIONAL' },
  { name: 'PERTAMINA', label: 'UJI TERA NOZZLE SPBU' },
  { name: 'PLN', label: 'METER ENERGI KWH' },
  { name: 'BSN', label: 'KOMITE AKREDITASI NASIONAL' },
  { name: 'BULOG', label: 'JEMBATAN TIMBANG KOMODITAS' },
  { name: 'PERUMDA AIR MINUM', label: 'METER AIR BERSIH' },
  { name: 'ASPARINDO', label: 'PENGELOLA PASAR RAKYAT' }
];

// Data Alur Pengurusan Tera (Modular Grid Style)
const PROCEDURES = [
  {
    step: '01',
    category: 'PENDAFTARAN',
    title: 'Loket Pelayanan',
    desc: 'Penyerahan alat ukur di kantor dinas atau pengajuan surat tera tempat bagi alat berat seperti nozzle SPBU dan jembatan timbang.'
  },
  {
    step: '02',
    category: 'PEMERIKSAAN',
    title: 'Uji Teknis BKD',
    desc: 'Pengujian ketelitian oleh pegawai berhak menggunakan standar massa bersertifikat untuk memastikan batas kesalahan yang diizinkan.'
  },
  {
    step: '03',
    category: 'LEGALITAS',
    title: 'Cap Tanda Tera & SKHP',
    desc: 'Pemasangan kawat segel timah bertanda tera sah tahun 2026 dan penerbitan Surat Keterangan Hasil Pengujian resmi.'
  },
  {
    step: '04',
    category: 'EVALUASI',
    title: 'Survei Kepuasan',
    desc: 'Warga memberikan evaluasi langsung mengenai kejelasan biaya retribusi, kecepatan proses, dan keramahan petugas.'
  }
];

// Data Tanya Jawab Pelayanan Resmi (Split Screen Komparasi)
const FAQS = [
  {
    id: 'jadwal',
    q: 'Kapan timbangan pedagang atau pelaku usaha harus ditera ulang?',
    desc: 'Berdasarkan Undang-Undang Metrologi Legal, setiap alat ukur, takar, timbang, dan perlengkapannya yang digunakan untuk transaksi perniagaan wajib dilakukan pengujian ulang setiap satu tahun sekali guna menjamin kebenaran pengukuran.',
    leftTitle: 'Sebelum Ditera Ulang',
    leftSubtitle: 'Kondisi alat berisiko selisih',
    leftRows: [
      { k: 'Kondisi Segel', v: 'Kawat segel aus atau kedaluwarsa' },
      { k: 'Akurasi Ukur', v: 'Rentan bergeser melewati batas BKD' },
      { k: 'Status Legal', v: 'Masa berlaku tanda tera telah habis' },
      { k: 'Konsekuensi', v: 'Pelanggaran UU No. 2 Tahun 1981' }
    ],
    rightTitle: 'Setelah Ditera Ulang',
    rightSubtitle: 'Lolos uji standar peneraan',
    rightRows: [
      { k: 'Kondisi Segel', v: 'Cap Tanda Tera Sah Tahun 2026' },
      { k: 'Akurasi Ukur', v: 'Terkalibrasi anak timbangan standar' },
      { k: 'Status Legal', v: 'SKHP resmi diterbitkan dinas' },
      { k: 'Konsekuensi', v: 'Transaksi sah, adil, dan berkah' }
    ]
  },
  {
    id: 'lokasi',
    q: 'Apakah pengujian bisa dilakukan langsung di tempat usaha?',
    desc: 'Bisa. Untuk timbangan atau alat ukur yang terpasang tetap dan sulit dipindahkan, dinas menyediakan pelayanan tera di tempat dengan menerjunkan tim teknis serta kendaraan operasional bermassa standar langsung ke lokasi.',
    leftTitle: 'Alat Ukur Tertanam',
    leftSubtitle: 'Karakteristik objek uji berat',
    leftRows: [
      { k: 'Contoh Objek', v: 'Nozzle SPBU, Jembatan Timbang Truk' },
      { k: 'Kapasitas', v: 'Kapasitas besar (hingga 60 ton)' },
      { k: 'Kendala', v: 'Tidak dapat dibawa ke kantor dinas' },
      { k: 'Kebutuhan', v: 'Perlu pengujian statis di lokasi' }
    ],
    rightTitle: 'Layanan Tera di Tempat',
    rightSubtitle: 'Solusi teknis lapangan',
    rightRows: [
      { k: 'Mekanisme', v: 'Pengajuan surat permohonan tertulis' },
      { k: 'Dukungan', v: 'Mobil uji unit metrologi legal' },
      { k: 'Pelaksanaan', v: 'Jadwal disepakati bersama pemohon' },
      { k: 'Hasil Akhir', v: 'Pengujian tuntas di tempat usaha' }
    ]
  },
  {
    id: 'evaluasi',
    q: 'Untuk apa hasil survei kepuasan masyarakat ini digunakan?',
    desc: 'Seluruh masukan dan penilaian yang masuk diolah menjadi Indeks Kepuasan Masyarakat (IKM) berkala untuk mengukur mutu pelayanan loket, kejelasan retribusi daerah, dan memastikan pelayanan bebas dari pungutan liar.',
    leftTitle: 'Tanpa Evaluasi Terbuka',
    leftSubtitle: 'Pelayanan tertutup sepihak',
    leftRows: [
      { k: 'Tolak Ukur Mutu', v: 'Tidak ada data kepuasan warga' },
      { k: 'Waktu Layanan', v: 'Durasi proses tidak terpantau' },
      { k: 'Biaya Retribusi', v: 'Rawan dimanfaatkan pihak ketiga' },
      { k: 'Tindak Lanjut', v: 'Keluhan warga sulit terakomodasi' }
    ],
    rightTitle: 'Dengan Evaluasi Berkala',
    rightSubtitle: 'Pengawasan publik transparan',
    rightRows: [
      { k: 'Tolak Ukur Mutu', v: 'Nilai IKM dilaporkan secara berkala' },
      { k: 'Waktu Layanan', v: 'Target penyelesaian terpantau jelas' },
      { k: 'Biaya Retribusi', v: 'Sesuai tarif resmi kas daerah' },
      { k: 'Tindak Lanjut', v: 'Masukan jadi bahan evaluasi pimpinan' }
    ]
  }
];

export default function HomePage() {
  const [stage, setStage] = useState<'landing' | 'survey' | 'success'>('landing');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<number>(0);

  // Scroll Percentage & Active Section State (PhotoCraft Style)
  const [scrollPercent, setScrollPercent] = useState('000%');
  const [activeSection, setActiveSection] = useState('hero');

  // Terminal Tab State
  const [activeCodeTab, setActiveCodeTab] = useState<'status' | 'retribusi' | 'regulasi'>('status');

  // Form states
  const [respondentName, setRespondentName] = useState('');
  const [gender, setGender] = useState<'L' | 'P' | ''>('');
  const [age, setAge] = useState('');
  const [job, setJob] = useState('');
  const [serviceType, setServiceType] = useState<'tera' | 'tera_ulang' | ''>('');
  const [answers, setAnswers] = useState<Record<number, 'puas' | 'cukup_puas' | 'tidak_puas'>>({});
  const [critique, setCritique] = useState('');
  const [suggestion, setSuggestion] = useState('');

  // Scroll spy tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      const pct = totalHeight > 0 ? Math.round((current / totalHeight) * 100) : 0;
      setScrollPercent(pct.toString().padStart(3, '0') + '%');

      // Detect active section
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4) {
            setActiveSection(s.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      setLoadingQuestions(true);
      try {
        const res = await fetch('/api/questions');
        const json = await res.json();
        if (json.success && json.data) {
          setQuestions(json.data);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleStartSurvey = () => {
    setStage('survey');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerSelect = (questionId: number, value: 'puas' | 'cukup_puas' | 'tidak_puas') => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!respondentName.trim()) {
      setErrorMessage('Nama responden wajib diisi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!serviceType) {
      setErrorMessage('Pilih salah satu pelayanan yang digunakan (Tera atau Tera Ulang).');
      return;
    }

    for (const q of questions) {
      if (!answers[q.id]) {
        setErrorMessage(`Pertanyaan nomor ${q.order_num} belum dijawab.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payloadAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: Number(qId),
        answer_value: val
      }));

      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent_name: respondentName,
          gender: gender || null,
          age: age ? Number(age) : null,
          job: job || null,
          service_type: serviceType,
          answers: payloadAnswers,
          critique,
          suggestion
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Terjadi gangguan saat menyimpan survei');
      }

      setStage('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim survei');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRespondentName('');
    setGender('');
    setAge('');
    setJob('');
    setServiceType('');
    setAnswers({});
    setCritique('');
    setSuggestion('');
    setStage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-[#e6e8eb] flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* 1. TOP NAVBAR (Industrial Swiss Monokrom Style) */}
      <header className="sticky top-0 z-50 bg-[#090b0e]/95 backdrop-blur-md border-b border-[#1b1f28]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-none bg-white text-black flex items-center justify-center font-mono font-black text-xs">
              <Scale className="w-4 h-4 text-black" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-extrabold tracking-wider text-white uppercase">
                DISPERINDAG
              </span>
              <span className="text-[#3b4250]">/</span>
              <span className="text-[#8c94a3] text-[11px] hidden sm:inline uppercase">
                METROLOGI LEGAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8 text-[11px] font-mono uppercase tracking-wider text-[#7e8796]">
              <a href="#hero" className="hover:text-white transition-colors">01 / Latar</a>
              <a href="#prosedur" className="hover:text-white transition-colors">02 / Alur</a>
              <a href="#layanan" className="hover:text-white transition-colors">03 / Layanan</a>
              <a href="#faq" className="hover:text-white transition-colors">04 / Standar</a>
            </nav>
          </div>
        </div>
      </header>

      {/* 2. LANDING PAGE DENGAN RIGHT SCROLL-SPY DOCK */}
      {stage === 'landing' && (
        <div className="flex-1 flex flex-col relative">
          
          {/* RIGHT FIXED SCROLL-SPY DOCK PERSIS SCREEN RECORDING: ULTRA CLEAN & NON-INTRUSIVE */}
          <aside className="hidden lg:block fixed right-0 top-0 bottom-0 w-36 z-40 group pointer-events-auto select-none">
            
            {/* Penggaris Minimalis Monokrom di Tepi Kanan */}
            <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col justify-between py-6 border-l border-[#1a1f28]/30">
              {[0, 10, 25, 40, 50, 65, 75, 90, 100].map((val) => (
                <div key={val} className="relative flex items-center justify-end pr-1 h-0">
                  <div className="absolute right-0 w-1.5 h-[1px] bg-[#222834]" />
                  <span className="font-mono text-[7px] text-[#38404d] font-medium pr-1">
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Garis Horizontal Putih Indikator Kursor Scroll (Diposisikan di tepi ruler) */}
            <div 
              className="absolute right-0 w-6 h-[1.5px] bg-white transition-all duration-100 ease-out z-20 shadow-[0_0_4px_rgba(255,255,255,0.7)] pointer-events-none"
              style={{
                top: `${parseInt(scrollPercent, 10)}%`
              }}
            />

            {/* Angka Persen Minimalis (Diposisikan di SEBELAH KIRI garis putih, sehingga TIDAK PERNAH TERTUTUP) */}
            <div 
              className="absolute right-7 font-mono text-[9px] font-bold text-[#626b7d] tracking-wider transition-all duration-100 ease-out pointer-events-none pr-1 select-none"
              style={{
                top: `calc(${parseInt(scrollPercent, 10)}% - 6px)`
              }}
            >
              {scrollPercent}
            </div>

            {/* Area Teks Menu:
                - Default (tanpa mouse): HILANG TOTAL (opacity-0 / transparan). Konten website 100% bersih tanpa gangguan satu teks pun!
                - Saat mouse diarahkan ke tepi kanan (hover): Teks judul bagian baru muncul lembut dan elegan dengan font tipis/subtle.
            */}
            <div className="h-full flex flex-col justify-between py-16 pr-8 text-right pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
              
              {/* Header Atas Muted */}
              <div className="font-display font-bold text-[10px] text-[#4d5565] uppercase tracking-wider">
                DISPERINDAG
              </div>

              {/* Teks Navigasi Bersih & Halus */}
              <div className="space-y-10">
                {SECTIONS.slice(0, 4).map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a 
                      key={sec.id} 
                      href={`#${sec.id}`}
                      className="block transition-all duration-200 cursor-pointer"
                    >
                      <span 
                        className={`block font-display font-bold uppercase transition-all duration-200 ${
                          isActive 
                            ? 'text-[#e6e8eb] text-sm tracking-wide font-black' 
                            : 'text-[#4d5565] text-xs tracking-normal hover:text-[#8c94a3]'
                        }`}
                      >
                        {sec.title}
                      </span>
                    </a>
                  );
                })}
              </div>

              <div className="h-4" />

            </div>

          </aside>

          {/* SECTION 1: HERO (Index 01 / Technical Swiss Grid) */}
          <section id="hero" className="border-b border-[#1b1f28] relative">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              
              {/* Section Header Indicator */}
              <div className="flex items-center justify-between pb-6 border-b border-[#1b1f28] mb-12 font-mono text-[11px] text-[#636c7c]">
                <span>01 / PELAYANAN TERA</span>
                <span>METROLOGI LEGAL INDONESIA</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Column: Bold Minimalist Headline */}
                <div className="lg:col-span-7 space-y-6">
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] uppercase">
                    TIMBANGAN TEPAT,{' '}
                    <span className="bg-[#5856d6] text-white px-2.5 py-0.5 inline-block">
                      USAHA BERKAH.
                    </span>
                    <br />
                    SUARA ANDA MENENTUKAN.
                  </h1>

                  <p className="text-sm sm:text-base text-[#8c94a3] max-w-xl font-normal leading-relaxed">
                    Evaluasi resmi pelaksanaan tera dan tera ulang alat ukur, takar, dan timbang (UTTP) pada Dinas Perdagangan dan Perindustrian demi kepastian takaran bagi seluruh masyarakat.
                  </p>

                  {/* Metrik Nilai Cepat (PhotoCraft Grid Style) */}
                  <div className="grid grid-cols-3 border border-[#1b1f28] font-mono divide-x divide-[#1b1f28] max-w-lg">
                    <div className="p-3">
                      <div className="text-lg font-bold text-white">± 2 Menit</div>
                      <div className="text-[10px] text-[#636c7c] uppercase">Waktu Pengisian</div>
                    </div>
                    <div className="p-3">
                      <div className="text-lg font-bold text-white">Bebas NIK</div>
                      <div className="text-[10px] text-[#636c7c] uppercase">Jaminan Privasi</div>
                    </div>
                    <div className="p-3">
                      <div className="text-lg font-bold text-[#3dd68c]">100% Sah</div>
                      <div className="text-[10px] text-[#636c7c] uppercase">Segel Resmi 2026</div>
                    </div>
                  </div>

                  {/* Actions (PhotoCraft White Solid Contrast Button) */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartSurvey}
                      className="px-7 py-3.5 bg-white hover:bg-[#e6e8ec] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Mulai Isi Survei</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </button>
                    <a
                      href="#prosedur"
                      className="px-5 py-3.5 border border-[#272d3b] hover:border-white text-[#c2c7d0] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
                    >
                      Lihat Alur Kerja
                    </a>
                  </div>
                </div>

                {/* Right Column: Console/Code Box */}
                <div className="lg:col-span-5">
                  <div className="bg-[#10131a] border border-[#1f242e] font-mono text-xs overflow-hidden shadow-2xl">
                    {/* Console Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b0e14] border-b border-[#1b1f28]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                        <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                        <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                        <span className="text-[10px] text-[#636c7c] ml-2">metrologi.sh</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveCodeTab('status')}
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                            activeCodeTab === 'status' ? 'bg-[#222836] text-white' : 'text-[#636c7c] hover:text-white'
                          }`}
                        >
                          Uji
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('retribusi')}
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                            activeCodeTab === 'retribusi' ? 'bg-[#222836] text-white' : 'text-[#636c7c] hover:text-white'
                          }`}
                        >
                          Biaya
                        </button>
                        <button
                          onClick={() => setActiveCodeTab('regulasi')}
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                            activeCodeTab === 'regulasi' ? 'bg-[#222836] text-white' : 'text-[#636c7c] hover:text-white'
                          }`}
                        >
                          Hukum
                        </button>
                      </div>
                    </div>

                    {/* Console Body */}
                    <div className="p-4 text-[#8c94a3] min-h-[200px] leading-relaxed">
                      {activeCodeTab === 'status' && (
                        <div className="space-y-1">
                          <p className="text-[#555d6d]"># Standar Ketelitian Metrologi Legal</p>
                          <p><span className="text-[#3dd68c]">uji-timbangan</span> --standar-massa \</p>
                          <p className="pl-4">--cek-batas-kesalahan-bkd</p>
                          <p className="pt-2 text-white">&#123;</p>
                          <p className="pl-4 text-[#3dd68c]">&quot;akurasi&quot;: &quot;Presisi (Sesuai Syarat Teknis)&quot;,</p>
                          <p className="pl-4 text-white">&quot;segel_timah&quot;: &quot;Cap Tanda Tera Sah 2026&quot;,</p>
                          <p className="pl-4 text-[#5856d6]">&quot;sertifikat&quot;: &quot;SKHP Resmi Diterbitkan&quot;</p>
                          <p className="text-white">&#125;</p>
                        </div>
                      )}

                      {activeCodeTab === 'retribusi' && (
                        <div className="space-y-1">
                          <p className="text-[#555d6d]"># Transparansi Retribusi Resmi Daerah</p>
                          <p className="text-white">&#123;</p>
                          <p className="pl-4">&quot;penyetoran&quot;: &quot;Kas Daerah (Bukti Tanda Setor)&quot;,</p>
                          <p className="pl-4 text-[#e0a842]">&quot;biaya_tambahan&quot;: &quot;Rp 0 (Bebas Calo & Pungli)&quot;,</p>
                          <p className="pl-4 text-[#3dd68c]">&quot;kuitansi_sah&quot;: &quot;Diberikan kepada Pemohon&quot;</p>
                          <p className="text-white">&#125;</p>
                        </div>
                      )}

                      {activeCodeTab === 'regulasi' && (
                        <div className="space-y-1.5 text-xs text-[#a2aab8]">
                          <p className="text-[#3dd68c] font-bold">DASAR REGULASI:</p>
                          <p>1. UU No. 2 Tahun 1981 tentang Metrologi Legal</p>
                          <p>2. UU No. 8 Tahun 1999 tentang Perlindungan Konsumen</p>
                          <p>3. Permenpan-RB No. 14 Tahun 2017 tentang SKM</p>
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 bg-[#0b0e14] border-t border-[#1b1f28] flex items-center justify-between text-[10px] text-[#636c7c]">
                      <span className="text-[#3dd68c]">● Loket Aktif</span>
                      <span>Disperindag Metrologi</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* SECTION MITRA MARQUEE */}
          <section className="py-7 bg-[#07090c] border-b border-[#1b1f28] overflow-hidden">
            <div className="relative w-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07090c] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07090c] to-transparent z-10 pointer-events-none" />

              <div className="animate-marquee flex items-center gap-16">
                {PARTNERS.map((partner, idx) => (
                  <div key={`p1-${idx}`} className="flex items-center gap-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="font-extrabold text-sm tracking-wider text-[#d0d4dc] font-sans">
                      {partner.name}
                    </span>
                    <span className="text-[10px] text-[#555c6b] font-mono tracking-tight hidden sm:inline">
                      ({partner.label})
                    </span>
                  </div>
                ))}
                {PARTNERS.map((partner, idx) => (
                  <div key={`p2-${idx}`} className="flex items-center gap-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                    <span className="font-extrabold text-sm tracking-wider text-[#d0d4dc] font-sans">
                      {partner.name}
                    </span>
                    <span className="text-[10px] text-[#555c6b] font-mono tracking-tight hidden sm:inline">
                      ({partner.label})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 2: ALUR KERJA (Index 02 / PhotoCraft Modular Grid) */}
          <section id="prosedur" className="py-20 border-b border-[#1b1f28] bg-[#090b0e]">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#1b1f28] font-mono text-[11px] text-[#636c7c]">
                <span>02 / ALUR KERJA PELAYANAN</span>
                <span>STANDAR PROSEDUR LOKET</span>
              </div>

              {/* 4 Columns Grid Matrix (Persis layout macOS, Windows, Linux di PhotoCraft) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#1b1f28] divide-y sm:divide-y-0 sm:divide-x divide-[#1b1f28]">
                {PROCEDURES.map((p) => (
                  <div key={p.step} className="p-6 bg-[#0c0f14] hover:bg-[#10141b] transition-colors space-y-4">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#636c7c]">{p.category}</span>
                      <span className="font-bold text-[#3dd68c]">{p.step}</span>
                    </div>

                    <h3 className="font-bold text-white text-base tracking-tight font-sans">
                      {p.title}
                    </h3>

                    <p className="text-xs text-[#8c94a3] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* SECTION 3: TIGA FOKUS PELAYANAN (Index 03 / Bento Grid) */}
          <section id="layanan" className="py-20 border-b border-[#1b1f28] bg-[#07090c]">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#1b1f28] font-mono text-[11px] text-[#636c7c]">
                <span>03 / CAKUPAN PENGUJIAN</span>
                <span>METROLOGI TERAPAN</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0c0f14] border border-[#1b1f28] p-7 flex flex-col justify-between hover:border-[#2d3546] transition-colors">
                  <div className="space-y-4">
                    <div className="w-8 h-8 bg-[#141720] border border-[#202534] flex items-center justify-center font-mono text-xs font-bold text-white">
                      01
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Pelayanan Tera Baru
                    </h3>
                    <p className="text-xs text-[#8c94a3] leading-relaxed">
                      Wajib bagi alat ukur, timbang, atau takar yang baru dibeli dari pabrik, hasil perakitan baru, atau diimpor sebelum boleh digunakan dalam transaksi jual-beli.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#1b1f28] flex items-center justify-between text-xs font-mono text-[#3dd68c]">
                    <span>Alat Baru & Impor</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-[#0c0f14] border border-[#1b1f28] p-7 flex flex-col justify-between hover:border-[#2d3546] transition-colors">
                  <div className="space-y-4">
                    <div className="w-8 h-8 bg-[#141720] border border-[#202534] flex items-center justify-center font-mono text-xs font-bold text-white">
                      02
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Pelayanan Tera Ulang
                    </h3>
                    <p className="text-xs text-[#8c94a3] leading-relaxed">
                      Pengujian berkala setiap tahun untuk timbangan pasar, meteran SPBU, dan jembatan timbang agar keausan akibat pemakaian tidak merugikan masyarakat.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#1b1f28] flex items-center justify-between text-xs font-mono text-[#3dd68c]">
                    <span>Wajib Rutin 1 Tahun</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-[#0c0f14] border border-[#1b1f28] p-7 flex flex-col justify-between hover:border-[#2d3546] transition-colors">
                  <div className="space-y-4">
                    <div className="w-8 h-8 bg-[#141720] border border-[#202534] flex items-center justify-center font-mono text-xs font-bold text-white">
                      03
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Survei Suara Warga
                    </h3>
                    <p className="text-xs text-[#8c94a3] leading-relaxed">
                      Penilaian langsung dari Anda setelah keluar dari loket pelayanan: apakah petugas bersikap ramah, prosesnya tepat waktu, dan bebas dari pungutan liar.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#1b1f28] flex items-center justify-between text-xs font-mono text-[#3dd68c]">
                    <span>Evaluasi Terbuka</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 4: TANYA JAWAB STANDAR UKUR (Index 04 / Split Screen Persis Referensi) */}
          <section id="faq" className="py-20 border-b border-[#1b1f28] bg-[#090b0e]">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#1b1f28] font-mono text-[11px] text-[#636c7c]">
                <span>04 / STANDAR KEPASTIAN UKUR</span>
                <span>TANYA JAWAB TEKNIS</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SISI KIRI: Dua Kotak Komparasi */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Kotak Kiri: Kondisi Awal */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono font-bold tracking-wider text-[#636a79] uppercase">
                      KONDISI AWAL
                    </div>
                    <div className="bg-[#0c0f14] border border-[#1b1f28] p-5 font-sans min-h-[300px] flex flex-col justify-between">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`left-${activeFaq}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-1.5 pb-3 border-b border-[#1b1f28]">
                            <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                            <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                            <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#e6e8eb]">
                              {FAQS[activeFaq].leftTitle}
                            </h4>
                            <p className="text-[11px] text-[#717885] mt-0.5">
                              {FAQS[activeFaq].leftSubtitle}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-[#1b1f28]">
                            {FAQS[activeFaq].leftRows.map((row, i) => (
                              <div key={i} className="text-[11px] leading-relaxed">
                                <span className="text-[#656d7d] block font-mono text-[10px] uppercase">{row.k}</span>
                                <span className="text-[#a4abb8] font-medium">{row.v}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      <div className="pt-3 border-t border-[#1b1f28] text-[10px] text-[#555d6d] font-mono">
                        Evaluasi Kendala
                      </div>
                    </div>
                  </div>

                  {/* Kotak Kanan: Standar Peneraan */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono font-bold tracking-wider text-[#3dd68c] uppercase flex items-center gap-1">
                      <span>✓</span>
                      <span>STANDAR PENERAAN</span>
                    </div>
                    <div className="bg-[#0e121a] border border-[#273544] p-5 font-sans min-h-[300px] flex flex-col justify-between">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`right-${activeFaq}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-1.5 pb-3 border-b border-[#1c2330]">
                            <div className="w-2 h-2 rounded-full bg-[#3dd68c]/70" />
                            <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                            <div className="w-2 h-2 rounded-full bg-[#2a303e]" />
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center justify-between">
                              <span>{FAQS[activeFaq].rightTitle}</span>
                              <span className="text-[10px] font-mono text-[#3dd68c] bg-[#16291f] px-1.5 py-0.5 rounded border border-[#254634]">SAH</span>
                            </h4>
                            <p className="text-[11px] text-[#3dd68c]/80 mt-0.5">
                              {FAQS[activeFaq].rightSubtitle}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-[#1b2533]">
                            {FAQS[activeFaq].rightRows.map((row, i) => (
                              <div key={i} className="text-[11px] leading-relaxed">
                                <span className="text-[#657588] block font-mono text-[10px] uppercase">{row.k}</span>
                                <span className="text-[#d8dce6] font-medium">{row.v}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      <div className="pt-3 border-t border-[#1c2330] text-[10px] text-[#3dd68c] font-mono">
                        Disperindag Metrologi Legal
                      </div>
                    </div>
                  </div>

                </div>

                {/* SISI KANAN: Navigasi Akordeon */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <div className="space-y-1 border-b border-[#1b1f28] pb-4">
                    <div className="text-[10px] font-mono font-bold tracking-widest text-[#787f8d] uppercase">
                      TANYA JAWAB PELAYANAN
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Kepastian Ukur & Timbangan
                    </h2>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`desc-${activeFaq}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {FAQS[activeFaq].q}
                      </h3>
                      <p className="text-xs text-[#8c94a3] leading-relaxed">
                        {FAQS[activeFaq].desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <div className="border-t border-[#1b1f28] divide-y divide-[#161a22] pt-1">
                    {FAQS.map((faq, idx) => {
                      const isActive = activeFaq === idx;
                      return (
                        <button
                          key={faq.id}
                          type="button"
                          onClick={() => setActiveFaq(idx)}
                          className={`w-full py-3 text-left flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer group ${
                            isActive ? 'text-white' : 'text-[#6b7382] hover:text-[#c2c7d0]'
                          }`}
                        >
                          <span className="pr-4 leading-snug">{faq.q}</span>
                          <span className={`text-sm font-mono shrink-0 transition-colors ${
                            isActive ? 'text-[#3dd68c]' : 'text-[#424856] group-hover:text-[#8c94a3]'
                          }`}>
                            {isActive ? '—' : '+'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* SECTION 5: CALL TO ACTION (Index 05 / PhotoCraft Get It Style) */}
          <section id="survei-cta" className="py-20 bg-[#07090c] border-b border-[#1b1f28]">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#1b1f28] font-mono text-[11px] text-[#636c7c]">
                <span>05 / EVALUASI SURVEI</span>
                <span>PARTISIPASI PUBLIK</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-8 space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    SELESAI MENERA ALAT UKUR ATAU TIMBANGAN?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8c94a3] max-w-lg">
                    Luangkan 2 menit waktu Anda untuk mengisi kuesioner singkat ini. Penilaian dan masukan Anda langsung dipantau oleh kepala dinas.
                  </p>
                </div>

                <div className="md:col-span-4 flex md:justify-end">
                  <button
                    type="button"
                    onClick={handleStartSurvey}
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#e6e8ec] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Mulai Isi Survei</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* FOOTER SIMPEL */}
          <footer className="py-8 bg-[#090b0e] text-xs text-[#717885]">
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-2.5">
                <Scale className="w-3.5 h-3.5 text-white" />
                <span className="font-bold text-white uppercase tracking-wider">
                  DISPERINDAG METROLOGI LEGAL
                </span>
              </div>

              <div className="flex items-center gap-6">
                <a href="#prosedur" className="hover:text-white transition-colors">Alur</a>
                <a href="#layanan" className="hover:text-white transition-colors">Layanan</a>
                <a href="#faq" className="hover:text-white transition-colors">Standar</a>
              </div>

              <div className="text-[#525966]">
                © 2026 DISPERINDAG
              </div>
            </div>
          </footer>

        </div>
      )}

      {/* 3. FORM SURVEI */}
      {stage === 'survey' && (
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 animate-fadeIn">
          
          <div className="flex items-center justify-between pb-6 border-b border-[#202530] mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => setStage('landing')}
              className="inline-flex items-center gap-1.5 font-semibold text-[#8c94a3] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>KEMBALI KE BERANDA</span>
            </button>
            <span className="text-[11px] text-[#8c94a3]">
              01 / FORMULIR SKM
            </span>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-none bg-[#241318] border border-[#4d1f2a] text-[#f27b91] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Bagian 1: Data Responden */}
            <div className="bg-[#0c0f14] border border-[#1b1f28] p-6 space-y-4">
              <div className="border-b border-[#1b1f28] pb-3 font-mono">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  01 / IDENTITAS RESPONDEN
                </h3>
                <p className="text-[11px] text-[#787f8d] mt-0.5">Hanya nama yang wajib diisi. Data lain bersifat opsional.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#b0b7c3] mb-1.5 uppercase">
                  Nama Lengkap <span className="text-[#3dd68c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama pemohon atau pemilik usaha"
                  value={respondentName}
                  onChange={e => setRespondentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-none border border-[#272d3b] bg-[#090b0e] focus:border-white outline-none text-xs text-white placeholder:text-[#4d5360] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#b0b7c3] mb-1.5 uppercase">
                    Jenis Kelamin <span className="text-[#626977] font-normal">(Opsional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`py-2 text-xs font-mono transition-colors cursor-pointer border ${
                        gender === 'L'
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-[#090b0e] text-[#8c94a3] border-[#272d3b] hover:border-white'
                      }`}
                    >
                      Laki-Laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`py-2 text-xs font-mono transition-colors cursor-pointer border ${
                        gender === 'P'
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-[#090b0e] text-[#8c94a3] border-[#272d3b] hover:border-white'
                      }`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#b0b7c3] mb-1.5 uppercase">
                    Umur <span className="text-[#626977] font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="100"
                    placeholder="Contoh: 35"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-none border border-[#272d3b] bg-[#090b0e] focus:border-white outline-none text-xs text-white placeholder:text-[#4d5360] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#b0b7c3] mb-1.5 uppercase">
                  Pekerjaan / Bidang Usaha <span className="text-[#626977] font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Pedagang sayur, Pengelola SPBU, Wiraswasta"
                  value={job}
                  onChange={e => setJob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-none border border-[#272d3b] bg-[#090b0e] focus:border-white outline-none text-xs text-white placeholder:text-[#4d5360] transition-colors"
                />
              </div>
            </div>

            {/* Bagian 2: Jenis Pelayanan */}
            <div className="bg-[#0c0f14] border border-[#1b1f28] p-6 space-y-4">
              <div className="border-b border-[#1b1f28] pb-3 font-mono">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  02 / JENIS PELAYANAN <span className="text-[#3dd68c]">*</span>
                </h3>
                <p className="text-[11px] text-[#787f8d] mt-0.5">Pilih salah satu layanan yang baru saja selesai diurus.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div
                  onClick={() => setServiceType('tera')}
                  className={`p-4 border transition-colors cursor-pointer flex items-start gap-3 ${
                    serviceType === 'tera'
                      ? 'border-white bg-[#141720]'
                      : 'border-[#272d3b] bg-[#090b0e] hover:border-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    serviceType === 'tera' ? 'border-white bg-white' : 'border-[#3e4554]'
                  }`}>
                    {serviceType === 'tera' && <Check className="w-2.5 h-2.5 text-black" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs font-mono uppercase">Pelayanan Tera</h4>
                    <p className="text-[11px] text-[#787f8d] mt-0.5">Pengujian pertama kali pada alat timbang/ukur baru atau impor.</p>
                  </div>
                </div>

                <div
                  onClick={() => setServiceType('tera_ulang')}
                  className={`p-4 border transition-colors cursor-pointer flex items-start gap-3 ${
                    serviceType === 'tera_ulang'
                      ? 'border-white bg-[#141720]'
                      : 'border-[#272d3b] bg-[#090b0e] hover:border-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    serviceType === 'tera_ulang' ? 'border-white bg-white' : 'border-[#3e4554]'
                  }`}>
                    {serviceType === 'tera_ulang' && <Check className="w-2.5 h-2.5 text-black" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs font-mono uppercase">Pelayanan Tera Ulang</h4>
                    <p className="text-[11px] text-[#787f8d] mt-0.5">Pengujian berkala tahunan untuk timbangan yang sedang aktif dipakai.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 3: Pertanyaan Survei */}
            <div className="bg-[#0c0f14] border border-[#1b1f28] p-6 space-y-6">
              <div className="border-b border-[#1b1f28] pb-3 font-mono">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  03 / PENILAIAN PELAYANAN <span className="text-[#3dd68c]">*</span>
                </h3>
                <p className="text-[11px] text-[#787f8d] mt-0.5">Berikan penilaian jujur sesuai apa yang Anda alami.</p>
              </div>

              {loadingQuestions ? (
                <div className="py-6 text-center text-xs text-[#626977] font-mono">Memuat pertanyaan...</div>
              ) : (
                <div className="space-y-5">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-[#090b0e] border border-[#1b1f28] space-y-3">
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        <span className="text-[#3dd68c] font-mono mr-1.5">{idx + 1}.</span>
                        {q.question_text}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => handleAnswerSelect(q.id, 'puas')}
                          className={`py-2 px-3 border text-center font-bold transition-colors cursor-pointer ${
                            answers[q.id] === 'puas'
                              ? 'bg-white text-black border-white'
                              : 'bg-[#10131a] text-[#8c94a3] border-[#252a34] hover:border-white'
                          }`}
                        >
                          Puas
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAnswerSelect(q.id, 'cukup_puas')}
                          className={`py-2 px-3 border text-center font-bold transition-colors cursor-pointer ${
                            answers[q.id] === 'cukup_puas'
                              ? 'bg-white text-black border-white'
                              : 'bg-[#10131a] text-[#8c94a3] border-[#252a34] hover:border-white'
                          }`}
                        >
                          Cukup Puas
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAnswerSelect(q.id, 'tidak_puas')}
                          className={`py-2 px-3 border text-center font-bold transition-colors cursor-pointer ${
                            answers[q.id] === 'tidak_puas'
                              ? 'bg-white text-black border-white'
                              : 'bg-[#10131a] text-[#8c94a3] border-[#252a34] hover:border-white'
                          }`}
                        >
                          Tidak Puas
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bagian 4: Kritik & Saran */}
            <div className="bg-[#0c0f14] border border-[#1b1f28] p-6 space-y-4">
              <div className="border-b border-[#1b1f28] pb-3 font-mono">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  04 / MASUKAN & SARAN
                </h3>
                <p className="text-[11px] text-[#787f8d] mt-0.5">Tuliskan kendala nyata atau hal yang perlu diperbaiki (opsional).</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#b0b7c3] mb-1.5 uppercase">
                  Kritik / Kendala yang Ditemukan
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Ruang tunggu loket agak sempit, antrean pagi padat..."
                  value={critique}
                  onChange={e => setCritique(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#272d3b] bg-[#090b0e] focus:border-white outline-none text-xs text-white placeholder:text-[#4d5360] resize-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#b0b7c3] mb-1.5 uppercase">
                  Saran untuk Peningkatan Pelayanan
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Tambah petugas uji pada hari pasar, sediakan nomor antrean digital..."
                  value={suggestion}
                  onChange={e => setSuggestion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#272d3b] bg-[#090b0e] focus:border-white outline-none text-xs text-white placeholder:text-[#4d5360] resize-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-5 bg-white hover:bg-[#e6e8ec] disabled:opacity-50 text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Menyimpan Jawaban...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-black" />
                    <span>Kirim Penilaian</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 4. SUCCESS STAGE */}
      {stage === 'success' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0c0f14] border border-[#1b1f28] p-8 text-center space-y-5">
            <div className="w-12 h-12 bg-white text-black flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-black" />
            </div>

            <div className="space-y-1.5 font-mono">
              <h2 className="text-lg font-bold text-white tracking-tight uppercase">
                SURVEI BERHASIL DIKIRIM
              </h2>
              <p className="text-xs text-[#8c94a3] leading-relaxed font-sans">
                Terima kasih atas partisipasi Anda. Penilaian Anda telah tersimpan dengan aman di basis data Disperindag untuk evaluasi berkala mutu pelayanan publik.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-white hover:text-black border border-[#272d3b] text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Selesai & Kembali ke Depan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
