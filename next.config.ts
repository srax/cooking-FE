import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      const TerserPlugin = require("terser-webpack-plugin");
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // 移除所有 console.* 调用
            },
          },
        }),
      ];
    }
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || "https://api.cooking.city",
    NEXT_PUBLIC_PROJECT_ID: "a4bd19b6f8eb686c9a9e4c39b7ea30b5",
    NEXT_PUBLIC_TWITTER_REDIRECT_URI:
      "https://api.cooking.city/twitter/callback",
    NEXT_PUBLIC_RPC_URL:
      "https://mainnet.helius-rpc.com/?api-key=03e24c82-b6cc-41d8-a779-2efb7c01eb10",
    NEXT_PUBLIC_DEV_RPC_URL:
      "https://broken-muddy-butterfly.solana-devnet.quiknode.pro/270ff8923ae3fcd2e905cf2dd38c6f379a317cca/",
    NEXT_PUBLIC_COOKCITY_PROGRAM_ID:
      "3tAKBGFWaFWtxKhNwjbfaL4fivGfn1fj1bD6Lyw5TtKJ",
    NEXT_PUBLIC_COOKCITY_DEV_PROGRAM_ID:
      "3tAKBGFWaFWtxKhNwjbfaL4fivGfn1fj1bD6Lyw5TtKJ",
    NEXT_PUBLIC_METEORA_DLMM_PROGRAM:
      "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
    NEXT_PUBLIC_IS_DEV: "false",
    NEXT_PUBLIC_BASE_URL: "https://cooking.city",
    NEXT_PUBLIC_CONFIG_ID: "ALEKAF3Q48Vp6NV1uFEKSopAfFUpGEixJgEdTEdCcHvx",
    NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID:
      "FQYWAQd6JgLgpbhq1zo4VoCPwLyAwB2uNZqceGPTrvMe",
    NEXT_PUBLIC_CONFIG_DEV_ID: "2jCxhSEPVgsfVtnTco64MhAvu76ocNskkuRW7Wnoi3q3",
    NEXT_PUBLIC_ANTI_SNIPER_CONFIG_DEV_ID:
      "G2Q5WTWYvLFhJwyDbE2idNxDnqjCcDByhSre9X1M1pZy",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https", // 允许 HTTPS 协议
        hostname: "**", // 通配所有主机名
      },
      {
        protocol: "http", // 如果需要，也允许 HTTP 协议（可选）
        hostname: "**", // 通配所有主机名
      },
    ],
    unoptimized: true, // 不优化图片，避免内存泄漏
  },
  async headers() {
    return [
      {
        // 匹配所有路径
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL || "https://api.cooking.city";
    const v2BaseUrl = process.env.V2_BASE_URL || "https://dexapi.gemsgun.com";

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl}/api/:path*`,
        },
        {
          source: "/twitter/:path*",
          destination: `${apiBaseUrl}/twitter/:path*`,
        },
        {
          source: "/v2/:path*",
          destination: `${v2BaseUrl}/v2/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
