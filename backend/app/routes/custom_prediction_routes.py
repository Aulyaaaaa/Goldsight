from fastapi import APIRouter
from pydantic import BaseModel

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

    try:

        df = load_historical(
            req.weight,
            conn
        )

        result = predict_price(
            df=df,
            weight=req.weight,
            target_date=req.target_date,
            model=daily_model,
            model_version="daily_linear_v1"
        )

        ma_sig = ma_signal(
            result["ma_7"],
            result["ma_14"]
        )

        rec = generate_recommendation(
            current_price=result["last_price"],
            predicted_price=result["predicted_price"],
            ma_sig=ma_sig
        )

        return {
            "weight": result["weight"],
            "target_date": result["target_date"],

            "last_price": result["last_price"],

            "predicted_price":
                result["predicted_price"],

            "predicted_delta":
                result["predicted_delta"],

            "recommendation":
                rec["recommendation"],

            "delta_pct":
                rec["delta_pct"]
        }

    finally:

        conn.close()