import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Loads the request config from src/i18n/request.ts.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // GitHub profile photos, used as avatars.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
