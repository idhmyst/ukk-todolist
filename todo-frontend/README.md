# 📋 Task Manager — CakeAdmin Todo Dashboard (UKK PPLG SMK)

Frontend Single Page Application (**SPA**) modern dengan desain antarmuka dashboard eksekutif (**CakeAdmin UI**) untuk aplikasi **To-Do List** yang dibangun khusus untuk penilaian **Uji Kompetensi Keahlian (UKK) Program Keahlian Pengembangan Perangkat Lunak dan GIM (PPLG)**.

Aplikasi ini dikembangkan menggunakan **React (Vite)** dan **Tailwind CSS**, terhubung secara real-time dengan REST API **Golang (Gin)** dan database **MySQL**.

---

## 🎨 Tampilan & Fitur-Fitur Baru (CakeAdmin Style)

Sesuai dengan desain dashboard referensi modern, fitur-fitur yang disajikan meliputi:

### 1. 🗂️ Left Sidebar Navigation
- **Brand & Logo**: Identitas CakeAdmin dengan badge UKK PPLG.
- **User Profile Widget**: Foto avatar, nama pengguna (*Timotheus Bendan*), dan role (*Admin • PPLG SMK*).
- **Menu Navigasi Lengkap**:
  - **Dashboard**: Dashboard, Orders, Products, Buyer, Customers, Invoices.
  - **Apps**: Chats (badge aktif), Email App, dan **Todo App** (Submenu: *List* [Aktif] & *Details*).
  - **Pages**: Profile & Settings.
- **Dukungan Mobile Responsive**: Sidebar dapat di-toggle (*slide-in/out*) dengan tombol hamburger pada layar ponsel/tablet.

### 2. 🔝 Top Header / Navbar
- **Judul Halaman**: *"Todo List"*.
- **Pencarian Global**: Input bar *Search...* di tengah header.
- **Live Status Indikator Backend**: Badge deteksi status koneksi real-time ke Golang API (🟢 *Online (8080)* / 🔴 *Offline*) dan tombol sinkronisasi refresh.
- **Notifikasi & Aktivitas**: Ikon lonceng notifikasi (badge count 2) dan task bag (badge count 3).
- **Tombol Utama "+ Add Task"**: Membuka popup dialog modal untuk membuat tugas baru.

### 3. 🛠️ Toolbar Kontrol Tugas (Center Toolbar)
- **Bulk Select (Pilih Semua)**: Checkbox interaktif untuk memilih semua tugas, sebagian, atau membatalkan pilihan.
- **Bulk Action**: Tombol cepat untuk menandai selesai atau menghapus banyak tugas sekaligus saat checkbox dipilih.
- **Order by (Pengurutan Dinamis)**:
  - 🕒 Terbaru (*Newest*)
  - ⏳ Terlama (*Oldest*)
  - ⚡ Prioritas (*High → Low*)
  - 🔤 Abjad (*Judul A - Z*)
- **Pencarian Realtime (*Search todo list...*)**: Menyaring tugas secara instan berdasarkan judul, kategori, atau tingkat prioritas.

### 4. 📝 Kartu Baris Tugas (Todo Row Item)
- **Drag Handle Dots (`:::`)**: Penanda visual tata letak tugas.
- **Custom Purple Checkbox**: Memicu update status ke backend Golang `PUT /api/todos/:id`.
- **Tandai Bintang / Favorit (⭐ Favorites)**: Tombol bintang untuk menandai tugas penting.
- **Coretan Teks (*Strikethrough*)**: Judul tugas otomatis dicoret rapi saat status selesai.
- **Badge Kategori Berwarna Cerah (*Vibrant Category Tags*)**:
  - 🔴 `Social` (Merah/Rose)
  - 🟡 `Theme Support` (Kuning/Amber)
  - 🔵 `Friends` (Biru/Sky)
  - 🟢 `Freelance` (Hijau/Emerald)
  - 🟣 `Coding` (Ungu/Purple)
  - 🟪 `UKK Project` (Indigo)
