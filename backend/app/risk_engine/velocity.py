from datetime import datetime, timedelta

from sqlalchemy import func

from ..models import Transaction


def calculate_merchant_velocity(db, merchant_code, window_minutes=5):
    """
    Count how many transactions a merchant received
    within the specified time window.
    """

    end_time = datetime.now()
    start_time = end_time - timedelta(minutes=window_minutes)

    transaction_count = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.merchant_code == merchant_code,
            Transaction.timestamp >= start_time,
            Transaction.timestamp <= end_time,
        )
        .scalar()
    )

    return transaction_count or 0


def detect_velocity_anomaly(
    db,
    merchant_code,
    threshold=20,
    window_minutes=5
):
    """
    Detect unusually high transaction activity.
    """

    transaction_count = calculate_merchant_velocity(
        db,
        merchant_code,
        window_minutes
    )

    is_anomaly = transaction_count >= threshold

    return {
        "merchant_code": merchant_code,
        "window_minutes": window_minutes,
        "transaction_count": transaction_count,
        "threshold": threshold,
        "is_anomaly": is_anomaly,
    }