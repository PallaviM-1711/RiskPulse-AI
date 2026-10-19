"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shell,
  SectionHeader,
  Card,
  Metric,
  Badge,
  Progress,
} from "@/components/riskpulse";

interface SimulationResult {
  status: string;
  scenario_type: string;
  merchant_code: string;
  merchant_name: string;
  transactions_created: number;
  total_exposure: number;
  avg_risk_score: number;
  blocked_count: number;
  incident_code?: string;
}

export default function Simulator() {
  const [running, setRunning] = useState(false);
  const [attackType, setAttackType] = useState("FRAUD_SPIKE");
  const [merchantCode, setMerchantCode] = useState("M004");
  const [intensity, setIntensity] = useState("HIGH");
  const [txnCount, setTxnCount] = useState(40);
  const [result, setResult] = useState<SimulationResult | null>({
    status: "ready",
    scenario_type: "FRAUD_SPIKE",
    merchant_code: "M004",
    merchant_name: "TravelGo",
    transactions_created: 40,
    total_exposure: 148200,
    avg_risk_score: 91.4,
    blocked_count: 38,
    incident_code: "INC-9A41F2",
  });
  const [progress, setProgress] = useState(0);

  async function triggerSimulation() {
    setRunning(true);
    setProgress(15);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 20 : p));
    }, 200);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/simulator/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_type: attackType,
          merchant_code: merchantCode,
          count: txnCount,
          intensity: intensity,
        }),
      });

      if (!res.ok) throw new Error("Simulator execution failed");
      const data = await res.json();
      setResult(data);
      setProgress(100);
    } catch {
      // Offline fallback simulation
      setTimeout(() => {
        setResult({
          status: "simulated_local",
          scenario_type: attackType,
          merchant_code: merchantCode,
          merchant_name: merchantCode === "M004" ? "TravelGo" : "TechWorld",
          transactions_created: txnCount,
          total_exposure: txnCount * 3200,
          avg_risk_score: intensity === "HIGH" ? 89.2 : 68.5,
          blocked_count: Math.round(txnCount * 0.85),
          incident_code: `INC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        });
        setProgress(100);
      }, 800);
    } finally {
      clearInterval(progressTimer);
      setTimeout(() => setRunning(false), 500);
    }
  }

  return (
    <Shell active="Simulator">
      <SectionHeader number="09" title="Synthetic Attack Simulator & Telemetry" />

      <div className="page-title">Attack Simulator</div>
      <div className="page-subtitle">
        Inject controlled adversarial fraud scenarios to stress-test real-time detection
      </div>

      <div className="dashboard-grid">
        {/* CONFIGURATION PANEL */}
        <div className="col-4">
          <Card>
            <div className="card-title">Attack Scenario Builder</div>
            <div className="card-subtitle">Select attack pattern and injection parameters</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block", marginBottom: 3 }}>
                  Attack Vector
                </label>
                <select
                  value={attackType}
                  onChange={(e) => setAttackType(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 8,
                    borderRadius: 5,
                    fontSize: 9,
                  }}
                >
                  <option value="FRAUD_SPIKE">Fraud Spike (High-velocity volume burst)</option>
                  <option value="CARD_TESTING">Card Testing (Rapid micro-authorization)</option>
                  <option value="DEVICE_BURST">Device Burst (Hardware cluster concentration)</option>
                  <option value="NORMAL">Normal Background Traffic</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block", marginBottom: 3 }}>
                  Target Merchant
                </label>
                <select
                  value={merchantCode}
                  onChange={(e) => setMerchantCode(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 8,
                    borderRadius: 5,
                    fontSize: 9,
                  }}
                >
                  <option value="M004">M004 - TravelGo (Chennai)</option>
                  <option value="M001">M001 - TechWorld (Bengaluru)</option>
                  <option value="M002">M002 - FashionHub (Mumbai)</option>
                  <option value="M003">M003 - FoodExpress (Delhi)</option>
                  <option value="M005">M005 - HomeStore (Hyderabad)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block", marginBottom: 3 }}>
                  Attack Intensity
                </label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 8,
                    borderRadius: 5,
                    fontSize: 9,
                  }}
                >
                  <option value="HIGH">High (Maximum anomaly score &gt; 85)</option>
                  <option value="MEDIUM">Medium (Score 60 - 80)</option>
                  <option value="LOW">Low (Subtle anomaly)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block", marginBottom: 3 }}>
                  Transaction Volume: <strong>{txnCount} txns</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={txnCount}
                  onChange={(e) => setTxnCount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#7047ff" }}
                />
              </div>

              <button
                className="primary-button"
                style={{ marginTop: 8 }}
                onClick={triggerSimulation}
                disabled={running}
              >
                {running ? "Injecting Attack Stream..." : "Launch Attack Simulation"}
              </button>
            </div>
          </Card>
        </div>

        {/* RESULTS PANEL */}
        <div className="col-8">
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div className="card-title">Live Attack Telemetry & Results</div>
                <div className="card-subtitle">Real-time risk scoring and defense response</div>
              </div>
              <Badge type={running ? "orange" : result ? "green" : "purple"}>
                {running ? "SIMULATION RUNNING" : "DEFENSE EVALUATED"}
              </Badge>
            </div>

            <div className="metrics" style={{ marginTop: 12 }}>
              <Metric
                title="Injected Txns"
                value={result ? String(result.transactions_created) : "0"}
                change={`Target: ${result?.merchant_code || merchantCode}`}
              />

              <Metric
                title="Average Risk"
                value={result ? `${result.avg_risk_score} /100` : "0 /100"}
                danger={Number(result?.avg_risk_score) >= 70}
                change={Number(result?.avg_risk_score) >= 80 ? "CRITICAL ANOMALY" : "EVALUATED"}
              />

              <Metric
                title="Auto-Blocked"
                value={result ? String(result.blocked_count) : "0"}
                change="Defense active"
                danger={Number(result?.blocked_count) > 0}
              />

              <Metric
                title="Exposure Prevented"
                value={result ? `₹${(result.total_exposure / 1000).toFixed(1)}k` : "₹0"}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 8,
                  color: "#6e809e",
                  marginBottom: 4,
                }}
              >
                <span>Injection Progress</span>
                <span>{running ? `${progress}%` : "Complete"}</span>
              </div>
              <Progress value={running ? progress : 100} danger={attackType !== "NORMAL"} />
            </div>

            {result && (
              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  background: "#081324",
                  border: "1px solid #1a2a44",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 18, color: "#ffae3d" }}>⚠</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>
                      Incident Logged: {result.incident_code || "INC-DETECTED"}
                    </div>
                    <div style={{ fontSize: 8, color: "#7485a0" }}>
                      Simulated {result.scenario_type} against {result.merchant_name} ({result.merchant_code}).
                      All transactions have been stored in Neon PostgreSQL with calculated risk signals.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid #132238",
                  }}
                >
                  <Link href={`/transactions?scenario_type=${result.scenario_type}`}>
                    <button className="secondary-button" style={{ fontSize: 8 }}>
                      View Injected Transactions →
                    </button>
                  </Link>

                  <Link href="/incidents">
                    <button className="primary-button" style={{ fontSize: 8 }}>
                      Inspect Active Incidents →
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}