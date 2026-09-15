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
3. Copy the **Transaction** mode connection string
4. Set it in your environment:
   ```
   DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"
   ```
5. Apply the migration (included in this repo):
   ```bash
   npx prisma migrate deploy
   ```

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables (including Supabase `DATABASE_URL` from above)
4. Deploy

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
