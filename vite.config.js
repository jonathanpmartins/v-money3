import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    esbuildOptions: {
      target: ['es2020', 'safari14'],
    },
  },
  build: {
    target: ['es2020', 'safari14'],
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'v-money3',
      // formats: ['es', 'cjs' ,'iife', 'umd'],
      // formats: ['es', 'cjs' ,'iife', 'umd'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
