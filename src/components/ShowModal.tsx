import OttIcon from "@/components/OttIcon";
import type { Show } from "@/types/globals";
import { api } from "@/utils/api";
import { Dialog, Transition } from "@headlessui/react";
import type { MEDIA_TYPE } from "@prisma/client";
import { useIsMutating } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import {
  Fragment,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "react-hot-toast";
import ReactPlayer from "react-player/lazy";
import LikeButton from "./ui/LikeButton";

type ShowModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  mediaType: MEDIA_TYPE;
  show: Show;
  isLiked: boolean;
  setIsLiked: Dispatch<SetStateAction<boolean>>;
  isLikeButtonDisabled?: boolean;
};

const ShowModal = ({
  isOpen,
  setIsOpen,
  mediaType,
  show,
  isLiked,
  setIsLiked,
  isLikeButtonDisabled = false,
}: ShowModalProps) => {
  const apiUtils = api.useContext();
  const [trailerId, setTrailerId] = useState<string>("");

  // set trailerId
  useEffect(() => {
    if (!show) return;
    if (show.videos) {
      const trailerIndex = show.videos.results.findIndex(
        (item) => item.type === "Trailer"
      );
      setTrailerId(show.videos.results[trailerIndex]?.key ?? "");
    }
  }, [show]);

  // get show query
  const getShowQuery = api.shows.getOne.useQuery(show?.id, {
    enabled: !!show?.id,
  });

  // update show mutation
  const updateShowMutation = api.shows.update.useMutation({
    onMutate: async () => {
      if (isLiked) {
        toast.error("Removed from favorites");
      } else {
        toast.success("Added to favorites");
      }
      await apiUtils.shows.getPaginated.cancel();
      apiUtils.shows.getPaginated.setInfiniteData({ limit: 10 }, (data) => {
        if (!data) {
          return {
            pages: [],
            pageParams: [],
          };
        }
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            shows: page.shows.map((show) => ({
              ...show,
              favoriteCount: isLiked ? -1 : 1,
            })),
          })),
        };
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // refetech
  const number = useIsMutating();
  useEffect(() => {
    if (number === 0) {
      void apiUtils.shows.getPaginated.invalidate();
      void apiUtils.shows.getOne.invalidate();
    }
  }, [apiUtils, number]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden bg-white/10 text-left align-middle bg-blend-multiply shadow-xl backdrop-blur-lg backdrop-filter transition-all">
                <div className="relative aspect-video">
                  {trailerId ? (
                    <ReactPlayer
                      style={{ position: "absolute", top: 0, left: 0 }}
                      url={`https://www.youtube.com/watch?v=${trailerId}`}
                      width="100%"
                      height="100%"
                      config={{
                        youtube: {
                          playerVars: {
                            autoplay: 1,
                            controls: 1,
                            disablekb: 1,
                            fs: 0,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            playsinline: 1,
                            origin: "https://www.youtube.com",
                          },
                        },
                      }}
                    />
                  ) : show.poster_path || show.backdrop_path ? (
                    <Image
                      src={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                          : `https://image.tmdb.org/t/p/w500${show.backdrop_path}`
                      }
                      alt={show.title ?? show.original_title ?? show.name}
                      width={1920}
                      height={1080}
                      className="aspect-video object-cover"
                    />
                  ) : (
                    <Image
                      src="/images/placeholder.webp"
                      alt={show.title ?? show.original_title ?? show.name}
                      width={1920}
                      height={1080}
                      className="aspect-video object-cover"
                    />
                  )}
                </div>
                <div className="mx-6 mt-4 mb-6 grid gap-3">
                  <div className="flex items-center justify-between gap-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-medium leading-6 text-white sm:text-lg"
                    >
                      {show.title ?? show.original_title ?? show.name}
                    </Dialog.Title>
                    <LikeButton
                      aria-label={
                        isLiked ? "add to favorites" : "remove from favorites"
                      }
                      isLiked={isLiked}
                      likeCount={
                        updateShowMutation.data?.favoriteCount ??
                        getShowQuery.data?.favoriteCount ??
                        0
                      }
                      onClick={() => {
                        setIsLiked(!isLiked);
                        updateShowMutation.mutate({
                          tmdbId: show.id,
                          name: show.title ?? show.original_title ?? show.name,
                          description: show.overview ?? "",
                          image: show.poster_path ?? show.backdrop_path ?? "",
                          mediaType: mediaType,
                          favoriteCount: isLiked ? -1 : 1,
                          trailerId: trailerId,
                          genres: show.genres.map((genre) => genre.name ?? ""),
                          firstAired:
                            show.release_date ?? show.first_air_date ?? "",
                          lastAired: show.last_air_date ?? "",
                          voteAverage: show.vote_average ?? 0,
                          voteCount: show.vote_count ?? 0,
                        });
                      }}
                      disabled={
                        updateShowMutation.isLoading || isLikeButtonDisabled
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-100 sm:text-sm">
                    {show.vote_average ? (
                      <Fragment>
                        <span className="font-medium text-green-600">
                          {Math.round((Number(show.vote_average) / 10) * 100)}%
                        </span>
                        <span>|</span>
                      </Fragment>
                    ) : null}
                    {show.release_date || show.first_air_date ? (
                      <Fragment>
                        <span>
                          {dayjs(
                            show.release_date ?? show.first_air_date
                          ).format("YYYY")}
                        </span>
                        {show.last_air_date ? (
                          <span>
                            - {dayjs(show.last_air_date).format("YYYY")}
                          </span>
                        ) : null}
                        <span>|</span>
                      </Fragment>
                    ) : null}
                    {show.number_of_seasons ? (
                      <Fragment>
                        <span>{show.number_of_seasons} Seasons</span>
                        <span>|</span>
                      </Fragment>
                    ) : null}
                    {show.original_language ? (
                      <span>{show.original_language.toUpperCase()}</span>
                    ) : null}
                  </div>
                  <p className="text-xs line-clamp-3 sm:text-sm">
                    {show.overview ?? "No description available."}
                  </p>
                  {show.homepage ? (
                    <a
                      href={show.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1.5 transition-opacity hover:opacity-80 active:opacity-100"
                    >
                      <OttIcon url={show.homepage} />
                      <span className="text-xs font-medium sm:text-sm">
                        Visit website
                      </span>
                    </a>
                  ) : null}
                  {show.genres ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {show.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="bg-violet-200/80 px-3 py-1 text-xs font-bold text-gray-900 bg-blend-multiply shadow-md backdrop-blur-lg backdrop-filter"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShowModal;
