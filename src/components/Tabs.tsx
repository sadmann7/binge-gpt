import { Tab } from "@headlessui/react";
import { MEDIA_TYPE, type SavedShow } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

// external imports
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { containerReveal, itemFadeDown } from "@/utils/constants";
import { extractYear } from "@/utils/format";
import Modal from "./Modal";

type TabsProps = {
  data: RouterOutputs["shows"]["getPaginated"][];
  mediaType: MEDIA_TYPE | null;
  setMediaType: Dispatch<SetStateAction<MEDIA_TYPE | null>>;
};

const Tabs = ({ data, mediaType, setMediaType }: TabsProps) => {
  // configure tabs
  const [selectedIndex, setSelectedIndex] = useState(0);

  useMemo(() => {
    if (mediaType === MEDIA_TYPE.tv) {
      setSelectedIndex(1);
    } else if (mediaType === MEDIA_TYPE.movie) {
      setSelectedIndex(2);
    } else {
      setSelectedIndex(0);
    }
  }, [mediaType]);

  const tabs = [
    {
      name: "All",
      onClick: () => {
        setMediaType(null);
        setSelectedIndex(0);
      },
      content: <Shows data={data} />,
    },
    {
      name: "TV shows",
      onClick: () => {
        setMediaType("tv");
        setSelectedIndex(1);
      },
      content: <Shows data={data} />,
    },
    {
      name: "Movies",
      onClick: () => {
        setMediaType("movie");
        setSelectedIndex(2);
      },
      content: <Shows data={data} />,
    },
  ];

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <Tab.List className="mx-auto flex w-full gap-2 overflow-x-auto whitespace-nowrap rounded-xl bg-blue-900/20 p-1 sm:max-w-sm">
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            onClick={tab.onClick}
            className={twMerge(
              "w-full rounded-lg py-2.5 px-3.5 text-sm font-medium leading-5",
              "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
              "ui-selected:bg-indigo-600 ui-selected:text-white ui-selected:shadow",
              "text-gray-700 hover:bg-white/40 hover:text-black"
            )}
          >
            {tab.name}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((tab) => (
          <Tab.Panel key={tab.name}>{tab.content}</Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs;

// Shows component
const Shows = ({
  data,
}: {
  data: RouterOutputs["shows"]["getPaginated"][];
}) => {
  return (
    <motion.div
      className="grid w-full grid-cols-1 gap-5 xxs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      initial="hidden"
      animate="visible"
      variants={containerReveal}
    >
      {data[0]?.savedShows.length ? (
        data.map((page) =>
          page.savedShows.map((show) => (
            <SavedShowCard key={show.id} show={show} />
          ))
        )
      ) : (
        <div className="col-span-full mx-auto text-base text-gray-900 sm:text-lg">
          No shows saved yet
        </div>
      )}
    </motion.div>
  );
};

// SavedShowCard component
const SavedShowCard = ({ show }: { show: SavedShow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // find show mutation
  const findShowMutation = api.shows.getOne.useMutation({
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
      className="rounded-md bg-blue-900/20"
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
        className="grid cursor-pointer gap-2 overflow-hidden rounded-md bg-white/90 shadow-md ring-1 ring-gray-200"
        onClick={() => {
          if (!show.name || !show.mediaType) return;
          findShowMutation.mutate({
            query: show.name,
            mediaType: show.mediaType,
          });
          setIsOpen(true);
        }}
      >
        <div className="relative">
          <Image
            src={
              show.image
                ? `https://image.tmdb.org/t/p/w220_and_h330_face/${show.image}`
                : "/images/placeholder.webp"
            }
            alt={show.name}
            width={220}
            height={330}
            className="h-60 w-full object-cover"
            priority
          />
          <div className="absolute -bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-black/80 text-xs font-medium text-white ring-2 ring-gray-200 sm:text-sm">
            {show.favoriteCount}
          </div>
        </div>
        <div className="mx-4 mb-3">
          <h3 className="flex-1 text-sm font-semibold text-gray-900 line-clamp-1 sm:text-base">
            {show.name}
          </h3>
          <p className="text-xs text-gray-600 sm:text-sm">
            {show.mediaType === "tv" ? "TV show" : "Movie"}
          </p>
          <p className="text-xs text-gray-600 sm:text-sm">
            {extractYear(show.releaseDate ?? "") || "-"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
