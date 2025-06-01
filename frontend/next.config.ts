import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // 本番環境でのスタンドアロン出力を有効化
  output: 'standalone',
  
  // 本番ビルド時のlintエラーを無視
  eslint: {
    // 本番ビルド時はlintエラーでビルドを停止しない
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時のTypeScriptエラーを無視
    ignoreBuildErrors: true,
  },
  
  // Turbopack設定（experimental.turboは廃止予定）
  turbopack: {
    // ファイル監視の最適化
    resolveAlias: {
      // エイリアス設定があればここに追加
    },
  },
  // ファイル監視の設定
  webpack: (config, { dev }) => {
    if (dev) {
      // 開発環境でのファイル監視最適化
      config.watchOptions = {
        poll: 1000, // 1秒ごとにポーリング
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    // Webpack alias設定（本番ビルド用）
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
      '@/lib': path.join(__dirname, 'src', 'lib'),
      '@/components': path.join(__dirname, 'src', 'components'),
      '@/hooks': path.join(__dirname, 'src', 'hooks'),
      '@/contexts': path.join(__dirname, 'src', 'contexts'),
      '@/services': path.join(__dirname, 'src', 'services'),
      '@/utils': path.join(__dirname, 'src', 'utils'),
    };
    
    // Node.js fallback設定（クライアントサイドでNode.js APIを無効化）
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      buffer: false,
      stream: false,
      util: false,
      assert: false,
      os: false,
    };
    
    // xlsxライブラリのための追加設定
    config.ignoreWarnings = [
      { module: /node_modules\/xlsx/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];
    
    return config;
  },
};

export default nextConfig;
