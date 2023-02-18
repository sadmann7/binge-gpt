import Head from "next/head";
import type { NextPageWithLayout } from "./_app";

// external imports
import DefaultLayout from "@/layouts/DefaultLayout";

const TopShows: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Top Shows | WatchCopilot</title>
      </Head>
      <main className="container mx-auto mt-24 mb-14 max-w-5xl px-4">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-black sm:text-4xl">
          Top Shows
        </h1>
      </main>
    </>
  );
};

export default TopShows;

TopShows.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
