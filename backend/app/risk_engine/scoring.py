def calculate_risk_score(
    velocity_anomaly=False,
    amount_anomaly=False,
    device_anomaly=False,
    ip_anomaly=False,
    location_anomaly=False,
):
    """
    Combine individual risk signals into a single risk score.
    """

    score = 0
    reasons = []

    # Transaction velocity
    if velocity_anomaly:
        score += 40
        reasons.append("High transaction velocity")

    # Transaction amount
    if amount_anomaly:
        score += 20
        reasons.append("Unusual transaction amount")

    # Device activity
    if device_anomaly:
        score += 15
        reasons.append("Suspicious device activity")

    # IP activity
    if ip_anomaly:
        score += 15
        reasons.append("Suspicious IP activity")

    # Location activity
    if location_anomaly:
        score += 10
        reasons.append("Unusual location")

    # Never allow the score to exceed 100
    score = min(score, 100)

    # Determine risk level
    if score >= 80:
        risk_level = "CRITICAL"
    elif score >= 60:
        risk_level = "HIGH"
    elif score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons,
    }