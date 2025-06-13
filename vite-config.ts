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
    strictPort: true // 強制使用指定端口
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: 'index.html' // 更新為根目錄下的文件
    }
  },
  
  // 取消 base 配置的注釋（確保格式正確）
  base: '/phaser-test-ground/',
  
  resolve: {
    alias: {
      '/assets': '/public/assets'
    }
  },
  
  optimizeDeps: {
    include: ['phaser']
  }
});