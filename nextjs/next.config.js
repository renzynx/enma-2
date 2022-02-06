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
        destination:
          "https://discord.com/api/oauth2/authorize?client_id=772690931539247104&permissions=8&scope=bot%20applications.commands",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
