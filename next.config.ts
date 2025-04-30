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
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    // 在 Vercel 环境中，我们需要确保 WASM 文件被正确复制
    if (process.env.VERCEL) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/chunks/'),
            },
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/vendor-chunks/'),
            },
          ],
        })
      );
    } else {
      // 在本地开发环境中，我们也需要复制 WASM 文件
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/chunks/'),
            },
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/vendor-chunks/'),
            },
          ],
        })
      );
    }
    
    return config;
  },
};

export default nextConfig;
