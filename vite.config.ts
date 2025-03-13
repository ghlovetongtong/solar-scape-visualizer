
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
      // Explicitly allow the lovable-uploads directory
      strict: false
    }
  },
  // Enable source maps for better debugging
  build: {
    sourcemap: true,
  },
  // Enable source maps in development mode as well
  css: {
    devSourcemap: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add an alias for lovable-uploads to make it easier to reference
      "/lovable-uploads": path.resolve(__dirname, "../lovable-uploads")
    },
  },
  // Ensure Vite properly handles non-JavaScript assets like images
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.svg', '**/*.gif'],
  
  // Add specific configuration for handling uploaded images
  publicDir: 'public',
}));
