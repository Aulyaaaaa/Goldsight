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


@router.get("/latest")
def get_latest_predictions():

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
            ORDER BY created_at DESC
            LIMIT 10
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