import sys
from pathlib import Path
import random
from datetime import datetime, timedelta
from uuid import uuid4

# Allow the simulator to use our backend code
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from backend.app.database import SessionLocal
from backend.app.models import Merchant, Customer, Transaction, Incident


PAYMENT_METHODS = ["UPI", "CARD", "NET_BANKING"]

LOCATIONS = [
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Chennai",
    "Hyderabad",
]


def generate_normal_transaction(merchant, customer, timestamp):
    amount = round(random.lognormvariate(7.5, 0.7), 2)
    amount = min(max(amount, 100), 10000)
    risk_score = round(random.uniform(5, 28), 1)

    return Transaction(
        transaction_code=f"TX{uuid4().hex[:8].upper()}",
        merchant_code=merchant.merchant_code,
        customer_code=customer.customer_code,
        amount=amount,
        payment_method=random.choice(PAYMENT_METHODS),
        device_id=f"DEV{random.randint(1, 50):03d}",
        ip_address=f"192.168.1.{random.randint(1, 254)}",
        location=random.choice(LOCATIONS),
        status=random.choices(
            ["SUCCESS", "FAILED"],
            weights=[95, 5]
        )[0],
        timestamp=timestamp,
        risk_score=risk_score,
        risk_level="LOW",
        fraud_label=0,
        scenario_type="NORMAL",
        is_simulated=True,
    )


