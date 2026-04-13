# Project Context for Future Agents

## Product Summary: TrueInbox

**TrueInbox** is a communication management platform for creators and sponsors. The core idea is to give creators a "clean inbox" where only verified sponsors, close friends, and important contacts can reach them—reducing noise from fan floods, bots, and spam.

### Key Features and Product Value

- **For Creators:**
  - Monetize direct messages by setting paywalls/guaranteed reply prices for incoming DMs.
  - New, reliable income sources from ignored or non-replied messages (e.g., sponsors pay a deposit which is refunded on reply, but goes to creator if ignored).
  - Only important contacts and verified sponsors can reach them; trusted contacts are always free.
  - Advanced analytics and multi-platform unification (Instagram, X, YouTube, etc).

- **For Sponsors/Fans:**
  - Pay for guaranteed visibility and reply — messages go directly to the creator’s TrueInbox.
  - Refundable fee if the creator replies, otherwise funds go to the creator, discouraging spam and unserious outreach.

### Major Value Props

- **Spam Prevention:** 99% of spam blocked before it starts via deposits/paywalls.
- **Direct Relationships:** No intermediaries — brands, fans, and creators connect directly.
- **Free for Creators:** Platform fees are zero; creators keep 100% of their DM earnings. Sponsors pay per outreach.

### Example User Flows

1. **Sponsor Pays to DM:**
   - Sponsor places a small, refundable deposit for messaging a creator (e.g., $25).
   - Message lands in creator’s TrueInbox.
   - If replied: Sponsor is refunded. If not: Creator keeps the deposit.
2. **Inbox Filtering:**
   - Only sponsors who pay, trusted contacts, or team/friends make it through. Others are filtered as spam.

- Platform is pitched as having facilitated millions in unlocked deals (see stats).

## Codebase High-Level Overview

- **Framework/Stack:** React (TanStack Start w/ SSR/SSG), Vite, Drizzle ORM (PostgreSQL), Better Auth, TailwindCSS v4, shadcn/ui (for UI components).
- **DB:** Schema managed in `src/db/schema.ts`; main entities include users, dm_access records, payments, and user payment settings.
- **Auth:** Uses Better Auth with support for OAuth.
- **File-Based Routing:** All routes in `src/routes/`. Public, protected, and API routes are distinguished by filename prefixes or folders:
  - `__root.tsx`: Root layout provider
  - `_protected.tsx`: Auth-protected layout
  - `api/`: API/server-side routes
  - Prefix `-` for private/internal components
- **Component Organization:**
  - UI primitives: `src/components/ui/` (shadcn based).
  - Shared components: All in `src/components/`.
- **Testing/Formatting:**
  - Uses Vitest, ESLint (TanStack rules), Prettier (no semis, single quotes, trailing commas).
- **State/Data Fetching:**
  - TanStack Query used everywhere for remote/server/async state; never use local `useState` for anything remote.
- **Environment:**
  - Key env vars: `DATABASE_URL`, `BASE_URL`, OAuth and payment provider credentials.
- **Style:**
  - TailwindCSS, Radix-nova/olive theme.

## Project Conventions (Quick Reference)

- Always use TanStack Query for anything remote.
- Form validation: always use Zod.
- Do not inline components in route files (extract to component dirs).
- Update/Check all shared component usages before editing.
- Use `/src/routes/__root.tsx` for layouts; `/src/routes/_protected.tsx` for authenticated content.
- Use file-based routing for all pages and APIs.

---

This summary is intended to give any future agents a concise but thorough understanding of what TrueInbox is and how the codebase is structured and operated. For deeper details, refer to AGENTS.md and inline comments in the codebase.
