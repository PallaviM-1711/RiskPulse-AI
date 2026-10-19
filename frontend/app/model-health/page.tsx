"use client";

import { useState } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
  Metric,
} from "@/components/riskpulse";

function DriftBar({
  label,
  value,
  level,
}: {
  label: string;
  value: string;
  level: "low" | "medium";
}) {
  const width = level === "low" ? "38%" : "68%";
  const barColor = level === "low" ? "#36e28a" : "#ffae3d";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 4 }}>
        <span style={{ color: "#8a9ab4" }}>{label}</span>
        <strong style={{ color: barColor }}>{value}</strong>
      </div>
      <div className="progress">
        <div
          className="progress-value"
          style={{ width, background: barColor }}
        />
      </div>
    </div>
  );
}

export default function ModelHealth() {
  const [retraining, setRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [f1Score, setF1Score] = useState(0.94);

  function handleRetrain() {
    setRetraining(true);
    setRetrainSuccess(false);
    setTimeout(() => {
      setRetraining(false);
      setRetrainSuccess(true);
      setF1Score(0.95);
      setTimeout(() => setRetrainSuccess(false), 4000);
    }, 1800);
  }

  return (
    <Shell active="Model Health">
      <SectionHeader number="10" title="Machine Learning Health & Drift Monitoring" />

      <div className="page-title">Model Health</div>
      <div className="page-subtitle">
        Monitor ensemble fraud classification performance, concept drift, and automated retraining
      </div>

      {retrainSuccess && (
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
          ✓ Model retraining completed. Weights updated across 2.8M historical vectors. F1-Score recalibrated to 0.95.
        </div>
      )}

      {/* METRICS */}
      <div className="metrics" style={{ marginBottom: 14 }}>
        <Metric title="Model Status" value="Healthy" change="● All models operational" />
        <Metric title="Inference Latency" value="42 ms" change="Within SLA target (&lt;50ms)" />
        <Metric title="F1 Accuracy" value={String(f1Score)} change="▲ +1.7% vs previous version" />
        <Metric title="Concept Drift" value="3.1%" change="Low behavioural deviation" />
      </div>

      <div className="dashboard-grid">
        {/* PERFORMANCE TREND */}
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
                <div className="card-title">Performance Trend (F1-Score Evaluation)</div>
                <div className="card-subtitle">Comparison between Current Production Model and Previous v2.3</div>
              </div>
              <Badge type="purple">ENSEMBLE CLASSIFIER</Badge>
            </div>

            <div
              style={{
                height: 180,
                background: "#06101d",
                borderRadius: 6,
                border: "1px solid #16243a",
                padding: "10px 14px",
              }}
            >
              <svg viewBox="0 0 500 130" style={{ width: "100%", height: "100%" }}>
                {/* GRID LINES */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#142035" strokeWidth="1" />
                <line x1="0" y1="65" x2="500" y2="65" stroke="#142035" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#142035" strokeWidth="1" />

                {/* PREVIOUS MODEL */}
                <path
                  d="M0 90 L40 85 L80 88 L120 78 L160 82 L200 74 L240 78 L280 70 L320 73 L360 67 L400 70 L450 63 L500 58"
                  fill="none"
                  stroke="#576985"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* CURRENT MODEL */}
                <path
                  d="M0 80 L40 72 L80 75 L120 62 L160 67 L200 53 L240 60 L280 46 L320 51 L360 40 L400 45 L450 32 L500 24"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                />

                <circle cx="500" cy="24" r="4" fill="#8b5cf6" />
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                gap: 16,
                fontSize: 8,
                color: "#7486a4",
                marginTop: 10,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 3, background: "#8b5cf6", borderRadius: 2 }} />
                Current Model v2.4 (F1: 0.94)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 2, background: "#576985", borderTop: "1px dashed" }} />
                Previous Model v2.3 (F1: 0.92)
              </span>
            </div>
          </Card>
        </div>

        {/* MODEL DETAILS */}
        <div className="col-4">
          <Card>
            <div className="card-title">Production Model Architecture</div>
            <div className="card-subtitle">Active risk scoring pipeline</div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Model Version</strong>
                  <span>RiskPulse Ensemble v2.4.1</span>
                </div>
                <Badge type="green">PROD</Badge>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Training Base</strong>
                  <span>2.8M Transaction Vectors</span>
                </div>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Architecture</strong>
                  <span>Multi-Signal Gradient Classifier</span>
                </div>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Last Trained</strong>
                  <span>14 May 2026, 02:15 AM</span>
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              style={{ width: "100%", marginTop: 14, padding: 9 }}
              onClick={handleRetrain}
              disabled={retraining}
            >
              {retraining ? "Retraining Weights..." : "↻ Retrain Model Now"}
            </button>
          </Card>
        </div>

        {/* DRIFT MONITORING */}
        <div className="col-7">
          <Card>
            <div className="card-title">Production Data & Concept Drift</div>
            <div className="card-subtitle">
              Continuous divergence measurement against baseline training distributions
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <DriftBar label="Transaction Amount Distribution" value="4.2%" level="low" />
              <DriftBar label="Velocity Anomaly Frequency" value="6.8%" level="medium" />
              <DriftBar label="Device Concentration Pattern" value="3.1%" level="low" />
              <DriftBar label="Payment Method Split" value="2.4%" level="low" />
              <DriftBar label="Geographic Dispersal Shift" value="5.2%" level="medium" />
            </div>
          </Card>
        </div>

        {/* AUTOMATED HEALTH CHECKS */}
        <div className="col-5">
          <Card>
            <div className="card-title">Automated Model Checks</div>
            <div className="card-subtitle">Continuous diagnostic checks on inference pipeline</div>

            <div className="risk-list" style={{ marginTop: 12 }}>
              {[
                "Input data schema integrity",
                "Feature calculation latency",
                "False positive rate &lt; 0.5%",
                "Model accuracy consistency",
                "Neon PostgreSQL feature store sync",
              ].map((item) => (
                <div
                  key={item}
                  className="risk-item"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#36e28a", fontSize: 9 }}>✓</span>
                    <span style={{ fontSize: 8 }}>{item}</span>
                  </div>
                  <Badge type="green">PASS</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}