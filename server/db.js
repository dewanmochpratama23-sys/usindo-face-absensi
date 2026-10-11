import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

// Helper to generate a normalized 128-d reference vector for demo students
function generateSeedEmbedding(seed) {
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    const val = Math.sin(seed * 1000 + i * 17) * 0.5 + Math.cos(seed * 200 + i * 3) * 0.5;
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map(v => Number((v / norm).toFixed(6)));
}

const defaultData = {
  users: [
    // 1. Dewan Moch Pratama (240131009)
    {
      id: 'USR-01',
      identifier: '240131009',
      name: 'Dewan Moch Pratama',
      email: 'dewan.pratama@mhs.usindo.ac.id',
      role: 'mahasiswa',
      prodi: 'Teknik Informatika',
      semester: 5,
      kelas: 'TI-4A',
      passwordHash: bcrypt.hashSync('usindomaju01', 10),
      faceEnrolled: false,
      enrolledAt: null,
      faceEmbeddings: null
    },
    // 2. Fakhri Fadhlurrahman (240131012)
    {
      id: 'USR-02',
      identifier: '240131012',
      name: 'Fakhri Fadhlurrahman',
      email: 'fakhri.fadhlurrahman@mhs.usindo.ac.id',
      role: 'mahasiswa',
      prodi: 'Teknik Informatika',
      semester: 5,
      kelas: 'TI-4A',
      passwordHash: bcrypt.hashSync('usindomaju01', 10),
      faceEnrolled: false,
      enrolledAt: null,
      faceEmbeddings: null
    },
    // 3. Muhammad Falah (240131019)
    {
      id: 'USR-03',
      identifier: '240131019',
      name: 'Muhammad Falah',
      email: 'muhammad.falah@mhs.usindo.ac.id',
      role: 'mahasiswa',
      prodi: 'Teknik Informatika',
      semester: 5,
      kelas: 'TI-4A',
      passwordHash: bcrypt.hashSync('usindomaju01', 10),
      faceEnrolled: false,
      enrolledAt: null,
      faceEmbeddings: null
    },
    // 4. Rival Setiawan (240131025)
    {
      id: 'USR-04',
      identifier: '240131025',
      name: 'Rival Setiawan',
      email: 'rival.setiawan@mhs.usindo.ac.id',
      role: 'mahasiswa',
      prodi: 'Teknik Informatika',
      semester: 5,
      kelas: 'TI-4A',
      passwordHash: bcrypt.hashSync('usindomaju01', 10),
      faceEnrolled: false,
      enrolledAt: null,
      faceEmbeddings: null
    },
    // 5. Hasan Hariri (230131001)
    {
      id: 'USR-05',
      identifier: '230131001',
      name: 'Hasan Hariri',
      email: 'hasan.hariri@mhs.usindo.ac.id',
      role: 'mahasiswa',
      prodi: 'Teknik Informatika',
      semester: 5,
      kelas: 'TI-4A',
      passwordHash: bcrypt.hashSync('usindomaju01', 10),
      faceEnrolled: false,
      enrolledAt: null,
      faceEmbeddings: null
    },
    // Dosen Pengampu
    {
      id: 'USR-DOSEN',
      identifier: '19850101',
      name: 'Bapak ANDRIYANA S.T., M.Kom.',
      email: 'andriyana@usindo.ac.id',
      role: 'dosen',
      prodi: 'Teknik Informatika',
      passwordHash: bcrypt.hashSync('usindomaju01', 10),
      faceEnrolled: true,
      faceEmbeddings: {
        front: generateSeedEmbedding(19850101),
        left: generateSeedEmbedding(19850101 + 37),
        right: generateSeedEmbedding(19850101 + 74)
      }
    },
    // Admin BAAK
    {
      id: 'USR-ADMIN',
      identifier: 'admin',
      name: 'Biro Administrasi Akademik (BAAK)',
      email: 'admin.akademik@usindo.ac.id',
      role: 'admin',
      prodi: 'Bagian Akademik & Kemahasiswaan',
      passwordHash: bcrypt.hashSync('admin123', 10),
      faceEnrolled: true
    }
  ],

  courses: [
    {
      id: 'MK-101',
      code: 'TIF401',
      name: 'Kecerdasan Buatan & Machine Learning',
      sks: 3,
      lecturerId: 'USR-DOSEN',
      lecturerName: 'Bapak ANDRIYANA S.T., M.Kom.',
      class: 'TI-4A',
      semester: 5,
      totalMeetings: 14
    },
    {
      id: 'MK-102',
      code: 'TIF402',
      name: 'Pemrograman Web Berbasis Komponen',
      sks: 3,
      lecturerId: 'USR-DOSEN',
      lecturerName: 'Bapak ANDRIYANA S.T., M.Kom.',
      class: 'TI-4A',
      semester: 5,
      totalMeetings: 14
    },
    {
      id: 'MK-103',
      code: 'SIF405',
      name: 'Keamanan Siber & Forensik Digital',
      sks: 3,
      lecturerId: 'USR-DOSEN',
      lecturerName: 'Bapak ANDRIYANA S.T., M.Kom.',
      class: 'TI-4A',
      semester: 5,
      totalMeetings: 14
    }
  ],

  schedules: [
    {
      id: 'SCH-01',
      courseId: 'MK-101',
      courseName: 'Kecerdasan Buatan & Machine Learning',
      courseCode: 'TIF401',
      class: 'TI-4A',
      lecturerName: 'Bapak ANDRIYANA S.T., M.Kom.',
      day: 'Sabtu',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '11:00',
      room: 'Lab AI & Robotika Gedung C Lt. 3',
      toleranceMinutes: 20,
      meetingNumber: 8,
      isOpen: true,
      campusLocation: {
        name: 'Kampus Terpadu USINDO',
        lat: -6.200000,
        lng: 106.816666,
        radiusMeters: 250
      }
    },
    {
      id: 'SCH-02',
      courseId: 'MK-102',
      courseName: 'Pemrograman Web Berbasis Komponen',
      courseCode: 'TIF402',
      class: 'TI-4A',
      lecturerName: 'Bapak ANDRIYANA S.T., M.Kom.',
      day: 'Sabtu',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:15',
      endTime: '14:15',
      room: 'Lab Pemrograman Gedung B Lt. 2',
      toleranceMinutes: 15,
      meetingNumber: 8,
      isOpen: true,
      campusLocation: {
        name: 'Kampus Terpadu USINDO',
        lat: -6.200000,
        lng: 106.816666,
        radiusMeters: 250
      }
    },
    {
      id: 'SCH-03',
      courseId: 'MK-103',
      courseName: 'Keamanan Siber & Forensik Digital',
      courseCode: 'SIF405',
      class: 'TI-4A',
      lecturerName: 'Bapak ANDRIYANA S.T., M.Kom.',
      day: 'Sabtu',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:30',
      endTime: '17:00',
      room: 'Ruang Teori 301 Gedung A Lt. 3',
      toleranceMinutes: 15,
      meetingNumber: 8,
      isOpen: false,
      campusLocation: {
        name: 'Kampus Terpadu USINDO',
        lat: -6.200000,
        lng: 106.816666,
        radiusMeters: 250
      }
    }
  ],

  // Historical attendance records (Pertemuan 1 - 7)
  attendances: [
    // 1. Dewan Moch Pratama (240131009) - Rajin 7/7 (100% - Memenuhi Syarat Ujian)
    { id: 'ATT-101', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 1, date: '2026-02-14', time: '08:05:22', status: 'HADIR', similarity: 96.4, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },
    { id: 'ATT-102', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 2, date: '2026-02-21', time: '08:07:11', status: 'HADIR', similarity: 95.8, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },
    { id: 'ATT-103', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 3, date: '2026-02-28', time: '08:12:04', status: 'HADIR', similarity: 97.1, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },
    { id: 'ATT-104', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 4, date: '2026-03-07', time: '08:24:19', status: 'TERLAMBAT', similarity: 94.9, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },
    { id: 'ATT-105', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 5, date: '2026-03-14', time: '08:02:50', status: 'HADIR', similarity: 98.0, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },
    { id: 'ATT-106', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 6, date: '2026-03-21', time: '08:09:12', status: 'HADIR', similarity: 95.2, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },
    { id: 'ATT-107', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-01', studentNim: '240131009', studentName: 'Dewan Moch Pratama', meetingNumber: 7, date: '2026-03-28', time: '08:06:40', status: 'HADIR', similarity: 96.6, livenessPassed: true, geofencePassed: true, ip: '192.168.10.45' },

    // 2. Rival Setiawan (240131025) - Hadir 6/7 (85.7% - Memenuhi Syarat Ujian)
    { id: 'ATT-201', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-04', studentNim: '240131025', studentName: 'Rival Setiawan', meetingNumber: 1, date: '2026-02-14', time: '08:03:11', status: 'HADIR', similarity: 94.2, livenessPassed: true, geofencePassed: true, ip: '192.168.10.60' },
    { id: 'ATT-202', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-04', studentNim: '240131025', studentName: 'Rival Setiawan', meetingNumber: 2, date: '2026-02-21', time: '08:05:43', status: 'HADIR', similarity: 93.8, livenessPassed: true, geofencePassed: true, ip: '192.168.10.60' },
    { id: 'ATT-203', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-04', studentNim: '240131025', studentName: 'Rival Setiawan', meetingNumber: 3, date: '2026-02-28', time: '08:18:20', status: 'TERLAMBAT', similarity: 95.5, livenessPassed: true, geofencePassed: true, ip: '192.168.10.60' },
    { id: 'ATT-204', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-04', studentNim: '240131025', studentName: 'Rival Setiawan', meetingNumber: 4, date: '2026-03-07', time: '08:08:02', status: 'HADIR', similarity: 96.1, livenessPassed: true, geofencePassed: true, ip: '192.168.10.60' },
    { id: 'ATT-205', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-04', studentNim: '240131025', studentName: 'Rival Setiawan', meetingNumber: 5, date: '2026-03-14', time: '08:10:15', status: 'HADIR', similarity: 94.7, livenessPassed: true, geofencePassed: true, ip: '192.168.10.60' },
    { id: 'ATT-206', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-04', studentNim: '240131025', studentName: 'Rival Setiawan', meetingNumber: 7, date: '2026-03-28', time: '08:04:19', status: 'HADIR', similarity: 96.0, livenessPassed: true, geofencePassed: true, ip: '192.168.10.60' },

    // 3. Hasan Hariri (230131001) - Hadir 6/7 (85.7% - Memenuhi Syarat Ujian)
    { id: 'ATT-301', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-05', studentNim: '230131001', studentName: 'Hasan Hariri', meetingNumber: 1, date: '2026-02-14', time: '08:04:00', status: 'HADIR', similarity: 95.1, livenessPassed: true, geofencePassed: true, ip: '192.168.10.70' },
    { id: 'ATT-302', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-05', studentNim: '230131001', studentName: 'Hasan Hariri', meetingNumber: 2, date: '2026-02-21', time: '08:08:12', status: 'HADIR', similarity: 94.4, livenessPassed: true, geofencePassed: true, ip: '192.168.10.70' },
    { id: 'ATT-303', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-05', studentNim: '230131001', studentName: 'Hasan Hariri', meetingNumber: 4, date: '2026-03-07', time: '08:09:44', status: 'HADIR', similarity: 96.0, livenessPassed: true, geofencePassed: true, ip: '192.168.10.70' },
    { id: 'ATT-304', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-05', studentNim: '230131001', studentName: 'Hasan Hariri', meetingNumber: 5, date: '2026-03-14', time: '08:11:05', status: 'HADIR', similarity: 93.9, livenessPassed: true, geofencePassed: true, ip: '192.168.10.70' },
    { id: 'ATT-305', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-05', studentNim: '230131001', studentName: 'Hasan Hariri', meetingNumber: 6, date: '2026-03-21', time: '08:05:30', status: 'HADIR', similarity: 97.2, livenessPassed: true, geofencePassed: true, ip: '192.168.10.70' },
    { id: 'ATT-306', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-05', studentNim: '230131001', studentName: 'Hasan Hariri', meetingNumber: 7, date: '2026-03-28', time: '08:07:50', status: 'HADIR', similarity: 96.8, livenessPassed: true, geofencePassed: true, ip: '192.168.10.70' },

    // 4. Fakhri Fadhlurrahman (240131012) - Hadir 4/7 (57.1% - Peringatan Syarat Ujian < 75%)
    { id: 'ATT-401', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-02', studentNim: '240131012', studentName: 'Fakhri Fadhlurrahman', meetingNumber: 1, date: '2026-02-14', time: '08:10:00', status: 'HADIR', similarity: 93.1, livenessPassed: true, geofencePassed: true, ip: '192.168.10.72' },
    { id: 'ATT-402', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-02', studentNim: '240131012', studentName: 'Fakhri Fadhlurrahman', meetingNumber: 3, date: '2026-02-28', time: '08:09:12', status: 'HADIR', similarity: 92.8, livenessPassed: true, geofencePassed: true, ip: '192.168.10.72' },
    { id: 'ATT-403', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-02', studentNim: '240131012', studentName: 'Fakhri Fadhlurrahman', meetingNumber: 5, date: '2026-03-14', time: '08:29:44', status: 'TERLAMBAT', similarity: 94.0, livenessPassed: true, geofencePassed: true, ip: '192.168.10.72' },
    { id: 'ATT-404', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-02', studentNim: '240131012', studentName: 'Fakhri Fadhlurrahman', meetingNumber: 7, date: '2026-03-28', time: '08:11:05', status: 'HADIR', similarity: 93.5, livenessPassed: true, geofencePassed: true, ip: '192.168.10.72' },

    // 5. Muhammad Falah (240131019) - Hadir 3/7 (42.9% - Peringatan Syarat Ujian < 75%)
    { id: 'ATT-501', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-03', studentNim: '240131019', studentName: 'Muhammad Falah', meetingNumber: 1, date: '2026-02-14', time: '08:15:30', status: 'HADIR', similarity: 92.5, livenessPassed: true, geofencePassed: true, ip: '192.168.10.80' },
    { id: 'ATT-502', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-03', studentNim: '240131019', studentName: 'Muhammad Falah', meetingNumber: 4, date: '2026-03-07', time: '08:26:10', status: 'TERLAMBAT', similarity: 93.2, livenessPassed: true, geofencePassed: true, ip: '192.168.10.80' },
    { id: 'ATT-503', scheduleId: 'SCH-01', courseId: 'MK-101', studentId: 'USR-03', studentNim: '240131019', studentName: 'Muhammad Falah', meetingNumber: 7, date: '2026-03-28', time: '08:08:50', status: 'HADIR', similarity: 94.1, livenessPassed: true, geofencePassed: true, ip: '192.168.10.80' }
  ],

  // Security audit trail logs
  auditLogs: [
    {
      id: 'AUD-001',
      timestamp: '2026-03-28T08:06:40.000Z',
      action: 'ABSENSI_HARIAN',
      identifier: '240131009',
      name: 'Dewan Moch Pratama',
      role: 'mahasiswa',
      status: 'SUCCESS',
      similarityScore: 96.6,
      ip: '192.168.10.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/134.0',
      details: 'Absensi sukses MK-101 Pertemuan 7. Liveness & Geofencing valid.'
    },
    {
      id: 'AUD-002',
      timestamp: '2026-03-28T08:05:10.000Z',
      action: 'ABSENSI_GAGAL',
      identifier: '240131009',
      name: 'Dewan Moch Pratama',
      role: 'mahasiswa',
      status: 'REJECTED',
      similarityScore: 61.2,
      ip: '192.168.10.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/134.0',
      details: 'Pencocokan wajah gagal: Kemiripan 61.2% di bawah ambang batas (85%). Wajah terhalang / tidak cocok.'
    },
    {
      id: 'AUD-003',
      timestamp: '2026-03-01T08:30:00.000Z',
      action: 'ENROLLMENT_WAJAH',
      identifier: '240131009',
      name: 'Dewan Moch Pratama',
      role: 'mahasiswa',
      status: 'SUCCESS',
      similarityScore: null,
      ip: '192.168.1.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/134.0',
      details: 'Pendaftaran 3 sudut wajah (Depan, Kiri, Kanan) berhasil. 128-d vektor referensi dienkripsi dan disimpan. Foto mentah dihapus.'
    }
  ]
};

class Database {
  constructor() {
    this.data = defaultData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // If file had older student identifiers, refresh with requested students
        if (parsed.users && parsed.users.some(u => u.identifier === '240131009')) {
          this.data = parsed;
        } else {
          this.data = defaultData;
          this.save();
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error reading db file, using default data:', err);
      this.data = defaultData;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db file:', err);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, predicate) {
    const coll = this.get(collection);
    return coll.find(predicate);
  }

  filter(collection, predicate) {
    const coll = this.get(collection);
    return coll.filter(predicate);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, predicate, updater) {
    const index = (this.data[collection] || []).findIndex(predicate);
    if (index !== -1) {
      this.data[collection][index] = {
        ...this.data[collection][index],
        ...updater
      };
      this.save();
      return this.data[collection][index];
    }
    return null;
  }

  remove(collection, predicate) {
    if (!this.data[collection]) return 0;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => !predicate(item));
    const removedCount = initialLen - this.data[collection].length;
    if (removedCount > 0) {
      this.save();
    }
    return removedCount;
  }

  updateAll(collection, predicate, updater) {
    if (!this.data[collection]) return 0;
    let count = 0;
    this.data[collection] = this.data[collection].map(item => {
      if (predicate(item)) {
        count++;
        return { ...item, ...updater };
      }
      return item;
    });
    if (count > 0) {
      this.save();
    }
    return count;
  }

  logAudit({ action, identifier, name, role, status, similarityScore = null, ip = '127.0.0.1', userAgent = 'Unknown', details = '' }) {
    const audit = {
      id: 'AUD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase(),
      timestamp: new Date().toISOString(),
      action,
      identifier,
      name,
      role,
      status,
      similarityScore,
      ip,
      userAgent,
      details
    };
    this.insert('auditLogs', audit);
    return audit;
  }
}

export const db = new Database();
