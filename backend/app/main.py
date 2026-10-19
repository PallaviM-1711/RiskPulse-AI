import sys
from pathlib import Path

# Ensure project root is accessible for simulator and shared modules
_project_root = Path(__file__).resolve().parent.parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from . import models

from .risk_engine.velocity import detect_velocity_anomaly
from .risk_engine.amount import detect_amount_anomaly
from .risk_engine.device_ip import (
    detect_device_abuse,
    detect_ip_abuse
)
from .risk_engine.location import detect_location_anomaly
from .risk_engine.scoring import calculate_risk_score


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="RiskPulse AI",
    description="AI-powered fraud-spike and coordinated-abuse detection platform",
    version="1.0.0"
)


# =========================================================
# CORS
# Allows Next.js frontend to communicate with FastAPI
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "RiskPulse AI is running!",
        "status": "online"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as error:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(error)
        }


# =========================================================
# VELOCITY RISK
# =========================================================

@app.get("/risk/velocity/{merchant_code}")
def check_velocity(
    merchant_code: str,
    db: Session = Depends(get_db)
):

    velocity_result = detect_velocity_anomaly(
        db=db,
        merchant_code=merchant_code
    )

    risk_result = calculate_risk_score(
        velocity_anomaly=velocity_result["is_anomaly"]
    )

    return {
        **velocity_result,
        **risk_result
    }


# =========================================================
# AMOUNT RISK
# =========================================================

@app.get("/risk/amount/{merchant_code}")
def check_amount(
    merchant_code: str,
    amount: float,
    db: Session = Depends(get_db)
):

    amount_result = detect_amount_anomaly(
        db=db,
        merchant_code=merchant_code,
        amount=amount
    )

    return amount_result


# =========================================================
# DEVICE RISK
# =========================================================

@app.get("/risk/device/{device_id}")
def check_device(
    device_id: str,
    db: Session = Depends(get_db)
):

    device_result = detect_device_abuse(
        db=db,
        device_id=device_id
    )

    return device_result


# =========================================================
# IP RISK
# =========================================================

@app.get("/risk/ip/{ip_address}")
def check_ip(
    ip_address: str,
    db: Session = Depends(get_db)
):

    ip_result = detect_ip_abuse(
        db=db,
        ip_address=ip_address
    )

    return ip_result


# =========================================================
# LOCATION RISK
# =========================================================

@app.get("/risk/location/{customer_code}")
def check_location(
    customer_code: str,
    location: str,
    db: Session = Depends(get_db)
):

    location_result = detect_location_anomaly(
        db=db,
        customer_code=customer_code,
        location=location
    )

    return location_result


# =========================================================
# COMPLETE RISK ANALYSIS
# =========================================================

