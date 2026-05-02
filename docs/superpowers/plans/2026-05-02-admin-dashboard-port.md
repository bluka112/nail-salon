# Admin Dashboard Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the dashboard shell, an overview stats page, and a sample product CRUD from `next-shadcn-dashboard-starter` (sibling repo) into `nail-salon` under `app/(admin)/admin/*`, using the existing Clerk 7 auth wiring.

**Architecture:** Mechanical port from `/Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/*` to `/Users/temkanibno/Desktop/LUKKA/nail-salon/{components,features,hooks,lib,config,constants,types,styles,app}/*`. URL paths rewritten `/dashboard/*` → `/admin/*`. Clerk 6 idioms (`<SignedIn>`, `@clerk/themes`) rewritten to Clerk 7. Org-switcher / billing / RBAC stripped; nav config trimmed to Overview + Product. shadcn style switched to `new-york` / `zinc` with starter's full theme system. Mock product backend kept; replacing with Prisma is out of scope.

**Tech Stack:** Next.js 16.2.4 (App Router) · React 19.2 · Clerk 7 · TanStack Query/Form/Table · nuqs · KBar · next-themes · Tailwind v4 · shadcn (new-york / zinc) · Recharts · Bun (package manager).

**Verification approach:** Per the spec, no automated tests exist or get added. Each task verifies via `bunx tsc --noEmit` (typecheck), `bun run build` (at phase boundaries), or in-browser smoke checks. The "test → fail → pass" TDD cycle is not used here; instead each task uses **make change → verify → commit**.

**Source / target paths used throughout:**
- `SRC` = `/Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter`
- `DST` = `/Users/temkanibno/Desktop/LUKKA/nail-salon`

All commands assume `cd $DST` (or use absolute paths); `git` commands assume `DST` is the repo root.

---

## File Structure (post-port)

**New top-level directories under `DST`:**
- `components/{ui,layout,kbar,modal,themes}/` + `components/{icons,nav-main,breadcrumbs,search-input,user-avatar-profile}.tsx` — shell + UI primitives.
- `features/{overview,products}/` — feature modules (api, components, schemas).
- `hooks/` — 10 reusable hooks.
- `config/{data-table,infoconfig,nav-config}.ts` — table/nav/info-sidebar config.
- `constants/mock-api.ts` — in-memory product backend.
- `types/` — shared types (NavGroup, NavItem, etc.).
- `styles/{theme.css,themes/}` — theme switcher CSS.

