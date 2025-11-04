# 🔗 Arc Pay - Frontend + Backend Integration Guide

## 📦 What You Have

### Backend (Cloudflare Workers)
✅ AI Content Analysis  
✅ USDC Payments via Circle SDK  
✅ Subscription Management  
✅ KV Storage (User Data)  
**Location:** Cloudflare Edge (global)

### Frontend (React + TypeScript)
✅ Beautiful UI  
✅ Complete pages (Dashboard, History, Preferences, Agent)  
✅ State management (Zustand)  
✅ API service layer  
**Location:** Vercel, Netlify, or any static host

---

## 🔌 API Endpoints (Backend → Frontend)

Your Cloudflare Worker provides these endpoints that the frontend calls:

### User Preferences

```bash
# GET - Retrieve user preferences
GET /api/users/{userId}/preferences

# POST - Set user preferences
POST /api/users/{userId}/preferences
Body: {
  "interests": ["AI", "blockchain"],
  "maxDailyBudget": 50.00,
  "favoriteCreators": ["0x..."],
  "autoPayEnabled": true
}
```

### Content Processing (AI + Payment)

```bash
# POST - Process content with AI analysis and payment decision
POST /api/users/{userId}/content/process
Body: {
  "contentId": "content_123",
  "title": "Article Title",
  "description": "Description...",
  "type": "article",
  "creatorAddress": "0x...",
  "price": 0.50,
  "tags": ["AI", "blockchain"],
  "url": "https://..."
}

Response: {
  "success": true,
  "decision": {
    "shouldPay": true,
    "amount": 0.35,
    "reason": "Content meets quality criteria",
    "confidenceScore": 0.92,
    "contentId": "content_123",
    "creatorAddress": "0x..."
  },
  "transaction": {
    "txHash": "0x...",
    "status": "PENDING"
  }
}
```

### Content Recommendations

```bash
# POST - Get AI recommendations
POST /api/users/{userId}/recommendations
Body: {
  "content": [
    {
      "contentId": "1",
      "title": "Article 1",
      "tags": ["AI"],
      "price": 0.25
    },
    ...
  ]
}

Response: {
  "success": true,
  "recommendations": [
    { "contentId": "1", "title": "Article 1", ... },
    { "contentId": "3", "title": "Article 3", ... },
    ...
  ]
}
```

### Tips

```bash
# POST - Send tip to creator
POST /api/users/{userId}/tip
Body: {
  "creatorAddress": "0x...",
  "amount": 1.50
}

Response: {
  "success": true,
  "transaction": {
    "txHash": "0x...",
    "status": "PENDING"
  }
}
```

### Subscriptions

```bash
# GET - Get user subscriptions
GET /api/users/{userId}/subscriptions

Response: {
  "success": true,
  "subscriptions": [
    {
      "subscriptionId": "sub_123",
      "creatorAddress": "0x...",
      "amount": 5.00,
      "nextPaymentDate": "2025-02-15T...",
      "active": true
    }
  ]
}

# POST - Create subscription
POST /api/users/{userId}/subscriptions
Body: {
  "creatorAddress": "0x...",
  "amount": 5.00
}

Response: {
  "success": true,
  "subscription": {
    "subscriptionId": "sub_123",
    "creatorAddress": "0x...",
    "amount": 5.00,
    "nextPaymentDate": "2025-02-15T...",
    "active": true
  }
}
```

### Health Check

```bash
GET /health

Response: {
  "status": "healthy",
  "timestamp": "2025-10-31T...",
  "version": "1.0.0",
  "environment": "production",
  "edge": true
}
```

---

## 🔄 Frontend Integration Flow

### 1. **Dashboard Page** → Content Feed

```
Frontend Dashboard
    ↓
GET /api/content/feed (mocked)
    ↓
For each content:
  POST /api/users/{userId}/recommendations
    ↓
AI ranks content
    ↓
Display ranked content to user
```

### 2. **User Clicks "Pay & Unlock"** → Payment Processing

```
Frontend ContentCard
    ↓
User clicks "Pay & Unlock"
    ↓
Frontend: Check wallet balance (local)
    ↓
POST /api/users/{userId}/content/process
{
  contentId, title, description,
  type, creatorAddress, price, tags
}
    ↓
Backend: AI analysis
Backend: Quality & relevance check
Backend: Payment decision
    ↓
If approved:
  Circle SDK → USDC transfer
    ↓
Response with txHash
    ↓
Frontend: Show success message
Frontend: Update content status to "paid"
```

