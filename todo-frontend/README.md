# 📋 Task Manager — Frontend (UKK PPLG SMK)

Frontend Single Page Application (**SPA**) modern dan responsif untuk aplikasi **To-Do List** yang dibangun untuk memenuhi standar pengujian Uji Kompetensi Keahlian (**UKK**) Program Keahlian Pengembangan Perangkat Lunak dan GIM (**PPLG**).

Aplikasi ini dikembangkan menggunakan **React (Vite)** dan **Tailwind CSS**, serta terintegrasi secara penuh (*real-time HTTP client*) dengan Backend REST API **Golang (Gin)** dan database MySQL.

---

## 🚀 Teknologi yang Digunakan

| Komponen | Teknologi | Deskripsi / Versi |
| :--- | :--- | :--- |
| **Framework / Library** | [React](https://react.dev/) | React 18 (Functional Component & Modern Hooks) |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) | Vite 5 (Super cepat, Hot Module Replacement / HMR) |
| **CSS Framework** | [Tailwind CSS](https://tailwindcss.com/) | Tailwind CSS v3 (Utility-first framework & modern card styling) |
| **CSS Post-Processor** | [PostCSS](https://postcss.org/) & Autoprefixer | Kompatibilitas browser modern |
| **HTTP Client** | [Axios](https://axios-http.com/) | Pengambilan data REST API dengan error handling dan timeout |
| **Iconography** | [Lucide React](https://lucide.dev/) | Paket ikon visual yang clean dan konsisten |
| **Typography** | [Inter Font](https://fonts.google.com/specimen/Inter) | Font UI modern dari Google Fonts |

---

## 📁 Struktur Direktori & Penjelasan Modul

Kode aplikasi diorganisasikan secara rapi dan modular agar mudah dipelihara (*maintainable*) serta mudah dipahami oleh penguji UKK:

```text
todo-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Header "Task Manager - UKK PPLG" + Indikator Live Server Status
│   │   ├── TodoForm.jsx        # Formulir tambah tugas, validasi required, dan selector prioritas
│   │   ├── FilterBar.jsx       # Tab filter (Semua, Belum Selesai, Selesai) + Counter sisa tugas
│   │   ├── TodoItem.jsx        # Komponen kartu to-do: Checkbox PUT, badge prioritas, tanggal, DELETE
│   │   ├── LoadingSkeleton.jsx # Animasi shimmer placeholder saat pertama kali memuat data
│   │   ├── EmptyState.jsx      # Tampilan visual ramah saat daftar tugas kosong per status filter
│   │   └── ErrorAlert.jsx      # Banner interaktif jika backend Go belum dinyalakan + tombol "Coba Lagi"
│   ├── services/
│   │   └── api.js              # Modul terpusat konfigurasi Axios client dan fungsi REST API CRUD
│   ├── App.jsx                 # Komponen induk: state orchestration, optimistic UI, filter, & toast
│   ├── index.css               # Direktif Tailwind CSS, font styling, dan custom scrollbar
│   └── main.jsx                # Entrypoint React DOM untuk mounting ke #root
├── index.html                  # Dokumen HTML utama, metadata, favicon, dan import Google Font Inter
├── package.json                # Daftar dependensi library, script build, dan konfigurasi proyek
├── tailwind.config.js          # Konfigurasi theme, path template scan, dan font keluarga
├── postcss.config.js           # Konfigurasi plugin PostCSS (Tailwind & Autoprefixer)
├── vite.config.js              # Pengaturan port dev server (:5173) dan plugin React Vite
└── README.md                   # Dokumentasi lengkap proyek
```

---

## 💡 Penjelasan Detail Setiap Komponen

### 1. `src/services/api.js` (API Service Layer)
Memusatkan seluruh komunikasi jaringan ke backend Golang `http://localhost:8080/api`:
- **`getTodos()`**: Melakukan HTTP `GET /todos` untuk mengambil daftar seluruh tugas.
- **`createTodo(title, priority)`**: Melakukan HTTP `POST /todos` dengan payload `{ title, priority }`.
- **`updateTodo(id, payload)`**: Melakukan HTTP `PUT /todos/:id` untuk memperbarui status `is_completed` maupun field lainnya.
- **`deleteTodo(id)`**: Melakukan HTTP `DELETE /todos/:id` untuk menghapus tugas berdasarkan ID.
- **`handleApiError`**: Menerjemahkan pesan galat dari jaringan atau backend ke bahasa Indonesia yang mudah dipahami pengguna.

### 2. `src/components/Navbar.jsx`
- Menampilkan branding judul *"Task Manager - UKK PPLG"*.
- Dilengkapi **Status Pill Indikator**:
  - 🟢 **Online (8080)** dengan animasi sinyal kedip hijau jika backend terhubung.
  - 🔴 **Offline** jika backend belum dinyalakan atau tidak merespons.
- Tombol **Refresh manual** dengan ikon putar (`RefreshCw`) untuk menyinkronkan ulang data dari server.

### 3. `src/components/TodoForm.jsx`
- Input teks judul tugas yang telah dilengkapi validasi otomatis (anti-spasi kosong).
- Dropdown selector tingkat urgensi/prioritas:
  - 🟢 **Low** (Santai - Hijau)
  - 🟡 **Medium** (Standar - Kuning/Oranye)
  - 🔴 **High** (Mendesak - Merah)
- Tombol *"Tambah Tugas"* otomatis berubah status menjadi `disabled` dan menampilkan ikon loading spinner saat request sedang dikirim ke backend.

### 4. `src/components/FilterBar.jsx`
- Menyediakan 3 tab status:
  - **Semua** (`all`): Menampilkan total seluruh tugas.
  - **Belum Selesai** (`pending`): Hanya tugas yang masih harus dikerjakan.
  - **Selesai** (`completed`): Tugas yang telah dicentang selesai.
- Counter dinamis: Memberitahu siswa secara akurat jumlah tugas yang belum diselesaikan (*contoh: "3 tugas tersisa"* atau *"✨ Semua tugas selesai!"*).

### 5. `src/components/TodoItem.jsx`
- **Checkbox Toggle**: Mengubah status `is_completed` (memicu API `PUT`).
- **Visual Feedback**: Judul tugas yang selesai otomatis dicoret (*strikethrough*) dan warna teks memudar (*muted*).
- **Badge Prioritas**: Label berpenanda warna sesuai tingkat urgensi tugas.
- **Format Tanggal**: Mengonversi `created_at` ke format waktu lokal Indonesia menggunakan `Intl.DateTimeFormat` (*contoh: "3 Nov 2026, 07:22"*).
- **Safe Delete**: Tombol hapus dilengkapi dialog konfirmasi singkat *"Hapus / Batal"* untuk mencegah penghapusan tugas tanpa sengaja.

### 6. `src/components/LoadingSkeleton.jsx` & `EmptyState.jsx`
- **LoadingSkeleton**: Efek shimmer pulse yang menyerupai bentuk kartu to-do saat data pertama kali dimuat.
- **EmptyState**: Ilustrasi dan pesan informatif yang berganti dinamis berdasarkan tab filter yang aktif.

### 7. `src/components/ErrorAlert.jsx`
- Muncul otomatis jika backend Golang belum dijalankan.
- Memberikan panduan terminal yang jelas bagi penguji/siswa (*perintah `go run main.go`*) dan tombol *"Coba Lagi"* untuk menguji ulang koneksi tanpa perlu me-reload halaman browser.

### 8. `src/App.jsx`
- Mengelola state global dengan React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- Menerapkan arsitektur **Optimistic UI Update**: Ketika user mencentang tugas, tampilan langsung diperbarui seketika (*instant response*), dan jika koneksi server gagal, state otomatis dibatalkan (*rollback*) disertai toast alert error.
- **Floating Toast Notification**: Feedback visual yang muncul di pojok layar saat aksi berhasil maupun gagal.

---

## 🌐 Endpoint REST API Backend yang Dikonsumsi

Aplikasi frontend ini berkomunikasi dengan backend Golang (Gin) yang berjalan pada `http://localhost:8080/api`:

| HTTP Method | Endpoint | Request Body / Payload | Format Response Sukses | Status Code |
| :--- | :--- | :--- | :--- | :---: |
| **GET** | `/api/todos` | *None* | `{"data": [{ "id": 1, "title": "...", "priority": "medium", "is_completed": false, "created_at": "..." }]}` | `200 OK` |
| **POST** | `/api/todos` | `{"title": "Nama Tugas", "priority": "high"}` | `{"data": { "id": 2, "title": "Nama Tugas", "priority": "high", "is_completed": false, ... }}` | `201 Created` |
| **PUT** | `/api/todos/:id` | `{"is_completed": true}` *atau* `{"title": "...", "priority": "..."}` | `{"data": { "id": 1, ... "is_completed": true }}` | `200 OK` |
| **DELETE** | `/api/todos/:id` | *None* | `{"message": "To-do berhasil dihapus"}` | `200 OK` |

---

## ⚙️ Persyaratan Sistem & Instalasi

### Prasyarat
- **Node.js**: Versi `18.0.0` atau yang lebih baru.
- **NPM**: Versi `9.0.0` atau yang lebih baru.
- **Backend Golang**: Berjalan di `http://localhost:8080` (lihat folder `../todo-backend`).

---

## 🛠️ Langkah Menjalankan Aplikasi

### Langkah 1: Buka Terminal pada Folder Frontend
Navigasikan terminal Anda ke folder `todo-frontend`:
```powershell
cd d:\TELKOM\ukk-todolist\todo-frontend
```

### Langkah 2: Instal Seluruh Dependensi
```powershell
npm install
```

### Langkah 3: Jalankan Development Server
```powershell
npm run dev
```

Jika berhasil, terminal akan menampilkan output:
```text
  VITE v5.4.14  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Buka peramban (browser) dan akses alamat:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🏗️ Build untuk Produksi (Production Build)

Untuk menguji build final yang siap di-deploy ke web hosting atau web server:
```powershell
npm run build
```
Output static files yang telah dioptimasi (*minified & bundled*) akan tersimpan di dalam folder `dist/`.

Untuk melihat preview hasil build produksi:
```powershell
npm run preview
```

---

## ❓ FAQ & Troubleshooting Pengujian UKK

### Q1: Muncul banner merah "Koneksi ke Backend Terputus"?
> **Penyebab**: Server backend Golang belum dijalankan atau database MySQL belum aktif.  
> **Solusi**:
> 1. Pastikan MySQL pada **Laragon / XAMPP** berstatus **Running** (port 3306).
> 2. Buka terminal baru, masuk ke folder backend: `cd ../todo-backend`.
> 3. Jalankan server backend: `go run main.go`.
> 4. Klik tombol **"Coba Lagi"** pada banner error di frontend.

### Q2: Terjadi error CORS di browser console?
> **Penyebab**: Origin frontend tidak sesuai dengan whitelist CORS backend.  
> **Solusi**: Backend telah diatur untuk menerima origin `http://localhost:5173` secara bawaan. Pastikan frontend Anda berjalan di port `5173` default Vite.

### Q3: Mengapa tampilan sangat cepat saat mencentang checkbox?
> **Penjelasan**: Aplikasi menggunakan teknik **Optimistic UI Update**. Tampilan diubah terlebih dahulu untuk kenyamanan interaksi pengguna (*zero latency*), sementara request API dikirim secara asinkron di latar belakang. Jika server menolak atau mati, aplikasi otomatis mengembalikan status (*rollback*) dan memunculkan toast pesan kesalahan.

---

## 🏆 Kesesuaian Rubrik Penilaian UKK PPLG

| Aspek Penilaian UKK | Implementasi pada Proyek |
| :--- | :--- |
| **User Interface (UI/UX)** | Desain modern, clean layout card di tengah layar (`max-w-xl`), warna prioritas ramah mata, responsif di mobile & desktop. |
| **Komponen Modular** | Memecah UI menjadi komponen spesifik: `Navbar`, `TodoForm`, `FilterBar`, `TodoItem`, `LoadingSkeleton`, `EmptyState`, dan `ErrorAlert`. |
| **Operasi CRUD Lengkap** | Mengonsumsi seluruh operasi Create (`POST`), Read (`GET`), Update (`PUT`), dan Delete (`DELETE`). |
| **Clean Code & Best Practices** | Menggunakan React Hooks standar (`useState`, `useEffect`, `useCallback`, `useMemo`), Axios service layer, dan TypeScript-ready code structure. |
| **Penanganan Galat (Error Handling)** | Error alert informatif, fallback saat server mati, tombol retry, dan toast notifications. |
| **Format Standar Industri** | Menggunakan tool modern industri standar (Vite, Tailwind CSS, REST API client). |
