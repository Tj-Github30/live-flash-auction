# 🚀 Quick Start - Test User Sync Through Website

## One-Command Setup

```bash
./START_TEST.sh
```

This will:
- ✅ Create backend .env file
- ✅ Setup SQLite database
- ✅ Create frontend .env file
- ✅ Check npm dependencies

---

## Manual Setup (If Script Doesn't Work)

### Step 1: Backend Setup

```bash
cd backend

# Create .env
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./test_live_auction.db
COGNITO_USER_POOL_ID=us-east-1_UHhA2Am3q
COGNITO_APP_CLIENT_ID=236m0jv1dnmdvddogrquhf0vc9
COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UHhA2Am3q
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
EOF

# Setup database
python3 setup_sqlite_db.py

# Install dependencies
cd shared && pip3 install -r requirements.txt && cd ..
cd auction-management-service && pip3 install -r requirements.txt && cd ..
```

### Step 2: Frontend Setup

```bash
cd frontend

# Create .env
cat > .env << 'EOF'
VITE_COGNITO_DOMAIN=https://us-east-1uhha2am3q.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=236m0jv1dnmdvddogrquhf0vc9
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/login/callback
VITE_COGNITO_LOGOUT_REDIRECT_URI=http://localhost:5173/login
VITE_COGNITO_REGION=us-east-1
VITE_API_BASE_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8001
EOF

# Install dependencies
npm install
```

---

## Start Services

### Terminal 1: Backend

```bash
cd backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)/shared:$(pwd)"
cd auction-management-service
python3 -m app.main
```

Wait for: `* Running on http://0.0.0.0:8000`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

---

## Test User Sync

1. **Open browser**: http://localhost:5173
2. **Click Login** → Redirects to Cognito
3. **Login** with your Cognito credentials
4. **Redirected back** to app
5. **Open browser console** (F12)
6. **Run this** to trigger user sync:

```javascript
// Get token from localStorage
const tokens = JSON.parse(localStorage.getItem('auction_auth_tokens'));

// Make API call (triggers user sync)
fetch('http://localhost:8000/auctions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokens.idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Auction',
    description: 'Testing user sync',
    duration: 3600,
    category: 'Test',
    starting_bid: 100.00
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Response:', data);
  if (data.auction_id) {
    console.log('🎉 User sync worked! User created in database!');
  }
})
.catch(err => console.error('❌ Error:', err));
```

7. **Check database**:

```bash
cd backend
python3 << 'PYTHON'
import sqlite3
conn = sqlite3.connect('test_live_auction.db')
cursor = conn.cursor()
cursor.execute("SELECT user_id, email, username, name FROM users")
for row in cursor.fetchall():
    print(f"User: {row[1]} ({row[2]}) - {row[3]}")
conn.close()
PYTHON
```

---

## Success! 🎉

If you see your user in the database, user sync is working!


