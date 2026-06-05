const nextConfig = {
  /* config options here */
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
  // Fix: Raise the Server Actions body limit from 1MB to 20MB to accommodate image uploads
  serverActions: {
    bodySizeLimit: "20mb",
  },
};

export default nextConfig;