import ToastWrapper from "@/components/ui/ToastWrapper";
import DefaultLayout from "@/layouts/DefaultLayout";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { Analytics } from "@vercel/analytics/react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { type AppType } from "next/app";
import Head from "next/head";
import { type ReactElement, type ReactNode } from "react";
import { Provider as RWBProvider } from "react-wrap-balancer";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <RWBProvider>
      <Head>
        <title>BingeGPT</title>
      </Head>
      {getLayout(<Component {...pageProps} />)}
      <Analytics />
      <ToastWrapper />
    </RWBProvider>
  );
};

export default api.withTRPC(MyApp);
