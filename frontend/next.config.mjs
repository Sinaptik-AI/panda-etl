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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: "worker-loader" },
    });
    return config;
  },
};

export default nextConfig;
