/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rxzohyrttklxevegdijm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // URLs de imagem incluem timestamp; sao imutaveis -> cache longo no CDN
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    formats: ["image/avif", "image/webp"],
    // Tamanhos que o site realmente serve (1/1 thumbs + 16/9 full-width)
    deviceSizes: [360, 480, 640, 768, 1080, 1200],
    imageSizes: [120, 200, 280, 400, 600],
  },
};

module.exports = nextConfig;
