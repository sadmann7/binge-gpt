import { Dialog, Transition } from "@headlessui/react";
import {
  Fragment,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import ReactPlayer from "react-player/lazy";
import { toast } from "react-toastify";

// external imports
import type { Genre, Show } from "@/types/globals";
import { Pause, Play, Plus, ThumbsUp, X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  show: Show;
};

const Modal = ({ isOpen, setIsOpen, show }: ModalProps) => {
  const [trailerId, setTrailerId] = useState<string>("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!show) return;

    if (show.videos) {
      const trailerIndex = show.videos.results.findIndex(
        (item) => item.type === "Trailer"
      );
      setTrailerId(show.videos.results[trailerIndex]?.key ?? "");
    }

    if (show.genres) {
      setGenres(show.genres);
    }
  }, [show]);

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
          <div className="fixed inset-0 bg-black/75" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all">
                <div className="relative aspect-video">
                  <button
                    type="button"
                    aria-label="close modal"
                    className="absolute top-4 right-4 z-50 flex items-center rounded-full bg-gray-600 p-1 transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:opacity-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <X
                      aria-hidden="true"
                      className="aspect-square w-4 text-white"
                    />
                  </button>
                  <ReactPlayer
                    style={{ position: "absolute", top: 0, left: 0 }}
                    url={`https://www.youtube.com/watch?v=${trailerId}`}
                    width="100%"
                    height="100%"
                    muted={isMuted}
                    playing={isPlaying}
                  />
                  <div className="absolute bottom-6 flex w-full items-center justify-between gap-2 px-6">
                    <div className="flex items-center gap-2.5">
                      <button
                        aria-label="control video playback"
                        className="flex items-center gap-1 rounded-sm bg-white px-2.5 py-1 text-sm text-black transition-opacity hover:opacity-90 active:opacity-100 md:text-base"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <>
                            <Pause
                              aria-hidden="true"
                              className="aspect-square w-5"
                            />
                            <p>Pause</p>
                          </>
                        ) : (
                          <>
                            <Play
                              aria-hidden="true"
                              className="aspect-square w-5"
                            />
                            <p>Play</p>
                          </>
                        )}
                      </button>
                      <button
                        aria-label="remove from my list"
                        className="grid aspect-square w-7 place-items-center rounded-full bg-gray-700 ring-1 ring-white transition-opacity hover:opacity-90 active:opacity-100"
                        onClick={() => {
                          toast.success("Added to favourites");
                        }}
                      >
                        <Plus
                          aria-hidden="true"
                          className="aspect-square w-5 text-white"
                        />
                      </button>
                      <button
                        aria-label="thumb up"
                        className="grid aspect-square w-7 place-items-center rounded-full bg-gray-700 ring-1 ring-white transition-opacity hover:opacity-90 active:opacity-100"
                      >
                        <ThumbsUp
                          aria-hidden="true"
                          className="aspect-square w-4 text-white"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mx-6 my-7 grid gap-2">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {show.title ?? show.original_title ?? show.name}
                  </Dialog.Title>
                  <div className="flex items-center space-x-2 text-xs md:text-sm">
                    <p className=" text-green-600">
                      {Math.round((Number(show.vote_average) / 10) * 100) ??
                        "-"}
                      % Match
                    </p>
                    <p>{show.release_date ?? "-"}</p>
                    <p>{show.original_language.toUpperCase() ?? "-"}</p>
                  </div>
                  <p className="text-xs line-clamp-3 md:text-sm">
                    {show.overview ?? "-"}
                  </p>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <span className="text-gray-400">Genres:</span>
                    {genres.map((genre) => genre.name).join(", ")}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <span className="text-gray-400">Total Votes:</span>
                    {show.vote_count ?? "-"}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
