
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact(),
  ],
  server: {
    port: 5173, // Match Vite's default port
  },
  source: {
    alias: {
      '@': './src',
    },
  },
});
