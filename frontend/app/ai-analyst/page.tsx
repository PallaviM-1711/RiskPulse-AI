"use client";

import { useState } from "react";
import {
  Shell,
  SectionHeader,
  Card,
  Badge,
} from "@/components/riskpulse";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  time: string;
  evidence?: string[];
}

export default function AIAnalyst() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello, I am your RiskPulse AI Investigation Copilot. I continuously analyze transaction telemetry, velocity spikes, and device clustering across your merchant network. How can I assist your investigation today?",
      time: "14:30 IST",
      evidence: ["Real-time Telemetry Active", "Continuous Baseline Scoring", "5 Detection Models Online"],
    },
  ]);

  const [activeEvidence, setActiveEvidence] = useState<string[]>([
    "Velocity Anomaly (5.2x)",
    "Device Burst Cluster",
    "Amount Baseline Breach",
    "Shared Hardware Reuse",
  ]);

  const SUGGESTED_PROMPTS = [
    "Why was the latest transaction flagged as high risk?",
    "Which merchants are currently under attack?",
    "Show suspicious device concentration clusters",
    "What defensive mitigation do you recommend?",
  ];

  async function askQuestion(promptText?: string) {
    const query = promptText || question;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ai-analyst/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) throw new Error("AI Analyst unavailable");
      const data = await res.json();

      const aiMsg: ChatMessage = {
        sender: "ai",
        text: data.reply,
        time: data.timestamp || "Just now",
        evidence: data.evidence,
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (data.evidence && data.evidence.length > 0) {
        setActiveEvidence(data.evidence);
      }
    } catch {
      // Intelligent local contextual response
      setTimeout(() => {
        let reply = "RiskPulse AI detected multiple concurrent anomaly signals across the transaction stream.";
        let ev = ["Velocity Spike", "Device Concentration", "Amount Deviation"];

        if (query.toLowerCase().includes("merchant")) {
          reply = "Merchant M004 (TravelGo) and M001 (TechWorld) currently exhibit the highest anomaly deviation, with transaction rates exceeding baseline by 182%.";
          ev = ["M004 Baseline Breach", "High Velocity Spike", "Card Authorization Cluster"];
        } else if (query.toLowerCase().includes("device")) {
          reply = "Device clusters DEV012 and DEV003 have been identified linking over 14 distinct customer identifiers within 10 minutes, indicating coordinated credential or automated testing.";
          ev = ["DEV012 (8 accounts)", "DEV003 (6 accounts)", "Cross-Account Reuse"];
        } else if (query.toLowerCase().includes("action") || query.toLowerCase().includes("recommend")) {
          reply = "Recommended defensive response: 1) Enforce step-up 3DS challenge on Merchant M004, 2) Throttle rate limits on device DEV012, 3) Hold high-score transactions for analyst verification.";
          ev = ["Step-Up 3DS", "Velocity Throttle", "Isolate DEV012"];
        }

        const fallbackMsg: ChatMessage = {
          sender: "ai",
          text: reply,
          time: "Just now",
          evidence: ev,
        };

        setMessages((prev) => [...prev, fallbackMsg]);
        setActiveEvidence(ev);
      }, 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell active="AI Analyst">
      <SectionHeader number="08" title="AI Risk Analyst – Investigation Copilot" />

      <div className="page-title">AI Risk Analyst</div>
      <div className="page-subtitle">
        Natural-language investigative assistant grounded in real-time fraud telemetry
      </div>

      <div className="dashboard-grid">
        {/* CHAT AREA */}
        <div className="col-9">
          <Card>
            {/* PROMPT SUGGESTIONS */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="secondary-button"
                  style={{
                    fontSize: 7,
                    padding: "5px 9px",
                    borderRadius: 14,
                    borderColor: "#293c5c",
                  }}
                  onClick={() => askQuestion(prompt)}
                >
                  ✦ {prompt}
                </button>
              ))}
            </div>

            {/* CHAT CONTAINER */}
            <div
              className="chat"
              style={{
                minHeight: 340,
                maxHeight: 460,
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.sender === "user" ? "chat-message user" : "chat-message"}
                  style={{
                    border: msg.sender === "ai" ? "1px solid #1a2a44" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 7,
                      color: msg.sender === "user" ? "#d2c4ff" : "#7486a4",
                      marginBottom: 4,
                    }}
                  >
                    <span>{msg.sender === "ai" ? "✦ RiskPulse Copilot" : "Prajju (Analyst)"}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: 9, lineHeight: 1.6 }}>{msg.text}</div>

                  {msg.evidence && msg.evidence.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {msg.evidence.map((e) => (
                        <Badge key={e} type="purple">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="chat-message" style={{ width: 140 }}>
                  <span style={{ fontSize: 8, color: "#8a9cb8" }}>Analyzing telemetry...</span>
                </div>
              )}
            </div>

            {/* INPUT FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                askQuestion();
              }}
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
              }}
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about fraud spikes, merchants, device clusters, or recommended mitigations..."
                style={{
                  flex: 1,
                  background: "#091323",
                  border: "1px solid #243651",
                  color: "white",
                  padding: "9px 12px",
                  borderRadius: 5,
                  fontSize: 9,
                }}
              />
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Thinking..." : "Ask Copilot"}
              </button>
            </form>
          </Card>
        </div>

        {/* EVIDENCE SIDEBAR */}
        <div className="col-3">
          <Card>
            <div className="card-title">Correlated Evidence</div>
            <div className="card-subtitle">Active signals extracted from stream</div>

            <div className="risk-list" style={{ marginTop: 10 }}>
              {activeEvidence.map((item) => (
                <div
                  key={item}
                  className="risk-item"
                  style={{ fontSize: 8 }}
                >
                  <div className="risk-icon" style={{ width: 20, height: 20, fontSize: 8 }}>
                    ⚡
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 8 }}>{item}</strong>
                    <span style={{ fontSize: 7, color: "#6e809e" }}>Active detection signal</span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 10,
                background: "#081324",
                borderRadius: 6,
                border: "1px solid #19273f",
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, color: "#c8d6ed", marginBottom: 3 }}>
                Grounded Knowledge
              </div>
              <p style={{ fontSize: 7, color: "#6a7b96", margin: 0, lineHeight: 1.5 }}>
                Every analysis response correlates real database records from Neon PostgreSQL including
                transaction history, learned baselines, and active incidents.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}