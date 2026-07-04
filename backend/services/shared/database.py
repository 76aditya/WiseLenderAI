from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        future=True,
    )
)

def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
