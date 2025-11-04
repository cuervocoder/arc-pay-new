# Arc Pay - Frontend & Backend Integration Guide

## Overview

This document describes how to integrate the Arc Pay frontend with the backend API. The frontend is a React/TypeScript application that communicates with a Node.js/Express backend via REST API.

## Architecture Diagram

```
┌─────────────────────────┐
│   React Frontend        │
│   (localhost:5173)      │
├─────────────────────────┤
│  ├── Pages              │
│  ├── Components         │
│  ├── Services (API)     │
│  └── State (Zustand)    │
└────────────┬────────────┘
             │ HTTP/REST
             │ axios
             ▼
┌─────────────────────────┐
│   Backend API           │
│   (localhost:3001)      │
├─────────────────────────┤
│  ├── Auth Routes        │
│  ├── Wallet Routes      │
│  ├── Content Routes     │
│  ├── Payment Routes     │
│  ├── Preferences Routes │
│  ├── Agent Routes       │
│  └── Dashboard Routes   │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐
    │ Database       │
    │ Circle SDK     │
    │ Arc Blockchain │
    └────────────────┘
```

## Environment Setup

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001/api
VITE_CHAIN_ID=arc-testnet
VITE_RPC_URL=https://arc-testnet-rpc.example.com
VITE_ENABLE_DEMO_MODE=true
```

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arc_pay

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE_IN=7d

# Circle
CIRCLE_API_KEY=your-circle-api-key
CIRCLE_ENTITY_SECRET=your-entity-secret

# Blockchain
ARC_RPC_URL=https://arc-testnet-rpc.example.com
ARC_CHAIN_ID=123
ARC_USDC_CONTRACT=0x...

# Frontend
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/signin       - User sign in
POST   /api/auth/signup       - User registration
POST   /api/auth/logout       - User logout
POST   /api/auth/refresh      - Refresh token
```

#### Example: Sign In

**Request**
```typescript
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "walletAddress": "0x...",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Wallet Endpoints

```
GET    /api/wallet            - Get wallet info
POST   /api/wallet/create     - Create new wallet
POST   /api/wallet/deposit    - Deposit USDC
POST   /api/wallet/withdraw   - Withdraw USDC
```

#### Example: Get Wallet

**Request**
```typescript
GET /api/wallet
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response**
```typescript
{
  "success": true,
  "data": {
    "id": "wallet_123",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f1EAdF",
    "balance": "1000000000000000000", // 1 USDC in wei
    "balanceUSD": 1000.50,
    "network": "arc-testnet",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Content Endpoints

```
GET    /api/content/feed      - Get content feed
GET    /api/content/{id}      - Get content details
```

#### Example: Get Content Feed

**Request**
```typescript
GET /api/content/feed?page=1&pageSize=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response**
```typescript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "content_123",
        "title": "The Future of DeFi",
        "author": "Alice Chen",
        "description": "An analysis of cross-chain protocols...",
        "price": 0.5,
        "category": "Finance",
        "tags": ["DeFi", "Blockchain"],
        "qualityScore": 8.5,
        "relevanceScore": 92,
        "paymentStatus": "unpaid",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 10
  }
}
```

### Payment Endpoints

```
GET    /api/payments/history  - Get payment history
POST   /api/payments/create   - Create payment
GET    /api/payments/{id}     - Get payment details
```

#### Example: Create Payment

**Request**
```typescript
POST /api/payments/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "contentId": "content_123",
  "amount": 0.5
}
```

**Response**
```typescript
{
  "success": true,
  "data": {
    "paymentId": "payment_123",
    "txHash": "0x1234567890abcdef...",
    "amount": 0.5,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Preferences Endpoints

```
GET    /api/preferences       - Get user preferences
PUT    /api/preferences       - Update preferences
PUT    /api/preferences/budget - Update budget settings
PUT    /api/preferences/ai    - Update AI settings
POST   /api/preferences/interests - Add interest
DELETE /api/preferences/interests/{interest} - Remove interest
```

#### Example: Update Budget Settings

**Request**
```typescript
PUT /api/preferences/budget
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "dailyLimit": 10,
  "monthlyLimit": 100,
  "autoPay": true
}
```

### Agent Endpoints

```
GET    /api/agent/status      - Get agent status
POST   /api/agent/start       - Start agent
POST   /api/agent/stop        - Stop agent
GET    /api/agent/actions     - Get recent actions
```

#### Example: Get Agent Status

**Request**
```typescript
GET /api/agent/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response**
```typescript
{
  "success": true,
  "data": {
    "isActive": true,
    "lastRun": "2024-01-15T10:45:00Z",
    "nextRun": "2024-01-15T10:50:00Z",
    "paymentsProcessed": 23,
    "contentAnalyzed": 156
  }
}
```

### Dashboard Endpoints

```
GET    /api/dashboard/stats   - Get dashboard statistics
```

## Error Handling

All API errors follow a consistent format:

