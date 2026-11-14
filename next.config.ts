import type { NextConfig } from "next";

const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  // Whitelist local network IPs, hotspot addresses, and tunnels for mobile testing
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.137.1",
    "192.168.0.103",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "*.trycloudflare.com",
    "*.lhr.life",
    "*.loca.lt",
    "*.ngrok-free.app",
  ],
  experimental: {
    // Five 5 MB photos plus multipart framing; the route enforces its own stream cap.
    proxyClientMaxBodySize: "26mb",
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "192.168.137.1:3000",
        "192.168.0.103:3000",
        "192.168.*:3000",
        "*.trycloudflare.com",
        "*.lhr.life",
      ],
    },
  },
};

export default nextConfig;
