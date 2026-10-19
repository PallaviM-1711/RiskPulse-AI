from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime

from .database import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    merchant_code = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String)
    baseline_transaction_rate = Column(Float, default=0.0)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    risk_level = Column(String, default="LOW")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    transaction_code = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    merchant_code = Column(String, nullable=False, index=True)
    customer_code = Column(String, nullable=False, index=True)

    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)

    device_id = Column(String, nullable=False, index=True)
    ip_address = Column(String, index=True)
    location = Column(String)

    status = Column(String, default="SUCCESS", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="LOW")

    fraud_label = Column(Integer, default=0)

    # Used to identify the type of simulated scenario
    scenario_type = Column(String, default="NORMAL")

    # True when the transaction was created by our simulator
    is_simulated = Column(Boolean, default=True)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    incident_type = Column(String, nullable=False, default="FRAUD_SPIKE")
    severity = Column(String, nullable=False, default="HIGH")
    merchant_code = Column(String, nullable=False, index=True)
    affected_transactions_count = Column(Integer, default=0)
    exposure_amount = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)


class DefensiveAction(Base):
    __tablename__ = "defensive_actions"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String, nullable=False)  # BLOCK_DEVICE, STEP_UP_AUTH, RATE_LIMIT, FLAG_CUSTOMER
    target_type = Column(String, nullable=False)  # DEVICE, IP, MERCHANT, CUSTOMER
    target_value = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    severity = Column(String, default="MEDIUM")
    status = Column(String, default="PENDING")  # PENDING, APPLIED, DISMISSED
    created_at = Column(DateTime, default=datetime.utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)