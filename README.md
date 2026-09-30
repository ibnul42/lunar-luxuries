# Lunar Luxuries — Development Plan

A full-stack e-commerce store (jewelry, home & living, beauty, apparel, accessories, gifts) built from
the **Lunar Luxuries** design project on the *Organic* design system.

- **Design source of truth:** https://claude.ai/design/p/db42182c-6007-4c7d-920a-c115814ba2e0
- **Scope:** 29 screens — 20 storefront + 9 admin
- **Status:** Phase 0 in progress. Frontend scaffolded with the design system wired;
  Postgres + Prisma and email/password auth (register, login, logout, session) are in.
  No OAuth, no payments, no product data yet.

> The `.dc.html` files in the design project are **prototypes of intent**, not production code.
> They use a small prototype runtime (`<x-dc>`, `sc-for`, `sc-if`, `DCLogic`) and inline styles.
> We recreate them in the stack below, matching pixels and behaviour — we do not port the markup.

---

## 0. Running it locally

**Prerequisites:** Node.js **20.19+ / 22.12+ / 24+** (developed on 25.x — Prisma 7
requires one of those ranges), npm 10+, and a **PostgreSQL 14+** server you can
create a database on.

```bash
# 1. Install root tooling + the frontend's dependencies
npm run setup

# 2. Start everything
npm run dev
```

The storefront comes up on **http://localhost:3000**.

| Route | What it is |
| --- | --- |
| http://localhost:3000 | Storefront — nav, hero, category grid |
| http://localhost:3000/admin | Admin dashboard shell |
| http://localhost:3000/dev/kitchen-sink | Every design-system primitive on one page (dev only — 404s in production) |
| http://localhost:4000/api/health | API liveness check — `{ status, uptime, timestamp }` |

### Root scripts

Run these from the repo root. Each delegates into `frontend/`, so you never need
to `cd` unless you want to.

| Command | Does |
| --- | --- |
| `npm run setup` | Installs root + frontend dependencies |
| `npm run dev` | Starts all apps together via `concurrently` |
| `npm run build` | Production build of both apps |
| `npm run start` | Serves both production builds (run `build` first) |
| `npm run lint` | ESLint, both apps |
| `npm run typecheck` | Regenerates route types, then `tsc --noEmit`, both apps |
| `npm run format` | Prettier — rewrites files, sorts Tailwind classes |
| `npm run check` | typecheck + lint + format check across both apps — run before pushing |
| `npm run db:migrate` | Applies the Prisma migrations, then regenerates the client |
| `npm run db:studio` | Prisma Studio — browse and edit rows |

Every script except `dev`/`start` chains the two apps with `&&`. To run just one, use
its scoped script (`npm run dev:frontend`, `npm run dev:backend`) or work inside the
package directly.

`npm run dev` uses `concurrently -k`, so **if one app crashes the others are shut
down too** — you never end up with a half-running stack. Output is prefixed per
app (`[frontend]`).

To run just one app, either use its script (`npm run dev:frontend`) or work
inside the package directly (`cd frontend && npm run dev`).

### Adding another app

`backend/` (NestJS API) was added this way and is wired in. To add a third app, add
its `dev:<name>` script, list it in `dev`, extend `setup` with
`npm --prefix <name> install`, and — easy to miss — add it to `lint`, `typecheck`,
`format`, `format:check` and `build` too, or `npm run check` silently stops covering it.

