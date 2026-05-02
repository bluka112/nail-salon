# Admin Dashboard Port — Design

**Date:** 2026-05-02
**Status:** Approved (pending user spec review)

## Goal

Port the dashboard shell, a stats home page, and one sample CRUD feature from `next-shadcn-dashboard-starter` (sibling repo) into the existing `nail-salon` Next.js 16 + Clerk 7 project. The result is a working admin panel mounted at `/admin/*`, signed-in-only via the Clerk integration already wired into nail-salon.

## Non-goals

- Porting every demo page from the starter (kanban, chat, users, forms demos, react-query demo, profile, notifications, exclusive, workspaces, billing).
- Sentry integration.
- The starter's marketing/legal pages (about, privacy-policy, terms-of-service).
- Replacing the mock product backend with real Prisma services.
- Clerk organizations and Clerk billing.
- Migrating nail-salon to a `src/` directory layout.
- Adding a test framework or writing tests.

## Source and target

- **Source:** `/Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter` — Next 16.2.1, React 19, Clerk 6, shadcn `new-york`/`zinc`, `src/` layout.
- **Target:** `/Users/temkanibno/Desktop/LUKKA/nail-salon` — Next 16.2.4, React 19, Clerk 7, shadcn `radix-nova`/`neutral` (today), root layout.

## What gets ported

- **Dashboard shell:** `AppSidebar`, `Header`, `KBar` (Cmd+K), `InfoSidebar`, `PageContainer`, `Providers` (Theme + Toaster + NextTopLoader), `QueryProvider` (TanStack Query).
- **UI primitives:** all ~60 components in `src/components/ui/*`.
- **Theme system:** `next-themes` provider + 10 theme stylesheets (`astro-vista`, `claude`, `light-green`, `mono`, `neobrutualism`, `notebook`, `supabase`, `vercel`, `whatsapp`, `zen`).
- **Home stats page:** `app/dashboard/overview/*` — parallel-route layout with four stat tiles (`@area_stats`, `@bar_stats`, `@pie_stats`, `@sales`), recharts-powered.
- **Sample CRUD:** the starter's product feature — list (TanStack Table + nuqs filtering/sorting/pagination), create (`/new`), view/edit (`/[productId]`), backed by `constants/mock-api.ts`.
- **Auxiliary:** `not-found.tsx`, `global-error.tsx` (Sentry-stripped).
- **Auth pages:** Clerk-7 `<SignIn />` and `<SignUp />` mounted under `(public)/auth/sign-in` and `(public)/auth/sign-up`.

## What gets dropped during port

- `org-switcher.tsx`, `nav-projects.tsx`, `cta-github.tsx`, `github-stars-button.tsx`.
- RBAC `requireOrg` / `permission` / `plan` / `feature` / `role` props in nav config and `nav-main.tsx` access checks.
- Billing page and any Clerk billing imports.
- `mock-api-users.ts` (only the product mock backend ships).
- Sentry instrumentation, Sentry wrapper inside `global-error.tsx`.

## Architecture

### URL structure

```
/                          → existing (public)/page.tsx
/auth/sign-in              → Clerk <SignIn />, in (public)
/auth/sign-up              → Clerk <SignUp />, in (public)
/admin                     → redirect to /admin/overview
/admin/overview            → stats home (parallel routes)
/admin/product             → product list
/admin/product/new         → create product
/admin/product/[productId] → view/edit product
```

### Provider tree (root `app/layout.tsx`)

The starter's tree is preserved as-is, with ClerkProvider remaining inside `providers.tsx` (not lifted to the root). The root layout becomes `async` to read the active-theme cookie:

```
<html lang="en" suppressHydrationWarning data-theme={themeToApply}>
  <head>{/* meta theme color script */}</head>
  <body className={cn('bg-background ... font-sans antialiased', fontVariables)}>
    <NextTopLoader />
    <NuqsAdapter>
      <ThemeProvider>                        {/* next-themes */}
        <Providers activeThemeValue={themeToApply}>
          {/*   Providers internally wraps:
                  <ActiveThemeProvider>
                    <ClerkProvider appearance={...vars only...}>
                      <QueryProvider>{children}</QueryProvider>
                    </ClerkProvider>
                  </ActiveThemeProvider>
          */}
          <Toaster />
          {children}
        </Providers>
      </ThemeProvider>
    </NuqsAdapter>
  </body>
</html>
```

**Fonts:** the starter ships `components/themes/font.config.ts` with Geist + Geist_Mono + ~12 additional theme-specific fonts. Nail-salon's existing standalone Geist import is **dropped** in favour of the starter's font system (which is a superset and is required by the theme switcher). The `--font-sans` CSS variable is provided by the starter's `fontVariables` and continues to map to Geist.

