import os
import time
import psycopg2
from dotenv import load_dotenv

# 1. Memuat variabel dari file .env
load_dotenv()

# 2. Mengambil kredensial database dengan fallback nilai default jika .env kosong
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "goldsight_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

def connect_db():
    """
    Fungsi utama untuk membuat koneksi ke database PostgreSQL.
    Memiliki fitur auto-retry hingga 5 kali jika database sedang sibuk.
    """
    max_retries = 5
    for retry in range(1, max_retries + 1):
        try:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Connected to PostgreSQL Successfully!")
            return conn
        except Exception as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Percobaan {retry}: Gagal terhubung ke {DB_HOST}:{DB_PORT}. Error: {e}")
            if retry == max_retries:
                raise Exception("Aplikasi menyerah: Gagal terhubung ke PostgreSQL setelah 5 kali percobaan.")
            # Menunggu 2 detik sebelum mencoba mengetok pintu database lagi
            time.sleep(2)

# ==============================================================================
# FITUR TES MANDIRI (Hanya berjalan jika file database.py ini di-run langsung)
# ==============================================================================
if __name__ == "__main__":
    print("\n=== MEMULAI TES KONEKSI DATABASE MANDIRI ===")
    print(f"Mencoba mengetok database: {DB_NAME} pada host {DB_HOST}...")
    try:
        test_conn = connect_db()
        if test_conn:
            # Jika berhasil terkoneksi, kita intip isi datanya sedikit untuk memastikan tabel ada
            cur = test_conn.cursor()
            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gold_prices');")
            table_exists = cur.fetchone()[0]
            
            print(f"Status Tabel 'gold_prices': {'TERSEDIA DI PGADMIN! 🎉' if table_exists else 'BELUM ADA DI PGADMIN! ❌'}")
            
            # Jangan lupa tutup pintunya setelah selesai tes
            cur.close()
            test_conn.close()
            print("=== TES SELESAI: KONEKSI AMAN DAN BERHASIL DITUTUP ===\n")
    except Exception as error:
        print(f"\n[ERROR] Tes Mandiri Gagal Total: {error}")
        print("=== TES SELESAI: SILAKAN PERIKSA PGADMIN ATAU FILE .ENV ANDA ===\n")