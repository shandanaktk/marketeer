# Marketeer frontend

Responsive React/Vite frontend for automated social publishing and Meta recruitment campaigns. The interface includes the public landing page, authentication and onboarding, a Knowledge Base, social content creation and scheduling, vacancy intake, Meta campaign generation/review, lead handling, and vacancy-linked performance reporting.

## Local development

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Vite serves the app on port `5173` by default.

Useful demo URLs:

- Landing page: `/`
- Sign up: `/?view=signup`
- Dashboard: `/?view=dashboard`
- Knowledge Base: `/?view=dashboard&tab=knowledge`
- Vacancies: `/?view=dashboard&tab=vacancies`
- Meta reporting: `/?view=dashboard&tab=reporting`

## API configuration

Copy `.env.example` to `.env.local` and set:

```env
VITE_API_BASE_URL=https://your-main-api.example.com
VITE_META_ADS_API_BASE_URL=https://your-meta-api.example.com
```

Until API URLs and authentication are available, the UI uses the isolated mock adapters in `src/dashboardMockData.js` and `src/srsMockData.js`. Components do not embed the main demo record sets, so those modules can be replaced by API adapters later.

## Production build

```bash
npm ci
npm run build
```

The static production output is written to `dist/`.

## Dokploy values

- Build type: Dockerfile (recommended; production Nginx server included)
- Branch: `main`
- Build path: `/` (repository root, which already contains package.json)
- Dockerfile path: `Dockerfile`
- Docker context path: `.`
- Docker build stage: `production` (or leave blank to use the final stage; do not select `build`)
- Container port: `80`
- Domain target port: `80`; enable HTTPS on your domain in Dokploy
- Publish directory: not used for Dockerfile builds; the image serves the built `dist` directory
- Start command: leave blank (the Dockerfile starts Nginx)

These paths assume the connected repository is this directory, `E:\marketeer\marketeer`, not its parent. Commit and push the changed files before deploying the `main` branch. The two optional `VITE_*` API URLs must be supplied as Docker build arguments; they are compiled into the public frontend and must not contain secrets. Changing them requires a rebuild.

Equivalent local Docker commands:

```bash
docker build --target production -f Dockerfile -t marketeer .
docker run --rm -p 8080:80 marketeer
```

## Dashboard account menu

The header search UI and its state/handler are commented out for later integration. The avatar opens Settings and Log out, with arrow-key navigation, Escape, and outside-click dismissal. Log out removes the `access_token` used by the API adapter and reloads the sign-in page to clear in-memory demo state, preserving the chosen theme. Backend authentication/session revocation and protected routes are not implemented in this frontend prototype.

Alternatively, for a static-site build:

- Root directory: `/`
- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`
- Development port: `5173`
- Local preview only: `npm run preview -- --host 0.0.0.0 --port 4173`

Local build directory: `E:\marketeer\marketeer\dist`. This repository has not been pushed or deployed by this task. Dockerfile configuration is supplied but the container build requires Docker and has not been executed here.

## Reference-led redesign

The landing uses locally served Aeonik, Aeonik Mono, and Megazoid font files, a scroll-linked collage hero, horizontal marquees, an interactive five-tab product demo, and vertical social-logo columns. Reduced-motion preferences and a manual pause control are supported. Mobile uses a dedicated editor/preview switch instead of horizontal overflow. Auth, onboarding, and dashboard typography and colors share the same theme.

Landing demo records are isolated in `src/landingMockData.js`. These previews do not send posts, create campaigns, or call AI services. Public fonts and artwork copied from the requested reference are isolated in `public/reference`. See `public/reference/ASSET-NOTICE.md`: obtain the relevant commercial font/artwork permissions or replace these assets before public deployment. Reference artwork is illustrative, not work produced by Marketeer.

For browser regression checks, launch Chrome with a local DevTools port `9222`, run Vite, then execute `node scripts/browser-qa.mjs landing 1365 768` or `node scripts/browser-qa.mjs dashboard-sweep 1365 900`. Screenshots are generated in ignored `qa/`.

Configure an SPA fallback to `/index.html` so query-string dashboard views continue to resolve on direct loads.