@app.get("/risk/analyze/{merchant_code}")
def analyze_risk(
    merchant_code: str,
    amount: float,
    device_id: str,
    ip_address: str,
    customer_code: str,
    location: str,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # 1. TRANSACTION VELOCITY
    # -----------------------------------------------------

    velocity_result = detect_velocity_anomaly(
        db=db,
        merchant_code=merchant_code
    )


    # -----------------------------------------------------
    # 2. TRANSACTION AMOUNT
    # -----------------------------------------------------

    amount_result = detect_amount_anomaly(
        db=db,
        merchant_code=merchant_code,
        amount=amount
    )


    # -----------------------------------------------------
    # 3. DEVICE ABUSE
    # -----------------------------------------------------

    device_result = detect_device_abuse(
        db=db,
        device_id=device_id
    )


    # -----------------------------------------------------
    # 4. IP ABUSE
    # -----------------------------------------------------

    ip_result = detect_ip_abuse(
        db=db,
        ip_address=ip_address
    )


    # -----------------------------------------------------
    # 5. LOCATION ANOMALY
    # -----------------------------------------------------

    location_result = detect_location_anomaly(
        db=db,
        customer_code=customer_code,
        location=location
    )


    # -----------------------------------------------------
    # 6. COMBINE ALL FIVE RISK SIGNALS
    # -----------------------------------------------------

    risk_result = calculate_risk_score(
        velocity_anomaly=velocity_result["is_anomaly"],
        amount_anomaly=amount_result["is_anomaly"],
        device_anomaly=device_result["is_anomaly"],
        ip_anomaly=ip_result["is_anomaly"],
        location_anomaly=location_result["is_anomaly"]
    )

    # -----------------------------------------------------
    # 7. RETURN COMPLETE ANALYSIS
    # -----------------------------------------------------

    return {
        "merchant_code": merchant_code,
        "transaction_amount": amount,
        "velocity": velocity_result,
        "amount_analysis": amount_result,
        "device_analysis": device_result,
        "ip_analysis": ip_result,
        "location_analysis": location_result,
        "risk": risk_result
    }


# =========================================================
# COMPREHENSIVE REST API FOR RISKPULSE AI PLATFORM
# =========================================================

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy import func, desc, or_
from .models import Merchant, Customer, Transaction, Incident, DefensiveAction, SystemSetting


# ---------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------

class TransactionCreate(BaseModel):
    merchant_code: str
    customer_code: str
    amount: float
    payment_method: str = "UPI"
    device_id: str = "DEV001"
    ip_address: str = "192.168.1.1"
    location: str = "Bengaluru"


class SimulatorRequest(BaseModel):
    scenario_type: str = "FRAUD_SPIKE"  # FRAUD_SPIKE, CARD_TESTING, DEVICE_BURST, NORMAL
    count: int = Field(default=40, ge=1, le=500)
    merchant_code: Optional[str] = None
    intensity: str = "HIGH"  # LOW, MEDIUM, HIGH


class AIChatRequest(BaseModel):
    message: str


class SettingUpdateRequest(BaseModel):
    settings: Dict[str, str]


class ActionApplyRequest(BaseModel):
    action_id: int
    decision: str = "APPROVE"  # APPROVE, DISMISS


# ---------------------------------------------------------
# 1. OVERVIEW STATISTICS
# ---------------------------------------------------------

@app.get("/api/stats/overview")
def get_overview_stats(db: Session = Depends(get_db)):
    total_txns = db.query(Transaction).count()
    
    # 24 hour stats
    now = datetime.utcnow()
    past_24h = now - timedelta(hours=24)
    past_1h = now - timedelta(hours=1)
    
    txns_24h = db.query(Transaction).filter(Transaction.timestamp >= past_24h).count()
    if txns_24h == 0:
        txns_24h = total_txns

    # Average risk score
    avg_score = db.query(func.avg(Transaction.risk_score)).scalar() or 68.0
    avg_score = round(float(avg_score), 1)

    # Fraud count and rate
    high_risk_count = db.query(Transaction).filter(
        or_(Transaction.risk_score >= 60, Transaction.fraud_label == 1)
    ).count()
    fraud_rate = round((high_risk_count / max(total_txns, 1)) * 100, 2)

    # Blocked transactions (risk >= 80)
    blocked_count = db.query(Transaction).filter(Transaction.risk_score >= 80).count()
    blocked_value = db.query(func.sum(Transaction.amount)).filter(Transaction.risk_score >= 80).scalar() or 0.0
    blocked_value = round(float(blocked_value), 2)

    # Active incidents
    active_incidents_count = db.query(Incident).filter(Incident.status == "ACTIVE").count()

    # Timeline chart points (simulated 24-point aggregate risk curve)
    recent_txns = db.query(Transaction).order_by(desc(Transaction.timestamp)).limit(25).all()
    if recent_txns:
        timeline_points = [round(t.risk_score, 1) for t in reversed(recent_txns)]
    else:
        timeline_points = [45, 52, 48, 60, 58, 65, 72, 68, 74, 82, 88, 85, 92, 87]

    # Format blocked value in INR Lakhs
    lakh_val = blocked_value / 100000.0
    blocked_val_str = f"₹{lakh_val:.2f}L" if lakh_val >= 1 else f"₹{blocked_value:,.0f}"

    return {
        "status": "online",
        "total_transactions": total_txns,
        "total_transactions_24h": txns_24h,
        "avg_risk_score": avg_score,
        "fraud_rate": fraud_rate,
        "blocked_count": blocked_count,
        "blocked_value": blocked_value,
        "blocked_value_formatted": blocked_val_str,
        "active_incidents": active_incidents_count,
        "risk_level": "CRITICAL" if avg_score >= 80 else ("HIGH" if avg_score >= 60 else "MEDIUM"),
        "timeline": timeline_points,
        "last_updated": now.strftime("%H:%M:%S IST"),
    }


# ---------------------------------------------------------
# 2. TRANSACTIONS EXPLORER
# ---------------------------------------------------------

@app.get("/api/transactions")
def get_transactions(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    scenario_type: Optional[str] = None,
    payment_method: Optional[str] = None,
    merchant_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        page = int(page)
    except Exception:
        page = 1
    try:
        limit = int(limit)
    except Exception:
        limit = 20
    if page < 1:
        page = 1
    if limit < 1:
        limit = 20
    if limit > 100:
        limit = 100
    query = db.query(Transaction)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.transaction_code.ilike(search_term),
                Transaction.customer_code.ilike(search_term),
                Transaction.merchant_code.ilike(search_term),
                Transaction.device_id.ilike(search_term),
                Transaction.ip_address.ilike(search_term),
                Transaction.location.ilike(search_term),
            )
        )

    if risk_level and risk_level.upper() != "ALL":
        query = query.filter(Transaction.risk_level == risk_level.upper())

    if scenario_type and scenario_type.upper() != "ALL":
        query = query.filter(Transaction.scenario_type == scenario_type.upper())

    if payment_method and payment_method.upper() != "ALL":
        query = query.filter(Transaction.payment_method == payment_method.upper())

    if merchant_code and merchant_code.upper() != "ALL":
        query = query.filter(Transaction.merchant_code == merchant_code.upper())

    total_count = query.count()
    total_pages = (total_count + limit - 1) // limit

    transactions = (
        query.order_by(desc(Transaction.timestamp))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # KPIs for header
    critical_count = db.query(Transaction).filter(Transaction.risk_level == "CRITICAL").count()
    high_count = db.query(Transaction).filter(Transaction.risk_level == "HIGH").count()
    total_volume = db.query(func.sum(Transaction.amount)).scalar() or 0.0

    items = []
    for t in transactions:
        items.append({
            "id": t.id,
            "transaction_code": t.transaction_code,
            "merchant_code": t.merchant_code,
            "customer_code": t.customer_code,
            "amount": t.amount,
            "payment_method": t.payment_method,
            "device_id": t.device_id,
            "ip_address": t.ip_address,
            "location": t.location,
            "status": t.status,
            "timestamp": t.timestamp.isoformat() if t.timestamp else None,
            "risk_score": t.risk_score,
            "risk_level": t.risk_level,
            "fraud_label": t.fraud_label,
            "scenario_type": t.scenario_type,
            "is_simulated": t.is_simulated,
        })

    return {
        "items": items,
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": max(total_pages, 1),
        "kpis": {
            "total_transactions": db.query(Transaction).count(),
            "critical_risk_count": critical_count,
            "high_risk_count": high_count,
            "total_volume": round(float(total_volume), 2),
        }
    }


# ---------------------------------------------------------
# 3. SINGLE TRANSACTION DETAIL & RISK BREAKDOWN
# ---------------------------------------------------------

@app.get("/api/transactions/{code_or_id}")
def get_transaction_detail(code_or_id: str, db: Session = Depends(get_db)):
    if code_or_id.isdigit():
        txn = db.query(Transaction).filter(Transaction.id == int(code_or_id)).first()
    else:
        txn = db.query(Transaction).filter(Transaction.transaction_code == code_or_id).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Run complete 5-signal risk breakdown
    velocity_res = detect_velocity_anomaly(db=db, merchant_code=txn.merchant_code)
    amount_res = detect_amount_anomaly(db=db, merchant_code=txn.merchant_code, amount=txn.amount)
    device_res = detect_device_abuse(db=db, device_id=txn.device_id)
    ip_res = detect_ip_abuse(db=db, ip_address=txn.ip_address)
    location_res = detect_location_anomaly(db=db, customer_code=txn.customer_code, location=txn.location or "Bengaluru")

    risk_eval = calculate_risk_score(
        velocity_anomaly=velocity_res["is_anomaly"],
        amount_anomaly=amount_res["is_anomaly"],
        device_anomaly=device_res["is_anomaly"],
        ip_anomaly=ip_res["is_anomaly"],
        location_anomaly=location_res["is_anomaly"]
    )

    return {
        "transaction": {
            "id": txn.id,
            "transaction_code": txn.transaction_code,
            "merchant_code": txn.merchant_code,
            "customer_code": txn.customer_code,
            "amount": txn.amount,
            "payment_method": txn.payment_method,
            "device_id": txn.device_id,
            "ip_address": txn.ip_address,
            "location": txn.location,
            "status": txn.status,
            "timestamp": txn.timestamp.isoformat() if txn.timestamp else None,
            "risk_score": txn.risk_score,
            "risk_level": txn.risk_level,
            "scenario_type": txn.scenario_type,
        },
        "breakdown": {
            "velocity": velocity_res,
            "amount": amount_res,
            "device": device_res,
            "ip": ip_res,
            "location": location_res,
            "risk": risk_eval,
        }
    }


# ---------------------------------------------------------
# 4. INGEST LIVE TRANSACTION
# ---------------------------------------------------------

@app.post("/api/transactions")
def ingest_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    velocity_res = detect_velocity_anomaly(db=db, merchant_code=payload.merchant_code)
    amount_res = detect_amount_anomaly(db=db, merchant_code=payload.merchant_code, amount=payload.amount)
    device_res = detect_device_abuse(db=db, device_id=payload.device_id)
    ip_res = detect_ip_abuse(db=db, ip_address=payload.ip_address)
    location_res = detect_location_anomaly(db=db, customer_code=payload.customer_code, location=payload.location)

    risk_eval = calculate_risk_score(
        velocity_anomaly=velocity_res["is_anomaly"],
        amount_anomaly=amount_res["is_anomaly"],
        device_anomaly=device_res["is_anomaly"],
        ip_anomaly=ip_res["is_anomaly"],
        location_anomaly=location_res["is_anomaly"]
    )

    new_txn = Transaction(
        transaction_code=f"TX{uuid4().hex[:8].upper()}",
        merchant_code=payload.merchant_code,
        customer_code=payload.customer_code,
        amount=payload.amount,
        payment_method=payload.payment_method,
        device_id=payload.device_id,
        ip_address=payload.ip_address,
        location=payload.location,
        status="FAILED" if risk_eval["risk_score"] >= 85 else "SUCCESS",
        timestamp=datetime.utcnow(),
        risk_score=float(risk_eval["risk_score"]),
        risk_level=risk_eval["risk_level"],
        fraud_label=1 if risk_eval["risk_score"] >= 60 else 0,
        scenario_type="LIVE_INGEST",
        is_simulated=False,
    )

    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)

    return {
        "status": "ingested",
        "transaction_code": new_txn.transaction_code,
        "risk_score": new_txn.risk_score,
        "risk_level": new_txn.risk_level,
        "decision": "BLOCK" if new_txn.risk_score >= 80 else ("REVIEW" if new_txn.risk_score >= 50 else "ALLOW"),
        "reasons": risk_eval["reasons"],
    }


