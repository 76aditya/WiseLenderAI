def calculate_meta_score(
    financial_index: float,
    behavior_index: float,
    digital_trust_index: float
):

    meta_index = (
        0.45 * financial_index +
        0.35 * behavior_index +
        0.20 * digital_trust_index
    )

    credit_score = int(
        300 + (meta_index / 100) * 600
    )

    default_probability = round(
        (100 - meta_index) / 100,
        4
    )

    if credit_score >= 750:
        risk_level = "LOW"

    elif credit_score >= 650:
        risk_level = "MEDIUM"

    else:
        risk_level = "HIGH"

    return {
        "meta_index": round(meta_index, 2),
        "credit_score": credit_score,
        "default_probability": default_probability,
        "risk_level": risk_level
    }
    