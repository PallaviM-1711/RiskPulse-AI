# RiskPulse AI — Testing Guide

## 1. Purpose

This guide describes how to test the RiskPulse AI backend and validate fraud-risk analysis during development.

## 2. Prerequisites

- Python environment and backend dependencies installed.
- Required database configured.
- Environment variables configured locally.
- Project dependencies available.

## 3. Start the Backend

From the `backend` directory, activate the project's virtual environment and start the API:

```powershell
uvicorn app.main:app --reload
```

Confirm that the server starts without errors.

## 4. Check API Health

Open the following endpoint in a browser:

`http://127.0.0.1:8000/health`

Check that the response indicates the API is healthy, according to the current implementation.

## 5. Explore the API

Open the interactive API documentation:

`http://127.0.0.1:8000/docs`

Use valid identifiers and test data to explore the available risk-analysis endpoints.

## 6. Test Risk Detection

Test the individual detection modules for:

- Transaction velocity anomalies.
- Unusual transaction amounts.
- Device-related risk indicators.
- IP-related risk indicators.
- Location-related risk indicators.

Compare the results with the expected behavior defined by the current implementation.

## 7. Test the Transaction Simulator

Review `simulator/transaction_simulator.py` and its configuration before running it.

Use synthetic transactions to investigate how transaction spikes affect the risk-analysis results. Confirm that the backend and database are configured if the simulator depends on them.

## 8. Run Automated Tests

From the `backend` directory, if pytest is installed and configured:

```powershell
python -m pytest
```

Review any failures and resolve them before considering the affected functionality validated.

## 9. Testing Safety

- Use synthetic or authorized data.
- Never commit credentials or `.env` files.
- Do not treat a high risk score as definitive proof of fraud.
- Verify results before using them to make operational decisions.
