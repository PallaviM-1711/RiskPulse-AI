"use client";

import { useState, useEffect } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
  Metric,
} from "@/components/riskpulse";

interface ActionItem {
  id: number;
  action_type: string;
  target_type: string;
  target_value: string;
  reason: string;
  severity: string;
  status: string;
  created_at: string;
}

const DEFAULT_ACTIONS: ActionItem[] = [
  {
    id: 1,
    action_type: "STEP_UP_AUTH",
    target_type: "MERCHANT",
    target_value: "M004",
    reason: "High transaction velocity spike exceeding baseline by 182%",
    severity: "HIGH",
    status: "PENDING",
    created_at: "2 min ago",
  },
  {
    id: 2,
    action_type: "BLOCK_DEVICE",
    target_type: "DEVICE",
    target_value: "DEV003",
    reason: "Shared device detected across 8 unique customer accounts in 5 minutes",
    severity: "CRITICAL",
    status: "PENDING",
    created_at: "8 min ago",
  },
  {
    id: 3,
    action_type: "RATE_LIMIT",
    target_type: "IP",
    target_value: "192.168.1.14",
    reason: "Rapid card authorization burst from single subnet",
    severity: "MEDIUM",
    status: "PENDING",
    created_at: "14 min ago",
  },
  {
    id: 4,
    action_type: "FLAG_CUSTOMER",
    target_type: "CUSTOMER",
    target_value: "C084",
    reason: "High risk score transaction sequence during fraud spike",
    severity: "HIGH",
    status: "APPLIED",
    created_at: "25 min ago",
  },
];

export default function ActionCenter() {
  const [actions, setActions] = useState<ActionItem[]>(DEFAULT_ACTIONS);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadActions() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/actions");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setActions(data);
          }
        }
      } catch {
        // Keep default
      }
    }
    loadActions();
  }, []);

  async function handleDecision(id: number, decision: "APPROVE" | "DISMISS") {
    try {
      await fetch("http://127.0.0.1:8000/api/actions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_id: id, decision }),
      });
    } catch {
      // Local update
    }

    setActions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: decision === "APPROVE" ? "APPLIED" : "DISMISSED" } : a
      )
    );

    const action = actions.find((a) => a.id === id);
    setFeedback(
      decision === "APPROVE"
        ? `Defensive action "${action?.action_type}" applied to ${action?.target_type} ${action?.target_value}.`
        : `Action proposal for ${action?.target_value} was dismissed.`
    );

    setTimeout(() => setFeedback(null), 3500);
  }

  const pendingCount = actions.filter((a) => a.status === "PENDING").length;
  const appliedCount = actions.filter((a) => a.status === "APPLIED").length;

  return (
    <Shell active="Defensive Actions">
      <SectionHeader number="05" title="Defensive Action & Mitigation Center" />

      <div className="page-title">Defensive Action Center</div>
      <div className="page-subtitle">
        Review, approve and execute automated mitigations to neutralize ongoing fraud attacks
      </div>

      {feedback && (
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
          ✓ {feedback}
        </div>
      )}

      {/* METRICS */}
      <div className="metrics" style={{ marginBottom: 14 }}>
        <Metric
          title="Pending Approval"
          value={String(pendingCount)}
          change="Requires analyst decision"
          danger={pendingCount > 0}
        />
        <Metric
          title="Active Defenses"
          value={String(appliedCount)}
          change="Currently enforced rules"
        />
        <Metric
          title="Defense Mode"
          value="Defensive Only"
          change="Strictly prevents fraud"
        />
        <Metric
          title="Response Latency"
          value="Real-Time"
          change="Zero-downtime rule dispatch"
        />
      </div>

      <div className="dashboard-grid">
        {/* ACTIONS LIST */}
        <div className="col-8">
          <Card>
            <div className="card-title">Mitigation Proposals</div>
            <div className="card-subtitle">
              Engine-generated defensive responses awaiting operator signoff
            </div>

            <div className="risk-list" style={{ marginTop: 12 }}>
              {actions.map((act) => {
                const isPending = act.status === "PENDING";
                const isApplied = act.status === "APPLIED";

                return (
                  <div
                    key={act.id}
                    className="risk-item"
                    style={{
                      padding: 14,
                      borderLeft: isApplied
                        ? "3px solid #36e28a"
                        : act.severity === "CRITICAL"
                        ? "3px solid #ff4d5e"
                        : "3px solid #ffae3d",
                    }}
                  >
                    <div className="risk-icon">
                      {act.action_type === "BLOCK_DEVICE"
                        ? "🚫"
                        : act.action_type === "STEP_UP_AUTH"
                        ? "🔐"
                        : act.action_type === "RATE_LIMIT"
                        ? "⏱"
                        : "🚩"}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 9 }}>
                          {act.action_type.replace(/_/g, " ")}: {act.target_value}
                        </strong>
                        <Badge
                          type={act.severity === "CRITICAL" ? "red" : act.severity === "HIGH" ? "orange" : "purple"}
                        >
                          {act.severity}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 8, color: "#8a9ab4", marginTop: 3 }}>
                        {act.reason}
                      </div>

                      <div style={{ fontSize: 7, color: "#61718c", marginTop: 2 }}>
                        Target: {act.target_type} • Created: {act.created_at}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {isPending ? (
                        <>
                          <button
                            className="secondary-button"
                            style={{ fontSize: 8 }}
                            onClick={() => handleDecision(act.id, "DISMISS")}
                          >
                            Dismiss
                          </button>
                          <button
                            className="primary-button"
                            style={{ fontSize: 8 }}
                            onClick={() => handleDecision(act.id, "APPROVE")}
                          >
                            Approve & Enforce
                          </button>
                        </>
                      ) : (
                        <Badge type={isApplied ? "green" : "purple"}>
                          {act.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* DEFENSIVE POLICY OVERVIEW */}
        <div className="col-4">
          <Card>
            <div className="card-title">Defensive Policy Rules</div>
            <div className="card-subtitle">Active mitigation protocols</div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Device Fingerprint Blacklist</strong>
                  <span>Automated block on repeated fraud credentials</span>
                </div>
                <Badge type="green">ENFORCED</Badge>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Velocity Rate Throttling</strong>
                  <span>Caps transactions per IP / merchant during bursts</span>
                </div>
                <Badge type="green">ENFORCED</Badge>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Step-Up 3DS Challenge</strong>
                  <span>Mandates OTP when risk score exceeds 60</span>
                </div>
                <Badge type="green">ENFORCED</Badge>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 12,
                background: "#081324",
                border: "1px solid #1a2a44",
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: "white" }}>
                Defense Only by Design
              </div>
              <p style={{ fontSize: 7, color: "#6a7c98", marginTop: 4, lineHeight: 1.5 }}>
                RiskPulse AI only executes protective containment: blocking malicious devices, enforcing step-up
                authentication, and ratelimiting abusive traffic. No offensive action is ever deployed.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}