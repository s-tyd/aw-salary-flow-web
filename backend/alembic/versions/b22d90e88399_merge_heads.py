"""merge_heads

Revision ID: b22d90e88399
Revises: time_interval_001, dce3c82d8698
Create Date: 2025-05-31 21:37:31.496604

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b22d90e88399'
down_revision: Union[str, None] = ('time_interval_001', 'dce3c82d8698')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
