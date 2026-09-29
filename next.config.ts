import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Loads the request config from src/i18n/request.ts.
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {/* config options here */};

export default withNextIntl(nextConfig);
