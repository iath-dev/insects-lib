/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Añadir un loader para archivos .html
    config.module.rules.push({
      test: /\.html$/,
      use: ['html-loader'],
    });

    if (!isServer) {
      // Excluir dependencias solo para el cliente
      config.resolve.fallback = {
        fs: false, // Evita errores relacionados con el módulo 'fs' en el cliente
        path: false, // Evita errores con el módulo 'path' en el cliente
        os: false, // Evita errores con el módulo 'os' en el cliente
      };
    } else {
      // Agrega cualquier otra configuración para el servidor si es necesario
    }

    return config;
  },
};

export default nextConfig;
