# 🍽️ GiziVisionV2 — Platform Analisis Nutrisi Makanan Indonesia

**GiziVisionV2** adalah platform web modern berbasis **Next.js** yang dirancang untuk menganalisis kandungan nutrisi makanan khas Indonesia dari foto secara otomatis. Aplikasi ini menggunakan teknologi *Computer Vision* (Gemini AI) yang disinkronkan dengan database gizi pangan nasional.

---

## 1. Identitas Proyek (Project Identity)

* **Nama Proyek:** GiziVision (Versi 2)
* **Tujuan Utama:** Membantu pengguna memindai foto piring makanan (bisa berisi beberapa jenis hidangan sekaligus) lalu menguraikan kandungan kalori, protein, lemak, dan karbohidrat secara real-time.
* **Sumber Data Pangan:**
  * **Indonesian Food and Drink Nutrition Dataset** (oleh Anas Fikri Hanif di Kaggle).
  * Data bersumber resmi dari **Kementerian Kesehatan Republik Indonesia (Kemenkes RI)**.
  * Dataset lokal disimpan dalam format CSV dengan **1.300+ entri data pangan**.

---

## 2. Fitur-Fitur Utama (Key Features)

* **🍽️ Multi-Food Detection (Deteksi Multi-Makanan):** Gemini AI diprogram untuk mengidentifikasi seluruh item makanan/minuman yang terlihat pada satu piring secara terpisah (misalnya: *Nasi Putih*, *Telur Ceplok*, dan *Bakso* sekaligus) dan menghitung total nutrisi gabungannya.
* **🔍 Sinkronisasi Data & Fallback AI:** Hasil deteksi AI dicocokkan secara otomatis dengan nama resmi di database lokal (`nutrition.csv`). Jika item tidak ditemukan, sistem menggunakan estimasi nutrisi dari Gemini AI sebagai cadangan (*fallback*).
* **📊 Dashboard Statistik Interaktif:** Menyajikan visualisasi konsumsi harian (grafik kalori harian), distribusi makronutrisi (karbohidrat, protein, lemak) dalam diagram lingkaran (*pie chart*), serta daftar makanan yang paling sering dikonsumsi (*popular foods*).
* **💾 localStorage Optimized (Bebas QuotaExceededError):** Menyimpan riwayat scan langsung di browser dengan mengompres gambar menjadi thumbnail kecil (~5KB) dan membatasi riwayat hingga maksimal 50 pemindaian dengan sistem auto-trimming.
* **⚙️ Konfigurasi API Key Fleksibel:** Mendukung penggunaan `GEMINI_API_KEY` dari sisi server (`.env.local`) atau API Key milik pengguna sendiri via panel pengaturan web.

---

## 3. Spesifikasi Teknologi (Tech Stack)

| Komponen | Teknologi / Pustaka | Deskripsi |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 15.5.19** | Menggunakan App Router & Next.js Turbopack untuk performa kompilasi instan. |
| **Runtime / UI** | React 19 / React-DOM 19 | Engine UI utama dengan optimasi Client & Server Components. |
| **Vision AI** | `@google/generative-ai` | Integrasi model **Gemini 2.5 Flash** untuk ekstraksi data JSON terstruktur dari gambar. |
| **Styling & UI** | **Tailwind CSS v4** & Vanilla CSS | Desain premium bertema gelap (*dark mode*) dengan aksen warna cokelat hangat dan emas. |
| **Data Parsing** | `papaparse` | Library untuk membaca dan memparsing file `nutrition.csv` dengan cepat di sisi server. |
| **Grafik / Chart** | `recharts` | Digunakan untuk menampilkan grafik area interaktif dan pie chart di halaman dashboard. |
| **Animasi** | `animejs` | Transisi halaman & animasi hero banner yang halus saat pertama kali dibuka. |
| **Icons** | `lucide-react` | Kumpulan ikon SVG modern. |

---

## 4. Struktur Folder & Arsitektur Kode

```bash
GiziVisionV2/
├── app/                      # Next.js App Router (Halaman & API)
│   ├── api/
│   │   ├── analyze/          # Endpoint POST: analisis gambar (Gemini AI + CSV matching)
│   │   ├── search/           # Endpoint GET: pencarian data makanan berdasarkan query text
│   │   └── stats/            # Endpoint GET: statistik total entri dataset
│   ├── analysis/             # Halaman: detail rincian nutrisi hasil upload
│   ├── dashboard/            # Halaman: visualisasi grafik kalori & makro nutrisi
│   ├── history/              # Halaman: riwayat scan yang tersimpan di browser
│   ├── upload/               # Halaman: form upload & pengaturan API key
│   ├── globals.css           # Styling global & variabel warna (Dark Mode, Brown/Gold accents)
│   ├── layout.js             # Navbar, Footer dengan atribusi Kaggle & konfigurasi font
│   └── page.js               # Beranda / Landing Page (Hero banner & Cara Kerja)
├── components/               # Komponen UI Reusable
│   ├── animations/           # LandingAnimation (Anime.js wrapper)
│   └── upload/               # UploadZone (Dropzone file, trigger kamera, kompresi thumbnail)
├── data/
│   └── nutrition.csv         # Database nutrisi lokal (1.300+ baris data pangan Indonesia)
├── services/                 # Layer Logika Bisnis (Business Logic)
│   ├── history.service.js    # CRUD riwayat & agregasi data dashboard ke localStorage
│   ├── nutrition.service.js  # File reader, search engine, & pengolah kalkulasi CSV
│   └── vision.service.js     # Integrasi API Gemini (Prompting, parsing, & Mock engine)
├── .env.local                # Konfigurasi Environment Variable (GEMINI_API_KEY)
└── package.json              # Daftar dependencies & scripts run
```

---

## 5. Atribusi Dataset

Sistem ini didukung oleh dataset nutrisi publik:
* **Dataset:** [Indonesian Food and Drink Nutrition Dataset](https://www.kaggle.com/datasets/anasfikrihanif/indonesian-food-and-drink-nutrition-dataset) oleh **Anas Fikri Hanif** di Kaggle.
* **Sumber Primer:** **Kementerian Kesehatan Republik Indonesia (Kemenkes RI)**.
