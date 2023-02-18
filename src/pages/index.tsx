import Head from "next/head";
import type { NextPageWithLayout } from "./_app";

// external imports
import DefaultLayout from "@/layouts/DefaultLayout";
import { api } from "../utils/api";

const Home: NextPageWithLayout = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>WatchCopilot</title>
      </Head>
      <main className="container mt-24 mb-14 min-h-screen w-full max-w-5xl px-4">
        <h1>WatchCopilot</h1>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
