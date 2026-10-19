## 2025-03-05 — CI Workflow Modernization & Webpack Removal
**Risk identified:** The CI pipeline attempts to run webpack in a project configured for Vite/esbuild, which will fail or misbuild. It also tests on Node 18, which is unsupported by dependencies.
**Migration target:** A Vite/esbuild native CI pipeline using npm run build, dropping Node 18, and adding explicit test execution via native Node.js tests.
**Migrated this session:** Updated GitHub Actions workflow to run npm run build and npm test, removed Node 18 from the matrix, added the test script to package.json, and removed unnecessary Webpack references.
**Remaining:** Migrate any remaining npx tsx development scripts to leverage native Node 22 module hooks when they stabilize, and enforce node engine in package.json.
**Next session:** Add engines block to package.json and update development scripts.
