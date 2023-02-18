import "@/styles/globals.css";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { type AppType } from "next/app";
import Head from "next/head";
import { type ReactElement, type ReactNode } from "react";
import { Provider as RWBProvider } from "react-wrap-balancer";

// external imports
import ToastWrapper from "@/components/ToastWrapper";
import DefaultLayout from "@/layouts/DefaultLayout";
import { api } from "@/utils/api";

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
        <title>WatchCopilot</title>
      </Head>
      {getLayout(<Component {...pageProps} />)}
      <ToastWrapper />
    </RWBProvider>
  );
};

export default api.withTRPC(MyApp);
