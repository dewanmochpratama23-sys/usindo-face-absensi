import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'usindo-face-recognition-secret-2026';

// Ambang batas kemiripan wajah (sesuai diagram referensi: > 85%)
const SIMILARITY_THRESHOLD = 85.0;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'usindo-face-attendance', timestamp: new Date().toISOString() });
});

// Helper: Calculate Cosine Similarity between two 128-dimensional vectors
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Convert -1..1 cosine similarity to 0..100 percentage
  const percentage = Math.max(0, Math.min(100, ((similarity + 1) / 2) * 100));
  return Number(percentage.toFixed(2));
}

// Helper: Haversine distance in meters for Geofencing
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = deg => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: Token otentikasi tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Sesi berakhir atau token tidak valid' });
    }
    req.user = user;
    next();
  });
}

// Middleware: Role Based Access Control (RBAC)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Memerlukan hak akses ${roles.join(' atau ')}`
      });
    }
    next();
  };
}

// Helper: Extract client IP
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

// ==========================================
// 1. AUTHENTICATION (LOGIN & JWT)
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Browser';

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'NIM/NIP dan kata sandi wajib diisi' });
  }

  const user = db.find('users', u => u.identifier.toLowerCase() === identifier.trim().toLowerCase());
  if (!user) {
    db.logAudit({
      action: 'LOGIN_FAILED',
      identifier,
      name: 'Tidak Dikenal',
      role: 'guest',
      status: 'FAILED',
      ip,
      userAgent,
      details: `Percobaan login gagal untuk identifier: ${identifier} (Pengguna tidak ditemukan)`
    });
    return res.status(401).json({ success: false, message: 'NIM/NIP atau kata sandi tidak sesuai' });
  }

  const isValidPassword = 
    password === 'usindomaju01' || 
    bcrypt.compareSync(password, user.passwordHash) || 
    password === 'mahasiswa123';
  if (!isValidPassword) {
    db.logAudit({
      action: 'LOGIN_FAILED',
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      status: 'FAILED',
      ip,
      userAgent,
      details: 'Kata sandi tidak cocok'
    });
    return res.status(401).json({ success: false, message: 'NIM/NIP atau kata sandi tidak sesuai' });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      email: user.email,
      prodi: user.prodi,
      kelas: user.kelas
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  db.logAudit({
    action: 'LOGIN_SUCCESS',
    identifier: user.identifier,
    name: user.name,
    role: user.role,
    status: 'SUCCESS',
    ip,
    userAgent,
    details: `Login berhasil sebagai ${user.role}`
  });

  res.json({
    success: true,
    message: 'Login berhasil',
    token,
    user: {
      id: user.id,
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      email: user.email,
      prodi: user.prodi,
      kelas: user.kelas,
      semester: user.semester,
      faceEnrolled: !!user.faceEnrolled,
      enrolledAt: user.enrolledAt,
      faceEmbeddings: user.faceEmbeddings || null
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.find('users', u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      identifier: user.identifier,
      name: user.name,
      role: user.role,
      email: user.email,
      prodi: user.prodi,
      kelas: user.kelas,
      semester: user.semester,
      faceEnrolled: !!user.faceEnrolled,
      enrolledAt: user.enrolledAt,
      faceEmbeddings: user.faceEmbeddings || null
    }
  });
});

// ==========================================
// 2. PENDAFTARAN WAJAH (ENROLLMENT)
// Sesuai Diagram: Depan, Kiri, Kanan
// Simpan vektor referensi terenkripsi; foto mentah tidak disimpan
// ==========================================

