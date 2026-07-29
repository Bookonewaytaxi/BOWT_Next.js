import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* This was present in the old Vite index.html but was lost during
            the Next.js migration. Without it, mobile browsers assume a
            desktop-width layout viewport (~980px) instead of the device's
            real width, which is why the site was only rendering in the
            left portion of the screen on mobile. */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="google-site-verification" content="U2xPCPHTpylUOlZgyla8j9dEAdzD00Ufxh1crxpDlgc" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
