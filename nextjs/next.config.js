/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.discordapp.com"],
  },
  async redirects() {
    return [
      {
        source: "/invite",
        destination: process.env.NEXT_PUBLIC_INVITE_URL,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
