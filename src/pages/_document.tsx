import { Head, Html, Main, NextScript } from "next/document";

// external imports
import Meta from "@/components/Meta";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <Meta />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
