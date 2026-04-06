import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="description" content="OneDrive Index" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
          <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
          <link rel="apple-touch-icon" type="image/png" href="/apple-touch-icon.png" sizes="180x180" />
          <link rel="icon" type="image/png" href="/android-chrome-192x192.png" sizes="192x192" />
          <link rel="icon" type="image/png" href="/android-chrome-512x512.png" sizes="512x512" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
