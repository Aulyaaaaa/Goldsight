from fastapi import FastAPI

from app.routes.prediction_routes import router as prediction_router
from app.routes.recommendation_routes import router as recommendation_router
from app.routes.gold_price_routes import router as gold_router
from app.routes.custom_prediction_routes import router as custom_prediction_router

app = FastAPI(
    title="GoldSight API",
    description="Gold prediction and recommendation API"
)

# ============================================================
# ROUTES
# ============================================================
app.include_router(
    prediction_router,
    prefix="/predictions",
    tags=["Predictions"]
)

app.include_router(
    recommendation_router,
    prefix="/recommendations",
    tags=["Recommendations"]
)

app.include_router(
    gold_router,
    prefix="/gold-prices",
    tags=["Gold Prices"]
)

app.include_router(
    custom_prediction_router,
    prefix="/predict/custom",
    tags=["Custom Prediction"]
)

# ============================================================
# ROOT ENDPOINT
# ============================================================
@app.get("/")
def root():

    return {
        "message": "GoldSight API is running"
    }