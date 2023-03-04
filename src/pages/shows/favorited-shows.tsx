import Tabs from "@/components/Tabs";
import Button from "@/components/ui/Button";
import DefaultLayout from "@/layouts/DefaultLayout";
import ErrorScreen from "@/screens/ErrorScreen";
import LoadingScreen from "@/screens/LoadingScreen";
import { api } from "@/utils/api";
import type { MEDIA_TYPE } from "@prisma/client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import type { NextPageWithLayout } from "../_app";

const FavoritedShows: NextPageWithLayout = () => {
  const [mediaType, setMediaType] = useState<MEDIA_TYPE | null>(null);

  // shows query
  const showsQuery = api.shows.getPaginated.useInfiniteQuery(
    {
      limit: 10,
      mediaType: mediaType,
    },
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;
        if (lastPage.nextCursor) {
          return lastPage.nextCursor;
        }
        return undefined;
      },
    }
  );

  // infinite scroll
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView && showsQuery.hasNextPage) return;
    if (inView) {
      void showsQuery.fetchNextPage();
    }
  }, [inView, showsQuery]);

  if (showsQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (showsQuery.isError) {
    return <ErrorScreen error={showsQuery.error} />;
  }

  return (
    <>
      <Head>
        <title>Favorited Shows | BingeGPT</title>
      </Head>
      <main className="container mx-auto mt-20 mb-10 grid w-full max-w-5xl gap-5 px-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-50 sm:text-3xl">
          Favorited shows
        </h1>
        <Tabs
          data={showsQuery.data?.pages}
          mediaType={mediaType}
          setMediaType={setMediaType}
        />
        <Button
          aria-label="load more shows"
          variant="tertiary"
          className={showsQuery.hasNextPage ? "block" : "hidden"}
          ref={ref}
          onClick={() => void showsQuery.fetchNextPage()}
          isLoading={showsQuery.isFetchingNextPage}
          loadingVariant="dots"
          disabled={!showsQuery.hasNextPage || showsQuery.isFetchingNextPage}
        >
          {!showsQuery.isFetchingNextPage && showsQuery.hasNextPage
            ? null
            : showsQuery.hasNextPage
            ? "Load more shows"
            : `That's all folks!`}
        </Button>
      </main>
    </>
  );
};

export default FavoritedShows;

FavoritedShows.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
