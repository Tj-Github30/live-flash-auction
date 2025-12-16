# Live Flash Auction - Frontend

React + TypeScript frontend application for the Live Flash Auction platform. Built with Vite, React 19, and Socket.IO for real-time updates.

## 🎯 Project Overview

This is the frontend application for a real-time flash auction platform where users can:
- **Authenticate** via AWS Cognito (OTP-based login)
- **Browse** live auctions
- **Join** auction rooms with live video streaming (AWS IVS)
- **Place bids** in real-time via WebSocket
- **Chat** with other participants
- **View** auction history and results

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **AWS Cognito** User Pool configured
- **Backend API** running (see `backend/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

## 📝 Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```bash
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000
# For production: http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com

# AWS Cognito Configuration
VITE_COGNITO_CLIENT_ID=your-cognito-client-id
VITE_COGNITO_REGION=us-east-1
VITE_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_COGNITO_LOGOUT_REDIRECT_URI=http://localhost:5173
```

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the application.

## 🏗️ Architecture

### Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Socket.IO Client** - WebSocket connections for real-time updates
- **Tailwind CSS** - Styling (via shadcn/ui components)
- **Radix UI** - Accessible component primitives

### Project Structure

```
frontend/
├── src/
│   ├── auth/              # Authentication logic (Cognito integration)
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AuthPage.tsx   # Login/signup page
│   │   ├── BuyPage.tsx    # Browse auctions
│   │   ├── LiveAuctionRoom.tsx  # Main auction room
│   │   ├── BiddingPanel.tsx     # Bid placement UI
│   │   ├── ChatPanel.tsx         # Chat interface
│   │   └── ...
│   ├── utils/
│   │   ├── api.ts         # API client with auth
│   │   └── websocket.ts   # WebSocket connection utility
│   └── App.tsx            # Main app component
├── public/                # Static assets
└── package.json
```

## 🔌 API Integration

### API Client

The frontend uses a centralized API client (`src/utils/api.ts`) that:
- Automatically includes JWT tokens in requests
- Handles authentication errors
- Provides convenience methods (`api.get`, `api.post`, etc.)

**Example Usage**:
```typescript
import { api, apiJson } from './utils/api';

// GET request
const response = await api.get('/api/auctions?status=live');
const auctions = await apiJson(response);

// POST request
const response = await api.post('/api/auctions', {
  title: 'Vintage Watch',
  starting_bid: 1000,
  duration: 3600
});
const auction = await apiJson(response);
```

### API Endpoints

All API endpoints are prefixed with `/api`:
- `/api/auth/*` - Authentication (initiate, verify OTP, resend code)
- `/api/auctions/*` - Auction CRUD operations
- `/api/bids/*` - Bid placement (via Bid Processing Service)

## 🔄 WebSocket Integration

### Connection Setup

The frontend connects to the WebSocket service using Socket.IO:

```typescript
import { createSocketConnection } from './utils/websocket';

const socket = createSocketConnection({
  token: idToken,  // Cognito JWT token
  auctionId: 'auction-uuid',
  onBidUpdate: (data) => {
    // Handle bid updates
  },
  onChatMessage: (data) => {
    // Handle chat messages
  },
  onTimerUpdate: (data) => {
    // Handle timer updates
  }
});
```

### WebSocket Events

**Client → Server**:
- `join_auction` - Join an auction room
- `place_bid` - Place a bid
- `chat_message` - Send a chat message

**Server → Client**:
- `joined_auction` - Initial auction state
- `bid_update` - New bid placed
- `chat_message` - New chat message
- `timer_update` - Timer countdown update
- `auction_ended` - Auction has ended
- `user_joined` / `user_left` - Participant presence

**Note**: The WebSocket service uses `/socket.io` as the default path (Flask-SocketIO convention).

## ⚠️ Current Status

### ✅ Working Features

- **Authentication**: Login/signup with OTP verification via AWS Cognito
- **Token Management**: JWT token storage and refresh
- **API Integration**: All API calls integrated (no mock data)
- **WebSocket Connection**: Real-time connection setup

### 🐛 Known Issues

- **Auction Listing**: Bugs in filtering and display
- **Bidding**: Issues with bid placement and validation
- **Auction Room**: Some features not fully functional
- **Other Features**: Various bugs that need fixing

**Note**: Only the login functionality is currently working correctly. Other features have bugs that need to be fixed before deployment.

## 🚀 Deployment

**Status**: ⏸️ **Deployment deferred to last step** (after bug fixes)

### Deployment Steps (Future)

1. **Fix all bugs** in auction listing, bidding, and other features
2. **Build the application**:
   ```bash
   npm run build
   ```
3. **Deploy to S3 + CloudFront** (see `ENTIRE_PHASE_GUIDELINES.md` Phase 2)
4. **Update environment variables** for production API URL

## 🧪 Development Tips

### Testing API Locally

If running backend locally:
```bash
# Backend should be running on http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

### Testing with Production Backend

```bash
# Use ALB URL
VITE_API_BASE_URL=http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com npm run dev
```

### Debugging WebSocket

Check browser console for Socket.IO connection logs:
- Connection status
- Event emissions/receptions
- Error messages

## 📚 Related Documentation

- **`../HANDOVER.md`** - Project handover guide
- **`../PROJECT_STATUS.md`** - Current project status
- **`../ENTIRE_PHASE_GUIDELINES.md`** - Complete AWS setup guide
- **`../backend/README.md`** - Backend API documentation

## 🐛 Troubleshooting

### "Failed to fetch" Errors

- Check that `VITE_API_BASE_URL` is correct
- Verify backend is running and accessible
- Check browser console for CORS errors
- Ensure backend CORS is configured for your frontend URL

### WebSocket Connection Issues

- Verify `VITE_API_BASE_URL` points to correct backend
- Check that WebSocket service is running
- Ensure JWT token is valid (not expired)
- Check browser console for connection errors

### Authentication Issues

- Verify Cognito Client ID is correct
- Check that Cognito User Pool is configured
- Ensure redirect URIs match in Cognito settings
- Check browser console for token errors

## 📄 License

MIT
