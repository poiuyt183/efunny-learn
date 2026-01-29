# Nền tảng Học tập AI - Setup Guide

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database (hoặc Neon/Supabase)
- Google AI API key
- Stripe account

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` và điền thông tin:

```bash
cp .env.example .env
```

**Required variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_GENERATIVE_AI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `STRIPE_SECRET_KEY`: Get from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### 3. Setup database

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed Spirit Animals
npm run seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

- **User Management**: `user`, `account`, `session`
- **Subscriptions**: `Subscription` (FREE/BASIC/PREMIUM)
- **Children**: `Child`, `DailyUsage`, `ChildAnalysis`
- **Spirit Animals**: `SpiritAnimal` (5 types)
- **AI Chat**: `ChatSession`, `Message`
- **Marketplace**: `Tutor`, `Booking`

## 🎯 Spirit Animals

1. **Rồng (Dragon)** - Analytical, Independent
2. **Phượng Hoàng (Phoenix)** - Curious, Social
3. **Rùa (Turtle)** - Patient, Methodical
4. **Hổ (Tiger)** - Energetic, Kinesthetic
5. **Kỳ Lân (Unicorn)** - Balanced, Visual

## 💳 Subscription Tiers

| Tier | Price | Children | Questions/Day |
|------|-------|----------|---------------|
| FREE | 0đ | 1 | 10 |
| BASIC | 99,000đ | 2 | 50 |
| PREMIUM | 199,000đ | 5 | Unlimited |

## 📚 Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **Database**: PostgreSQL + Prisma
- **AI**: Google Gemini 2.0 Flash (via Vercel AI SDK)
- **Auth**: Better Auth
- **Payment**: Stripe (Subscriptions + Connect)
- **Styling**: Tailwind CSS v4

## 🔗 Useful Links

- [Implementation Plan](/.gemini/antigravity/brain/ddfa0d0d-18a8-4d6f-b604-142c3964732e/implementation_plan.md)
- [Task Breakdown](/.gemini/antigravity/brain/ddfa0d0d-18a8-4d6f-b604-142c3964732e/task.md)
