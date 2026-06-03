# GoldSight

**Sistem Analisis Tren, Prediksi, dan Rekomendasi Harga Emas Berbasis Web Service & Machine Learning**

GoldSight adalah aplikasi web full-stack yang menyediakan analisis real-time, prediksi harga, dan rekomendasi investasi emas ANTAM berbasis machine learning. Sistem ini secara otomatis mengambil data harga emas harian, melatih model prediksi, dan menyajikan insight kepada pengguna melalui dashboard interaktif.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Teknologi & Tools](#teknologi--tools)
- [Alur Aplikasi](#alur-aplikasi)
- [Struktur Direktori](#struktur-direktori)
- [Skema Database](#skema-database)
- [API Endpoints](#api-endpoints)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Cara Menjalankan](#cara-menjalankan)
- [Deployment](#deployment)

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Analisis Real-Time** | Monitoring harga emas live dengan filter berdasarkan berat (0.5g – 5g) |
| **Moving Average** | Kalkulasi MA7 & MA14 dengan indikator tren (Bullish / Bearish / Sideways) |
| **Prediksi Harga** | Prediksi harga hingga 14 hari ke depan menggunakan model ML |
| **Rekomendasi Investasi** | Sinyal BUY / SELL / HOLD otomatis berbasis aturan + konfirmasi MA |
| **Visualisasi Chart** | Grafik interaktif perbandingan harga aktual vs prediksi |
| **Background Scheduler** | Pengambilan data & pembuatan prediksi otomatis setiap 24 jam |

---

## Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite + Nginx)              │
│                                                            │
│   ┌─────────────────────┐   ┌─────────────────────────┐  │
│   │  Tab: Real-Time     │   │  Tab: Prediksi           │  │
│   │  • Harga live       │   │  • Pilih tanggal         │  │
│   │  • MA7 & MA14       │   │  • Hasil prediksi        │  │
│   │  • Status tren      │   │  • Rekomendasi BUY/SELL  │  │
│   │  • Chart aktual vs  │   │  • Chart proyeksi        │  │
│   │    prediksi         │   │                          │  │
│   └─────────────────────┘   └─────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │ REST API (JSON)
                        ▼
┌──────────────────────────────────────────────────────────┐
│               BACKEND (Python FastAPI + Uvicorn)          │
│                                                            │
│  API Routes:                                               │
│  • GET  /gold-prices/         → Harga emas terkini        │
│  • GET  /predictions/         → Data prediksi             │
│  • GET  /predictions/validation → Aktual vs prediksi      │
│  • GET  /recommendations/     → Sinyal BUY/SELL/HOLD      │
│  • POST /predict/custom/      → Prediksi tanggal custom   │
│  • GET  /admin/scheduler-status                           │
│  • POST /admin/run-pipeline                               │
│  • POST /admin/run-predict                                │
│                                                            │
│  ML Prediction Engine:                                     │
│  • Feature Engineering (lag, MA, momentum, trend)         │
│  • Daily Model: LinearRegression (hari 1–20)              │
│  • Weekly Model: XGBRegressor (hari 7, 14, 21)            │
│  • Iterative Forecasting (21 hari ke depan)               │
│                                                            │
│  Background Scheduler (APScheduler):                       │
│  • gold_pipeline  → Ambil harga dari API eksternal        │
│  • gold_predict   → Generate prediksi 21 hari             │
└───────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌──────────────────┐         ┌─────────────────────┐
│  PostgreSQL DB   │         │  External API        │
│  (Railway)       │         │  emas.maulanar...   │
│                  │         │                      │
│  • gold_prices   │         │  Harga ANTAM:        │
│  • predictions   │         │  Brand, Berat, IDR  │
│  • recommendations│        └─────────────────────┘
└──────────────────┘
```

---

## Teknologi & Tools

### Backend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Python** | 3.11 | Runtime utama |
| **FastAPI** | Latest | Web framework & REST API |
| **Uvicorn** | Latest | ASGI server |
| **PostgreSQL** | Latest | Database relasional |
| **psycopg2-binary** | Latest | Driver koneksi PostgreSQL |
| **Scikit-learn** | Latest | Model LinearRegression |
| **XGBoost** | Latest | Model XGBRegressor |
| **Pandas** | Latest | Manipulasi & analisis data |
| **NumPy** | Latest | Komputasi numerik |
| **APScheduler** | Latest | Background job scheduler |
| **Requests** | Latest | HTTP client ke API eksternal |
| **python-dotenv** | Latest | Manajemen environment variables |

### Frontend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **React** | 19.2.5 | UI framework |
| **Vite** | 8.0.10 | Build tool & dev server |
| **Tailwind CSS** | 4.2.4 | Utility-first CSS framework |
| **Recharts** | 3.8.1 | Library chart interaktif |
| **PostCSS** | 8.5.13 | CSS processor |
| **Autoprefixer** | 10.5.0 | Vendor prefix otomatis |
| **ESLint** | 10.2.1 | Linting kode JavaScript |

### Infrastructure & DevOps

| Teknologi | Kegunaan |
|-----------|----------|
| **Docker** | Containerisasi aplikasi (multi-stage build) |
| **Docker Compose** | Orkestrasi container lokal |
| **Nginx (Alpine)** | Web server untuk serve React SPA di production |
| **Railway** | Cloud platform deployment (backend, frontend, database) |

---

## Alur Aplikasi

### 1. Data Pipeline (Background, tiap 24 jam)

```
APScheduler trigger
    ↓
gold_pipeline.py:
    Fetch GET emas.maulanar.my.id/api/prices
    ↓
    Filter: brand=ANTAM, resource=galeri24
           weight ∈ {0.5, 1, 2, 3, 5} gram
    ↓
    UPSERT ke tabel gold_prices
    (ON CONFLICT DO UPDATE)
    ↓
    Log ke logs/pipeline_log.txt
```

### 2. Prediction Generation (Background, tiap 24 jam)

```
APScheduler trigger
    ↓
gold_predict.py:
    Untuk setiap weight (0.5, 1, 2, 3, 5):
        Load historical prices dari DB
        ↓
        Untuk hari 1 s/d 21:
            Build feature vector:
              [weight, lag_1, lag_3, lag_7,
               ma_7, ma_14, rolling_std_7,
               momentum, trend_strength, day_of_week]
            ↓
            Pilih model:
              • Hari 7, 14, 21 → XGBRegressor (weekly)
              • Lainnya        → LinearRegression (daily)
            ↓
            Predict price delta → hitung predicted_price
            ↓
            Hitung sinyal MA (bullish/bearish/neutral)
            ↓
            Generate rekomendasi:
              delta_pct >  1.5% → BUY
              delta_pct < -1.5% → SELL
              delta_pct ±  0.5% → HOLD
              (dikonfirmasi dengan sinyal MA)
            ↓
            INSERT ke tabel predictions & recommendations
            ↓
            Append prediksi ke data historis (iterative)
```

### 3. Analisis Real-Time (Frontend → Backend)

```
User buka halaman → pilih berat emas
    ↓
Frontend fetch:
    GET /gold-prices/              → harga historis
    GET /predictions/validation    → validasi aktual vs prediksi
    ↓
Frontend proses:
    Hitung MA7 & MA14
    Tentukan tren (Bullish / Bearish / Sideways)
    ↓
Tampilkan:
    • Harga terkini
    • Card MA7, MA14
    • Badge status tren
    • LineChart aktual vs prediksi
    • Ringkasan analisis otomatis
```

### 4. Prediksi Custom (Frontend → Backend)

```
User pilih tanggal (1–14 hari ke depan) → klik "Analisis Sekarang"
    ↓
POST /predict/custom/ { weight: 1, target_date: "DD-MM-YYYY" }
    ↓
Backend:
    Parse & validasi tanggal (max 14 hari ke depan)
    ↓
    Query predictions table untuk target_date
    ↓
    Ambil harga terkini dari gold_prices
    ↓
    Hitung: delta = predicted - current
            delta_pct = (delta / current) × 100
    ↓
    Fetch chart_data (semua prediksi dari hari ini → target_date)
    ↓
    Return JSON response
    ↓
Frontend tampilkan:
    • Harga saat ini vs prediksi
    • Selisih harga + persentase
    • Badge rekomendasi BUY / SELL / HOLD
    • LineChart proyeksi perjalanan harga
```

---

## Struktur Direktori

```
Goldsight/
├── docker-compose.yml          # Orkestrasi container lokal
│
├── backend/
│   ├── app/
│   │   ├── main.py             # Entry point FastAPI, lifespan scheduler
│   │   ├── database.py         # Koneksi PostgreSQL + retry logic
│   │   ├── prediction.py       # Load model & feature engineering
│   │   ├── recommendation.py   # Rule-based recommendation engine
│   │   └── routes/
│   │       ├── gold_price_routes.py       # GET /gold-prices/
│   │       ├── prediction_routes.py       # GET /predictions/
│   │       ├── custom_prediction_routes.py # POST /predict/custom/
│   │       └── recommendation_routes.py   # GET /recommendations/
│   ├── scheduler/
│   │   ├── gold_pipeline.py    # Fetch harga dari API eksternal
│   │   └── gold_predict.py     # Generate prediksi 21 hari
│   ├── pkl_output/
│   │   ├── champion_daily_LinearRegression.pkl
│   │   └── champion_weekly_XGBRegressor.pkl
│   ├── .env                    # Konfigurasi DB & API key
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── main.jsx            # React entry point
    │   ├── App.jsx             # Shell utama + tab routing (state-based)
    │   ├── pages/
    │   │   ├── RealTime.jsx    # Halaman analisis real-time
    │   │   └── Prediction.jsx  # Halaman prediksi custom
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Header.jsx  # Navigasi tab
    │   │       └── Footer.jsx  # Footer branding
    │   └── services/
    │       └── api.js          # API client layer
    ├── nginx.conf              # Konfigurasi Nginx production
    ├── Dockerfile              # Multi-stage build (Node → Nginx)
    ├── vite.config.js
    └── package.json
```

---

## Skema Database

### Tabel `gold_prices`
```sql
id           SERIAL PRIMARY KEY
brand        VARCHAR          -- "ANTAM"
resource     VARCHAR          -- "galeri24"
weight       NUMERIC          -- 0.5 | 1 | 2 | 3 | 5 (gram)
sell_price   NUMERIC          -- Harga jual (IDR)
buyback_price NUMERIC         -- Harga buyback (IDR)
updated_at   DATE             -- Tanggal harga
UNIQUE (brand, resource, weight, updated_at)
```

### Tabel `predictions`
```sql
id               SERIAL PRIMARY KEY
prediction_date  DATE          -- Tanggal prediksi dibuat
target_date      DATE          -- Tanggal yang diprediksi
weight           NUMERIC       -- Berat emas
predicted_price  NUMERIC       -- Harga prediksi (IDR)
predicted_delta  NUMERIC       -- Selisih dari harga terakhir
model_version    VARCHAR       -- "daily_linear_v1" | "weekly_xgb_v1"
created_at       TIMESTAMP
UNIQUE (weight, prediction_date, target_date)
```

### Tabel `recommendations`
```sql
id                  SERIAL PRIMARY KEY
prediction_id       INTEGER REFERENCES predictions(id)
recommendation_type VARCHAR      -- "BUY" | "SELL" | "HOLD"
created_at          TIMESTAMP
```

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/` | Health check |
| `GET` | `/gold-prices/` | Ambil 100 data harga terkini |
| `GET` | `/predictions/` | Semua prediksi tersimpan |
| `GET` | `/predictions/validation?weight={w}` | Data aktual vs prediksi untuk validasi |
| `GET` | `/recommendations/` | Semua rekomendasi + prediksi terkait |
| `POST` | `/predict/custom/` | Prediksi untuk tanggal & berat tertentu |
| `GET` | `/admin/scheduler-status` | Status job scheduler |
| `POST` | `/admin/run-pipeline` | Trigger manual pengambilan data |
| `POST` | `/admin/run-predict` | Trigger manual pembuatan prediksi |

**Contoh Request — Custom Prediction:**
```json
POST /predict/custom/
{
  "weight": 1,
  "target_date": "15-06-2026"
}
```

**Contoh Response:**
```json
{
  "weight": 1.0,
  "target_date": "2026-06-15",
  "last_price": 1625000,
  "predicted_price": 1648750,
  "predicted_delta": 23750,
  "delta_pct": 1.46,
  "recommendation": "HOLD",
  "chart_data": [
    { "tanggal": "2026-06-04", "prediksi": 1630000 },
    { "tanggal": "2026-06-05", "prediksi": 1635500 },
    ...
  ]
}
```

---

## Machine Learning Pipeline

### Feature Engineering

Setiap prediksi dibangun dari 10 fitur berikut:

| Fitur | Deskripsi |
|-------|-----------|
| `weight` | Berat emas dalam gram |
| `lag_1` | Harga t-1 (kemarin) |
| `lag_3` | Harga t-3 (3 hari lalu) |
| `lag_7` | Harga t-7 (7 hari lalu) |
| `ma_7` | Moving average 7 hari |
| `ma_14` | Moving average 14 hari |
| `rolling_std_7` | Standar deviasi 7 hari (volatilitas) |
| `momentum` | `lag_1 - lag_7` (arah pergerakan) |
| `trend_strength` | `lag_1 / ma_14` (kekuatan tren) |
| `day_of_week` | Hari dalam seminggu (0–6) |

### Model yang Digunakan

| Model | File | Digunakan Pada |
|-------|------|----------------|
| **LinearRegression** | `champion_daily_LinearRegression.pkl` | Hari 1–6, 8–13, 15–20 |
| **XGBRegressor** | `champion_weekly_XGBRegressor.pkl` | Hari 7, 14, 21 |

Kedua model memprediksi **price delta** (selisih harga), bukan harga absolut.

### Recommendation Engine

```
delta_pct > +1.5%  →  BUY  (harga diprediksi naik signifikan)
delta_pct < -1.5%  →  SELL (harga diprediksi turun signifikan)
-0.5% ≤ delta_pct ≤ +0.5%  →  HOLD (harga stabil)

Konfirmasi dengan sinyal MA:
  MA7 > MA14  →  Bullish  (perkuat BUY atau perlemah SELL)
  MA7 < MA14  →  Bearish  (perkuat SELL atau perlemah BUY)
```

---

## Cara Menjalankan

### Prasyarat

- Docker & Docker Compose
- Git

### 1. Clone Repository

```bash
git clone <repo-url>
cd Goldsight
```

### 2. Konfigurasi Environment

Buat file `backend/.env`:
```env
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_password
API_KEY=your_external_api_key
```

### 3. Jalankan dengan Docker Compose

```bash
docker-compose up --build
```

Aplikasi akan tersedia di:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 4. Jalankan Manual (Development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

Aplikasi di-deploy ke **Railway** dengan arsitektur berikut:

| Komponen | Platform | URL |
|----------|----------|-----|
| **Backend** | Railway (Docker) | `https://goldsight-production.up.railway.app` |
| **Frontend** | Railway (Nginx) | Railway assigned domain |
| **Database** | Railway PostgreSQL | `interchange.proxy.rlwy.net:32670` |

**Build process frontend (multi-stage Docker):**
1. Stage 1: `node:22-alpine` → `npm run build` → menghasilkan `/dist`
2. Stage 2: `nginx:alpine` → serve `/dist` sebagai static files

---

## Lisensi

Proyek ini dikembangkan sebagai sistem pendukung keputusan investasi emas berbasis machine learning.
