import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Before regions existed, BC steps lived at /steps/<slug>.
    return [
      {
        source: "/steps/:slug",
        destination: "/bc/steps/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
