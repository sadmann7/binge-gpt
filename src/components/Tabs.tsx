import { api } from "@/utils/api";
import { Tab } from "@headlessui/react";
import type { MEDIA_TYPE, SavedShow } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

// external imports
import type { RouterOutputs } from "@/utils/api";
import { containerReveal, itemFadeDown } from "@/utils/constants";
import { extractYear } from "@/utils/format";
import Modal from "./Modal";

type TabsProps = {
  data: RouterOutputs["shows"]["getPaginated"][];
  setMediaType: Dispatch<SetStateAction<MEDIA_TYPE | undefined>>;
};

const Tabs = ({ data, setMediaType }: TabsProps) => {
  const tabs = [
    { name: "All", onClick: () => setMediaType(undefined) },
    { name: "TV Shows", onClick: () => setMediaType("tv") },
    { name: "Movies", onClick: () => setMediaType("movie") },
  ];

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            onClick={() => tab.onClick()}
            className={({ selected }) =>
              twMerge(
                "flex-1 cursor-pointer rounded-xl py-2.5 text-center text-sm font-medium",
                selected
                  ? "bg-blue-900 text-white"
                  : "text-gray-500 hover:bg-blue-900 hover:bg-opacity-10"
              )
            }
          >
            {tab.name}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {Array.from({ length: 3 }).map((_, i) => (
          <Tab.Panel key={i}>
            <motion.div
              className="grid w-full grid-cols-1 gap-5 xxs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              initial="hidden"
              animate="visible"
              variants={containerReveal}
            >
              {data.map((page) =>
                page.savedShows.map((show) => (
                  <SavedShowCard key={show.id} show={show} />
                ))
              )}
            </motion.div>
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;

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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      variants={itemFadeDown}
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
        <div className="mx-4 mt-1 mb-5">
          <h3 className="flex-1 text-sm font-semibold text-gray-900 line-clamp-1 sm:text-base">
            {show.name}
          </h3>
          <p className="text-xs text-gray-600 sm:text-sm">
            {show.mediaType === "tv" ? "TV Show" : "Movie"}
          </p>
          <p className="text-xs text-gray-600 sm:text-sm">
            {extractYear(show.releaseDate ?? "")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
