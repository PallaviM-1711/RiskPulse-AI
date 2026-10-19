# RiskPulse AI — Transaction Simulator

## Overview

The RiskPulse AI transaction simulator is a development tool for generating transaction activity and testing the platform's fraud-detection behavior.

It helps developers experiment with normal transaction patterns and simulated transaction spikes without relying exclusively on real financial data.

## Script

- `transaction_simulator.py` — the transaction simulation script.

## Purpose

The simulator can support testing of:

- Transaction frequency and velocity anomalies.
- Unusual transaction activity.
- Fraud-spike detection workflows.
- Backend risk-analysis behavior.

The exact scenarios supported depend on the current implementation of the script.

## Running the Simulator

1. Open a terminal at the RiskPulse AI project root.
2. Activate the Python environment configured for the backend, if the simulator requires its dependencies.
3. Review `transaction_simulator.py` to identify its configuration and execution requirements.
4. Run the script using the appropriate Python command.

For example, if the script supports direct execution:

```bash
python simulator/transaction_simulator.py
```

## Testing Recommendations

- Start with synthetic transaction data.
- Verify that the backend and database are configured as required.
- Compare risk-analysis results before and after simulated transaction spikes.
- Check logs and test results for unexpected behavior.
- Avoid using unauthorized or sensitive financial data.

## Future Improvements

- Add configurable transaction volumes and fraud scenarios.
- Support reproducible test runs using configurable random seeds.
- Produce summary statistics for simulated transactions.
- Automate integration tests between the simulator and risk-analysis API.
