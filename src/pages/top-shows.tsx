import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import type { NextPageWithLayout } from "./_app";

// external imports
import Modal from "@/components/Modal";
import DefaultLayout from "@/layouts/DefaultLayout";
import ErrorScreen from "@/screens/ErrorScreen";
import LoadingScreen from "@/screens/LoadingScreen";
import { api } from "@/utils/api";
import { containerReveal, itemFadeDown } from "@/utils/constants";
import { extractYear } from "@/utils/format";
import type { SavedShow } from "@prisma/client";

const TopShows: NextPageWithLayout = () => {
  // shows query
  const showsQuery = api.shows.getPaginated.useInfiniteQuery(
    {
      limit: 4,
    },
    {
      getNextPageParam: (lastPage) => {
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
        <title>Top Shows | WatchCopilot</title>
      </Head>
      <main className="container mx-auto mt-20 mb-14 grid w-full max-w-5xl gap-8 px-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Top Shows
        </h1>
        <motion.div
          className="grid w-full grid-cols-1 gap-5 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          initial="hidden"
          animate="visible"
          variants={containerReveal}
        >
          {showsQuery.data?.pages.map((page) =>
            page.savedShows.map((show) => (
              <SavedShowCard key={show.id} show={show} />
            ))
          )}
        </motion.div>
        <button
          aria-label="load more shows"
          className={
            showsQuery.hasNextPage
              ? "block rounded-md bg-gray-100 px-4 py-2 font-semibold text-gray-900 shadow-md ring-1 ring-gray-500 transition enabled:hover:bg-gray-200 enabled:active:bg-gray-100 disabled:cursor-not-allowed"
              : "hidden"
          }
          ref={ref}
          onClick={() => void showsQuery.fetchNextPage()}
          disabled={!showsQuery.hasNextPage || showsQuery.isFetchingNextPage}
        >
          {showsQuery.isFetchingNextPage ? (
            <div className="flex items-center justify-center gap-2">
              <div className="aspect-square w-4 animate-spin rounded-full border-2 border-solid border-gray-100 border-t-transparent" />
              <span>Loading...</span>
            </div>
          ) : showsQuery.hasNextPage ? (
            "Load more shows"
          ) : null}
        </button>
      </main>
    </>
  );
};

export default TopShows;

TopShows.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

const SavedShowCard = ({ show }: { show: SavedShow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // find show mutation
  const findShowMutation = api.shows.findOne.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (findShowMutation.isError) {
    toast.error(findShowMutation.error?.message);
    return null;
  }

  return (
    <motion.div
      variants={itemFadeDown}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {findShowMutation.isSuccess ? (
        <Modal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mediaType={show.mediaType}
          show={findShowMutation.data}
          isLiked={isLiked}
          setIsLiked={setIsLiked}
          isLikeButtonVisible={false}
        />
      ) : null}
      <div
        role="button"
        aria-label={`view ${show.name} details`}
        className="grid cursor-pointer gap-2 overflow-hidden rounded-md bg-white shadow-md"
        onClick={() => {
          if (!show.name || !show.mediaType) return;
          findShowMutation.mutate({
            query: show.name,
            mediaType: show.mediaType,
          });
          setIsOpen(true);
        }}
      >
        <Image
          src={
            show.image
              ? `https://image.tmdb.org/t/p/w220_and_h330_face/${String(
                  show.image
                )}`
              : "https://via.placeholder.com/500x500"
          }
          alt={show.name}
          width={500}
          height={500}
          className="h-60 w-full object-cover"
          priority
        />
        <div className="mx-4 mb-5 flex flex-col gap-1">
          <h3 className="flex-1 text-sm font-medium text-gray-900 line-clamp-1 sm:text-base">
            {show.name}
          </h3>
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            {show.mediaType === "tv" ? "TV Show" : "Movie"}
          </p>
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            {extractYear(show.releaseDate ?? "")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
