# ============================================================
# MA SIGNAL
# ============================================================
def ma_signal(ma_7, ma_14):

    if ma_7 > ma_14:
        return "bullish"

    elif ma_7 < ma_14:
        return "bearish"

    return "neutral"

# ============================================================
# RULE-BASED RECOMMENDATION
# ============================================================
def generate_recommendation(
    current_price,
    predicted_price,
    ma_sig
):

    delta = predicted_price - current_price

    delta_pct = (
        (delta / current_price) * 100
        if current_price > 0 else 0
    )

    if delta_pct > 1.5:
        rec = "BUY"

    elif delta_pct < -1.5:
        rec = "SELL"

    elif -0.5 <= delta_pct <= 0.5:
        rec = "HOLD"

    else:
        rec = "HOLD"

    # reinforce by MA signal
    if ma_sig == "bullish" and rec == "HOLD" and delta_pct > 0:
        rec = "BUY"

    elif ma_sig == "bearish" and rec == "HOLD" and delta_pct < 0:
        rec = "SELL"

    return {
        "recommendation": rec,
        "delta_pct": round(delta_pct, 2)
    }