### Environment

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env.local
```

Then set `DATABASE_URL` in `backend/.env.local` to your Postgres server and create
the schema:

```bash
npm run db:migrate    # applies prisma/migrations, creating the database if needed
```

`DATABASE_URL` is the one value with no default — the API exits rather than guess a
database. Everything else has one: the frontend's `.env.local` overrides
`NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL`, the backend's sets `PORT` and
`FRONTEND_ORIGIN`. The API validates its environment at startup and exits 1 with a
readable message rather than failing mid-request.

`FRONTEND_ORIGIN` and `NEXT_PUBLIC_API_URL` have to point at each other: the session
cookie is issued by the API for that exact origin, and CORS rejects anything else.

Real secrets (OAuth, payments, email) arrive later (see §8); they belong in the
platform secret store and never in the repo.

---

## 1. Recommended stack

Nothing exists in this repo yet, so we pick the stack. Recommendation and why:

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16 + TypeScript** | Storefront needs SEO + fast first paint (server components), admin needs an app shell. One deploy target for both. |
| Styling | **Tailwind CSS v4** with the Organic tokens as CSS variables | The design is token-driven already; Tailwind v4's `@theme` maps 1:1 onto `--color-*`, `--radius-*`, `--shadow-*`. |
| Database | **PostgreSQL** | Orders, inventory and money need transactions and real constraints. |
| Auth | ~~Auth.js (NextAuth v5)~~ → **own session cookie, issued by the API** | **Superseded.** Auth.js only runs inside Next.js, and the API is a separate service that owns the database. Built instead: Argon2id password hashing, opaque session tokens in an httpOnly cookie, revocable rows in `Session`. Google/Apple are still to come, as OAuth callbacks on the API; §5's `Account` model is still the right shape for them. |
| Payments | **SSL Commerce** | Covers cards, Google Pay and Apple Pay — exactly the three toggles in Admin → Settings → Payment. |
| Media | **S3 + CloudFront** (or Cloudinary) behind `next/image` | Every image in the design is an empty `<image-slot>`; we need a real upload + transform pipeline. |
| Transactional email | **Resend** + React Email | Order confirmation, shipping notice, password reset, newsletter double opt-in. |
| Search | Postgres full-text (phase 1) → **Meilisearch/Typesense** (phase 7 if needed) | The Search screen is simple enough that FTS ships it; swap later if relevance complaints appear. |
| Hosting | **Vercel** + Neon/Supabase Postgres | Matches Next.js; preview deploys per PR. |
| Testing | **Vitest** (unit) + **Playwright** (e2e) | Checkout and admin mutations must have e2e coverage. |
| Observability | **Sentry** + Vercel Analytics | Payment/webhook failures must page someone. |

---

## 2. Design system

Ported verbatim from the design project's `_ds/.../readme.md`. Define these once in `app/globals.css`
and never hard-code a hex, font or px value again.

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#f5ead8` | Page ground |
| `--color-surface` | `#f9f4ed` | Cards, panels, admin sidebar |
| `--color-input` | `#ebddc5` | Input fill |
| `--color-text` | `#201e1d` | Primary text |
| — | `rgba(32,30,29,0.55–0.75)` | Secondary / muted text |
| `--color-accent` | `#c67139` | Terracotta — buttons, active states |
| `--color-accent-dark` | `#8c491a` | Hover / **accent text on light ground** |
| `--color-accent-deep` | `#402310` | Pressed |
| `--color-accent-2` | `#7a8a5e` | Sage — second voice, email band |
| `--color-accent-2-dark` | `#56633f` | Sage hover, "success" status text |
| `--color-accent-2-deep` | `#272e1b` | Sage pressed |

Each role carries a 100–900 OKLCH ramp. Use 100–300 for tinted fills/hovers, 500 as base, 700–900 for
text on tinted fills. Prefer ramp steps over ad-hoc `color-mix()`.

### Type

- **Display:** Caprasimo 400 only — H1 52–60px, H2 30–34px, wordmark 20–22px, kickers 11–12px uppercase / `letter-spacing: 0.14–0.28em`
- **Body:** Figtree 400/600/700 — 12–18px
- Self-host both via `next/font/google` — no render-blocking `<link>` to Google Fonts.

### Shape, elevation, spacing

- Buttons & inputs: `border-radius: 999px`, min-height 48px (44px in admin)
- Cards & panels: `border-radius: 24px` (28px on some panels), admin nav items 14px
- Shadows: `0 20px 48px rgba(46,43,37,0.16)` (cards), `0 12px 32px rgba(46,43,37,0.06)` (admin panels), `0 14px 36px rgba(46,43,37,0.28)` (primary buttons)
- Section padding 56px sides, 72–96px vertical; grid gaps 28px (product grids), 48px (footer/columns)

### Imagery

Every content photograph goes through the "washed" treatment:

```css
.washed { filter: saturate(0.6) contrast(0.85) brightness(1.1) opacity(0.94); }
```

Hero and side panels get a `rgba(46,43,37,0.28) → rgba(46,43,37,0.68)` top-to-bottom overlay.

### Icons

Lucide, `stroke-width: 2.75` (2.25–2.5 in admin and small perk icons). Use `lucide-react`.

### Accessibility notes — decide these in Phase 0

These are real problems in the design, not nitpicks. Fix them at the component level once.

