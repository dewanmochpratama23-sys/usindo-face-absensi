import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  ShieldAlert, 
  Search, 
  Filter, 
  RefreshCw, 
  Sliders, 
  Award, 
  GraduationCap, 
  Clock,
  Printer,
  ChevronDown,
  History,
  Scan,
  MapPin,
  UserCheck,
  Trash2,
  RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { api } from '../services/api';

export default function LecturerMonitoring({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('rekap'); // 'rekap' | 'riwayat' | 'audit' | 'jadwal'
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [recapData, setRecapData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [expandedStudentNim, setExpandedStudentNim] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ELIGIBLE' | 'NOT_ELIGIBLE'
  const [riwayatFilterNim, setRiwayatFilterNim] = useState('ALL');
  const [riwayatFilterStatus, setRiwayatFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Master Mahasiswa BAAK State
  const [studentsList, setStudentsList] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    identifier: '',
    prodi: 'Teknik Informatika',
    semester: 5,
    kelas: 'TI-4A',
    password: 'usindomaju01'
  });
  const [addStudentError, setAddStudentError] = useState(null);
  const [addStudentSuccess, setAddStudentSuccess] = useState(null);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Fetch Report Data safely using Promise.allSettled
  const loadReports = async () => {
    try {
      setIsLoading(true);
      const [recapRes, logsRes, schRes, attRes, stuRes] = await Promise.allSettled([
        api.getRecapReport(selectedCourseId),
        api.getAuditLogs(),
        api.getSchedules(),
        api.getAttendances({ courseId: selectedCourseId }),
        api.getStudents()
      ]);

      const recap = recapRes.status === 'fulfilled' ? recapRes.value : null;
      const logs = logsRes.status === 'fulfilled' ? logsRes.value : [];
      const schList = schRes.status === 'fulfilled' ? schRes.value : [];
      const attList = attRes.status === 'fulfilled' ? attRes.value : [];
      const stuList = stuRes.status === 'fulfilled' ? stuRes.value : [];

      if (recap && recap.course) {
        setRecapData(recap);
        if (recap.allCourses && recap.allCourses.length > 0) {
          setCourses(recap.allCourses);
          if (!selectedCourseId) {
            setSelectedCourseId(recap.course.id);
          }
        }
      }
      setAuditLogs(logs);
      setSchedules(schList);
      setAttendanceRecords(attList);
      setStudentsList(stuList);
    } catch (err) {
      console.error('Error loading monitoring data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddStudentError(null);
    setAddStudentSuccess(null);
    setIsSubmittingStudent(true);
    try {
      const res = await api.createStudent(newStudentData);
      setAddStudentSuccess(res.message || 'Mahasiswa berhasil didaftarkan oleh BAAK!');
      setNewStudentData({
        name: '',
        identifier: '',
        prodi: 'Teknik Informatika',
        semester: 5,
        kelas: 'TI-4A',
        password: 'usindomaju01'
      });
      await loadReports();
      setTimeout(() => {
        setShowAddStudentModal(false);
        setAddStudentSuccess(null);
      }, 1800);
    } catch (err) {
      setAddStudentError(err.message || 'Gagal mendaftarkan mahasiswa');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleDeleteStudent = async (identifier, name) => {
    if (!window.confirm(`Hapus data mahasiswa ${name} (${identifier}) dari sistem BAAK?`)) return;
    try {
      await api.deleteStudent(identifier);
      await loadReports();
    } catch (err) {
      alert('Gagal menghapus mahasiswa: ' + err.message);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedCourseId]);

  // Toggle Schedule Session (Buka/Tutup Absensi)
  const handleToggleSchedule = async (scheduleId, currentOpenStatus) => {
    try {
      await api.toggleSchedule(scheduleId, !currentOpenStatus);
      loadReports();
    } catch (err) {
      alert('Gagal mengubah status jadwal: ' + err.message);
    }
  };

  // Hapus Seluruh Riwayat Absensi (Dosen / Admin)
  const handleClearAllAttendances = async () => {
    const confirmed = window.confirm(
      'Apakah Bapak yakin ingin MENGHAPUS SEMUA RIWAYAT ABSENSI KELAS?\n\nSetelah dihapus, seluruh rekap persentase kehadiran akan di-reset ke 0 dan sesi absensi dapat digunakan kembali dari awal.'
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const res = await api.clearAttendances({ clearAll: true });
      alert(res.message || 'Riwayat absensi kelas berhasil dibersihkan!');
      loadReports();
    } catch (err) {
      alert('Gagal menghapus riwayat absensi: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Hapus Satu Riwayat Presensi Mahasiswa Tertentu
  const handleDeleteSingleAttendance = async (attendanceId, studentName, meetingNumber) => {
    const confirmed = window.confirm(
      `Hapus riwayat absensi Pertemuan #${meetingNumber} untuk mahasiswa ${studentName}?`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const res = await api.deleteAttendance(attendanceId);
      alert(res.message || 'Data absensi berhasil dihapus!');
      loadReports();
    } catch (err) {
      alert('Gagal menghapus data absensi: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Pendaftaran Wajah Semua Mahasiswa (Siap Registrasi Real)
  const handleResetAllEnrollments = async () => {
    const confirmed = window.confirm(
      'Apakah Bapak yakin ingin ME-RESET PENDAFTARAN WAJAH SEMUA MAHASISWA?\n\nSemua mahasiswa akan kembali berstatus Belum Terdaftar, sehingga mereka dapat mendaftarkan wajah asli mereka masing-masing melalui Modul 1.'
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const res = await api.resetAllEnrollments();
      alert(res.message || 'Pendaftaran wajah seluruh mahasiswa berhasil di-reset!');
      loadReports();
    } catch (err) {
      alert('Gagal mereset pendaftaran wajah: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter students
  const filteredStudents = (recapData?.recap || []).filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nim.includes(searchQuery);

    if (statusFilter === 'ELIGIBLE') {
      return matchesSearch && student.isEligibleForExam;
    }
    if (statusFilter === 'NOT_ELIGIBLE') {
      return matchesSearch && !student.isEligibleForExam;
    }
    return matchesSearch;
  });

  // Ekspor Excel (.xlsx) Client-Side with XLSX
  const handleExportExcel = () => {
    if (!recapData?.recap) return;

    const dataRows = recapData.recap.map((s, index) => ({
      'No': index + 1,
      'NIM': s.nim,
      'Nama Mahasiswa': s.name,
      'Kelas': s.kelas,
      'Prodi': s.prodi,
      'Hadir Tepat Waktu': s.presentCount,
      'Terlambat': s.lateCount,
      'Alpha / Tidak Hadir': s.absentCount,
      'Total Pertemuan': s.totalMeetings,
      'Persentase Kehadiran': `${s.percentage}%`,
      'Syarat Mengikuti Ujian (>=75%)': s.isEligibleForExam ? 'MEMENUHI SYARAT' : 'TIDAK MEMENUHI SYARAT'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Kehadiran');

    // Auto width
    const maxWidth = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 8 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 26 }];
    worksheet['!cols'] = maxWidth;

    const fileName = `Rekap_Kehadiran_USINDO_${recapData.course.code}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Ekspor PDF Format Laporan Resmi USINDO
  const handleExportPDF = () => {
    if (!recapData?.recap) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Header Kop Surat USINDO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 43, 92); // USINDO Navy
    doc.text('UNIVERSITAS SEHATI INDONESIA (USINDO)', 148, 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Biro Administrasi Akademik & Kemahasiswaan (BAAK) - Sistem Absensi Face Recognition', 148, 22, { align: 'center' });
    doc.text('Kampus Utama USINDO | Website: usindo.ac.id | Email: baak@usindo.ac.id', 148, 27, { align: 'center' });

    // Divider line
    doc.setDrawColor(15, 43, 92);
    doc.setLineWidth(0.8);
    doc.line(15, 30, 282, 30);
    doc.setLineWidth(0.2);
    doc.line(15, 31, 282, 31);

    // Course Information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text('LAPORAN REKAPITULASI KEHADIRAN MAHASISWA & SYARAT UJIAN', 148, 38, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mata Kuliah: ${recapData.course.name} (${recapData.course.code})`, 16, 45);
    doc.text(`Dosen Pengampu: ${recapData.course.lecturerName}`, 16, 50);
    doc.text(`Kelas / Semester: ${recapData.course.class || 'TI-4A'} / 5 (Tahun Akademik 2025/2026)`, 16, 55);

    doc.text(`Pertemuan Berjalan: 8 dari 14 Sesi`, 200, 45);
    doc.text(`Batas Minimal Ujian: 75% Kehadiran`, 200, 50);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 200, 55);

    // Table Data
    const tableHeaders = [
      ['No', 'NIM', 'Nama Mahasiswa', 'Kelas', 'Hadir', 'Terlambat', 'Alpha', 'Total Sesi', 'Persentase', 'Status Syarat Ujian']
    ];

    const tableRows = recapData.recap.map((s, idx) => [
      idx + 1,
      s.nim,
      s.name,
      s.kelas,
      s.presentCount,
      s.lateCount,
      s.absentCount,
      s.totalMeetings,
      `${s.percentage}%`,
      s.isEligibleForExam ? 'MEMENUHI SYARAT' : 'TIDAK MEMENUHI (<75%)'
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 43, 92],
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 22 },
        2: { cellWidth: 55 },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'center', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 22 },
        8: { halign: 'center', cellWidth: 24 },
        9: { halign: 'center', cellWidth: 50 }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 9) {
          if (data.cell.raw === 'MEMENUHI SYARAT') {
            data.cell.styles.textColor = [16, 120, 60];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [180, 20, 20];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Signature Block at Bottom
    const finalY = doc.lastAutoTable.finalY + 10;
    if (finalY < 170) {
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text('Mengetahui,', 220, finalY);
      doc.text('Dosen Pengampu Mata Kuliah,', 220, finalY + 5);
      doc.text('( Bapak ANDRIYANA S.T., M.Kom. )', 220, finalY + 25);
      doc.text('NIP. 19850101 201012 1 001', 220, finalY + 30);
    }

    doc.save(`Laporan_Absensi_Resmi_USINDO_${recapData.course.code}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Modul 3: Monitoring & Pelaporan Real-Time</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Pusat Kendali Kehadiran & Evaluasi Akademik
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Pantau rekap absensi biometrik secara langsung, periksa kelayakan ujian (≥75%), dan unduh laporan resmi.
            </p>
          </div>

          {/* Sub-tab Switchers */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('rekap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rekap & Syarat Ujian
            </button>
            <button
              onClick={() => setActiveSubTab('riwayat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'riwayat'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Riwayat Absen</span>
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Trail
            </button>
            <button
              onClick={() => setActiveSubTab('jadwal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'jadwal'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kontrol Jadwal
            </button>
            <button
              onClick={() => setActiveSubTab('mahasiswa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'mahasiswa'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Master Mahasiswa (BAAK)</span>
            </button>
          </div>
        </div>

        {/* Course Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-300 font-medium">Mata Kuliah:</span>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {courses.length > 0 ? (
                courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.class})
                  </option>
                ))
              ) : (
                <option value="MK-101">TIF401 - Kecerdasan Buatan & Machine Learning (TI-4A)</option>
              )}
            </select>
          </div>

          {/* Action Buttons: Export PDF, Excel, and Add Student */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setAddStudentError(null);
                setAddStudentSuccess(null);
                setShowAddStudentModal(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-all flex items-center space-x-1.5 shadow-sm"
              title="Daftarkan Mahasiswa Baru Resmi ke Database BAAK"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ Mahasiswa Baru (BAAK)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-all flex items-center space-x-1.5 shadow-sm"
              title="Unduh Laporan Resmi Format PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>Ekspor PDF Resmi</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center space-x-1.5 shadow-sm"
              title="Unduh Spreadsheet Format Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleClearAllAttendances}
              disabled={isDeleting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-all flex items-center space-x-1.5 shadow-sm"
              title="Hapus riwayat absensi agar kelas siap dipakai lagi dari awal"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Hapus Riwayat Absen</span>
            </button>

            <button
              onClick={loadReports}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {recapData?.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Total Mahasiswa Kelas</span>
            <div className="text-3xl font-black text-white">{recapData.stats.totalStudents} Mahasiswa</div>
            <span className="text-[10px] text-slate-500 mt-2 block">Kelas TI-4A Reguler</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Rata-Rata Kehadiran Kelas</span>
            <div className="text-3xl font-black text-cyan-400">{recapData.stats.averagePercentage}%</div>
            <span className="text-[10px] text-slate-500 mt-2 block">Pertemuan 1 sampai 8</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Memenuhi Syarat Ujian (≥75%)</span>
            <div className="text-3xl font-black text-emerald-400">{recapData.stats.eligibleCount} Mahasiswa</div>
            <span className="text-[10px] text-emerald-500/80 mt-2 block">Siap Mengikuti Ujian Akhir</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Peringatan Ujian (&lt;75%)</span>
            <div className="text-3xl font-black text-rose-400">{recapData.stats.notEligibleCount} Mahasiswa</div>
            <span className="text-[10px] text-rose-400/80 mt-2 block">Perlu Bimbingan & Konfirmasi Dosen</span>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: REKAP KEHADIRAN & SYARAT UJIAN */}
      {activeSubTab === 'rekap' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama mahasiswa atau NIM..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1.5 text-xs bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Semua ({recapData?.recap?.length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('ELIGIBLE')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'ELIGIBLE' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Lolos Ujian
              </button>
              <button
                onClick={() => setStatusFilter('NOT_ELIGIBLE')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === 'NOT_ELIGIBLE' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                Kurang Dari 75%
              </button>
            </div>
          </div>

          {/* Detailed Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4 text-center">Hadir</th>
                  <th className="py-3 px-4 text-center">Terlambat</th>
                  <th className="py-3 px-4 text-center">Alpha</th>
                  <th className="py-3 px-4 text-center">Persentase</th>
                  <th className="py-3 px-4 text-center">Syarat Mengikuti Ujian</th>
                  <th className="py-3 px-4 text-center">Riwayat Absen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <React.Fragment key={student.studentId}>
                      <tr className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{student.name}</div>
                          <div className="text-[11px] font-mono text-cyan-400">{student.nim}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {student.prodi} ({student.kelas})
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                          {student.presentCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                          {student.lateCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-rose-400">
                          {student.absentCount}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-bold text-white font-mono">{student.percentage}%</div>
                          <div className="w-16 mx-auto bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-700">
                            <div
                              className={`h-full ${student.isEligibleForExam ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${student.percentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {student.isEligibleForExam ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>MEMENUHI SYARAT</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>TIDAK MEMENUHI (&lt;75%)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setExpandedStudentNim(expandedStudentNim === student.nim ? null : student.nim)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all inline-flex items-center space-x-1.5 ${
                              expandedStudentNim === student.nim
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                                : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border-slate-700/80 hover:text-white'
                            }`}
                          >
                            <span>Riwayat ({student.records?.length || 0})</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedStudentNim === student.nim ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Riwayat Detail Row */}
                      {expandedStudentNim === student.nim && (
                        <tr className="bg-slate-950/90 border-b border-blue-500/30">
                          <td colSpan="9" className="p-4">
                            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                                <div className="flex items-center space-x-2">
                                  <History className="w-4 h-4 text-cyan-400" />
                                  <h4 className="font-bold text-white text-xs">
                                    Detail Riwayat Presensi Wajah: {student.name} ({student.nim})
                                  </h4>
                                </div>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {student.presentCount} Hadir Tepat Waktu • {student.lateCount} Terlambat • {student.absentCount} Alpha
                                </span>
                              </div>

                              {student.records && student.records.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                  {student.records.map((rec) => (
                                    <div
                                      key={rec.id}
                                      className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2 hover:border-slate-700 transition-all"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-cyan-300 text-[10px] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                                          Pertemuan #{rec.meetingNumber}
                                        </span>
                                        <div className="flex items-center space-x-1.5">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            rec.status === 'HADIR'
                                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                          }`}>
                                            {rec.status}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteSingleAttendance(rec.id, student.name, rec.meetingNumber)}
                                            className="p-1 rounded hover:bg-rose-950 text-rose-400 hover:text-rose-200 transition-colors"
                                            title={`Hapus rekaman absensi Pertemuan #${rec.meetingNumber}`}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="text-[11px] space-y-1 text-slate-300">
                                        <div className="flex items-center justify-between text-slate-400">
                                          <span>Waktu:</span>
                                          <span className="font-mono text-slate-200">{rec.date} • {rec.time}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-slate-400">Kemiripan:</span>
                                          <span className="font-mono font-bold text-emerald-400">{rec.similarity}% Match</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-slate-400">Liveness:</span>
                                          <span className="text-emerald-300 flex items-center space-x-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                            <span>Lolos (Kedip/Senyum)</span>
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                                          <span>Geofence GPS:</span>
                                          <span className="text-emerald-400">Lab AI Gd C (~25m)</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-xs text-slate-500 italic">
                                  Belum ada rekaman kehadiran untuk mahasiswa ini pada mata kuliah ini.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-500">
                      Tidak ditemukan mahasiswa sesuai pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: RIWAYAT ABSENSI REAL-TIME */}
      {activeSubTab === 'riwayat' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Log Riwayat Presensi Real-Time Perkuliahan</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rekaman historis kehadiran biometrik wajah per sesi. Dosen dapat menghapus rekaman absensi atau mereset pendaftaran untuk mengulang sesi.
              </p>
            </div>

            {/* Action Buttons for Dosen */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClearAllAttendances}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 transition-all flex items-center space-x-1.5 shadow-sm"
                title="Hapus seluruh riwayat absensi agar pertemuan siap digunakan lagi"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Hapus Semua Riwayat Absen</span>
              </button>

              <button
                type="button"
                onClick={handleResetAllEnrollments}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 transition-all flex items-center space-x-1.5 shadow-sm"
                title="Reset pendaftaran wajah semua mahasiswa agar dapat mendaftar mandiri dengan wajah asli masing-masing"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reset Pendaftaran Wajah Semua Mahasiswa</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="text-xs text-slate-400 font-medium">
              Filter Riwayat:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={riwayatFilterNim}
                onChange={e => setRiwayatFilterNim(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">Semua Mahasiswa ({recapData?.recap?.length || 5})</option>
                {(recapData?.recap || []).map(s => (
                  <option key={s.nim} value={s.nim}>{s.name} ({s.nim})</option>
                ))}
              </select>

              <select
                value={riwayatFilterStatus}
                onChange={e => setRiwayatFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">Semua Status Kehadiran</option>
                <option value="HADIR">Hadir Tepat Waktu</option>
                <option value="TERLAMBAT">Terlambat</option>
              </select>
            </div>
          </div>

          {/* Master Attendances Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Pertemuan</th>
                  <th className="py-3 px-4">Waktu Presensi</th>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">Mata Kuliah</th>
                  <th className="py-3 px-4 text-center">Kemiripan Wajah</th>
                  <th className="py-3 px-4 text-center">Liveness & GPS</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Alamat IP</th>
                  <th className="py-3 px-4 text-center">Aksi Dosen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {(() => {
                  const allRecords = [];
                  (recapData?.recap || []).forEach(stu => {
                    (stu.records || []).forEach(rec => {
                      allRecords.push({ ...rec, studentName: stu.name, studentNim: stu.nim });
                    });
                  });
                  allRecords.sort((a, b) => b.meetingNumber - a.meetingNumber);

                  const filtered = allRecords.filter(r => {
                    if (riwayatFilterNim !== 'ALL' && r.studentNim !== riwayatFilterNim) return false;
                    if (riwayatFilterStatus !== 'ALL' && r.status !== riwayatFilterStatus) return false;
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-slate-500">
                          Belum ada riwayat absensi yang cocok dengan filter.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((rec, idx) => (
                    <tr key={rec.id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        #{rec.meetingNumber}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{rec.date}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rec.time} WIB</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{rec.studentName}</div>
                        <div className="text-[10px] font-mono text-cyan-400">{rec.studentNim}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {recapData?.course?.name || 'Kecerdasan Buatan & ML'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-400">
                          {rec.similarity}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1 text-emerald-300 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Lolos & Kampus Valid</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rec.status === 'HADIR'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                        {rec.ip || '192.168.10.45'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleAttendance(rec.id, rec.studentName, rec.meetingNumber)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-all shadow-sm"
                          title={`Hapus absensi Pertemuan #${rec.meetingNumber} milik ${rec.studentName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT TRAIL LOGS */}
      {activeSubTab === 'audit' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Audit Trail Keamanan & Percobaan Absensi</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mencatat setiap request absensi, skor kemiripan wajah, alamat IP, dan deteksi keaslian (anti-spoofing).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aktivitas</th>
                  <th className="py-3 px-4">Pengguna / NIM</th>
                  <th className="py-3 px-4">Skor Kemiripan</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      <span className="block text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{log.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">{log.identifier}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {log.similarityScore !== null ? (
                        <span className={`font-bold ${log.similarityScore >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.similarityScore}%
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ip}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: KONTROL SESI JADWAL KULIAH */}
      {activeSubTab === 'jadwal' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Kontrol Sesi Presensi Perkuliahan</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dosen dapat membuka atau menutup sesi absensi mahasiswa secara real-time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-cyan-300 font-bold">{sch.courseCode}</span>
                    <span className="text-[10px] text-slate-400">Pertemuan #{sch.meetingNumber}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{sch.courseName}</h3>
                  <p className="text-xs text-slate-400 mb-3">{sch.room} ({sch.startTime} - {sch.endTime})</p>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1 mb-4 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kehadiran:</span>
                      <span className="text-emerald-400 font-bold">{sch.totalAttendees} Mhs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tepat Waktu:</span>
                      <span className="text-slate-300">{sch.presentCount} Mhs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${sch.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-xs font-semibold text-slate-200">
                      {sch.isOpen ? 'Sesi Terbuka' : 'Sesi Ditutup'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleSchedule(sch.id, sch.isOpen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sch.isOpen
                        ? 'bg-rose-600/30 text-rose-300 hover:bg-rose-600/50 border border-rose-500/40'
                        : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40'
                    }`}
                  >
                    {sch.isOpen ? 'Tutup Sesi' : 'Buka Sesi'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MASTER DATA MAHASISWA (BIRO BAAK) */}
      {activeSubTab === 'mahasiswa' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-base">
                  Master Data Mahasiswa (Biro Administrasi Akademik - BAAK)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola data akun mahasiswa resmi, status pendaftaran wajah biometrik (3 sudut), dan pendaftaran mahasiswa baru.
              </p>
            </div>

            <button
              onClick={() => {
                setAddStudentError(null);
                setAddStudentSuccess(null);
                setShowAddStudentModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 shrink-0"
            >
              <Users className="w-4 h-4" />
              <span>+ Tambah Mahasiswa Baru (BAAK)</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">NIM</th>
                  <th className="px-4 py-3">Nama Mahasiswa</th>
                  <th className="px-4 py-3">Program Studi & Kelas</th>
                  <th className="px-4 py-3">Status Biometrik Wajah</th>
                  <th className="px-4 py-3">Waktu Pendaftaran</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {studentsList.length > 0 ? (
                  studentsList.map((stu, idx) => (
                    <tr key={stu.id || stu.identifier} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-cyan-300">{stu.identifier}</td>
                      <td className="px-4 py-3 font-semibold text-white">{stu.name}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {stu.prodi} • {stu.kelas || 'TI-4A'} (Sem {stu.semester || 5})
                      </td>
                      <td className="px-4 py-3">
                        {stu.faceEnrolled ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Wajah Terdaftar (Enrolled)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Menunggu Scan Wajah</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">
                        {stu.enrolledAt ? new Date(stu.enrolledAt).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(stu.identifier, stu.name)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-medium transition-all"
                          title="Hapus data mahasiswa dari BAAK"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      Belum ada data mahasiswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH MAHASISWA BARU OLEH BAAK */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5 relative z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Registrasi Mahasiswa Baru (BAAK)</h3>
                  <p className="text-xs text-slate-400">Penerbitan akun akademik USINDO resmi</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Alert Messages */}
            {addStudentError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{addStudentError}</span>
              </div>
            )}
            {addStudentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{addStudentSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddStudent} className="space-y-3.5 relative z-10 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap Mahasiswa <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStudentData.name}
                  onChange={e => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
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
                  value={newStudentData.identifier}
                  onChange={e => setNewStudentData({ ...newStudentData, identifier: e.target.value })}
                  placeholder="Contoh: 240131030"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Program Studi</label>
                  <input
                    type="text"
                    value={newStudentData.prodi}
                    onChange={e => setNewStudentData({ ...newStudentData, prodi: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={newStudentData.kelas}
                    onChange={e => setNewStudentData({ ...newStudentData, kelas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Semester</label>
                  <input
                    type="number"
                    value={newStudentData.semester}
                    onChange={e => setNewStudentData({ ...newStudentData, semester: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kata Sandi Awal</label>
                  <input
                    type="text"
                    value={newStudentData.password}
                    onChange={e => setNewStudentData({ ...newStudentData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {isSubmittingStudent ? 'Menyimpan...' : 'Daftarkan Mahasiswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
