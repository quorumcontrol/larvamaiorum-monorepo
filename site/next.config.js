/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { buildId, dev }) => {
        config.resolve.symlinks = false
        return config
    },
    images: {
        domains: ['nftstorage.link', 'openailabsprodscus.blob.core.windows.net', "delphsart.s3.fr-par.scw.cloud"]
    }
}

module.exports = nextConfig