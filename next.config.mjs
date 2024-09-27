/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        config.resolve.fallback = {
    
          // if you miss it, all the other options in fallback, specified
          // by next.js will be dropped.
          ...config.resolve.fallback,  
    
          fs: false, // the solution
        };
        
        return config;
      },
      env: {
        VISION_KEY: process.env.VISION_KEY,
        VISION_ENDPOINT: process.env.CONTENTFUL_ACCESS_TOKEN,
        AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING
      },
};

export default nextConfig;
