/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'Coding-practice';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only set basePath/assetPrefix on GitHub Pages builds so local dev isn't 404
  basePath: isPages ? `/${repoName}` : undefined,
  assetPrefix: isPages ? `/${repoName}/` : undefined,
  trailingSlash: true,
};

module.exports = nextConfig;

