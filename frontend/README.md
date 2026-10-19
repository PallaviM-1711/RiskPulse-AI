# RiskPulse AI 🛡️

### AI-Powered Fraud Spike Detection and Risk Analysis Platform

RiskPulse AI is a fraud detection and risk analysis platform designed to identify suspicious transaction patterns, detect potential fraud spikes, and help investigate coordinated abuse. It combines rule-based risk detection, anomaly analysis, risk scoring, and an interactive web dashboard to support faster, more informed fraud-risk decisions.

## 🎯 Problem Statement

Traditional fraud detection systems may struggle to identify sudden increases in suspicious transactions, unusual merchant activity, device abuse, IP-related patterns, and abnormal customer locations. Delayed detection can increase financial losses and make investigations more difficult.

## 💡 Our Solution

RiskPulse AI analyzes transaction-related signals to identify potentially suspicious activity and assign a risk score and severity level. Its goal is to help users investigate emerging threats and make informed decisions using explainable risk indicators.

The platform follows this workflow:

**Detect → Predict → Investigate → Explain → Decide → Defend → Measure**

## ✨ Key Features

- **Velocity Anomaly Detection:** Identifies unusually high transaction activity within a defined time window.
- **Amount Anomaly Detection:** Evaluates unusual transaction amounts.
- **Device Abuse Detection:** Analyzes device-related risk signals.
- **IP Abuse Detection:** Checks IP-related risk indicators.
- **Location Anomaly Detection:** Evaluates suspicious location-related patterns.
- **Risk Scoring:** Combines detection signals into an overall risk score.
- **Risk Classification:** Assigns LOW, MEDIUM, HIGH, or CRITICAL severity levels.
- **Attack Simulation:** Generates simulated transaction activity to test fraud-detection behavior.
- **Interactive Dashboard:** Provides separate screens for risk analysis, early warnings, merchant baselines, model health, incident management, and reporting.

*Feature availability and dashboard data depend on the current implementation and integration status.*

## 🏗️ System Architecture

```text
                    RiskPulse AI
                         |
          +--------------+--------------+
          |                             |
     Frontend                       Backend
     Next.js                         FastAPI
          |                             |
          |                     Risk Detection Modules
          |                             |
          |                   +---------+---------+
          |                   |         |         |
          |                Velocity  Amount    Device
          |                   |         |         |
          |                 IP Abuse  Location   |
          |                   +---------+---------+
          |                             |
          |                       Risk Scoring
          |                             |
          +-----------------------------+
                         |
                   Data / Storage
                         |
                  Transaction Simulator
```

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| UI Styling | CSS, Tailwind CSS utilities where used |
| Backend API | Python, FastAPI |
| Database Access | SQLAlchemy |
| Database Migrations | Alembic |
| Risk Analysis | Python-based detection and scoring modules |
| Testing | Python test suite |
| Version Control | Git and GitHub |

## 📂 Project Structure

```text
RiskPulse-AI/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── risk/
│   ├── alembic/
│   ├── alembic.ini
│   └── test_api_endpoints.py
├── frontend/
│   ├── app/
│   └── components/
├── data/
├── docs/
├── ml/
├── simulator/
├── .gitignore
└── README.md
```

## 🔌 Backend API Endpoints

The FastAPI backend provides the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| GET | `/risk/velocity/{merchant_code}` | Analyze transaction velocity |
| GET | `/risk/amount/{merchant_code}` | Analyze amount anomalies |
| GET | `/risk/device/{device_id}` | Check device-related risk |
| GET | `/risk/ip/{ip_address}` | Check IP-related risk |
| GET | `/risk/location/{customer_code}` | Analyze location-related risk |
| GET | `/risk/analyze/{merchant_code}` | Generate an overall risk analysis |

*Endpoint behavior depends on the current backend implementation and database configuration.*

## 📊 Risk Scoring

RiskPulse AI combines multiple detection signals into a score out of 100.

| Risk Signal | Weight |
|---|---:|
| Transaction velocity anomaly | 40 |
| Amount anomaly | 20 |
| Device abuse | 15 |
| IP abuse | 15 |
| Location anomaly | 10 |
| **Maximum score** | **100** |

Risk severity is classified as follows:

- **LOW:** 0–29
- **MEDIUM:** 30–59
- **HIGH:** 60–79
- **CRITICAL:** 80–100

These weights and thresholds reflect the current scoring implementation and can be tuned as the system evolves.

## 🚀 Getting Started

### Prerequisites

Install the following tools:

- Python 3.10 or a compatible version for the backend dependencies
- Node.js 18 or later for the frontend
- Git
- A configured database supported by the project's backend settings

### 1. Clone the Repository

```bash
git clone https://github.com/PallaviM-1711/RiskPulse-AI.git
cd RiskPulse-AI
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install the project's dependencies using its dependency file. If `requirements.txt` is present:

```powershell
pip install -r requirements.txt
```

Configure the required environment variables and database connection locally. Do not commit `.env` files or credentials.

Start the API using the appropriate application entry point and configuration. For a standard FastAPI application exposed as `app.main:app`, the command is:

```bash
uvicorn app.main:app --reload
```

The API will normally be available at `http://127.0.0.1:8000`, with interactive documentation at `http://127.0.0.1:8000/docs`.

### 3. Set Up the Frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 4. Run the Tests

Follow the test configuration in the backend project. If the project uses pytest, run:

```bash
python -m pytest
```

Ensure the required database and environment variables are configured before running tests.

## 🧪 Attack Simulation

The `simulator/` directory contains transaction simulation resources intended to help test how the platform responds to normal activity and simulated fraud spikes.

Use simulated or authorized test data only. Validate detection results before using the platform for real financial decisions.

## 🔐 Security Considerations

- Never commit API keys, database passwords, private keys, or `.env` files.
- Use synthetic or anonymized data during development and testing.
- Restrict access to sensitive transaction and customer information.
- Validate detection results before taking defensive action.
- Use authenticated and authorized access for production deployments.

## 🛣️ Future Enhancements

- Connect all dashboard pages to live backend APIs.
- Improve anomaly detection using validated historical transaction data.
- Add real-time alerting and incident notifications.
- Expand merchant behavior baselines and fraud-network analysis.
- Improve model evaluation, drift monitoring, and explainability.
- Add role-based access control, audit logging, and production deployment support.

## 👩‍💻 Project Information

**Project:** RiskPulse AI  
**Category:** AI-Assisted Fraud Detection and Risk Analysis  
**Repository:** [PallaviM-1711/RiskPulse-AI](https://github.com/PallaviM-1711/RiskPulse-AI)

---

*RiskPulse AI is a development project intended to support fraud-risk investigation. Detection results are indicators for further review and should not be treated as proof of fraud.*
