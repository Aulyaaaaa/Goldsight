from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import os

from app.routes.prediction_routes import router as prediction_router
from app.routes.recommendation_routes import router as recommendation_router
from app.routes.gold_price_routes import router as gold_router
from app.routes.custom_prediction_routes import router as custom_prediction_router
from app.scheduler.gold_pipeline import main as pipeline_main
from app.scheduler.gold_predict import run_scheduler_task

os.makedirs("/app/logs", exist_ok=True)

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(pipeline_main, 'interval', hours=24, id='gold_pipeline',
                      next_run_time=datetime.now())
    scheduler.add_job(run_scheduler_task, 'interval', hours=24, id='gold_predict',
                      next_run_time=datetime.now())
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(
    title="GoldSight API",
    description="Gold prediction and recommendation API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/predictions", tags=["Predictions"])
app.include_router(recommendation_router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(gold_router, prefix="/gold-prices", tags=["Gold Prices"])
app.include_router(custom_prediction_router, prefix="/predict/custom", tags=["Custom Prediction"])

@app.get("/")
def root():
    return {"message": "GoldSight API is running"}

@app.get("/admin/scheduler-status")
def scheduler_status():
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "next_run": str(job.next_run_time),
            "trigger": str(job.trigger)
        })
    return {"scheduler_running": scheduler.running, "jobs": jobs}

@app.post("/admin/run-pipeline")
def trigger_pipeline():
    try:
        pipeline_main()
        return {"status": "success", "message": "Pipeline selesai, data masuk DB"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/admin/run-predict")
def trigger_predict():
    try:
        run_scheduler_task()
        return {"status": "success", "message": "Prediksi selesai, data masuk DB"}
    except Exception as e:
        return {"status": "error", "message": str(e)}