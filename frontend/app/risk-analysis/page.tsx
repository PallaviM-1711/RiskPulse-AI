"use client";

import { useState } from "react";

import {
  Shell,
  SectionHeader,
  Card,
  RiskRing,
  Progress,
  Badge,
} from "@/components/riskpulse";

export default function RiskAnalysis() {
  const [merchant, setMerchant] = useState("M004");
  const [amount, setAmount] = useState("20000");

  const [result, setResult] = useState<any>(null);

  async function analyze() {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/risk/analyze/${merchant}?amount=${amount}&device_id=DEV001&ip_address=192.168.1.1&customer_code=C001&location=Bengaluru`
      );

      const data = await response.json();

      setResult(data);
    } catch {
      setResult(null);
      alert("Backend is not running.");
    }
  }

  const riskScore = result?.risk?.risk_score ?? 87;

  return (
    <Shell active="Risk Analysis">

      <SectionHeader
        number="07"
        title="Risk Analysis – Deep Dive"
      />

      <div className="page-title">
        Risk Analysis
      </div>

      <div className="page-subtitle">
        Deep dive into transaction risk factors
      </div>

      <Card>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 15,
          }}
        >

          <input
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="Merchant"
            style={{
              background: "#091323",
              border: "1px solid #243651",
              color: "white",
              padding: "8px",
              borderRadius: 5,
            }}
          />

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            style={{
              background: "#091323",
              border: "1px solid #243651",
              color: "white",
              padding: "8px",
              borderRadius: 5,
            }}
          />

          <button
            className="primary-button"
            onClick={analyze}
          >
            Analyze Transaction
          </button>

        </div>

      </Card>

      <div className="dashboard-grid">

        <div className="col-5">
          <Card>

            <div className="card-title">
              Overall Risk Score
            </div>

            <RiskRing
              score={riskScore}
              label={
                result?.risk?.risk_level ?? "HIGH RISK"
              }
            />

            {result && (
              <div style={{ marginTop: 12 }}>
                <Badge type="red">
                  {result.risk.risk_level}
                </Badge>
              </div>
            )}

          </Card>
        </div>

        <div className="col-7">
          <Card>

            <div className="card-title">
              Risk Factor Breakdown
            </div>

            {[
              ["Transaction Velocity", 92],
              ["Device Concentration", 81],
              ["IP Concentration", 88],
              ["Transaction Amount", 82],
              ["ML Fraud Probability", 92],
              ["Graph Risk", 76],
            ].map(([name, value]) => (

              <div
                key={name}
                style={{ marginBottom: 13 }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 5,
                  }}
                >
                  <span>{name}</span>
                  <span>{value}</span>
                </div>

                <Progress
                  value={Number(value)}
                  danger
                />

              </div>

            ))}

          </Card>
        </div>

        <div className="col-12">

          <Card>

            <div className="card-title">
              Decision Optimizer
            </div>

            <div className="metrics">

              <div className="metric">
                <div className="metric-title">
                  ALLOW
                </div>
                <div className="metric-value">
                  18,400
                </div>
                <div className="metric-change">
                  High confidence
                </div>
              </div>

              <div className="metric">
                <div className="metric-title">
                  REVIEW
                </div>
                <div className="metric-value">
                  3,200
                </div>
                <div className="metric-change">
                  Medium risk
                </div>
              </div>

              <div className="metric">
                <div className="metric-title">
                  BLOCK
                </div>
                <div className="metric-value">
                  1,850
                </div>
                <div className="metric-change danger">
                  Highest risk
                </div>
              </div>

            </div>

          </Card>

        </div>

        {result && (
          <div className="col-12">

            <Card>

              <div className="card-title">
                Live Backend Analysis
              </div>

              <div className="risk-list">

                {result.risk.reasons.map(
                  (reason: string) => (

                    <div
                      className="risk-item"
                      key={reason}
                    >
                      <div className="risk-icon">
                        !
                      </div>

                      <div>
                        <strong>{reason}</strong>
                        <span>
                          Detected by RiskPulse AI
                        </span>
                      </div>

                    </div>

                  )
                )}

              </div>

            </Card>

          </div>
        )}

      </div>

    </Shell>
  );
}