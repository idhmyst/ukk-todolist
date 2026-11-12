# 🚀 Kelarin — Fullstack To-Do List Application (UKK PPLG SMK)

Aplikasi manajemen tugas (**To-Do List**) modern, elegan, dan berstandar industri bernama **Kelarin** yang memisahkan antara frontend dan backend secara independen (*decoupled Client-Server architecture*) untuk standar penilaian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG)**.

* **URL Live Deployment (Vercel)**: [https://kelarin-eight.vercel.app/](https://kelarin-eight.vercel.app/)
* **Frontend Local**: `http://localhost:5173/`
* **Backend Local**: `http://localhost:8080/`

---

## 🏗️ Gambaran Arsitektur Proyek

```text
ukk-todolist/
├── todo-backend/             # RESTful API Golang (Gin Framework + GORM + MySQL)
│   ├── config/               # database.go: Koneksi MySQL Laragon & Auto-Migration
│   ├── controllers/          # todo_controller.go: Logika CRUD (Get, Create, Update, Delete)
│   ├── models/               # todo.go: Struct Todo, CreateTodoInput, UpdateTodoInput
│   ├── go.mod                # Modul dependensi Go
│   ├── main.go               # Router Gin, Middleware CORS, Server Runner (:8080)
│   └── README.md             # Dokumentasi teknis backend
│
└── todo-frontend/            # Single Page Application React (Vite + Tailwind CSS)
    ├── src/
    │   ├── components/       # Komponen UI: Navbar, TodoForm, FilterBar, TodoItem, EditModal, dll
    │   ├── services/         # api.js: Axios HTTP client terpusat
    │   ├── App.jsx           # State management, filter, search, & Optimistic UI
    │   └── main.jsx          # Entrypoint React Vite
    ├── index.html            # Template HTML utama
    ├── tailwind.config.js    # Konfigurasi Tailwind CSS
    ├── vite.config.js        # Konfigurasi dev server port 5173
    └── README.md             # 📘 Panduan belajar lengkap & kisi-kisi ujian UKK
```

---

## ⚡ Panduan Cepat Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Database**: 
  - **Opsi Cloud (Online)**: Menggunakan [TiDB Cloud](https://tidbcloud.com) (Gratis tanpa Laragon / XAMPP, atur di `todo-backend/.env`).
  - **Opsi Lokal (Offline)**: Laragon / XAMPP dengan MySQL aktif di port `3306`.
- **Golang**: Versi `1.20+` terpasang.
- **Node.js**: Versi `18+` terpasang.

---

### 2. Jalankan Backend (Terminal 1)
```powershell
cd todo-backend
# Salin konfigurasi environment jika belum ada
cp .env.example .env
go run main.go
```
> Server REST API akan berjalan di: **http://localhost:8080**  
> Mendukung database online (TiDB Cloud / Aiven) maupun lokal (Laragon). Tabel `todos` otomatis dibuat oleh sistem (*auto migration*).

---

### 3. Jalankan Frontend (Terminal 2)
```powershell
cd todo-frontend
npm install
npm run dev
```
> Aplikasi web akan berjalan di: **http://localhost:5173**

Buka peramban (browser) dan akses alamat **http://localhost:5173**.

---

## 📖 Dokumentasi Mendalam & Bahan Belajar UKK
Untuk membaca penjelasan detail baris per baris mengenai:
1. Cara kerja REST API, JSON, dan status code
2. Arsitektur GORM dan struct Go
3. Konsep React Hooks & Optimistic UI
4. **Kisi-kisi 8 pertanyaan guru penguji UKK beserta kunci jawabannya**

Silakan buka file: 👉 **[todo-frontend/README.md](file:///d:/TELKOM/ukk-todolist/todo-frontend/README.md)**.
