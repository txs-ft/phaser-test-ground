import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  root: '.',  // 顯式設置根目錄,
  base: './',
  server: {
    open: true,
    port: 3000,
    host: '0.0.0.0',
    strictPort: true, // 強制使用指定端口
    hmr: { port: 3000 }
  },
  
  build: {
    outDir: '../phaser-test-ground',
    emptyOutDir: true,
    sourcemap: false
  },
  
  resolve: {
    alias: {
      'assets': '/public/assets'
    }
  },
  
  optimizeDeps: {
    include: ['phaser']
  }
});