# 🚀 Fullstack To-Do List Application (UKK PPLG SMK)

Aplikasi manajemen tugas (To-Do List) berbasis **Fullstack Web** yang dirancang dan dikembangkan untuk standar penilaian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG)**.

Proyek ini menerapkan arsitektur *Client-Server* modern yang memisahkan antara frontend dan backend secara independen (*decoupled architecture*):
- **Frontend**: Single Page Application (SPA) berbasis **React (Vite)** dan **Tailwind CSS**.
- **Backend**: High-performance RESTful API berbasis **Golang (Gin Framework)** dan **GORM ORM** terhubung ke **MySQL Database**.

---

## 📂 Struktur Proyek

```text
ukk-todolist/
├── todo-backend/             # REST API Golang (Gin + GORM + MySQL)
│   ├── config/               # Koneksi database & auto-migration
│   ├── controllers/          # Logika CRUD to-do
│   ├── models/               # Struct model data & payload input
│   ├── main.go               # Server runner & router Gin (:8080)
│   └── README.md             # Dokumentasi teknis backend
│
└── todo-frontend/            # Client SPA React (Vite + Tailwind CSS)
    ├── src/
    │   ├── components/       # Komponen UI modular (Form, Item, Filter, dll)
    │   ├── services/         # Axios client untuk REST API backend
    │   ├── App.jsx           # State management & optimistic UI
    │   └── main.jsx          # Entrypoint React
    ├── index.html            # Template HTML utama
    ├── tailwind.config.js    # Konfigurasi Tailwind CSS
    ├── vite.config.js        # Konfigurasi Vite dev server (:5173)
    └── README.md             # Dokumentasi teknis frontend
```

---

## ⚡ Panduan Cepat Menjalankan Seluruh Aplikasi

### 1. Prasyarat Sistem
- **MySQL Server**: Aktif pada Laragon / XAMPP (port `3306`).
- **Golang**: Versi `1.20+` terpasang.
- **Node.js**: Versi `18+` terpasang.

---

### 2. Jalankan Backend (Terminal 1)
```powershell
cd todo-backend
go run main.go
```
> Server REST API akan berjalan di: **http://localhost:8080**  
> Database `todo_db` dan tabel `todos` akan otomatis dibuat oleh sistem (*auto migration*).

---

### 3. Jalankan Frontend (Terminal 2)
```powershell
cd todo-frontend
npm install
npm run dev
```
> Aplikasi web akan berjalan di: **http://localhost:5173**

Buka peramban (browser) dan akses alamat **http://localhost:5173**. Aplikasi To-Do List siap digunakan!

---

## 📖 Dokumentasi Lengkap
- Untuk panduan mendalam arsitektur backend, skema tabel, dan endpoint API, silakan buka: [todo-backend/README.md](file:///d:/TELKOM/ukk-todolist/todo-backend/README.md).
- Untuk panduan mendalam arsitektur frontend, komponen React, dan state management, silakan buka: [todo-frontend/README.md](file:///d:/TELKOM/ukk-todolist/todo-frontend/README.md).

