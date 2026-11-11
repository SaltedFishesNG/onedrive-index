module.exports = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/pdf-assets/**': [
      './node_modules/pdfjs-dist/cmaps/**/*',
      './node_modules/pdfjs-dist/standard_fonts/**/*',
      './node_modules/pdfjs-dist/wasm/**/*',
      './node_modules/pdfjs-dist/iccs/**/*',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}
