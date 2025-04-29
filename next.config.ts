import type { NextConfig } from "next";
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    
    // 确保 WASM 文件被正确处理
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };

      // 复制 WASM 文件
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                'node_modules/.pnpm/@mysten+walrus-wasm@0.0.6/node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/chunks/'),
            },
          ],
        })
      );
    }
    
    return config;
  },
};

export default nextConfig;
