from app.database import SessionLocal
from app.models import Merchant, Customer


MERCHANTS = [
    ("M001", "TechWorld", "Electronics", "Bengaluru"),
    ("M002", "FashionHub", "Fashion", "Mumbai"),
    ("M003", "FoodExpress", "Food", "Delhi"),
    ("M004", "TravelGo", "Travel", "Chennai"),
    ("M005", "HomeStore", "Home & Living", "Hyderabad"),
    ("M006", "BookNest", "Books", "Bengaluru"),
    ("M007", "GadgetZone", "Electronics", "Mumbai"),
    ("M008", "QuickMart", "Retail", "Delhi"),
    ("M009", "FitLife", "Fitness", "Chennai"),
    ("M010", "GameWorld", "Gaming", "Hyderabad"),
]


def seed_merchants(db):
    for code, name, category, location in MERCHANTS:
        existing = (
            db.query(Merchant)
            .filter(Merchant.merchant_code == code)
            .first()
        )

        if not existing:
            db.add(
                Merchant(
                    merchant_code=code,
                    name=name,
                    category=category,
                    location=location,
                    baseline_transaction_rate=0.0,
                )
            )


def seed_customers(db):
    for number in range(1, 101):
        code = f"C{number:03d}"

        existing = (
            db.query(Customer)
            .filter(Customer.customer_code == code)
            .first()
        )

        if not existing:
            db.add(
                Customer(
                    customer_code=code,
                    name=f"Customer {number}",
                    location="India",
                    risk_level="LOW",
                )
            )


def main():
    db = SessionLocal()

    try:
        seed_merchants(db)
        seed_customers(db)
        db.commit()

        print("Seed data created successfully!")
        print("Merchants: 10")
        print("Customers: 100")

    finally:
        db.close()


if __name__ == "__main__":
    main()