from fastapi import APIRouter
from app.database import connect_db

router = APIRouter()


@router.get("/")
def get_predictions():

    conn = connect_db()
    cur = conn.cursor()

    try:

        cur.execute("""
            SELECT
                id,
                prediction_date,
                target_date,
                weight,
                predicted_price,
                predicted_delta,
                model_version
            FROM predictions
            ORDER BY target_date ASC
        """)

        rows = cur.fetchall()

        data = []

        for row in rows:

            data.append({
                "id": row[0],
                "prediction_date": row[1],
                "target_date": row[2],
                "weight": row[3],
                "predicted_price": row[4],
                "predicted_delta": row[5],
                "model_version": row[6]
            })

        return data

    finally:

        cur.close()
        conn.close()

@router.get("/validation")
def get_prediction_validation(weight: float):

    conn = connect_db()
    cur = conn.cursor()

    try:

        cur.execute("""
            SELECT DISTINCT ON (p.target_date)

                p.target_date,
                g.sell_price AS actual_price,
                p.predicted_price,
                p.prediction_date

            FROM predictions p

            JOIN gold_prices g
                ON DATE(g.updated_at) = p.target_date
                AND g.weight = p.weight

            WHERE p.weight = %s
            AND p.prediction_date < p.target_date

            ORDER BY
                p.target_date,
                p.prediction_date DESC
        """, (
            weight,
        ))

        rows = cur.fetchall()

        data = []

        for row in rows:

            data.append({

                "tanggal":
                    row[0].strftime("%d/%m"),

                "aktual":
                    float(row[1]),

                "prediksi":
                    float(row[2]),

                "prediction_date":
                    row[3].strftime("%Y-%m-%d")

            })

        return data

    finally:

        cur.close()
        conn.close() 