# 🎮 Proxy Task (Terminal)

Aplikasi web modern untuk melacak rutinitas (Daily, Weekly, Endgame) di berbagai game *gacha*. Dibuat dengan antarmuka bertema *sci-fi/terminal* yang ramping dan responsif. Aplikasi ini memiliki sistem *auto-reset* otomatis berdasarkan jadwal *server* masing-masing game.

## ✨ Fitur Utama

- **Sistem Autentikasi Aman:** Login dan Registrasi menggunakan Email (didukung OTP 6-digit & Reset Password).
- **Katalog Game Bawaan:** Mendukung *Wuthering Waves, Zenless Zone Zero, Arknights Endfield,* dan *P5X* (mudah untuk ditambah/dikustomisasi).
- **Bulk Insert:** Tambahkan semua misi dari satu game sekaligus dengan satu klik.
- **Penghitung Mundur (Countdown) Real-Time:** Menampilkan sisa waktu presisi sebelum suatu misi di-*reset*.
- **Smart Notification Panel:** Panel *collapse* (bisa ditutup/buka) untuk mengingatkan misi mendesak yang tenggat waktunya $\le$ 3 hari.
- **Auto-Reset di Backend:** Menggunakan *CRON Job* dari Supabase untuk mereset *checkbox* otomatis berdasarkan tenggat waktu, tanpa perlu campur tangan pengguna.
- **UI/UX Interaktif:** Dilengkapi dengan pop-up *SweetAlert2* kustom bertema gelap dan ikon dari *React Icons*.

## 🛠️ Teknologi yang Digunakan

- **Frontend:** React (TypeScript) + Vite
- **Styling:** Tailwind CSS (v3)
- **Backend & Database:** Supabase (PostgreSQL + Auth + pg_cron)
- **Icons & Alerts:** `react-icons`, `sweetalert2`
- **Hosting/Deployment:** Netlify

## 🚀 Cara Menjalankan Secara Lokal (Local Setup)

### 1. Persiapan Kebutuhan
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) dan memiliki akun [Supabase](https://supabase.com/).

### 2. Kloning Repositori
```bash
git clone [https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git](https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git)
cd NAMA_REPO_KAMU