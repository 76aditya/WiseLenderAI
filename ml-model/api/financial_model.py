import joblib
import pandas as pd
from pathlib import Path
from .explanations import FEATURE_EXPLANATIONS

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

model = joblib.load(str(MODELS_DIR / "financial_model.pkl"))

features = joblib.load(str(MODELS_DIR / "financial_features.pkl"))

threshold = joblib.load(str(MODELS_DIR / "financial_threshold.pkl"))

explainer = joblib.load(str(MODELS_DIR / "financial_shap.pkl"))

def predict_financial(data: dict):
    row = {}
    # Raw Features

    row["loan_amnt"] = data["loan_amnt"]
    row["annual_inc"] = data["annual_inc"]
    row["installment"] = data["installment"]
    row["dti"] = data["dti"]
    row["tot_cur_bal"] = data["tot_cur_bal"]
    row["avg_cur_bal"] = data["avg_cur_bal"]
    row["open_acc"] = data["open_acc"]
    row["total_acc"] = data["total_acc"]
    row["emp_length"] = data["emp_length"]

    # Engineered Features

    annual_inc = max(data["annual_inc"], 1)
    open_acc = max(data["open_acc"], 1)
    row["loan_income_ratio"] = (
        data["loan_amnt"]
        / annual_inc
    )
    row["installment_income_ratio"] = (
        data["installment"]
        / annual_inc
    )
    row["balance_income_ratio"] = (
        data["tot_cur_bal"]
        / annual_inc
    )
    row["active_credit_ratio"] = (
        data["active_credit_ratio"]
    )
    row["balance_per_account"] = (
        data["tot_cur_bal"]
        / open_acc
    )
    row["income_per_account"] = (
        annual_inc
        / open_acc
    )
    row["employment_stability"] = (
        min(data["emp_length"],10)/ 10* 100
    )
    X = pd.DataFrame(
        [[row[f] for f in features]],
        columns=features
    )
    probability = float(
        model.predict_proba(X)[0][1]
    )
    financial_index = round(
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

    financial_reasons = []

    for feature, impact in top_reasons:
        financial_reasons.append({
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
        "financial_probability": probability,
        "financial_index": financial_index,
        "financial_reasons": financial_reasons
    }