### 3. **Preferences Page** → Save Settings

```
Frontend Preferences
    ↓
User adjusts sliders/settings
    ↓
POST /api/users/{userId}/preferences
{
  interests: ["AI", "blockchain"],
  maxDailyBudget: 10.00,
  autoPayEnabled: true,
  minQualityScore: 0.7
}
    ↓
Backend: Store in KV
    ↓
Frontend: Show "Settings saved" message
```

### 4. **Agent Page** → Real-time Status

```
Frontend Agent Dashboard
    ↓
Every 5 seconds:
  GET /health (check agent alive)
  
User clicks "Start Agent":
  POST /api/agent/start
    ↓
Backend: Begin processing content
Backend: Hourly subscription checks (cron)
    ↓
Frontend: Show agent status
Frontend: Display metrics
```

---

## 🚀 Setup Instructions

### Step 1: Deploy Backend (Cloudflare Workers)

```bash
cd arc-ai-agent  # Your backend folder

# Install dependencies
npm install

# Generate credentials (see CREDENTIALS.md)
npm run generate-secret
npm run register-secret

# Create KV namespaces
wrangler kv:namespace create "USER_PREFS"
wrangler kv:namespace create "PAYMENT_HISTORY"
wrangler kv:namespace create "SUBSCRIPTIONS"

# Update wrangler.toml with KV namespace IDs

# Set secrets
wrangler secret put CIRCLE_API_KEY
wrangler secret put ENTITY_SECRET
wrangler secret put OPENAI_API_KEY  # Optional

# Deploy
npm run deploy
```

**Result:** Backend running at `https://arc-ai-agent.your-domain.workers.dev`

### Step 2: Update Frontend with Backend URL

```bash
cd arc-frontend

# Edit .env.local
nano .env.local
```

**Update:**
```env
# Old (localhost)
VITE_API_URL=http://localhost:3001/api

# New (Cloudflare Workers)
VITE_API_URL=https://arc-ai-agent.your-domain.workers.dev/api
```

### Step 3: Test Integration

```bash
# Start frontend
npm run dev

# Go to http://localhost:5173
# Try: Sign In → Dashboard → Process Content
```

---

## 🧪 Testing the Integration

### Test 1: Health Check

```bash
curl https://arc-ai-agent.your-domain.workers.dev/health
```

Expected: `{"status": "healthy", ...}`

### Test 2: Set Preferences

```bash
curl -X POST https://arc-ai-agent.your-domain.workers.dev/api/users/test-user/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "interests": ["AI", "blockchain"],
    "maxDailyBudget": 50,
    "favoriteCreators": []
  }'
```

Expected: `{"success": true, "preferences": {...}}`

### Test 3: Process Content

```bash
curl -X POST https://arc-ai-agent.your-domain.workers.dev/api/users/test-user/content/process \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "test-1",
    "title": "How AI Works",
    "description": "Deep dive into AI...",
    "type": "article",
    "creatorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "price": 0.50,
    "tags": ["AI"]
  }'
```

Expected: `{"success": true, "decision": {...}, "transaction": {...}}`

---

## 📊 Frontend → Backend Data Flow

### User Data Storage

```
Frontend (React State)
    ↓
Zustand Store (in-memory)
    ↓
Optional: LocalStorage (browser)
    ↓
API Call to Backend
    ↓
Backend KV Storage (persistent)
```

### Preferences Flow

```
Frontend Input
  ├── Budget slider
  ├── Quality threshold
  ├── Interests tags
  └── Auto-pay toggle
    ↓
POST /api/users/{id}/preferences
    ↓
Backend validates
    ↓
Store in KV: USER_PREFS:{userId}
    ↓
Response to frontend
    ↓
Update Zustand store
```

### Payment Flow

```
Frontend: User clicks "Pay"
    ↓
Frontend calls: POST /api/content/process
    ↓
Backend: Get user preferences from KV
Backend: Analyze content with AI
Backend: Make payment decision
Backend: Check daily budget
Backend: Create wallet if needed
Backend: Execute USDC transfer via Circle
Backend: Store transaction in KV
    ↓
Return: Decision + txHash
    ↓
Frontend: Update UI (paid/unpaid)
Frontend: Show transaction hash
```

