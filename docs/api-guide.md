# RiskPulse AI — Backend API Guide

## Overview

RiskPulse AI uses a FastAPI backend to expose endpoints for transaction risk analysis and detection.

## Available Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| GET | `/risk/velocity/{merchant_code}` | Check transaction velocity anomalies |
| GET | `/risk/amount/{merchant_code}` | Check amount anomalies |
| GET | `/risk/device/{device_id}` | Analyze device-related risk |
| GET | `/risk/ip/{ip_address}` | Analyze IP-related risk |
| GET | `/risk/location/{customer_code}` | Analyze location-related risk |
| GET | `/risk/analyze/{merchant_code}` | Run overall risk analysis |

## Running the API

From the `backend` directory, activate the configured Python virtual environment and install the project's dependencies.

If the application is exposed as `app.main:app`, start the development server with:

```bash
uvicorn app.main:app --reload
```

The default local address is `http://127.0.0.1:8000`.

## Interactive API Documentation

When the server is running, open:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Testing

Check the health endpoint first, then test individual risk endpoints using valid identifiers and a configured database.

Use synthetic or authorized test data. Endpoint behavior depends on the current implementation and database configuration.

## Security

Never publish API credentials, database passwords, private keys, or sensitive customer information in documentation or source control.
