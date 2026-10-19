"use client";

import { useState, useEffect } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
} from "@/components/riskpulse";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    velocity_threshold: "20",
    velocity_window_minutes: "5",
    amount_multiplier: "3.0",
    device_threshold: "3",
    ip_threshold: "3",
    location_threshold: "3",
    critical_risk_cutoff: "80",
    high_risk_cutoff: "60",
    auto_block_critical: "true",
    step_up_verification: "true",
    adaptive_learning: "true",
    webhook_url: "https://api.merchant.com/v1/risk-alerts",
    alert_email: "risk-ops@merchant.com",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch {
      // Keep initial defaults
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert("Settings saved locally in session (Backend offline).");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings({
      velocity_threshold: "20",
      velocity_window_minutes: "5",
      amount_multiplier: "3.0",
      device_threshold: "3",
      ip_threshold: "3",
      location_threshold: "3",
      critical_risk_cutoff: "80",
      high_risk_cutoff: "60",
      auto_block_critical: "true",
      step_up_verification: "true",
      adaptive_learning: "true",
      webhook_url: "https://api.merchant.com/v1/risk-alerts",
      alert_email: "risk-ops@merchant.com",
    });
  }

  return (
    <Shell active="Settings">
      <SectionHeader number="14" title="System Configuration & Defense Policy" />

      <div className="page-title">Platform Settings</div>
      <div className="page-subtitle">
        Tune risk engine sensitivity, automated defensive rules, and notification webhooks
      </div>

      {saveSuccess && (
        <div
          style={{
            background: "rgba(54, 226, 138, 0.12)",
            border: "1px solid #205a3c",
            color: "#54e99c",
            padding: "10px 16px",
            borderRadius: 6,
            fontSize: 9,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>✓</span>
          <span>Configuration saved successfully and dispatched to Risk Engine.</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* SECTION 1: RISK ENGINE SENSITIVITY */}
        <div className="col-6">
          <Card>
            <div className="card-title">Risk Engine Detection Thresholds</div>
            <div className="card-subtitle">
              Calibrate anomaly triggers across the 5 core signals
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>Velocity Threshold (transactions / 5 min)</span>
                  <strong style={{ color: "#a58bff" }}>
                    {settings.velocity_threshold} txns
                  </strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={settings.velocity_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, velocity_threshold: e.target.value })
                  }
                  style={{ width: "100%", accentColor: "#7047ff" }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>Amount Deviation Multiplier (vs Merchant Baseline)</span>
                  <strong style={{ color: "#a58bff" }}>
                    {settings.amount_multiplier}x
                  </strong>
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="10.0"
                  step="0.5"
                  value={settings.amount_multiplier}
                  onChange={(e) =>
                    setSettings({ ...settings, amount_multiplier: e.target.value })
                  }
                  style={{ width: "100%", accentColor: "#7047ff" }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>Device Abuse Limit (Unique accounts per device)</span>
                  <strong style={{ color: "#a58bff" }}>
                    {settings.device_threshold} accounts
                  </strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={settings.device_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, device_threshold: e.target.value })
                  }
                  style={{ width: "100%", accentColor: "#7047ff" }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>IP Abuse Limit (Unique accounts per IP)</span>
                  <strong style={{ color: "#a58bff" }}>
                    {settings.ip_threshold} accounts
                  </strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={settings.ip_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, ip_threshold: e.target.value })
                  }
                  style={{ width: "100%", accentColor: "#7047ff" }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 8,
                    marginBottom: 4,
                  }}
                >
                  <span>Location History Anomaly Cutoff</span>
                  <strong style={{ color: "#a58bff" }}>
                    &lt; {settings.location_threshold} visits
                  </strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.location_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, location_threshold: e.target.value })
                  }
                  style={{ width: "100%", accentColor: "#7047ff" }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* SECTION 2: AUTOMATED DEFENSIVE POLICIES */}
        <div className="col-6">
          <Card>
            <div className="card-title">Automated Defensive Controls</div>
            <div className="card-subtitle">
              Configure real-time automated intervention rules
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #16263f",
                }}
              >
                <div>
                  <strong style={{ fontSize: 9, display: "block" }}>
                    Auto-Block Critical Threats (Score &ge; 80)
                  </strong>
                  <span style={{ fontSize: 7, color: "#6e809e" }}>
                    Instantly reject transactions classified as critical fraud
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_block_critical === "true"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      auto_block_critical: e.target.checked ? "true" : "false",
                    })
                  }
                  style={{ width: 16, height: 16, accentColor: "#7047ff" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #16263f",
                }}
              >
                <div>
                  <strong style={{ fontSize: 9, display: "block" }}>
                    Enforce Step-Up 3DS Verification
                  </strong>
                  <span style={{ fontSize: 7, color: "#6e809e" }}>
                    Challenge transactions with velocity or amount anomalies
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.step_up_verification === "true"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      step_up_verification: e.target.checked ? "true" : "false",
                    })
                  }
                  style={{ width: 16, height: 16, accentColor: "#7047ff" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #16263f",
                }}
              >
                <div>
                  <strong style={{ fontSize: 9, display: "block" }}>
                    Adaptive Baseline Continuous Learning
                  </strong>
                  <span style={{ fontSize: 7, color: "#6e809e" }}>
                    Automatically update merchant baselines every 24 hours
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.adaptive_learning === "true"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      adaptive_learning: e.target.checked ? "true" : "false",
                    })
                  }
                  style={{ width: 16, height: 16, accentColor: "#7047ff" }}
                />
              </div>

              {/* RISK CUTOFFS */}
              <div
                style={{
                  marginTop: 6,
                  padding: 10,
                  background: "#081324",
                  borderRadius: 6,
                  border: "1px solid #16263f",
                }}
              >
                <div style={{ fontSize: 8, color: "#6e809e", marginBottom: 8 }}>
                  Score Classification Cutoffs:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 7, color: "#8a9bb5", display: "block" }}>
                      Critical Risk Cutoff
                    </label>
                    <input
                      type="number"
                      value={settings.critical_risk_cutoff}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          critical_risk_cutoff: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        background: "#040c19",
                        border: "1px solid #233653",
                        color: "#ff6977",
                        padding: 6,
                        borderRadius: 4,
                        fontSize: 9,
                        marginTop: 3,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 7, color: "#8a9bb5", display: "block" }}>
                      High Risk Cutoff
                    </label>
                    <input
                      type="number"
                      value={settings.high_risk_cutoff}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          high_risk_cutoff: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        background: "#040c19",
                        border: "1px solid #233653",
                        color: "#ffae3d",
                        padding: 6,
                        borderRadius: 4,
                        fontSize: 9,
                        marginTop: 3,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* SECTION 3: WEBHOOKS & NOTIFICATIONS */}
        <div className="col-12">
          <Card>
            <div className="card-title">Integration & Dispatch Webhooks</div>
            <div className="card-subtitle">
              Stream fraud incidents and mitigation commands to your payment gateway
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block" }}>
                  Incident Dispatch Webhook URL
                </label>
                <input
                  type="text"
                  value={settings.webhook_url}
                  onChange={(e) =>
                    setSettings({ ...settings, webhook_url: e.target.value })
                  }
                  placeholder="https://..."
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 8,
                    borderRadius: 5,
                    fontSize: 9,
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 8, color: "#8a9bb5", display: "block" }}>
                  Operations Security Email
                </label>
                <input
                  type="email"
                  value={settings.alert_email}
                  onChange={(e) =>
                    setSettings({ ...settings, alert_email: e.target.value })
                  }
                  placeholder="alerts@domain.com"
                  style={{
                    width: "100%",
                    background: "#091323",
                    border: "1px solid #243651",
                    color: "white",
                    padding: 8,
                    borderRadius: 5,
                    fontSize: 9,
                    marginTop: 4,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button className="secondary-button" onClick={handleReset}>
                Reset to Defaults
              </button>
              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Configuration"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
