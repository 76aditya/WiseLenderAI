from .financial_model import predict_financial
from .behavioral_model import predict_behavior
from .digital_trust_model import predict_digital_trust
from .ensemble import calculate_meta_score


def predict(data: dict):
    financial_result = predict_financial(data)
    behavior_result = predict_behavior(data)
    digital_result = predict_digital_trust(data)
    ensemble_result = calculate_meta_score(
        financial_result["financial_index"],
        behavior_result["behavior_index"],
        digital_result["digital_trust_index"]
    )

    if ensemble_result["credit_score"] >= 750:
        decision = "APPROVE"
    elif ensemble_result["credit_score"] >= 650:
        decision = "MANUAL REVIEW"
    else:
        decision = "DECLINE"
    
    return {
        "financial_index":financial_result["financial_index"],
        "behavior_index":behavior_result["behavior_index"],
        "digital_trust_index":digital_result["digital_trust_index"],
        "financial_probability":financial_result["financial_probability"],
        "behavior_probability":behavior_result["behavior_probability"],
        "digital_probability":digital_result["digital_probability"],
        "meta_index":ensemble_result["meta_index"],
        "alternative_credit_score":ensemble_result["credit_score"],
        "decision": decision,
        "default_probability":ensemble_result["default_probability"],
        "risk_level":ensemble_result["risk_level"],
        "financial_reasons": financial_result["financial_reasons"],
        "behavior_reasons": behavior_result["behavior_reasons"],
        "digital_reasons": digital_result["digital_reasons"]
    }