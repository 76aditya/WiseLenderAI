import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from .explanations import FEATURE_EXPLANATIONS

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

model = joblib.load(str(MODELS_DIR / "digital_trust_model.pkl"))

features = joblib.load(str(MODELS_DIR / "digital_trust_features.pkl"))

threshold = joblib.load(str(MODELS_DIR / "digital_trust_threshold.pkl"))

maps = joblib.load(str(MODELS_DIR / "digital_trust_maps.pkl"))

explainer = joblib.load(str(MODELS_DIR / "digital_trust_shap.pkl"))

def predict_digital_trust(data: dict):

    row = {}

    # Communication Score

    row["communication_score"] = (
        data["FLAG_MOBIL"]
        +
        data["FLAG_PHONE"]
        +
        data["FLAG_WORK_PHONE"]
        +
        data["FLAG_CONT_MOBILE"]
        +
        data["FLAG_EMAIL"]
    ) * 20


    # Employment Stability

    employment_years = (
        abs(data["DAYS_EMPLOYED"])/ 365
    )
    row["employment_stability_score"] = (
        np.clip(employment_years,0,20)/ 20* 100
    )

    # Housing Stability

    row["housing_stability_score"] = (
        maps["housing"]
        .get(
            data["NAME_HOUSING_TYPE"],50
        )
    )

    # Family Stability
    family_ratio = (
        data["CNT_CHILDREN"]/max(data["CNT_FAM_MEMBERS"],1)
    )
    family_score = (100-family_ratio * 100)
    family_score += (
        maps["family"]
        .get(
            data["NAME_FAMILY_STATUS"],50
        )
    )
    row["family_stability_score"] = (
        family_score / 2
    )
    # Identity Consistency
    registration_years = (
        abs(data["DAYS_REGISTRATION"])/ 365
    )
    id_years = (
        abs(data["DAYS_ID_PUBLISH"])/ 365
    )
    phone_years = (
        abs(data["DAYS_LAST_PHONE_CHANGE"])/ 365
    )
    row["identity_consistency_score"] = (
        np.clip(registration_years + id_years + phone_years,0,30)/ 30* 100
    )
    # Regional Stability
    regional_changes = (
        data["REG_REGION_NOT_WORK_REGION"]
        +
        data["REG_CITY_NOT_WORK_CITY"]
        +
        data["LIVE_CITY_NOT_WORK_CITY"]
    )
    row["regional_stability_score"] = (
        100-regional_changes * 33.33
    )
    # Education Stability
    row["education_stability_score"] = (
        maps["education"]
        .get(
            data["NAME_EDUCATION_TYPE"],
            50
        )
    )
    # Income Stability
    row["income_stability_score"] = (
        maps["income"]
        .get(
            data["NAME_INCOME_TYPE"],
            50
        )
    )
    # Occupation Stability
    row["occupation_stability_score"] = (
        maps["occupation"]
        .get(
            data["OCCUPATION_TYPE"],
            50
        )
    )

    # Organization Stability
    row["organization_stability_score"] = (
        maps["organization"]
        .get(
            data["ORGANIZATION_TYPE"],
            50
        )
    )

    # Regional Quality
    row["regional_quality_score"] = {
        1: 100,
        2: 70,
        3: 40
    }.get(
        data["REGION_RATING_CLIENT"],
        50
    )

    X = pd.DataFrame([row])

    probability = float(
        model.predict_proba(X)[0][1]
    )

    digital_trust_index = round(
        (1 - probability) * 100,2
    )
    # SHAP explanation
    shap_values = explainer.shap_values(X)

    # Handle binary classifiers
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    contributions = dict(
        zip(
            X.columns,
            shap_values[0]
        )
    )

    top_reasons = sorted(
        contributions.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:3]

    digital_reasons = []
    for feature, impact in top_reasons:
        digital_reasons.append({
            "feature": feature.replace("_"," ").title(),
            "impact": round(float(impact),4),
            "risk_impact": (
                "Higher Default Risk"
                if impact > 0
                else "Lower Default Risk"
            ),
            "description":
                FEATURE_EXPLANATIONS.get(
                    feature,
                    "Important feature."
                )
        })

    return {
        "digital_probability": probability,
        "digital_trust_index": digital_trust_index,
        "digital_reasons": digital_reasons
    }