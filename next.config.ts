import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export, published by Netlify as a plain static site: no middleware, API routes or server actions.
  output: "export",
  // Pages export as /contact.html etc.; Netlify serves them at /contact (see netlify.toml).
  trailingSlash: false,
  images: { unoptimized: true },
  experimental: {
    // One root layout per locale (app/(en), app/(hi)/hi) means the 404 needs global-not-found.
    globalNotFound: true,
    // Inline the (small, ~5 KB gzipped) stylesheet into each page: saves a render-blocking
    // round trip on a first visit over mobile data. Measured: see README "Performance".
    inlineCss: true,
  },
};

export default nextConfig;
