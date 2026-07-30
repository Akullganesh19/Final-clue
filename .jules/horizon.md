## 2024-03-24 — CI Workflow Modernization
**Risk identified:** The CI workflow uses deprecated Node 18 (which triggers EBADENGINE with Vite/Tailwind) and runs an incorrect `npx webpack` command, which prompts interactively and fails the build on a Vite project.
**Migration target:** Modern Node.js versions (20.x, 22.x) and correct project-specific build scripts (`npm run build`).
**Migrated this session:** Updated `.github/workflows/webpack.yml` to remove Node 18 from the matrix and replaced `npx webpack` with `npm run build`.
**Remaining:** Rename the workflow file from `webpack.yml` to `ci.yml` (deferred to next session to limit PR scope).
**Next session:** Rename the workflow file and update branch protection rules if necessary.
