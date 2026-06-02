import requests
import traceback
from datetime import datetime
from app.database import connect_db, log
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("API_KEY")

BASE_URL = "https://emas.maulanar.my.id/api/prices?brand[eq]=antam&resource[eq]=galeri24&weight[gte]=0.5&weight[lte]=5"

HEADERS = {
    "X-API-Key": API_KEY
}

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

LOG_FILE = os.path.join(
    BASE_DIR,
    "logs",
    "pipeline_log.txt"
)


def fetch_data():
    log("Fetching API data...", LOG_FILE)

    r = requests.get(BASE_URL, headers=HEADERS)
    r.raise_for_status()

    log("API data fetched", LOG_FILE)
    return r.json()


def save_data(data):
    conn = connect_db()
    cur = conn.cursor()

    try:
        for item in data["data"]:
            cur.execute("""
                INSERT INTO gold_prices 
                (brand, resource, weight, buyback_price, sell_price, updated_at)
                VALUES (%s,%s,%s,%s,%s,%s)
                ON CONFLICT (brand, resource, weight, updated_at)
                DO UPDATE SET
                    buyback_price = EXCLUDED.buyback_price,
                    sell_price = EXCLUDED.sell_price;
            """, (
                item["brand"],
                item["resource"],
                item["weight"],
                item["buyback_price"],
                item["sell_price"],
                item["updated_at"][:10]
            ))

        conn.commit()
        log("Insert success", LOG_FILE)

    except Exception as e:
        conn.rollback()

        log("ERROR during insert", LOG_FILE)
        log(str(e), LOG_FILE)
        log(traceback.format_exc(), LOG_FILE)

        raise

    finally:
        cur.close()
        conn.close()
        log("Database connection closed", LOG_FILE)


def main():
    log("PIPELINE STARTED", LOG_FILE)

    data = fetch_data()

    save_data(data)

    log("PIPELINE FINISHED SUCCESSFULLY", LOG_FILE)


if __name__ == "__main__":
    try:
        main()

    except Exception as e:
        log("FATAL ERROR", LOG_FILE)
        log(str(e), LOG_FILE)
        log(traceback.format_exc(), LOG_FILE)