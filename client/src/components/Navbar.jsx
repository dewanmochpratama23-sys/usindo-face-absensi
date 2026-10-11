import React, { useState, useEffect } from 'react';
import { 
  ScanFace, 
  ShieldCheck, 
  User, 
  LogOut, 
  Clock, 
  Calendar,
  ChevronDown,
  Sparkles,
  School,
  Activity
} from 'lucide-react';

export default function Navbar({ currentUser, onSwitchUser, onLogout, activeTab, setActiveTab }) {
  const [time, setTime] = useState(new Date());
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const demoAccounts = [
    { label: 'Mahasiswa (240131009)', identifier: '240131009', name: 'Dewan Moch Pratama', role: 'mahasiswa' },
    { label: 'Mahasiswa (240131012)', identifier: '240131012', name: 'Fakhri Fadhlurrahman', role: 'mahasiswa' },
    { label: 'Mahasiswa (240131019)', identifier: '240131019', name: 'Muhammad Falah', role: 'mahasiswa' },
    { label: 'Mahasiswa (240131025)', identifier: '240131025', name: 'Rival Setiawan', role: 'mahasiswa' },
    { label: 'Mahasiswa (230131001)', identifier: '230131001', name: 'Hasan Hariri', role: 'mahasiswa' },
    { label: 'Dosen Pengampu', identifier: '19850101', name: 'Bapak ANDRIYANA S.T., M.Kom.', role: 'dosen' },
    { label: 'Admin Akademik (BAAK)', identifier: 'admin', name: 'Admin BAAK USINDO', role: 'admin' },
  ];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/30">ADMIN BAAK</span>;
      case 'dosen':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">DOSEN PENGAMPU</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-900/60 text-blue-200 border border-blue-500/30">MAHASISWA</span>;
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <ScanFace className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
                  USINDO
                </span>
                <span className="text-xs bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded font-mono border border-blue-500/30">
                  v2.0 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight font-medium">
                Sistem Absensi Face Recognition
              </p>
            </div>
          </div>

          {/* Navigation Tabs based on Role */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentUser?.role === 'mahasiswa' ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('absensi')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                    activeTab === 'absensi'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ScanFace className="w-4 h-4 text-cyan-400" />
                  <span>Absensi Harian</span>
                </button>
                <button
                  onClick={() => setActiveTab('enrollment')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                    activeTab === 'enrollment'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pendaftaran Wajah</span>
                  {!currentUser?.faceEnrolled && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                    activeTab === 'monitoring'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Riwayat & Monitoring</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                    activeTab === 'monitoring'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Monitoring & Rekap</span>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'audit'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Audit Trail
                </button>
              </>
            )}
          </nav>

          {/* Right Side: Clock, Account Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Live Time */}
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{time.toLocaleTimeString('id-ID')} WIB</span>
            </div>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700/80 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                title="Ganti Akun Demo Pengujian"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-medium">Ganti Akun</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSwitchDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-700 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pilih Akun Uji Coba:
                  </div>
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.identifier}
                      onClick={() => {
                        setShowSwitchDropdown(false);
                        onSwitchUser(acc.identifier);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700/70 flex items-center justify-between ${
                        currentUser?.identifier === acc.identifier ? 'bg-blue-900/30 text-blue-300 font-semibold' : 'text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{acc.name}</div>
                        <div className="text-[10px] text-slate-400">{acc.identifier} • {acc.label}</div>
                      </div>
                      {currentUser?.identifier === acc.identifier && (
                        <span className="text-blue-400 text-xs">Aktif</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile & Role */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {currentUser?.identifier}
                </div>
              </div>

              {getRoleBadge(currentUser?.role)}

              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 rounded-xl transition-all ml-1.5 font-semibold shadow-sm"
                title="Keluar dari akun Anda"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