1. **Terracotta `#c67139` on cream is ~3:1.** Fine for icons, large display text and chrome; **not** for body copy. Body-size accent text must use `#8c491a`. Bake this into the `<Link>` and `.text-accent` primitives so it can't regress.
2. **Hover-only navigation.** The nav "Shop" mega-menu and the hero category sidebar flyout both open on `mouseenter` and have no click/keyboard path. Rebuild both as click-or-focus disclosures with `aria-expanded`, Escape-to-close and roving focus. They are unusable on touch as designed.
3. **Muted 12px labels** (`rgba(32,30,29,0.7)` on `#f9f4ed`) sit near the 4.5:1 line. Bump to `0.78` opacity or 13px.
4. **Focus rings.** The prototypes set `outline: none` on inputs. Replace with the system's `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` everywhere.
5. **Custom controls** — the size pills, color swatches, quantity stepper and tab strips are `<div onClick>` in the prototype. Build them as real `<button>` / `radiogroup` / `tablist` with keyboard support.
6. **Mobile.** Every screen in the design is desktop-only (fixed multi-column grids, 56px gutters). Responsive behaviour is **undesigned** — see §10 Open Questions.

---

## 3. Route map

Design file → route → what it needs.

### Customer views (20)

| Design file | Route | Notes |
| --- | --- | --- |
| Homepage | `/` | Hero (full-bleed variant ships), category sidebar, Best Selling, New Arrival, Reviews, email signup band, footer |
| Shop | `/shop` | Category checkbox facets, sort (featured / price ↑ / price ↓ / A–Z), 3-col grid, result count |
| Product | `/products/[slug]` | 4-image gallery + thumbs, color/size options, qty stepper, add-to-cart, wishlist, 4 tabs (Description / Details / Shipping / Reviews), rating histogram, "You may also like" |
| Search | `/search?q=` | Query input, results grid, empty state |
| Cart | `/cart` | Line items, qty edit, remove, totals, checkout CTA |
| Checkout | `/checkout` | Contact → Shipping address → Payment; sticky order summary |
| Order Confirmation | `/orders/[id]/confirmation` | Post-payment thank-you |
| Order Tracking | `/orders/track` + `/orders/[id]` | Status timeline |
| Wishlist | `/wishlist` | Saved items, move-to-cart |
| Account | `/account` | Tabs: Orders / Addresses / Profile settings |
| Login | `/login` | Two-pane; email+password, show/hide, remember me, Google/Apple |
| Register | `/register` | Adds full name, confirm password, Terms checkbox |
| Forgot Password | `/forgot-password` | Request + reset token flow |
| About | `/about` | Static |
| Contact | `/contact` | Form → support inbox |
| FAQ | `/faq` | Static, accordion |
| Shipping & Returns | `/shipping-returns` | Static |
| Privacy | `/privacy` | Static — needs real legal copy |
| Terms | `/terms` | Static — needs real legal copy |
| Not Found | `not-found.tsx` | 404 |

### Admin (9) — all under `/admin`, role-gated

| Design file | Route | Notes |
| --- | --- | --- |
| Admin Login | `/admin/login` | Separate from customer auth |
| Admin Dashboard | `/admin` | 4 stat tiles (Revenue 30d, Orders 30d, New customers, AOV) + delta vs last period; Recent orders; Top products by units + revenue |
| Admin Orders | `/admin/orders` | Search by order # or customer, status filter (Processing / Shipped / Delivered / Refunded), table |
| Admin Order Detail | `/admin/orders/[id]` | Line items, customer, address, status transitions, refund |
| Admin Products | `/admin/products` | List, search, status |
| Admin Product Edit | `/admin/products/[id]` | Name, description, category, status (Active / Draft / Out of stock), price, stock, photo upload |
| Admin Categories | `/admin/categories` | CRUD over the 6 categories |
| Admin Customers | `/admin/customers` | List, order history per customer |
| Admin Settings | `/admin/settings` | **General** (store name, support email, currency **BDT** (default) / USD / EUR / GBP, timezone) · **Shipping** (flat rate, free-over threshold, international on/off) · **Payment** (cards, Google Pay, Apple Pay toggles) |

---

## 4. Phased delivery

Each phase is independently demoable. Estimates assume one full-time developer and are **rough** —
treat them as relative sizing, not commitments.

### Phase 0 — Foundations (~1 week)

- Next.js + TS + Tailwind v4 scaffold, ESLint/Prettier, Husky pre-commit
- Organic tokens → `@theme` block; Caprasimo + Figtree via `next/font`
- Primitive components: `Button` (primary/secondary/ghost/icon), `Input` (pill), `Select`, `Checkbox`, `Tag`, `Card`, `Tabs`, `Dialog`, `StatusPill`, `StarRating`, `QuantityStepper`, `Washed` image wrapper
- Shells: `StorefrontLayout` (nav + footer), `AdminLayout` (sidebar)
- Postgres + Prisma wired, first migration, seed script skeleton
- Storybook (or a `/dev/kitchen-sink` route) so the primitives are reviewable against the design
- CI: typecheck, lint, unit tests on PR