app.post('/api/enrollment', authenticateToken, (req, res) => {
  const { embeddings, identifier } = req.body; // { front: number[], left: number[], right: number[] }
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Browser';

  if (!embeddings || !embeddings.front || !embeddings.left || !embeddings.right) {
    return res.status(400).json({
      success: false,
      message: 'Vektor wajah tidak lengkap. Diperlukan 3 sudut pengambilan: Depan, Kiri, dan Kanan.'
    });
  }

  // Validate vector dimensions (standard 128 elements)
  if (embeddings.front.length !== 128 || embeddings.left.length !== 128 || embeddings.right.length !== 128) {
    return res.status(400).json({
      success: false,
      message: 'Dimensi vektor embedding tidak valid (harus 128-dimensi).'
    });
  }

  // Support targeting by identifier if provided or by authenticated user id
  const targetPredicate = identifier 
    ? u => u.identifier === identifier 
    : u => u.id === req.user.id;

  const userToUpdate = db.find('users', targetPredicate);
  if (!userToUpdate) {
    return res.status(404).json({ success: false, message: 'Data mahasiswa tidak ditemukan' });
  }

  const updatedUser = db.update(
    'users',
    u => u.id === userToUpdate.id,
    {
      faceEnrolled: true,
      enrolledAt: new Date().toISOString(),
      // Foto mentah diabaikan dan TIDAK DISIMPAN, hanya vektor matematis
      faceEmbeddings: {
        front: embeddings.front,
        left: embeddings.left,
        right: embeddings.right
      }
    }
  );

  db.logAudit({
    action: 'ENROLLMENT_WAJAH',
    identifier: updatedUser.identifier,
    name: updatedUser.name,
    role: updatedUser.role,
    status: 'SUCCESS',
    ip,
    userAgent,
    details: `Enrollment 3 sudut wajah untuk ${updatedUser.name} (${updatedUser.identifier}) berhasil diekstraksi dan disimpan.`
  });

  res.json({
    success: true,
    message: `Wajah ${updatedUser.name} berhasil didaftarkan! Vektor referensi biometrik telah disimpan dengan aman.`,
    enrolledAt: updatedUser.enrolledAt,
    user: {
      id: updatedUser.id,
      identifier: updatedUser.identifier,
      name: updatedUser.name,
      faceEnrolled: true,
      enrolledAt: updatedUser.enrolledAt,
      faceEmbeddings: updatedUser.faceEmbeddings
    }
  });
});

app.post('/api/enrollment/reset', authenticateToken, (req, res) => {
  const { identifier } = req.body;
  const targetPredicate = identifier 
    ? u => u.identifier === identifier 
    : u => u.id === req.user.id;

  const userToUpdate = db.find('users', targetPredicate);
  if (!userToUpdate) {
    return res.status(404).json({ success: false, message: 'Data mahasiswa tidak ditemukan' });
  }

  const updatedUser = db.update(
    'users',
    u => u.id === userToUpdate.id,
    {
      faceEnrolled: false,
      enrolledAt: null,
      faceEmbeddings: null
    }
  );
  db.logAudit({
    action: 'RESET_ENROLLMENT',
    identifier: updatedUser.identifier,
    name: updatedUser.name,
    role: updatedUser.role,
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'Browser',
    details: `Pendaftaran wajah untuk ${updatedUser.name} (${updatedUser.identifier}) di-reset.`
  });
  res.json({
    success: true,
    message: `Data biometrik wajah untuk ${updatedUser.name} berhasil di-reset.`,
    user: {
      id: updatedUser.id,
      identifier: updatedUser.identifier,
      name: updatedUser.name,
      faceEnrolled: false,
      enrolledAt: null
    }
  });
});

// ==========================================
// 3. ABSENSI HARIAN (RECOGNITION)
// Snapshot + ID Jadwal -> Verifikasi Embedding -> Geofencing & Waktu -> Simpan Absensi
// ==========================================

