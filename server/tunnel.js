import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const cloudflaredExe = path.join(rootDir, 'cloudflared.exe');

console.log('===================================================================');
console.log('  USINDO (UNIVERSITAS SEHATI INDONESIA)');
console.log('  MEMBUAT LINK AKSES ONLINE (HTTPS) UNTUK TEMAN-TEMAN...');
console.log('===================================================================\n');
console.log('Sedang menghubungkan ke server Cloudflare (harap tunggu 3-5 detik)...\n');

const cp = spawn(cloudflaredExe, ['tunnel', '--url', 'http://localhost:5000']);
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

      console.log('*******************************************************************\n');
      console.log('PENTING: Jendela ini MEMANG HARUS TETAP TERBUKA untuk menjaga link');
      console.log('tetap aktif. Jangan ditutup selama teman-teman masih menggunakan aplikasi.\n');
    }
  }
}

cp.stdout.on('data', handleOutput);
cp.stderr.on('data', handleOutput);

cp.on('close', (code) => {
  console.log(`Tunnel ditutup (code ${code}).`);
});
