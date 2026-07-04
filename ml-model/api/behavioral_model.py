import joblib
import pandas as pd
from pathlib import Path
from .explanations import FEATURE_EXPLANATIONS

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

model = joblib.load(str(MODELS_DIR / "behavior_model.pkl"))
features = joblib.load(str(MODELS_DIR / "behavior_features.pkl"))
threshold = joblib.load(str(MODELS_DIR / "behavior_threshold.pkl"))
mappings = joblib.load(str(MODELS_DIR / "behavior_maps.pkl"))
explainer = joblib.load(str(MODELS_DIR / "behavioral_shap_explainer.pkl"))


def predict_behavior(data: dict):

    transformed = {}

    transformed["revol_util"] = data["revol_util"]

    transformed["bc_util"] = data["bc_util"]

    transformed["credit_utilization_score"] = (
        data["credit_utilization_score"]
    )

    transformed["housing_stability_score"] = (
        mappings["housing"]
        .get(data["home_ownership"], 50)
    )

    transformed["purpose_risk_score"] = (
        mappings["purpose"]
        .get(data["purpose"], 50)
    )

    transformed["verification_score"] = (
        mappings["verification"]
        .get(data["verification_status"], 50)
    )

    print(features)
    print(transformed.keys())
    
    X = pd.DataFrame(
        [[transformed[f] for f in features]],
        columns=features
    )

    probability = float(
        model.predict_proba(X)[0][1]
    )

    behavior_index = round(
        (1 - probability) * 100,
        2
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

    behavior_reasons = []
    for feature, impact in top_reasons:
        behavior_reasons.append({
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
        "behavior_probability": probability,
        "behavior_index": behavior_index,
        "behavior_reasons": behavior_reasons
    }