import warnings
import pandas as pd
from datetime import datetime, timedelta
import traceback
from dotenv import load_dotenv
from app.database import connect_db, log
from app.recommendation import ma_signal, generate_recommendation
from app.prediction import load_models, load_historical, predict_price
import os

load_dotenv()

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

LOG_FILE = os.path.join(
    BASE_DIR,
    "logs",
    "predict_log.txt"
)

WEIGHTS = [0.5, 1, 2, 3, 5]

# ============================================================
# INSERT PREDICTION
# ============================================================
def insert_prediction(cursor, data):

    query = """
    INSERT INTO predictions (
        prediction_date,
        target_date,
        weight,
        predicted_price,
        predicted_delta,
        model_version,
        created_at
    )
    VALUES (%s, %s, %s, %s, %s, %s, NOW())
    
    ON CONFLICT (
        weight,
        prediction_date,
        target_date
        )

    DO NOTHING

    RETURNING id
    """

    values = (
        datetime.now().date(),
        data["target_date"],
        data["weight"],
        round(data["predicted_price"]),
        round(data["predicted_delta"]),
        data["model_version"]
    )

    cursor.execute(query, values)

    row = cursor.fetchone()
    if row is None:
        log(        f"Prediction already exists: "
        f"{data['weight']}g | "
        f"{data['target_date']}",
        LOG_FILE
    )

    prediction_id = row[0]

    return prediction_id

# ============================================================
# INSERT RECOMMENDATION
# ============================================================
def insert_recommendation(
    cursor,
    prediction_id,
    recommendation
):

    query = """
    INSERT INTO recommendations (
        prediction_id,
        recommendation_type,
        created_at
    )
    VALUES (%s, %s, NOW())
    """

    values = (
        prediction_id,
        recommendation
    )

    cursor.execute(query, values)

# ============================================================
# MAIN TASK
# ============================================================
def run_scheduler_task():

    print("Loading models...")

    daily_model, weekly_model = load_models()

    conn = connect_db()

    cursor = conn.cursor()

    try:

        for weight in WEIGHTS:

            print(f"Processing {weight}g...")

            # load historical sekali
            df = load_historical(weight, conn)

            # ====================================================
            # LOOP 21 HARI
            # ====================================================
            for day in range(1, 22):

                target_date = (
                    datetime.now()
                    + timedelta(days=day)
                )

                # ================================================
                # PILIH MODEL
                # ================================================
                if day in [7, 14, 21]:

                    model = weekly_model
                    model_version = "weekly_xgb_v1"

                else:

                    model = daily_model
                    model_version = "daily_linear_v1"

                # ================================================
                # PREDICT
                # ================================================
                result = predict_price(
                    df=df,
                    weight=weight,
                    target_date=target_date,
                    model=model,
                    model_version=model_version
                )

                # ================================================
                # MA SIGNAL
                # ================================================
                ma_sig = ma_signal(
                    result["ma_7"],
                    result["ma_14"]
                )

                # ================================================
                # RECOMMENDATION
                # ================================================
                rec = generate_recommendation(
                    current_price=result["last_price"],
                    predicted_price=result["predicted_price"],
                    ma_sig=ma_sig
                )

                # ================================================
                # SAVE PREDICTION
                # ================================================
                prediction_id = insert_prediction(
                    cursor,
                    result
                )

                # ================================================
                # SAVE RECOMMENDATION
                # ================================================
                if prediction_id is not None:
                    insert_recommendation(
                        cursor,
                        prediction_id,
                        rec["recommendation"]
                    )

                # ================================================
                # APPEND PREDICTION
                # iterative forecasting
                # ================================================
                new_row = pd.DataFrame([{
                    "brand": df["brand"].iloc[-1],
                    "resource": df["resource"].iloc[-1],
                    "weight": weight,
                    "sell_price": round(result["predicted_price"]),
                    "buyback_price": df["buyback_price"].iloc[-1],
                    "updated_at": pd.Timestamp(target_date)
                }])

                df = pd.concat(
                    [df, new_row],
                    ignore_index=True
                )

                print(
                    f"Day {day} | {weight}g | "
                    f"{model_version} | "
                    f"{round(result['predicted_price'])}"
                )

        conn.commit()

        print("\nAll predictions inserted successfully")

    except Exception as e:

        conn.rollback()

        log(f"ERROR: {e}", LOG_FILE)

    finally:

        cursor.close()
        conn.close()

# ============================================================
# ENTRY POINT
# ============================================================
if __name__ == "__main__":

    try:
        run_scheduler_task()

    except Exception as e:
        log("FATAL ERROR", LOG_FILE)
        log(str(e), LOG_FILE)
        log(traceback.format_exc(), LOG_FILE)