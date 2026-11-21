# 🚀 Kelarin — Smart To-Do List Application with AI Assistant & Serverless Cloud

Aplikasi manajemen tugas (**To-Do List**) cerdas, modern, dan berstandar industri dengan arsitektur *Decoupled Fullstack*, asisten cerdas berbasis **Google Gemini AI**, dan backend ganda (**Vercel Serverless Functions** untuk cloud production & **Golang Gin Framework** untuk local development). 

Dibangun khusus untuk memenuhi standar penilaian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG) SMK**.

* 🌐 **URL Live Deployment (Vercel)**: [https://kelarin-eight.vercel.app](https://kelarin-eight.vercel.app)
* 💻 **Frontend Local (Vite)**: `http://localhost:5173`
* ⚙️ **Backend Local (Golang Gin)**: `http://localhost:8080`
* 🗄️ **Cloud Database (Neon PostgreSQL)**: `ep-mute-lab-bdw7rg1o-pooler.c-8.us-east-2.aws.neon.tech`
* 🧠 **AI Engine**: Google Gemini Cloud (`gemini-3.5-flash`)

---

## 📑 Daftar Isi
1. [Latar Belakang & Gambaran Umum](#-latar-belakang--gambaran-umum)
2. [Arsitektur Sistem (Dual-Engine Architecture)](#-arsitektur-sistem-dual-engine-architecture)
3. [Fitur-Fitur Unggulan](#-fitur-fitur-unggulan)
4. [Teknologi yang Digunakan (Tech Stack)](#-teknologi-yang-digunakan-tech-stack)
5. [Skema & Struktur Database (PostgreSQL)](#-skema--struktur-database-postgresql)
6. [Dokumentasi REST API](#-dokumentasi-rest-api)
7. [Panduan Menjalankan Aplikasi di Laptop (Local Setup)](#-panduan-menjalankan-aplikasi-di-laptop-local-setup)
8. [Arsitektur Cloud Deployment (Vercel + Neon)](#-arsitektur-cloud-deployment-vercel--neon)
9. [Cara Kerja Kelarin AI (Google Gemini NLP)](#-cara-kerja-kelarin-ai-google-gemini-nlp)
10. [🎯 PANDUAN SIDANG UKK: Kunci Jawaban Pertanyaan Penguji / Mentor](#-panduan-sidang-ukk-kunci-jawaban-pertanyaan-penguji--mentor)

---

## 💡 Latar Belakang & Gambaran Umum

Aplikasi to-do list konvensional umumnya hanya menyediakan fitur mencatat teks sederhana tanpa mempertimbangkan urgensi waktu, pengingat deadline yang efektif, dan kemudahan pencatatan secara cepat. 

**Kelarin** dirancang untuk memecahkan masalah tersebut dengan menyediakan:
1. **Pencatatan Berbasis Bahasa Alami (Natural Language)**: Pengguna tidak perlu mengisi formulir manual yang panjang. Cukup ketik *"Besok jam 9 pagi buat laporan tugas, prioritas high"*, dan AI akan otomatis mengekstrak judul, deadline, prioritas, dan alarm pengingat.
2. **Proteksi Berlapis Anti-Tanggal Lampau**: Sistem memvalidasi baik di sisi client maupun server agar pengguna tidak dapat memasukkan deadline di masa lalu.
3. **Multi-Platform & Bebas Biaya Server**: Didesain berjalan di cloud tanpa biaya (*zero cost / 100% free tier*) menggunakan **Vercel Serverless Functions** dan **Neon Serverless PostgreSQL**.

---

## 🏗️ Arsitektur Sistem (Dual-Engine Architecture)

Aplikasi ini menggunakan arsitektur **Dual-Engine** yang memisahkan frontend dari backend (*decoupled client-server*):

```text
                                  +---------------------------------------+
                                  |         PENGGUNA / BROWSER            |
                                  |  https://kelarin-eight.vercel.app     |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         | (Akses di Cloud Vercel)                                 | (Akses di Laptop/Dev)
                         v                                                         v
         +-------------------------------+                         +-------------------------------+
         |    VERCEL SERVERLESS ENGINE   |                         |      GOLANG ENGINE (LOCAL)    |
         |  Node.js Edge (/api/todos)    |                         |  Gin Framework + GORM (:8080) |
         +---------------+---------------+                         +---------------+---------------+
                         |                                                         |
                         |  @neondatabase/serverless                               |  gorm.io/driver/postgres
                         +----------------------------+----------------------------+
                                                      |
                                                      v
                                      +-------------------------------+
                                      |     NEON CLOUD POSTGRESQL     |
                                      |  Lakebase Postgres with Pool  |
                                      |      (AWS us-east-2)          |
                                      +-------------------------------+
                                                      ^
                                                      |
                                      +---------------+---------------+
                                      |   GOOGLE GEMINI CLOUD AI      |
                                      |   Models: gemini-3.5-flash    |
                                      +-------------------------------+
```

### Keunggulan Arsitektur Ini:
1. **Production-Ready**: Di cloud Vercel, aplikasi tidak bergantung pada server VPS yang mahal atau laptop yang harus menyala terus. API otomatis aktif sesuai permintaan (*serverless on-demand*).
2. **Evaluasi Akademik UKK**: Menyediakan backend **Golang murni (Gin + GORM)** untuk menunjukkan kompetensi pemrograman backend berstandar industri dengan penulisan kode tipe-aman (*strongly-typed*).
3. **Database Terpusat**: Baik dijalankan via cloud Vercel maupun lokal di laptop, kedua engine terhubung ke database **Neon PostgreSQL** yang sama, sehingga data tugas selalu sinkron.

---

## ✨ Fitur-Fitur Unggulan

### 1. Manajemen Tugas Penuh (Full CRUD)
* **Create**: Menambah tugas baru lengkap dengan judul, tenggat waktu (tanggal & jam), prioritas (*low, medium, high*), dan durasi alarm pengingat (*5m, 15m, 30m, 1h*).
* **Read**: Menampilkan daftar tugas terurut dari ID terbaru, mendukung pencarian (*live search*), serta filter status (*Semua, Belum Selesai, Selesai*).
* **Update**: Mengubah judul, tanggal deadline, prioritas, serta mengubah status checklist tugas secara instan.
* **Delete**: Menghapus tugas per-item atau membersihkan seluruh tugas yang sudah selesai (*bulk clear completed*).

### 2. Kelarin AI Assistant (Google Gemini Cloud)
* Mengerti bahasa Indonesia sehari-hari untuk penjadwalan otomatis.
* Menghitung tanggal relatif (*"besok"*, *"lusa"*, *"nanti sore jam 5"*) secara presisi berdasarkan tanggal dan jam sistem waktu nyata.
* Mengembalikan data tugas terstruktur (*Structured JSON*) yang langsung dapat dimasukkan ke database dengan 1 klik tombol *"+ Tambah"*.
* Dilengkapi antarmuka **Floating Capsule Launcher** (tombol melayang) dan mode **Minimize** yang tidak menutupi daftar tugas.

### 3. Proteksi Berlapis Anti-Tanggal Lampau
* **Client-side**: Input datetime membatasi tanggal minimal (`min={currentDateTime}`) sehingga tanggal kemarin tidak dapat dipilih di kalender browser.
* **Server-side**: Controller Go dan Vercel Serverless Function menolak request dengan status `400 Bad Request` jika waktu deadline berada di masa lalu (dengan toleransi jeda 1 menit).

### 4. Audio Alert & Pengingat Notifikasi
* Membunyikan nada dering akustik (*Web Audio synthesizer & loop ringtone*) ketika tugas mencapai tenggat waktu.
* Terintegrasi dengan Web Notifications API browser untuk memunculkan notifikasi desktop/mobile.

### 5. Kalender Interaktif (Calendar View)
* Pilihan tampilan berbasis kalender bulanan (*Monthly Grid*).
* Menampilkan penanda titik warna berdasarkan prioritas tugas pada tanggal terkait.
* Memudahkan pemantauan beban kerja harian (*workload distribution*).

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

### Frontend (Client-Side):
* **Framework**: [React 18](https://react.dev/)
* **Build Tool**: [Vite 5](https://vitejs.dev/)
* **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
* **Ikon**: [Lucide React](https://lucide.dev/)
* **HTTP Client**: [Axios](https://axios-http.com/)

### Cloud Backend (Production):
* **Platform**: [Vercel](https://vercel.com/)
* **Runtime**: Node.js Serverless Functions (`/api/todos`)
* **Driver Database**: `@neondatabase/serverless` (HTTP connection pooling ultra-cepat, zero-cold start)

### Local Backend (Development):
* **Bahasa**: [Golang](https://go.dev/) (Go 1.25+)
* **Web Framework**: [Gin Gonic](https://gin-gonic.com/)
* **ORM**: [GORM](https://gorm.io/)
* **Driver Database**: `gorm.io/driver/postgres`
* **Middleware**: `gin-contrib/cors`

### Database & Cloud Storage:
* **Database Engine**: PostgreSQL 16
* **Cloud Provider**: [Neon.tech](https://neon.tech) (Serverless Lakebase Postgres)
* **Koneksi**: Pooled connection string dengan SSL Mode Require

### Artificial Intelligence:
* **Provider**: Google AI Studio (Google DeepMind)
* **Model**: `gemini-3.5-flash` / `gemini-3.5-flash-lite`

---

## 🗄️ Skema & Struktur Database (PostgreSQL)

Tabel utama yang digunakan bernama **`todos`**:

```sql
CREATE TABLE todos (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE,
    due_date VARCHAR(50) NOT NULL,
    reminder VARCHAR(20) DEFAULT '30m',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Penjelasan Kolom:
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `BIGSERIAL` / `BIGINT` | Primary Key unik dengan auto-increment. |
| `title` | `VARCHAR(255)` | Judul atau rincian tugas (wajib diisi). |
| `priority` | `VARCHAR(10)` | Tingkat urgensi: `'low'`, `'medium'`, atau `'high'` (default: `'medium'`). |
| `is_completed`| `BOOLEAN` | Status penyelesaian tugas (`false` = aktif, `true` = selesai). |
| `due_date` | `VARCHAR(50)` | Tanggal dan jam tenggat waktu dalam format ISO string (`YYYY-MM-DDTHH:mm`). |
| `reminder` | `VARCHAR(20)` | Jarak waktu notifikasi sebelum deadline (`'none'`, `'5m'`, `'15m'`, `'30m'`, `'1h'`). |
| `created_at` | `TIMESTAMP` | Waktu pencatatan data pertama kali dibuat. |
| `updated_at` | `TIMESTAMP` | Waktu terakhir data mengalami perubahan. |

---

## 📡 Dokumentasi REST API

Semua endpoint menghasilkan format response JSON terstandarisasi:

### 1. Ambil Seluruh Tugas
* **Endpoint**: `GET /api/todos`
* **Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Membuat Laporan UKK",
      "priority": "high",
      "is_completed": false,
      "due_date": "2026-11-25T09:00",
      "reminder": "30m",
      "created_at": "2026-11-22T01:00:00.000Z",
      "updated_at": "2026-11-22T01:00:00.000Z"
    }
  ]
}
```

### 2. Tambah Tugas Baru
* **Endpoint**: `POST /api/todos`
* **Payload Request**:
```json
{
  "title": "Mengerjakan Modul Go",
  "priority": "high",
  "due_date": "2026-11-26T14:00",
  "reminder": "15m"
}
```
* **Response (201 Created)**: Mengembalikan objek tugas yang baru disimpan beserta ID-nya.

### 3. Update Tugas
* **Endpoint**: `PUT /api/todos/:id`
* **Payload Request**:
```json
{
  "is_completed": true,
  "title": "Mengerjakan Modul Go (Selesai)"
}
```
* **Response (200 OK)**: Mengembalikan data tugas terbaru yang telah diperbarui.

### 4. Hapus Tugas Berdasarkan ID
* **Endpoint**: `DELETE /api/todos/:id`
* **Response (200 OK)**:
```json
{
  "message": "To-do berhasil dihapus"
}
```

### 5. Bersihkan Semua Tugas yang Selesai
* **Endpoint**: `DELETE /api/todos/completed`
* **Response (200 OK)**:
```json
{
  "message": "Semua tugas yang telah selesai berhasil dibersihkan",
  "deleted": 3
}
```

---

## 💻 Panduan Menjalankan Aplikasi di Laptop (Local Setup)

### 1. Prasyarat Sistem
* [Golang](https://go.dev/) versi 1.20 atau yang lebih baru.
* [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru.
* Koneksi internet (untuk mengunduh modul dan terhubung ke Neon Cloud Database).

### 2. Jalankan Backend Go (Terminal 1)
```bash
# Pindah ke direktori backend
cd todo-backend

# Jalankan server Gin
go run main.go
```
> Server Go akan aktif di: **`http://localhost:8080`**  
> Database otomatis terhubung ke Neon PostgreSQL dan melakukan auto-migration tabel `todos`.

### 3. Jalankan Frontend React (Terminal 2)
```bash
# Pindah ke direktori frontend
cd todo-frontend

# Pasang dependensi (hanya pertama kali)
npm install

# Jalankan dev server Vite
npm run dev
```
> Buka browser dan akses: **`http://localhost:5173`**

---

## ☁️ Arsitektur Cloud Deployment (Vercel + Neon)

### Mengapa Menggunakan Vercel + Neon (Bukan Render / VPS)?
1. **Bebas Kartu Kredit (100% Free Tier)**: Platform seperti Render meminta verifikasi kartu kredit (*Add Card Stripe*) meskipun memilih paket gratis. Vercel dan Neon tidak memerlukan kartu kredit sama sekali.
2. **Serverless Connection Pooling**: Koneksi database tradisional cepat kehabisan batas kuota koneksi (*max connections limit*). Driver `@neondatabase/serverless` menggunakan protokol HTTP/WebSocket dengan connection pooling terintegrasi, sehingga mampu melayani ribuan request bersamaan tanpa putus koneksi.
3. **Continuous Deployment (CI/CD)**: Setiap kali kode di-push ke branch `main` di GitHub, Vercel secara otomatis menjalankan build dan memperbarui website dalam 15 detik tanpa henti (*zero downtime*).

---

## 🧠 Cara Kerja Kelarin AI (Google Gemini NLP)

1. **Input Pengguna**: Pengguna mengetik kalimat bebas di kolom chat, misalnya:  
   *"Tolong ingatkan besok jam 14:00 ada bimbingan UKK dengan mentor, prioritas high, notif 15 menit."*
2. **Injeksi Konteks Waktu Sistem**: Di [`aiService.js`](file:///d:/TELKOM/ukk-todolist/todo-frontend/src/services/aiService.js), aplikasi menginjeksi waktu lokal saat ini (Hari, Tanggal, Jam, dan Zona Waktu) ke dalam prompt sistem sebagai acuan mutlak kalkulasi.
3. **Structured Prompting**: Gemini diinstruksikan untuk menghasilkan output dalam format JSON murni:
   ```json
   {
     "reply": "Siap! Jadwal bimbingan UKK untuk besok jam 14:00 sudah saya siapkan.",
     "action": "create_todos",
     "todos": [
       {
         "title": "Bimbingan UKK dengan mentor",
         "priority": "high",
         "due_date": "2026-11-23T14:00",
         "reminder": "15m"
       }
     ]
   }
   ```
4. **Rendering Interaktif**: Frontend menerima JSON tersebut dan menampilkan kartu tugas interaktif dengan tombol **"+ Tambah"**. Pengguna tinggal mengklik tombol tersebut untuk langsung menyimpannya ke database Neon.

---

## 🎯 PANDUAN SIDANG UKK: Kunci Jawaban Pertanyaan Penguji / Mentor

Gunakan panduan tanya-jawab ini saat presentasi di depan guru penguji atau mentor industri:

---

### Q1: "Mengapa aplikasi ini memisahkan Frontend dan Backend (Decoupled Client-Server)?"
> **Jawaban Anda:**  
> *"Pemisahan ini mengikuti standar industri modern (**Separation of Concerns**). Frontend hanya bertugas menangani tampilan antarmuka (UI/UX) dan pengalaman pengguna yang reaktif menggunakan React, sedangkan Backend bertugas mengamankan logika bisnis, validasi data, dan interaksi database.*  
> *Keuntungannya: aplikasi menjadi sangat modular. Di masa depan, jika kita ingin membuat aplikasi mobile Android/iOS, kita tidak perlu membuat ulang backend—cukup mengonsumsi REST API yang sama yang sudah ada."*

---

### Q2: "Mengapa memilih PostgreSQL di Neon Cloud daripada MySQL lokal (Laragon/XAMPP)?"
> **Jawaban Anda:**  
> *"Pertama, **PostgreSQL** memiliki integritas data yang sangat ketat, tipe data yang kaya (seperti JSONB dan timezone-aware timestamps), serta performa query yang superior.*  
> *Kedua, **Neon Cloud** merupakan arsitektur Lakebase Postgres Serverless yang memisahkan storage dari compute. Neon memiliki fitur **Connection Pooling** terintegrasi, autoscaling, dan backup otomatis. Dengan menggunakan Neon, aplikasi dapat diakses secara online dari perangkat mana pun di dunia tanpa bergantung pada laptop pengembang yang harus menyala terus."*

---

### Q3: "Bagaimana cara kerja backend di cloud jika tidak menyewa server VPS atau Render?"
> **Jawaban Anda:**  
> *"Aplikasi ini menerapkan arsitektur **Vercel Serverless Functions**. Setiap endpoint di folder `/api/todos` adalah fungsi JavaScript mandiri yang dieksekusi di lingkungan AWS edge milik Vercel hanya ketika ada permintaan request HTTP yang masuk.*  
> *Fungsi ini terhubung ke Neon PostgreSQL menggunakan driver resmi `@neondatabase/serverless` yang berbasis HTTP pooled transport. Pendekatan ini membuat aplikasi berbiaya Rp 0, hemat resource, bebas cold-start, dan tidak memerlukan server VPS yang harus disewa atau dikelola manual."*

---

### Q4: "Bagaimana alur kerja fitur AI Assistant (Kelarin AI) dalam mengubah teks chat menjadi tugas di database?"
> **Jawaban Anda:**  
> *"Alurnya melalui 4 tahapan (**NLP Pipeline**):*  
> 1. *Frontend membaca input bahasa alami pengguna.*  
> 2. *Frontend menginjeksi konteks waktu sistem waktu nyata (misal: hari ini tanggal 22 November 2026 jam 01:00) ke dalam system prompt instruksi.*  
> 3. *Request dikirimkan ke model **Google Gemini 3.5 Flash** melalui REST API dengan mode response MIME `application/json`.*  
> 4. *AI melakukan kalkulasi waktu relatif (misal 'besok jam 9' dihitung menjadi `2026-11-23T09:00`) dan mengembalikan Structured JSON berisi array tugas.*  
> 5. *Frontend mem-parsing JSON tersebut ke dalam komponen kartu tugas yang siap disimpan ke database hanya dengan 1 kali klik."*

---

### Q5: "Bagaimana Anda menjamin keamanan aplikasi dari serangan SQL Injection dan CORS?"
> **Jawaban Anda:**  
> 1. *Untuk **SQL Injection**: Di backend Golang, kami menggunakan **GORM ORM** yang menerapkan parameterized queries secara otomatis. Di backend Serverless Vercel, kami menggunakan tagged-template queries dari `@neondatabase/serverless` sehingga input pengguna tidak pernah digabungkan secara mentah (raw concatenation) ke string SQL.*  
> 2. *Untuk **CORS (Cross-Origin Resource Sharing)**: Di backend Go kami mengunci domain yang diizinkan hanya pada origin terpercaya (`https://kelarin-eight.vercel.app` dan `localhost`). Di Vercel, API dan Frontend berada di satu domain yang sama (`same-origin`), sehingga secara alami kebal terhadap serangan CORS antar-domain.*  
> 3. *Untuk **Kredensial**: Tidak ada password database yang ditulis mentah di kode sumber. Semua kredensial dimuat melalui environment variable (`DATABASE_URL`)."*

---

### Q6: "Bagaimana sistem memastikan pengguna tidak memasukkan tanggal deadline yang sudah lewat (hari kemarin)?"
> **Jawaban Anda:**  
> *"Kami menerapkan sistem **Defense-in-Depth (Proteksi Berlapis)**:*  
> * Di sisi **Frontend (UI)**: Input HTML datetime-local dibatasi atribut `min` yang diisi waktu sistem saat ini, sehingga pemilih kalender otomatis mengunci dan menonaktifkan tanggal-tanggal lampau.*  
> * Di sisi **Backend (API)**: Controller backend mem-parsing string `due_date`, mengubahnya menjadi objek waktu, lalu membandingkannya dengan `time.Now()`. Jika waktu target lebih awal dari waktu sekarang (diberikan toleransi jeda 1 menit), backend langsung menolak request dengan status `400 Bad Request` dan pesan error 'Tenggat waktu tidak boleh tanggal yang sudah lewat'."*

---

### Q7: "Apa itu Optimistic UI dan apakah aplikasi ini menerapkannya?"
> **Jawaban Anda:**  
> *"Ya, aplikasi ini menerapkan konsep **Optimistic UI Update** saat pengguna mengubah status checklist tugas (selesai/belum selesai).*  
> *Ketika kotak checklist dicentang, antarmuka React langsung memperbarui state visual tugas menjadi selesai tanpa menunggu jawaban jaringan server terlebih dahulu. Di balik layar, request asynchronous `PUT /api/todos/:id` dikirimkan ke database. Jika request berhasil, state tetap terjaga; jika terjadi kegagalan jaringan, state otomatis dikembalikan ke kondisi semula (**rollback**) dan pesan error ditampilkan. Ini menghasilkan pengalaman pengguna yang instan tanpa jeda."*

---

### Q8: "Di backend Golang, apa keunggulan menggunakan Gin Gonic dibanding library bawaan net/http?"
> **Jawaban Anda:**  
> *"Gin Gonic menggunakan custom tree-based routing (**Radix Tree Router**) yang merupakan salah satu router tercepat di ekosistem Go dengan konsumsi memori yang sangat kecil (zero-allocation).*  
> *Selain performa tinggi, Gin menyediakan fitur bawaan yang sangat mempermudah pengembangan seperti JSON binding/validation otomatis (`binding:"required"`), manajemen grup routing (`r.Group("/api")`), middleware crash recovery, dan penanganan format response JSON yang sangat bersih."*

---

### Q9: "Mengapa Anda memutuskan tidak menggunakan AI lokal (Ollama) dan memilih Google Gemini Cloud?"
> **Jawaban Anda:**  
> *"Ollama sangat baik untuk penggunaan offline mandiri di laptop, namun untuk aplikasi web yang di-deploy ke publik (seperti di Vercel), Ollama lokal memiliki kendala arsitektur:*  
> * Laptop pengembang harus selalu menyala dan terhubung ke internet.*  
> * Membutuhkan setup tunnel perantara (seperti Cloudflare Tunnel/ngrok) yang URL-nya sering berganti-ganti jika koneksi terputus.*  
> * Browser memblokir koneksi dari website HTTPS ke HTTP localhost karena aturan keamanan **Mixed Content** dan **Private Network Access (PNA)**.*  
> *Dengan beralih ke **Google Gemini Cloud AI**, aplikasi menjadi 100% mandiri, bebas maintenance, tidak membebani RAM/GPU laptop, dan dapat diakses secara lancar oleh mentor atau penguji kapan saja dan dari perangkat apa saja termasuk smartphone."*

---

### Q10: "Jika mentor meminta Anda menambah fitur baru, seberapa mudah arsitektur ini dikembangkan?"
> **Jawaban Anda:**  
> *"Sangat mudah dan terukur (**Extensible**). Karena arsitekturnya modular:*  
> * Jika ingin menambah kolom baru (misal kategori tugas atau tagging), kita cukup menambahkan field di struct `models/todo.go` (backend Go otomatis melakukan auto-migrate tabel) dan menambahkan field di DTO payload Vercel.*  
> * Komponen frontend di React sudah dibagi ke dalam atom-atom komponen kecil di folder `components/` (seperti `TodoForm`, `TodoItem`, `FilterBar`, `CalendarView`), sehingga penambahan elemen UI baru tidak akan merusak fitur yang sudah berjalan."*

---

## 👨‍💻 Profil Pengembang
* **Nama**: Idham Baihaqi
* **Program Keahlian**: Pengembangan Perangkat Lunak dan GIM (PPLG)
* **Sekolah**: SMK Telkom
* **Proyek**: Uji Kompetensi Keahlian (UKK) Fullstack Web Application — **Kelarin**
* **Repository**: [https://github.com/idhmyst/ukk-todolist](https://github.com/idhmyst/ukk-todolist)
