from fastapi import APIRouter
from app.database import connect_db

router = APIRouter()


@router.get("/")
def get_recommendations():

    conn = connect_db()
    cur = conn.cursor()

    try:

        cur.execute("""
            SELECT
                r.id,
                r.recommendation_type,
                p.weight,
                p.target_date,
                p.predicted_price
            FROM recommendations r
            JOIN predictions p
                ON r.prediction_id = p.id
            ORDER BY p.target_date ASC
        """)

        rows = cur.fetchall()

        data = []

        for row in rows:

            data.append({
                "id": row[0],
                "recommendation": row[1],
                "weight": row[2],
                "target_date": row[3],
                "predicted_price": row[4]
            })

        return data

    finally:

        cur.close()
        conn.close()