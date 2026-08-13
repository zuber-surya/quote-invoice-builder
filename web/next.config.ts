import type { NextConfig } from "next";

// docs/Deployment & Infrastructure Specification.md section 44 — production security
// headers. `unsafe-inline` on script-src is required because the Next.js App Router
// injects inline hydration scripts without a nonce; tightening this needs a
// middleware-issued nonce, out of scope for MVP. `unsafe-eval` is added in dev only —
// Next's dev-mode HMR evaluates code as strings and a strict CSP breaks it outright
// (verified against the running app; section 44 warns against shipping a CSP that
// breaks the app without testing it first).
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
