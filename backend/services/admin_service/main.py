from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.admin_service.routes import router as admin_router
from services.shared.database import engine
from services.shared.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="WiseLenderAI Admin Service",
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


app.include_router(admin_router)

@app.get("/")
def root() -> dict:
    return {"message": "WiseLenderAI Admin Service is online"}
