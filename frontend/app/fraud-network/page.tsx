"use client";

import { useState, useEffect } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
} from "@/components/riskpulse";

interface NetworkNode {
  id: string;
  label: string;
  type: "merchant" | "customer" | "device" | "ip";
  risk: string;
  x?: number;
  y?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  risk: string;
}

const DEFAULT_NODES: NetworkNode[] = [
  { id: "M_M004", label: "M004", type: "merchant", risk: "HIGH", x: 380, y: 160 },
  { id: "M_M001", label: "M001", type: "merchant", risk: "LOW", x: 180, y: 80 },
  { id: "C_C084", label: "C084", type: "customer", risk: "HIGH", x: 260, y: 140 },
  { id: "C_C012", label: "C012", type: "customer", risk: "HIGH", x: 450, y: 120 },
  { id: "C_C045", label: "C045", type: "customer", risk: "MEDIUM", x: 160, y: 220 },
  { id: "D_DEV012", label: "DEV012", type: "device", risk: "CRITICAL", x: 340, y: 230 },
  { id: "D_DEV005", label: "DEV005", type: "device", risk: "MEDIUM", x: 200, y: 150 },
  { id: "IP_192_168_1_44", label: "192.168.1.44", type: "ip", risk: "HIGH", x: 460, y: 240 },
  { id: "IP_192_168_1_18", label: "192.168.1.18", type: "ip", risk: "LOW", x: 100, y: 120 },
];

const DEFAULT_LINKS: NetworkLink[] = [
  { source: "C_C084", target: "D_DEV012", risk: "HIGH" },
  { source: "C_C012", target: "D_DEV012", risk: "HIGH" },
  { source: "D_DEV012", target: "IP_192_168_1_44", risk: "HIGH" },
  { source: "C_C084", target: "M_M004", risk: "HIGH" },
  { source: "C_C012", target: "M_M004", risk: "HIGH" },
  { source: "C_C045", target: "D_DEV005", risk: "MEDIUM" },
  { source: "D_DEV005", target: "IP_192_168_1_18", risk: "LOW" },
  { source: "C_C045", target: "M_M001", risk: "LOW" },
  { source: "D_DEV012", target: "M_M004", risk: "HIGH" },
];

