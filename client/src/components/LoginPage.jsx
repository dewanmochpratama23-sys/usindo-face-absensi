import React, { useState, useEffect } from 'react';
import { 
  ScanFace, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  Users,
  PlusCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLogin, error }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('usindomaju01');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Self Registration State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [regData, setRegData] = useState({
    name: '',
    identifier: '',
    prodi: 'Teknik Informatika',
    kelas: 'TI-4A',
    semester: 5,
    password: 'usindomaju01'
  });

  const [liveStudents, setLiveStudents] = useState([]);

  const loadStudents = async () => {
    try {
      const res = await api.getStudents();
      if (res && res.length > 0) {
        setLiveStudents(res);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const defaultStudents = [
    { nim: '240131009', name: 'Dewan Moch Pratama', kelas: 'TI-4A', role: 'mahasiswa' },
    { nim: '240131012', name: 'Fakhri Fadhlurrahman', kelas: 'TI-4A', role: 'mahasiswa' },
    { nim: '240131019', name: 'Muhammad Falah', kelas: 'TI-4A', role: 'mahasiswa' },
    { nim: '240131025', name: 'Rival Setiawan', kelas: 'TI-4A', role: 'mahasiswa' },
    { nim: '230131001', name: 'Hasan Hariri', kelas: 'TI-4A', role: 'mahasiswa' },
    { nim: '19850101', name: 'Bapak ANDRIYANA S.T., M.Kom.', kelas: 'Dosen Pengampu', role: 'dosen' },
    { nim: 'admin', name: 'Biro BAAK USINDO', kelas: 'Admin Akademik', role: 'admin' },
  ];

  const studentsList = liveStudents.length > 0 
    ? [
        ...liveStudents.map(s => ({
          nim: s.identifier,
          name: s.name,
          kelas: s.kelas || 'TI-4A',
          role: 'mahasiswa',
          faceEnrolled: s.faceEnrolled
        })),
        { nim: '19850101', name: 'Bapak ANDRIYANA S.T., M.Kom.', kelas: 'Dosen Pengampu', role: 'dosen' },
        { nim: 'admin', name: 'Biro BAAK USINDO', kelas: 'Admin Akademik', role: 'admin' }
      ]
    : defaultStudents;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setLocalError('Harap masukkan NIM atau Username Anda.');
      return;
    }
    setLocalError(null);
    setLoading(true);
    try {
      await onLogin(identifier.trim(), password);
    } catch (err) {
      setLocalError(err.message || 'Login gagal. Periksa kembali NIM dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (nim) => {
    setIdentifier(nim);
    setPassword('usindomaju01');
    setLocalError(null);
  };

  const handleQuickLogin = async (nim) => {
    setIdentifier(nim);
    setPassword('usindomaju01');
    setLocalError(null);
    setLoading(true);
    try {
      await onLogin(nim, 'usindomaju01');
    } catch (err) {
      setLocalError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);
    try {
      const res = await api.registerStudent(regData);
      setRegisterSuccess(res.message);
      setIdentifier(regData.identifier.trim());
      setPassword(regData.password || 'usindomaju01');
      await loadStudents();
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterSuccess(null);
      }, 1800);
    } catch (err) {
      setRegError(err.message || 'Pendaftaran akun mahasiswa gagal');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 my-8">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-2.5 shadow-xl mb-4 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ScanFace className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
                USINDO
              </span>
              <span className="text-[10px] text-cyan-400 font-mono ml-2 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                v2.0 AI
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">
                USINDO (Universitas Sehati Indonesia)
              </p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Portal Absensi Biometrik Wajah
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1.5">
            Silakan login menggunakan <strong className="text-slate-200">NIM</strong> dan Kata Sandi <strong className="text-cyan-400 font-mono">usindomaju01</strong> untuk mengakses akun presensi Anda secara mandiri.
          </p>
        </div>

        {/* Two-Column Grid: Left Form, Right Student Quick Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Form Login Pribadi */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-7 flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Masuk ke Akun Anda</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  Otentikasi Mandiri
                </span>
              </div>

              {/* Error Alert */}
              {(localError || error) && (
                <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-3 mb-4 text-xs text-rose-300 flex items-center space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{localError || error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nomor Induk Mahasiswa (NIM)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="Masukkan NIM Anda (contoh: 240131012)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Kata Sandi (Password)
                    </label>
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      Sandi: usindomaju01
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Akun Saya'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setRegisterSuccess(null);
                      setShowRegisterModal(true);
                    }}
                    className="w-full mt-2.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-cyan-400" />
                    <span>Belum Terdaftar? Buat Akun Mahasiswa Baru</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Privacy & Security Footnote */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Keamanan & Privasi Biometrik Terjamin</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Kredensial dienkripsi dengan bcrypt. Foto kamera mentah tidak disimpan, hanya 128 angka vektor referensi matematis yang disimpan di server.
              </p>
            </div>
          </div>

          {/* Right Column: Daftar Akun Mahasiswa (Pilih Perorangan) */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Pilih Akun Mahasiswa / Penguji</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  5 Mahasiswa Terdaftar
                </span>
              </div>
              
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Klik salah satu mahasiswa di bawah ini untuk mengisi NIM otomatis dengan kata sandi <strong className="text-cyan-300 font-mono">usindomaju01</strong>:
              </p>

              {/* 5 Mahasiswa Cards Grid */}
              <div className="space-y-2">
                {studentsList.map((stu) => {
                  const isSelected = identifier === stu.nim;
                  const isRoleBadge = stu.role === 'dosen' ? 'DOSEN' : stu.role === 'admin' ? 'ADMIN' : 'MHS';
                  return (
                    <div
                      key={stu.nim}
                      onClick={() => handleSelectStudent(stu.nim)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-900/40 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          stu.role === 'dosen' 
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                            : stu.role === 'admin' 
                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {stu.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{stu.name}</div>
                          <div className="text-[11px] font-mono text-cyan-300 flex items-center space-x-2">
                            <span>NIM: {stu.nim}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{stu.kelas}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(stu.nim);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                          title="Langsung Masuk"
                        >
                          Masuk ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              Semua akun menggunakan kata sandi: <strong className="text-cyan-300 font-mono">usindomaju01</strong>
            </div>
          </div>

        </div>

        {/* MODAL REGISTRASI MAHASISWA BARU */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5 relative z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Registrasi Akun Mahasiswa Baru</h3>
                    <p className="text-xs text-slate-400">USINDO (Universitas Sehati Indonesia)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}
              {registerSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs mb-4 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5 relative z-10 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Nama Lengkap Mahasiswa <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                    placeholder="Contoh: Farhan Nurhadi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Nomor Induk Mahasiswa (NIM) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regData.identifier}
                    onChange={e => setRegData({ ...regData, identifier: e.target.value })}
                    placeholder="Contoh: 240131031"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Program Studi</label>
                    <input
                      type="text"
                      value={regData.prodi}
                      onChange={e => setRegData({ ...regData, prodi: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Kelas</label>
                    <input
                      type="text"
                      value={regData.kelas}
                      onChange={e => setRegData({ ...regData, kelas: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Semester</label>
                    <input
                      type="number"
                      value={regData.semester}
                      onChange={e => setRegData({ ...regData, semester: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Kata Sandi Akun</label>
                    <input
                      type="text"
                      value={regData.password}
                      onChange={e => setRegData({ ...regData, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                  ℹ️ Setelah akun terdaftar, mahasiswa dapat langsung login untuk memindai 3 sudut wajah di menu <strong>Pendaftaran Wajah (Enrollment)</strong>.
                </p>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    {regLoading ? 'Mendaftarkan...' : 'Daftarkan Akun Mahasiswa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Global Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          © 2026 USINDO (Universitas Sehati Indonesia) • Sistem Absensi Face Recognition v2.0
        </div>
      </div>
    </div>
  );
}