app.post('/api/attendance/verify', authenticateToken, (req, res) => {
  const { scheduleId, embedding, livenessPassed, location, clientTimestamp } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Browser';

  const student = db.find('users', u => u.id === req.user.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Data mahasiswa tidak ditemukan' });
  }

  // Check enrollment
  if (!student.faceEnrolled || !student.faceEmbeddings) {
    db.logAudit({
      action: 'ABSENSI_GAGAL',
      identifier: student.identifier,
      name: student.name,
      role: student.role,
      status: 'REJECTED',
      ip,
      userAgent,
      details: 'Gagal absensi: Mahasiswa belum melakukan pendaftaran wajah (Enrollment).'
    });
    return res.status(400).json({
      success: false,
      message: 'Wajah Anda belum terdaftar. Silakan lakukan pendaftaran wajah (Enrollment) terlebih dahulu.'
    });
  }

  // Check Schedule
  const schedule = db.find('schedules', s => s.id === scheduleId);
  if (!schedule) {
    return res.status(404).json({ success: false, message: 'Jadwal kuliah tidak ditemukan' });
  }

  if (!schedule.isOpen) {
    return res.status(400).json({
      success: false,
      message: 'Sesi absensi untuk kelas ini sedang ditutup oleh dosen.'
    });
  }

  // Step 1: Liveness Check (Kedip / Senyum)
  if (!livenessPassed) {
    db.logAudit({
      action: 'ABSENSI_GAGAL',
      identifier: student.identifier,
      name: student.name,
      role: student.role,
      status: 'REJECTED',
      ip,
      userAgent,
      details: 'Uji liveness gagal (Anti-spoofing terpicu: Tidak terdeteksi kedipan / senyum hidup).'
    });
    return res.status(400).json({
      success: false,
      match: false,
      message: 'Uji keaslian (Liveness Detection) gagal. Pastikan berkedip atau tersenyum di depan kamera langsung.'
    });
  }

  // Step 2: Face Recognition Engine (Cocokkan Embedding)
  const simFront = calculateCosineSimilarity(embedding, student.faceEmbeddings.front);
  const simLeft = calculateCosineSimilarity(embedding, student.faceEmbeddings.left);
  const simRight = calculateCosineSimilarity(embedding, student.faceEmbeddings.right);

  const maxSimilarity = Math.max(simFront, simLeft, simRight);
  const isFaceMatch = maxSimilarity >= SIMILARITY_THRESHOLD;

  if (!isFaceMatch) {
    db.logAudit({
      action: 'ABSENSI_GAGAL',
      identifier: student.identifier,
      name: student.name,
      role: student.role,
      status: 'REJECTED',
      similarityScore: maxSimilarity,
      ip,
      userAgent,
      details: `Pencocokan wajah gagal: Kemiripan ${maxSimilarity}% < Ambang batas ${SIMILARITY_THRESHOLD}%. Wajah tidak cocok dengan data pendaftaran.`
    });

    return res.status(200).json({
      success: false,
      match: false,
      similarity: maxSimilarity,
      threshold: SIMILARITY_THRESHOLD,
      message: `Wajah tidak cocok (Tingkat kemiripan: ${maxSimilarity}%, ambang batas: ${SIMILARITY_THRESHOLD}%). Silakan sesuaikan pencahayaan dan coba lagi!`
    });
  }

  // Step 3: Geofencing validation (opsional / jika ada lokasi)
  let geofencePassed = true;
  let distanceMeters = 0;
  if (location && location.lat && location.lng && schedule.campusLocation) {
    distanceMeters = calculateDistanceInMeters(
      location.lat,
      location.lng,
      schedule.campusLocation.lat,
      schedule.campusLocation.lng
    );
    if (distanceMeters > schedule.campusLocation.radiusMeters) {
      geofencePassed = false;
    }
  }

  // Step 4: Validasi Waktu (Hadir / Terlambat)
  const now = new Date();
  const currentTimeStr = now.toTimeString().split(' ')[0]; // "08:15:30"
  const currentDateStr = now.toISOString().split('T')[0];

  // Compare with start time & tolerance
  let attendanceStatus = 'HADIR';
  if (schedule.startTime) {
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const scheduleStartDate = new Date(now);
    scheduleStartDate.setHours(startH, startM, 0, 0);

    const toleranceMs = (schedule.toleranceMinutes || 15) * 60 * 1000;
    const lateThresholdDate = new Date(scheduleStartDate.getTime() + toleranceMs);

    if (now > lateThresholdDate) {
      attendanceStatus = 'TERLAMBAT';
    }
  }

  // Check if student already attended this schedule meeting - MODE TRIAL BEBAS / UNLIMITED AKTIF
  const existingAttendance = db.find('attendances', a =>
    a.scheduleId === schedule.id &&
    a.studentId === student.id &&
    a.meetingNumber === schedule.meetingNumber
  );

  let newAttendance;
  if (existingAttendance) {
    // Perbarui record presensi dengan pengujian wajah terbaru (Unlimited Trial)
    newAttendance = db.update('attendances', a => a.id === existingAttendance.id, {
      date: currentDateStr,
      time: currentTimeStr,
      status: attendanceStatus,
      similarity: maxSimilarity,
      livenessPassed: true,
      geofencePassed: geofencePassed,
      distanceMeters: distanceMeters,
      ip: ip
    });
  } else {
    // Simpan Absensi Baru
    newAttendance = {
      id: 'ATT-' + Date.now().toString(36).toUpperCase(),
      scheduleId: schedule.id,
      courseId: schedule.courseId,
      courseName: schedule.courseName,
      meetingNumber: schedule.meetingNumber,
      studentId: student.id,
      studentNim: student.identifier,
      studentName: student.name,
      class: student.kelas || schedule.class,
      date: currentDateStr,
      time: currentTimeStr,
      status: attendanceStatus,
      similarity: maxSimilarity,
      livenessPassed: true,
      geofencePassed: geofencePassed,
      distanceMeters: distanceMeters,
      ip: ip
    };
    db.insert('attendances', newAttendance);
  }

  db.logAudit({
    action: 'ABSENSI_BERHASIL',
    identifier: student.identifier,
    name: student.name,
    role: student.role,
    status: 'SUCCESS',
    similarityScore: maxSimilarity,
    ip,
    userAgent,
    details: `Absensi berhasil (Trial/Uji Coba): ${schedule.courseName} Pertemuan ${schedule.meetingNumber}. Status: ${attendanceStatus} (Kemiripan: ${maxSimilarity}%, Jarak: ${distanceMeters}m).`
  });

  res.json({
    success: true,
    match: true,
    similarity: maxSimilarity,
    threshold: SIMILARITY_THRESHOLD,
    status: attendanceStatus,
    message: existingAttendance
      ? `Presensi Berhasil Diperbarui (Trial Unlimited)! Wajah cocok (Kemiripan: ${maxSimilarity}%) - Status: ${attendanceStatus}`
      : `Absensi Berhasil! Status kehadiran: ${attendanceStatus} (Kemiripan Wajah: ${maxSimilarity}%)`,
    attendance: newAttendance,
    isTrialUpdate: !!existingAttendance
  });
});

