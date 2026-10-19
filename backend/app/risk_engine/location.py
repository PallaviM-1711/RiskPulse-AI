from sqlalchemy import func

from ..models import Transaction


def detect_location_anomaly(
    db,
    customer_code,
    location,
    location_threshold=3
):
    """
    Detect whether a customer is using an unusual location.

    The customer's historical transaction locations are checked.
    If the requested location has never been used before,
    it is considered anomalous.
    """

    location_count = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.customer_code == customer_code,
            Transaction.location == location
        )
        .scalar()
    )

    location_count = location_count or 0

    total_transactions = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.customer_code == customer_code
        )
        .scalar()
    )

    total_transactions = total_transactions or 0

    # A location is considered unusual when:
    # 1. The customer has previous transactions
    # 2. The requested location has not appeared before
    is_anomaly = (
        total_transactions > 0
        and location_count < location_threshold
    )

    return {
        "customer_code": customer_code,
        "location": location,
        "location_count": location_count,
        "total_transactions": total_transactions,
        "threshold": location_threshold,
        "is_anomaly": is_anomaly,
    }