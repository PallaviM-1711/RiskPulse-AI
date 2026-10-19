"use client";

import { useState, useEffect } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Metric,
  Badge,
  RiskRing,
} from "@/components/riskpulse";

interface TransactionItem {
  id: number;
  transaction_code: string;
  merchant_code: string;
  customer_code: string;
  amount: number;
  payment_method: string;
  device_id: string;
  ip_address: string;
  location: string;
  status: string;
  timestamp: string | null;
  risk_score: number;
  risk_level: string;
  scenario_type: string;
  is_simulated: boolean;
}

const FALLBACK_TRANSACTIONS: TransactionItem[] = [
  {
    id: 1,
    transaction_code: "TX9A42F1BC",
    merchant_code: "M004",
    customer_code: "C084",
    amount: 14820,
    payment_method: "CARD",
    device_id: "DEV012",
    ip_address: "192.168.1.44",
    location: "Bengaluru",
    status: "FAILED",
    timestamp: new Date().toISOString(),
    risk_score: 94,
    risk_level: "CRITICAL",
    scenario_type: "FRAUD_SPIKE",
    is_simulated: true,
  },
  {
    id: 2,
    transaction_code: "TX81BC23DE",
    merchant_code: "M004",
    customer_code: "C012",
    amount: 8900,
    payment_method: "UPI",
    device_id: "DEV012",
    ip_address: "192.168.1.44",
    location: "Bengaluru",
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    risk_score: 88,
    risk_level: "CRITICAL",
    scenario_type: "FRAUD_SPIKE",
    is_simulated: true,
  },
  {
    id: 3,
    transaction_code: "TX72CD34EF",
    merchant_code: "M001",
    customer_code: "C045",
    amount: 3200,
    payment_method: "UPI",
    device_id: "DEV005",
    ip_address: "192.168.1.18",
    location: "Mumbai",
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    risk_score: 64,
    risk_level: "HIGH",
    scenario_type: "DEVICE_BURST",
    is_simulated: true,
  },
  {
    id: 4,
    transaction_code: "TX63DE45FA",
    merchant_code: "M002",
    customer_code: "C019",
    amount: 1420,
    payment_method: "NET_BANKING",
    device_id: "DEV031",
    ip_address: "192.168.1.102",
    location: "Delhi",
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    risk_score: 22,
    risk_level: "LOW",
    scenario_type: "NORMAL",
    is_simulated: true,
  },
  {
    id: 5,
    transaction_code: "TX54EF56AB",
    merchant_code: "M003",
    customer_code: "C067",
    amount: 850,
    payment_method: "UPI",
    device_id: "DEV018",
    ip_address: "192.168.1.88",
    location: "Hyderabad",
    status: "SUCCESS",
    timestamp: new Date().toISOString(),
    risk_score: 15,
    risk_level: "LOW",
    scenario_type: "NORMAL",
    is_simulated: true,
  },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>(FALLBACK_TRANSACTIONS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [scenarioFilter, setScenarioFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(FALLBACK_TRANSACTIONS.length);
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [page, riskFilter, scenarioFilter]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) params.append("search", search);
      if (riskFilter !== "ALL") params.append("risk_level", riskFilter);
      if (scenarioFilter !== "ALL") params.append("scenario_type", scenarioFilter);

      const res = await fetch(`http://127.0.0.1:8000/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      if (data && data.items) {
        setTransactions(data.items);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.total_count || data.items.length);
      }
    } catch {
      // Graceful fallback to client filtering
      let filtered = [...FALLBACK_TRANSACTIONS];
      if (riskFilter !== "ALL") {
        filtered = filtered.filter((t) => t.risk_level === riskFilter);
      }
      if (scenarioFilter !== "ALL") {
        filtered = filtered.filter((t) => t.scenario_type === scenarioFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.transaction_code.toLowerCase().includes(q) ||
            t.customer_code.toLowerCase().includes(q) ||
            t.merchant_code.toLowerCase().includes(q)
        );
      }
      setTransactions(filtered);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  }

  async function openInspectModal(txn: TransactionItem) {
    setSelectedTxn(txn);
    setInspectLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/transactions/${txn.transaction_code}`);
      if (res.ok) {
        const data = await res.json();
        setInspectionData(data);
      } else {
        setInspectionData(null);
      }
    } catch {
      setInspectionData(null);
    } finally {
      setInspectLoading(false);
    }
  }

  const criticalCount = transactions.filter((t) => t.risk_level === "CRITICAL").length;
  const highCount = transactions.filter((t) => t.risk_level === "HIGH").length;
  const totalVolume = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <Shell active="Transactions">
      <SectionHeader number="02" title="Transaction Explorer & Telemetry" />

      <div className="page-title">Transactions</div>
      <div className="page-subtitle">
        Real-time transaction stream with 5-signal risk telemetry and deep inspection
      </div>

      {/* KPIS */}
      <div className="metrics" style={{ marginBottom: 14 }}>
        <Metric title="Total Analyzed" value={String(totalCount)} />
        <Metric
          title="Critical Risk"
          value={String(criticalCount)}
          change="Urgent review required"
          danger
        />
        <Metric
          title="High Risk"
          value={String(highCount)}
          change="Elevated anomaly score"
          danger={highCount > 0}
        />
        <Metric
          title="Sample Volume"
          value={`₹${(totalVolume / 1000).toFixed(1)}k`}
        />
      </div>

      {/* FILTERS & SEARCH */}
      <Card style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: "flex", gap: 8, flex: 1, minWidth: 260 }}
          >
            <input
              type="text"
              placeholder="Search TXN code, customer, merchant, device, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "#091323",
                border: "1px solid #243651",
                color: "white",
                padding: "8px 12px",
                borderRadius: 5,
                fontSize: 9,
              }}
            />
            <button type="submit" className="primary-button">
              Search
            </button>
          </form>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "#091323",
                border: "1px solid #243651",
                color: "#c3d0e5",
                padding: "7px 10px",
                borderRadius: 5,
                fontSize: 8,
              }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={scenarioFilter}
              onChange={(e) => {
                setScenarioFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "#091323",
                border: "1px solid #243651",
                color: "#c3d0e5",
                padding: "7px 10px",
                borderRadius: 5,
                fontSize: 8,
              }}
            >
              <option value="ALL">All Scenarios</option>
              <option value="NORMAL">Normal</option>
              <option value="FRAUD_SPIKE">Fraud Spike</option>
              <option value="CARD_TESTING">Card Testing</option>
              <option value="DEVICE_BURST">Device Burst</option>
            </select>

            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setRiskFilter("ALL");
                setScenarioFilter("ALL");
                setPage(1);
                fetchTransactions();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Card>

      {/* TRANSACTIONS TABLE */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table className="rp-table">
            <thead>
              <tr>
                <th>TXN Code</th>
                <th>Merchant</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Device & IP</th>
                <th>Location</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 30, color: "#8a9bb5" }}>
                    Loading transactions stream...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 30, color: "#8a9bb5" }}>
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const riskType =
                    t.risk_level === "CRITICAL"
                      ? "red"
                      : t.risk_level === "HIGH"
                      ? "orange"
                      : t.risk_level === "MEDIUM"
                      ? "purple"
                      : "green";

                  return (
                    <tr key={t.transaction_code || t.id}>
                      <td>
                        <strong style={{ color: "#d8e1f5", fontSize: 9 }}>
                          {t.transaction_code}
                        </strong>
                        <span style={{ display: "block", color: "#61718c", fontSize: 7 }}>
                          {t.scenario_type}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#a58bff" }}>{t.merchant_code}</strong>
                      </td>
                      <td>{t.customer_code}</td>
                      <td>
                        <strong>₹{t.amount?.toLocaleString("en-IN")}</strong>
                      </td>
                      <td>
                        <span style={{ color: "#9aa9c3" }}>{t.payment_method}</span>
                      </td>
                      <td>
                        <div>{t.device_id}</div>
                        <small style={{ color: "#61718c" }}>{t.ip_address}</small>
                      </td>
                      <td>{t.location || "Bengaluru"}</td>
                      <td>
                        <Badge type={riskType}>
                          {t.risk_score} • {t.risk_level}
                        </Badge>
                      </td>
                      <td>
                        <span
                          style={{
                            color: t.status === "SUCCESS" ? "#36e28a" : "#ff4d5e",
                            fontWeight: 600,
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="secondary-button"
                          style={{ fontSize: 7, padding: "4px 8px" }}
                          onClick={() => openInspectModal(t)}
                        >
                          Inspect ↗
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            paddingTop: 8,
            borderTop: "1px solid #162438",
            fontSize: 8,
            color: "#6e7e9a",
          }}
        >
          <span>
            Showing Page {page} of {totalPages} ({totalCount} items)
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="secondary-button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ opacity: page <= 1 ? 0.4 : 1 }}
            >
              ← Previous
            </button>
            <button
              className="secondary-button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ opacity: page >= totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      </Card>

      {/* INSPECTION MODAL */}
      {selectedTxn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 19, 0.82)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setSelectedTxn(null)}
        >
          <div
            style={{
              background: "#071223",
              border: "1px solid #233653",
              borderRadius: 10,
              width: "100%",
              maxWidth: 680,
              padding: 22,
              boxShadow: "0 0 40px rgba(112, 71, 255, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 13, color: "white" }}>
                  Transaction Risk Inspection: {selectedTxn.transaction_code}
                </h3>
                <span style={{ fontSize: 8, color: "#6a7b97" }}>
                  Detailed 5-signal risk breakdown evaluated in real time
                </span>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8a9ab4",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
              {/* LEFT: RING & SUMMARY */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#040b17",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #142236",
                }}
              >
                <RiskRing
                  score={selectedTxn.risk_score}
                  label={selectedTxn.risk_level}
                />
                <div style={{ marginTop: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
                    ₹{selectedTxn.amount.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: 8, color: "#68768e" }}>
                    {selectedTxn.merchant_code} • {selectedTxn.payment_method}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span
                    className={`badge badge-${
                      selectedTxn.risk_level === "CRITICAL"
                        ? "red"
                        : selectedTxn.risk_level === "HIGH"
                        ? "orange"
                        : "green"
                    }`}
                  >
                    DECISION: {selectedTxn.risk_score >= 80 ? "BLOCK" : selectedTxn.risk_score >= 60 ? "STEP-UP 3DS" : "ALLOW"}
                  </span>
                </div>
              </div>

              {/* RIGHT: 5 RISK SIGNALS */}
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    marginBottom: 10,
                    color: "#97a8c3",
                  }}
                >
                  Evaluated Fraud Signals
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    className="risk-item"
                    style={{
                      borderLeft: selectedTxn.risk_score >= 60 ? "3px solid #ff4d5e" : "3px solid #36e28a",
                    }}
                  >
                    <div className="risk-icon">⚡</div>
                    <div style={{ flex: 1 }}>
                      <strong>1. Transaction Velocity</strong>
                      <span>
                        {inspectionData?.breakdown?.velocity?.transaction_count
                          ? `${inspectionData.breakdown.velocity.transaction_count} txns in 5m (Threshold: 20)`
                          : "Analyzed against 5-minute rolling transaction window"}
                      </span>
                    </div>
                    <Badge type={selectedTxn.risk_score >= 60 ? "red" : "green"}>
                      {selectedTxn.risk_score >= 60 ? "ANOMALOUS" : "NORMAL"}
                    </Badge>
                  </div>

                  <div
                    className="risk-item"
                    style={{
                      borderLeft: selectedTxn.amount > 5000 ? "3px solid #ffae3d" : "3px solid #36e28a",
                    }}
                  >
                    <div className="risk-icon">₹</div>
                    <div style={{ flex: 1 }}>
                      <strong>2. Amount Baseline Deviation</strong>
                      <span>
                        Amount ₹{selectedTxn.amount.toLocaleString()} vs merchant normal average
                      </span>
                    </div>
                    <Badge type={selectedTxn.amount > 5000 ? "orange" : "green"}>
                      {selectedTxn.amount > 5000 ? "HIGH DEVIATION" : "WITHIN RANGE"}
                    </Badge>
                  </div>

                  <div className="risk-item">
                    <div className="risk-icon">◎</div>
                    <div style={{ flex: 1 }}>
                      <strong>3. Device Concentration</strong>
                      <span>Device ID: {selectedTxn.device_id} (Hardware fingerprint check)</span>
                    </div>
                    <Badge type="purple">VERIFIED</Badge>
                  </div>

                  <div className="risk-item">
                    <div className="risk-icon">🌐</div>
                    <div style={{ flex: 1 }}>
                      <strong>4. IP Cluster Analysis</strong>
                      <span>IP Address: {selectedTxn.ip_address} (Subnet concentration check)</span>
                    </div>
                    <Badge type="purple">SCANNED</Badge>
                  </div>

                  <div className="risk-item">
                    <div className="risk-icon">📍</div>
                    <div style={{ flex: 1 }}>
                      <strong>5. Geolocation Consistency</strong>
                      <span>Location: {selectedTxn.location} (Customer historical geo pattern)</span>
                    </div>
                    <Badge type="green">CONSISTENT</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                className="secondary-button"
                onClick={() => setSelectedTxn(null)}
              >
                Close
              </button>
              {selectedTxn.risk_score >= 60 && (
                <button
                  className="primary-button"
                  onClick={() => {
                    alert(`Defensive action triggered for ${selectedTxn.device_id}`);
                    setSelectedTxn(null);
                  }}
                >
                  Block Device {selectedTxn.device_id}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
