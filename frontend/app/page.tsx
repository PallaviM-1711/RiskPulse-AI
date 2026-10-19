"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shell,
  SectionHeader,
  Card,
  Metric,
  Badge,
  RiskRing,
  Footer,
} from "@/components/riskpulse";

interface StatsData {
  total_transactions: number;
  total_transactions_24h: number;
  avg_risk_score: number;
  fraud_rate: number;
  blocked_count: number;
  blocked_value: number;
  blocked_value_formatted: string;
  active_incidents: number;
  risk_level: string;
  timeline: number[];
  last_updated: string;
}

const DEFAULT_STATS: StatsData = {
  total_transactions: 18429,
  total_transactions_24h: 18429,
  avg_risk_score: 72,
  fraud_rate: 2.84,
  blocked_count: 1284,
  blocked_value: 842000,
  blocked_value_formatted: "₹8.42L",
  active_incidents: 3,
  risk_level: "HIGH",
  timeline: [65, 68, 62, 70, 74, 69, 78, 82, 85, 76, 88, 84, 91, 87],
  last_updated: "14:32:17 IST",
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [incidents, setIncidents] = useState<any[]>([
    { title: "Fraud Spike", severity: "HIGH", detected_at: "2 min ago" },
    { title: "Coordinated Fraud", severity: "MEDIUM", detected_at: "8 min ago" },
    { title: "Card Testing Attack", severity: "HIGH", detected_at: "11 min ago" },
  ]);
  const [dbConnected, setDbConnected] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/stats/overview");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({ ...prev, ...data }));
          setDbConnected(true);
        }
      } catch {
        setDbConnected(false);
      }

      try {
        const incRes = await fetch("http://127.0.0.1:8000/api/incidents");
        if (incRes.ok) {
          const incData = await incRes.json();
          if (incData && incData.length > 0) {
            setIncidents(incData.slice(0, 3));
          }
        }
      } catch {
        // Fallback to default
      }
    }

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Shell active="Overview">
      {/* HEADER */}
      <h1 className="page-title">Good afternoon, Prajju 👋</h1>
      <div className="page-subtitle">
        Here&apos;s what&apos;s happening across your fraud defense system.
      </div>

      {/* METRICS */}
      <div className="metrics">
        <Metric
          title="Risk Score"
          value={`${stats.avg_risk_score} /100`}
          change="▲ 12.3% vs last hour"
          danger={stats.avg_risk_score >= 70}
        />

        <Metric
          title="Fraud Rate"
          value={`${stats.fraud_rate}%`}
          change="▲ 0.71% vs last hour"
          danger={stats.fraud_rate > 3}
        />

        <Metric
          title="Blocked Value"
          value={stats.blocked_value_formatted}
          change="▲ 21.1% vs last hour"
        />

        <Metric
          title="Total TXNS (24H)"
          value={stats.total_transactions_24h.toLocaleString()}
          change="▲ 2.46% vs last hour"
        />
      </div>

      {/* RISK OVERVIEW SECTION */}
      <div className="section-header">
        <span className="section-number">01</span>
        <span>Dashboard — Overview</span>
      </div>

      <div className="dashboard-grid">
        {/* RISK SCORE CHART */}
        <Card className="col-7">
          <div className="card-title">Risk Score Over Time</div>
          <div className="card-subtitle">Real-time aggregate risk score</div>

          <div className="chart">
            <svg viewBox="0 0 600 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7047ff" stopOpacity=".3" />
                  <stop offset="100%" stopColor="#7047ff" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                className="chart-area"
                d="
                  M0 115
                  L25 108
                  L50 112
                  L75 92
                  L100 100
                  L125 80
                  L150 87
                  L175 66
                  L200 77
                  L225 60
                  L250 71
                  L275 50
                  L300 62
                  L325 47
                  L350 56
                  L375 39
                  L400 52
                  L425 30
                  L450 42
                  L475 28
                  L500 48
                  L525 37
                  L550 45
                  L575 27
                  L600 33
                  L600 150
                  L0 150 Z
                "
              />

              <path
                className="chart-line"
                d="
                  M0 115
                  L25 108
                  L50 112
                  L75 92
                  L100 100
                  L125 80
                  L150 87
                  L175 66
                  L200 77
                  L225 60
                  L250 71
                  L275 50
                  L300 62
                  L325 47
                  L350 56
                  L375 39
                  L400 52
                  L425 30
                  L450 42
                  L475 28
                  L500 48
                  L525 37
                  L550 45
                  L575 27
                  L600 33
                "
              />
            </svg>
          </div>
        </Card>

        {/* EARLY WARNING */}
        <Card className="col-5">
          <div className="card-title">Early Warning</div>

          <div className="alert">
            <h3>⚠ Risk increasing</h3>
            <p>Attack probability increased in the last 15 minutes.</p>

            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                marginTop: "8px",
              }}
            >
              87%
            </div>

            <div style={{ marginTop: "8px" }}>
              <span className="badge badge-orange">HIGH PROBABILITY</span>
            </div>

            <Link href="/early-warning">
              <button className="primary-button" style={{ marginTop: "12px" }}>
                Investigate
              </button>
            </Link>
          </div>
        </Card>

        {/* ACTIVE INCIDENTS */}
        <Card className="col-4">
          <div className="card-title">Active Incidents ({stats.active_incidents})</div>
          <div className="card-subtitle">Currently detected threats</div>

          <div className="risk-list">
            {incidents.map((inc, i) => (
              <div className="risk-item" key={inc.incident_code || i}>
                <div className="risk-icon">{inc.severity === "CRITICAL" ? "⚡" : "⚠"}</div>
                <div style={{ flex: 1 }}>
                  <strong>{inc.title}</strong>
                  <span>{inc.detected_at}</span>
                </div>
                <span className={`badge badge-${inc.severity === "CRITICAL" ? "red" : "orange"}`}>
                  {inc.severity}
                </span>
              </div>
            ))}
          </div>

          <Link href="/incidents">
            <button className="secondary-button" style={{ marginTop: "12px", width: "100%" }}>
              View all incidents →
            </button>
          </Link>
        </Card>

        {/* MERCHANT BASELINE */}
        <Card className="col-4">
          <div className="card-title">
            Merchant Baseline <span style={{ color: "#6e7a91" }}>(vs Current)</span>
          </div>
          <div className="card-subtitle">
            Current merchant activity compared with learned baseline
          </div>

          <table className="rp-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Baseline</th>
                <th>Current</th>
                <th>Deviation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Txn / min</td>
                <td>420</td>
                <td>1,184</td>
                <td>
                  <span className="badge badge-red">▲182%</span>
                </td>
              </tr>
              <tr>
                <td>Fraud Rate</td>
                <td>2.1%</td>
                <td>8.7%</td>
                <td>
                  <span className="badge badge-red">▲314%</span>
                </td>
              </tr>
              <tr>
                <td>Avg Amount</td>
                <td>₹21,240</td>
                <td>₹28,910</td>
                <td>
                  <span className="badge badge-orange">▲36%</span>
                </td>
              </tr>
              <tr>
                <td>Success Rate</td>
                <td>96.8%</td>
                <td>89.4%</td>
                <td>
                  <span className="badge badge-red">▼8%</span>
                </td>
              </tr>
            </tbody>
          </table>

          <Link href="/merchant-baseline">
            <button className="secondary-button" style={{ marginTop: "10px", width: "100%" }}>
              Merchant Baselines →
            </button>
          </Link>
        </Card>

        {/* RISK HEATMAP */}
        <Card className="col-4">
          <div className="card-title">Risk Heatmap</div>
          <div className="card-subtitle">Geographic distribution of detected risk</div>

          <div
            style={{
              height: "145px",
              borderRadius: "6px",
              background:
                "radial-gradient(circle at 70% 35%, #ff4d5e 0 4%, transparent 5%), radial-gradient(circle at 52% 55%, #ffae3d 0 5%, transparent 6%), radial-gradient(circle at 35% 42%, #7047ff 0 4%, transparent 5%), #081525",
              border: "1px solid #17263c",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "15px",
                opacity: 0.25,
                background:
                  "linear-gradient(25deg, transparent 40%, #315071 41%, transparent 42%), linear-gradient(150deg, transparent 48%, #315071 49%, transparent 50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "12px",
                fontSize: "8px",
                color: "#64718a",
              }}
            >
              LOW
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "12px",
                fontSize: "8px",
                color: "#ff5968",
              }}
            >
              HIGH
            </div>
          </div>
        </Card>

        {/* RISK FACTORS */}
        <Card className="col-6">
          <div className="card-title">Key Indicators Driving Risk</div>
          <div className="card-subtitle">Signals contributing to the current risk score</div>

          <div className="risk-list">
            <div className="risk-item">
              <div className="risk-icon">⚡</div>
              <div>
                <strong>Transaction velocity</strong>
                <span>5.2x above normal baseline</span>
              </div>
              <span className="badge badge-red">HIGH</span>
            </div>

            <div className="risk-item">
              <div className="risk-icon">◎</div>
              <div>
                <strong>Device concentration</strong>
                <span>62% from 3 repeated devices</span>
              </div>
              <span className="badge badge-orange">MEDIUM</span>
            </div>

            <div className="risk-item">
              <div className="risk-icon">!</div>
              <div>
                <strong>Failed transactions</strong>
                <span>4.6x above normal failure rate</span>
              </div>
              <span className="badge badge-red">HIGH</span>
            </div>

            <div className="risk-item">
              <div className="risk-icon">₹</div>
              <div>
                <strong>Amount deviation</strong>
                <span>2.3x above normal value</span>
              </div>
              <span className="badge badge-orange">MEDIUM</span>
            </div>
          </div>
        </Card>

        {/* CURRENT RISK */}
        <Card className="col-6">
          <div className="card-title">Current Risk Level</div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "15px 0",
            }}
          >
            <RiskRing score={stats.avg_risk_score} label={`${stats.risk_level} RISK`} />
          </div>

          <div style={{ textAlign: "center" }}>
            <span className="badge badge-red">DEFENSIVE REVIEW REQUIRED</span>
          </div>
        </Card>
      </div>

      {/* SYSTEM INTELLIGENCE SECTION */}
      <div className="section-header">
        <span className="section-number">02</span>
        <span>System Intelligence</span>
      </div>

      <div className="dashboard-grid">
        <Card className="col-4">
          <div className="card-title">System Status</div>

          <div className="risk-list">
            <div className="risk-item">
              <div className="risk-icon">✓</div>
              <div>
                <strong>Risk Engine</strong>
                <span>All 5 detection models operational</span>
              </div>
              <span className="badge badge-green">ONLINE</span>
            </div>

            <div className="risk-item">
              <div className="risk-icon">✓</div>
              <div>
                <strong>Database Stream</strong>
                <span>Neon PostgreSQL connected</span>
              </div>
              <span className={`badge badge-${dbConnected ? "green" : "orange"}`}>
                {dbConnected ? "CONNECTED" : "LOCAL CACHE"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="col-4">
          <div className="card-title">Recommended Actions</div>

          <div className="risk-list">
            <div className="risk-item">
              <div className="risk-icon">1</div>
              <div>
                <strong>Review high-risk transactions</strong>
                <span>Prioritize current attack cluster</span>
              </div>
            </div>

            <div className="risk-item">
              <div className="risk-icon">2</div>
              <div>
                <strong>Investigate device cluster</strong>
                <span>Multiple accounts sharing hardware</span>
              </div>
            </div>

            <div className="risk-item">
              <div className="risk-icon">3</div>
              <div>
                <strong>Monitor merchant velocity</strong>
                <span>Keep adaptive rate limits active</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="col-4">
          <div className="card-title">Platform Protection</div>

          <div
            style={{
              fontSize: "34px",
              color: "#7d61ff",
              margin: "15px 0",
            }}
          >
            🛡
          </div>

          <div style={{ fontSize: "10px", fontWeight: 700 }}>
            Defense Only by Design
          </div>

          <p
            style={{
              color: "#66748b",
              fontSize: "8px",
              lineHeight: 1.6,
            }}
          >
            RiskPulse AI detects, investigates and responds to fraud.
            No offensive actions are taken.
          </p>
        </Card>
      </div>

      <Footer />
    </Shell>
  );
}