import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { allowedHosts: ['fix-game-launch-issues-game-c5d86da3d62585c2.v0.build'] },
});
