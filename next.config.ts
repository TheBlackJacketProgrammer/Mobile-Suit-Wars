import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR / dev assets when opening the site by LAN IP (not only localhost).
  // Adjust or add entries if your subnet or hostname differs.
  allowedDevOrigins: ["192.168.0.*"],
};

export default nextConfig;
