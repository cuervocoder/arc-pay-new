# Arc Pay Frontend

AI-powered content payment platform built with React, TypeScript, and Tailwind CSS. Connects users with creators through automated USDC micropayments on the Arc blockchain.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 💼 Complete wallet management interface
- 🤖 AI Agent monitoring and control dashboard
- 📊 Comprehensive payment history and analytics
- ⚙️ Advanced preference and budget configuration
- 🔐 Secure authentication with token-based sessions
- 💳 Real-time balance tracking
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Build Tool**: Vite
- **UI Components**: Lucide React Icons

## Project Structure

```
arc-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── WalletCard.tsx   # Wallet display component
│   │   └── ContentCard.tsx  # Content item card
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard/feed
│   │   ├── History.tsx      # Payment history
│   │   ├── Preferences.tsx  # User preferences
│   │   ├── Agent.tsx        # AI agent control
│   │   ├── SignIn.tsx       # Login page
│   │   └── SignUp.tsx       # Registration page
│   ├── services/
│   │   ├── api.ts           # API client with interceptors
│   │   └── store.ts         # Zustand state management
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arc-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your API endpoint:
```
VITE_API_URL=http://localhost:3001/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Pages Overview

### Dashboard (`/dashboard`)
- AI-curated content feed
- Wallet balance display
- Daily/monthly spending statistics
- Content cards with payment functionality
- Agent status indicator

### Payment History (`/history`)
- Complete transaction log
- Filtering by status and search
- Export to CSV functionality
- Transaction details
- Statistics summary

### Preferences (`/preferences`)
- Budget settings (daily/monthly limits)
- Auto-pay toggle
- Quality score threshold
- Interest management
- AI settings configuration

### AI Agent (`/agent`)
- Agent status monitoring
- Start/stop controls
- Processing metrics
- Action log with real-time updates
- Payment and content analysis statistics

### Authentication
- Sign in page with email/password
- Sign up with full validation
- Password strength indicator
- Session persistence via tokens

## API Integration

The frontend communicates with the backend API via the `apiService` singleton:

```typescript
import { apiService } from '@/services/api';

// Example usage
const response = await apiService.getContentFeed(1, 10);
const result = await apiService.makePayment(contentId, amount);
```

### Available API Methods

**Auth**
- `signIn(email, password)`
- `signUp(email, password, name)`
- `logout()`

**Wallet**
- `getWallet()`
- `createWallet()`
- `depositUSdc(amount)`
- `withdrawUSdc(amount, address)`

**Content**
- `getContentFeed(page, pageSize)`
- `getContentDetails(contentId)`

**Payments**
- `getPaymentHistory(page)`
- `makePayment(contentId, amount)`

**Preferences**
- `getPreferences()`
- `updatePreferences(preferences)`
- `updateBudgetSettings(settings)`
- `updateAISettings(settings)`
- `addInterest(interest)`
- `removeInterest(interest)`

**Agent**
- `getAgentStatus()`
- `startAgent()`
- `stopAgent()`
- `getAgentActions(limit)`

## State Management

Uses Zustand for global state:

```typescript
import { useAuthStore, useWalletStore, usePreferencesStore } from '@/services/store';

// In your component
const { user, signIn, logout } = useAuthStore();
const { wallet, fetchWallet } = useWalletStore();
const { preferences, updateBudgetSettings } = usePreferencesStore();
```

## Styling

The project uses Tailwind CSS with custom configuration. Key utilities:

- Color scheme: Blue and Cyan primary colors
- Responsive breakpoints: sm, md, lg, xl
- Custom animations: float, shimmer
- Glass-morphism effects available

## Type Safety

All components and API interactions are fully typed with TypeScript. Check `src/types/index.ts` for all type definitions.

## Features in Detail

### Real-time Updates
- Agent status updates every 5 seconds
- Payment history auto-refresh
- Wallet balance synchronization

### Error Handling
- API response interceptors
- User-friendly error messages
- Token expiration handling

### Security
- Token-based authentication
- Secure token storage in localStorage
- API interceptors for auth headers
- Password strength validation

## Performance Optimizations

- Code splitting with React Router
- Lazy component loading
- Optimized re-renders with Zustand
- Efficient state updates
- CSS-in-JS optimization with Tailwind

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing component structure
2. Use TypeScript for all new code
3. Maintain 80%+ test coverage
4. Format code with Prettier
5. Keep components focused and reusable

## Environment Variables

```
VITE_API_URL          # Backend API endpoint
VITE_CHAIN_ID        # Blockchain network ID
VITE_RPC_URL         # RPC endpoint
VITE_ENABLE_DEMO_MODE  # Demo mode flag
```

## Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000
```

### Clear cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### API connection issues
- Check `.env.local` API_URL
- Ensure backend is running
- Check CORS configuration

## License

MIT - See LICENSE file for details

## Support

For issues and questions, please open an issue on the repository.