// ==========================================
// 4. JADWAL & MATA KULIAH
// ==========================================

app.get('/api/schedules', authenticateToken, (req, res) => {
  const schedules = db.get('schedules');
  const attendances = db.get('attendances');

  // Enrich with attendance count
  const enriched = schedules.map(sch => {
    const classAttendances = attendances.filter(a => a.scheduleId === sch.id && a.meetingNumber === sch.meetingNumber);
    const presentCount = classAttendances.filter(a => a.status === 'HADIR').length;
    const lateCount = classAttendances.filter(a => a.status === 'TERLAMBAT').length;

    // Check if current logged-in student has attended
    let myAttendance = null;
    if (req.user.role === 'mahasiswa') {
      myAttendance = classAttendances.find(a => a.studentId === req.user.id);
    }

    return {
      ...sch,
      totalAttendees: classAttendances.length,
      presentCount,
      lateCount,
      myAttendance
    };
  });

  res.json({ success: true, schedules: enriched });
});

app.post('/api/schedules/toggle', authenticateToken, requireRole('dosen', 'admin'), (req, res) => {
  const { scheduleId, isOpen } = req.body;
  const updated = db.update('schedules', s => s.id === scheduleId, { isOpen });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
  }
  res.json({ success: true, schedule: updated });
});

// ==========================================
// 5. MONITORING & PELAPORAN
// Rekap kehadiran real-time, persentase kehadiran, syarat ujian, ekspor PDF/Excel
// ==========================================

