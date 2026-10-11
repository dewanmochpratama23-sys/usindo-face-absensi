import React, { useState } from 'react';
import { 
  ScanFace, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function LoginModal({ onLogin, error }) {
  const [identifier, setIdentifier] = useState('240131009');
  const [password, setPassword] = useState('mahasiswa123');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await onLogin(identifier, password);
    } catch (err) {
      setLocalError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setLocalError(null);
    onLogin(id, pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-7 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/30 ring-2 ring-white/10 mb-3">
            <ScanFace className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sistem Absensi USINDO
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            USINDO (Universitas Sehati Indonesia) • Biometric Face Recognition
          </p>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 mb-4 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nomor Induk Mahasiswa (NIM) / NIP
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Contoh: 2024001 atau 19850101"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher Section */}
        <div className="mt-6 pt-5 border-t border-slate-800 relative z-10">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Akses Cepat Akun Demo:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('240131009', 'usindomaju01')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-slate-300 transition-all"
            >
              <div className="font-semibold text-white truncate">Dewan Moch Pratama</div>
              <div className="text-[10px] text-cyan-400 font-mono">240131009 (Enrolled)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('240131012', 'usindomaju01')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-slate-300 transition-all"
            >
              <div className="font-semibold text-white truncate">Fakhri Fadhlurrahman</div>
              <div className="text-[10px] text-amber-400 font-mono">240131012 (Belum Enroll)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('240131019', 'usindomaju01')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-slate-300 transition-all"
            >
              <div className="font-semibold text-white truncate">Muhammad Falah</div>
              <div className="text-[10px] text-amber-400 font-mono">240131019 (Belum Enroll)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('240131025', 'usindomaju01')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-slate-300 transition-all"
            >
              <div className="font-semibold text-white truncate">Rival Setiawan</div>
              <div className="text-[10px] text-cyan-400 font-mono">240131025 (Enrolled)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('230131001', 'usindomaju01')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-slate-300 transition-all"
            >
              <div className="font-semibold text-white truncate">Hasan Hariri</div>
              <div className="text-[10px] text-cyan-400 font-mono">230131001 (Enrolled)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('19850101', 'usindomaju01')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-slate-300 transition-all"
            >
              <div className="font-semibold text-white truncate">Bapak ANDRIYANA S.T., M.Kom.</div>
              <div className="text-[10px] text-blue-400">Dosen Pengampu</div>
            </button>
          </div>
        </div>

        {/* Security Note Footer */}
        <div className="mt-5 text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Kata sandi di-hash dengan bcrypt & otentikasi JWT RBAC aktif</span>
        </div>
      </div>
    </div>
  );
}
