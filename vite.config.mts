import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  publicDir: 'public',
  root: '.',  // 顯式設置根目錄
  
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/assets/**',
          dest: 'assets'
        }
      ]
    })
  ],
  
  server: {
    open: true,
    port: 3000,
    host: 'localhost',
    strictPort: true, // 強制使用指定端口
    hmr: { port: 3000 }
  },
  
  build: {
    outDir: '../phaser-test-ground',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: 'index.html' // 更新為根目錄下的文件
    }
  },
  
  resolve: {
    alias: {
      '/assets': '/public/assets'
    }
  },
  
  optimizeDeps: {
    include: ['phaser']
  }
});