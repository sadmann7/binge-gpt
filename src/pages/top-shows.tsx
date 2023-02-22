import { motion } from "framer-motion";
import Head from "next/head";
import { useState } from "react";
import { toast } from "react-hot-toast";
import type { NextPageWithLayout } from "./_app";

// external imports
import Modal from "@/components/Modal";
import DefaultLayout from "@/layouts/DefaultLayout";
import ErrorScreen from "@/screens/ErrorScreen";
import LoadingScreen from "@/screens/LoadingScreen";
import { api } from "@/utils/api";
import { containerReveal, itemFadeDown } from "@/utils/constants";
import type { SavedShow } from "@prisma/client";

const TopShows: NextPageWithLayout = () => {
  // shows query
  const showsQuery = api.shows.getPaginated.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.nextCursor) {
          return {
            after: lastPage.nextCursor,
          };
        }
        return undefined;
      },
    }
  );

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
      <main className="container mx-auto mt-24 mb-14 grid w-full max-w-5xl place-items-center gap-5 px-4">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-black sm:text-4xl">
          Top Shows
        </h1>
        <motion.div
          className="grid max-w-3xl gap-2"
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
    <motion.div variants={itemFadeDown}>
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
        className="flex cursor-pointer flex-col gap-2 rounded-md bg-white p-4 shadow-md ring-1 ring-gray-200 transition-colors hover:bg-gray-100 active:bg-gray-50"
        onClick={() => {
          if (!show.name || !show.mediaType) return;
          findShowMutation.mutate({
            query: show.name,
            mediaType: show.mediaType,
          });
          setIsOpen(true);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex-1 text-base font-medium text-gray-900 sm:text-lg">
            {show.name}
          </h3>
          <span className="text-xs text-gray-700 sm:text-sm">
            {show.mediaType === "tv" ? "TV Show" : "Movie"}
          </span>
        </div>
        <p className="text-xs text-gray-700 line-clamp-2 sm:text-sm">
          {show.description}
        </p>
        <div className="mt-4 flex items-center">
          <span className="text-sm font-medium text-yellow-500">
            {show.favoriteCount}
          </span>
          <svg
            className="ml-2 h-4 w-4 fill-current text-yellow-500"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-.81-11.72a1 1 0 0 0 1.62 1.16l2.93-2.36a1 1 0 0 0-1.23-1.58l-2.12 1.71-1.04-.87z"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
