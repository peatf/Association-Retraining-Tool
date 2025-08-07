import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js']
  },
  
  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    
    // Ensure compatibility with existing content pipeline
    rollupOptions: {
      
      // Preserve existing assets structure
      output: {
        assetFileNames: (assetInfo) => {
          // Keep CSS and other assets in predictable locations
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    
    // Performance budget aligned with requirements
    chunkSizeWarningLimit: 1000, // 1MB chunks
    
    // Ensure content pipeline assets are preserved
    copyPublicDir: true
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: false,
    
    // Serve existing content pipeline files
    fs: {
      allow: ['..']
    }
  },
  
  // Asset handling
  publicDir: 'public',
  
  // Resolve configuration for React components
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // Ensure existing JavaScript modules work
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'styled-components']
  }
});