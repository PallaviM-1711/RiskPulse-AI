from sqlalchemy import func

from ..models import Transaction


def calculate_merchant_average_amount(db, merchant_code):
    """
    Calculate the merchant's average transaction amount.
    """

    average_amount = (
        db.query(func.avg(Transaction.amount))
        .filter(
            Transaction.merchant_code == merchant_code,
            Transaction.scenario_type == "NORMAL"
        )
        .scalar()
    )

    return float(average_amount or 0)


def detect_amount_anomaly(
    db,
    merchant_code,
    amount,
    multiplier=3
):
    """
    Detect whether a transaction amount is unusually
    large compared with the merchant's normal behavior.
    """

    average_amount = calculate_merchant_average_amount(
        db,
        merchant_code
    )

    if average_amount == 0:
        return {
            "merchant_code": merchant_code,
            "transaction_amount": amount,
            "average_amount": 0,
            "threshold": 0,
            "is_anomaly": False,
        }

    threshold = average_amount * multiplier

    is_anomaly = amount >= threshold

    return {
        "merchant_code": merchant_code,
        "transaction_amount": amount,
        "average_amount": round(average_amount, 2),
        "threshold": round(threshold, 2),
        "is_anomaly": is_anomaly,
    }