export default function FraudNetwork() {
  const [nodes, setNodes] = useState<NetworkNode[]>(DEFAULT_NODES);
  const [links, setLinks] = useState<NetworkLink[]>(DEFAULT_LINKS);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(DEFAULT_NODES[5]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [clusterInfo, setClusterInfo] = useState<any>({
    cluster_id: "#17",
    risk_level: "HIGH RISK",
    total_entities: 9,
    device_count: 2,
    ip_count: 2,
    merchant_count: 2,
  });

  useEffect(() => {
    async function loadGraph() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/network/graph");
        if (res.ok) {
          const data = await res.json();
          if (data && data.nodes && data.nodes.length > 0) {
            // Assign coordinate positions in a distributed circle
            const width = 640;
            const height = 320;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 120;

            const positioned = data.nodes.map((n: NetworkNode, i: number) => {
              const angle = (i / data.nodes.length) * 2 * Math.PI;
              const r = n.type === "device" ? radius * 0.5 : radius * (0.8 + (i % 3) * 0.15);
              return {
                ...n,
                x: Math.round(centerX + r * Math.cos(angle)),
                y: Math.round(centerY + r * Math.sin(angle)),
              };
            });

            setNodes(positioned);
            setLinks(data.links || []);
            setClusterInfo(data.cluster_info);
            setSelectedNode(positioned[0]);
          }
        }
      } catch {
        // Use default
      }
    }
    loadGraph();
  }, []);

  const filteredNodes =
    filterType === "ALL"
      ? nodes
      : nodes.filter((n) => n.type === filterType.toLowerCase());

  return (
    <Shell active="Fraud Network">
      <SectionHeader number="06" title="Fraud Network – Relationship Graph" />

      <div className="page-title">Fraud Network</div>
      <div className="page-subtitle">
        Interactive topology showing shared hardware, IP addresses, and coordinated entity clusters
      </div>

      <div className="dashboard-grid">
        {/* GRAPH CANVAS */}
        <div className="col-9">
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
                <div className="card-title">Entity Relationship Graph</div>
                <div className="card-subtitle">
                  Click on any node to inspect entity fingerprint and connected links
                </div>
              </div>

              {/* FILTER PILLS */}
              <div style={{ display: "flex", gap: 6 }}>
                {["ALL", "DEVICE", "MERCHANT", "CUSTOMER", "IP"].map((f) => (
                  <button
                    key={f}
                    className={filterType === f ? "primary-button" : "secondary-button"}
                    style={{ fontSize: 7, padding: "4px 8px" }}
                    onClick={() => setFilterType(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG GRAPH */}
            <div
              style={{
                height: 340,
                position: "relative",
                background:
                  "radial-gradient(circle at center, rgba(73, 44, 161, 0.15), transparent 60%), #040a16",
                borderRadius: 6,
                border: "1px solid #162438",
                overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 640 320" style={{ width: "100%", height: "100%" }}>
                {/* DRAW LINKS */}
                {links.map((link, idx) => {
                  const src = nodes.find((n) => n.id === link.source);
                  const tgt = nodes.find((n) => n.id === link.target);
                  if (!src || !tgt) return null;

                  const isHigh = link.risk === "HIGH" || link.risk === "CRITICAL";

                  return (
                    <line
                      key={idx}
                      x1={src.x || 100}
                      y1={src.y || 100}
                      x2={tgt.x || 200}
                      y2={tgt.y || 200}
                      stroke={isHigh ? "#ff4d5e" : "#513e9e"}
                      strokeWidth={isHigh ? 1.5 : 1}
                      strokeDasharray={isHigh ? "4 2" : "none"}
                      opacity={isHigh ? 0.75 : 0.4}
                    />
                  );
                })}

                {/* DRAW NODES */}
                {filteredNodes.map((n) => {
                  const isSelected = selectedNode?.id === n.id;
                  const nodeColor =
                    n.type === "device"
                      ? "#ff4d5e"
                      : n.type === "merchant"
                      ? "#9d72ff"
                      : n.type === "customer"
                      ? "#3b8cff"
                      : "#36e28a";

                  return (
                    <g
                      key={n.id}
                      onClick={() => setSelectedNode(n)}
                      style={{ cursor: "pointer" }}
                    >
                      {isSelected && (
                        <circle
                          cx={n.x || 100}
                          cy={n.y || 100}
                          r={18}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth={2}
                          opacity={0.6}
                        />
                      )}
                      <circle
                        cx={n.x || 100}
                        cy={n.y || 100}
                        r={12}
                        fill="#091323"
                        stroke={nodeColor}
                        strokeWidth={2}
                      />
                      <text
                        x={n.x || 100}
                        y={(n.y || 100) + 3}
                        fill="white"
                        fontSize="7"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {n.type === "merchant"
                          ? "M"
                          : n.type === "customer"
                          ? "C"
                          : n.type === "device"
                          ? "D"
                          : "IP"}
                      </text>
                      <text
                        x={n.x || 100}
                        y={(n.y || 100) + 22}
                        fill="#9aaac3"
                        fontSize="7"
                        textAnchor="middle"
                      >
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* LEGEND */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 14,
                fontSize: 8,
                color: "#7486a4",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4d5e" }} />
                Device (Red)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9d72ff" }} />
                Merchant (Purple)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b8cff" }} />
                Customer (Blue)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#36e28a" }} />
                IP Address (Green)
              </span>
            </div>
          </Card>
        </div>

        {/* CLUSTER INFO */}
        <div className="col-3">
          <Card>
            <div className="card-title">Cluster & Node Intelligence</div>
            <div className="card-subtitle">Forensic telemetry for selected entity</div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Cluster Ref</strong>
                  <span>{clusterInfo.cluster_id}</span>
                </div>
                <Badge type="red">{clusterInfo.risk_level}</Badge>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Total Entities</strong>
                  <span>{clusterInfo.total_entities} mapped nodes</span>
                </div>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>Devices Mapped</strong>
                  <span>{clusterInfo.device_count} hardware IDs</span>
                </div>
              </div>

              <div className="risk-item">
                <div style={{ flex: 1 }}>
                  <strong>IP Subnets</strong>
                  <span>{clusterInfo.ip_count} addresses</span>
                </div>
              </div>
            </div>

            {selectedNode && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: "#081324",
                  border: "1px solid #1c2e47",
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: "white" }}>
                  Selected: {selectedNode.label}
                </div>
                <div style={{ fontSize: 8, color: "#8a9ab4", marginTop: 2 }}>
                  Type: {selectedNode.type.toUpperCase()} • Risk: {selectedNode.risk}
                </div>

                <p style={{ fontSize: 7, color: "#6a7b96", marginTop: 8, lineHeight: 1.5 }}>
                  This entity is linked into coordinated transaction sequences. Anomaly signals suggest
                  multi-account usage within tight time windows.
                </p>

                {selectedNode.type === "device" && (
                  <button
                    className="primary-button"
                    style={{ marginTop: 8, width: "100%", fontSize: 8 }}
                    onClick={() => alert(`Device ${selectedNode.label} added to isolation blacklist.`)}
                  >
                    Isolate Device
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}