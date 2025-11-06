/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'Coding-practice';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: isPages ? `/${repoName}` : undefined,
  assetPrefix: isPages ? `/${repoName}/` : undefined,
  trailingSlash: true,
};

module.exports = nextConfig;
