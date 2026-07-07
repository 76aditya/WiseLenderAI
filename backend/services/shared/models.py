import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PREDICTION_PENDING = "PREDICTION_PENDING"
    PROCESSING = "PROCESSING"
    PREDICTED = "PREDICTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class FinalReview(str, enum.Enum):
    NOT_REVIEWED = "NOT_REVIEWED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    admin = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    
    # Extended Profile Fields
    full_name = Column(String(255), nullable=False, server_default='Pending')
    date_of_birth = Column(String(50), nullable=False, server_default='Not Provided')
    gender = Column(String(50), nullable=False, server_default='Not Provided')
    residential_address = Column(Text, nullable=False, server_default='Not Provided')
    permanent_address = Column(Text, nullable=False, server_default='Not Provided')
    nationality = Column(String(100), nullable=False, server_default='Not Provided')
    user_status = Column(String(50), nullable=False, server_default='Pending')
    
    # Optional Fields
    mobile_number = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    national_id_number = Column(String(100), nullable=True)
    pan_tax_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    applications = relationship(
        "Application",
        back_populates="user",
        foreign_keys="Application.user_id",
        cascade="all, delete-orphan",
    )
    reviewed_applications = relationship(
        "Application",
        back_populates="reviewer",
        foreign_keys="Application.reviewed_by",
        cascade="all, delete-orphan",
    )

class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.DRAFT)
    final_review = Column(
        String(20),
        nullable=False,
        server_default=FinalReview.NOT_REVIEWED.value,
        default=FinalReview.NOT_REVIEWED.value,
    )
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    questionnaire = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="applications", foreign_keys=[user_id])
    reviewer = relationship("User", back_populates="reviewed_applications", foreign_keys=[reviewed_by])
    prediction = relationship("Prediction", uselist=False, back_populates="application", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="application", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    alternative_credit_score = Column(Integer, nullable=False)
    decision = Column(String(64), nullable=False)
    default_probability = Column(Float, nullable=False)
    risk_level = Column(String(64), nullable=False)
    financial_index = Column(Float, nullable=False)
    behavior_index = Column(Float, nullable=False)
    digital_trust_index = Column(Float, nullable=False)
    financial_probability = Column(Float, nullable=False)
    behavior_probability = Column(Float, nullable=False)
    digital_probability = Column(Float, nullable=False)
    meta_index = Column(Float, nullable=False)
    reasons = Column(JSON, nullable=False, default={})
    raw_response = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    application = relationship("Application", back_populates="prediction")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(64), nullable=False)
    storage_path = Column(Text, nullable=False)
    document_metadata = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    application = relationship("Application", back_populates="documents")
