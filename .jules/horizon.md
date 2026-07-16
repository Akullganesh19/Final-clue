## 2024-07-16 — CI Pipeline Modernization
**Risk identified:** The GitHub Actions workflow relies on an unsupported Node 18 runtime and incorrectly calls 'npx webpack' despite the project migrating to Vite and esbuild, resulting in failing CI builds as the project evolves.
**Migration target:** A modernized CI pipeline utilizing currently supported active and LTS Node.js versions (20.x, 22.x) and executing the correct build scripts matching the project's current tooling (Vite/esbuild).
**Migrated this session:** Updated .github/workflows/webpack.yml to remove Node 18.x from the testing matrix and replaced the failing 'npx webpack' call with 'npm run build'.
**Remaining:** Rename the workflow file from webpack.yml to build.yml to accurately reflect the removal of Webpack, and consider migrating package management to pnpm for faster CI resolution.
**Next session:** Rename the workflow file and update package management tooling to match the modernized build process.
