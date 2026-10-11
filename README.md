# Sistem Absensi Mahasiswa Face Recognition USINDO

Implementasi lengkap aplikasi web **Sistem Absensi Mahasiswa Berbasis Pengenalan Wajah (Face Recognition)** untuk **Universitas Sains Indonesia (USINDO)** yang dibangun secara akurat berdasarkan diagram alur referensi sistem.

---

## 📋 Alur Sistem Sesuai Diagram Referensi

Sistem ini terbagi menjadi 3 pilar tahapan utama:

```
+-----------------------------------+     +------------------------------------+     +------------------------------------+
| 1. PENDAFTARAN WAJAH (ENROLLMENT) | --> | 2. ABSENSI HARIAN (RECOGNITION)    | --> | 3. MONITORING & PELAPORAN          |
| • Login NIM & kata sandi          |     | • Pilih jadwal aktif               |     | • Rekap kehadiran real-time        |
| • Izin kamera                     |     | • Kamera real-time + Liveness      |     | • Persentase kehadiran otomatis    |
| • Ekstraksi face embedding (128d) |     | • Cocokkan embedding (ambang >85%) |     | • Syarat mengikuti ujian (>=75%)   |
| • Simpan 3 sudut:                 |     | • Validasi waktu & Geofencing GPS  |     | • Ekspor Laporan PDF & Excel XLSX  |
|   (Depan, Kiri, Kanan)            |     | • Catat Hadir / Terlambat          |     | • Audit trail percobaan absensi    |
| • Foto mentah TIDAK disimpan!     |     | • Cocok: simpan / Gagal: coba lagi |     | • Buka / Tutup sesi absensi        |
+-----------------------------------+     +------------------------------------+     +------------------------------------+
```

---

## 🚀 Fitur & Komponen Utama

### 1. Pendaftaran Wajah (Biometric Enrollment)
- **3 Sudut Pengambilan Pose Wajah**:
  - **Pose Depan**: Tegak lurus menghadap kamera.
  - **Hadap Kiri**: Rotasi kepala 25°-30° ke arah kiri.
  - **Hadap Kanan**: Rotasi kepala 25°-30° ke arah kanan.
- **Ekstraksi Biometrik 128-Dimensi**: Menghasilkan vektor unit numerik `||v|| = 1.0` yang merepresentasikan karakteristik spasial fitur wajah.
- **Jaminan Privasi & Keamanan**: **Foto mentah (raw image) dibuang seketika dan tidak disimpan di server**. Hanya representasi matematis vektor referensi yang disimpan dalam database terenkripsi.

### 2. Absensi Harian (Face Recognition Real-Time)
- **Deteksi Wajah Real-Time**: Kamera web dengan overlay HUD analitik, bounding box pelacak wajah, dan landmark visual.
- **Anti-Spoofing Liveness Detection**:
  - Tantangan Kedipan Mata (*Blink Detection*) atau Senyum (*Smile Detection*).
  - Mencegah kecurangan absensi menggunakan foto cetak atau pemutaran video dari layar ponsel.
- **Pencocokan Biometrik AI**:
  - Menggunakan algoritma *Cosine Similarity* membandingkan wajah kandidat dengan ketiga vektor referensi terdaftar.
  - Ambang batas kelulusan: **> 85.0%** (Sesuai diagram referensi).
- **Validasi Waktu**:
  - Memeriksa jam mulai perkuliahan dan toleransi keterlambatan (15–20 menit).
  - Status otomatis: `HADIR` (Tepat Waktu) atau `TERLAMBAT`.
- **Geofencing GPS**:
  - Memvalidasi lokasi mahasiswa terhadap koordinat Kampus Terpadu USINDO (radius toleransi maks. 250 meter).
  - Dilengkapi fitur *Simulator Lokasi* untuk mempermudah demonstrasi dan pengujian di luar kampus.

### 3. Monitoring & Pelaporan (Dosen & BAAK)
- **Rekapitulasi Kehadiran Real-Time**: Daftar absensi mahasiswa yang diperbarui secara langsung saat absensi masuk.
- **Kalkulasi Persentase Otomatis**: Persentase kehadiran dihitung secara dinamis dari pertemuan berjalan (1–8) hingga akhir semester (14 pertemuan).
- **Evaluasi Syarat Mengikuti Ujian (>= 75%)**:
  - Status `MEMENUHI SYARAT` untuk kehadiran $\ge 75\%$.
  - Status `TIDAK MEMENUHI SYARAT / PERINGATAN` untuk kehadiran $< 75\%$.
- **Ekspor Dokumen Resmi**:
  - **PDF Resmi**: Laporan lengkap dengan Kop Surat resmi USINDO, tabel rekapitulasi, indikator kelayakan ujian, dan kolom tanda tangan pengesahan dosen.
  - **Excel (.xlsx)**: Spreadsheet terstruktur siap olah untuk rekap nilai akademik.
- **Audit Trail Percobaan Absensi**: Log audit keamanan lengkap mencatat stempel waktu, IP address, NIM, jenis aktivitas, skor kemiripan wajah, dan status keberhasilan/penolakan.

---

## 🔑 Akun Demo Pengujian

Anda dapat langsung berganti akun melalui tombol **"Ganti Akun"** di pojok kanan atas aplikasi web:

| Role | Nama Pengguna | NIM / NIP | Kata Sandi | Status Awal |
|---|---|---|---|---|
| **Mahasiswa** | Budi Pratama | `2024001` | `mahasiswa123` | Sudah Terdaftar (Enrollment Aktif, Kehadiran 100%) |
| **Mahasiswa** | Siti Rahmawati | `2024002` | `mahasiswa123` | Sudah Terdaftar (Kehadiran 85.7%) |
| **Mahasiswa** | Ahmad Fauzi | `2024003` | `mahasiswa123` | **Belum Terdaftar** (Uji Coba Alur Pendaftaran Wajah) |
| **Mahasiswa** | Dewi Lestari | `2024004` | `mahasiswa123` | Kehadiran 57.1% (**Peringatan Tidak Lolos Ujian**) |
| **Dosen** | Dr. Hendra Gunawan | `19850101` | `dosen123` | Dosen Pengampu Kecerdasan Buatan & Web |
| **Admin** | Biro BAAK USINDO | `admin` | `admin123` | Administrator Akademik & Keamanan Kampus |

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons, Canvas Biometric HUD, JSPDF, XLSX, Canvas Confetti.
- **Backend**: Node.js, Express REST API, JSON Web Token (JWT), Role-Based Access Control (RBAC), Bcrypt Password Hashing.
- **Face Engine**: Ekstraksi Vektor 128-Dimensi, Cosine Similarity matching engine, Haversine Geofencing validator.

---

## 💻 Cara Menjalankan Sistem

Aplikasi ini telah aktif berjalan di port lokal:
- **URL Aplikasi Web**: `http://localhost:5000`

Jika ingin menjalankan ulang di kemudian hari:
```bash
# 1. Pindah ke direktori proyek
cd C:\Users\LENOVO\.gemini\antigravity\scratch\usindo-face-absensi

# 2. Jalankan server (Frontend otomatis terintegrasi)
node server/server.js
```
Buka browser Anda dan akses: **http://localhost:5000**
