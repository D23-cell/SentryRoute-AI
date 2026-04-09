# 🛡️ SentryRoute AI: Strategic Intelligence & Logistics Dashboard

> **Live Mission Control:** [https://sentry-frontend-url.onrender.com](https://sentry-frontend-url.onrender.com)  
> *(Note: Replace the link above with your actual Frontend URL once deployed)*

**SentryRoute AI** is a secure, high-performance web application designed for real-time monitoring and tactical rerouting of global maritime and land-based logistics. It integrates **Blockchain Technology**, **Role-Based Access Control (RBAC)**, and **Dynamic Risk Assessment** to ensure data integrity and operational superiority.

## 🚀 Core Mission Features

### 1. ⛓️ Blockchain-Powered Audit Trail
* **Immutable Logging:** Every critical command (like AI Rerouting) is hashed using **SHA-256**.
* **Chaining Mechanism:** Each log entry is cryptographically linked to the previous one, ensuring a tamper-proof history of missions.
* **Integrity Validator:** A built-in forensic tool that detects any unauthorized manual tampering within the database.

### 2. 🔐 Tactical Access Control (RBAC) & 2FA
* **Command Hierarchy:** Distinct permissions for **Commander (Admin)** and **Analyst (User)** roles.
* **Multi-Factor Authentication:** Simulated OTP-based secure login to prevent unauthorized access to the war-room console.
* **Sensitive Actions:** Critical system parameters (like Risk Thresholds) are strictly locked to Commander-level clearance.

### 3. 🚦 Dynamic Risk Intelligence
* **Adaptive Sensitivity:** A real-time slider allowing Commanders to adjust "Tactical Risk Sensitivity" based on shifting geopolitical tensions or weather conditions.
* **AI Rerouting:** Automated path generation for high-risk assets, visualized on an interactive strategic map.

### 4. ⚡ High-Performance Engineering
* **Stress Tested:** Optimized to process **10,000 data nodes in ~0.70ms**.
* **Scalability:** Built with an $O(n)$ time complexity mindset, ensuring the dashboard remains responsive under heavy data loads.

---

## 💻 Tech Stack

* **Frontend:** React.js, Recharts (Tactical Analytics), React-Leaflet (Strategic Mapping)
* **Backend:** Node.js, Express.js (Hosted on Render)
* **Database:** LowDB (Persistent JSON-based storage)
* **Security:** CryptoJS (SHA-256 Hashing), JWT, Socket.io (Real-time Intelligence)

---

## 🔐 Access Console (Testing Credentials)

To access the SentryRoute AI Dashboard, use the following tactical credentials:

| Role          | Username | Password      | Permission Level                |
|---------------|----------|---------------|---------------------------------|
| **Commander** | `admin`  | `password123` | Full Access (Blockchain, Risk)  |
| **Analyst** | `user`   | `user123`     | View Only (Tactical Monitoring) |

> **Security Note:** OTP for 2FA is logged in the Backend Server Console during live sessions.

---

## 🛠️ Installation & Local Execution

1. **Clone the Command Center:**
   ```bash
   git clone [https://github.com/D23-cell/SentryRoute-AI.git](https://github.com/D23-cell/SentryRoute-AI.git)


2. Initialize Backend:
cd backend
npm install
npm start


3. Initialize Frontend:
cd frontend
npm install
npm start
