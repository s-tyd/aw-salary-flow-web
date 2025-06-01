import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境でのスタンドアロン出力を有効化
  output: 'standalone',
  
  // 開発環境のホットリロード最適化
  experimental: {
    // Turbopackを使用して高速化
    turbo: {
      // ファイル監視の最適化
      resolveAlias: {
        // エイリアス設定があればここに追加
      },
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
