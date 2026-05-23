from fastapi import APIRouter
from app.database import connect_db

router = APIRouter()


@router.get("/")
def get_gold_prices():

    conn = connect_db()
    cur = conn.cursor()

    try:

        cur.execute("""
            SELECT
                brand,
                resource,
                weight,
                sell_price,
                buyback_price,
                updated_at
            FROM gold_prices
            ORDER BY updated_at DESC
            LIMIT 100
        """)

        rows = cur.fetchall()

        data = []

        for row in rows:

            data.append({
                "brand": row[0],
                "resource": row[1],
                "weight": row[2],
                "sell_price": row[3],
                "buyback_price": row[4],
                "updated_at": row[5]
            })

        return data

    finally:

        cur.close()
        conn.close()