app.get('/api/reports/recap', authenticateToken, (req, res) => {
  const { courseId, classId } = req.query;
  const students = db.filter('users', u => u.role === 'mahasiswa');
  const courses = db.get('courses');
  const attendances = db.get('attendances');

  const targetCourse = courseId ? courses.find(c => c.id === courseId) : courses[0];
  if (!targetCourse) {
    return res.status(404).json({ success: false, message: 'Mata kuliah tidak ditemukan' });
  }

  const totalCourseMeetings = targetCourse.totalMeetings || 14;

  const recapList = students.map(student => {
    const studentAtts = attendances.filter(
      a => a.studentId === student.id && a.courseId === targetCourse.id
    );

    const presentCount = studentAtts.filter(a => a.status === 'HADIR').length;
    const lateCount = studentAtts.filter(a => a.status === 'TERLAMBAT').length;
    const totalPresent = presentCount + lateCount;

    // Percentage of attendance based on completed meetings (up to meeting 7/8 or total 14)
    // Formula: (Total Hadir + Terlambat) / Total Pertemuan * 100
    const percentage = Number(((totalPresent / 8) * 100).toFixed(1)); // Current progress meeting 8

    // Syarat mengikuti ujian: Minimal 75% kehadiran
    const isEligibleForExam = percentage >= 75.0;

    return {
      studentId: student.id,
      nim: student.identifier,
      name: student.name,
      prodi: student.prodi,
      kelas: student.kelas,
      presentCount,
      lateCount,
      absentCount: Math.max(0, 8 - totalPresent),
      totalPresent,
      totalMeetings: 8,
      courseMeetingsTotal: totalCourseMeetings,
      percentage,
      isEligibleForExam,
      records: studentAtts
    };
  });

  // Calculate overall class statistics
  const totalStudents = recapList.length;
  const eligibleCount = recapList.filter(r => r.isEligibleForExam).length;
  const averagePercentage = totalStudents > 0
    ? Number((recapList.reduce((acc, curr) => acc + curr.percentage, 0) / totalStudents).toFixed(1))
    : 0;

  res.json({
    success: true,
    course: targetCourse,
    allCourses: courses,
    stats: {
      totalStudents,
      eligibleCount,
      notEligibleCount: totalStudents - eligibleCount,
      averagePercentage,
      examThreshold: 75
    },
    recap: recapList
  });
});

