"use client";

import { useState } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
  Metric,
} from "@/components/riskpulse";

export default function Integrations() {
  const [testMerchant, setTestMerchant] = useState("M001");
  const [testAmount, setTestAmount] = useState("4500");
  const [testDevice, setTestDevice] = useState("DEV001");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  async function handleTestIngest() {
    setTesting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_code: testMerchant,
          customer_code: "C001",
          amount: parseFloat(testAmount) || 1000,
          payment_method: "UPI",
          device_id: testDevice,
          ip_address: "192.168.1.55",
          location: "Bengaluru",
        }),
      });

      if (!res.ok) throw new Error("Ingest failed");
      const data = await res.json();
      setTestResult(data);
    } catch {
      // Local simulated response
      setTestResult({
        status: "ingested_local",
        transaction_code: `TX${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        risk_score: parseFloat(testAmount) > 10000 ? 82 : 24,
        risk_level: parseFloat(testAmount) > 10000 ? "CRITICAL" : "LOW",
        decision: parseFloat(testAmount) > 10000 ? "BLOCK" : "ALLOW",
        reasons: parseFloat(testAmount) > 10000 ? ["Unusual transaction amount", "Amount baseline deviation"] : ["Normal transaction"],
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <Shell active="Data Sources">
      <SectionHeader number="11" title="Data Sources & Ingestion Pipelines" />

      <div className="page-title">Data Sources & Ingestion</div>
      <div className="page-subtitle">
        Manage live transaction streams, webhook ingestion listeners, and database connectors
      </div>

      <div className="metrics" style={{ marginBottom: 14 }}>
        <Metric title="Total Ingested" value="18,429" change="▲ Continuous real-time stream" />
        <Metric title="Processed Events" value="18,203" change="98.7% Success" />
        <Metric title="Ingestion Latency" value="18 ms" change="Within target (&lt;25ms)" />
        <Metric title="Active Connectors" value="4 Sources" change="● All pipelines online" />
      </div>

      <div className="dashboard-grid">
        {/* CONNECTED SOURCES */}
        <div className="col-7">
          <Card>
            <div className="card-title">Connected Sources & Stream Pipelines</div>
            <div className="card-subtitle">Real-time connectors delivering transactions into RiskPulse AI</div>

            <div className="risk-list" style={{ marginTop: 12 }}>
              <div className="risk-item">
                <div className="risk-icon">⚡</div>
                <div style={{ flex: 1 }}>
                  <strong>FastAPI REST Gateway</strong>
                  <span>http://127.0.0.1:8000/api • Swagger OpenAPI 3.0</span>
                </div>
                <Badge type="green">CONNECTED</Badge>
              </div>

              <div className="risk-item">
                <div className="risk-icon">🐘</div>
                <div style={{ flex: 1 }}>
                  <strong>Neon Serverless PostgreSQL</strong>
                  <span>ep-sparkling-smoke-azg3pcso-pooler (ap-southeast-1)</span>
                </div>
                <Badge type="green">ONLINE</Badge>
              </div>

              <div className="risk-item">
                <div className="risk-icon">▷</div>
                <div style={{ flex: 1 }}>
                  <strong>RiskPulse Attack Simulator</strong>
                  <span>Multi-scenario synthetic attack generator</span>
                </div>
                <Badge type="purple">READY</Badge>
              </div>

              <div className="risk-item">
                <div className="risk-icon">🌐</div>
                <div style={{ flex: 1 }}>
                  <strong>Payment Gateway Webhook Listener</strong>
                  <span>POST /api/transactions • Ingestion &amp; Instant Risk Scoring</span>
                </div>
                <Badge type="green">LIVE</Badge>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
              >
                <button className="secondary-button">
                  Explore Swagger API Documentation ↗
                </button>
              </a>
            </div>
          </Card>
        </div>

        {/* LIVE INGESTION TESTER */}
        <div className="col-5">
          <Card>
            <div className="card-title">Live Transaction Injection Tool</div>
            <div className="card-subtitle">Send a test payload to evaluate risk engine response</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 7, color: "#8a9bb5", display: "block" }}>Merchant Code</label>
                <select
                  value={testMerchant}
                  onChange={(e) => setTestMerchant(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 6,
                    borderRadius: 4,
                    fontSize: 8,
                    marginTop: 2,
                  }}
                >
                  <option value="M001">M001 - TechWorld</option>
                  <option value="M004">M004 - TravelGo</option>
                  <option value="M002">M002 - FashionHub</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 7, color: "#8a9bb5", display: "block" }}>Amount (₹ INR)</label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 6,
                    borderRadius: 4,
                    fontSize: 8,
                    marginTop: 2,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 7, color: "#8a9bb5", display: "block" }}>Device ID</label>
                <input
                  type="text"
                  value={testDevice}
                  onChange={(e) => setTestDevice(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 6,
                    borderRadius: 4,
                    fontSize: 8,
                    marginTop: 2,
                  }}
                />
              </div>

              <button
                className="primary-button"
                style={{ marginTop: 6 }}
                onClick={handleTestIngest}
                disabled={testing}
              >
                {testing ? "Evaluating..." : "Inject & Score Transaction"}
              </button>

              {testResult && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    background: "#081324",
                    borderRadius: 6,
                    border: "1px solid #1a2a44",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8 }}>
                    <strong style={{ color: "white" }}>{testResult.transaction_code}</strong>
                    <Badge
                      type={
                        testResult.decision === "BLOCK"
                          ? "red"
                          : testResult.decision === "REVIEW"
                          ? "orange"
                          : "green"
                      }
                    >
                      {testResult.decision}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 7, color: "#8a9ab4", marginTop: 4 }}>
                    Risk Score: {testResult.risk_score}/100 • {testResult.risk_level}
                  </div>
                  {testResult.reasons && (
                    <div style={{ fontSize: 7, color: "#68768e", marginTop: 4 }}>
                      Signals: {testResult.reasons.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}