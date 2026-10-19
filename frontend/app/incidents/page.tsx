"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shell,
  SectionHeader,
  Card,
  Chart,
  Badge,
  Metric,
} from "@/components/riskpulse";

interface IncidentItem {
  id: number;
  incident_code: string;
  title: string;
  incident_type: string;
  severity: string;
  merchant_code: string;
  affected_transactions_count: number;
  exposure_amount: number;
  status: string;
  detected_at: string;
}

const DEFAULT_INCIDENTS: IncidentItem[] = [
  {
    id: 1,
    incident_code: "INC-9A41F2",
    title: "Rapid Fraud Spike on TravelGo",
    incident_type: "FRAUD_SPIKE",
    severity: "CRITICAL",
    merchant_code: "M004",
    affected_transactions_count: 40,
    exposure_amount: 148200,
    status: "ACTIVE",
    detected_at: "14:30:10 IST",
  },
  {
    id: 2,
    incident_code: "INC-8B32E1",
    title: "Card Authorization Testing Attack on TechWorld",
    incident_type: "CARD_TESTING",
    severity: "HIGH",
    merchant_code: "M001",
    affected_transactions_count: 25,
    exposure_amount: 42000,
    status: "ACTIVE",
    detected_at: "14:22:45 IST",
  },
  {
    id: 3,
    incident_code: "INC-7C23D0",
    title: "Device Concentration Burst on FashionHub",
    incident_type: "DEVICE_BURST",
    severity: "MEDIUM",
    merchant_code: "M002",
    affected_transactions_count: 18,
    exposure_amount: 68500,
    status: "RESOLVED",
    detected_at: "13:58:12 IST",
  },
];

export default function Incidents() {
  const [incidents, setIncidents] = useState<IncidentItem[]>(DEFAULT_INCIDENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadIncidents() {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/incidents");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setIncidents(data);
          }
        }
      } catch {
        // Keep default
      } finally {
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  async function resolveIncident(id: number) {
    try {
      await fetch(`http://127.0.0.1:8000/api/incidents/${id}/status?new_status=RESOLVED`, {
        method: "POST",
      });
    } catch {
      // Local update
    }
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" } : inc))
    );
  }

  const activeCount = incidents.filter((i) => i.status === "ACTIVE").length;
  const totalExposure = incidents.reduce((acc, i) => acc + (i.exposure_amount || 0), 0);
  const totalAffected = incidents.reduce((acc, i) => acc + (i.affected_transactions_count || 0), 0);

  return (
    <Shell active="Incidents">
      <SectionHeader number="10" title="Security Incident Timeline & Mitigations" />

      <div className="page-title">Active Incidents & Timeline</div>
      <div className="page-subtitle">
        Real-time detected attack clusters, affected transaction volumes, and response progression
      </div>

      {/* METRICS */}
      <div className="metrics" style={{ marginBottom: 14 }}>
        <Metric
          title="Active Threats"
          value={String(activeCount)}
          change="Real-time incident stream"
          danger={activeCount > 0}
        />
        <Metric
          title="Affected Transactions"
          value={totalAffected.toLocaleString()}
          change="Across all open clusters"
        />
        <Metric
          title="Total Exposure"
          value={`₹${(totalExposure / 100000).toFixed(2)}L`}
          change="Prevented & under review"
          danger
        />
        <Metric
          title="Avg. Containment Time"
          value="12.4s"
          change="Automated mitigation active"
        />
      </div>

      <div className="dashboard-grid">
        {/* INCIDENT LIST */}
        <div className="col-7">
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
                <div className="card-title">Detected Threat Incidents</div>
                <div className="card-subtitle">
                  Automated clusters flagged by velocity spikes, card testing, or device concentration
                </div>
              </div>
              <Link href="/simulator">
                <button className="secondary-button" style={{ fontSize: 8 }}>
                  + Simulate Attack
                </button>
              </Link>
            </div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              {incidents.map((inc) => (
                <div
                  key={inc.id || inc.incident_code}
                  className="risk-item"
                  style={{
                    padding: 12,
                    borderLeft:
                      inc.status === "RESOLVED"
                        ? "3px solid #36e28a"
                        : inc.severity === "CRITICAL"
                        ? "3px solid #ff4d5e"
                        : "3px solid #ffae3d",
                  }}
                >
                  <div className="risk-icon">
                    {inc.status === "RESOLVED" ? "✓" : inc.severity === "CRITICAL" ? "⚡" : "⚠"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 9 }}>{inc.title}</strong>
                      <span style={{ fontSize: 7, color: "#7486a4" }}>({inc.incident_code})</span>
                    </div>
                    <div style={{ fontSize: 7, color: "#687791", marginTop: 2 }}>
                      Merchant: <strong style={{ color: "#a58bff" }}>{inc.merchant_code}</strong> •{" "}
                      Affected: {inc.affected_transactions_count} txns • Exposure: ₹{inc.exposure_amount.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Badge type={inc.severity === "CRITICAL" ? "red" : inc.severity === "HIGH" ? "orange" : "purple"}>
                        {inc.severity}
                      </Badge>
                      <Badge type={inc.status === "RESOLVED" ? "green" : "red"}>
                        {inc.status}
                      </Badge>
                    </div>

                    {inc.status === "ACTIVE" && (
                      <button
                        className="secondary-button"
                        style={{ fontSize: 7, padding: "3px 7px" }}
                        onClick={() => resolveIncident(inc.id)}
                      >
                        Resolve & Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* TIMELINE PROGRESSION */}
        <div className="col-5">
          <Card>
            <div className="card-title">Incident Response Progression</div>
            <div className="card-subtitle">Automated detection and mitigation lifecycle</div>

            <div className="timeline" style={{ marginTop: 14 }}>
              <div className="timeline-item">
                <strong>1. Anomaly Threshold Exceeded</strong>
                <span>14:30:10 — Rolling velocity exceeded 20 txns/5m threshold</span>
              </div>

              <div className="timeline-item">
                <strong>2. Multi-Signal Correlation</strong>
                <span>14:30:22 — Device and amount deviation confirmed attack pattern</span>
              </div>

              <div className="timeline-item">
                <strong>3. Cluster Isolation Formulated</strong>
                <span>14:30:36 — Incident code registered in Neon PostgreSQL</span>
              </div>

              <div className="timeline-item">
                <strong>4. Defensive Intervention</strong>
                <span>14:30:50 — Step-up 3DS challenge and device isolation queued</span>
              </div>

              <div className="timeline-item">
                <strong>5. Continuous Monitoring</strong>
                <span>14:31:20 — Real-time stream monitor active</span>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="card-title">Attack Impact Volume Curve</div>
              <Chart type="area" />
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}