- **Avatar Kolaborator / Tim**: Stack avatar foto melingkar bertumpuk rapi di setiap kartu tugas.
- **Menu Aksi Tiga Titik (`...`)**:
  - Tandai Selesai / Belum Selesai
  - Tambah / Hapus Bintang Favorit
  - **Edit Tugas** (Membuka Edit Modal untuk mengubah judul & prioritas)
  - Hapus Tugas

### 5. 📑 Panel Filter Samping Kanan (Right Filter Panel)
- **All**: Menampilkan seluruh tugas beserta total badge hitungan.
- **My Task**: Menampilkan tugas aktif saya.
- **Favorites**: Menyaring hanya tugas yang telah ditandai bintang (⭐).
- **Done**: Menyaring hanya tugas yang telah selesai dikerjakan beserta badge hitungan.
- **Deleted**: Indikator riwayat tugas.

### 6. 🪟 Dialog Modal Interaktif
- **Add Task Modal**: Dialog modern saat tombol "+ Add Task" diklik untuk menginputkan Judul, Prioritas (Low, Medium, High), dan Kategori.
- **Edit Task Modal**: Dialog untuk memperbarui judul dan detail tugas (memicu `PUT /api/todos/:id`).

---

## 🚀 Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework / Library** | [React](https://react.dev/) 18 | Functional Components & Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) |
| **Bundler / Build Tool** | [Vite](https://vitejs.dev/) 5 | Kompilasi ultra cepat & Hot Module Replacement |
| **CSS Styling** | [Tailwind CSS](https://tailwindcss.com/) 3 | Desain modern dashboard dengan utility classes |
| **Icons** | [Lucide React](https://lucide.dev/) | Paket ikon lengkap |
| **HTTP Client** | [Axios](https://axios-http.com/) | REST API caller dengan error handling & timeout |

---

## 📁 Struktur Direktori Komponen Baru

```text
todo-frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx           # Navigasi kiri CakeAdmin, user profile, dan list apps
│   │   ├── TopHeader.jsx         # Header atas: Title, Search, Notifikasi, Status API, & "+ Add Task"
│   │   ├── RightFilterPanel.jsx  # Panel samping kanan (All, My Task, Favorites, Done, Deleted)
│   │   ├── TodoToolbar.jsx       # Toolbar tengah: Select all, Order by, dan Search box
│   │   ├── TodoRowItem.jsx       # Baris to-do: Checkbox, Bintang ⭐, Tag warna, Avatars, Menu (...)
│   │   ├── AddTaskModal.jsx      # Modal popup tambah tugas baru
│   │   ├── EditTaskModal.jsx     # Modal popup edit judul & prioritas tugas
│   │   ├── LoadingSkeleton.jsx   # Shimmer animasi saat data pertama kali dimuat
│   │   ├── EmptyState.jsx        # Tampilan kosong ramah per filter
│   │   └── ErrorAlert.jsx        # Alert saat server backend Golang belum dinyalakan
│   ├── services/
│   │   └── api.js                # Modul komunikasi HTTP REST API Golang (:8080)
│   ├── App.jsx                   # State global, filter, sorting, optimistic update & toast
│   ├── index.css                 # Style dasar Tailwind CSS
│   └── main.jsx                  # Entrypoint React
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🌐 Endpoint REST API Backend Golang yang Terhubung

Frontend tetap terhubung secara aman dan penuh ke backend Golang:

| HTTP Method | Endpoint | Request Payload | Response Data |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/todos` | *None* | `{"data": [...]}` |
| **POST** | `/api/todos` | `{"title": "...", "priority": "high"}` | `{"data": {...}}` |
| **PUT** | `/api/todos/:id` | `{"is_completed": true}` *atau* `{"title": "...", "priority": "..."}` | `{"data": {...}}` |
| **DELETE** | `/api/todos/:id` | *None* | `{"message": "..."}` |

---

## 🛠️ Cara Menjalankan Frontend

```powershell
# 1. Masuk ke folder frontend
cd todo-frontend

# 2. Install dependensi
npm install

# 3. Jalankan server Vite
npm run dev
```

Akses di browser: 👉 **http://localhost:5173**
