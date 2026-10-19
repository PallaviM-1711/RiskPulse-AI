"use client";

import { useState } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
  Metric,
} from "@/components/riskpulse";

export default function Reports() {
  const [reportType, setReportType] = useState("FRAUD_SUMMARY");
  const [dateRange, setDateRange] = useState("LAST_7_DAYS");
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  async function handleGenerateReport(type: string = reportType) {
    setGenerating(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/generate?report_type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        throw new Error("Report generation failed");
      }
    } catch {
      // Local fallback report
      setReportData({
        report_id: `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        report_type: type,
        generated_at: new Date().toISOString(),
        summary: {
          total_transactions_audited: 226,
          flagged_transactions: 48,
          blocked_value_inr: 284000,
          incidents_recorded: 3,
          prevention_rate: "21.2%",
        },
        flagged_sample: [
          { code: "TX9A42F1BC", merchant: "M004", amount: 14820, risk_score: 94, risk_level: "CRITICAL", scenario: "FRAUD_SPIKE" },
          { code: "TX81BC23DE", merchant: "M004", amount: 8900, risk_score: 88, risk_level: "CRITICAL", scenario: "FRAUD_SPIKE" },
          { code: "TX72CD34EF", merchant: "M001", amount: 3200, risk_score: 64, risk_level: "HIGH", scenario: "DEVICE_BURST" },
        ],
      });
    } finally {
      setGenerating(false);
    }
  }

  function downloadCSV() {
    if (!reportData) return;
    const rows = [
      ["Transaction Code", "Merchant", "Amount", "Risk Score", "Risk Level", "Scenario"],
      ...(reportData.flagged_sample || []).map((t: any) => [
        t.code,
        t.merchant,
        t.amount,
        t.risk_score,
        t.risk_level,
        t.scenario,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.report_id || "riskpulse_report"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadJSON() {
    if (!reportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${reportData.report_id || "riskpulse_report"}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Shell active="Reports">
      <SectionHeader number="12" title="Reports & Risk Telemetry Analytics" />

      <div className="page-title">Reports & Analytics</div>
      <div className="page-subtitle">
        Generate, inspect, and export executive fraud summaries and loss prevention audits
      </div>

      {/* REPORT TYPE CARDS */}
      <div className="dashboard-grid" style={{ marginBottom: 14 }}>
        {[
          { id: "FRAUD_SUMMARY", title: "Fraud Summary Report", subtitle: "Comprehensive overview of detected spikes and attacks" },
          { id: "LOSS_PREVENTION", title: "Loss Prevention Audit", subtitle: "Financial impact, saved revenue and containment metrics" },
          { id: "INCIDENT_CHRONOLOGY", title: "Incident Chronology", subtitle: "Forensic log of root-cause anomaly discoveries" },
          { id: "DEVICE_INTELLIGENCE", title: "Device Fingerprint Report", subtitle: "Hardware cluster concentration and cross-account reuse" },
        ].map((rep) => (
          <div className="col-3" key={rep.id}>
            <Card>
              <div style={{ fontSize: 24, color: "#8061ff", marginBottom: 8 }}>▤</div>
              <div className="card-title">{rep.title}</div>
              <div className="card-subtitle">{rep.subtitle}</div>
              <button
                className="secondary-button"
                style={{ width: "100%", marginTop: 6 }}
                onClick={() => {
                  setReportType(rep.id);
                  handleGenerateReport(rep.id);
                }}
              >
                Generate →
              </button>
            </Card>
          </div>
        ))}
      </div>

      {/* CUSTOM GENERATOR & RECENT */}
      <div className="dashboard-grid">
        <div className="col-7">
          <Card>
            <div className="card-title">Custom Report Configurator</div>
            <div className="card-subtitle">Configure filter parameters and compile audit data</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block", marginBottom: 4 }}>
                  Report Domain
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
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
                  <option value="FRAUD_SUMMARY">Fraud Summary Audit</option>
                  <option value="LOSS_PREVENTION">Loss Prevention Metrics</option>
                  <option value="INCIDENT_CHRONOLOGY">Incident Chronology</option>
                  <option value="DEVICE_INTELLIGENCE">Device Intelligence</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block", marginBottom: 4 }}>
                  Time Window
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
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
                  <option value="LAST_24_HOURS">Last 24 Hours</option>
                  <option value="LAST_7_DAYS">Last 7 Days</option>
                  <option value="LAST_30_DAYS">Last 30 Days</option>
                  <option value="ALL_TIME">Complete Historical Stream</option>
                </select>
              </div>
            </div>

            <button
              className="primary-button"
              style={{ marginTop: 16 }}
              onClick={() => handleGenerateReport()}
              disabled={generating}
            >
              {generating ? "Compiling Audit Data..." : "Compile & View Report"}
            </button>
          </Card>
        </div>

        <div className="col-5">
          <Card>
            <div className="card-title">Archive & Past Reports</div>
            <div className="card-subtitle">Previously compiled compliance reports</div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Fraud Summary Audit</strong>
                  <span>Compiled 14 May 2026 • 240KB</span>
                </div>
                <Badge type="blue">PDF / CSV</Badge>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Merchant Baseline Drift</strong>
                  <span>Compiled 12 May 2026 • 180KB</span>
                </div>
                <Badge type="blue">PDF / CSV</Badge>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Incident Root Cause #17</strong>
                  <span>Compiled 10 May 2026 • 310KB</span>
                </div>
                <Badge type="blue">PDF / CSV</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* REPORT PREVIEW MODAL / SECTION */}
        {reportData && (
          <div className="col-12" style={{ marginTop: 10 }}>
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div className="card-title">
                    Report Preview: {reportData.report_id} ({reportData.report_type})
                  </div>
                  <div className="card-subtitle">Compiled at {reportData.generated_at}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="secondary-button" onClick={downloadCSV}>
                    ⬇ Export CSV
                  </button>
                  <button className="primary-button" onClick={downloadJSON}>
                    ⬇ Export JSON
                  </button>
                </div>
              </div>

              {/* KPI PREVIEW */}
              <div className="metrics" style={{ marginBottom: 14 }}>
                <Metric
                  title="Audited Volume"
                  value={String(reportData.summary.total_transactions_audited)}
                />
                <Metric
                  title="Flagged Anomalies"
                  value={String(reportData.summary.flagged_transactions)}
                  danger
                />
                <Metric
                  title="Blocked Value"
                  value={`₹${reportData.summary.blocked_value_inr.toLocaleString()}`}
                />
                <Metric
                  title="Prevention Ratio"
                  value={reportData.summary.prevention_rate}
                />
              </div>

              {/* SAMPLE TABLE */}
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>TXN Code</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Scenario</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.flagged_sample || []).map((s: any) => (
                    <tr key={s.code}>
                      <td><strong>{s.code}</strong></td>
                      <td><span style={{ color: "#a58bff" }}>{s.merchant}</span></td>
                      <td>₹{s.amount.toLocaleString()}</td>
                      <td>{s.risk_score}</td>
                      <td>
                        <Badge type={s.risk_level === "CRITICAL" ? "red" : "orange"}>
                          {s.risk_level}
                        </Badge>
                      </td>
                      <td>{s.scenario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  );
}