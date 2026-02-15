# Held in Song

Production-ready Next.js application for boutique personalized compositions with launch focus on first 10 paid orders.

## Stack

- Next.js 16 (App Router) + TypeScript
- TailwindCSS + Framer Motion
- Prisma + PostgreSQL
- NextAuth (credentials)
- Stripe Checkout + webhook route
- Suno provider integration via env-configurable service
- Local storage abstraction (S3/R2 placeholder)

## Current Product Scope

- Live collections:
  - `In Memory`
  - `In Love`
- Guided ritual flows for both collections
- Tiered checkout:
  - Sacred Composition (`$169`)
  - Visual Tribute (`$219`)
  - Legacy Collection (`$289`)
- Physical fulfillment support (US-only launch):
  - QR keepsake card
  - Linen lyric print
- Admin fulfillment controls:
  - shipping status transitions
  - tracking number capture
  - fulfillment notes
- Launch dashboard metrics:
  - CVR by collection
  - AOV
  - add-on attach rate
  - CAC proxy from ad spend input
- Reveal flow includes:
  - composition playback
  - fulfillment state
  - post-purchase feedback + testimonial consent

## Route Map

Public:
- `/`
- `/in-memory`
- `/in-love`
- `/begin/in-memory`
- `/begin/in-love`
- `/checkout`
- `/compose/:orderId`
- `/reveal/:orderId`
- `/memory/:slug`
- `/terms`, `/privacy`, `/refund`

Auth/App:
- `/login`
- `/account`
- `/orders`

Admin:
- `/admin`
- `/admin/orders/:id`

## Launch Ops Docs

- `docs/launch/fulfillment-sop.md`
- `docs/launch/support-templates.md`
- `docs/launch/meta-launch-playbook.md`

## Environment Variables

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUNO_API_BASE_URL`
- `SUNO_API_KEY`
- `STORAGE_DRIVER=local|s3`
- `APP_URL`

Optional:
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_REGION`

## Run Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:sql
# Apply migration SQL to your Postgres DB (or run prisma migrate dev)
npm run seed
npm run dev
```

Quality checks:

```bash
npm run test
npm run lint
npm run build
```

## Prisma

- Schema: `prisma/schema.prisma`
- SQL migration: `prisma/migrations/202602141900_init/migration.sql` (plus latest generated migration)

Generate/update migration SQL from schema:

```bash
npm run prisma:migrate:sql
```

## Stripe Setup

1. Start webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. Copy signing secret to `STRIPE_WEBHOOK_SECRET`
3. Ensure `APP_URL` matches your local port

## Notes

- Slideshow generation remains a placeholder service (`lib/slideshow/service.ts`) and is ready to replace with ffmpeg pipeline.
- Middleware currently uses `middleware.ts` (Next 16 emits deprecation warning for future `proxy.ts` migration).
