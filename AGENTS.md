# AGENTS.md

## Stack

TanStack Start (React SSR/SSG framework), Vite, Drizzle ORM (PostgreSQL), Better Auth, Tailwind CSS v4, shadcn/ui (radix-nova style).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run Vitest (no tests exist yet)
npm run lint         # ESLint only
npm run format       # Prettier check only
npm run check        # Prettier fix + ESLint fix (use this before commit)
```

### Database (Drizzle)

```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly (dev shortcut, skips migrations)
npm run db:studio    # Open Drizzle Studio GUI
```

Schema is at `src/db/schema.ts`. After changing it, run `db:generate` then `db:migrate`.

## Path Aliases

- `#/*` and `@/*` both map to `./src/*`
- Use `#/` in imports (project convention)

## Environment

Required vars (validated at startup via `src/lib/env.ts`):

- `DATABASE_URL` - PostgreSQL connection string
- `BASE_URL` - App base URL
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `DODO_API_KEY`, `DODO_API_BASE`, `DODO_PAYMENTS_WEBHOOK_KEY` - Payment provider

Drizzle loads from `.env.local` then `.env`. App loads via dotenv with override.

## Routing

File-based routing in `src/routes/`:

- `__root.tsx` - Root layout with QueryClientProvider
- `_protected.tsx` - Auth-protected layout (children require login)
- `api/` - Server API routes
- Files prefixed with `-` are private components, not routes

Routes auto-generate `src/routeTree.gen.ts` - do not edit manually.

## Style

- Prettier: no semicolons, single quotes, trailing commas
- ESLint: TanStack config with some rules disabled (import order, cycles)
- Run `npm run check` to fix both

## Data Fetching & State

- Use TanStack Query for all server or async state
- Use `useQuery`/`useMutation`, never local `useState` for remote state
- Always use `isPending`/`isLoading` from query, never custom loading logic
- QueryClientProvider is set up in `__root.tsx`

## Components

- All UI primitives: `src/components/ui/` (shadcn)
- All shared components: `src/components/`
- Do NOT inline components in route files—extract to the components dir
- Before editing shared components, check all other usages to avoid breakage

Add new shadcn with:

```bash
npx shadcn add <component>
```

Config: `components.json` (radix-nova/olive)

## Forms

- Use Zod for all form validation
- Never use just state variables for validation—schemas must drive everything
- Payload verifications in api routes

## User Info

- We are in Tanstack start codebase so If you need user info in client pages then use Route.useRouteContext instead calling importing and calling useSession in every pages, you can refer \_protected.tsx
- to create protected api routes, create them in \_protected/api/\*\* and get the user info thorugh context like context.session,context.user destrucrting context from handlers callback like GET: async ({ request ,context})

## Instruction

- Dont build,tsc,lint the codebase without asking after completing the tasks
- Dont make cutom types, try to reuse the drizzle schema types
- Just me if you ever feel confusion in implementations or chosing btn options