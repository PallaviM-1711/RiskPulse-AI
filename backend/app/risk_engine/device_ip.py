from sqlalchemy import func

from ..models import Transaction


def detect_device_abuse(
    db,
    device_id,
    customer_threshold=3
):
    """
    Detect whether one device is being used
    by an unusually large number of customers.
    """

    customer_count = (
        db.query(func.count(func.distinct(Transaction.customer_code)))
        .filter(
            Transaction.device_id == device_id
        )
        .scalar()
    )

    customer_count = customer_count or 0

    is_anomaly = customer_count >= customer_threshold

    return {
        "device_id": device_id,
        "unique_customers": customer_count,
        "threshold": customer_threshold,
        "is_anomaly": is_anomaly,
    }


def detect_ip_abuse(
    db,
    ip_address,
    customer_threshold=3
):
    """
    Detect whether one IP address is being used
    by an unusually large number of customers.
    """

    customer_count = (
        db.query(func.count(func.distinct(Transaction.customer_code)))
        .filter(
            Transaction.ip_address == ip_address
        )
        .scalar()
    )

    customer_count = customer_count or 0

    is_anomaly = customer_count >= customer_threshold

    return {
        "ip_address": ip_address,
        "unique_customers": customer_count,
        "threshold": customer_threshold,
        "is_anomaly": is_anomaly,
    }