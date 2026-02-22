"""scope lead email uniqueness to user

Revision ID: 0003
Revises: 0002
Create Date: 2026-02-22
"""

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the old global unique constraint on email
    op.drop_constraint("leads_email_key", "leads", type_="unique")
    # Add composite unique constraint: one email per user
    op.create_unique_constraint("uq_leads_user_email", "leads", ["user_id", "email"])


def downgrade() -> None:
    op.drop_constraint("uq_leads_user_email", "leads", type_="unique")
    op.create_unique_constraint("leads_email_key", "leads", ["email"])
