# Veyra — Create Without Limits

An affordable AI image and video creation platform. Built with Next.js, TypeScript, Tailwind CSS, Prisma, and a modular provider architecture.

![Demo Mode](https://img.shields.io/badge/Demo-Mode-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully in demo mode with zero paid services.

## Requirements

- Node.js 18+
- npm or pnpm
- No external database needed for development (SQLite included)

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Public landing pages
│   ├── (auth)/             # Login, signup, password reset
│   ├── (dashboard)/        # User dashboard, create, projects, etc.
│   ├── admin/              # Admin panel
│   └── api/                # API routes
├── lib/                    # Core libraries (auth, prisma, credits, validation)
├── providers/              # Pluggable provider abstractions
│   ├── ai/                 # AI generation providers
│   ├── storage/            # File storage providers
│   └── payment/            # Payment providers
└── proxy.ts                # Auth proxy (Next.js 16)
```

## Environment Variables

See `.env.example` for all configuration options.

### Demo Mode

Set `DEMO_MODE=true` to run without any paid services:
- Mock AI provider returns placeholder images/videos
- Mock payment provider handles checkout flows
- Local file storage for uploads

### AI Provider

Configure via environment variables:

```bash
AI_PROVIDER=openai        # or any supported provider
AI_API_KEY=sk-...
```

Leave empty for the built-in mock provider. The provider abstraction supports:
- `MockAIProvider` (default, free)
- Easy to add: Stability AI, Replicate, fal.ai, etc.

### Storage

```bash
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./data/uploads
```

Swap `local` for S3, GCS, or any cloud object storage by implementing `StorageProvider`.

### Payments

#### Stripe (Default)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRICE_PRO=price_...
```

#### Razorpay (India)

```bash
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

Both providers use the same `PaymentProvider` interface. Add new providers by implementing the interface.

## Database

### Development (SQLite)

```bash
npx prisma migrate dev
```

### Production (PostgreSQL)

1. Update `prisma/schema.prisma` to change the provider:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

2. Set `DATABASE_URL` in your environment:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/veyra"
   ```

3. Run migration:
   ```bash
   npx prisma migrate deploy
   ```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:migrate   # Apply Prisma migrations via direct PG connection
npx prisma studio    # Database browser
npx prisma generate  # Regenerate Prisma client
```

## Security

- Passwords hashed with bcryptjs (12 rounds)
- Session tokens stored in httpOnly, secure cookies
- All API routes validate authentication
- Admin routes verify role
- Input validation via Zod on all endpoints
- Rate limiting on mutation endpoints
- Ownership checks on projects and generations
- Users cannot access other users' data
- Users cannot manipulate their own credit balance
- Webhook signatures verified before processing payments
- Duplicate webhook events are prevented
- Credit calculations are always server-side

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signup` | POST | Register new account |
| `/api/auth/login` | POST | Log in |
| `/api/auth/logout` | POST | Log out |
| `/api/auth/me` | GET | Get current user |
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/[id]` | PATCH/DELETE | Update/delete project |
| `/api/generations` | GET/POST | List/create generations |
| `/api/generations/[id]` | GET/DELETE | Get/delete generation |
| `/api/credits` | GET | Credit balance + history |
| `/api/settings` | PATCH | Update profile |
| `/api/settings/password` | POST | Change password |
| `/api/payments/checkout` | POST | Create checkout session |
| `/api/payments/webhook` | POST | Payment webhook handler |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/users` | GET/POST | Admin user management |

## Deployment

### Supabase PostgreSQL Setup

1. Create a free project at [supabase.com](https://supabase.com) → **New project**
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the direct **PostgreSQL** connection string (port `5432`) into `.env`:
   ```
   DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require"
   ```
   Keep the password URL-encoded (`%` → `%25`, `/` → `%2F`).
4. Apply the migration (included in this repo):
   ```bash
   npm run db:migrate
   ```
   > Why not `npx prisma migrate deploy`? Some Supabase direct hosts are
   > **IPv6-only**, which the Prisma CLI cannot route to on machines without
   > IPv6. `npm run db:migrate` runs the same migration SQL over a direct
   > `pg` connection (with TLS) and records it in `_prisma_migrations`, so
   > Prisma stays in sync. It works from anywhere — including Termux.
   >
   > If your project has a **pooler** hostname (Settings → Database →
   > Connection pooling), you can also use that URL and then
   > `npx prisma migrate deploy` works normally.

### Vercel (Recommended — free)

1. Push to GitHub (this repo is already on GitHub)
2. Go to [vercel.com](https://vercel.com) → sign up **with your GitHub account** (free Hobby plan, no card needed)
3. Click **Add New → Project** → import `sam206394-maker/veyra`
4. Framework auto-detects **Next.js** — keep the defaults
5. Add environment variables (Vercel → Project → Settings → Environment Variables):
   - `DATABASE_URL` = your Supabase connection string (same as in `.env`)
   - `NEXT_PUBLIC_APP_URL` = `https://<your-project>.vercel.app` (the URL Vercel assigns you)
   - `DEMO_MODE` = `true` (mock AI/payments until you add real keys)
6. Click **Deploy** — done, you now have a **free live website at 0$**

To update the app later: push to GitHub and Vercel auto-deploys. No commands needed.

## Android APK (free)

The app can also be installed as an Android APK — no Play Store, no $25, no fees.
The wrapper (a Capacitor shell that opens your live Veyra URL) lives in `android-wrapper/`.

### How the APK gets built

A GitHub Action builds it for you for free on every push (public repos get unlimited CI minutes):

1. Set your live URL in `android-wrapper/capacitor.config.ts`:
   ```ts
   const VEYRA_SERVER_URL = process.env.VEYRA_SERVER_URL ?? "https://<your-project>.vercel.app";
   ```
2. Push to GitHub → open the **Actions** tab → the **Build Android APK** workflow runs.
3. When it finishes, open the run → **Artifacts** → download `veyra-apk`.

### 📦 Download the APK

**Latest build (v1.0.0):** [Download Veyra-v1.0.0.apk](https://github.com/sam206394-maker/veyra/releases/download/v1.0.0/Veyra-v1.0.0.apk)

Install it on Android: tap the download → allow **"install unknown apps"** for
your browser when asked → open the APK → Install. The app is a shell that opens
your live Veyra site, so it updates automatically whenever the site updates.

### Share it with anyone

Create a **GitHub Release** to get a permanent download link (this is how
`v1.0.0` above was published):

```bash
git tag v1.0.0
git push origin v1.0.0
```

Wait for the workflow to finish, then open GitHub → **Releases** → `v1.0.0` — the APK is attached. Share that link. Friends install it by tapping the APK and allowing **"install unknown apps"** for their browser (a normal Play Protect warning appears — tap *Install anyway*). No store fees, no reviews.

### Signing (optional but recommended)

Without a private key, the APK is debug-signed: fine for personal use, but to replace
an installed APK without uninstalling you need a stable key:

```bash
keytool -genkeypair -v -keystore keystore.jks -alias veyra -keyalg RSA -keysize 2048 -validity 10000
```

Then add GitHub secrets (Settings → Secrets and variables → Actions):
- `VEYRA_KEYSTORE_BASE64` = `base64 -w0 keystore.jks` output
- `VEYRA_KEYSTORE_PASSWORD`, `VEYRA_KEY_ALIAS`, `VEYRA_KEY_PASSWORD` = your values

Keep those secrets safe — losing them means you can't update the app later without users uninstalling first.

### Notes

- Content updates are instant: the APK is a shell, so every change you push goes live without a new APK.
- Android-only. iOS requires a paid Apple Developer account ($99/year) — not available on a 0$ budget.
- If you ever have $25, the same app can be published on the Play Store later — nothing is wasted.

### Docker

```bash
npm run build
docker build -t veyra .
docker run -p 3000:3000 veyra
```

### Manual

```bash
npm run build
npm run start
```

## License

MIT
