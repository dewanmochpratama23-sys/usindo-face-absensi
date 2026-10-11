# PANDUAN PENGGUNAAN & AKSES SISTEM ABSENSI BIOMETRIK WAJAH USINDO
**USINDO (Universitas Sehati Indonesia)**  
*Mata Kuliah: Kecerdasan Buatan & Machine Learning*  
*Dosen Pengampu: Bapak ANDRIYANA S.T., M.Kom.*

---

## 1. CARA MENGAKSES APLIKASI

### A. Untuk Anda Sendiri (Di Komputer/Laptop Ini)
Di dalam folder proyek:
```
C:\Users\LENOVO\.gemini\antigravity\scratch\usindo-face-absensi
```
Cukup **klik dua kali (*double click*) file**:
* **`run.bat`** atau **`start-aplikasi.bat`**

Script ini akan otomatis:
1. Menyalakan backend server USINDO di latar belakang.
2. Membuka browser web Anda ke alamat **http://localhost:5000**.

---

### B. Agar Teman-Teman Bisa Mengakses dari HP / Laptop Mereka (Paling Direkomendasikan)
Cukup **klik dua kali (*double click*) file**:
👉 **`bagikan-ke-teman.bat`**

**Mengapa ini cara terbaik?**
1. Anda akan langsung mendapatkan link publik berprotokol **HTTPS** (contoh: `https://contoh-nama.trycloudflare.com`).
2. **Kamera/Webcam HP teman-teman akan 100% langsung diizinkan dan aktif otomatis** oleh browser (karena browser HP mewajibkan protokol HTTPS untuk akses kamera).
3. Teman-teman bisa mengakses dari **mana saja** (bisa dari rumah masing-masing, kampus, maupun beda koneksi internet/data seluler).
4. Tinggal bagikan link HTTPS tersebut ke grup WhatsApp kelas!

---

### C. Mengakses Lewat 1 Jaringan Wi-Fi yang Sama (Jalur Lokal)
Jika Anda dan teman-teman berada di satu ruangan dengan Wi-Fi / Hotspot yang sama:
1. Pastikan server aktif (`run.bat`).
2. IP Address laptop Anda saat ini adalah: **`192.168.1.13`**
3. Teman Anda membuka: **`http://192.168.1.13:5000`**
*(Catatan: Browser HP seperti Chrome membatasi izin kamera jika lewat alamat `http://`, oleh karena itu gunakan **Cara B (`bagikan-ke-teman.bat`)** agar kamera langsung berfungsi tanpa kendala).*

---

## 2. PANDUAN AKUN LOGIN

Semua akun menggunakan kata sandi default: **`usindomaju01`**

### Akun Mahasiswa (TI-4A):
| NIM | Nama Mahasiswa | Status Awal |
|---|---|---|
| **240131009** | Dewan Moch Pratama | Siap Daftar Wajah Asli |
| **240131012** | Fakhri Fadhlurrahman | Siap Daftar Wajah Asli |
| **240131019** | Muhammad Falah | Siap Daftar Wajah Asli |
| **240131025** | Rival Setiawan | Siap Daftar Wajah Asli |
| **230131001** | Hasan Hariri | Siap Daftar Wajah Asli |

### Akun Dosen Pengampu:
* **NIP / Username**: **`19850101`**
* **Nama**: Bapak ANDRIYANA S.T., M.Kom.
* **Kata Sandi**: **`usindomaju01`**

### Akun Admin Akademik:
* **Username**: **`admin`**
* **Nama**: Biro BAAK USINDO
* **Kata Sandi**: **`usindomaju01`**

---

## 3. ALUR PENGGUNAAN RIIL (REAL DEPLOYMENT)

### Langkah 1: Mahasiswa Mendaftarkan Wajah Asli (Modul 1)
1. Mahasiswa login menggunakan **NIM** masing-masing dan password **`usindomaju01`**.
2. Masuk ke **Modul 1: Pendaftaran Wajah (Enrollment)**.
3. Izinkan akses webcam browser.
4. Posisikan wajah dan ambil 3 sudut:
   * **Sudut Depan** (menatap kamera)
   * **Sudut Kiri** (menengok ~25 derajat ke kiri)
   * **Sudut Kanan** (menengok ~25 derajat ke kanan)
5. Klik **"Simpan & Enkripsi Vektor Biometrik Wajah"**.
6. Sistem menyimpan vektor 128-dimensi terenkripsi ke database (foto mentah tidak disimpan demi privasi).

---

### Langkah 2: Mahasiswa Melakukan Absensi Harian (Modul 2)
1. Masuk ke **Modul 2: Absensi Harian**.
2. Nyalakan kamera.
3. Selesaikan tantangan keaslian (*Liveness Detection*) dengan **Tersenyum** atau **Berkedip**.
4. Klik **"Kirim Absensi Wajah Real-Time"**.
5. Sistem AI mencocokkan wajah kandidat dengan vektor referensi terdaftar. Jika kemiripan > 85%, absensi tercatat **HADIR**.

---

### Langkah 3: Dosen Mengontrol & Memantau Kehadiran (Modul 3)
1. Login dengan NIP **`19850101`** dan password **`usindomaju01`**.
2. Masuk ke **Modul 3: Monitoring & Pelaporan**.
3. Fitur Dosen:
   * **Buka / Tutup Sesi Absensi**: Mengontrol apakah mahasiswa boleh absen saat perkuliahan berlangsung.
   * **Rekap Kehadiran**: Melihat persentase kehadiran dan kelayakan ujian (≥75%).
   * **Hapus Riwayat Absen**:
     * Hapus semua riwayat kehadiran kelas agar sesi perkuliahan bisa dipakai lagi dari awal.
     * Hapus per-mahasiswa / per-pertemuan dengan menekan tombol tempat sampah (🗑️).
   * **Reset Pendaftaran Wajah Semua Mahasiswa**: Mengosongkan data wajah semua mahasiswa agar siap didaftarkan ulang dengan wajah baru.
   * **Ekspor Laporan**: Unduh rekapitulasi resmi dalam format **PDF (Kop Surat Resmi USINDO)** dan **Excel (.xlsx)**.
