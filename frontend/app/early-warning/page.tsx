"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
} from "@/components/riskpulse";

function Indicator({
  icon,
  title,
  description,
  level,
}: {
  icon: string;
  title: string;
  description: string;
  level: "HIGH" | "MEDIUM" | "LOW";
}) {
  const badgeType = level === "HIGH" ? "red" : level === "MEDIUM" ? "orange" : "green";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #142035",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          background: "rgba(112, 71, 255, 0.14)",
          color: "#b49fff",
          fontSize: 12,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 9, display: "block" }}>{title}</strong>
        <span style={{ fontSize: 7, color: "#687791" }}>{description}</span>
      </div>

      <Badge type={badgeType}>{level}</Badge>
    </div>
  );
}

export default function EarlyWarning() {
  const [actionApplied, setActionApplied] = useState(false);

  return (
    <Shell active="Early Warning">
      <SectionHeader number="04" title="Predictive Early Warning System" />

      <div className="page-title">Early Warning System</div>
      <div className="page-subtitle">
        Predicting potential fraud attacks before they escalate using 15-minute forecasting windows
      </div>

      {actionApplied && (
        <div
          style={{
            background: "rgba(54, 226, 138, 0.12)",
            border: "1px solid #205a3c",
            color: "#54e99c",
            padding: "10px 16px",
            borderRadius: 6,
            fontSize: 9,
            marginBottom: 14,
          }}
        >
          ✓ Step-up verification policy and velocity caps dispatched to merchant gateway.
        </div>
      )}

      {/* TOP ROW: ATTACK PROBABILITY & FORECAST */}
      <div className="dashboard-grid">
        {/* ATTACK PROBABILITY */}
        <div className="col-4">
          <Card>
            <div className="card-title">Attack Probability</div>
            <div className="card-subtitle">Probability of coordinated escalation in next 15m</div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 0",
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "conic-gradient(#ff4d5e 0deg, #ff4d5e 313deg, #172438 313deg, #172438 360deg)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 114,
                    height: 114,
                    borderRadius: "50%",
                    background: "#07101e",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <strong style={{ fontSize: 32, color: "white" }}>87%</strong>
                  <span style={{ fontSize: 7, color: "#ff6977", fontWeight: 700, marginTop: 2 }}>
                    HIGH PROBABILITY
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 10,
                background: "rgba(255, 77, 94, 0.08)",
                border: "1px solid rgba(255, 77, 94, 0.25)",
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: "#ff6977" }}>
                ⚠ Elevated threat detected
              </div>
              <div style={{ fontSize: 7, color: "#7a8a9e", marginTop: 2 }}>
                Multiple risk signals are increasing simultaneously across merchants.
              </div>
            </div>
          </Card>
        </div>

        {/* RISK PREDICTION CHART */}
        <div className="col-8">
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div>
                <div className="card-title">Forecasted Risk Progression (+15 Min)</div>
                <div className="card-subtitle">
                  Continuous simulation projection based on velocity velocity delta
                </div>
              </div>
              <Badge type="orange">PREDICTION ACTIVE</Badge>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  padding: 12,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #19273f",
                }}
              >
                <div style={{ fontSize: 7, color: "#68768e", textTransform: "uppercase" }}>
                  Current Risk
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginTop: 4 }}>
                  68 <span style={{ fontSize: 10, color: "#64748b" }}>/100</span>
                </div>
                <span style={{ fontSize: 7, color: "#ffae3d" }}>HIGH RISK</span>
              </div>

              <div
                style={{
                  padding: 12,
                  background: "rgba(255, 77, 94, 0.06)",
                  borderRadius: 6,
                  border: "1px solid rgba(255, 77, 94, 0.22)",
                }}
              >
                <div style={{ fontSize: 7, color: "#68768e", textTransform: "uppercase" }}>
                  Predicted Peak
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#ff6977", marginTop: 4 }}>
                  84 <span style={{ fontSize: 10, color: "#64748b" }}>/100</span>
                </div>
                <span style={{ fontSize: 7, color: "#ff6977" }}>▲ +16 points escalation</span>
              </div>
            </div>

            {/* FORECAST CHART */}
            <div
              style={{
                height: 140,
                background: "#06101d",
                borderRadius: 6,
                border: "1px solid #16243a",
                padding: "8px 12px",
              }}
            >
              <svg viewBox="0 0 700 130" style={{ width: "100%", height: "100%" }}>
                <defs>
                  <linearGradient id="warningGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d5e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ff4d5e" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d="M0 100 L60 96 L120 101 L180 85 L240 90 L300 75 L360 80 L420 62 L480 69 L540 50 L600 58 L650 35 L700 15 L700 130 L0 130 Z"
                  fill="url(#warningGrad)"
                />
                <path
                  d="M0 100 L60 96 L120 101 L180 85 L240 90 L300 75 L360 80 L420 62 L480 69 L540 50 L600 58 L650 35 L700 15"
                  fill="none"
                  stroke="#ff5264"
                  strokeWidth="2.5"
                />
                <circle cx="700" cy="15" r="4" fill="#ff5264" />

                <text x="5" y="125" fill="#586982" fontSize="8">NOW</text>
                <text x="230" y="125" fill="#586982" fontSize="8">+5 MIN</text>
                <text x="460" y="125" fill="#586982" fontSize="8">+10 MIN</text>
                <text x="645" y="125" fill="#586982" fontSize="8">+15 MIN</text>
              </svg>
            </div>
          </Card>
        </div>

        {/* BOTTOM ROW: INDICATORS & DEFENSIVE ACTIONS */}
        <div className="col-7">
          <Card>
            <div className="card-title">Key Indicators Driving Escalation</div>
            <div className="card-subtitle">Signals contributing to predicted attack probability</div>

            <Indicator
              icon="⚡"
              title="Transaction velocity surge"
              description="5.2x above normal merchant baseline rate"
              level="HIGH"
            />
            <Indicator
              icon="◎"
              title="Device concentration burst"
              description="62% of recent volume originates from 3 repeated devices"
              level="MEDIUM"
            />
            <Indicator
              icon="!"
              title="Failed authorizations multiplier"
              description="4.6x normal failure rate (Card authorization testing pattern)"
              level="HIGH"
            />
            <Indicator
              icon="₹"
              title="Amount baseline deviation"
              description="2.3x higher average ticket size than learned norm"
              level="MEDIUM"
            />
            <Indicator
              icon="📍"
              title="Rapid multi-geo drift"
              description="Transactions recorded across 5 distant cities within 10 minutes"
              level="MEDIUM"
            />
          </Card>
        </div>

        <div className="col-5">
          <Card>
            <div className="card-title">Recommended Preemptive Actions</div>
            <div className="card-subtitle">Actions formulated by the defense engine</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <div
                style={{
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #18273e",
                }}
              >
                <strong style={{ fontSize: 8, display: "block" }}>1. Enable Step-Up 3DS</strong>
                <span style={{ fontSize: 7, color: "#6e809e" }}>
                  Enforce OTP authentication for all transactions &gt; ₹2,000
                </span>
              </div>

              <div
                style={{
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #18273e",
                }}
              >
                <strong style={{ fontSize: 8, display: "block" }}>2. Rate-Limit Suspicious Devices</strong>
                <span style={{ fontSize: 7, color: "#6e809e" }}>
                  Apply temporary 30-minute velocity throttle to DEV012
                </span>
              </div>

              <div
                style={{
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #18273e",
                }}
              >
                <strong style={{ fontSize: 8, display: "block" }}>3. Alert Merchant Operations</strong>
                <span style={{ fontSize: 7, color: "#6e809e" }}>
                  Notify M004 (TravelGo) security team via webhook
                </span>
              </div>
            </div>

            <button
              className="primary-button"
              style={{ marginTop: 14, width: "100%", padding: 10 }}
              onClick={() => setActionApplied(true)}
            >
              Apply Recommended Preemptive Defenses
            </button>
          </Card>
        </div>
      </div>
    </Shell>
  );
}