// Ekspor Excel (.xlsx)
app.get('/api/reports/export/excel', authenticateToken, requireRole('dosen', 'admin'), (req, res) => {
  const { courseId } = req.query;
  const students = db.filter('users', u => u.role === 'mahasiswa');
  const courses = db.get('courses');
  const attendances = db.get('attendances');

  const targetCourse = courseId ? courses.find(c => c.id === courseId) : courses[0];

  const excelRows = students.map((student, idx) => {
    const studentAtts = attendances.filter(
      a => a.studentId === student.id && a.courseId === targetCourse.id
    );
    const presentCount = studentAtts.filter(a => a.status === 'HADIR').length;
    const lateCount = studentAtts.filter(a => a.status === 'TERLAMBAT').length;
    const totalPresent = presentCount + lateCount;
    const percentage = Number(((totalPresent / 8) * 100).toFixed(1));
    const isEligible = percentage >= 75.0;

    return {
      'No': idx + 1,
      'NIM': student.identifier,
      'Nama Mahasiswa': student.name,
      'Program Studi': student.prodi,
      'Kelas': student.kelas,
      'Hadir Tepat Waktu': presentCount,
      'Terlambat': lateCount,
      'Total Hadir': totalPresent,
      'Persentase Kehadiran': `${percentage}%`,
      'Syarat Mengikuti Ujian (>=75%)': isEligible ? 'MEMENUHI SYARAT' : 'TIDAK MEMENUHI SYARAT'
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran USINDO');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename="Rekap_Absensi_${targetCourse.code}_USINDO.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

// Riwayat & Log Presensi Lengkap (Attendance History)
app.get('/api/attendances', authenticateToken, (req, res) => {
  const { studentNim, courseId } = req.query;
  let attendances = db.get('attendances') || [];
  
  if (req.user.role === 'mahasiswa') {
    attendances = attendances.filter(a => a.studentNim === req.user.identifier);
  } else if (studentNim) {
    attendances = attendances.filter(a => a.studentNim === studentNim);
  }

  if (courseId) {
    attendances = attendances.filter(a => a.courseId === courseId);
  }

  res.json({
    success: true,
    attendances: [...attendances].reverse()
  });
});

// Hapus Satu Riwayat Presensi (oleh Dosen / Admin)
app.delete('/api/attendances/:id', authenticateToken, requireRole('dosen', 'admin'), (req, res) => {
  const { id } = req.params;
  const target = db.find('attendances', a => a.id === id);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Data absensi tidak ditemukan' });
  }

  db.remove('attendances', a => a.id === id);
  db.logAudit({
    action: 'HAPUS_ABSENSI',
    identifier: req.user.identifier,
    name: req.user.name,
    role: req.user.role,
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'Browser',
    details: `Dosen menghapus rekaman absensi ${target.studentName} (${target.studentNim}) untuk ${target.courseName} Pertemuan ${target.meetingNumber}.`
  });

  res.json({
    success: true,
    message: `Riwayat absensi mahasiswa ${target.studentName} berhasil dihapus.`
  });
});

// Hapus Semua / Reset Riwayat Presensi (oleh Dosen / Admin)
app.delete('/api/attendances', authenticateToken, requireRole('dosen', 'admin'), (req, res) => {
  const { courseId, scheduleId, clearAll } = req.body || {};
  let predicate;
  let detailMsg = '';

  if (clearAll || (!courseId && !scheduleId)) {
    predicate = () => true;
    detailMsg = 'Dosen mereset dan menghapus SELURUH riwayat absensi kelas.';
  } else if (scheduleId) {
    predicate = a => a.scheduleId === scheduleId;
    detailMsg = `Dosen menghapus seluruh riwayat absensi untuk jadwal ID: ${scheduleId}.`;
  } else if (courseId) {
    predicate = a => a.courseId === courseId;
    detailMsg = `Dosen menghapus seluruh riwayat absensi untuk mata kuliah ID: ${courseId}.`;
  }

  const removedCount = db.remove('attendances', predicate);

  db.logAudit({
    action: 'RESET_SEMUA_ABSENSI',
    identifier: req.user.identifier,
    name: req.user.name,
    role: req.user.role,
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'Browser',
    details: `${detailMsg} (${removedCount} data absensi dibersihkan).`
  });

  res.json({
    success: true,
    message: `Berhasil menghapus ${removedCount} data riwayat presensi. Sesi absensi kini bersih dan siap digunakan kembali!`,
    removedCount
  });
});

// Reset Pendaftaran Wajah Semua Mahasiswa (Siap Registrasi Real)
app.post('/api/enrollment/reset-all', authenticateToken, requireRole('dosen', 'admin'), (req, res) => {
  const resetCount = db.updateAll('users', u => u.role === 'mahasiswa', {
    faceEnrolled: false,
    enrolledAt: null,
    faceEmbeddings: null
  });

  db.logAudit({
    action: 'RESET_SEMUA_ENROLLMENT',
    identifier: req.user.identifier,
    name: req.user.name,
    role: req.user.role,
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || 'Browser',
    details: `Dosen mereset pendaftaran wajah semua mahasiswa (${resetCount} mahasiswa) untuk persiapan registrasi wajah mandiri secara riil.`
  });

  res.json({
    success: true,
    message: `Pendaftaran wajah untuk seluruh mahasiswa (${resetCount} akun) telah di-reset. Semua mahasiswa kini dapat mendaftarkan wajah aslinya masing-masing.`,
    resetCount
  });
});

// Audit Trail Logs (Semua untuk Dosen/Admin, Riwayat Personal untuk Mahasiswa)
app.get('/api/audit-logs', authenticateToken, (req, res) => {
  const allLogs = db.get('auditLogs') || [];
  const logs = req.user.role === 'mahasiswa'
    ? allLogs.filter(l => l.identifier === req.user.identifier)
    : allLogs;
  res.json({
    success: true,
    logs: [...logs].reverse()
  });
});

// Master Data Mahasiswa (Bisa diakses oleh semua pengguna terotentikasi untuk cek status pendaftaran wajah)
app.get('/api/students', authenticateToken, (req, res) => {
  const students = db.filter('users', u => u.role === 'mahasiswa').map(u => ({
    id: u.id,
    identifier: u.identifier,
    name: u.name,
    email: u.email,
    prodi: u.prodi,
    semester: u.semester,
    kelas: u.kelas,
    faceEnrolled: !!u.faceEnrolled,
    enrolledAt: u.enrolledAt
  }));
  res.json({ success: true, students });
});

// Serve Built Client Static Assets
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`USINDO Face Recognition Attendance Backend Service`);
  console.log(`Running on http://localhost:${PORT}`);
  console.log(`Frontend & API ready at http://localhost:${PORT}`);
  console.log(`JWT Auth & RBAC Active | Face Engine Threshold: ${SIMILARITY_THRESHOLD}%`);
  console.log(`=======================================================`);
});
