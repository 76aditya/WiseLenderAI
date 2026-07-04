from fastapi import FastAPI
from .schemas import (
    CreditRequest,
    CreditResponse
)
from .predictor import predict

app = FastAPI(
    title="WiseLender AI",
    description="Alternative Credit Scoring API",
    version="1.0.0"
)

@app.get("/")
def root():

    return {
        "message": "WiseLender AI API Running"
    }

@app.post(
    "/predict",
    response_model=CreditResponse
)

def predict_credit(
    request: CreditRequest
):
    result = predict(
        request.model_dump()
    )
    return result