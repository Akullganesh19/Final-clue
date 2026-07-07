cat << 'APP' > src/App.tsx
import React from 'react';
export default function App() { return <div></div>; }
APP
cat << 'SERVER' > server.ts
import express from 'express';
const app = express();
app.listen(3000);
SERVER
pnpm build
pnpm lint
