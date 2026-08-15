# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/quote-invoice-builder/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> This file documents what is **actually implemented** in the codebase (not a generic
> generated recommendation) — source of truth is `web/src/app/globals.css` and
> `web/src/app/layout.tsx`. If they ever drift from this doc, the code wins; update this
> file to match.

---

**Project:** Quote Invoice Builder
**Style:** Warm Professional (flat, token-driven shadcn/ui)
**Stack:** Next.js App Router + Tailwind v4 (CSS `@theme`) + shadcn/ui primitives
**Rolled out to:** entire app — Dashboard, Quotes, Invoices, Customers, Products, Business
Profile, Register, Login. `/` is a redirect-only route (no UI) and needs nothing.
**Updated:** 2026-08-15

## App Shell (Sidebar / Header / Footer)

Every authenticated route lives under the `web/src/app/(app)/` route group, wrapped by
`web/src/app/(app)/layout.tsx`, which renders the shared shell:

- `web/src/components/layout/app-sidebar.tsx` — desktop-only (`hidden lg:flex`, `lg:` and
  up), `w-64`, uses the `--sidebar-*` tokens (`bg-sidebar`, `text-sidebar-foreground`,
  `border-sidebar-border`) — a distinct token pair from the app's global `--primary`, kept
  separate on purpose so the sidebar reads correctly against its own background in both
  themes. Contains: wordmark, "+ Create Quote" CTA, then `NAV_ITEMS`
  (`web/src/components/layout/nav-items.ts` — Dashboard, Customers, Products & Services,
  Quotes, Invoices, Business Profile).
- `web/src/components/layout/mobile-nav.tsx` — same nav, `< lg`, via shadcn `Sheet`
  (hamburger trigger in the header). No separate bottom tab bar.