---

## 🔐 Security Considerations

### Frontend Security

✅ Tokens stored in localStorage  
✅ API calls include Authorization header  
✅ Secrets NOT hardcoded  
✅ Input validation before sending to API

### Backend Security

✅ Entity Secret stored in Cloudflare Secrets  
✅ API Key encrypted  
✅ No credentials in code  
✅ User data isolated in KV

### Cross-Origin (CORS)

Your backend has CORS enabled:

```javascript
corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

Frontend can call from any domain (can be restricted if needed).

---

## 🐛 Troubleshooting Integration

### Frontend can't connect to backend

**Check 1:** Backend is deployed
```bash
curl https://arc-ai-agent.your-domain.workers.dev/health
```

**Check 2:** .env.local has correct URL
```bash
cat .env.local | grep VITE_API_URL
```

**Check 3:** Browser DevTools Network tab
- Should see requests to worker URL
- Look for CORS errors
- Check response status codes

### "Preferences not found" error

**Issue:** User preferences never set

**Solution:**
```bash
# Set initial preferences
curl -X POST https://arc-ai-agent.your-domain.workers.dev/api/users/test-user/preferences \
  -d '{"maxDailyBudget": 50}'
```

### "Wallet not found" error

**Issue:** User doesn't have wallet yet

**Solution:** Backend creates wallet automatically on first payment

### CORS errors in browser

**Check:** Backend CORS headers
```bash
curl -i https://arc-ai-agent.your-domain.workers.dev/health
```

Should include:
```
Access-Control-Allow-Origin: *
```

---

## 📱 Deployment to Production

### Frontend Deployment (Vercel)

```bash
cd arc-frontend

# Build
npm run build

# Deploy
vercel deploy --prod
```

**Update environment variables in Vercel dashboard:**
```
VITE_API_URL=https://arc-ai-agent.your-domain.workers.dev/api
```

### Backend Already Running

Your Cloudflare Workers is already running on the edge globally! ✅

---

## 🎯 Complete Integration Checklist

- [ ] Backend deployed to Cloudflare Workers
- [ ] Frontend .env.local updated with backend URL
- [ ] KV namespaces created
- [ ] Circle secrets configured
- [ ] Health check working
- [ ] Can set preferences
- [ ] Can process content
- [ ] Can create subscriptions
- [ ] Recommendations working
- [ ] Tips functional
- [ ] Frontend deployed to production

---

## 📊 Monitoring

### Backend Logs

```bash
# Real-time logs
wrangler tail

# Error logs only
wrangler tail --status error

# Specific pattern
wrangler tail --format json | grep "payment"
```

### Frontend Monitoring

Use browser DevTools:
1. Network tab - API calls
2. Console - JavaScript errors
3. Application - LocalStorage / IndexedDB
4. Performance - Load times

---

## 🚀 Next Steps

1. **Deploy backend** (if not already done)
2. **Get backend URL**
3. **Update frontend .env.local**
4. **Test integration** (use curl commands above)
5. **Start frontend** (`npm run dev`)
6. **Try full flow** (login → process content → payment)
7. **Deploy both to production**

---

## 📚 Files to Review

1. **Backend:**
   - `index.js` - Main worker routes
   - `openai.service.js` - AI analysis
   - `payment.service.js` - Circle integration
   - `subscription.service.js` - Recurring payments

2. **Frontend:**
   - `src/services/api.ts` - API client
   - `src/pages/Dashboard.tsx` - Content feed
   - `src/pages/History.tsx` - Transactions
   - `src/pages/Preferences.tsx` - Settings

---

## 🆘 Quick Support

| Issue | Solution |
|-------|----------|
| Backend 404 | Check URL in .env.local |
| CORS error | Verify backend CORS headers |
| No preferences | Set via API call first |
| Payment fails | Check Circle credentials |
| Wallet error | First payment creates wallet |

---

**Status:** ✅ Ready for Integration  
**Frontend:** React + TypeScript  
**Backend:** Cloudflare Workers  
**Combined:** Production Ready

🎉 **You have a complete, integrated AI payment system!**
