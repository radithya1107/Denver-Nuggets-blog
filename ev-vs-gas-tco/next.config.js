/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Project Pages are served from https://<user>.github.io/<repo>
  // This repo is "Coding-practice"; set basePath accordingly for asset routing.
  basePath: '/Coding-practice',
  trailingSlash: true,
};

module.exports = nextConfig;