**Exit:** a nav + footer page renders pixel-matched to the design at 1440px, with tokens only.


## 5. Data model

Every `*Cents` field is an **integer in the currency's minor unit** — poisha for the default BDT,
cents for USD. The name is kept for familiarity; all four selectable currencies are 2-decimal, so
the arithmetic is identical. Never store or compute money as a float.

```
User            id, email(unique), passwordHash?, name, emailVerifiedAt, role(CUSTOMER|STAFF|ADMIN), createdAt
                -- built; email is stored lower-cased, passwordHash is Argon2id and null for OAuth-only accounts
Session         id, tokenHash(unique), userId, expiresAt, createdAt
                -- built; the cookie holds the raw token, the table only its SHA-256
Account         (OAuth link: provider, providerAccountId, userId) -- not built, no OAuth yet
Address         id, userId, label, firstName, lastName, line1, line2, city, state, postalCode,
                country, phone, isDefault
Category        id, slug(unique), name, description, imageUrl, sortOrder, parentId?
Product         id, slug(unique), name, description, categoryId, status(ACTIVE|DRAFT|OUT_OF_STOCK),
                basePriceCents, compareAtPriceCents?, isFeatured, isNewArrival, createdAt
ProductImage    id, productId, url, alt, sortOrder
ProductVariant  id, productId, sku(unique), optionValues(jsonb), priceCents, stockQty
ProductSpec     id, productId, label, value, sortOrder     -- the PDP "Details" tab
Review          id, productId, userId?, authorName, rating(1..5), body, status(PENDING|PUBLISHED),
                createdAt
Cart            id, userId?, anonymousToken?, expiresAt
CartItem        id, cartId, variantId, qty, unitPriceCents  -- price snapshot
WishlistItem    id, userId, productId, createdAt
Order           id, number(unique), userId?, email, status(PROCESSING|SHIPPED|DELIVERED|REFUNDED|CANCELLED),
                subtotalCents, shippingCents, taxCents, totalCents, currency,
                shippingAddress(jsonb), billingAddress(jsonb), placedAt
OrderItem       id, orderId, variantId, nameSnapshot, unitPriceCents, qty
Payment         id, orderId, provider, providerPaymentId, status, amountCents, rawPayload(jsonb)
Shipment        id, orderId, carrier, trackingNumber, shippedAt, deliveredAt
StoreSetting    key(unique), value(jsonb)   -- store name, support email, currency, timezone,
                                            -- flatRateCents, freeShippingThresholdCents,
                                            -- internationalShipping, payCards/payGoogle/payApple
NewsletterSub   id, email(unique), confirmedAt, unsubscribedAt
AuditLog        id, actorId, action, entity, entityId, diff(jsonb), createdAt
```

## 6. Seed data

**Categories:** Jewelry · Home & Living · Beauty · Apparel · Accessories · Gifts

**Products (12):**

| Product | Price | Category |
| --- | --- | --- |
| Hand-Poured Soy Candle | $32 | Home & Living |
| Gold-Plated Hoop Earrings | $45 | Jewelry |
| Linen Throw Blanket | $68 | Home & Living |
| Ceramic Pour-Over Set | $54 *(was $68)* | Home & Living |
| Sculpted Brass Vase | $58 | Home & Living |
| Cashmere Wrap Scarf | $96 | Accessories |
| Botanical Bath Oil | $38 | Beauty |
| Woven Leather Tote | $118 | Accessories |
| Stoneware Mug Pair | $38 | Home & Living |
| Fine Chain Necklace | $52 | Jewelry |
| Wool Knit Throw Pillow | $42 | Home & Living |
| Linen Loungewear Set | $88 | Apparel |

The Ceramic Pour-Over Set is the fully-specified PDP example (4.8★ / 126 reviews, 6 spec rows, rating
histogram, 4 sample reviews) — use it as the seed fixture for PDP development and e2e tests.

**Store defaults:** name "Lunar Luxuries", support `hello@lunarluxuries.com`, **BDT**, international
shipping on, cards + Google Pay on, Apple Pay off.

> **Re-pricing is outstanding.** The 12 product prices above, the $8.00 flat shipping rate and the
> $75.00 free-shipping threshold are all USD figures carried over from the design. They are *not*
> valid BDT amounts — ৳75 is well under a dollar. Someone with market knowledge needs to set real
> BDT prices before the seed script is written; do not straight-convert at spot rate and ship it.