**Clerk appearance prop:** the starter passes a CSS-variable-based `appearance` block to `ClerkProvider` *plus* a `baseTheme: dark` from `@clerk/themes`. We keep the CSS-variable block (it makes Clerk modals match the active theme without an extra package) and drop the `baseTheme` line and the `@clerk/themes` import.

### Admin shell (`app/(admin)/layout.tsx`)

```
<KBar>
  <SidebarProvider defaultOpen={cookies().get('sidebar_state') === 'true'}>
    <AppSidebar />
    <SidebarInset>
      <Header />
      <InfobarProvider defaultOpen={false}>
        {children}
        <InfoSidebar side="right" />
      </InfobarProvider>
    </SidebarInset>
  </SidebarProvider>
</KBar>
```

The current `app/(admin)/layout.tsx` (a Clerk header wrapper) is deleted.

### Public shell (`app/(public)/layout.tsx`)

Unchanged. Auth pages mount inside the existing public layout.

### Auth flow

- `proxy.ts` runs `clerkMiddleware` and calls `auth.protect()` for matchers `['/admin(.*)']`.
- Signed-out visit to `/admin/*` → Clerk redirects to `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (`/auth/sign-in`).
- After sign-in/up → Clerk redirects to `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (`/admin/overview`).
- `(public)/page.tsx` and `/auth/*` remain accessible without auth.

