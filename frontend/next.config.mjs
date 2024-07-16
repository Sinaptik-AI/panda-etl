/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5328/:path*",
      },
      {
        source: "/assets/:path*",
        destination: "http://127.0.0.1:5328/assets/:path*",
      },
    ];
  },
};

export default nextConfig;