```typescript
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

### Common Error Codes

```
INVALID_CREDENTIALS      - Wrong email or password
TOKEN_EXPIRED           - JWT token has expired
INSUFFICIENT_BALANCE    - Not enough USDC
CONTENT_NOT_FOUND       - Content ID doesn't exist
WALLET_NOT_FOUND        - User doesn't have a wallet
UNAUTHORIZED            - Missing or invalid token
INVALID_INPUT           - Validation error
INTERNAL_ERROR          - Server error
```

## Frontend API Service Integration

### Making Requests

```typescript
import { apiService } from '@/services/api';

// The service automatically handles:
// ✓ Authentication headers
// ✓ Error responses
// ✓ Token refresh
// ✓ Request/response logging

// Example usage
try {
  const response = await apiService.makePayment('content_123', 0.5);
  if (response.success) {
    console.log('Payment created:', response.data);
  }
} catch (error) {
  console.error('Payment failed:', error);
}
```

### Authentication Flow

1. **Sign In**
```typescript
const { user, token } = await apiService.signIn(email, password);
localStorage.setItem('auth_token', token);
apiService.setToken(token);
```

2. **Automatic Token Management**
```typescript
// Token is automatically included in all requests
// Interceptor handles 401 responses and refreshes token
```

3. **Sign Out**
```typescript
await apiService.logout();
// Token is removed from storage
```

## State Management Integration

The frontend uses Zustand for state management:

```typescript
// Auth Store
const { user, signIn, logout } = useAuthStore();

// Wallet Store
const { wallet, fetchWallet, deposit } = useWalletStore();

// Preferences Store
const { preferences, updateBudgetSettings } = usePreferencesStore();

// Agent Store
const { status, start, stop } = useAgentStore();

// Dashboard Store
const { stats, fetchStats } = useDashboardStore();
```

## Real-time Updates

The frontend polls the backend for updates:

```typescript
// Agent status updates every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchAgentStatus();
    loadAgentActions();
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

## CORS Configuration

The backend should allow requests from the frontend:

```typescript
// Backend CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Testing the Integration

### 1. Start Backend
```bash
cd ../arc-backend  # or your backend directory
npm install
npm run dev
```

### 2. Start Frontend
```bash
npm install
npm run dev
```

### 3. Test Authentication
```typescript
// In browser console
const response = await fetch('http://localhost:3001/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});
const data = await response.json();
console.log(data);
```

### 4. Verify API Connection
- Open browser DevTools (F12)
- Go to Network tab
- Navigate through the app
- Check that API requests show 200 status codes

## Deployment

### Frontend Deployment (Vercel, Netlify, etc.)

```bash
npm run build
# Output in dist/ directory
```

Set environment variables in deployment platform:
```
VITE_API_URL=https://api.example.com/api
```

### Backend Deployment

Deploy to:
- Heroku
- AWS
- Railway
- Render
- DigitalOcean

Update frontend API URL to match deployed backend.

## Debugging

### Enable API Logging

Add to `src/services/api.ts`:
```typescript
this.api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});
```

### Browser DevTools

- **Network Tab**: View all API requests
- **Storage Tab**: Check localStorage for tokens
- **Console Tab**: View error messages
- **Application Tab**: Check cookies and session data

## Security Considerations

1. **Never commit API keys**
   - Use environment variables
   - Add `.env.local` to `.gitignore`

2. **Token Security**
   - Store tokens in localStorage only
   - Send only via Authorization header
   - Implement token rotation

3. **HTTPS in Production**
   - All API requests must use HTTPS
   - Set secure flag on cookies

4. **Input Validation**
   - Validate all user inputs
   - Sanitize before sending to API

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check backend CORS configuration

### 401 Unauthorized
```
Token invalid or expired
```
**Solution**: Sign out and sign in again, check token in storage

### Network Errors
```
Failed to fetch
```
**Solution**: 
- Ensure backend is running
- Check API_URL in .env.local
- Check firewall/proxy settings

### Timeout Errors
```
Request timeout after 30s
```
**Solution**:
- Check backend server performance
- Increase timeout in axios config
- Check network connectivity

## Performance Tips

1. **Pagination**
   - Use page/pageSize for large datasets
   - Implement infinite scroll if needed

2. **Caching**
   - Cache static content
   - Use SWR for data fetching if needed

3. **Lazy Loading**
   - Load content images lazily
   - Code split routes

4. **API Optimization**
   - Batch requests when possible
   - Minimize payload sizes
   - Use compression

## Next Steps

1. ✅ Start backend server
2. ✅ Configure environment variables
3. ✅ Start frontend development server
4. ✅ Test all authentication flows
5. ✅ Verify wallet operations
6. ✅ Test payment functionality
7. ✅ Deploy to production

## Support

For integration issues:
1. Check the API response in Network tab
2. Review error message in console
3. Check environment variables
4. Review backend logs
5. Consult documentation

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/)
- [Vite Guide](https://vitejs.dev/guide/)
