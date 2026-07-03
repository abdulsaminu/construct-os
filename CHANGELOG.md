# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2025-07-03

### Added
- Production README with architecture diagram, tech stack, and repository layout
- `docs/Architecture.md` — CFEL reducer pattern, event sourcing, treasury, settlement, risk engine
- `docs/DeveloperGuide.md` — Folder structure, coding conventions, how to add pages and reducer commands
- `docs/API.md` — Complete API reference with all 18 endpoints and request/response schemas
- `docs/DesignSystem.md` — Typography, spacing, color, shadow, animation, and accessibility tokens
- `CHANGELOG.md` and `LICENSE` (MIT)
- Root convenience scripts: `dev:all`, `build:all`, `typecheck:all`, `clean`
- Backend `tsconfig.json` (previously missing, only frontend config existed at root)
- `.env.example` tracked in version control

### Changed
- Improved `.gitignore` with Python artifacts, generated files, and OS-specific entries
- Removed 9 tooling artifacts from version control (audit scripts, generated PDFs, worklog)
- Removed 7 stale root-level config files (vite, tailwind, postcss — these belong in `frontend/`)
- Root `package.json` version unchanged but scripts expanded for monorepo DX

### Removed
- Stale root `vite.config.ts`, `tsconfig.node.json`, `postcss.config.js`, `tailwind.config.js`, `index.html`, `setup-frontend.sh`
- Tracked Python scripts (`p8-*.py`) and generated artifacts

## [0.8.0] - 2025-07-02

### Added
- Design token system with 11 typography levels, 4 semantic shadows, 3 animation durations
- Component-layer CSS classes (btn-primary, form-input, card-interactive, drawer, toast, dialog)
- WCAG AA accessibility: focus-visible outlines, ARIA attributes, keyboard navigation, screen reader support
- Responsive grid system with mobile-first breakpoints
- `scope="col"` on all table headers
- Performance: `useMemo` for derived data maps in intelligence pages

### Changed
- Standardized all 85 frontend components to use design tokens (576 automated replacements)
- Shadow-based card hover (no micro-transforms)
- Icon sizes normalized to 16/20/24/32 scale
- Spacing normalized to 4px grid

## [0.7.0] - 2025-07-02

### Added
- Motion design: fade-in, scale-in, slide-in, toast, shimmer animations
- Easing tokens: ease-out, ease-in, ease-panel
- Reduced motion media query support
- Skeleton loading components with shimmer animation
- Toast notification system (React Context)
- Page transition animations

## [0.6.0] - 2025-07-01

### Added
- Intelligence & Analytics module with 5 tabs (Overview, Risk, Allocation, Forecasts, System Health)
- Real-time ledger event feed derived from API data
- Dynamic cash flow chart with proportional bar heights
- System health indicators derived from data availability
- Service status grid with computed health from real metrics
- Per-project risk breakdown panels
- Settlement confidence gauge from actual milestone data

### Changed
- Replaced all hardcoded bars, gauges, and confidence values with dynamic calculations
- Added error states with retry to all intelligence pages

## [0.5.0] - 2025-06-30

### Added
- Ledger page with table/timeline toggle, search, event filter, CSV export
- Event detail drawer with blockchain metadata (txHash, block, gas)
- Settlement page with Arbiscan links
- Contractor registration with multi-field form
- Project detail page with milestone fund/claim/settle actions

## [0.4.0] - 2025-06-29

### Added
- Treasury page with KPIs, capital distribution, deposit form, timeline
- Portfolio page with search, status filters, project cards
- New Project 3-step wizard with milestone definition and contractor assignment
- Dashboard with KPIs, portfolio panel, treasury flow, command center, risk monitor

## [0.3.0] - 2025-06-28

### Added
- CFEL engine: pure reducer with 6 command types
- Capital conservation invariant
- BigInt-based financial arithmetic
- JSON file state persistence with atomic writes
- Arc blockchain settlement adapter
- Multi-tenant organization registry
- 18 REST API endpoints
- BigInt serialization/deserialization

## [0.2.0] - 2025-06-27

### Added
- React 18 frontend with Vite 5
- Tailwind CSS design system
- Lazy-loaded page routing
- 19 UI primitive components
- Layout system (AppShell, Sidebar, TopBar)
- Typed API client layer

## [0.1.0] - 2025-06-26

### Added
- Initial project setup
- Backend TypeScript configuration
- Domain types (Project, Milestone, Contractor, LedgerEntry, Economy)