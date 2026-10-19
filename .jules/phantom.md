## 2024-07-14 — CI Build Pipeline Fix

**Gap found:** The GitHub Actions workflow was failing due to calling `npx webpack` in a project that uses Vite and esbuild, and it failed on Node 18 due to unsupported engines.
**Why it existed:** Legacy or incorrect scaffolding that wasn't updated when the project moved to Vite and required newer Node versions.
**Built:** Updated `.github/workflows/webpack.yml` to remove the unsupported Node 18 matrix and to use the correct `npm run build` command.
**Hot path affected:** Developer integration and deployment pipelines.
**Measurable improvement:** CI pipeline goes from 100% failure to a passing state, unblocking merges.
**Next opportunity:** Consolidate any other deprecated or unused files/workflows in the repository.
