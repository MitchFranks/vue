// Static export so the prototype keeps deploying to GitHub Pages as plain
// files. NEXT_PUBLIC_BASE_PATH is set by the deploy workflow to the repo's
// project-page subpath; locally it is empty and the site serves from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true }
}

export default nextConfig
