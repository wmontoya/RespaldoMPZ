/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        BACKEND_URL: process.env.BACKEND_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
};

export default nextConfig;