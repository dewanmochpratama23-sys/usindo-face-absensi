import React, { useState } from 'react';
import { 
  Scan, 
  Camera, 
  Lock, 
  ShieldCheck, 
  CalendarCheck, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  ArrowRight,
  Server,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';

export default function SystemFlowBanner({ activeTab, onSelectTab }) {
  // Start collapsed by default or easy toggle so the interactive camera/forms are immediately visible!
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl relative overflow-hidden transition-all">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar with Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Alur Sistem Absensi Face Recognition USINDO
              </span>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/30">
                3 Tahapan
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Klik salah satu tahapan di bawah ini untuk membuka modul interaktifnya:
            </p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors w-fit"
        >
          <span>{isExpanded ? 'Sembunyikan Penjelasan' : 'Lihat Penjelasan Diagram'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3 Main Clickable Step Tabs (Primary Navigation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        
        {/* Step 1: Pendaftaran Wajah (Enrollment) */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('enrollment')}
          className={`w-full text-left rounded-xl p-3.5 border transition-all cursor-pointer relative group ${
            activeTab === 'enrollment' 
              ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/40 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20' 
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
              1
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'enrollment' 
                ? 'bg-blue-600 text-white' 
                : 'text-blue-400 bg-blue-950/60 border border-blue-500/30'
            }`}>
              {activeTab === 'enrollment' ? '● SEDANG DIBUKA' : 'KLIK UNTUK BUKA'}
            </span>
          </div>

          <div className="font-extrabold text-sm text-white flex items-center space-x-1.5 mb-1">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>1. Pendaftaran Wajah</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Login NIM • Izin Kamera • Ekstraksi 3 Sudut (128-d)
          </div>
        </button>

        {/* Step 2: Absensi Harian (Recognition) */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('absensi')}
          className={`w-full text-left rounded-xl p-3.5 border transition-all cursor-pointer relative group ${
            activeTab === 'absensi' 
              ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/40 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20' 
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow">
              2
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'absensi' 
                ? 'bg-cyan-600 text-white' 
                : 'text-cyan-400 bg-cyan-950/60 border border-cyan-500/30'
            }`}>
              {activeTab === 'absensi' ? '● SEDANG DIBUKA' : 'KLIK UNTUK BUKA'}
            </span>
          </div>

          <div className="font-extrabold text-sm text-white flex items-center space-x-1.5 mb-1">
            <Scan className="w-4 h-4 text-cyan-400" />
            <span>2. Absensi Harian Real-time</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Pilih Jadwal • Kedip/Senyum Liveness • Ambang &gt;85%
          </div>
        </button>

        {/* Step 3: Monitoring & Pelaporan */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('monitoring')}
          className={`w-full text-left rounded-xl p-3.5 border transition-all cursor-pointer relative group ${
            activeTab === 'monitoring' 
              ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow">
              3
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'monitoring' 
                ? 'bg-emerald-600 text-white' 
                : 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30'
            }`}>
              {activeTab === 'monitoring' ? '● SEDANG DIBUKA' : 'KLIK UNTUK BUKA'}
            </span>
          </div>

          <div className="font-extrabold text-sm text-white flex items-center space-x-1.5 mb-1">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <span>3. Monitoring & Pelaporan</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Rekap Kehadiran • Syarat Ujian (≥75%) • Ekspor PDF/Excel
          </div>
        </button>

      </div>

      {/* Expanded Detailed Breakdown from Reference Flowchart */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="font-bold text-blue-300 mb-1 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5" />
              <span>Detail Tahap 1: Enrollment</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Login dengan NIM & kata sandi mahasiswa</li>
              <li>• Meminta izin akses webcam browser</li>
              <li>• Ekstraksi 3 sudut: Depan, Kiri, dan Kanan</li>
              <li>• <span className="text-emerald-300 font-semibold">Simpan vektor terenkripsi; foto mentah dibuang!</span></li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="font-bold text-cyan-300 mb-1 flex items-center space-x-1">
              <Scan className="w-3.5 h-3.5" />
              <span>Detail Tahap 2: Recognition</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Pilih jadwal kuliah aktif</li>
              <li>• Uji keaslian anti-spoofing (Kedip / Senyum)</li>
              <li>• Pencocokan biometrik ambang batas &gt; 85%</li>
              <li>• Validasi Geofencing GPS & toleransi keterlambatan</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="font-bold text-emerald-300 mb-1 flex items-center space-x-1">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Detail Tahap 3: Reporting</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Rekap kehadiran mahasiswa real-time</li>
              <li>• Persentase kehadiran otomatis per kelas</li>
              <li>• Evaluasi syarat ujian (Ambang batas min. 75%)</li>
              <li>• Unduh Laporan Resmi format PDF & Excel (.xlsx)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
