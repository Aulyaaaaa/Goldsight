import os
import pickle
import pandas as pd

# ============================================================
# CONFIG
# ============================================================
BASE_DIR = os.getcwd()

MODEL_DAILY = os.path.join(
    BASE_DIR,
    "pkl_output/champion_daily_LinearRegression.pkl"
)

MODEL_WEEKLY = os.path.join(
    BASE_DIR,
    "pkl_output/champion_weekly_XGBRegressor.pkl"
)

FEATURE_COLS = [
    "weight",
    "lag_1",
    "lag_3",
    "lag_7",
    "ma_7",
    "ma_14",
    "rolling_std_7",
    "momentum",
    "trend_strength",
    "day_of_week",
]

# ============================================================
# LOAD MODEL
# ============================================================
def load_models():
    with open(MODEL_DAILY, "rb") as f:
        daily_model = pickle.load(f)

    with open(MODEL_WEEKLY, "rb") as f:
        weekly_model = pickle.load(f)

    return daily_model, weekly_model

# ============================================================
# LOAD HISTORICAL DATA
# ============================================================
def load_historical(weight, conn):

    query = """
    SELECT
        brand,
        resource,
        weight,
        sell_price,
        buyback_price,
        updated_at
    FROM gold_prices
    WHERE weight = %s
    ORDER BY updated_at ASC
    """

    df = pd.read_sql(
        query,
        conn,
        params=(weight,)
    )

    if df.empty:
        raise ValueError(
            f"Data weight {weight}g tidak ditemukan"
        )

    df["updated_at"] = pd.to_datetime(
        df["updated_at"]
    )

    return df.reset_index(drop=True)

# ============================================================
# FEATURE ENGINEERING
# ============================================================
def build_feature_row(df, weight, target_date):

    p = "sell_price"
    n = len(df)

    lag_1 = float(df[p].iloc[-1])
    lag_3 = float(df[p].iloc[-3] if n >= 3 else df[p].iloc[0])
    lag_7 = float(df[p].iloc[-7] if n >= 7 else df[p].iloc[0])

    ma_7 = float(df[p].tail(7).mean())
    ma_14 = float(df[p].tail(14).mean() if n >= 14 else df[p].mean())

    rolling_std_7 = float(df[p].tail(7).std())

    momentum = lag_1 - lag_7

    trend_strength = lag_1 / ma_14 if ma_14 != 0 else 1.0

    day_of_week = pd.Timestamp(target_date).dayofweek

    return pd.DataFrame([{
        "weight": weight,
        "lag_1": lag_1,
        "lag_3": lag_3,
        "lag_7": lag_7,
        "ma_7": ma_7,
        "ma_14": ma_14,
        "rolling_std_7": rolling_std_7,
        "momentum": momentum,
        "trend_strength": trend_strength,
        "day_of_week": day_of_week,
    }])

# ============================================================
# PREDICT FUNCTION
# ============================================================
def predict_price(
    df,
    weight,
    target_date,
    model,
    model_version
):

    X = build_feature_row(
        df,
        weight,
        target_date
    )[FEATURE_COLS]

    last_price = float(df["sell_price"].iloc[-1])

    # model predict delta
    predicted_delta = float(model.predict(X)[0])

    # final predicted price
    predicted_price = last_price + predicted_delta

    ma7 = float(X["ma_7"].iloc[0])
    ma14 = float(X["ma_14"].iloc[0])

    return {
        "weight": weight,
        "last_price": last_price,

        "predicted_price": predicted_price,
        "predicted_delta": predicted_delta,

        "target_date": target_date,

        "model_version": model_version,

        "ma_7": ma7,
        "ma_14": ma14
    }