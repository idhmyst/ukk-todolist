# 📋 To-Do List REST API — Backend (UKK PPLG SMK)

Backend REST API untuk aplikasi **To-Do List** yang dibangun khusus untuk kebutuhan penilaian Uji Kompetensi Keahlian (**UKK**) Program Keahlian Pengembangan Perangkat Lunak dan GIM (**PPLG**).

Aplikasi ini dirancang dengan arsitektur modular, bersih (*clean code*), siap dikonsumsi langsung oleh frontend **React** (port `5173`/`5174`), dan **mendukung fleksibilitas database**: baik **MySQL Lokal (Laragon)** maupun **Cloud Database Online (TiDB Cloud / Aiven / Railway)** via environment variable `.env`.

---

## 🚀 Teknologi yang Digunakan

- **Bahasa Pemrograman**: [Golang](https://go.dev/) (Go 1.25+)
- **Web Framework**: [Gin Gonic](https://github.com/gin-gonic/gin)
- **Object-Relational Mapping (ORM)**: [GORM](https://gorm.io/)
- **Database Driver**: [GORM MySQL Driver](https://github.com/go-gorm/mysql)
- **Database Server**: MySQL Lokal (Laragon) atau Cloud Database MySQL (TiDB Cloud / Aiven)
- **Environment Manager**: [godotenv](https://github.com/joho/godotenv)
- **CORS Middleware**: [gin-contrib/cors](https://github.com/gin-contrib/cors)

---

## 📁 Struktur Direktori Proyek

```text
todo-backend/
├── config/
│   └── database.go          # Koneksi Database (Lokal / Cloud) & Auto-Migration
├── controllers/
│   └── todo_controller.go   # Handler logika bisnis CRUD (Get, Create, Update, Delete)
├── models/
│   └── todo.go              # Definisi struct Todo & DTO validasi request
├── .env                     # File konfigurasi kredensial (lokal/cloud)
├── .env.example             # Template contoh konfigurasi environment
├── .gitignore               # Konfigurasi file yang diabaikan Git
├── go.mod                   # Deklarasi modul dan versi dependensi Go
├── go.sum                   # Checksum dependensi Go untuk integritas build
├── main.go                  # Entrypoint: setup Gin, CORS, Routing, dan Server Runner
└── README.md                # Dokumentasi teknis backend
```

---

## ☁️ Konfigurasi Database: Cloud vs Lokal

Backend ini telah dilengkapi sistem pemuatan konfigurasi dinamis melalui file **`.env`**. Anda bebas memilih ingin menggunakan **Database Online (Cloud)** atau **Database Lokal (Laragon)** tanpa mengubah kode Go satu baris pun!

### Opsi 1: Menggunakan Cloud Database Online (Direkomendasikan)
Cocok jika Anda ingin aplikasi bisa diakses dari mana saja tanpa perlu menyalakan Laragon lokal di laptop.

Rekomendasi layanan gratis terbaik: **[TiDB Cloud](https://tidbcloud.com)**
- 100% kompatibel dengan MySQL & GORM
- Gratis 5 GB selamanya (tanpa perlu kartu kredit)
- Setup instan dalam 1 menit

**Langkah Setup TiDB Cloud:**
1. Daftar akun di [https://tidbcloud.com](https://tidbcloud.com).
2. Buat cluster bertipe **Serverless** (pilih region terdekat, misalnya *Singapore*).
3. Setelah cluster aktif, klik **Connect**, buat password, dan catat: **Host**, **Port**, **User**, dan **Password**.
4. Buka file `.env` di folder `todo-backend` dan sesuaikan nilainya:

```env
# Konfigurasi Cloud Database (TiDB Cloud)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=2xxxxxx.root
DB_PASSWORD=password_tidb_anda
DB_NAME=test
DB_SSL=true

PORT=8080
```
> **Catatan SSL**: Untuk database cloud, pastikan opsi `DB_SSL=true` aktif karena cloud provider mewajibkan enkripsi TLS/SSL.

---

### Opsi 2: Menggunakan Database Lokal (Laragon)
Jika Anda ingin tetap menjalankan database secara offline di komputer lokal:

1. Buka aplikasi **Laragon** dan klik **Start All**.
2. Pastikan file `.env` berisi konfigurasi lokal:

```env
# Konfigurasi Database Lokal Laragon
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=todo_db
DB_SSL=false

PORT=8080
```

> **Fitur Auto-Create Database Lokal**:
> Jika memilih host lokal (`127.0.0.1` / `localhost`), aplikasi akan secara otomatis membuat database `todo_db` jika belum ada di Laragon Anda.

---

## 🗄️ Skema Database & Model Data

Model `Todo` dipetakan ke tabel `todos` di database MySQL:

| Field | Tipe Data Go | Tipe Kolom MySQL | Keterangan |
|---|---|---|---|
| `id` | `uint` | `BIGINT UNSIGNED AUTO_INCREMENT` | Primary Key |
| `title` | `string` | `VARCHAR(255) NOT NULL` | Judul tugas (wajib diisi) |
| `priority` | `string` | `VARCHAR(10) DEFAULT 'medium'` | Tingkat urgensi: `low`, `medium`, `high` |
| `is_completed`| `bool` | `TINYINT(1) DEFAULT 0` | Status selesai tugas (`false` / `true`) |
| `due_date` | `string` | `VARCHAR(50)` | Tanggal deadline tugas (opsional / nullable) |
| `created_at` | `time.Time` | `DATETIME` | Waktu tugas dibuat |
| `updated_at` | `time.Time` | `DATETIME` | Waktu tugas terakhir diubah |

> **Fitur Auto-Migration**:
> GORM akan secara otomatis membuatkan atau memperbarui skema tabel `todos` baik di database cloud maupun lokal setiap kali aplikasi dijalankan.

---

## 🛠️ Panduan Instalasi & Menjalankan

### 1. Buka Terminal pada Folder Proyek
```powershell
cd d:\TELKOM\ukk-todolist\todo-backend
```

### 2. Buat File Konfigurasi `.env`
Salin dari template `.env.example` jika belum ada file `.env`:
```powershell
cp .env.example .env
```
Sesuaikan kredensial database Anda (Cloud TiDB atau Lokal Laragon) di dalam file `.env`.

### 3. Unduh Dependensi Modul
```powershell
go mod tidy
```

### 4. Jalankan Aplikasi
```powershell
go run main.go
```

Jika berhasil, terminal akan menampilkan output:
```text
🔌 Menghubungkan ke database...
🔄 Menjalankan Auto Migration skema tabel...
✅ Berhasil terhubung ke database & skema tabel siap digunakan!
🚀 Server To-Do REST API berjalan di http://localhost:8080
```

---

## 🌐 Dokumentasi Endpoint REST API

Base URL: `http://localhost:8080`

### 1. Health Check
- **Method**: `GET`
- **URL**: `/`
- **Response `200 OK`**:
```json
{
  "message": "REST API To-Do List (UKK PPLG) aktif",
  "status": "healthy"
}
```

---

### 2. Mengambil Semua To-Do
- **Method**: `GET`
- **URL**: `/api/todos`
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Membuat Desain UI Frontend",
      "priority": "high",
      "is_completed": false,
      "due_date": "2026-11-20",
      "created_at": "2026-11-12T07:15:00+07:00",
      "updated_at": "2026-11-12T07:15:00+07:00"
    }
  ]
}
```

---

### 3. Menambahkan To-Do Baru
- **Method**: `POST`
- **URL**: `/api/todos`
- **Header**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Belajar React dan Golang",
  "priority": "high",
  "due_date": "2026-11-25"
}
```
- **Response `201 Created`**:
```json
{
  "data": {
    "id": 2,
    "title": "Belajar React dan Golang",
    "priority": "high",
    "is_completed": false,
    "due_date": "2026-11-25",
    "created_at": "2026-11-12T07:16:00+07:00",
    "updated_at": "2026-11-12T07:16:00+07:00"
  }
}
```

---

### 4. Mengubah To-Do
- **Method**: `PUT`
- **URL**: `/api/todos/:id`
- **Header**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "is_completed": true,
  "title": "Belajar React, Golang, dan Cloud DB",
  "priority": "high"
}
```
- **Response `200 OK`**:
```json
{
  "data": {
    "id": 2,
    "title": "Belajar React, Golang, dan Cloud DB",
    "priority": "high",
    "is_completed": true,
    "due_date": "2026-11-25",
    "created_at": "2026-11-12T07:16:00+07:00",
    "updated_at": "2026-11-12T07:17:30+07:00"
  }
}
```

---

### 5. Menghapus To-Do
- **Method**: `DELETE`
- **URL**: `/api/todos/:id`
- **Response `200 OK`**:
```json
{
  "message": "To-do berhasil dihapus"
}
```

---

## 🔒 Konfigurasi CORS
Backend mengizinkan origin frontend React di:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## 👨‍💻 Penulis
Dibuat untuk kebutuhan Penilaian Uji Kompetensi Keahlian (**UKK**) — **PPLG SMK**.
Semoga sukses dalam ujian UKK! 🎉
