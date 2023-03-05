import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { containerReveal, itemFadeDown } from "@/utils/constants";
import { Tab } from "@headlessui/react";
import { MEDIA_TYPE, type FavoritedShow } from "@prisma/client";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import ShowModal from "./ShowModal";

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
      <Tab.List className="mx-auto flex w-full space-x-1 overflow-x-auto whitespace-nowrap rounded-md bg-zinc-600 p-1 sm:max-w-sm">
        {tabs.map((tab) => (
          <Tab
            key={tab.name}
            onClick={tab.onClick}
            className={twMerge(
              "w-full rounded-md py-2 text-sm font-medium leading-5 text-white",
              "ring-white ring-opacity-60 ring-offset-1 ring-offset-violet-400 focus:outline-none focus:ring-1",
              "ui-selected:bg-slate-900/80 ui-selected:shadow",
              "ui-not-selected:text-gray-100 ui-not-selected:hover:bg-white/[0.12] ui-not-selected:hover:text-white"
            )}
          >
            {tab.name}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabs.map((tab) => (
          <Tab.Panel
            key={tab.name}
            className="ring-white ring-opacity-60 ring-offset-1 ring-offset-violet-400 focus:outline-none focus:ring-1"
          >
            {tab.content}
          </Tab.Panel>
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
      {data[0]?.shows.length ? (
        data.map((page) =>
          page.shows.map((show) => (
            <FavoritedShowCard key={show.id} show={show} />
          ))
        )
      ) : (
        <div className="col-span-full mx-auto text-base text-gray-50 sm:text-lg">
          No shows favorited yet
        </div>
      )}
    </motion.div>
  );
};

// FavoritedShowCard component
const FavoritedShowCard = ({ show }: { show: FavoritedShow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(true);

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
        <ShowModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mediaType={show.mediaType}
          show={findShowMutation.data}
          isLiked={isLiked}
          setIsLiked={setIsLiked}
          isLikeButtonDisabled={true}
        />
      ) : null}
      <div
        role="button"
        aria-label={`view ${show.name} details`}
        className="grid w-full gap-2 bg-white/10 bg-blend-multiply shadow-md ring-1 ring-gray-600 backdrop-blur-lg backdrop-filter"
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
          <div className="absolute -bottom-4 right-0 bg-gray-600/80 px-2 py-1.5 shadow-md">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 fill-current text-red-500" />
              <span className="text-sm font-medium text-white">
                {show.favoriteCount}
              </span>
            </div>
          </div>
        </div>
        <div className="mx-4 mb-3 grid gap-1">
          <h3 className="flex-1 text-sm font-semibold text-white line-clamp-1 sm:text-base">
            {show.name}
          </h3>
          <p className="text-xs text-gray-200 sm:text-sm">
            {show.mediaType === "tv" ? "TV show" : "Movie"}
          </p>
          <p className="text-xs text-gray-200 sm:text-sm">
            {dayjs(show.firstAired).format("YYYY")}
            {show.mediaType === "movie"
              ? null
              : show.mediaType === "tv" && show.lastAired
              ? ` - ${dayjs(show.lastAired).format("YYYY")}`
              : "Present"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
