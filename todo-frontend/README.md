# 📋 Kelarin — To-Do List App (UKK PPLG SMK)

Aplikasi To-Do List modern, elegan, dan responsif bernama **Kelarin** yang dibangun khusus untuk pengujian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG)**.

Frontend ini terhubung secara langsung (*real-time*) dengan Backend REST API **Golang (Gin)** dan database MySQL.

---

## 🚀 Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework / Library** | [React](https://react.dev/) 18 | Functional Components & Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) |
| **Build Tool / Bundler** | [Vite](https://vitejs.dev/) 5 | Super cepat, Hot Module Replacement (HMR) |
| **CSS Framework** | [Tailwind CSS](https://tailwindcss.com/) 3 | Desain modern, elegan, responsif dengan layout card terpusat |
| **HTTP Client** | [Axios](https://axios-http.com/) | Konsumsi REST API dengan error normalization dan timeout |
| **Iconography** | [Lucide React](https://lucide.dev/) | Icon pack modern dan clean |

---

## 📁 Struktur Komponen Modular

Proyek telah dibersihkan dari menu-menu dummy dan dipecah secara rapi serta modular:

```text
todo-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Header "Task Manager - UKK PPLG" & badge status koneksi API
│   │   ├── TodoForm.jsx        # Form card input: Judul (required), Prioritas, Due Date, & Tombol Submit
│   │   ├── FilterBar.jsx       # Real-time search bar, Tab filter (Semua/Pending/Selesai), & Counter
│   │   ├── TodoItem.jsx        # Card tugas: Checkbox PUT, badge prioritas, deadline, tombol edit & hapus
│   │   ├── EditModal.jsx       # Modal popup edit cepat untuk mengubah judul, prioritas, dan deadline
│   │   ├── LoadingSkeleton.jsx # Animasi shimmer placeholder saat pertama kali mengambil data
│   │   ├── EmptyState.jsx      # Ilustrasi & pesan informatif jika belum ada data atau pencarian nihil
│   │   └── ErrorAlert.jsx      # Banner alert jika server backend Golang belum dinyalakan di port 8080
│   ├── services/
│   │   └── api.js              # Modul terpusat komunikasi Axios REST API Golang
│   ├── App.jsx                 # Komponen utama (State, Filter, Search, Optimistic UI, & Toast)
│   ├── index.css               # Setup Tailwind CSS & custom styling
│   └── main.jsx                # Entry point React
├── index.html                  # HTML template + Google Font Inter
├── package.json                # Daftar dependensi & script build
├── tailwind.config.js          # Konfigurasi Tailwind CSS
├── postcss.config.js           # Konfigurasi PostCSS & Autoprefixer
├── vite.config.js              # Konfigurasi dev server port 5173
├── .gitignore                  # Git ignore untuk node_modules, dist, .env, dll
└── README.md                   # Dokumentasi lengkap proyek
```

---

## 🌐 Struktur Data & Endpoint REST API Golang

### Struktur Data Todo (JSON)
```json
{
  "id": 1,
  "title": "Menyelesaikan Modul UKK PPLG",
  "priority": "high",
  "is_completed": false,
  "due_date": "2026-11-10",
  "created_at": "2026-11-03T07:22:00Z"
}
```

### Spesifikasi Endpoint API yang Dikonsumsi
Base URL: `http://localhost:8080/api/todos`

| Method | Endpoint | Request Payload | Response Data | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/todos` | *None* | `{"data": [...]}` | Mengambil seluruh daftar tugas |
| **POST** | `/api/todos` | `{"title": "...", "priority": "high", "due_date": "..."}` | `{"data": {...}}` | Menambahkan tugas baru |
| **PUT** | `/api/todos/:id` | `{"is_completed": true}` *atau* `{"title": "...", "priority": "...", "due_date": "..."}` | `{"data": {...}}` | Update status selesai atau edit data tugas |
| **DELETE** | `/api/todos/:id` | *None* | `{"message": "..."}` | Menghapus tugas berdasarkan ID |

---

## 💡 Fitur-Fitur Utama

1. **Header / Navbar:**
   - Judul elegan *"Task Manager - UKK PPLG"*.
   - Badge live status koneksi API (🟢 *Online (8080)* / 🔴 *Offline*) dan tombol sinkronisasi refresh.
2. **Form Tambah Tugas (Card Input):**
   - Validasi input judul (tidak boleh kosong atau hanya berisi spasi).
   - Pilihan Prioritas Berwarna:
     - 🟢 **Low** (Hijau)
     - 🟡 **Medium** (Kuning/Oranye)
     - 🔴 **High** (Merah)
   - Input tanggal tenggat waktu (*due date*) opsional.
   - Tombol "Tambah Tugas" dengan animasi loading spinner saat request dikirim.
3. **Kontrol, Tab Filter & Pencarian:**
   - **Search bar real-time**: Menyaring tugas secara instan berdasarkan judul atau prioritas.
   - **Filter Tab**: *Semua*, *Belum Selesai (Pending)*, dan *Selesai (Completed)* dengan counter badge.
   - **Counter Tugas**: Menampilkan jumlah tugas yang belum diselesaikan (*contoh: "3 tugas belum selesai"*).
4. **List Item Tugas:**
   - Checkbox untuk toggle `is_completed` (memicu `PUT /api/todos/:id`).
   - Teks otomatis dicoret (*strikethrough*) dan memudar saat selesai.
   - Badge warna prioritas yang tegas dan jelas.
   - Informasi tanggal deadline (*due date*) dengan ikon kalender.
   - Tombol **Edit Cepat** yang membuka `EditModal.jsx` untuk mengubah judul, prioritas, dan deadline.
   - Tombol **Hapus** dengan dialog konfirmasi singkat (*Hapus / Batal*).
5. **State Handling & Kerapian UX:**
   - **Loading Skeleton**: Shimmer pulse saat pertama kali mengambil data dari backend.
   - **Empty State**: Tampilan visual ramah saat tugas kosong atau hasil pencarian tidak ditemukan.
   - **Error Alert**: Banner informatif jika backend Golang belum dijalankan di port 8080, dilengkapi petunjuk terminal dan tombol *"Coba Lagi"*.
   - **Optimistic UI Updates**: Respons instan pada checkbox dengan kemampuan *rollback* otomatis jika server gagal.
   - **Floating Toast**: Notifikasi singkat saat tugas berhasil ditambahkan, diubah, maupun dihapus.

---

## 🛠️ Instruksi Setup & Menjalankan

### 1. Masuk ke Direktori Frontend
```powershell
cd todo-frontend
```

### 2. Instalasi Dependensi
```powershell
npm install
```

### 3. Konfigurasi Tailwind CSS (`tailwind.config.js`)
File konfigurasi sudah terpasang rapi:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 4. Menjalankan Server Pengembangan (Dev Server)
```powershell
npm run dev
```
Aplikasi akan aktif di **`http://localhost:5173`**.

### 5. Build Produksi
```powershell
npm run build
```
Menghasilkan bundle statis yang telah dioptimasi di dalam folder `dist/`.