### Required env vars

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/overview
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/overview
```

The first two should already exist in nail-salon's `.env.local`. The four `URL` vars are added.

### Clerk 7 adaptation

The starter uses Clerk 6. Edits during port:

- `<SignedIn>{x}</SignedIn>` → `<Show when="signed-in">{x}</Show>`
- `<SignedOut>{x}</SignedOut>` → `<Show when="signed-out">{x}</Show>`
- Drop `import { dark } from '@clerk/themes'` and any `appearance={{ baseTheme: dark }}` props (Clerk 7 has built-in appearance handling).
- `useUser()`, `useClerk()`, `<UserButton />`, `<SignIn />`, `<SignUp />`, `auth()`, `currentUser()` — names preserved in v7, no edit needed.
- Drop any `useOrganization()`, `<OrganizationSwitcher />`, or `clerkClient.organizations.*` usage (org-switcher is deleted entirely; nav config no longer has org-gated entries).
- `@clerk/nextjs` stays at `^7.3.0`. **Do not install `@clerk/themes`.**

## File layout (after port)

```
nail-salon/
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── overview/
│   │   │   │   ├── @area_stats/
│   │   │   │   ├── @bar_stats/
│   │   │   │   ├── @pie_stats/
│   │   │   │   ├── @sales/
│   │   │   │   ├── error.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── product/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [productId]/page.tsx
│   │   │   └── page.tsx                   # redirect → /admin/overview
│   │   └── layout.tsx                     # shell (replaces existing)
│   ├── (public)/
│   │   ├── auth/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── layout.tsx                     # unchanged
│   │   └── page.tsx                       # unchanged
│   ├── api/branch/                        # unchanged
│   ├── globals.css                        # replaced
│   ├── layout.tsx                         # async root: NextTopLoader + NuqsAdapter + ThemeProvider + Providers (Clerk inside)
│   ├── not-found.tsx                      # ported
│   ├── global-error.tsx                   # ported, Sentry-stripped
│   └── favicon.ico
├── components/
│   ├── ui/                                # ~60 primitives (button.tsx replaced)
│   ├── layout/
│   │   ├── app-sidebar.tsx                # org-switcher removed
│   │   ├── header.tsx                     # Clerk 7 idioms
│   │   ├── info-sidebar.tsx
│   │   ├── page-container.tsx
│   │   ├── providers.tsx
│   │   ├── query-provider.tsx
│   │   └── user-nav.tsx                   # Clerk 7 idioms
│   ├── kbar/
│   ├── modal/
│   ├── themes/
│   ├── icons.tsx
│   ├── nav-main.tsx                       # RBAC org/plan checks stripped
│   ├── breadcrumbs.tsx
│   ├── search-input.tsx
│   └── user-avatar-profile.tsx
├── features/
│   ├── overview/                          # stats components
│   └── products/                          # product feature module (api, components, schemas)
├── hooks/                                 # 10 hooks ported as-is
├── config/
│   ├── data-table.ts
│   ├── infoconfig.ts
│   └── nav-config.ts                      # only Overview + Product entries
├── constants/
│   └── mock-api.ts                        # product mock only
├── lib/                                   # merged: existing prisma.ts, utils.ts + starter's lib helpers
├── styles/
│   ├── theme.css
│   └── themes/                            # 10 theme css files
├── types/                                 # NavGroup, etc. from starter
├── prisma/                                # unchanged
├── proxy.ts                               # auth.protect() for /admin(.*)
├── components.json                        # style: new-york, baseColor: zinc, iconLibrary: radix
├── package.json                           # deps added (see below)
└── ...
```

### Navigation config (`config/nav-config.ts`)

```ts
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/admin/overview', icon: 'dashboard', shortcut: ['d', 'd'], items: [] },
      { title: 'Product',   url: '/admin/product',  icon: 'product',   shortcut: ['p', 'p'], items: [] },
    ],
  },
];
```

No `access` props; no Elements / Pro / Account groups.

## Dependencies

### Add (production)

```
@radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
@radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
@radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu
@radix-ui/react-hover-card @radix-ui/react-icons @radix-ui/react-label
@radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover
@radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area
@radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider
@radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs
@radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group
@radix-ui/react-tooltip
@tabler/icons-react
@tanstack/react-form @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table
cmdk date-fns input-otp kbar match-sorter motion next-themes
nextjs-toploader nuqs react-day-picker react-dropzone react-resizable-panels
react-responsive recharts sharp sonner sort-by uuid vaul zod zustand
@faker-js/faker
```

`tailwindcss-animate` from the starter's deps is vestigial (not imported anywhere in source) — Tailwind v4 uses `tw-animate-css` instead, which nail-salon already has and imports in `globals.css`.

`@faker-js/faker` is required at server runtime by `constants/mock-api.ts` (used to seed the in-memory product store). Listed as a regular dependency, not devDependency.

### Already installed (no action)

`@clerk/nextjs`, `class-variance-authority`, `clsx`, `next`, `radix-ui`, `react`, `react-dom`, `shadcn`, `tailwind-merge`, `tw-animate-css`, `tailwindcss`, `@tailwindcss/postcss`.

### Skip

`@sentry/nextjs`, `@clerk/themes`, `@dnd-kit/*`, `@types/sort-by`, `@types/uuid`, `husky`, `lint-staged`, `oxfmt`, `oxlint`. Also skip `postcss` (project uses v4 via `@tailwindcss/postcss`) and `typescript`/`@types/react`/`@types/node` (already pinned in nail-salon).

### Files skipped because they depend on `@dnd-kit/*`

- `src/components/ui/kanban.tsx` — kanban primitive (only consumer of dnd-kit). Not copied during Phase 3.

## Configuration changes

### `components.json`

```json
{
  "style": "new-york",
  "tailwind": { "baseColor": "zinc", ... },
  "iconLibrary": "radix",
  ...
}
```

Aliases unchanged.

### `app/globals.css`

Replaced with the starter's `src/styles/globals.css` content (Tailwind v4 imports + zinc-derived OKLCH tokens + sidebar tokens). `(public)/page.tsx` will re-render with the new tokens — accepted.

### `tsconfig.json`

No changes. Aliases (`@/*` → root) preserved.

### `proxy.ts`

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### `next.config.ts`

No required changes for this work. If the starter declares `images.remotePatterns` for the mock product images (the mock-api may use placeholder URLs), port that block — verified during implementation.

## Phased implementation order

Each phase ends in a working state.

**Phase 1 — Foundation (deps + styling)**
1. Update `package.json` deps.
2. `bun install`.
3. Update `components.json` to new-york / zinc / radix icons.
4. Replace `app/globals.css` with starter's content.
5. Copy `src/styles/theme.css` and `src/styles/themes/*.css` → `styles/`.
6. Verify: `bun dev` boots; `(public)/page.tsx` renders.

**Phase 2 — Shared infrastructure**
1. Copy `src/lib/*` → `lib/`, merging with existing `utils.ts` (keep one `cn`).
2. Copy `src/types/*` → `types/`.
3. Copy `src/hooks/*` → `hooks/`.
4. Copy `src/constants/mock-api.ts` → `constants/`.
5. Copy `src/config/data-table.ts` and `src/config/infoconfig.ts` → `config/`.
6. Verify: `bunx tsc --noEmit` passes.

**Phase 3 — UI components library**
1. Copy `src/components/ui/*` → `components/ui/` (overwrites `button.tsx`). **Skip `kanban.tsx`** (depends on `@dnd-kit/*` which we are not installing).
2. Verify: typecheck passes; `(public)/page.tsx` still renders.

**Phase 4 — Layout + provider tree**
1. Copy `src/components/layout/*` → `components/layout/`. Edits required:
   - `app-sidebar.tsx`: remove `<OrgSwitcher />` import and usage.
   - `providers.tsx`: remove `import { dark } from '@clerk/themes'` and any `appearance={{ baseTheme: dark }}` props on `<ClerkProvider>` (Clerk 7 has built-in appearance handling).
   - `nav-user.tsx` and `header.tsx`: convert Clerk 6 `<SignedIn>`/`<SignedOut>` to Clerk 7 `<Show when="signed-in">`/`<Show when="signed-out">`; drop any `@clerk/themes` imports.
   - Skip `cta-github.tsx` (unrelated marketing widget).
2. Copy `src/components/kbar/`, `modal/`, `themes/` → `components/`.
3. Copy `src/components/icons.tsx`, `nav-main.tsx`, `breadcrumbs.tsx`, `search-input.tsx`, `user-avatar-profile.tsx` → `components/`. Skip `org-switcher.tsx`, `nav-projects.tsx`, `github-stars-button.tsx`.
   - Edit `nav-main.tsx` to render all items unconditionally (drop the `useFilteredNavItems` call or any `item.access` gate). Since `nav-config.ts` has no `access` props, the filter would be a no-op anyway, but removing the import avoids pulling Clerk org hooks into the sidebar.
   - Edit `hooks/use-nav.ts` to short-circuit: `export function useFilteredNavItems(items) { return items; }` — keep the export so any future caller still resolves, drop the `useOrganization()` body. (Alternative: delete the hook + its imports. Either is fine; short-circuit is lower-risk.)
4. Replace root `app/layout.tsx` with the starter's pattern: `async` function reading `cookies()` for active theme, `<html data-theme>`, body uses `fontVariables` from `components/themes/font.config.ts`, mounts `<NextTopLoader />` + `<NuqsAdapter>` + `<ThemeProvider>` + `<Providers>` + `<Toaster />`. Drop the standalone `Geist`/`Geist_Mono` imports — Geist comes via `font.config.ts`.
5. Write new `(admin)/layout.tsx` (shell from spec).
6. Write `config/nav-config.ts` (Overview + Product only; no `access` props).
7. Verify: typecheck passes.

**Phase 5 — Auth wiring**
1. Update `proxy.ts` per spec.
2. Create `(public)/auth/sign-in/[[...sign-in]]/page.tsx` and `(public)/auth/sign-up/[[...sign-up]]/page.tsx` mounting `<SignIn />` and `<SignUp />`.
3. Document the four `NEXT_PUBLIC_CLERK_*_URL` env vars (add to `.env.example` if one exists, otherwise note for user).
4. Verify: signed-out `/admin/overview` → `/auth/sign-in`; signed-in → admin shell loads.

**Phase 6 — Overview stats page**
1. Copy `src/features/overview/*` → `features/overview/`.
2. Copy `src/app/dashboard/overview/*` → `app/(admin)/admin/overview/`. Rewrite any `/dashboard/*` URLs inside files to `/admin/*`.
3. Write `app/(admin)/admin/page.tsx` as an `async` server component that redirects to `/admin/overview` (mirrors the starter's `app/dashboard/page.tsx` pattern; the auth check inside is redundant given `proxy.ts` but harmless — keep for parity).
4. Verify: `/admin` redirects; charts render.

**Phase 7 — Product CRUD**
1. Copy `src/features/products/*` → `features/products/`. Rewrite internal URLs.
2. Copy `src/app/dashboard/product/*` → `app/(admin)/admin/product/`. Rewrite internal URLs.
3. Verify: list paginates/filters/sorts; create/edit/view subroutes work; mock-api persists in-memory.

**Phase 8 — Final cleanup**
1. Add `app/not-found.tsx` and `app/global-error.tsx` (Sentry-stripped).
2. `bun run build` end-to-end.
3. Manual smoke test: sign-up → land on `/admin/overview` → navigate to `/admin/product` → create/edit/delete a product → use Cmd+K → toggle theme.

## Verification strategy

No tests are added. Verification per phase = build passes + manual smoke. The starter has no tests; nail-salon has no tests. Adding a test framework is out of scope.

## Risks and unknowns

- Some starter UI components may import internal paths not audited line-by-line (e.g., `@/components/icons` re-exports from `@tabler/icons-react`). Mechanical to fix during Phase 3-4.
- KBar shortcut chords reference URLs that get rewritten — verify in Phase 4.
- `header.tsx` may use `<UserButton appearance={dark}>` (Clerk 6 `@clerk/themes`) — replaced with plain v7 usage during Phase 4.
- The starter's `next.config.ts` may declare image domains for mock-api placeholder URLs — port that block if present.
- Tailwind v4 + the starter's globals.css use `@import "tailwindcss"` and `@import "tw-animate-css"` — both already in nail-salon, but the starter may also `@import` `tailwindcss-animate` (a different package). Resolved during Phase 1.

## Out-of-scope follow-ups

These are noted for future work, not part of this port:
- Replace `constants/mock-api.ts` with a real Prisma-backed product service.
- Add Clerk RBAC (e.g., owner vs. staff roles) once the salon actually needs it.
- Add real nail-salon admin pages (appointments, services, staff, customers).
- Test framework + smoke tests.
- Sentry, if observability becomes a need.
