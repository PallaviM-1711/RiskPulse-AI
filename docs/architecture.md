# RiskPulse AI — System Architecture

## 1. Overview

RiskPulse AI is an AI-assisted fraud detection and risk analysis platform designed to identify suspicious transaction patterns and help investigate potential fraud.

The project is organized into a frontend, backend, risk detection modules, data resources, documentation, and a transaction simulator.

## 2. Architecture Components

### Frontend
**Technology:** Next.js, React, TypeScript

The frontend provides a dashboard and dedicated pages for risk analysis, early warnings, merchant baselines, model health, fraud networks, incident management, transaction simulation, and reporting.

### Backend
**Technology:** Python, FastAPI

The backend handles API requests and coordinates transaction risk analysis. Its application and supporting modules are located in the `backend/` directory.

### Risk Detection Engine

The `backend/app/risk_engine/` directory contains modules for:

- **Velocity detection:** Evaluates transaction frequency.
- **Amount detection:** Evaluates transaction amounts.
- **Device detection:** Analyzes device-related risk.
- **IP detection:** Analyzes IP-related risk.
- **Location detection:** Evaluates location-related risk.
- **Risk scoring:** Combines risk indicators into a score.

### Database Layer

The backend contains database configuration, models, and Alembic migration files for managing database schema changes.

### Transaction Simulator

The `simulator/transaction_simulator.py` script provides a way to generate simulated transaction activity for testing and experimentation.

### Supporting Resources

- `data/` — project data resources.
- `docs/` — project documentation.
- `ml/` — machine-learning-related project resources.

## 3. Request Flow

1. A user interacts with a page in the Next.js frontend.
2. The frontend can send a request to the backend API.
3. The backend processes the request and uses the relevant risk detection modules.
4. Risk indicators are combined by the risk-scoring module where applicable.
5. The resulting analysis can be presented to the user through the frontend.

**Note:** The complete frontend-to-backend integration and live data flow should be verified against the current implementation.

## 4. Security Considerations

- Keep environment variables and credentials out of version control.
- Use synthetic or authorized transaction data for testing.
- Validate risk results before taking action.
- Protect sensitive customer and transaction information.

## 5. Future Improvements

- Complete and validate frontend-to-backend integration.
- Add real-time risk alerts.
- Improve detection using validated historical data.
- Expand automated testing and model evaluation.
- Add production-grade authentication, authorization, and audit logging.
