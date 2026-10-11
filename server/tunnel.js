import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const cloudflaredExe = path.join(rootDir, 'cloudflared.exe');
const serverJs = path.join(__dirname, 'server.js');

let backendProc = null;
let cloudflaredProc = null;

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/health', (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const isUp = await checkServerReady();
    if (isUp) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

function cleanup() {
  if (cloudflaredProc) {
    try { cloudflaredProc.kill(); } catch (e) {}
    cloudflaredProc = null;
  }
  if (backendProc) {
    try { backendProc.kill(); } catch (e) {}
    backendProc = null;
  }
}

process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
process.on('exit', () => { cleanup(); });

async function main() {
  console.log('===================================================================');
  console.log('  USINDO (UNIVERSITAS SEHATI INDONESIA)');
  console.log('  MEMBUAT LINK AKSES ONLINE (HTTPS) UNTUK TEMAN-TEMAN...');
  console.log('===================================================================\n');

  // 1. Periksa apakah server backend di localhost:5000 sudah berjalan
  const alreadyRunning = await checkServerReady();
  if (alreadyRunning) {
    console.log('  [OK] Server backend USINDO (port 5000) sudah aktif.');
  } else {
    console.log('  [1/2] Menyalakan server backend USINDO di port 5000...');
    backendProc = spawn(process.execPath, [serverJs], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    backendProc.on('error', (err) => {
      console.error('Gagal menjalankan server backend:', err.message);
    });

    const isReady = await waitForServer();
    if (!isReady) {
      console.error('  [ERROR] Gagal menyalakan server backend setelah 8 detik.');
      process.exit(1);
    }
    console.log('  [OK] Server backend USINDO berhasil aktif di port 5000!\n');
  }

  // 2. Jalankan cloudflared
  console.log('  [2/2] Menghubungkan ke Cloudflare Tunnel (harap tunggu 3-5 detik)...\n');

  cloudflaredProc = spawn(cloudflaredExe, ['tunnel', '--url', 'http://localhost:5000']);
  let urlFound = false;

  function handleOutput(data) {
    const text = data.toString();
    if (!urlFound) {
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        urlFound = true;
        const url = match[0];
        console.log('\n*******************************************************************');
        console.log('  LINK ONLINE RESMI (HTTPS) BERHASIL DIBUAT!');
        console.log('*******************************************************************');
        console.log(`\n  LINK UNTUK DIBAGIKAN KE TEMAN-TEMAN:`);
        console.log(`  >>> ${url} <<< \n`);
        console.log('  - Kamera HP & Laptop teman-teman 100% LANGSUNG AKTIF otomatis.');
        console.log('  - Bisa diakses dari mana saja (HP Android, iPhone, Laptop, beda Wi-Fi).');
        console.log('  - Kata Sandi Semua Akun: usindomaju01\n');
        console.log('*******************************************************************');

        // Copy to clipboard
        try {
          const clipProc = spawn('clip');
          clipProc.stdin.write(url);
          clipProc.stdin.end();
          console.log('  [OK] Link sudah OTOMATIS DISALIN! Tinggal Paste (Ctrl+V) di WhatsApp.');
        } catch (e) {}

        // Buka otomatis di browser
        try {
          spawn('cmd', ['/c', 'start', '', url]);
          console.log('  [OK] Membuka link resmi di browser kamu...');
        } catch (e) {}

        console.log('*******************************************************************\n');
        console.log('PENTING: Jendela ini MEMANG HARUS TETAP TERBUKA untuk menjaga link');
        console.log('tetap aktif. Jangan ditutup selama teman-teman masih menggunakan aplikasi.\n');
      }
    }
  }

  cloudflaredProc.stdout.on('data', handleOutput);
  cloudflaredProc.stderr.on('data', handleOutput);

  cloudflaredProc.on('close', (code) => {
    console.log(`Tunnel ditutup (code ${code}).`);
    cleanup();
  });
}

main().catch((err) => {
  console.error('Error:', err);
  cleanup();
});
