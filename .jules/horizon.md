## 2024-06-24 — CI Pipeline Modernization
**Risk identified:** The CI pipeline is configured to use Webpack and Node 18. Webpack is no longer used by the project (which has migrated to Vite and esbuild), and Node 18 is unsupported, causing `EBADENGINE` errors with modern dependencies like `@google/genai` and `@tailwindcss/oxide`. Leaving this broken means no automated PR validation.
**Migration target:** A modernized GitHub Actions workflow that natively supports the Vite/esbuild toolchain and runs exclusively on Node 20+ (Active LTS/Current).
**Migrated this session:** Replaced the legacy `webpack.yml` workflow with `build.yml`. Removed Node 18 from the test matrix. Updated build steps to use the proper commands (`npm run lint`, `npm run build`, and `npm test`).
**Remaining:** None for this specific pipeline update.
**Next session:** Evaluate Express backend architectural patterns for future-proofing.
