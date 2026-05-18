# Agent Instructions

This file is the source of truth for conventions in this repository. When generating
or modifying code, follow the rules here. When in doubt, prefer asking for clarification
over guessing.

## Project Overview

A reference architecture sandbox for full-stack web development. Deliberately
over-engineered for a portfolio site so that real-world patterns can be demonstrated.

**Stack:**
- Frontend: React 19 + TypeScript + Vite + React Compiler
- Backend: ASP.NET Core Web API on .NET 10, controller-based
- Database: Azure SQL Database (serverless tier)
- ORM: Entity Framework Core
- Hosting: Azure Static Web Apps (frontend), Azure App Service (API)
- CI/CD: GitHub Actions with OIDC federated auth to Azure

**Repo layout (monorepo):**
- `/web` — React frontend
- `/api` — .NET Web API
- `/.github/workflows` — CI/CD pipelines

## Branching and PRs

- `main` is protected. All changes go through PRs from `development` or feature branches.
- The PR must pass the build check.
- Squash merges preferred; keep main's history linear.
- Branch names: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.

## CI/CD Auth Patterns

- **API deployment (App Service)**: OIDC federated credentials. No long-lived secrets.
- **Web deployment (Static Web Apps)**: Auto-generated deployment token from Azure,
  stored as `AZURE_STATIC_WEB_APPS_API_TOKEN_<SUFFIX>` GitHub secret. OIDC is not
  yet supported by the Azure/static-web-apps-deploy action (see
  github.com/Azure/static-web-apps/issues/1304). A long-lived deployment token is used instead, stored as a GitHub secret. The token is scoped to a single Static Web App and has no broader access. The API tier uses OIDC as the more secure pattern.
- **Branch protection**: Required check is `CI Success` (the aggregator job),
  which depends on all relevant tier jobs. This name is stable and controlled
  within the workflow file.

## Frontend Conventions (`/web`)

### File Extensions

- `.ts` — TypeScript files containing no JSX (utilities, hooks, types, API clients).
- `.tsx` — TypeScript files containing JSX (React components).

### Folder Structure

Feature-based, not type-based. The structure is:

web/src/
features/          ← domain features, each self-contained
<feature-name>/
components/    ← only when multiple components exist
hooks/         ← only when multiple hooks exist
api/           ← API calls specific to this feature
types.ts       ← only when shared across multiple files
index.ts       ← public API of the feature
shared/            ← cross-cutting concerns ONLY
components/      ← truly reusable UI (Button, Card)
hooks/           ← truly reusable hooks (useDebounce)
utils/           ← pure functions
pages/             ← route-level composition only
App.tsx
main.tsx

### Rules

1. **Feature isolation.** Features must not import from each other's internals.
   Cross-feature imports go through the feature's `index.ts`.

2. **Pages are thin.** A page composes features. It contains no business logic,
   no data fetching, no state management beyond routing concerns. If a page is
   doing real work, that work belongs in a feature.

3. **`shared/` has a high bar.** Code goes into `shared/` only when at least two
   features use it. Default to keeping things inside features. Prefer duplication
   over premature abstraction.

4. **No premature subfolders.** A feature with one component just has
   `UserList.tsx` at its root, not `components/UserList.tsx`. Create subfolders
   when there are 3+ related files.

5. **No reflexive `types.ts` files.** Types live next to the code that uses them.
   Create `types.ts` only when types are shared across multiple files within a feature.

### TypeScript Syntax Restrictions

The project uses `erasableSyntaxOnly` mode. Do not use:
- Constructor parameter properties: `constructor(public x: number)`
- TypeScript-only `enum` declarations (use `const X = { ... } as const` instead)
- `namespace` blocks

Equivalent JavaScript-compatible patterns are required. This keeps the codebase
compatible with type-erasure-only tooling and future Node native TypeScript support.

### Component Conventions

- **TypeScript strict mode.** All components and hooks must be typed.
- **Function components only.** No class components.
- **`type`, not `interface`, for props.** Use `type FooProps = { ... }`.
- **Named exports.** No default exports for components; named exports help with
  refactoring and search.
- **One component per file.** File name matches component name (`UserList.tsx`
  exports `UserList`).

### State Management

- **Local state** (`useState`, `useReducer`) is the default. Reach for higher
  abstractions only when justified.
- **Server state**: use TanStack Query (`@tanstack/react-query`). Do not use
  `useEffect` + `fetch` patterns for data loading in new code.
- **Cross-component client state**: React Context for small needs; Zustand if it
  gets complex. Avoid Redux unless there's a specific reason.
- **Form state**: React Hook Form for non-trivial forms. Plain `useState` for
  one-or-two-field forms.

### React Compiler

The React Compiler is enabled. **Do not manually wrap things in `useMemo`,
`useCallback`, or `React.memo`** unless you have a specific reason the compiler
can't handle (rare). Trust the compiler. If you find yourself reaching for manual
memoization, the code is probably structured wrong.

### Styling

- (To be decided — currently Vite default CSS. Likely Tailwind or CSS Modules
  going forward. Update this section when chosen.)

### Imports

- Path alias `@/` resolves to `web/src/`. Use `@/features/users/...` over
  relative paths once you're more than one folder deep.
- Group imports: React/external libraries first, then `@/` imports, then relative
  imports. Blank line between groups.

## Backend Conventions (`/api`)

(To be filled in when the API has more substance. Placeholder for now.)

- .NET 10, controller-based Web API.
- EF Core with SQL Server provider against Azure SQL Database.
- `IDbContextFactory<T>` pattern for context creation.
- `Result<T>` envelope for service-layer returns.

## Infrastructure Conventions

- Resources live in `rg-reference-architecture-eastus2` (despite the name, contents
  may live in other regions due to capacity).
- Naming: prefer `<type>-<workload>-<instance>` without baking region into names.
- OIDC federated auth for all GitHub Actions → Azure deployments. No long-lived
  secrets in workflow files.

## What NOT to do

- Don't add Redux without discussing first.
- Don't add a UI library (MUI, Ant Design) without discussing first. We may end
  up with Radix + Tailwind via shadcn, but it's not decided.
- Don't use `useEffect` for data fetching in new code. Use TanStack Query.
- Don't create barrel files (`index.ts` that just re-exports everything) except
  for the public API of a feature.
- Don't introduce new top-level folders in `web/src/` without updating this file.
- Don't suppress ESLint or TypeScript errors with comments. Fix the underlying issue.