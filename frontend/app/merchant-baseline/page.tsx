"use client";

import { useState, useEffect } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
  Metric,
} from "@/components/riskpulse";

interface BaselineMetric {
  name: string;
  baseline: string;
  current: string;
  deviation: string;
  status: string;
}

const DEFAULT_METRICS: BaselineMetric[] = [
  { name: "Transactions / min", baseline: "420", current: "1,184", deviation: "+182%", status: "HIGH" },
  { name: "Fraud Rate", baseline: "2.1%", current: "8.7%", deviation: "+314%", status: "HIGH" },
  { name: "Avg. Amount", baseline: "₹21,240", current: "₹28,910", deviation: "+36%", status: "MEDIUM" },
  { name: "Success Rate", baseline: "96.8%", current: "89.4%", deviation: "-8%", status: "MEDIUM" },
  { name: "Failed Rate", baseline: "3.2%", current: "11.6%", deviation: "+263%", status: "HIGH" },
  { name: "New Customers / hr", baseline: "18", current: "74", deviation: "+311%", status: "HIGH" },
  { name: "Repeat Customer Rate", baseline: "66%", current: "39%", deviation: "-27%", status: "MEDIUM" },
];

export default function MerchantBaseline() {
  const [selectedMerchant, setSelectedMerchant] = useState("M004");
  const [metrics, setMetrics] = useState<BaselineMetric[]>(DEFAULT_METRICS);
  const [merchantData, setMerchantData] = useState<any>({
    merchant_code: "M004",
    merchant_name: "TravelGo",
    category: "Travel",
    location: "Chennai",
    status: "At Risk",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBaseline() {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/merchants/${selectedMerchant}/baseline`);
        if (res.ok) {
          const data = await res.json();
          setMerchantData(data);
          if (data.metrics && data.metrics.length > 0) {
            setMetrics(data.metrics);
          }
        }
      } catch {
        // Keep default
      } finally {
        setLoading(false);
      }
    }
    loadBaseline();
  }, [selectedMerchant]);

  return (
    <Shell active="Merchant Baseline">
      <SectionHeader number="03" title="Merchant Behavioral Baseline Intelligence" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 14,
        }}
      >
        <div>
          <div className="page-title">Merchant Baseline</div>
          <div className="page-subtitle">
            Learned normal behavioural profiles compared continuously against real-time activity
          </div>
        </div>

        {/* SELECTOR */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 8, color: "#8a9bb5" }}>Selected Merchant:</span>
          <select
            value={selectedMerchant}
            onChange={(e) => setSelectedMerchant(e.target.value)}
            style={{
              background: "#091323",
              border: "1px solid #243651",
              color: "white",
              padding: "7px 12px",
              borderRadius: 5,
              fontSize: 9,
            }}
          >
            <option value="M004">M004 - TravelGo (Travel)</option>
            <option value="M001">M001 - TechWorld (Electronics)</option>
            <option value="M002">M002 - FashionHub (Fashion)</option>
            <option value="M003">M003 - FoodExpress (Food)</option>
            <option value="M005">M005 - HomeStore (Home & Living)</option>
            <option value="M006">M006 - BookNest (Books)</option>
            <option value="M007">M007 - GadgetZone (Electronics)</option>
            <option value="M008">M008 - QuickMart (Retail)</option>
            <option value="M009">M009 - FitLife (Fitness)</option>
            <option value="M010">M010 - GameWorld (Gaming)</option>
          </select>
        </div>
      </div>

      {/* SUMMARY METRICS */}
      <div className="metrics" style={{ marginBottom: 14 }}>
        <Metric
          title="Merchant Status"
          value={merchantData.status || "At Risk"}
          change={merchantData.status === "At Risk" ? "Behaviour anomaly detected" : "Operating within norm"}
          danger={merchantData.status === "At Risk"}
        />
        <Metric
          title="Baseline Confidence"
          value="94%"
          change="Learned from 30d history"
        />
        <Metric
          title="Velocity Deviation"
          value="+182%"
          change="▲ Above threshold"
          danger
        />
        <Metric
          title="Baseline Adaptive Model"
          value="Active"
          change="Continuous learning online"
        />
      </div>

      {/* COMPARISON TABLE */}
      <Card style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div>
            <div className="card-title">
              Current Behaviour vs Learned Baseline ({merchantData.merchant_name || selectedMerchant})
            </div>
            <div className="card-subtitle">
              Comparison between real-time transaction telemetry and long-term statistical norm
            </div>
          </div>
          <Badge type="purple">ADAPTIVE BASELINE</Badge>
        </div>

        <table className="rp-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Baseline (Normal)</th>
              <th>Current Activity</th>
              <th>Deviation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.name}>
                <td>
                  <strong>{m.name}</strong>
                </td>
                <td style={{ color: "#8a9ab4" }}>{m.baseline}</td>
                <td style={{ color: "#dbe5f7", fontWeight: 700 }}>{m.current}</td>
                <td>
                  <span
                    style={{
                      color: m.deviation.startsWith("-") ? "#ffae3d" : "#ff4d5e",
                      fontWeight: 700,
                    }}
                  >
                    {m.deviation}
                  </span>
                </td>
                <td>
                  <Badge type={m.status === "HIGH" ? "red" : m.status === "MEDIUM" ? "orange" : "green"}>
                    {m.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* LOWER SPLIT: LEARNING ENGINE & DEVIATION DRIVERS */}
      <div className="dashboard-grid">
        <div className="col-6">
          <Card>
            <div className="card-title">Adaptive Learning Channels</div>
            <div className="card-subtitle">Telemetry channels used to synthesize normal baselines</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 4 }}>
                  <span>Transaction Volume & Velocity Curves</span>
                  <span style={{ color: "#36e28a" }}>96% Confidence</span>
                </div>
                <div className="progress">
                  <div className="progress-value" style={{ width: "96%" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 4 }}>
                  <span>Ticket Size & Amount Distribution</span>
                  <span style={{ color: "#36e28a" }}>91% Confidence</span>
                </div>
                <div className="progress">
                  <div className="progress-value" style={{ width: "91%" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 4 }}>
                  <span>Customer Retention & Geolocation Distribution</span>
                  <span style={{ color: "#36e28a" }}>88% Confidence</span>
                </div>
                <div className="progress">
                  <div className="progress-value" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-6">
          <Card>
            <div className="card-title">Primary Deviation Drivers</div>
            <div className="card-subtitle">Signals contributing most to merchant risk elevation</div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              <div className="risk-item">
                <div className="risk-icon">⚡</div>
                <div style={{ flex: 1 }}>
                  <strong>Volume Burst Velocity</strong>
                  <span>1,184 txns/min vs expected 420 baseline</span>
                </div>
                <Badge type="red">+182%</Badge>
              </div>

              <div className="risk-item">
                <div className="risk-icon">!</div>
                <div style={{ flex: 1 }}>
                  <strong>Fraud Ratio Elevation</strong>
                  <span>8.7% current vs 2.1% historical norm</span>
                </div>
                <Badge type="red">+314%</Badge>
              </div>

              <div className="risk-item">
                <div className="risk-icon">₹</div>
                <div style={{ flex: 1 }}>
                  <strong>Ticket Size Shift</strong>
                  <span>₹28,910 avg vs ₹21,240 baseline</span>
                </div>
                <Badge type="orange">+36%</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}