def simulate_scenario(scenario_type="FRAUD_SPIKE", count=40, merchant_code=None, intensity="HIGH"):
    """
    Executes a simulated transaction scenario:
    - NORMAL: Normal distributed background traffic
    - FRAUD_SPIKE: High velocity coordinated fraud attack against a merchant
    - CARD_TESTING: Rapid small-amount authorization testing across cards
    - DEVICE_BURST: Heavy device concentration across multiple customer accounts
    """
    db = SessionLocal()
    try:
        merchants = db.query(Merchant).all()
        customers = db.query(Customer).all()

        if not merchants or not customers:
            raise RuntimeError("Database must be seeded with merchants and customers.")

        if merchant_code:
            target_merchant = db.query(Merchant).filter(Merchant.merchant_code == merchant_code).first()
            if not target_merchant:
                target_merchant = random.choice(merchants)
        else:
            target_merchant = random.choice(merchants)

        current_time = datetime.utcnow()
        transactions = []
        total_amount = 0.0

        if scenario_type == "NORMAL":
            for _ in range(count):
                m = random.choice(merchants)
                c = random.choice(customers)
                ts = current_time - timedelta(minutes=random.randint(0, 1440))
                txn = generate_normal_transaction(m, c, ts)
                transactions.append(txn)
                total_amount += txn.amount

        elif scenario_type == "CARD_TESTING":
            shared_device = f"DEV{random.randint(1, 50):03d}"
            shared_ip = f"192.168.1.{random.randint(1, 254)}"
            for _ in range(count):
                c = random.choice(customers)
                ts = current_time - timedelta(seconds=random.randint(0, 120))
                amt = round(random.uniform(10, 150), 2)
                score = round(random.uniform(65, 88), 1)
                status = random.choices(["FAILED", "SUCCESS"], weights=[75, 25])[0]
                txn = Transaction(
                    transaction_code=f"TX{uuid4().hex[:8].upper()}",
                    merchant_code=target_merchant.merchant_code,
                    customer_code=c.customer_code,
                    amount=amt,
                    payment_method="CARD",
                    device_id=shared_device,
                    ip_address=shared_ip,
                    location=random.choice(LOCATIONS),
                    status=status,
                    timestamp=ts,
                    risk_score=score,
                    risk_level="HIGH" if score < 80 else "CRITICAL",
                    fraud_label=1,
                    scenario_type="CARD_TESTING",
                    is_simulated=True,
                )
                transactions.append(txn)
                total_amount += amt

        elif scenario_type == "DEVICE_BURST":
            burst_device = f"DEV{random.randint(100, 199):03d}"
            for _ in range(count):
                c = random.choice(customers)
                ts = current_time - timedelta(seconds=random.randint(0, 90))
                amt = round(random.uniform(2000, 12000), 2)
                score = round(random.uniform(70, 92), 1)
                txn = Transaction(
                    transaction_code=f"TX{uuid4().hex[:8].upper()}",
                    merchant_code=target_merchant.merchant_code,
                    customer_code=c.customer_code,
                    amount=amt,
                    payment_method=random.choice(PAYMENT_METHODS),
                    device_id=burst_device,
                    ip_address=f"192.168.1.{random.randint(1, 254)}",
                    location=target_merchant.location,
                    status="SUCCESS",
                    timestamp=ts,
                    risk_score=score,
                    risk_level="HIGH" if score < 80 else "CRITICAL",
                    fraud_label=1,
                    scenario_type="DEVICE_BURST",
                    is_simulated=True,
                )
                transactions.append(txn)
                total_amount += amt

        else:  # Default FRAUD_SPIKE
            suspicious_device = f"DEV{random.randint(1, 30):03d}"
            for _ in range(count):
                c = random.choice(customers)
                ts = current_time - timedelta(seconds=random.randint(0, 60))
                amt = round(random.uniform(1500, 8500), 2)
                score = round(random.uniform(80, 96), 1) if intensity == "HIGH" else round(random.uniform(62, 79), 1)
                txn = Transaction(
                    transaction_code=f"TX{uuid4().hex[:8].upper()}",
                    merchant_code=target_merchant.merchant_code,
                    customer_code=c.customer_code,
                    amount=amt,
                    payment_method=random.choice(PAYMENT_METHODS),
                    device_id=random.choice([suspicious_device, f"DEV{random.randint(1, 10):03d}"]),
                    ip_address=f"192.168.1.{random.randint(1, 20)}",
                    location=target_merchant.location,
                    status=random.choices(["SUCCESS", "FAILED"], weights=[80, 20])[0],
                    timestamp=ts,
                    risk_score=score,
                    risk_level="CRITICAL" if score >= 80 else "HIGH",
                    fraud_label=1,
                    scenario_type="FRAUD_SPIKE",
                    is_simulated=True,
                )
                transactions.append(txn)
                total_amount += amt

        db.add_all(transactions)

        # Automatically log an Incident if attack scenario
        incident_code = None
        if scenario_type != "NORMAL":
            incident_code = f"INC-{uuid4().hex[:6].upper()}"
            title_map = {
                "FRAUD_SPIKE": f"Rapid Fraud Spike on {target_merchant.name}",
                "CARD_TESTING": f"Card Authorization Testing Attack on {target_merchant.name}",
                "DEVICE_BURST": f"Coordinated Device Concentration Burst on {target_merchant.name}",
            }
            incident = Incident(
                incident_code=incident_code,
                title=title_map.get(scenario_type, f"Fraud Anomaly on {target_merchant.name}"),
                incident_type=scenario_type,
                severity="CRITICAL" if intensity == "HIGH" else "HIGH",
                merchant_code=target_merchant.merchant_code,
                affected_transactions_count=count,
                exposure_amount=round(total_amount, 2),
                status="ACTIVE",
                detected_at=current_time,
            )
            db.add(incident)

        db.commit()

        avg_risk = round(sum(t.risk_score for t in transactions) / max(len(transactions), 1), 1)
        blocked_count = sum(1 for t in transactions if t.risk_score >= 80)

        return {
            "status": "success",
            "scenario_type": scenario_type,
            "merchant_code": target_merchant.merchant_code,
            "merchant_name": target_merchant.name,
            "transactions_created": len(transactions),
            "total_exposure": round(total_amount, 2),
            "avg_risk_score": avg_risk,
            "blocked_count": blocked_count,
            "incident_code": incident_code,
        }

    finally:
        db.close()


def generate_normal_transactions(count=100):
    return simulate_scenario("NORMAL", count)


def generate_fraud_spike(count=40):
    return simulate_scenario("FRAUD_SPIKE", count)


if __name__ == "__main__":
    result = generate_fraud_spike(40)
    print("Simulation complete:", result)