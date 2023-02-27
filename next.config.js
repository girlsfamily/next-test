/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com']
  }
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/stock',
  //       permanent: true
  //     }
  //   ]
  // }
}

module.exports = nextConfig
