"""Auto-generated Alembic script
Revision ID: 054927249e8c
Revises: fce7e0d16671
Create Date: 2026-07-07 23:22:12.671609
"""

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision = '054927249e8c'
down_revision = 'fce7e0d16671'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Drop constraints that depend on user.id
    op.drop_constraint('applications_user_id_fkey', 'applications', type_='foreignkey')
    op.drop_constraint('applications_reviewed_by_fkey', 'applications', type_='foreignkey')

    # 2. Add temporary columns to store the mapped username
    op.add_column('applications', sa.Column('user_username', sa.String(length=255), nullable=True))
    op.add_column('applications', sa.Column('reviewer_username', sa.String(length=255), nullable=True))

    # 3. Migrate data: map UUID to username
    op.execute("""
        UPDATE applications 
        SET user_username = users.username 
        FROM users 
        WHERE applications.user_id = users.id
    """)
    op.execute("""
        UPDATE applications 
        SET reviewer_username = users.username 
        FROM users 
        WHERE applications.reviewed_by = users.id
    """)

    # 4. Drop old UUID columns and rename the temporary ones
    op.drop_column('applications', 'user_id')
    op.drop_column('applications', 'reviewed_by')
    op.alter_column('applications', 'user_username', new_column_name='user_id', nullable=False)
    op.alter_column('applications', 'reviewer_username', new_column_name='reviewed_by', nullable=True)

    # 5. Fix users table primary key
    op.drop_constraint('users_pkey', 'users', type_='primary')
    op.drop_column('users', 'id')
    op.drop_index('ix_users_username', table_name='users')
    op.create_primary_key('users_pkey', 'users', ['username'])
    op.create_index('ix_users_username', 'users', ['username'], unique=False)

    # 6. Re-add foreign keys pointing to username
    op.create_foreign_key(None, 'applications', 'users', ['user_id'], ['username'], ondelete='CASCADE')
    op.create_foreign_key(None, 'applications', 'users', ['reviewed_by'], ['username'], ondelete='SET NULL')

    # 6.5 Fill null mobile numbers
    op.execute("UPDATE users SET mobile_number = 'Not Provided' WHERE mobile_number IS NULL")

    # 7. Update mobile_number
    op.alter_column('users', 'mobile_number',
               existing_type=sa.VARCHAR(length=50),
               server_default='Not Provided',
               nullable=False)
    # ### end Alembic commands ###


def downgrade():
    # We won't implement a full downgrade since mapping usernames back to the original UUIDs is impossible (they were deleted).
    # You would have to generate new UUIDs. Let's just drop the new constraints.
    op.drop_constraint(None, 'applications', type_='foreignkey')
    op.drop_constraint(None, 'applications', type_='foreignkey')
    pass
