"""Add final review fields to applications

Revision ID: 0001_add_final_review_fields
Revises: 
Create Date: 2026-07-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_add_final_review_fields"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "applications",
        sa.Column("final_review", sa.String(length=20), nullable=False, server_default=sa.text("'NOT_REVIEWED'")),
    )
    op.add_column(
        "applications",
        sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "applications",
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_applications_reviewed_by", "applications", ["reviewed_by"], unique=False)
    op.create_foreign_key(None, "applications", "users", ["reviewed_by"], ["id"], ondelete="SET NULL")


def downgrade():
    op.drop_constraint(None, "applications", type_="foreignkey")
    op.drop_index("ix_applications_reviewed_by", table_name="applications")
    op.drop_column("applications", "reviewed_at")
    op.drop_column("applications", "reviewed_by")
    op.drop_column("applications", "final_review")
