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
    // Conjuntos enxutos: cada <img> gera srcset de 3-4 candidatos (vs 11 default).
    // Menos bytes no HTML, menos variantes pra Vercel cachear -> menos MISS.
    deviceSizes: [480, 768, 1200],
    imageSizes: [200, 280, 400, 600],
  },
};

module.exports = nextConfig;
