1.  **Analyze CI Failure:** The CI is failing because `.github/workflows/webpack.yml` runs `npx webpack`, but the project doesn't use Webpack (it uses Vite and esbuild, as stated in the memory). It also fails on Node 18 due to dependency requirements (`@google/genai`, `@tailwindcss/oxide`, `@vitejs/plugin-react` require Node 20+).
2.  **Fix `.github/workflows/webpack.yml`:**
    -   Change `npx webpack` to `npm run build`.
    -   Remove `18.x` from the `node-version` matrix.
3.  **Run pre-commit steps:** Request code review.
4.  **Submit.**
