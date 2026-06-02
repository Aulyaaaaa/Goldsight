from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.database import connect_db
from app.prediction import load_models, load_historical, predict_price
from app.recommendation import ma_signal, generate_recommendation

router = APIRouter()

daily_model, weekly_model = load_models()

class PredictionRequest(BaseModel):
    weight: float
    target_date: str

@router.post("/")
def custom_prediction(req: PredictionRequest):

    conn = connect_db()
    cur = conn.cursor()

    try:

        # ==========================================
        # PARSE DATE
        # ==========================================
        target_date = datetime.strptime(
        req.target_date,
        "%d-%m-%Y"
        ).date()

        # ==========================================
        # LATEST PREDICTION DATE
        # ==========================================
        cur.execute("""
            SELECT MAX(prediction_date)
            FROM predictions
            WHERE weight = %s
        """, (
            req.weight,
        ))

        latest_prediction_date = cur.fetchone()[0]

        today = datetime.today().date()

        # ==========================================
        # VALIDASI
        # ==========================================
        days = (target_date - today).days

        if days < 1 or days > 14:

            raise HTTPException(
                status_code=400,
                detail="Target date must be 1-14 days ahead"
            )

        # ==========================================
        # MAIN PREDICTION
        # ==========================================
        cur.execute("""
            SELECT
                p.weight,
                p.target_date,
                p.predicted_price,
                p.predicted_delta,
                r.recommendation_type
            FROM predictions p
            LEFT JOIN recommendations r
                ON p.id = r.prediction_id
            WHERE p.weight = %s
            AND p.prediction_date = %s
            AND p.target_date = %s
            ORDER BY p.target_date ASC
            LIMIT 1
        """, (
            req.weight,
            latest_prediction_date,
            target_date,
        ))

        row = cur.fetchone()

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Prediction not found"
            )

        # ==========================================
        # CURRENT PRICE
        # ==========================================
        cur.execute("""
            SELECT sell_price
            FROM gold_prices
            WHERE weight = %s
            ORDER BY updated_at DESC
            LIMIT 1
        """, (
            req.weight,
        ))

        price_row = cur.fetchone()

        last_price = float(price_row[0])

        # ==========================================
        # DELTA PERCENTAGE
        # ==========================================
        delta_pct = round(
            (float(row[3]) / last_price) * 100,
            2
        )

        # ==========================================
        # CHART DATA
        # ==========================================
        cur.execute("""
            SELECT
                target_date,
                predicted_price
            FROM predictions
            WHERE weight = %s
            AND prediction_date = %s
            AND target_date BETWEEN %s AND %s
            ORDER BY target_date ASC
        """, (
            req.weight,
            latest_prediction_date,
            latest_prediction_date,
            target_date
        ))

        chart_rows = cur.fetchall()

        chart_data = []

        for item in chart_rows:

            chart_data.append({
                "tanggal": item[0].strftime("%Y-%m-%d"),
                "prediksi": float(item[1])
            })

        return {

            "weight": row[0],

            "target_date":
                row[1].strftime("%Y-%m-%d"),

            "last_price":
                last_price,

            "predicted_price":
                float(row[2]),

            "predicted_delta":
                float(row[3]),

            "delta_pct":
                delta_pct,

            "recommendation":
                row[4],

            "chart_data":
                chart_data
        }

    finally:

        cur.close()
        conn.close()