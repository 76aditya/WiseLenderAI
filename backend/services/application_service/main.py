from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.application_service.routes import router as application_router
from services.shared.database import engine
from services.shared.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="WiseLenderAI Application Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(application_router)

@app.get("/")
def root() -> dict:
    return {"message": "WiseLenderAI Application Service is online"}