**Touched existing files:**
- `package.json` — deps added.
- `components.json` — style → `new-york`, baseColor → `zinc`, iconLibrary → `radix`.
- `app/globals.css` — replaced with starter's content.
- `app/layout.tsx` — replaced with async root using starter's provider stack.
- `proxy.ts` — `auth.protect()` for `/admin(.*)`.
- `lib/utils.ts` — single `cn()` (resolve any duplicate from starter's `utils.ts`).

**Created in `app/`:**
- `app/(admin)/layout.tsx` — replaces existing Clerk-header layout.
- `app/(admin)/admin/page.tsx` — replaces empty placeholder; redirects to `/admin/overview`.
- `app/(admin)/admin/overview/{layout.tsx,error.tsx,@area_stats,@bar_stats,@pie_stats,@sales}/...` — parallel-route stats page.
- `app/(admin)/admin/product/{page.tsx,[productId]/page.tsx}` — product list + view/edit (the `[productId]` route handles both `/new` and existing IDs).
- `app/(public)/auth/sign-in/[[...sign-in]]/page.tsx` and `app/(public)/auth/sign-up/[[...sign-up]]/page.tsx` — Clerk 7 auth pages.
- `app/not-found.tsx` and `app/global-error.tsx` — Sentry-stripped from starter.

**Skipped from starter:**
- `src/components/ui/kanban.tsx` (only consumer of `@dnd-kit/*` which we don't install).
- `src/components/{org-switcher.tsx,nav-projects.tsx,layout/cta-github.tsx,github-stars-button.tsx}`.
- `src/constants/mock-api-users.ts`.
- `src/app/dashboard/{billing,chat,elements,exclusive,forms,kanban,notifications,profile,react-query,users,workspaces}` and `src/app/{about,auth,privacy-policy,terms-of-service}`.
- `src/instrumentation*.ts`.
- `src/features/{auth,chat,elements,forms,kanban,notifications,products → already in scope,profile,react-query-demo,users}` (only `overview/` and `products/` ported).

---

## Phase 1 — Foundation (deps + styling)

### Task 1.1: Add dependencies to package.json

**Files:**
- Modify: `nail-salon/package.json`

- [ ] **Step 1: Edit `package.json` — add the following keys to `dependencies`** (preserve alphabetical order; keep existing keys untouched):

```json
"@faker-js/faker": "^9.9.0",
"@radix-ui/react-accordion": "^1.2.12",
"@radix-ui/react-alert-dialog": "^1.1.15",
"@radix-ui/react-aspect-ratio": "^1.1.8",
"@radix-ui/react-avatar": "^1.1.11",
"@radix-ui/react-checkbox": "^1.3.3",
"@radix-ui/react-collapsible": "^1.1.12",
"@radix-ui/react-context-menu": "^2.2.16",
"@radix-ui/react-dialog": "^1.1.15",
"@radix-ui/react-dropdown-menu": "^2.1.16",
"@radix-ui/react-hover-card": "^1.1.15",
"@radix-ui/react-icons": "^1.3.2",
"@radix-ui/react-label": "^2.1.8",
"@radix-ui/react-menubar": "^1.1.16",
"@radix-ui/react-navigation-menu": "^1.2.14",
"@radix-ui/react-popover": "^1.1.15",
"@radix-ui/react-progress": "^1.1.8",
"@radix-ui/react-radio-group": "^1.3.8",
"@radix-ui/react-scroll-area": "^1.2.10",
"@radix-ui/react-select": "^2.2.6",
"@radix-ui/react-separator": "^1.1.8",
"@radix-ui/react-slider": "^1.3.6",
"@radix-ui/react-slot": "^1.2.4",
"@radix-ui/react-switch": "^1.2.6",
"@radix-ui/react-tabs": "^1.1.13",
"@radix-ui/react-toast": "^1.2.15",
"@radix-ui/react-toggle": "^1.1.10",
"@radix-ui/react-toggle-group": "^1.1.11",
"@radix-ui/react-tooltip": "^1.2.8",
"@tabler/icons-react": "^3.40.0",
"@tanstack/react-form": "^1.28.5",
"@tanstack/react-query": "^5.95.2",
"@tanstack/react-query-devtools": "^5.95.2",
"@tanstack/react-table": "^8.21.3",
"cmdk": "^1.1.1",
"date-fns": "^4.1.0",
"input-otp": "^1.4.2",
"kbar": "^0.1.0-beta.48",
"match-sorter": "^8.2.0",
"motion": "^11.18.2",
"next-themes": "^0.4.6",
"nextjs-toploader": "^3.9.17",
"nuqs": "^2.8.9",
"react-day-picker": "^9.14.0",
"react-dropzone": "^14.4.1",
"react-resizable-panels": "^2.1.9",
"react-responsive": "^10.0.1",
"recharts": "^2.15.4",
"sharp": "^0.33.5",
"sonner": "^1.7.4",
"sort-by": "^1.2.0",
"uuid": "^11.1.0",
"vaul": "^1.1.2",
"zod": "^4.3.6",
"zustand": "^5.0.12"
```

- [ ] **Step 2: Install**

Run:
```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
bun install
```
Expected: no errors; `bun.lock` regenerated.

- [ ] **Step 3: Commit**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
git add package.json bun.lock
git commit -m "chore: add starter dashboard dependencies"
```

### Task 1.2: Update `components.json` to new-york / zinc / radix

**Files:**
- Modify: `nail-salon/components.json`

- [ ] **Step 1: Replace `components.json` content with**:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "radix",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

- [ ] **Step 2: Commit**

```bash
git add components.json
git commit -m "chore(ui): switch shadcn style to new-york/zinc"
```

### Task 1.3: Replace `app/globals.css` with starter's content

**Files:**
- Modify: `nail-salon/app/globals.css`

- [ ] **Step 1: Copy starter globals**

```bash
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/styles/globals.css \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/app/globals.css
```

- [ ] **Step 2: Verify build still parses CSS**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
bunx tsc --noEmit
```
Expected: no errors. (CSS is not typechecked but this catches any broken imports.)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: replace globals.css with starter zinc tokens"
```

### Task 1.4: Copy theme stylesheets

**Files:**
- Create: `nail-salon/styles/theme.css`
- Create: `nail-salon/styles/themes/{astro-vista,claude,light-green,mono,neobrutualism,notebook,supabase,vercel,whatsapp,zen}.css`

- [ ] **Step 1: Copy**

```bash
mkdir -p /Users/temkanibno/Desktop/LUKKA/nail-salon/styles
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/styles/theme.css \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/styles/theme.css
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/styles/themes \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/styles/themes
```

- [ ] **Step 2: Verify**

```bash
ls /Users/temkanibno/Desktop/LUKKA/nail-salon/styles/themes/ | wc -l
```
Expected: `10`.

- [ ] **Step 3: Commit**

```bash
git add styles/
git commit -m "style: add starter theme stylesheets"
```

### Task 1.5: Smoke check Phase 1

- [ ] **Step 1: Boot dev server**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
bun dev
```
In another terminal, browse `http://localhost:3000/`. Expected: existing `(public)/page.tsx` renders (may look slightly different — that's expected since tokens changed). No console errors.

- [ ] **Step 2: Stop dev server (Ctrl+C). No commit; verification only.**

---

## Phase 2 — Shared infrastructure (lib / types / hooks / constants / config)

### Task 2.1: Copy `lib/` helpers, merging `cn`

**Files:**
- Create: `nail-salon/lib/{api-client.ts,compose-refs.ts,data-table.ts,format.ts,parsers.ts,query-client.ts,searchparams.ts}`
- Modify: `nail-salon/lib/utils.ts` (resolve duplicate `cn`)

- [ ] **Step 1: Copy starter lib files (excluding `utils.ts`)**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/api-client.ts lib/
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/compose-refs.ts lib/
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/data-table.ts lib/
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/format.ts lib/
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/parsers.ts lib/
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/query-client.ts lib/
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/searchparams.ts lib/
```

- [ ] **Step 2: Diff `utils.ts`**

```bash
diff /Users/temkanibno/Desktop/LUKKA/nail-salon/lib/utils.ts \
     /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/utils.ts
```
If the existing nail-salon `lib/utils.ts` only exports `cn` and the starter's `utils.ts` exports `cn` plus other helpers (e.g., `formatBytes`, `composeEventHandlers`), **overwrite with starter's**:

```bash
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/lib/utils.ts \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/lib/utils.ts
```
If nail-salon `utils.ts` has any additional non-`cn` helpers used elsewhere, append them to the new file rather than dropping them.

- [ ] **Step 3: Verify**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat(lib): port starter lib helpers"
```

### Task 2.2: Copy `types/`

**Files:**
- Create: `nail-salon/types/` (everything from starter `src/types/`)

- [ ] **Step 1: Copy**

```bash
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/types \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/types
```

- [ ] **Step 2: Verify**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/
git commit -m "feat(types): port starter shared types"
```

### Task 2.3: Copy `hooks/` and short-circuit `use-nav.ts`

**Files:**
- Create: `nail-salon/hooks/{use-breadcrumbs.tsx,use-callback-ref.tsx,use-controllable-state.tsx,use-data-table.ts,use-debounce.tsx,use-debounced-callback.ts,use-media-query.ts,use-mobile.tsx,use-nav.ts,use-stepper.tsx}`

- [ ] **Step 1: Copy all hooks**

```bash
mkdir -p /Users/temkanibno/Desktop/LUKKA/nail-salon/hooks
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/hooks/. \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/hooks/
```

- [ ] **Step 2: Replace `hooks/use-nav.ts` with a no-op short-circuit**

Overwrite `nail-salon/hooks/use-nav.ts` with:

```ts
import type { NavItem, NavGroup } from '@/types';

/**
 * RBAC filtering is disabled in this build (no Clerk orgs/plans).
 * These return inputs unchanged so any callers continue to compile.
 */
export function useFilteredNavItems(items: NavItem[]) {
  return items;
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  return groups;
}
```

- [ ] **Step 3: Rewrite `/dashboard/*` paths in `hooks/use-breadcrumbs.tsx`**

Open `nail-salon/hooks/use-breadcrumbs.tsx` and replace its `routeMapping` constant body so it covers only `/admin` and `/admin/product`:

```ts
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/admin': [{ title: 'Dashboard', link: '/admin' }],
  '/admin/overview': [
    { title: 'Dashboard', link: '/admin' },
    { title: 'Overview', link: '/admin/overview' }
  ],
  '/admin/product': [
    { title: 'Dashboard', link: '/admin' },
    { title: 'Product', link: '/admin/product' }
  ]
};
```

(Keep the rest of the file — the fallback path-segment generator handles any uncovered URL.)

- [ ] **Step 4: Verify**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add hooks/
git commit -m "feat(hooks): port starter hooks; disable RBAC filter"
```

### Task 2.4: Copy `constants/mock-api.ts`

**Files:**
- Create: `nail-salon/constants/mock-api.ts`

- [ ] **Step 1: Copy**

```bash
mkdir -p /Users/temkanibno/Desktop/LUKKA/nail-salon/constants
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/constants/mock-api.ts \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/constants/mock-api.ts
```

- [ ] **Step 2: Verify**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors. (`@faker-js/faker` was added in Task 1.1.)

- [ ] **Step 3: Commit**

```bash
git add constants/
git commit -m "feat(constants): port mock product backend"
```

### Task 2.5: Copy `config/{data-table,infoconfig}.ts`

**Files:**
- Create: `nail-salon/config/data-table.ts`
- Create: `nail-salon/config/infoconfig.ts`

- [ ] **Step 1: Copy**

```bash
mkdir -p /Users/temkanibno/Desktop/LUKKA/nail-salon/config
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/config/data-table.ts \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/config/data-table.ts
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/config/infoconfig.ts \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/config/infoconfig.ts
```

(`nav-config.ts` is created in Task 4.6 with our trimmed Overview-+-Product-only list.)

- [ ] **Step 2: Verify**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add config/
git commit -m "feat(config): port data-table + infobar config"
```

---

## Phase 3 — UI components library

### Task 3.1: Copy `components/ui/` — except kanban

**Files:**
- Create/replace: `nail-salon/components/ui/*` (~59 files + `table/` subdir)

- [ ] **Step 1: Copy all UI primitives, then delete kanban**

```bash
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/ui/. \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/ui/
rm /Users/temkanibno/Desktop/LUKKA/nail-salon/components/ui/kanban.tsx
```

(This overwrites the existing `nail-salon/components/ui/button.tsx`, which is the intended behavior.)

- [ ] **Step 2: Sanity-check no other primitive references kanban**

```bash
grep -rn "from './kanban'" /Users/temkanibno/Desktop/LUKKA/nail-salon/components/ui/
grep -rn "@dnd-kit" /Users/temkanibno/Desktop/LUKKA/nail-salon/components/ui/
```
Expected: no matches for either.

- [ ] **Step 3: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors. If you see "Cannot find module" for any `@/...` path, double-check that the import points to a file we copied (vs. one we deliberately skipped). Report any unexpected unresolved imports.

- [ ] **Step 4: Commit**

```bash
git add components/ui/
git commit -m "feat(ui): port starter UI primitive library"
```

---

## Phase 4 — Layout + provider tree

### Task 4.1: Copy `components/themes/` and `components/modal/` and `components/kbar/`

**Files:**
- Create: `nail-salon/components/themes/{active-theme.tsx,font.config.ts,theme-mode-toggle.tsx,theme-provider.tsx,theme-selector.tsx,theme.config.ts}`
- Create: `nail-salon/components/modal/alert-modal.tsx`
- Create: `nail-salon/components/kbar/{index.tsx,render-result.tsx,result-item.tsx,use-theme-switching.tsx}`

- [ ] **Step 1: Copy**

```bash
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/themes \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/themes
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/modal \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/modal
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/kbar \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/kbar
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/themes/ components/modal/ components/kbar/
git commit -m "feat(components): port themes/kbar/modal subtrees"
```

### Task 4.2: Copy standalone shell components, skipping the ones we drop

**Files:**
- Create: `nail-salon/components/{icons.tsx,nav-main.tsx,breadcrumbs.tsx,search-input.tsx,user-avatar-profile.tsx}`
- **Do NOT copy:** `org-switcher.tsx`, `nav-projects.tsx`, `github-stars-button.tsx`, `file-uploader.tsx` (top-level), `form-card-skeleton.tsx`, `forms/` directory.

(Note: `file-uploader.tsx` and `form-card-skeleton.tsx` at the top of `src/components/` are demo-page leftovers; the `forms/` directory is for the demo forms pages we aren't porting.)

- [ ] **Step 1: Copy individual files**

```bash
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/icons.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/icons.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/nav-main.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/nav-main.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/breadcrumbs.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/breadcrumbs.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/search-input.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/search-input.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/user-avatar-profile.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/user-avatar-profile.tsx
```

- [ ] **Step 2: Inspect `nav-main.tsx` for any RBAC import and remove it**

```bash
grep -n "useFilteredNavItems\|useFilteredNavGroups\|useOrganization\|item.access" \
  /Users/temkanibno/Desktop/LUKKA/nail-salon/components/nav-main.tsx
```
If present:
- Remove the import line for `useFilteredNavItems` / `useFilteredNavGroups`.
- Replace any call with the input array directly (e.g., `const filtered = useFilteredNavItems(items)` → `const filtered = items`).
- Remove any `if (item.access) { ... }` gate; render every item unconditionally.

(Even if the file currently uses the hooks, those hooks are now no-ops from Task 2.3 — but trimming the import keeps the bundle clean.)

- [ ] **Step 3: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/icons.tsx components/nav-main.tsx components/breadcrumbs.tsx components/search-input.tsx components/user-avatar-profile.tsx
git commit -m "feat(components): port standalone shell components"
```

### Task 4.3: Copy and edit `components/layout/`

**Files:**
- Create: `nail-salon/components/layout/{app-sidebar.tsx,header.tsx,info-sidebar.tsx,page-container.tsx,providers.tsx,query-provider.tsx,user-nav.tsx}`
- **Do NOT copy:** `cta-github.tsx`.

- [ ] **Step 1: Copy individual files**

```bash
mkdir -p /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/app-sidebar.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/app-sidebar.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/header.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/header.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/info-sidebar.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/info-sidebar.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/page-container.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/page-container.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/providers.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/providers.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/query-provider.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/query-provider.tsx
cp /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/components/layout/user-nav.tsx \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/components/layout/user-nav.tsx
```

- [ ] **Step 2: Edit `components/layout/providers.tsx` — strip `@clerk/themes`**

Replace the file's contents with:

```tsx
'use client';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: 'var(--primary)',
              colorPrimaryForeground: 'var(--primary-foreground)',
              colorDanger: 'var(--destructive)',
              colorBackground: 'var(--card)',
              colorForeground: 'var(--foreground)',
              colorMuted: 'var(--muted)',
              colorMutedForeground: 'var(--muted-foreground)',
              colorInput: 'var(--input)',
              colorInputForeground: 'var(--foreground)',
              colorBorder: 'var(--border)',
              colorRing: 'var(--ring)',
              fontFamily: 'var(--font-sans)'
            }
          }}
        >
          <QueryProvider>{children}</QueryProvider>
        </ClerkProvider>
      </ActiveThemeProvider>
    </>
  );
}
```

(Removed: `import { dark } from '@clerk/themes'`, `import { useTheme } from 'next-themes'`, `useTheme()` call, `baseTheme: resolvedTheme === 'dark' ? dark : undefined`.)

- [ ] **Step 3: Edit `components/layout/app-sidebar.tsx` — remove org-switcher and Clerk-6 idioms**

Apply edits:

a. Remove `import { OrgSwitcher } from '../org-switcher';` (line ~37 in source).
b. Remove `import { useOrganization, useUser } from '@clerk/nextjs';` and the `useOrganization()` / destructured `organization` line in the component body. Keep `useUser` only if it is still referenced after edits; if it isn't, drop the whole import.
c. Replace `import { useFilteredNavGroups } from '@/hooks/use-nav';` + `const filteredGroups = useFilteredNavGroups(navGroups);` with `const filteredGroups = navGroups;`. (Or keep the hook call — it's now a no-op — but removing the import is cleaner.)
d. Remove the `<OrgSwitcher />` element from the sidebar header. The replacement structure:

```tsx
<SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
  <Link href='/admin/overview' className='flex items-center gap-2 px-2'>
    <Icons.logo className='size-6' />
    <span className='font-semibold group-data-[collapsible=icon]:hidden'>Admin</span>
  </Link>
</SidebarHeader>
```

e. Find any `router.push('/dashboard/...')` calls (lines ~143, 148, 153 in source — `/dashboard/profile`, `/dashboard/billing`, `/dashboard/notifications`). **Delete those `<DropdownMenuItem>` entries entirely** — we are not porting profile/billing/notifications pages. Leave the sign-out menu item.
f. Convert any `<SignedIn>` → `<Show when='signed-in'>`, `<SignedOut>` → `<Show when='signed-out'>`. Update the import: `import { Show, SignOutButton } from '@clerk/nextjs';` (Clerk 7 ships `Show` from the same module).

- [ ] **Step 4: Edit `components/layout/user-nav.tsx` — Clerk 7 idioms + remove profile link**

a. Replace any `<SignedIn>`/`<SignedOut>` usages with `<Show when='signed-in'>`/`<Show when='signed-out'>` and update imports accordingly.
b. Delete the `router.push('/dashboard/profile')` `<DropdownMenuItem>` (line ~37 in source).
c. Drop any `import { dark } from '@clerk/themes'` and `appearance={{ baseTheme: dark }}` props on `<UserButton>`.

- [ ] **Step 5: Edit `components/layout/header.tsx` — Clerk 7 idioms**

a. Replace `<SignedIn>`/`<SignedOut>` with `<Show when='signed-in'>`/`<Show when='signed-out'>`.
b. Remove any `import { dark } from '@clerk/themes'` and any `appearance={{ baseTheme: dark }}` props.
c. The breadcrumbs hook (`useBreadcrumbs`) is already URL-rewritten in Task 2.3, so no edits needed there.

- [ ] **Step 6: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors. If TypeScript complains about `Show` not being exported from `@clerk/nextjs`, verify the version in `package.json` resolves to `7.x`:
```bash
bun pm ls | grep "@clerk/nextjs"
```
(Should show `^7.3.0`.)

- [ ] **Step 7: Commit**

```bash
git add components/layout/
git commit -m "feat(layout): port shell layout components; Clerk 7 idioms"
```

### Task 4.4: Update root `app/layout.tsx`

**Files:**
- Modify: `nail-salon/app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx` with**:

```tsx
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import Providers from '@/components/layout/providers';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'Nail Salon Admin',
  description: 'Nail salon admin dashboard'
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
```

(The standalone Geist imports from the original layout are dropped — Geist now comes via `fontVariables`.)

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(app): replace root layout with starter provider stack"
```

### Task 4.5: Replace `app/(admin)/layout.tsx` with the dashboard shell

**Files:**
- Modify: `nail-salon/app/(admin)/layout.tsx`

- [ ] **Step 1: Overwrite `app/(admin)/layout.tsx` with**:

```tsx
import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Nail Salon Admin',
  description: 'Nail salon admin dashboard',
  robots: { index: false, follow: false }
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <InfobarProvider defaultOpen={false}>
            {children}
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/layout.tsx"
git commit -m "feat(admin): replace admin layout with dashboard shell"
```

### Task 4.6: Write `config/nav-config.ts` (trimmed)

**Files:**
- Create: `nail-salon/config/nav-config.ts`

- [ ] **Step 1: Write `config/nav-config.ts`**:

```ts
import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/admin/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Product',
        url: '/admin/product',
        icon: 'product',
        isActive: false,
        shortcut: ['p', 'p'],
        items: []
      }
    ]
  }
];
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors. If `NavGroup` shape complains about missing `access`, leave it — `access` is optional in the starter's type.

- [ ] **Step 3: Commit**

```bash
git add config/nav-config.ts
git commit -m "feat(config): add nail-salon nav (Overview + Product)"
```

---

## Phase 5 — Auth wiring

### Task 5.1: Update `proxy.ts` to protect `/admin/*`

**Files:**
- Modify: `nail-salon/proxy.ts`

- [ ] **Step 1: Replace `proxy.ts` with**:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat(auth): protect /admin routes with Clerk middleware"
```

### Task 5.2: Create Clerk 7 sign-in page

**Files:**
- Create: `nail-salon/app/(public)/auth/sign-in/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Make directories and write file**

```bash
mkdir -p "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(public)/auth/sign-in/[[...sign-in]]"
```

Write `nail-salon/app/(public)/auth/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <SignIn path='/auth/sign-in' />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/auth/sign-in"
git commit -m "feat(auth): add Clerk sign-in page"
```

### Task 5.3: Create Clerk 7 sign-up page

**Files:**
- Create: `nail-salon/app/(public)/auth/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Make directories and write file**

```bash
mkdir -p "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(public)/auth/sign-up/[[...sign-up]]"
```

Write `nail-salon/app/(public)/auth/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <SignUp path='/auth/sign-up' />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/auth/sign-up"
git commit -m "feat(auth): add Clerk sign-up page"
```

### Task 5.4: Document required env vars

**Files:**
- Create or modify: `nail-salon/.env.example`

- [ ] **Step 1: Check whether `.env.example` already exists**

```bash
ls /Users/temkanibno/Desktop/LUKKA/nail-salon/.env.example 2>/dev/null && echo "exists" || echo "missing"
```

- [ ] **Step 2: Append the four URL vars** (create the file if missing)

If creating from scratch, write:
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/overview
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/overview

# Database
DATABASE_URL=
```

If the file exists, append only the four `*_URL` lines (don't duplicate publishable/secret keys if already present).

Also remind the user (in the commit body or out-of-band) to copy these four URL vars into their local `.env.local`.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(env): document Clerk URL env vars for /admin"
```

### Task 5.5: Smoke check Phase 5 (auth flow)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
bun dev
```

- [ ] **Step 2: In a private browser window, visit `http://localhost:3000/admin/overview`**

Expected: redirect to `http://localhost:3000/auth/sign-in?redirect_url=...`. Sign-in form renders.

- [ ] **Step 3: Sign up or sign in**

Expected: after auth completes, redirect to `/admin/overview`. The page may show a Next 404 or empty state because we haven't built `/admin/overview` yet — that is fine; what matters is that **the redirect target landed on `/admin/...`** (not a Clerk error page).

- [ ] **Step 4: Stop dev server (Ctrl+C). No commit; verification only.**

---

## Phase 6 — Overview stats page

### Task 6.1: Copy overview feature module

**Files:**
- Create: `nail-salon/features/overview/components/{area-graph.tsx,area-graph-skeleton.tsx,bar-graph.tsx,bar-graph-skeleton.tsx,overview.tsx,pie-graph.tsx,pie-graph-skeleton.tsx,recent-sales.tsx,recent-sales-skeleton.tsx}`

- [ ] **Step 1: Copy**

```bash
mkdir -p /Users/temkanibno/Desktop/LUKKA/nail-salon/features
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/features/overview \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/features/overview
```

- [ ] **Step 2: Sanity-check no internal `/dashboard` URLs**

```bash
grep -rn "/dashboard" /Users/temkanibno/Desktop/LUKKA/nail-salon/features/overview/
```
Expected: no matches. (Verified during spec review — overview feature has no hardcoded `/dashboard` URLs.) If any appear, replace with `/admin`.

- [ ] **Step 3: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add features/overview/
git commit -m "feat(overview): port overview feature module"
```

### Task 6.2: Copy overview parallel-route pages

**Files:**
- Create: `nail-salon/app/(admin)/admin/overview/{layout.tsx,error.tsx,@area_stats/...,@bar_stats/...,@pie_stats/...,@sales/...}`

- [ ] **Step 1: Copy entire overview app directory**

```bash
mkdir -p "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/overview"
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/app/dashboard/overview/. \
   "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/overview/"
```

- [ ] **Step 2: Verify the parallel-route directories exist**

```bash
ls "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/overview/" | sort
```
Expected: `@area_stats`, `@bar_stats`, `@pie_stats`, `@sales`, `error.tsx`, `layout.tsx`.

- [ ] **Step 3: Search for any `/dashboard` URLs in the overview pages**

```bash
grep -rn "/dashboard" "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/overview/"
```
If any found, replace with `/admin`.

- [ ] **Step 4: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(admin)/admin/overview"
git commit -m "feat(overview): port overview parallel-route pages"
```

### Task 6.3: Replace `app/(admin)/admin/page.tsx` with redirect

**Files:**
- Modify: `nail-salon/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Overwrite `app/(admin)/admin/page.tsx` with**:

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminIndex() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/auth/sign-in');
  }
  redirect('/admin/overview');
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/page.tsx"
git commit -m "feat(admin): redirect /admin → /admin/overview"
```

### Task 6.4: Smoke check overview

- [ ] **Step 1: Boot dev server**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bun dev
```

- [ ] **Step 2: Visit `http://localhost:3000/admin`**

Expected: 302 → `/admin/overview`. Page renders with sidebar, header, four stat tiles (area chart, bar chart, pie chart, recent sales). No console errors.

- [ ] **Step 3: Visit `http://localhost:3000/admin/overview` directly**

Expected: same render.

- [ ] **Step 4: Stop dev server. No commit; verification only.**

---

## Phase 7 — Product CRUD

### Task 7.1: Copy products feature module

**Files:**
- Create: `nail-salon/features/products/{api/{mutations.ts,queries.ts,service.ts,types.ts},components/{product-form.tsx,product-listing.tsx,product-view-page.tsx,product-tables/{cell-action.tsx,columns.tsx,index.tsx,options.tsx}},constants/product-options.ts,schemas/product.ts}`

- [ ] **Step 1: Copy**

```bash
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/features/products \
   /Users/temkanibno/Desktop/LUKKA/nail-salon/features/products
```

- [ ] **Step 2: Rewrite internal `/dashboard/product` URLs to `/admin/product`**

There are two known files with hardcoded URLs:
- `nail-salon/features/products/components/product-form.tsx` — lines ~29, ~40 use `router.push('/dashboard/product')`. Replace with `router.push('/admin/product')`.
- `nail-salon/features/products/components/product-tables/cell-action.tsx` — line ~55 uses `router.push(`/dashboard/product/${data.id}`)`. Replace with `router.push(\`/admin/product/${data.id}\`)`.

Sanity-check no other references exist:
```bash
grep -rn "/dashboard" /Users/temkanibno/Desktop/LUKKA/nail-salon/features/products/
```
Expected: no remaining `/dashboard` matches.

- [ ] **Step 3: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add features/products/
git commit -m "feat(products): port products feature module; rewrite URLs"
```

### Task 7.2: Copy product app pages

**Files:**
- Create: `nail-salon/app/(admin)/admin/product/page.tsx`
- Create: `nail-salon/app/(admin)/admin/product/[productId]/page.tsx`

- [ ] **Step 1: Copy**

```bash
mkdir -p "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/product"
cp -R /Users/temkanibno/Desktop/LUKKA/next-shadcn-dashboard-starter/src/app/dashboard/product/. \
   "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/product/"
```

- [ ] **Step 2: Rewrite the `/dashboard/product/new` link in the list page**

Edit `nail-salon/app/(admin)/admin/product/page.tsx`:
- Change `<Link href='/dashboard/product/new' ...>` to `<Link href='/admin/product/new' ...>`.

Sanity-check:
```bash
grep -rn "/dashboard" "/Users/temkanibno/Desktop/LUKKA/nail-salon/app/(admin)/admin/product/"
```
Expected: no matches.

- [ ] **Step 3: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/admin/product"
git commit -m "feat(products): port product list + view/edit pages"
```

### Task 7.3: Smoke check product CRUD

- [ ] **Step 1: Boot dev server**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bun dev
```

- [ ] **Step 2: Visit `http://localhost:3000/admin/product`**

Expected: product list table renders with mocked product rows; pagination, filters, and column sorting all work; "+ Add New" button is visible.

- [ ] **Step 3: Click "+ Add New"**

Expected: navigates to `/admin/product/new`. Empty product form renders.

- [ ] **Step 4: Fill the form and submit**

Expected: redirects back to `/admin/product`; new product appears in the list.

- [ ] **Step 5: Click a product row's "Edit" action**

Expected: navigates to `/admin/product/<id>`; form pre-populated with that product's data.

- [ ] **Step 6: Click a product row's "Delete" action**

Expected: confirmation modal opens; on confirm, product disappears from the list.

- [ ] **Step 7: Press Cmd+K (Mac) / Ctrl+K (Win)**

Expected: KBar opens; typing "dashboard" matches the Dashboard nav entry; pressing Enter navigates to `/admin/overview`.

- [ ] **Step 8: Open the theme switcher in the header and pick a theme (e.g., "Supabase")**

Expected: tokens swap; page re-renders with new colors. Refresh — theme persists (cookie).

- [ ] **Step 9: Stop dev server. No commit; verification only.**

---

## Phase 8 — Final cleanup

### Task 8.1: Add `app/not-found.tsx`

**Files:**
- Create: `nail-salon/app/not-found.tsx`

- [ ] **Step 1: Write `app/not-found.tsx`**:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <span className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem] leading-none font-extrabold text-transparent'>
        404
      </span>
      <h2 className='font-heading my-2 text-2xl font-bold'>Something&apos;s missing</h2>
      <p>Sorry, the page you are looking for doesn&apos;t exist or has been moved.</p>
      <div className='mt-8 flex justify-center gap-2'>
        <Button onClick={() => router.back()} variant='default' size='lg'>
          Go back
        </Button>
        <Button onClick={() => router.push('/admin/overview')} variant='ghost' size='lg'>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
```

(Same as starter's `not-found.tsx`, with the only edit being `/dashboard` → `/admin/overview` on the "Back to Home" button.)

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat(app): add 404 page"
```

### Task 8.2: Add `app/global-error.tsx` (Sentry-stripped)

**Files:**
- Create: `nail-salon/app/global-error.tsx`

- [ ] **Step 1: Write `app/global-error.tsx`**:

```tsx
'use client';

import NextError from 'next/error';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang='en'>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
```

(The `Sentry.captureException` call and `import * as Sentry from '@sentry/nextjs'` line from the starter are removed. The `error` parameter is kept in the signature for Next.js compatibility even though we don't reference it — alternatively prefix with `_` to silence lint: `function GlobalError({ error: _error }: ...)`.)

- [ ] **Step 2: Typecheck**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/global-error.tsx
git commit -m "feat(app): add global error boundary"
```

### Task 8.3: Full production build

- [ ] **Step 1: Run build**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
bun run build
```
Expected: build succeeds; route table includes:
- `/`
- `/admin`
- `/admin/overview`
- `/admin/product`
- `/admin/product/[productId]`
- `/auth/sign-in/[[...sign-in]]`
- `/auth/sign-up/[[...sign-up]]`

If any route is missing or any compile error appears, **stop and diagnose**. Common causes:
- Stale cache: `rm -rf .next && bun run build`
- Missing env vars: ensure Clerk keys are set in `.env.local`.

- [ ] **Step 2: Optionally start the production server and re-run the smoke from Task 7.3**

```bash
bun run start
```

### Task 8.4: Final commit + tag (optional)

- [ ] **Step 1: Confirm clean working tree**

```bash
cd /Users/temkanibno/Desktop/LUKKA/nail-salon
git status
```
Expected: `nothing to commit, working tree clean`.

- [ ] **Step 2: (Optional) tag the port**

```bash
git tag -a admin-dashboard-port -m "Admin dashboard ported from next-shadcn-dashboard-starter"
```

---

## Self-review notes

After writing the plan, the following checks were run:

**Spec coverage:** Each section of the spec maps to plan tasks:
- Goal / non-goals → covered by phase scoping; demo pages we skip never appear.
- File layout → Phase 2-4 tasks create every directory listed.
- Provider tree → Tasks 4.3 (providers.tsx edit) + 4.4 (root layout).
- Auth flow → Phase 5 (proxy + auth pages + env vars).
- Clerk 7 adaptation → Tasks 4.3 step 2-5 enumerate every Clerk-6 → Clerk-7 edit.
- Dependencies → Task 1.1.
- `components.json` → Task 1.2.
- `globals.css` → Task 1.3.
- `proxy.ts` → Task 5.1.
- `nav-config.ts` → Task 4.6 (only Overview + Product).
- Phased order → Phase numbering in this plan matches the spec verbatim.

**Type consistency:** Function/file names referenced across tasks (`useFilteredNavGroups`, `Providers`, `AppSidebar`, `KBar`, `InfobarProvider`) match what the source files export.

**Placeholder scan:** No "TBD"/"TODO"/"implement appropriate" present. The one place with conditional language ("If `nail-salon/lib/utils.ts` has any additional non-`cn` helpers...") gives a concrete decision rule rather than deferring.

**Out-of-scope deferrals confirmed:**
- No tests are written (per spec).
- Mock-API stays; replacing with Prisma is explicitly noted as out-of-scope.
- Sentry stays out.

---

## Done. What's next

After Phase 8 succeeds, the working state is:

- Browsing `/` shows the public landing page.
- Browsing `/admin/*` while signed out → Clerk sign-in.
- Browsing `/admin` while signed in → `/admin/overview` with the four stat tiles.
- Browsing `/admin/product` shows a working CRUD against the in-memory mock store.
- Cmd+K opens the command bar; theme switcher swaps tokens.

Future work (out of scope for this plan):
- Replace `constants/mock-api.ts` with a Prisma-backed `services` (or `appointments`, `staff`, etc.) module.
- Add real RBAC if the salon needs role-gated pages (owner vs. staff).
- Wire Sentry if observability becomes a need.
