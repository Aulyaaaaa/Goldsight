import os
import time
import psycopg2

from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# ============================================================
# DATABASE CONFIG
# ============================================================
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}

# ============================================================
# LOGGER
# ============================================================
def log(message, log_file="logs/database_log.txt"):

    formatted = (
        f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
        f"{message}"
    )

    print(formatted)

    os.makedirs("logs", exist_ok=True)

    with open(log_file, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")

# ============================================================
# CONNECT DATABASE
# ============================================================
def connect_db():

    for i in range(5):

        try:

            conn = psycopg2.connect(**DB_CONFIG)

            log("Connected to PostgreSQL")

            return conn

        except Exception as e:

            log(f"Retry {i+1}: {e}")

            time.sleep(10)

    raise Exception(
        "Failed to connect PostgreSQL after retries"
    )