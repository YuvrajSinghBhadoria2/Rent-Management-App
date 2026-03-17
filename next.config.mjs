/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['firebase-admin'],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config, { isServer }) => {
        // Mark firebase-admin as external for server-side rendering
        if (isServer) {
            config.externals = [...(config.externals || []), 'firebase-admin'];
        }
        return config;
    },
};

export default nextConfig;