# ---------------------------------------------------------
# 5. MERCHANTS & BASELINES
# ---------------------------------------------------------

@app.get("/api/merchants")
def get_merchants(db: Session = Depends(get_db)):
    merchants = db.query(Merchant).all()
    res = []
    for m in merchants:
        txn_count = db.query(Transaction).filter(Transaction.merchant_code == m.merchant_code).count()
        avg_amt = db.query(func.avg(Transaction.amount)).filter(Transaction.merchant_code == m.merchant_code).scalar() or 0.0
        high_risk = db.query(Transaction).filter(
            Transaction.merchant_code == m.merchant_code,
            Transaction.risk_score >= 60
        ).count()
        
        status = "At Risk" if high_risk > 5 else "Normal"
        
        res.append({
            "merchant_code": m.merchant_code,
            "name": m.name,
            "category": m.category,
            "location": m.location,
            "baseline_rate": m.baseline_transaction_rate or 420.0,
            "total_transactions": txn_count,
            "average_amount": round(float(avg_amt), 2),
            "status": status,
        })
    return res


@app.get("/api/merchants/{merchant_code}/baseline")
def get_merchant_baseline(merchant_code: str, db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.merchant_code == merchant_code).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    total_txns = db.query(Transaction).filter(Transaction.merchant_code == merchant_code).count()
    avg_amt = db.query(func.avg(Transaction.amount)).filter(Transaction.merchant_code == merchant_code).scalar() or 21240.0
    
    # Calculate fraud rate
    fraud_txns = db.query(Transaction).filter(
        Transaction.merchant_code == merchant_code,
        Transaction.risk_score >= 60
    ).count()
    fraud_rate = round((fraud_txns / max(total_txns, 1)) * 100, 1)

    # Success rate
    success_txns = db.query(Transaction).filter(
        Transaction.merchant_code == merchant_code,
        Transaction.status == "SUCCESS"
    ).count()
    success_rate = round((success_txns / max(total_txns, 1)) * 100, 1)

    return {
        "merchant_code": merchant.merchant_code,
        "merchant_name": merchant.name,
        "category": merchant.category,
        "location": merchant.location,
        "baseline_confidence": 94,
        "status": "At Risk" if fraud_rate > 5 else "Normal",
        "metrics": [
            {
                "name": "Transactions / min",
                "baseline": "420",
                "current": f"{max(total_txns * 4, 420)}",
                "deviation": "+182%",
                "status": "HIGH" if total_txns > 20 else "NORMAL",
            },
            {
                "name": "Fraud Rate",
                "baseline": "2.1%",
                "current": f"{fraud_rate}%",
                "deviation": f"+{int(fraud_rate * 30)}%",
                "status": "HIGH" if fraud_rate > 5 else "NORMAL",
            },
            {
                "name": "Avg. Amount",
                "baseline": "₹21,240",
                "current": f"₹{avg_amt:,.0f}",
                "deviation": "+36%",
                "status": "MEDIUM",
            },
            {
                "name": "Success Rate",
                "baseline": "96.8%",
                "current": f"{success_rate}%",
                "deviation": "-8%",
                "status": "MEDIUM" if success_rate < 95 else "NORMAL",
            },
            {
                "name": "Failed Rate",
                "baseline": "3.2%",
                "current": f"{round(100 - success_rate, 1)}%",
                "deviation": "+263%",
                "status": "HIGH" if success_rate < 90 else "NORMAL",
            },
        ]
    }


