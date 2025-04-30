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
    
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };

      // 修改复制配置，复制到多个可能的位置
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/chunks/walrus_wasm_bg.wasm'),
            },
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, '.next/server/walrus_wasm_bg.wasm'),
            },
            {
              from: path.join(
                __dirname,
                'node_modules/@mysten/walrus-wasm/walrus_wasm_bg.wasm'
              ),
              to: path.join(__dirname, 'public/walrus_wasm_bg.wasm'),
            },
          ],
        })
      );

      // 强制修改模块的路径解析
      config.module.rules.push({
        test: /walrus_wasm_bg\.wasm$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'server/chunks/',
            publicPath: '/_next/server/chunks/',
          },
        },
      });
    }
    
    return config;
  },
};

export default nextConfig;
