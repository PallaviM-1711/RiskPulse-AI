"use client";

import Link from "next/link";
import { ReactNode } from "react";

export const navigation = [
  { name: "Overview", href: "/", icon: "⌂" },
  { name: "Transactions", href: "/transactions", icon: "▣" },
  { name: "Incidents", href: "/incidents", icon: "◉" },
  { name: "Early Warning", href: "/early-warning", icon: "⚡" },
  { name: "Risk Analysis", href: "/risk-analysis", icon: "◫" },
  { name: "Fraud Network", href: "/fraud-network", icon: "◎" },
  { name: "Merchant Baseline", href: "/merchant-baseline", icon: "◈" },
  { name: "AI Analyst", href: "/ai-analyst", icon: "✦" },
  { name: "Simulator", href: "/simulator", icon: "▶" },
  { name: "Defensive Actions", href: "/action-center", icon: "⌁" },
  { name: "Reports", href: "/reports", icon: "▤" },
  { name: "Model Health", href: "/model-health", icon: "◌" },
  { name: "Data Sources", href: "/integrations", icon: "⊕" },
  { name: "Settings", href: "/settings", icon: "⚙" },
];

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`rp-card ${className}`} style={style}>{children}</div>;
}

export function SectionHeader({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="section-header">
      <span className="section-number">{number}</span>
      <span>{title}</span>
    </div>
  );
}

export function Badge({
  children,
  type = "purple",
}: {
  children: ReactNode;
  type?: "purple" | "red" | "green" | "orange" | "blue";
}) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

export function Metric({
  title,
  value,
  change,
  danger = false,
}: {
  title: string;
  value: string;
  change?: string;
  danger?: boolean;
}) {
  return (
    <div className="metric">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>

      {change && (
        <div className={danger ? "metric-change danger" : "metric-change"}>
          {change}
        </div>
      )}
    </div>
  );
}

export function Progress({
  value,
  danger = false,
}: {
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="progress">
      <div
        className={danger ? "progress-value danger-bar" : "progress-value"}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function Chart({ type = "line" }: { type?: "line" | "area" }) {
  return (
    <div className="chart">
      <svg viewBox="0 0 600 190" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rpGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopOpacity="0.28" />
            <stop offset="100%" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={
            type === "area"
              ? "M0 150 L35 145 L65 135 L95 142 L125 120 L155 128 L185 105 L215 115 L245 90 L275 100 L305 76 L335 88 L365 68 L395 78 L425 55 L455 65 L485 45 L515 58 L550 30 L600 40 L600 190 L0 190 Z"
              : "M0 150 L35 145 L65 135 L95 142 L125 120 L155 128 L185 105 L215 115 L245 90 L275 100 L305 76 L335 88 L365 68 L395 78 L425 55 L455 65 L485 45 L515 58 L550 30 L600 40"
          }
          className="chart-line"
        />

        {type === "area" && (
          <path
            d="M0 150 L35 145 L65 135 L95 142 L125 120 L155 128 L185 105 L215 115 L245 90 L275 100 L305 76 L335 88 L365 68 L395 78 L425 55 L455 65 L485 45 L515 58 L550 30 L600 40 L600 190 L0 190 Z"
            className="chart-area"
          />
        )}
      </svg>
    </div>
  );
}

export function RiskRing({
  score = 87,
  label = "HIGH RISK",
}: {
  score?: number;
  label?: string;
}) {
  return (
    <div className="risk-ring">
      <div className="risk-ring-inner">
        <strong>{score}</strong>
        <span>/100</span>
        <small>{label}</small>
      </div>
    </div>
  );
}

export function Sidebar({ active = "Overview" }: { active?: string }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">✦</div>

        <div>
          <div className="brand-name">RiskPulse AI</div>
          <div className="brand-subtitle">FRAUD DEFENSE PLATFORM</div>
        </div>
      </div>

      <nav className="navigation">
        {navigation.map((item) => {
          const isActive = item.name.toLowerCase() === active.toLowerCase();
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="store-card">
        <div className="store-avatar">P</div>

        <div>
          <strong>Prajju</strong>
          <span>Risk Administrator</span>
        </div>

        <span className="store-arrow">⌄</span>
      </div>
    </aside>
  );
}

export function Footer() {
  return (
    <footer className="rp-footer">
      <div className="footer-process">
        <h3>How RiskPulse AI Works</h3>

        <div className="process-row">
          <div>
            <b>01</b>
            <strong>Ingest</strong>
            <span>Collect real-time transaction data</span>
          </div>

          <i>→</i>

          <div>
            <b>02</b>
            <strong>Detect</strong>
            <span>ML models detect abnormal patterns</span>
          </div>

          <i>→</i>

          <div>
            <b>03</b>
            <strong>Analyze</strong>
            <span>AI-driven analysis and graph intelligence</span>
          </div>

          <i>→</i>

          <div>
            <b>04</b>
            <strong>Decide</strong>
            <span>Create an appropriate response</span>
          </div>

          <i>→</i>

          <div>
            <b>05</b>
            <strong>Measure</strong>
            <span>Recommend defensive improvements</span>
          </div>
        </div>
      </div>

      <div className="differentiators">
        <h3>Key Differentiators</h3>

        <div className="check-list">
          <span>✓ Continuous fraud detection</span>
          <span>✓ Merchant-specific baseline learning</span>
          <span>✓ Graph-based coordinated fraud detection</span>
          <span>✓ Cost-aware decisioning</span>
          <span>✓ AI copilot for investigations</span>
          <span>✓ Real-time streaming architecture</span>
        </div>
      </div>

      <div className="defense-box">
        <div className="defense-icon">♢</div>

        <h3>Defense Only by Design</h3>

        <p>
          RiskPulse AI is strictly a defensive system.
          We help merchants detect, prevent and respond to fraud.
          No offensive actions are taken.
        </p>
      </div>
    </footer>
  );
}

export function Shell({
  children,
  active = "Overview",
}: {
  children: ReactNode;
  active?: string;
}) {
  return (
    <div className="riskpulse">
      <Sidebar active={active} />

      <main className="main-content">
        <div className="topbar">
          <div>
            <span>RiskPulse AI / {active}</span>
          </div>

          <div className="topbar-right">
            <span>
              <span className="live-dot" />
              LIVE
            </span>
            <span>14:32:17 IST</span>
            <button onClick={() => window.location.reload()}>↻ Refresh</button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}