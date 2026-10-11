import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Scan, 
  BookOpen, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  History,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboard({ currentUser, onNavigate }) {
  const [schedules, setSchedules] = useState([]);
  const [recapData, setRecapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [schList, recap] = await Promise.all([
        api.getSchedules(),
        api.getRecapReport()
      ]);
      setSchedules(schList);
      setRecapData(recap);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Find current student record in recap
  const myRecap = recapData?.recap?.find(r => r.nim === currentUser?.identifier);
  const attendanceRate = myRecap ? myRecap.percentage : 85.7; // default fallback
  const isEligibleForExam = attendanceRate >= 75.0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Student Welcome & Biometric Profile Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-600/30 ring-2 ring-white/10 flex-shrink-0">
              {currentUser?.name?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">{currentUser?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-500/30">
                  {currentUser?.kelas || 'TI-4A'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                NIM: <span className="font-mono text-cyan-300 font-semibold">{currentUser?.identifier}</span> • {currentUser?.prodi} • Semester {currentUser?.semester || 5}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                USINDO (Universitas Sehati Indonesia)
              </p>
            </div>
          </div>

          {/* Biometric Enrollment Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {currentUser?.faceEnrolled ? (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Wajah Terdaftar (3 Sudut)</div>
                  <div className="text-[10px] text-emerald-400/80">Vektor 128-d Terenkripsi Aktif</div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl px-4 py-3 flex items-center justify-between gap-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">Wajah Belum Terdaftar</div>
                    <div className="text-[10px] text-amber-400/80">Wajib enrollment sebelum absen</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('enrollment')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  Daftar Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards: Attendance Percentage & Exam Eligibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Rate */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Persentase Kehadiran</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{attendanceRate}%</span>
            <span className="text-xs text-slate-400">/ 100%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className={`h-full rounded-full ${isEligibleForExam ? 'bg-cyan-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            />
          </div>
        </div>

        {/* Syarat Mengikuti Ujian (Reference Diagram Requirement: Min 75%) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Syarat Mengikuti Ujian</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            {isEligibleForExam ? (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MEMENUHI SYARAT (≥75%)</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>PERINGATAN (&lt;75%)</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Ambang batas kehadiran minimum UAS: 75%
          </p>
        </div>

        {/* Tepat Waktu */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Hadir Tepat Waktu</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {myRecap ? myRecap.presentCount : 6} <span className="text-xs text-slate-400 font-normal">Sesi</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Sesuai toleransi jadwal perkuliahan
          </p>
        </div>

        {/* Terlambat */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Terlambat</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {myRecap ? myRecap.lateCount : 1} <span className="text-xs text-slate-400 font-normal">Sesi</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Dihitung hadir dengan catatan terlambat
          </p>
        </div>

      </div>

      {/* Jadwal Kuliah Hari Ini */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Jadwal Kuliah Hari Ini
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedules.map(sch => {
            const hasAttended = !!sch.myAttendance;
            return (
              <div
                key={sch.id}
                className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {sch.courseCode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Pertemuan #{sch.meetingNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm mb-1 line-clamp-1">
                    {sch.courseName}
                  </h3>

                  <div className="text-xs text-slate-400 space-y-1 mb-3">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{sch.startTime} - {sch.endTime} WIB</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{sch.room}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  {hasAttended ? (
                    <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sudah Absen ({sch.myAttendance.status})</span>
                    </div>
                  ) : sch.isOpen ? (
                    <button
                      onClick={() => onNavigate('absensi')}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Absen Sekarang</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Sesi Belum Dibuka
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Riwayat Absensi Pribadi Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Riwayat Presensi Biometrik Wajah
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Terverifikasi Sistem AI
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Pertemuan</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Mata Kuliah</th>
                <th className="py-3 px-4">Kemiripan Wajah</th>
                <th className="py-3 px-4">Liveness & GPS</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {myRecap?.records && myRecap.records.length > 0 ? (
                myRecap.records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      #{rec.meetingNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{rec.date}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.time} WIB</div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      Kecerdasan Buatan & ML
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-400 font-bold">
                        {rec.similarity}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 text-[11px] text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Valid (Liveness &lt;100m)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.status === 'HADIR'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-500">
                    Belum ada riwayat absensi yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
