## 2026-06-22 — CI/CD Pipeline Modernization
**Risk identified:** The GitHub Actions pipeline is still configured for Webpack (`webpack.yml`), runs `npx webpack` (which isn't a dependency), and tests against Node 18. This is broken because the project has moved to Vite/esbuild, and Node 18 is incompatible with current dependencies (`@tailwindcss/oxide`, `@google/genai`).
**Migration target:** A modernized `build.yml` pipeline that uses Vite/esbuild via `npm run build` and tests against supported Node versions (20.x, 22.x).
**Migrated this session:** Replaced `webpack.yml` with `build.yml` using correct Node versions and build commands. Provided minimum required `src/App.tsx` and `server.ts` files for the build processes to succeed.
**Remaining:** The rest of the frontend and backend implementations need to be fully built out and connected.
**Next session:** Complete the frontend/backend feature integration.
