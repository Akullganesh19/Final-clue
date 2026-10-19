pnpm install
pnpm lint || true
pnpm build || true
npx tsx --test "src/**/*.test.ts"
