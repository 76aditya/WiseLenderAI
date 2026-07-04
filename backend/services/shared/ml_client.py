from typing import Any

import httpx

from services.shared.config import settings


def _build_ml_payload(payload: dict[str, Any]) -> dict[str, Any]:
    ml_payload = dict(payload)

    total_acc = ml_payload.get("total_acc")
    open_acc = ml_payload.get("open_acc")
    if ml_payload.get("active_credit_ratio") is None:
        if total_acc and open_acc is not None:
            ml_payload["active_credit_ratio"] = float(open_acc) / float(total_acc)
        else:
            ml_payload["active_credit_ratio"] = 0.0

    revol_util = ml_payload.get("revol_util")
    bc_util = ml_payload.get("bc_util")
    if ml_payload.get("credit_utilization_score") is None:
        if revol_util is not None and bc_util is not None:
            ml_payload["credit_utilization_score"] = (float(revol_util) + float(bc_util)) / 2.0
        else:
            ml_payload["credit_utilization_score"] = 0.0

    return ml_payload


def request_prediction(payload: dict) -> dict:
    ml_payload = _build_ml_payload(payload)
    with httpx.Client(timeout=30.0) as client:
        response = client.post(str(settings.ML_SERVICE_URL), json=ml_payload)
        response.raise_for_status()
        return response.json()
