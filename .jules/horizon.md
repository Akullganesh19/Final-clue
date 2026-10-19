## 2024-05-15 — CI/CD Pipeline Modernization
**Risk identified:** The CI pipeline is using outdated build tooling (Webpack) despite the project adopting modern alternatives (Vite/esbuild). It also targets older Node.js versions (18.x, 20.x) that do not support modern native testing patterns like quoted glob expansion, which will cause the native test runner to fail in CI environments.
**Migration target:** A modern CI pipeline running strictly on Node.js 22.x+ executing Vite/esbuild builds and utilizing Node's native test runner (`node:test`).
**Migrated this session:** Replaced the legacy Webpack GitHub Actions workflow with a modern `build.yml` pipeline (running `npm install`, `lint`, `build`, and `test` strictly on Node 22.x) and added the correct native test script to `package.json`.
**Remaining:** Complete migration of any remaining legacy CI/CD configurations, potentially setting up caching for Vite/esbuild to optimize pipeline performance.
**Next session:** Investigate adding dependency caching to the new CI pipeline and verify if any other tools require Node 22.x specific configurations.