- `web/src/components/layout/app-header.tsx` — wordmark (mobile only) + `UserMenu`
  (initials-circle avatar, matches the existing icon-badge pattern from the dashboard
  stat cards — no shadcn `avatar` primitive added, not needed). No page title (every page
  already renders its own `<h1>`) and no per-tenant business name in the header (that's
  the footer's job — see below).
- `web/src/components/layout/app-footer.tsx` — minimal, "© {year} {business name}",
  falls back to "Quote & Invoice Builder" before a `BusinessProfile` row exists.
- `web/src/components/layout/nav-link.tsx` — shared active-state nav row, used by both
  sidebar and drawer. **Important RSC gotcha**: this is a client component, so its `icon`
  prop is a pre-rendered `ReactNode` (`<Icon className="size-4" />`), never a raw
  component reference — passing a component/function as a prop from a server component
  into a client component fails serialization ("Functions cannot be passed directly to
  Client Components"). Always render the icon at the call site, not inside `NavLink`.

`/login`, `/register`, `/` stay outside `(app)/` — no shell, unchanged.

---

## Global Rules

### Color Palette

Defined as CSS custom properties in `web/src/app/globals.css` (`:root` / `.dark`), consumed
by Tailwind via `@theme inline` — never hardcode hex/zinc-* classes, always use the
semantic Tailwind class (`bg-primary`, `text-muted-foreground`, etc).

| Role | Light (oklch) | Dark (oklch) | Tailwind class |
|------|---------------|--------------|-----------------|
| Background | `oklch(0.99 0.005 80)` | `oklch(0.16 0.015 50)` | `bg-background` |
| Foreground | `oklch(0.22 0.02 50)` | `oklch(0.96 0.01 75)` | `text-foreground` |
| Card | `oklch(1 0 0)` | `oklch(0.21 0.02 50)` | `bg-card` |
| Primary (terracotta) | `oklch(0.55 0.14 45)` | `oklch(0.68 0.14 50)` | `bg-primary` / `text-primary` |
| Primary foreground | `oklch(0.99 0.005 80)` | `oklch(0.16 0.02 50)` | `text-primary-foreground` |
| Secondary | `oklch(0.95 0.02 75)` | `oklch(0.28 0.02 50)` | `bg-secondary` |
| Muted | `oklch(0.96 0.012 75)` | `oklch(0.28 0.02 50)` | `bg-muted` |
| Muted foreground | `oklch(0.5 0.02 50)` | `oklch(0.68 0.02 60)` | `text-muted-foreground` |
| Accent (icon badges) | `oklch(0.93 0.035 55)` | `oklch(0.3 0.03 50)` | `bg-accent` |
| Destructive | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `text-destructive` / `bg-destructive` |
| Border | `oklch(0.9 0.015 70)` | `oklch(1 0 0 / 10%)` | `border-border` |
| Chart scale | 5-step warm terracotta ramp, `--chart-1`…`--chart-5` | same | `bg-chart-1`…`5` |

**Notes:** warm cream background + burnt-terracotta primary, replacing the original
zero-chroma shadcn grayscale default. `--destructive` was left as-is (already a warm red,
hue 27 — no clash with primary at hue 45). Dark mode tokens are defined but currently
unreachable — no `ThemeProvider`/toggle wired up yet.

### Typography

- **Font:** Plus Jakarta Sans (single family, "Friendly SaaS" pairing — chosen over
  Poppins/Open Sans two-font pairing for simplicity) — `--font-app-sans`, loaded via
  `next/font/google` in `layout.tsx`, applied through `--font-sans` / `--font-heading` in
  `globals.css`. No separate heading font; weight/size carries hierarchy instead.
- **Mono:** Geist Mono — kept from the original setup, used specifically for **money and
  quantity figures** (`font-mono` on every amount cell/line) so digits stay tabular and
  scannable in tables and summaries. Not used for prose.
- Do not add more font families — this app has exactly two: `font-sans` (default) and
  `font-mono` (numbers only).

### Spacing / Radius

Uses Tailwind's default spacing scale directly (no custom `--space-*` tokens). Radius is
token-driven off a single `--radius: 0.625rem` base in `globals.css`, scaled via
`--radius-sm/md/lg/xl/2xl/3xl/4xl` — components pick the Tailwind radius utility
(`rounded-lg`, `rounded-xl`, `rounded-full`) rather than hardcoding px values.

### Shadows

Not used as a design element. Cards use a 1px `ring-foreground/10` (see `card.tsx`)
instead of box-shadow — flat, no elevation layers. Don't introduce `shadow-md`/`shadow-lg`
utilities; use ring/border for separation instead.

---

## Component Specs

Components are shadcn/ui primitives in `web/src/components/ui/` (Button, Card, Badge,
Input, Label, Select, Table, Textarea) — **never write new one-off `.btn`/`.card` CSS**.
Extend variants via `class-variance-authority` in the primitive file if a new visual
variant is genuinely needed; otherwise compose with existing variants + Tailwind
utilities on `className`.

### Buttons (`components/ui/button.tsx`)

- `variant="default"` — `bg-primary text-primary-foreground hover:bg-primary/80` — primary
  CTA (Create Quote, Save, submit actions)
- `variant="outline"` — bordered, `hover:bg-muted` — secondary actions (Edit, Cancel,
  pagination)
- `variant="destructive"` — `bg-destructive/10 text-destructive` — Delete
- `variant="secondary"`, `"ghost"`, `"link"` — as needed
- Sizes: `default`, `xs`, `sm`, `lg`, `icon` family
- Wrap with `<Link>` for navigation (`<Link href="..."><Button>...</Button></Link>`), not a
  raw styled `<a>`/`<Link>`

### Cards (`components/ui/card.tsx`)

- `Card` / `CardHeader` / `CardTitle` / `CardContent` / `CardFooter` — flat, `rounded-xl`,
  `ring-1 ring-foreground/10`, no shadow
- Stat-tile pattern (Dashboard): `Card` wrapped in `<Link>`, `CardContent` as
  `flex items-center gap-4`, icon in a `size-10 rounded-full bg-accent text-accent-foreground`
  circle, label `text-xs uppercase text-muted-foreground`, value `font-mono text-xl
  font-semibold`
- List-row hover pattern: `rounded-lg px-2 py-2.5 hover:bg-muted transition-colors`

### Badges (`components/ui/badge.tsx`)

- Status pills use `variant` mapped from domain status (`QuoteStatusBadge`,
  `InvoiceStatusBadge`) — `default` (primary), `secondary`, `destructive` — never a raw
  colored `<span>`

### Icons

- `lucide-react` only. No emoji, no other icon set. Size via `size-4`/`size-5` Tailwind
  utility, not viewBox tweaking.

### Tables

- Desktop: `components/ui/table.tsx` primitives, header row `bg-muted text-xs uppercase
  text-muted-foreground`, body rows `hover:bg-muted`, container
  `rounded-lg border border-border overflow-x-auto`
- Mobile (`< md`): card-list fallback, not a squeezed table — see `quote-list.tsx` /
  `invoice-list.tsx` for the pattern (`hidden md:block` table + `block md:hidden` cards)

---

## Page Patterns (actual, not landing-page boilerplate)

This is an internal business app (quotes/invoices CRUD), not a marketing site — ignore
generic Hero/Features/CTA landing patterns. Real patterns in use:

- **List page:** `h1` (`font-heading text-2xl font-semibold`) + subtitle
  (`text-sm text-muted-foreground`) → filter bar (search + 2 selects) + primary "Create"
  button → responsive table/card list → pagination
- **Detail page:** header (title + status badge + customer name) + right-aligned status
  actions → stacked `Card`s for Details / Items table / Financial Summary / Notes
- **Form page:** two-column (`lg:grid-cols-[1fr_320px]`) — fields + line items on the
  left, sticky summary card with live preview totals + submit button on the right
- **Dashboard:** greeting header + CTA → 4-up stat tile grid → 2-up recent-activity cards
  → quick-link buttons

---

## Anti-Patterns (Do NOT Use)

- ❌ Hardcoded `zinc-*`/`gray-*`/hex colors — always the semantic token class
- ❌ `text-red-600` for errors — use `text-destructive`
- ❌ New CSS files or `<style>` blocks — Tailwind utilities only (CLAUDE.md rule: no inline CSS)
- ❌ `shadow-md`/`shadow-lg` box-shadow elevation — this system is flat (ring/border only)
- ❌ Emoji as icons — `lucide-react` only
- ❌ A second font family — `font-sans` (Plus Jakarta Sans) and `font-mono` (Geist Mono,
  numbers only) are the only two
- ❌ Money/quantity figures without `font-mono`
- ❌ Landing-page sections (Hero/Features/pricing) — this is an internal app
- ❌ Missing `cursor-pointer` on clickable elements, layout-shifting hover transforms,
  instant (non-transitioned) state changes, invisible focus states

---

## Pre-Delivery Checklist

- [ ] Colors are semantic Tailwind classes, not zinc-*/hex
- [ ] Money/quantity values use `font-mono`
- [ ] Icons are `lucide-react`, sized via `size-*`
- [ ] Buttons/Cards/Badges reuse `components/ui/*` primitives, no new one-off CSS
- [ ] Hover states use `bg-muted`/`opacity`/`ring` transitions (150-300ms), no shadow pop or layout shift
- [ ] Table has a `< md` card fallback (no squeezed table on mobile)
- [ ] Light mode contrast ≥ 4.5:1 (dark mode tokens exist but are currently unreachable — no toggle wired up)
- [ ] `npm run typecheck && npm run lint && npm test` clean before calling it done

---

## Rollout Status

| Area | Status |
|------|--------|
| Dashboard | ✅ Redesigned |
| Quotes (list/detail/form/status-actions) | ✅ Redesigned |
| Invoices (list/detail/form/status-actions/payment) | ✅ Redesigned |
| Customers (list/detail/form/delete) | ✅ Redesigned — list rebuilt onto shadcn `Table` (was raw HTML); mobile card icons fixed from broken emoji/mojibake to `lucide-react` |
| Products (list/detail/form/delete) | ✅ Redesigned — list rebuilt onto shadcn `Table`+`Input`+`Button` (was fully raw HTML, no mobile fallback) to match the rest of the app |
| Login / Register / Business Profile | ✅ Redesigned — all three were raw `<input>`/`<label>`/`<button>` HTML, converted onto shadcn `Input`/`Label`/`Button` primitives |

Full rollout complete as of 2026-08-14. Any new page/component should be built directly
against this Master file's rules — no more legacy grayscale/raw-HTML areas remain as a
reference for "the old way."
