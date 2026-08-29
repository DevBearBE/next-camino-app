import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  redirects: async () => [
    {
      source: "/",
      destination: "/waitlist",
      permanent: true,
    },
  ],
};

export default nextConfig;
