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

  webpack(config) {
    config.module.rules.push({
      test: /\.mjs$/,
      exclude: /pdf\.worker\.min\.mjs$/, // Exclude pdf.worker.min.mjs from processing
      type: "javascript/auto",
    });

    return config;
  },
};

export default nextConfig;