---

## 7. Assets & content still needed (blocking)

Every image in the design is an empty `<image-slot>` or a striped placeholder swatch. Before Phase 1
can be considered done we need:

- Hero photography (homepage, login, register left panels) — landscape, works under a dark overlay
- 4 gallery images per product × 12 products, 4:5 crop
- 6 category images
- Logo / wordmark files and a favicon set
- Real copy for About, FAQ, Shipping & Returns
- **Legal review** of Terms and Privacy — not placeholder text at launch

---

## 8. Security & compliance

**The Checkout design collects raw card number, expiry and CVC in plain `<input>` fields.
Do not implement that.** Doing so puts the application in PCI-DSS SAQ D scope, meaning quarterly ASV
scans, annual audits and full liability for card data. Instead:

- Use **Stripe Payment Element** (iframed fields — card data never touches our servers, keeping us in SAQ A)
- Style it via Stripe's Appearance API to match: pill radius `999px`, fill `#ebddc5`, focus border `#c67139`, Figtree 14px

The visual result is near-identical to the design; the compliance difference is enormous.

Also in scope:

- Argon2id password hashing; email enumeration-resistant login and reset responses
- Rate limiting on login, register, reset, contact and newsletter endpoints
- Server-side price recalculation on every checkout — the client sends variant IDs and quantities, never prices
- Idempotency keys on payment intent creation; signature-verified, replay-safe Stripe webhooks
- Row-level authorization on every `/account` and `/admin` query — never trust an ID from the URL
- GDPR/CCPA: cookie consent, data export and deletion endpoints, documented retention policy
- Secrets in the platform's secret store, never in the repo; separate Stripe keys per environment

---

## 9. Testing & environments

**Test pyramid**

- *Unit (Vitest):* pricing engine (shipping threshold boundary at exactly the free-shipping amount, tax rounding, minor-unit arithmetic), cart merge on login, filter/sort logic, stock decrement
- *Integration:* API routes against a throwaway Postgres (Testcontainers)
- *E2E (Playwright):* browse → add to cart → guest checkout → order confirmation; register → login → order history; admin edits a product and it appears on the storefront; admin marks an order shipped and the customer sees it
- *Visual regression:* Playwright screenshots of all 29 screens vs. the design references, at 1440px

**Environments**

| Env | Branch | Data | Stripe |
| --- | --- | --- | --- |
| Local | — | seeded | test |
| Preview | per-PR | branched DB | test |
| Staging | `main` | anonymized copy | test |
| Production | tagged release | live | live |

---

## 10. Open questions

Answers to these change the work materially — worth resolving before Phase 0 ends.

1. **Payment provider — now blocking.** §1 picks **SSL Commerce** (SSLCommerz); §8 prescribes
   **Stripe Payment Element**. These contradict, and defaulting to BDT forces the issue: Stripe does
   not offer merchant accounts to Bangladesh-based businesses, so a BDT-settling store most likely
   cannot use it. SSLCommerz is the conventional choice locally and also covers bKash/Nagad, which
   the design does not show at all. Confirm the provider before any checkout work starts — it
   determines the SAQ scope, the webhook design and the Payment settings UI. The §8 *principle*
   (never take raw card fields on our own form; keep card data in the provider's hosted/iframed
   fields) holds regardless of which provider wins.
2. **Mobile.** No responsive designs exist. Do we get mobile comps, or do we derive breakpoints ourselves? A store without a good mobile experience will lose most of its traffic — this is the single biggest gap in the design.
3. **Variants.** Confirm the Product/Admin contradiction in §5 and who updates the Admin Product Edit design.
4. **Guest checkout** — confirmed as intended?
5. **Tax.** 8% flat is a prototype stand-in. Which jurisdictions do we sell into, and do we use Stripe Tax?
6. **International shipping.** The setting exists, but there are no country pickers, no duties handling and no currency switching in the design despite the currency dropdown in settings. Multi-currency in v1 or not?
7. **Reviews.** Are they written by customers (needs submission UI + moderation queue — neither is designed), or imported from a service like Okendo/Judge.me?
8. **Journal.** The homepage nav links to "Journal" but no such screen exists in the design. Blog in scope?
9. **Inventory source of truth.** Is stock managed only here, or synced from an existing system/warehouse?
10. **Launch target date** — drives how much of Phase 7 and how many "later" items get pulled forward.

---

