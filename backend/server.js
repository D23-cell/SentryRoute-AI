const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const CryptoJS = require("crypto-js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

app.use(cors());
app.use(express.json());

const SECRET_KEY = "Sentry_Secret_2026";
let lastBlockHash = "0000000000000000";
let currentOTP = null;

// Database Setup
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({
  shipments: [
    { id: 1, product: "Microprocessors", route: "Strait of Hormuz", status: "High Risk", lat: 26.5, lng: 56.2, riskLevel: 9 },
    { id: 2, product: "Crude Oil", route: "Suez Canal", status: "Safe", lat: 29.9, lng: 32.5, riskLevel: 2 },
    { id: 3, product: "Medical Supplies", route: "Bab-el-Mandeb", status: "High Risk", lat: 12.6, lng: 43.3, riskLevel: 8 },
    { id: 4, product: "Liquefied Gas", route: "South China Sea", status: "High Risk", lat: 15.0, lng: 115.0, riskLevel: 7 },
    { id: 5, product: "Agricultural Grains", route: "Black Sea", status: "High Risk", lat: 44.0, lng: 35.0, riskLevel: 9 },
    { id: 6, product: "Automobile Parts", route: "Panama Canal", status: "Safe", lat: 9.1, lng: -79.9, riskLevel: 1 },
    { id: 7, product: "Rare Earth Metals", route: "Malacca Strait", status: "Safe", lat: 2.2, lng: 102.2, riskLevel: 3 },
  ],
  logs: [],
}).write();


app.get("/api/shipments", (req, res) => res.json(db.get("shipments").value()));

app.get("/api/logs", (req, res) => {
  res.json(db.get("logs").value());
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  let role = (username === "admin" && password === "password123") ? "Commander" : 
             (username === "user" && password === "user123") ? "Analyst" : "";
  if (role) {
    currentOTP = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`🛡️  SECURITY ALERT: OTP for ${username} is [ ${currentOTP} ]`);
    res.json({ message: "OTP_SENT", role, username });
  } else {
    res.status(401).json({ message: "Invalid Credentials" });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { otp, username, role } = req.body;
  if (otp === currentOTP) {
    const token = jwt.sign({ user: username, role }, SECRET_KEY, { expiresIn: "1h" });
    currentOTP = null;
    res.json({ token, role });
  } else {
    res.status(401).json({ message: "Invalid OTP!" });
  }
});

app.post("/api/execute-reroute", (req, res) => {
  const { role, productId, username } = req.body;
  if (role !== "Commander") {
    return res.status(403).json({ message: "ACCESS DENIED" });
  }

  const timestamp = new Date().toISOString();
  const actionData = `Action: Reroute | ID: ${productId} | User: ${username} | Time: ${timestamp}`;
  const currentHash = CryptoJS.SHA256(lastBlockHash + actionData).toString();

  const auditEntry = {
    action: "Reroute",
    productId,
    commander: username || "Unknown",
    timestamp,
    prevHash: lastBlockHash,
    hash: currentHash,
  };

  db.get("logs").push(auditEntry).write();
  lastBlockHash = currentHash;

  res.json({ message: "✅ Action Verified & Logged to Blockchain", block: auditEntry });
});

app.get('/api/verify-chain', (req, res) => {
    const logs = db.get('logs').value();
    if (!logs || logs.length === 0) {
        return res.json({ status: "SUCCESS", message: "🔒 Blockchain is empty. Integrity intact." });
    }

    let tempPrevHash = "0000000000000000";
    let isChainValid = true;

    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const actionData = `Action: ${log.action} | ID: ${log.productId} | User: ${log.commander} | Time: ${log.timestamp}`;
        const reCalculatedHash = CryptoJS.SHA256(tempPrevHash + actionData).toString();

        if (log.hash !== reCalculatedHash || log.prevHash !== tempPrevHash) {
            isChainValid = false;
            break;
        }
        tempPrevHash = log.hash;
    }

    if (isChainValid) {
        res.json({ status: "SUCCESS", message: "✅ Blockchain Integrity Verified. No tampering detected." });
    } else {
        res.status(418).json({ status: "CRITICAL", message: "🚨 ALERT: Database Tampering Detected! The Hash Chain is broken." });
    }
});

io.on("connection", (socket) => {
  console.log("📡 User connected to War-Room");
  const interval = setInterval(() => {
    socket.emit("live-news-update", "📡 ALERT: New satellite imagery received for Red Sea.");
  }, 15000);
  socket.on("send-message", (data) => io.emit("receive-message", data));
  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("📡 User disconnected");
  });
});

server.listen(5000, () => console.log("🚀 Strategic Server running on Port 5000"));