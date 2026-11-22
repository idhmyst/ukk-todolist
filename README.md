# 🚀 Kelarin — Smart To-Do List Application with Dual AI Assistant & Serverless Cloud

Aplikasi manajemen tugas (**To-Do List**) cerdas, modern, dan berstandar industri dengan arsitektur *Decoupled Fullstack*, asisten cerdas ganda berbasis **Groq LPU (Ultra-Cepat) & Google Gemini Cloud AI**, serta backend ganda (**Vercel Serverless Functions** untuk cloud production & **Golang Gin Framework** untuk local development). 

Dibangun khusus untuk memenuhi standar penilaian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG) SMK**.

* 🌐 **URL Live Deployment (Vercel)**: [https://kelarin-eight.vercel.app](https://kelarin-eight.vercel.app)
* 💻 **Frontend Local (Vite)**: `http://localhost:5173`
* ⚙️ **Backend Local (Golang Gin)**: `http://localhost:8080`
* 🗄️ **Cloud Database (Neon PostgreSQL)**: `ep-mute-lab-bdw7rg1o-pooler.c-8.us-east-2.aws.neon.tech`
* 🧠 **AI Engines**: 
  * ⚡ **Groq Cloud LPU** (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) — Inferensi ultra-cepat < 1 detik.
  * ✨ **Google Gemini Cloud** (`gemini-3.5-flash`, `gemini-3.5-flash-lite`) — DeepMind multimodal LLM.

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

## 🛠️ Framework & Teknologi yang Digunakan (Tech Stack)

Aplikasi **Kelarin** mengombinasikan framework modern terbaik di ekosistem web untuk menghasilkan aplikasi yang berkinerja tinggi, modular, dan siap digunakan secara publik (*production-ready*).

### 1. Frontend (Sisi Klien / Antarmuka)
* **Framework Utama: [React 18](https://react.dev/)**
  * **Fungsi**: Membangun Single Page Application (SPA) yang interaktif, reaktif, dan modular berbasis komponen (*component-driven*).
  * **Alasan Dipilih**: Merupakan library/framework frontend standar industri terpopuler di dunia kerja. React memungkinkan pembaruan antarmuka secara instan menggunakan Virtual DOM, manajemen state lokal yang rapi via React Hooks (`useState`, `useEffect`, `useCallback`), serta mempermudah penerapan konsep *Optimistic UI* saat pengguna mencentang tugas.
* **Build Tool & Bundler: [Vite 5](https://vitejs.dev/)**
  * **Fungsi**: Menyediakan server pengembangan lokal (*local dev server*) dan mengompilasi kode React menjadi aset statis (HTML/CSS/JS) saat di-deploy.
  * **Alasan Dipilih**: Jauh lebih cepat dibanding bundler lama seperti Webpack / Create React App (CRA). Vite memanfaatkan Native ES Modules sehingga proses *Hot Module Replacement* (HMR) terjadi dalam hitungan milidetik tanpa memuat ulang seluruh halaman.
* **CSS Framework: [Tailwind CSS 3](https://tailwindcss.com/)**
  * **Fungsi**: Mendesain antarmuka aplikasi secara responsif (mendukung layar smartphone, tablet, hingga desktop) dengan sistem kelas utility.
  * **Alasan Dipilih**: Menghemat waktu penulisan kode CSS, tidak membutuhkan file CSS terpisah yang menumpuk, serta menghasilkan desain modern (*clean, minimalis, dan elegan*) sesuai tren aplikasi produktivitas masa kini.
* **Komponen Ikon: [Lucide React](https://lucide.dev/)**
  * **Fungsi & Alasan**: Kumpulan ikon SVG ringan yang konsisten untuk elemen tombol, filter status, checklist, kalender, lonceng notifikasi, dan maskot AI.
* **HTTP Client: [Axios](https://axios-http.com/)**
  * **Fungsi & Alasan**: Menangani komunikasi data asinkron (*asynchronous HTTP requests*) antara browser dengan REST API backend, dilengkapi penanganan error dan parsing data JSON secara otomatis.

---

### 2. Backend (Sisi Server & Pengolahan Data)
Aplikasi ini dirancang dengan **Dual-Engine Architecture** (dua backend yang saling melengkapi):

* **Engine 1 (Local Development & Ujian Keahlian UKK): [Golang (Go)](https://go.dev/)**
  * **Web Framework: [Gin Gonic](https://gin-gonic.com/) (`github.com/gin-gonic/gin`)**
    * **Fungsi**: Menangani routing endpoint REST API (`/api/todos`), parsing payload JSON, middleware CORS, serta validasi request.
    * **Alasan Dipilih**: Gin merupakan salah satu web framework tercepat di dunia pemrograman Go. Menggunakan algoritma *Radix Tree Router*, Gin memiliki konsumsi memori yang sangat minim (*zero memory allocation*) dan performa *throughput* puluhan ribu request per detik.
  * **ORM (Object Relational Mapping): [GORM](https://gorm.io/)**
    * **Fungsi**: Menjembatani kode Go dengan tabel database PostgreSQL.
    * **Alasan Dipilih**: Mengeliminasi risiko kerentanan keamanan SQL Injection melalui fitur *parameterized queries* bawaan, serta menyediakan fitur *Auto-Migrate* yang otomatis membuat atau menyesuaikan skema tabel `todos` saat server Go dijalankan.
  * **CORS Middleware: `gin-contrib/cors`**
    * **Fungsi**: Mengamankan akses lintas origin antara frontend Vite (`localhost:5173`) dan backend Go (`localhost:8080`).

* **Engine 2 (Cloud Production Deployment): [Vercel Serverless Functions](https://vercel.com/)**
  * **Runtime**: Node.js Serverless Edge
  * **Fungsi**: Melayani endpoint REST API `/api/todos` di lingkungan cloud publik secara otomatis tanpa perlu menyewa atau menyalakan server VPS terus-menerus.
  * **Driver Database: `@neondatabase/serverless`**
    * **Alasan Dipilih**: Driver resmi Neon untuk lingkungan serverless yang menggunakan protokol HTTP/WebSocket dengan *connection pooling* terintegrasi. Hal ini mengatasi masalah klasik serverless seperti kehabisan kuota koneksi (*connection exhaustion*) dan jeda *cold start*.

---

### 3. Database & Artificial Intelligence (Dual AI Engine)
* **Database: PostgreSQL 16 di [Neon.tech](https://neon.tech)**
  * **Fungsi**: Menyimpan data seluruh tugas, status penyelesaian, prioritas, tenggat waktu, dan alarm pengingat secara persisten.
  * **Alasan Dipilih**: Relational Database Management System (RDBMS) dengan standar integritas ACID tertinggi, mendukung tipe data waktu yang akurat dengan zona waktu (*timezone-aware*), serta fitur autoscaling dan automated backup dari Neon Cloud.
* **AI Engine 1 (Primary / Default): [Groq Cloud LPU](https://groq.com/)**
  * **Model**: `openai/gpt-oss-120b` & `qwen/qwen3.8-27b`
  * **Fungsi**: Memproses bahasa alami manusia (*Natural Language Processing / NLP*) dari kolom chat, menghitung waktu relatif secara presisi, dan menghasilkan *Structured JSON*.
  * **Alasan Dipilih**: Menggunakan chip LPU (*Language Processing Unit*) rancangan Groq yang menghasilkan kecepatan inferensi paling kencang di dunia (< 1 detik per respons) dengan kompatibilitas format JSON murni.
* **AI Engine 2 (Secondary / Fallback): [Google Gemini Cloud](https://ai.google.dev/)**
  * **Model**: `gemini-3.5-flash` / `gemini-3.5-flash-lite`
  * **Fungsi & Alasan**: Model LLM frontier generasi terbaru dari Google DeepMind dengan akurasi pemahaman konteks bahasa Indonesia tingkat tinggi, bertindak sebagai *auto-fallback* jika salah satu provider mengalami *rate-limit*.

---

### 💡 Rangkuman Cara Menjelaskan Framework & AI ke Mentor / Guru Penguji:
> *"Aplikasi Kelarin dibangun menggunakan pemisahan client-server. Di sisi frontend, kami menggunakan **React 18** dengan build-tool **Vite** dan styling **Tailwind CSS**. Di sisi backend lokal, kami menggunakan **Golang** dengan framework **Gin Gonic** dan ORM **GORM** untuk membuktikan penguasaan backend berkinerja tinggi. Untuk live demo di cloud, kami menggunakan arsitektur **Serverless di Vercel** yang terhubung langsung ke cloud database **Neon PostgreSQL**. Sedangkan untuk asisten cerdasnya, kami mengintegrasikan **Dual-Engine AI (Groq LPU & Google Gemini Cloud)** yang mampu menghasilkan kalkulasi jadwal otomatis dalam waktu kurang dari 1 detik."*

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

## 🧠 Cara Kerja Kelarin AI (Groq LPU & Google Gemini NLP)

1. **Input Pengguna**: Pengguna mengetik kalimat bebas di kolom chat, misalnya:  
   *"Tolong ingatkan besok jam 14:00 ada bimbingan UKK dengan mentor, prioritas high, notif 15 menit."*
2. **Injeksi Konteks Waktu Sistem**: Di [`aiService.js`](file:///d:/TELKOM/ukk-todolist/todo-frontend/src/services/aiService.js), aplikasi menginjeksi waktu lokal saat ini (Hari, Tanggal, Jam, dan Zona Waktu) ke dalam prompt sistem sebagai acuan mutlak kalkulasi.
3. **Structured Prompting**: Engine **Groq LPU** (atau **Google Gemini**) diinstruksikan untuk menghasilkan output dalam format JSON murni:
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

### Q1: "Aplikasi ini menggunakan framework apa saja dan mengapa memilih framework tersebut?"
> **Jawaban Anda:**  
> *"Proyek ini memadukan framework modern terbaik di frontend maupun backend:*  
> 1. *Di sisi **Frontend**, kami menggunakan framework **React 18** didukung build tool **Vite 5** dan styling **Tailwind CSS 3**. React dipilih karena merupakan standar industri untuk Single Page Application (SPA) yang modular dan reaktif, sementara Tailwind mempercepat pembuatan antarmuka modern yang bersih dan responsif di mobile maupun desktop.*  
> 2. *Di sisi **Backend Lokal**, kami menggunakan **Golang** dengan web framework **Gin Gonic** dan ORM **GORM**. Gin dipilih karena kecepatan routing-nya yang sangat tinggi (berbasis Radix Tree) dengan konsumsi RAM yang sangat hemat, serta GORM yang melindungi database dari SQL Injection secara otomatis.*  
> 3. *Di sisi **Cloud Production**, kami menerapkan arsitektur **Vercel Serverless Functions** (Node.js runtime) yang terhubung ke cloud database **PostgreSQL di Neon.tech** menggunakan connection pooling HTTP, sehingga aplikasi live 24/7 tanpa perlu server VPS berbayar."*

---

### Q2: "Mengapa aplikasi ini memisahkan Frontend dan Backend (Decoupled Client-Server)?"
> **Jawaban Anda:**  
> *"Pemisahan ini mengikuti standar industri modern (**Separation of Concerns**). Frontend hanya bertugas menangani tampilan antarmuka (UI/UX) dan pengalaman pengguna yang reaktif menggunakan React, sedangkan Backend bertugas mengamankan logika bisnis, validasi data, dan interaksi database.*  
> *Keuntungannya: aplikasi menjadi sangat modular. Di masa depan, jika kita ingin membuat aplikasi mobile Android/iOS, kita tidak perlu membuat ulang backend—cukup mengonsumsi REST API yang sama yang sudah ada."*

---

### Q3: "Mengapa memilih PostgreSQL di Neon Cloud daripada MySQL lokal (Laragon/XAMPP)?"
> **Jawaban Anda:**  
> *"Pertama, **PostgreSQL** memiliki integritas data yang sangat ketat, tipe data yang kaya (seperti JSONB dan timezone-aware timestamps), serta performa query yang superior.*  
> *Kedua, **Neon Cloud** merupakan arsitektur Lakebase Postgres Serverless yang memisahkan storage dari compute. Neon memiliki fitur **Connection Pooling** terintegrasi, autoscaling, dan backup otomatis. Dengan menggunakan Neon, aplikasi dapat diakses secara online dari perangkat mana pun di dunia tanpa bergantung pada laptop pengembang yang harus menyala terus."*

---

### Q4: "Bagaimana cara kerja backend di cloud jika tidak menyewa server VPS atau Render?"
> **Jawaban Anda:**  
> *"Aplikasi ini menerapkan arsitektur **Vercel Serverless Functions**. Setiap endpoint di folder `/api/todos` adalah fungsi JavaScript mandiri yang dieksekusi di lingkungan AWS edge milik Vercel hanya ketika ada permintaan request HTTP yang masuk.*  
> *Fungsi ini terhubung ke Neon PostgreSQL menggunakan driver resmi `@neondatabase/serverless` yang berbasis HTTP pooled transport. Pendekatan ini membuat aplikasi berbiaya Rp 0, hemat resource, bebas cold-start, dan tidak memerlukan server VPS yang harus disewa atau dikelola manual."*

---

### Q5: "Bagaimana alur kerja fitur AI Assistant (Kelarin AI) dalam mengubah teks chat menjadi tugas di database?"
> **Jawaban Anda:**  
> *"Alurnya melalui 4 tahapan (**NLP Pipeline**):*  
> 1. *Frontend membaca input bahasa alami pengguna.*  
> 2. *Frontend menginjeksi konteks waktu sistem waktu nyata (misal: hari ini tanggal 22 November 2026 jam 01:00) ke dalam system prompt instruksi.*  
> 3. *Request dikirimkan ke model **Google Gemini 3.5 Flash** melalui REST API dengan mode response MIME `application/json`.*  
> 4. *AI melakukan kalkulasi waktu relatif (misal 'besok jam 9' dihitung menjadi `2026-11-23T09:00`) dan mengembalikan Structured JSON berisi array tugas.*  
> 5. *Frontend mem-parsing JSON tersebut ke dalam komponen kartu tugas yang siap disimpan ke database hanya dengan 1 kali klik."*

---

### Q6: "Bagaimana Anda menjamin keamanan aplikasi dari serangan SQL Injection dan CORS?"
> **Jawaban Anda:**  
> 1. *Untuk **SQL Injection**: Di backend Golang, kami menggunakan **GORM ORM** yang menerapkan parameterized queries secara otomatis. Di backend Serverless Vercel, kami menggunakan tagged-template queries dari `@neondatabase/serverless` sehingga input pengguna tidak pernah digabungkan secara mentah (raw concatenation) ke string SQL.*  
> 2. *Untuk **CORS (Cross-Origin Resource Sharing)**: Di backend Go kami mengunci domain yang diizinkan hanya pada origin terpercaya (`https://kelarin-eight.vercel.app` dan `localhost`). Di Vercel, API dan Frontend berada di satu domain yang sama (`same-origin`), sehingga secara alami kebal terhadap serangan CORS antar-domain.*  
> 3. *Untuk **Kredensial**: Tidak ada password database yang ditulis mentah di kode sumber. Semua kredensial dimuat melalui environment variable (`DATABASE_URL`)."*

---

### Q7: "Bagaimana sistem memastikan pengguna tidak memasukkan tanggal deadline yang sudah lewat (hari kemarin)?"
> **Jawaban Anda:**  
> *"Kami menerapkan sistem **Defense-in-Depth (Proteksi Berlapis)**:*  
> * Di sisi **Frontend (UI)**: Input HTML datetime-local dibatasi atribut `min` yang diisi waktu sistem saat ini, sehingga pemilih kalender otomatis mengunci dan menonaktifkan tanggal-tanggal lampau.*  
> * Di sisi **Backend (API)**: Controller backend mem-parsing string `due_date`, mengubahnya menjadi objek waktu, lalu membandingkannya dengan `time.Now()`. Jika waktu target lebih awal dari waktu sekarang (diberikan toleransi jeda 1 menit), backend langsung menolak request dengan status `400 Bad Request` dan pesan error 'Tenggat waktu tidak boleh tanggal yang sudah lewat'."*

---

### Q8: "Apa itu Optimistic UI dan apakah aplikasi ini menerapkannya?"
> **Jawaban Anda:**  
> *"Ya, aplikasi ini menerapkan konsep **Optimistic UI Update** saat pengguna mengubah status checklist tugas (selesai/belum selesai).*  
> *Ketika kotak checklist dicentang, antarmuka React langsung memperbarui state visual tugas menjadi selesai tanpa menunggu jawaban jaringan server terlebih dahulu. Di balik layar, request asynchronous `PUT /api/todos/:id` dikirimkan ke database. Jika request berhasil, state tetap terjaga; jika terjadi kegagalan jaringan, state otomatis dikembalikan ke kondisi semula (**rollback**) dan pesan error ditampilkan. Ini menghasilkan pengalaman pengguna yang instan tanpa jeda."*

---

### Q9: "Di backend Golang, apa keunggulan menggunakan Gin Gonic dibanding library bawaan net/http?"
> **Jawaban Anda:**  
> *"Gin Gonic menggunakan custom tree-based routing (**Radix Tree Router**) yang merupakan salah satu router tercepat di ekosistem Go dengan konsumsi memori yang sangat kecil (zero-allocation).*  
> *Selain performa tinggi, Gin menyediakan fitur bawaan yang sangat mempermudah pengembangan seperti JSON binding/validation otomatis (`binding:"required"`), manajemen grup routing (`r.Group("/api")`), middleware crash recovery, dan penanganan format response JSON yang sangat bersih."*

---

### Q10: "Mengapa Anda memutuskan tidak menggunakan AI lokal (Ollama) dan memilih Google Gemini Cloud?"
> **Jawaban Anda:**  
> *"Ollama sangat baik untuk penggunaan offline mandiri di laptop, namun untuk aplikasi web yang di-deploy ke publik (seperti di Vercel), Ollama lokal memiliki kendala arsitektur:*  
> * Laptop pengembang harus selalu menyala dan terhubung ke internet.*  
> * Membutuhkan setup tunnel perantara (seperti Cloudflare Tunnel/ngrok) yang URL-nya sering berganti-ganti jika koneksi terputus.*  
> * Browser memblokir koneksi dari website HTTPS ke HTTP localhost karena aturan keamanan **Mixed Content** dan **Private Network Access (PNA)**.*  
> *Dengan beralih ke **Google Gemini Cloud AI**, aplikasi menjadi 100% mandiri, bebas maintenance, tidak membebani RAM/GPU laptop, dan dapat diakses secara lancar oleh mentor atau penguji kapan saja dan dari perangkat apa saja termasuk smartphone."*

---

### Q11: "Jika mentor meminta Anda menambah fitur baru, seberapa mudah arsitektur ini dikembangkan?"
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
