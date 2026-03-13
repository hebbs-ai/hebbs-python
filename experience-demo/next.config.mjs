/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@hebbs/sdk',
      '@grpc/grpc-js',
      '@grpc/proto-loader',
      'protobufjs',
      'long',
    ],
  },
};

export default nextConfig;