# ---------------------------------------------------------
# 6. INCIDENTS TIMELINE & MANAGEMENT
# ---------------------------------------------------------

@app.get("/api/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(desc(Incident.detected_at)).all()
    
    # If no incidents recorded yet, populate initial active ones from fraud transactions
    if not incidents:
        recent_spike = db.query(Transaction).filter(Transaction.scenario_type == "FRAUD_SPIKE").first()
        if recent_spike:
            sample_inc = Incident(
                incident_code="INC-7A41F2",
                title=f"Rapid Fraud Spike on {recent_spike.merchant_code}",
                incident_type="FRAUD_SPIKE",
                severity="HIGH",
                merchant_code=recent_spike.merchant_code,
                affected_transactions_count=40,
                exposure_amount=128400.0,
                status="ACTIVE",
                detected_at=datetime.utcnow() - timedelta(minutes=4),
            )
            db.add(sample_inc)
            db.commit()
            incidents = [sample_inc]

    res = []
    for inc in incidents:
        res.append({
            "id": inc.id,
            "incident_code": inc.incident_code,
            "title": inc.title,
            "incident_type": inc.incident_type,
            "severity": inc.severity,
            "merchant_code": inc.merchant_code,
            "affected_transactions_count": inc.affected_transactions_count,
            "exposure_amount": inc.exposure_amount,
            "status": inc.status,
            "detected_at": inc.detected_at.strftime("%H:%M:%S IST") if inc.detected_at else "Just now",
        })
    return res


@app.post("/api/incidents/{incident_id}/status")
def update_incident_status(incident_id: int, new_status: str = "RESOLVED", db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = new_status
    if new_status == "RESOLVED":
        inc.resolved_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "incident_id": incident_id, "new_status": new_status}


# ---------------------------------------------------------
# 7. ATTACK SIMULATOR ENDPOINT
# ---------------------------------------------------------

@app.post("/api/simulator/run")
def run_simulation(req: SimulatorRequest, db: Session = Depends(get_db)):
    from simulator.transaction_simulator import simulate_scenario
    result = simulate_scenario(
        scenario_type=req.scenario_type,
        count=req.count,
        merchant_code=req.merchant_code,
        intensity=req.intensity,
    )
    return result


# ---------------------------------------------------------
# 8. FRAUD NETWORK GRAPH
# ---------------------------------------------------------

@app.get("/api/network/graph")
def get_network_graph(db: Session = Depends(get_db)):
    # Extract high risk transactions to generate authentic connected graph
    txns = db.query(Transaction).filter(Transaction.risk_score >= 50).limit(30).all()
    if not txns:
        txns = db.query(Transaction).limit(25).all()

    nodes = []
    links = []
    node_ids = set()

    def add_node(n_id, label, n_type, risk="LOW"):
        if n_id not in node_ids:
            node_ids.add(n_id)
            nodes.append({
                "id": n_id,
                "label": label,
                "type": n_type,  # merchant, customer, device, ip
                "risk": risk
            })

    for t in txns:
        m_id = f"M_{t.merchant_code}"
        c_id = f"C_{t.customer_code}"
        d_id = f"D_{t.device_id}"
        ip_id = f"IP_{t.ip_address.replace('.', '_')}"

        risk_val = "HIGH" if t.risk_score >= 75 else ("MEDIUM" if t.risk_score >= 50 else "LOW")

        add_node(m_id, t.merchant_code, "merchant", "HIGH" if t.risk_score >= 80 else "LOW")
        add_node(c_id, t.customer_code, "customer", risk_val)
        add_node(d_id, t.device_id, "device", risk_val)
        add_node(ip_id, t.ip_address, "ip", "MEDIUM")

        links.append({"source": c_id, "target": d_id, "risk": risk_val})
        links.append({"source": d_id, "target": ip_id, "risk": "MEDIUM"})
        links.append({"source": c_id, "target": m_id, "risk": risk_val})

    return {
        "nodes": nodes,
        "links": links[:40],
        "cluster_info": {
            "cluster_id": "#17",
            "risk_level": "HIGH RISK",
            "total_entities": len(nodes),
            "device_count": len([n for n in nodes if n["type"] == "device"]),
            "ip_count": len([n for n in nodes if n["type"] == "ip"]),
            "merchant_count": len([n for n in nodes if n["type"] == "merchant"]),
        }
    }


# ---------------------------------------------------------
# 9. AI RISK ANALYST INVESTIGATION COPILOT
# ---------------------------------------------------------

@app.post("/api/ai-analyst/chat")
def ai_analyst_chat(req: AIChatRequest, db: Session = Depends(get_db)):
    q = req.message.lower().strip()
    
    # Gather live telemetry
    total_txns = db.query(Transaction).count()
    active_incidents = db.query(Incident).filter(Incident.status == "ACTIVE").all()
    high_risk_txns = db.query(Transaction).filter(Transaction.risk_score >= 75).order_by(desc(Transaction.timestamp)).limit(5).all()
    
    # Calculate telemetry findings
    top_devices = (
        db.query(Transaction.device_id, func.count(func.distinct(Transaction.customer_code)).label("c_count"))
        .group_by(Transaction.device_id)
        .order_by(desc("c_count"))
        .limit(3)
        .all()
    )

    # Analyze intent
    evidence = []
    if "why" in q or "flag" in q or "trigger" in q or "reason" in q:
        reply = (
            "Based on RiskPulse AI's 5-signal risk telemetry, transactions are flagged because they exceed "
            "the merchant's learned baseline in multiple dimensions simultaneously: "
            "1) Transaction velocity is 5.2x higher than normal within a 60-second window, "
            "2) The average transaction amount deviates significantly, and "
            "3) Multiple customer accounts are originating from a shared device footprint."
        )
        evidence = ["Velocity Anomaly (5.2x)", "Device Burst Cluster", "Amount Deviation", "Baseline Breach"]

    elif "merchant" in q or "attack" in q or "who" in q:
        if active_incidents:
            m_codes = ", ".join(set(inc.merchant_code for inc in active_incidents))
            reply = (
                f"Currently, active attack indicators are concentrated on Merchant(s): {m_codes}. "
                f"We observed high-frequency transaction spikes and card authorization testing. "
                "Immediate defensive rate limiting and step-up verification is recommended."
            )
        else:
            reply = (
                "All merchants are currently operating within normal behavioural parameters. "
                "Baseline transaction rates and fraud percentages remain below threshold."
            )
        evidence = ["Merchant Baseline Check", "Active Incident Telemetry", "Velocity Rate Monitor"]

    elif "device" in q or "ip" in q or "cluster" in q:
        dev_list = ", ".join([f"{d[0]} ({d[1]} accounts)" for d in top_devices])
        reply = (
            f"Device analysis reveals anomalous clustering. The top concentrated devices are {dev_list}. "
            "Such device sharing across distinct customer accounts is a primary signature of coordinated automated fraud."
        )
        evidence = ["Device Footprint Cluster", "Cross-Account Reuse", "IP Geolocation Drift"]

    elif "action" in q or "recommend" in q or "defend" in q or "prevent" in q:
        reply = (
            "RiskPulse AI recommends the following defensive response: "
            "1. Enforce 3DS Step-Up verification on all transactions exceeding ₹2,000 for high-risk merchants. "
            "2. Temporarily throttle velocity limits for suspicious device clusters. "
            "3. Hold transactions with risk score >= 80 for asynchronous manual analyst review."
        )
        evidence = ["3DS Step-Up Auth", "Velocity Throttling", "Automated Device Isolation"]

    else:
        reply = (
            f"System status: {total_txns} total transactions analyzed with active AI risk scoring. "
            f"There are {len(active_incidents)} active incidents in the defense timeline. "
            "All incoming transactions are evaluated across Velocity, Amount, Device Abuse, IP Abuse, and Location consistency."
        )
        evidence = ["Continuous Real-time Evaluation", "Adaptive Baseline Learning", "Explainable AI"]

    return {
        "reply": reply,
        "evidence": evidence,
        "timestamp": datetime.utcnow().strftime("%H:%M:%S IST")
    }


# ---------------------------------------------------------
# 10. DEFENSIVE ACTIONS
# ---------------------------------------------------------

@app.get("/api/actions")
def get_actions(db: Session = Depends(get_db)):
    actions = db.query(DefensiveAction).order_by(desc(DefensiveAction.created_at)).all()
    if not actions:
        # Seed default recommended actions
        default_actions = [
            DefensiveAction(
                action_type="STEP_UP_AUTH",
                target_type="MERCHANT",
                target_value="M004",
                reason="High transaction velocity spike exceeding baseline by 182%",
                severity="HIGH",
                status="PENDING",
            ),
            DefensiveAction(
                action_type="BLOCK_DEVICE",
                target_type="DEVICE",
                target_value="DEV003",
                reason="Shared device detected across 8 unique customer accounts in 5 minutes",
                severity="CRITICAL",
                status="PENDING",
            ),
            DefensiveAction(
                action_type="RATE_LIMIT",
                target_type="IP",
                target_value="192.168.1.14",
                reason="Rapid card authorization burst from single subnet",
                severity="MEDIUM",
                status="PENDING",
            ),
        ]
        db.add_all(default_actions)
        db.commit()
        actions = default_actions

    return [
        {
            "id": a.id,
            "action_type": a.action_type,
            "target_type": a.target_type,
            "target_value": a.target_value,
            "reason": a.reason,
            "severity": a.severity,
            "status": a.status,
            "created_at": a.created_at.strftime("%H:%M:%S IST") if a.created_at else "Just now",
        }
        for a in actions
    ]


@app.post("/api/actions/apply")
def apply_action(req: ActionApplyRequest, db: Session = Depends(get_db)):
    action = db.query(DefensiveAction).filter(DefensiveAction.id == req.action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    action.status = "APPLIED" if req.decision == "APPROVE" else "DISMISSED"
    db.commit()
    return {"status": "success", "action_id": req.action_id, "action_status": action.status}


# ---------------------------------------------------------
# 11. SYSTEM SETTINGS
# ---------------------------------------------------------

DEFAULT_SETTINGS = {
    "velocity_threshold": "20",
    "velocity_window_minutes": "5",
    "amount_multiplier": "3.0",
    "device_threshold": "3",
    "ip_threshold": "3",
    "location_threshold": "3",
    "critical_risk_cutoff": "80",
    "high_risk_cutoff": "60",
    "auto_block_critical": "true",
    "step_up_verification": "true",
}


@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings_records = db.query(SystemSetting).all()
    current_settings = dict(DEFAULT_SETTINGS)
    for s in settings_records:
        current_settings[s.key] = s.value
    return current_settings


@app.post("/api/settings")
def update_settings(req: SettingUpdateRequest, db: Session = Depends(get_db)):
    for k, v in req.settings.items():
        record = db.query(SystemSetting).filter(SystemSetting.key == k).first()
        if record:
            record.value = str(v)
        else:
            db.add(SystemSetting(key=k, value=str(v), description="User configured setting"))
    db.commit()
    return {"status": "success", "updated_keys": list(req.settings.keys())}


# ---------------------------------------------------------
# 12. REPORTS
# ---------------------------------------------------------

@app.get("/api/reports/generate")
def generate_report(report_type: str = "FRAUD_SUMMARY", db: Session = Depends(get_db)):
    total_txns = db.query(Transaction).count()
    high_risk = db.query(Transaction).filter(Transaction.risk_score >= 60).count()
    blocked_val = db.query(func.sum(Transaction.amount)).filter(Transaction.risk_score >= 80).scalar() or 0.0
    incidents_count = db.query(Incident).count()

    recent_flagged = db.query(Transaction).filter(Transaction.risk_score >= 60).order_by(desc(Transaction.timestamp)).limit(10).all()

    return {
        "report_id": f"REP-{uuid4().hex[:8].upper()}",
        "report_type": report_type,
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_transactions_audited": total_txns,
            "flagged_transactions": high_risk,
            "blocked_value_inr": round(float(blocked_val), 2),
            "incidents_recorded": incidents_count,
            "prevention_rate": f"{round((high_risk / max(total_txns, 1)) * 100, 2)}%",
        },
        "flagged_sample": [
            {
                "code": t.transaction_code,
                "merchant": t.merchant_code,
                "amount": t.amount,
                "risk_score": t.risk_score,
                "risk_level": t.risk_level,
                "scenario": t.scenario_type,
            }
            for t in recent_flagged
        ]
    }