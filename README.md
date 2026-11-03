# 🚀 Kelarin — Fullstack To-Do List Application (UKK PPLG SMK)

**Kelarin** adalah aplikasi manajemen tugas (To-Do List) berbasis **Fullstack Web** modern, elegan, dan responsif yang dibangun khusus untuk pengujian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG)**.

Proyek ini menerapkan arsitektur *Client-Server* modern yang memisahkan antara frontend dan backend secara independen (*decoupled architecture*):
- **Frontend**: Single Page Application (SPA) berbasis **React (Vite)** dan **Tailwind CSS**.
- **Backend**: High-performance RESTful API berbasis **Golang (Gin Framework)** dan **GORM ORM** terhubung ke **MySQL Database**.

---

## 📂 Struktur Proyek

```text
ukk-todolist/
├── todo-backend/             # REST API Golang (Gin + GORM + MySQL)
│   ├── config/               # Koneksi database & auto-migration
│   ├── controllers/          # Logika CRUD to-do (Get, Create, Update, Delete)
│   ├── models/               # Struct model data (id, title, priority, due_date, is_completed)
│   ├── main.go               # Entrypoint & router Gin (:8080)
│   └── README.md             # Dokumentasi teknis backend
│
└── todo-frontend/            # Client SPA React (Vite + Tailwind CSS)
    ├── src/
    │   ├── components/       # Komponen UI: Navbar, TodoForm, FilterBar, TodoItem, EditModal, dll
    │   ├── services/         # Axios client untuk REST API backend (:8080)
    │   ├── App.jsx           # State management, filter, search, & optimistic UI
    │   └── main.jsx          # Entrypoint React
    ├── index.html            # Template HTML utama
    ├── tailwind.config.js    # Konfigurasi Tailwind CSS
    ├── vite.config.js        # Konfigurasi Vite dev server (:5173)
    └── README.md             # Dokumentasi teknis frontend
```

---

## ⚡ Panduan Menjalankan Aplikasi

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

Buka peramban (browser) dan akses alamat **http://localhost:5173**.
