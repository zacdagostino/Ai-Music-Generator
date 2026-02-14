# Held in Song

Production-ready Next.js application for boutique personalized tribute compositions.

## Stack

- Next.js 16 (App Router) + TypeScript
- TailwindCSS + Framer Motion
- Prisma + PostgreSQL
- NextAuth (credentials)
- Stripe Checkout + webhook route
- Suno provider integration via env-configurable service
- Local storage driver abstraction with S3/R2 placeholder

## Features Implemented

- Calm atmospheric design system with:
  - slow gradient background
  - low-opacity dust particle canvas
  - subtle parallax
  - ritual fade/blur transitions
  - composing ceremony screen
- Full public route map:
  - `/`, `/in-memory`, `/in-love`, `/begin/in-memory`
  - `/checkout`, `/compose/:orderId`, `/reveal/:orderId`, `/memory/:slug`
  - `/terms`, `/privacy`, `/refund`
- Auth/app/admin routes:
  - `/login`, `/account`, `/orders`
  - `/admin`, `/admin/orders/:id`
- Guided 9-step ritual flow for “In Memory”
- Order model persistence with structured JSON answers
- Prompt engine (`buildPromptPack`) with feeling/music mapping and refrain/letter integration
- Stripe checkout API + webhook payment confirmation
- Generation pipeline with:
  - multi-candidate Suno jobs (2-4 by tier)
  - scoring and best-attempt auto-select
  - asset persistence
- Tier-gated slideshow generation placeholder for Visual/Legacy
- Memory page privacy by default with signed token view and visibility toggle
- Analytics events:
  - `page_view`, `begin_ritual`, `complete_ritual`, `checkout_started`, `purchase`, `reveal_viewed`
- Seed script creating an admin user and demo order

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

Optional for S3/R2:

- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_REGION`

## Run Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:sql
# Apply migration SQL to your Postgres DB with your preferred SQL client
npm run seed
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Prisma

- Schema: `prisma/schema.prisma`
- SQL migration: `prisma/migrations/202602141900_init/migration.sql`

If you prefer Prisma-managed DB migrations against your local DB:

```bash
npx prisma migrate dev --name init
```

## Stripe Setup

1. Create products/prices in dashboard (or use dynamic line items as currently implemented).
2. Start local webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

On `checkout.session.completed`, the app marks order paid and starts generation.

## Suno Provider Setup

`SunoService` is located at `lib/suno/service.ts`.

- Default expected endpoints:
  - `POST {SUNO_API_BASE_URL}/generations`
  - `GET {SUNO_API_BASE_URL}/generations/:jobId`
- If provider shape differs, update mapping in:
  - `createGenerationJob`
  - `pollUntilComplete`

When Suno env vars are missing, service falls back to mock mode for development.

## Example cURL

Create order after ritual:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "eventType": "IN_MEMORY",
    "answers": {
      "honoreeName": "Evelyn",
      "relationshipType": "Grandparent",
      "descriptors": ["Kind", "Steady", "Radiant"],
      "vividMemory": "She folded letters at the kitchen table every Sunday.",
      "feeling": "Peace",
      "musicStyle": "Gentle piano"
    }
  }'
```

Set tier + add-ons:

```bash
curl -X PATCH http://localhost:3000/api/orders/<ORDER_ID> \
  -H "Content-Type: application/json" \
  -d '{"tier":"SACRED_COMPOSITION","addOns":["extraRevision"]}'
```

Start generation manually (dev fallback):

```bash
curl -X POST http://localhost:3000/api/orders/<ORDER_ID>/generate
```

Poll compose status:

```bash
curl http://localhost:3000/api/orders/<ORDER_ID>/status
```

## Notes

- Slideshow generation is intentionally a placeholder file currently (`lib/slideshow/service.ts`) and is ready to replace with ffmpeg job logic.
- Middleware works in Next 16 but emits a deprecation warning for future migration to `proxy.ts`.
- Storage abstraction exists in `lib/storage/service.ts`; switch to S3/R2 by implementing `PlaceholderS3Service`.
