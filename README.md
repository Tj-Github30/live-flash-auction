
# Live Flash Auction – Cloud Project

A cloud-native real-time live auction platform using:

- **Flask (Python)** - Backend APIs + WebSockets  
- **React (Vite)** - Frontend UI  
- **Redis** - Realtime bid state, locking, pub/sub  
- **AWS Cognito** - Authentication  
- **Amazon IVS** - Livestream for auctions  
- **DynamoDB / RDS** - Auction data storage  

This repository contains the backend + frontend skeleton so each teammate can start developing their assigned feature.

---

## 🔧 Project Structure

```

/backend      → Flask backend
/frontend     → React (Vite) frontend
/docs         → design docs, sprint plan, architecture
/infra        → future AWS setup (Terraform etc.)
.env.example  → environment variable template

````

---

# 🚀 How to Run the Project (Local Setup)

## 1️⃣ Backend Setup (Flask + Socket.IO)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python application.py
````

Backend runs on:

```
http://localhost:8000
http://localhost:8000/health
```

### 📦 Required Backend Packages (already added to requirements.txt)

If needed:

```bash
pip install flask flask-socketio eventlet flask-cors redis python-dotenv boto3
pip freeze > requirements.txt
```

---

## 2️⃣ Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

### 📦 Required Frontend Packages

If you need to install extra packages later:

```bash
npm install axios
npm install socket.io-client
npm install amazon-ivs-player  # optional for streaming
```

---

# 🔐 Environment Variables

Create your own `.env` from the template:

```bash
cp .env.example .env
```

Do **NOT** commit `.env`.

---

# 👤 Team Branch Workflow (Very Important)

Each teammate works on their own feature branch.

### Branch naming format:

```
feature/auth
feature/auction-create
feature/bidding
feature/timer
```

### How to start working on your feature:

```bash
git checkout -b feature/<your-feature-name>
```

Examples:

```bash
git checkout -b feature/auth
git checkout -b feature/bidding
```

### How to push your feature work:

```bash
git add .
git commit -m "Implement <your feature>"
git push -u origin feature/<your-feature-name>
```

Then open a Pull Request into `main`.

---

# 👍 Notes

* Don’t commit `.env`
* Commit only `.env.example`
* All real development must happen in feature branches
* Keep `main` clean

---
