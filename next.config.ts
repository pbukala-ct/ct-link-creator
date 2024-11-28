/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CTP_PROJECT_KEY: process.env.CTP_PROJECT_KEY,
    CTP_CLIENT_SECRET: process.env.CTP_CLIENT_SECRET,
    CTP_CLIENT_ID: process.env.CTP_CLIENT_ID,
    CTP_AUTH_URL: process.env.CTP_AUTH_URL,
    CTP_API_URL: process.env.CTP_API_URL,
    CTP_SCOPE: process.env.CTP_SCOPE,
    CTP_REGION: process.env.CTP_REGION,
  },
}

module.exports = nextConfig