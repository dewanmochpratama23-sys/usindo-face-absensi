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

## 🔑 Akun Uji Coba (Login Credentials)

Semua akun terdaftar menggunakan kata sandi default: **`usindomaju01`**

| Role | Nama Pengguna | NIM / NIP | Kata Sandi | Keterangan |
|---|---|---|---|---|
| **Mahasiswa** | Dewan Moch Pratama | `240131009` | `usindomaju01` | Mahasiswa TI Semester 5 |
| **Mahasiswa** | Fakhri Fadhlurrahman | `240131012` | `usindomaju01` | Biometrik Wajah Terdaftar (Enrolled) |
| **Mahasiswa** | Muhammad Falah | `240131019` | `usindomaju01` | Mahasiswa TI Semester 5 |
| **Mahasiswa** | Rival Setiawan | `240131025` | `usindomaju01` | Mahasiswa TI Semester 5 |
| **Mahasiswa** | Hasan Hariri | `230131001` | `usindomaju01` | Mahasiswa TI Semester 5 |
| **Dosen** | Bapak ANDRIYANA S.T., M.Kom. | `19850101` | `usindomaju01` | Dosen Pengampu Mata Kuliah |
| **Admin** | Biro BAAK USINDO | `admin` | `usindomaju01` | Admin Master Mahasiswa & Akademik |

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons, Canvas Biometric HUD, JSPDF, XLSX, Canvas Confetti.
- **Backend**: Node.js, Express REST API, JSON Web Token (JWT), Role-Based Access Control (RBAC), Bcrypt Password Hashing.
- **Face Engine**: Ekstraksi Vektor 128-Dimensi, Cosine Similarity matching engine, Haversine Geofencing validator.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dilengkapi file peluncur praktis sekali klik:

### 1. Untuk Akses di Laptop Sendiri
Cukup klik dua kali file **`run.bat`** (atau `start-aplikasi.bat`):
- Otomatis menyalakan server backend di latar belakang.
- Otomatis membuka portal aplikasi di browser ke `http://localhost:5000`.

### 2. Untuk Dibagikan ke Teman / Dibuka Lewat HP
Cukup klik dua kali file **`bagikan-ke-teman.bat`**:
- Menghubungkan ke Cloudflare Tunnel secara aman (HTTPS).
- Menghasilkan tautan publik (contoh: `https://xxxx.trycloudflare.com`).
- Tautan otomatis disalin ke clipboard dan siap dikirim via WhatsApp ke teman-teman!
- Teman-teman dapat langsung membuka kamera HP dan melakukan absensi dari mana saja.

### 3. Untuk Membuka Flowchart Interaktif & Panduan Presentasi
Cukup klik dua kali file **`buka-flowchart.bat`**:
- Membuka diagram alur visual 3 tahapan dan skrip presentasi di browser.
