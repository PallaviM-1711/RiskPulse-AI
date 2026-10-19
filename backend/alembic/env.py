from logging.config import fileConfig
from pathlib import Path
import os

from sqlalchemy import create_engine, pool
from alembic import context
from dotenv import load_dotenv

from app import models


# Alembic configuration
config = context.config


# Set up logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Load our backend/.env file
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


# Get the Neon database URL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")


# Tell Alembic about our SQLAlchemy models
target_metadata = models.Base.metadata


def run_migrations_offline() -> None:
    """Run migrations without connecting to the database."""

    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations while connected to the database."""

    connectable = create_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()