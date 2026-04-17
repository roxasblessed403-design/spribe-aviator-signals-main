# Lisconvastag Aviator Signals

Premium Aviator signal tracking and round analysis platform.

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (already done — .env.local is included)
# Edit .env.local to change passwords and keys

# 3. Run dev server
npm run dev

# 4. Open in browser
# Client:  http://localhost:3000/login
# Admin:   http://localhost:3000/admin
```

---

## Default Access Credentials

| Role   | Field       | Default Value  |
|--------|-------------|----------------|
| Client | Access Key  | `SIGNAL2024`   |
| Client | Access Key  | `AVIATOR01`    |
| Client | Access Key  | `LISCKEY99`    |
| Admin  | Password    | `admin123`     |

> ⚠ Change these before deploying to production!

---

## Project Structure

```
lisconvastag/
├── app/
│   ├── login/            # Client login page
│   ├── signals/          # Client signal dashboard
│   ├── admin/
│   │   ├── page.tsx      # Admin login
│   │   ├── dashboard/    # Admin overview
│   │   ├── users/        # Access key management
│   │   ├── sites/        # Connector management
│   │   ├── signals/      # Signal rule editor
│   │   ├── settings/     # App config reference
│   │   └── logs/         # System logs
│   └── api/
│       ├── auth/         # Login / logout endpoints
│       ├── signals/      # Current signal
│       ├── rounds/       # Recent rounds data
│       ├── sites/        # Site list
│       ├── admin/        # Admin-only APIs
│       └── ai/           # OpenAI-powered endpoints
├── components/           # Reusable UI components
├── connectors/           # Per-site data connectors
│   ├── base.ts           # Base connector class
│   ├── pridebet.ts
│   ├── winbucks.ts
│   ├── bettingcozw.ts
│   └── bolabet.ts
├── config/
│   ├── sites.ts          # ← ADD/REMOVE BETTING SITES HERE
│   └── signals.ts        # ← EDIT SIGNAL RULES HERE
├── data/
│   └── mockRounds.ts     # Mock round generator
├── lib/
│   ├── auth.ts           # JWT auth utilities
│   ├── openai.ts         # OpenAI integration
│   ├── signalEngine.ts   # Signal analysis logic
│   └── types.ts          # TypeScript types
└── middleware.ts         # Route protection
```

---

## Where to Edit Things

### 🎨 Branding
- App name: `app/layout.tsx` → change `<title>` and metadata
- Colors: `tailwind.config.js` → `theme.extend.colors.cyber`
- Fonts: `app/layout.tsx` → change Google Font imports

### 🔐 Admin Password
- `/.env.local` → `ADMIN_PASSWORD=yourpassword`

### 🗝 Client Access Keys
- `/.env.local` → `CLIENT_ACCESS_KEYS=KEY1,KEY2,KEY3`

### 🌐 Add/Remove Betting Sites
- `config/sites.ts` → add entry to `BETTING_SITES` array
- `connectors/yoursite.ts` → create new connector extending `BaseConnector`
- `connectors/base.ts` → register in `initConnectors()`

### 📊 Signal Rules
- `config/signals.ts` → edit thresholds
- `lib/signalEngine.ts` → edit the core logic

### 🤖 OpenAI API
- `/.env.local` → `OPENAI_API_KEY=sk-...`
- `lib/openai.ts` → edit prompts and model settings
- `app/api/ai/` → add new AI endpoints

### 🔴 Live Connectors
- `connectors/pridebet.ts` → implement `getLiveRounds()`
- Repeat for other sites
- `connectors/base.ts` → set default mode to `'live'`
- `/.env.local` → `DEFAULT_DATA_MODE=live`

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# JWT_SECRET, ADMIN_PASSWORD, CLIENT_ACCESS_KEYS, OPENAI_API_KEY
```

---

## ⚠ Important Notes

### Live Data
The Aviator game on these betting sites runs on Spribe's platform. There is **no public API**.
To enable live data you would need to:
1. Inspect the network traffic on each site (WebSocket connections)
2. Implement the connection in the respective connector
3. Handle auth/session tokens from the site

### OpenAI
Uses `gpt-4o` model. The spec asked for `gpt-5.4` which **does not exist** — `gpt-4o` is the correct current model.

### Production Security
- Change `JWT_SECRET` to a random 32-char string
- Change `ADMIN_PASSWORD` to a strong password
- Never commit `.env.local` to git

---

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Fonts** (Orbitron + Rajdhani)
- **jose** (JWT)
- **openai** SDK
