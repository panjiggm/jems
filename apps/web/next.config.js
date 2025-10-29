/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sleek-warthog-446.convex.cloud",
        port: "",
        pathname: "/api/storage/**",
      },
    ],
  },
};

module.exports = nextConfig;
