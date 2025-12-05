import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.themealdb.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
