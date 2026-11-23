'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Akses ditolak. Periksa kembali email dan kata sandi.');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Gagal login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e6e8eb] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#4f52ff] selection:text-white">

      {/* Box Login Persis Gambar 1 Aiven ("Log in to Console") */}
      <div className="w-full max-w-[440px] bg-[#12151b] border border-[#212630] rounded-xl p-8 sm:p-9 shadow-2xl space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Log in to Console
          </h1>
          <p className="text-xs text-[#717885] mt-1">
            Panel Administrator Dinas Perdagangan dan Perindustrian
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-[#241318] border border-[#4d1f2a] text-[#f27b91] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[#c2c7d0] mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="email@yourcompany.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#272d39] bg-[#0d0f12] focus:border-[#3dd68c] focus:ring-1 focus:ring-[#3dd68c] outline-none text-xs text-white placeholder:text-[#4d5360] transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#c2c7d0] mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#272d39] bg-[#0d0f12] focus:border-[#3dd68c] focus:ring-1 focus:ring-[#3dd68c] outline-none text-xs text-white placeholder:text-[#4d5360] transition-colors"
            />
          </div>

          {/* Checkbox Remember Me (Persis kotak centang hijau toska di gambar 1) */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0d0f12] border-[#272d39] text-[#29b6a2] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#29b6a2]"
            />
            <label htmlFor="remember" className="text-xs text-[#a4abb8] cursor-pointer select-none">
              Remember me
            </label>
          </div>

          {/* Tombol Login Persis Aiven Gambar 1 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#262c37] hover:bg-[#323947] disabled:opacity-50 text-white font-bold rounded-lg text-xs tracking-tight transition-colors cursor-pointer"
            >
              {loading ? 'Memverifikasi...' : 'Log in'}
            </button>
          </div>

        </form>

        {/* Footer Link */}
        <div className="pt-2 border-t border-[#1a1e27] text-xs text-[#717885] flex items-center justify-between">
          <span>Khusus Petugas Internal</span>
          <Link href="/" className="text-[#29b6a2] hover:underline">
            ← Ke Halaman Depan
          </Link>
        </div>

      </div>

    </div>
  );
}
