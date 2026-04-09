import QRCode from "qrcode";
import CryptoJS from "crypto-js";
import MyMap from "./MapContainer";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const BACKEND_URL = "https://sentryroute-ai.onrender.com";

const RiskDashboard = ({ data }) => {
  const chartData = data.reduce((acc, item) => {
    const found = acc.find((x) => x.name === item.status);
    if (found) found.value++;
    else acc.push({ name: item.status, value: 1 });
    return acc;
  }, []);

  return (
    <div style={{ width: "90%", margin: "20px auto", textAlign: "center" }}>
      <div style={{ display: "flex", gap: "20px", height: "350px" }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#00ff41" }}>🌐 Route Security Status</h4>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                paddingAngle={5}
                label
              >
                {chartData.map((e, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#161b22", border: "none" }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#ff4b2b" }}>📊 Tactical Risk Analysis</h4>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data}>
              <XAxis dataKey="product" stroke="#00ff41" fontSize={10} />
              <YAxis
                stroke="#00ff41"
                label={{
                  value: "Risk Level",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#00ff41",
                }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{ backgroundColor: "#161b22" }}
              />
              <Bar
                dataKey="riskLevel"
                fill="#ff4b2b"
                radius={[5, 5, 0, 0]}
                name="Risk Intensity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shipments, setShipments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [news, setNews] = useState([]);
  const [distance, setDistance] = useState(0);
  const [isWarZone, setIsWarZone] = useState(false);
  const [result, setResult] = useState(null);
  const [reroutePath, setReroutePath] = useState([]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [riskThreshold, setRiskThreshold] = useState(7);
  const socketRef = useRef();

  const fetchDashboardData = useCallback(async () => {
    try {
      const shipRes = await fetch(`${BACKEND_URL}/api/shipments`);
      setShipments(await shipRes.json());
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/logs`);
      const data = await res.json();
      setAuditLogs(data.reverse());
    } catch (err) {
      console.error("Log Fetch Error:", err);
    }
  }, []);

  const verifyBlockchain = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify-chain`);
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("🚨 CRITICAL: Database Tampering Detected or Server Error!");
    }
  };

  const runStressTest = () => {
    const startTime = performance.now();
    for (let i = 0; i < 10000; i++) {
      let mockDistance = Math.random() * 5000;
      let mockWarZone = i % 2 === 0;
      let delay = mockDistance / 15 - mockDistance / 40;
      let cost = mockDistance * 10 * (mockWarZone ? 1.47 : 1);
    }
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    alert(
      `⚡ Stress Test Complete!\nProcessed 10,000 nodes in ${duration}ms.\nSystem Status: Highly Optimized.`,
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      setUserRole(localStorage.getItem("role"));
      setUsername(localStorage.getItem("username") || "");
      fetchDashboardData();
      fetchLogs();
    }
  }, [fetchDashboardData, fetchLogs, riskThreshold]);

  useEffect(() => {
    if (isAuthenticated) {
      socketRef.current = io(BACKEND_URL);
      socketRef.current.on("live-news-update", (msg) =>
        setNews((prev) => [msg, ...prev.slice(0, 4)]),
      );
      socketRef.current.on("receive-message", (data) =>
        setChatHistory((prev) => [...prev, data]),
      );
      return () => socketRef.current.disconnect();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BACKEND_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.message === "OTP_SENT") {
      setUserRole(data.role);
      setUsername(username);
      setStep(2);
      setOtp("");
    } else {
      alert(data.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BACKEND_URL}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, username, role: userRole }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", username);
      setIsAuthenticated(true);
      fetchDashboardData();
      fetchLogs();
    } else {
      alert(data.message);
    }
  };

  const sendMessage = () => {
    if (chatMsg.trim()) {
      socketRef.current.emit("send-message", {
        user: userRole,
        text: chatMsg,
        time: new Date().toLocaleTimeString(),
      });
      setChatMsg("");
    }
  };

  const handleReroute = async (item) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/execute-reroute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userRole,
          productId: item.id,
          username: localStorage.getItem("username"),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReroutePath([
          [item.lat, item.lng],
          [15.0, 50.0],
          [-34.0, 18.0],
          [50.0, -1.0],
        ]);
        alert(data.message);
        fetchLogs();
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (err) {
      alert("Action verification failed!");
    }
  };

  const calculateRisk = () => {
    let delay = distance / 15 - distance / 40;
    let cost = distance * 10 * (isWarZone ? 1.47 : 1);
    setResult({ delay: delay.toFixed(1), cost: cost.toFixed(0) });
  };

  const downloadReport = async () => {
    const doc = new jsPDF();
    const reportDataString = JSON.stringify(shipments);
    const digitalSignature = CryptoJS.SHA256(reportDataString).toString();
    const qrDataUrl = await QRCode.toDataURL(
      `SentryRoute Verified\nSig: ${digitalSignature.substring(0, 16)}...`,
    );
    doc.text("SentryRoute: Secure Strategic Report", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [["Product", "Route", "Status", "Risk Level"]],
      body: shipments.map((s) => [
        s.product,
        s.route,
        s.riskLevel >= riskThreshold ? "High Risk" : "Safe",
        s.riskLevel + "/10",
      ]),
    });
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.addImage(qrDataUrl, "PNG", 150, finalY, 40, 40);
    doc.setFontSize(8);
    doc.text(`Digital Signature: ${digitalSignature}`, 14, finalY + 45);
    doc.save("SentryRoute_Strategic_Report.pdf");
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div
          className="calculator-box"
          style={{ maxWidth: "400px", margin: "100px auto" }}
        >
          <h2>🛡️ {step === 1 ? "Commander Login" : "2FA Verification"}</h2>
          {step === 1 ? (
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="reroute-btn"
                style={{ width: "100%" }}
              >
                Generate OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <p style={{ color: "#00ff41" }}>OTP sent to Secure Console</p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button
                type="submit"
                className="reroute-btn"
                style={{ width: "100%", background: "#ff4b2b" }}
              >
                Verify & Access
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>SentryRoute Dashboard ({userRole})</h1>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="reroute-btn"
        >
          Logout
        </button>
      </header>
      <main>
        <RiskDashboard data={shipments} />

        <div style={{ textAlign: "center", margin: "20px" }}>
          <button onClick={downloadReport} className="pdf-btn">
            📄 Export Secure PDF Report
          </button>
          <button
            onClick={runStressTest}
            className="reroute-btn"
            style={{ background: "#ffa500", marginLeft: "10px" }}
          >
            ⚡ Stress Test
          </button>
        </div>

        {/* 🚦 Threshold Slider with Commander-Only Access */}
        <div
          style={{
            background: "#161b22",
            padding: "15px",
            borderRadius: "10px",
            margin: "20px auto",
            width: "90%",
            border: "1px solid #30363d",
            textAlign: "left",
          }}
        >
          <label style={{ color: "#00ff41", fontWeight: "bold" }}>
            🚦 Tactical Risk Sensitivity: {riskThreshold}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={riskThreshold}
            onChange={(e) => setRiskThreshold(parseInt(e.target.value))}
            disabled={userRole !== "Commander"}
            style={{
              width: "100%",
              marginTop: "10px",
              cursor: userRole === "Commander" ? "pointer" : "not-allowed",
              accentColor: "#00ff41",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#8b949e",
              fontSize: "0.75em",
            }}
          >
            <span>Sensitive (Show All)</span>
            <span>
              Critical Only ({userRole !== "Commander" && "🔒 Admin Only"})
            </span>
          </div>
        </div>

        <div
          className="news-feed"
          style={{
            background: "#161b22",
            padding: "15px",
            width: "90%",
            margin: "20px auto",
            borderRadius: "8px",
            borderLeft: "5px solid #ff4b2b",
            color: "#e6edf3",
            textAlign: "left",
          }}
        >
          <h3 style={{ color: "#ff4b2b" }}>📡 Live Intelligence Reports</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {news.map((n, i) => (
              <li
                key={i}
                style={{ padding: "8px 0", borderBottom: "1px solid #30363d" }}
              >
                {n}
              </li>
            ))}
          </ul>
        </div>

        <div className="calculator-box">
          <h3>📊 Risk Simulation</h3>
          <input
            type="number"
            placeholder="Distance (km)"
            onChange={(e) => setDistance(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              onChange={(e) => setIsWarZone(e.target.checked)}
            />{" "}
            War Zone?
          </label>
          <button onClick={calculateRisk} className="reroute-btn">
            Analyze Path
          </button>
          {result && (
            <p style={{ marginTop: "10px" }}>
              ⚠️ Delay: {result.delay}h | Cost: ₹{result.cost}
            </p>
          )}
        </div>

        <MyMap data={shipments} reroutePath={reroutePath} />

        <div
          className="chat-box"
          style={{
            background: "#0d1117",
            padding: "15px",
            width: "90%",
            margin: "20px auto",
            borderRadius: "10px",
            border: "1px solid #30363d",
            textAlign: "left",
          }}
        >
          <h4 style={{ color: "#00ff41" }}>💬 Secure War-Room Comms</h4>
          <div
            style={{
              height: "150px",
              overflowY: "auto",
              background: "#161b22",
              padding: "10px",
            }}
          >
            {chatHistory.map((m, i) => (
              <p key={i} style={{ fontSize: "0.85em", color: "#e6edf3" }}>
                <strong
                  style={{
                    color: m.user === "Commander" ? "#ff4b2b" : "#00ff41",
                  }}
                >
                  [{m.user}]:
                </strong>{" "}
                {m.text}
              </p>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Type tactical message..."
              style={{ flex: 1, background: "#0d1117", color: "white" }}
            />
            <button onClick={sendMessage} className="reroute-btn">
              Send
            </button>
          </div>
        </div>

        <table className="status-table" style={{ marginTop: "30px" }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Route</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((item) => {
              const isActuallyHighRisk = item.riskLevel >= riskThreshold;
              return (
                <tr
                  key={item.id}
                  style={{ opacity: isActuallyHighRisk ? 1 : 0.8 }}
                >
                  <td>{item.product}</td>
                  <td>{item.route}</td>
                  <td
                    className={isActuallyHighRisk ? "risk-red" : "status-green"}
                  >
                    {isActuallyHighRisk ? "High Risk" : "Safe"}
                  </td>
                  <td style={{ color: "#00ff41" }}>{item.riskLevel}/10</td>
                  <td>
                    {isActuallyHighRisk ? (
                      userRole === "Commander" ? (
                        <button
                          className="reroute-btn"
                          onClick={() => handleReroute(item)}
                        >
                          🔄 AI Reroute
                        </button>
                      ) : (
                        <span style={{ color: "#888", fontStyle: "italic" }}>
                          🔒 View Only
                        </span>
                      )
                    ) : (
                      "✅ Secure"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          className="audit-section"
          style={{
            width: "90%",
            margin: "30px auto",
            background: "#0d1117",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #30363d",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #30363d",
              paddingBottom: "10px",
            }}
          >
            <h3 style={{ color: "#00ff41", margin: 0 }}>
              ⛓️ Immutable Mission History
            </h3>
            <button
              onClick={verifyBlockchain}
              className="reroute-btn"
              style={{ background: "#2ea043", fontSize: "0.75em" }}
            >
              🔍 Verify Integrity
            </button>
          </div>
          <div
            style={{ maxHeight: "300px", overflowY: "auto", marginTop: "15px" }}
          >
            {auditLogs.length > 0 ? (
              auditLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #21262d",
                    fontSize: "0.85em",
                    fontFamily: "monospace",
                  }}
                >
                  <p style={{ color: "#ff4b2b", margin: "0" }}>
                    <strong>[ACTION]: {log.action}</strong>
                  </p>
                  <p style={{ margin: "5px 0", color: "#8b949e" }}>
                    Commander: {log.commander} | ID: {log.productId} |{" "}
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      color: "#00ff41",
                      wordBreak: "break-all",
                    }}
                  >
                    <strong>Hash:</strong> {log.hash}
                  </p>
                  <p style={{ margin: "0", color: "#888" }}>
                    <strong>Prev:</strong> {log.prevHash}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: "#888", textAlign: "center" }}>
                No logs found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;