# 📋 To-Do List REST API — Backend (UKK PPLG SMK)

Backend REST API untuk aplikasi **To-Do List** yang dibangun khusus untuk kebutuhan penilaian Uji Kompetensi Keahlian (**UKK**) Program Keahlian Pengembangan Perangkat Lunak dan GIM (**PPLG**).

Aplikasi ini dirancang dengan arsitektur modular, bersih (*clean code*), dan siap dikonsumsi langsung oleh frontend **React** (port `5173`).

---

## 🚀 Teknologi yang Digunakan

- **Bahasa Pemrograman**: [Golang](https://go.dev/) (Go 1.25+)
- **Web Framework**: [Gin Gonic](https://github.com/gin-gonic/gin)
- **Object-Relational Mapping (ORM)**: [GORM](https://gorm.io/)
- **Database Driver**: [GORM MySQL Driver](https://github.com/go-gorm/mysql)
- **Database Server**: MySQL lokal via [Laragon](https://laragon.org/)
- **CORS Middleware**: [gin-contrib/cors](https://github.com/gin-contrib/cors)

---

## 📁 Struktur Direktori Proyek

```text
todo-backend/
├── config/
│   └── database.go          # Konfigurasi koneksi MySQL Laragon & Auto-Migration
├── controllers/
│   └── todo_controller.go   # Handler logika bisnis CRUD (Get, Create, Update, Delete)
├── models/
│   └── todo.go              # Definisi struct Todo & DTO validasi request
├── go.mod                   # Deklarasi modul dan versi dependensi Go
├── go.sum                   # Checksum dependensi Go untuk integritas build
├── main.go                  # Entrypoint: setup Gin, CORS, Routing, dan Server Runner
└── README.md                # Dokumentasi lengkap proyek
```

---

## 🗄️ Skema Database & Model Data

Model `Todo` dipetakan ke tabel `todos` di database MySQL:

| Field | Tipe Data Go | Tipe Kolom MySQL | Keterangan |
|---|---|---|---|
| `id` | `uint` | `BIGINT UNSIGNED AUTO_INCREMENT` | Primary Key |
| `title` | `string` | `VARCHAR(255) NOT NULL` | Judul tugas (wajib diisi) |
| `priority` | `string` | `VARCHAR(10) DEFAULT 'medium'` | Tingkat urgensi: `low`, `medium`, `high` |
| `is_completed`| `bool` | `TINYINT(1) DEFAULT 0` | Status selesai tugas (`false` / `true`) |
| `created_at` | `time.Time` | `DATETIME` | Waktu tugas dibuat |
| `updated_at` | `time.Time` | `DATETIME` | Waktu tugas terakhir diubah |

> **Fitur Auto-Create & Auto-Migrate**:
> Skrip di `config/database.go` secara otomatis membuat database `todo_db` (jika belum ada) dan melakukan migrasi skema tabel `todos` saat aplikasi pertama kali dijalankan.

---

## ⚙️ Persyaratan Sistem

1. **Golang**: Versi `1.20` atau yang lebih baru terinstal di sistem.
2. **Laragon / XAMPP**: Web server lokal dengan MySQL aktif di port `3306`.
   - Host: `127.0.0.1`
   - Port: `3306`
   - User: `root`
   - Password: `""` (kosong)
   - Database: `todo_db`

---

## 🛠️ Panduan Instalasi & Menjalankan

### 1. Pastikan MySQL Laragon Berjalan
Buka aplikasi **Laragon** di komputer Anda, lalu klik tombol **Start All** hingga status Apache & MySQL berubah menjadi aktif (*Running*).

### 2. Buka Terminal pada Folder Proyek
Navigasikan terminal PowerShell / Command Prompt ke folder `todo-backend`:
```powershell
cd d:\TELKOM\ukk-todolist\todo-backend
```

### 3. Unduh Dependensi (Bila diperlukan)
```powershell
go mod tidy
```

### 4. Jalankan Aplikasi
```powershell
go run main.go
```

Jika berhasil, terminal akan menampilkan output:
```text
🔄 Menjalankan Auto Migration...
✅ Koneksi database MySQL Laragon berhasil & skema tabel siap digunakan!
[GIN-debug] [WARNING] Creating an Engine instance with the Logger and Recovery middleware already attached.
🚀 Server To-Do REST API berjalan di http://localhost:8080
```

---

## 🌐 Dokumentasi Endpoint REST API

Base URL: `http://localhost:8080`

### 1. Health Check
Memeriksa apakah server backend sedang aktif.
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
Mengambil daftar seluruh to-do yang diurutkan dari yang terbaru (`id` descending).
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
      "created_at": "2026-11-03T07:20:00+07:00",
      "updated_at": "2026-11-03T07:20:00+07:00"
    }
  ]
}
```

---

### 3. Menambahkan To-Do Baru
Menambahkan catatan to-do baru ke database.
- **Method**: `POST`
- **URL**: `/api/todos`
- **Header**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Belajar React dan Golang",
  "priority": "high"
}
```
*Catatan: `priority` bersifat opsional (default: `'medium'`). Nilai yang diizinkan: `'low'`, `'medium'`, `'high'`.*

- **Response `201 Created`**:
```json
{
  "data": {
    "id": 2,
    "title": "Belajar React dan Golang",
    "priority": "high",
    "is_completed": false,
    "created_at": "2026-11-03T07:21:00+07:00",
    "updated_at": "2026-11-03T07:21:00+07:00"
  }
}
```
- **Response `400 Bad Request`** (jika `title` kosong):
```json
{
  "error": "Field 'title' wajib diisi"
}
```

---

### 4. Mengubah To-Do
Mengubah judul, prioritas, atau status selesai (`is_completed`) berdasarkan ID.
- **Method**: `PUT`
- **URL**: `/api/todos/:id`
- **Header**: `Content-Type: application/json`
- **Request Body (Contoh Update Status Selesai)**:
```json
{
  "is_completed": true
}
```
- **Request Body (Contoh Update Judul & Prioritas)**:
```json
{
  "title": "Belajar React, Golang, dan Docker",
  "priority": "medium",
  "is_completed": true
}
```
- **Response `200 OK`**:
```json
{
  "data": {
    "id": 2,
    "title": "Belajar React, Golang, dan Docker",
    "priority": "medium",
    "is_completed": true,
    "created_at": "2026-11-03T07:21:00+07:00",
    "updated_at": "2026-11-03T07:22:15+07:00"
  }
}
```
- **Response `404 Not Found`** (jika ID tidak ditemukan):
```json
{
  "error": "To-do dengan ID 999 tidak ditemukan"
}
```

---

### 5. Menghapus To-Do
Menghapus to-do berdasarkan ID.
- **Method**: `DELETE`
- **URL**: `/api/todos/:id`
- **Response `200 OK`**:
```json
{
  "message": "To-do berhasil dihapus"
}
```
- **Response `404 Not Found`** (jika ID tidak ditemukan):
```json
{
  "error": "To-do dengan ID 999 tidak ditemukan"
}
```

---

## 🔒 Konfigurasi CORS (Cross-Origin Resource Sharing)

Backend telah dilengkapi middleware CORS menggunakan `github.com/gin-contrib/cors` dengan spesifikasi:
- **Allowed Origin**: `http://localhost:5173` (Frontend React Vite)
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Origin`, `Content-Type`, `Accept`, `Authorization`, `X-Requested-With`
- **Allow Credentials**: `true`

---

## 🧪 Contoh Pengujian API (cURL)

Anda dapat langsung menguji endpoint melalui Terminal menggunakan perintah cURL berikut:

```bash
# 1. Tambah Tugas Baru
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Selesaikan Proyek UKK PPLG\",\"priority\":\"high\"}"

# 2. Ambil Semua Daftar Tugas
curl http://localhost:8080/api/todos

# 3. Ubah Status Tugas Menjadi Selesai (ID 1)
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -d "{\"is_completed\":true}"

# 4. Hapus Tugas (ID 1)
curl -X DELETE http://localhost:8080/api/todos/1
```

---

## 👨‍💻 Penulis
Dibuat untuk kebutuhan Penilaian Uji Kompetensi Keahlian (**UKK**) — **PPLG SMK**.
Semoga sukses dalam ujian UKK! 🎉

