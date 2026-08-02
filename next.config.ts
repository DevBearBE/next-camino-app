import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    {
      source: "/",
      destination: "/waitlist",
      permanent: true,
    },
  ],
};

export default nextConfig;
