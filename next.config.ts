import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  
  // 🛠️ FIX: Nest the configuration parameters inside the experimental engine object block
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // Next.js will now explicitly process this threshold
    },
  },
};

export default nextConfig;