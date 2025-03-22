
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  // 配置服务器
  server: {
    host: '::',
    port: 8080,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  // 配置构建选项
  output: {
    // Enable source maps for better debugging
    sourceMap: true,
  },
  // 配置 CSS 选项
  css: {
    // Enable source maps in development mode as well
    sourceMap: mode === 'development',
  },
  // 配置插件
  plugins: [
    pluginReact(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  source: {
    // 配置资源包含规则
    include: ['**/*.jpg', '**/*.png', '**/*.svg', '**/*.gif'],
    // 配置入口文件
    entry: {
      index: './src/main.tsx',
    },
    // 配置别名
    alias: {
      '@': './src',
      '/lovable-uploads': '../lovable-uploads',
    },
  },
  // 配置公共目录
  dev: {
    assetPrefix: '/',
    publicDir: 'public',
  },
}));
