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
import type { Show } from "@/types/globals";
import {
  CheckCircle,
  Pause,
  Play,
  Plus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { extractYear } from "@/utils/format";

type ModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  show: Show;
};

const Modal = ({ isOpen, setIsOpen, show }: ModalProps) => {
  const [trailerId, setTrailerId] = useState<string>("");
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
                    <X aria-hidden="true" className="h-4 w-4 text-white" />
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
                        className="flex items-center gap-1 rounded-sm bg-gray-200 px-2.5 py-1 text-sm text-black transition-colors hover:bg-white active:bg-gray-200 sm:text-base"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Fragment>
                            <Pause
                              aria-hidden="true"
                              className="aspect-square w-5"
                            />
                            <p>Pause</p>
                          </Fragment>
                        ) : (
                          <Fragment>
                            <Play
                              aria-hidden="true"
                              className="aspect-square w-5"
                            />
                            <p>Play</p>
                          </Fragment>
                        )}
                      </button>
                      <button
                        aria-label="remove from my list"
                        className="grid aspect-square w-7 place-items-center rounded-full bg-gray-700 bg-gray-900/80 ring-2 ring-white transition-colors hover:ring-indigo-400 active:opacity-100"
                        onClick={() => {
                          toast.success("Added to favourites", {
                            icon: (
                              <CheckCircle className="aspect-square w-5 text-green-600" />
                            ),
                          });
                        }}
                      >
                        <Plus
                          aria-hidden="true"
                          className="aspect-square w-5 text-white"
                        />
                      </button>
                      <button
                        aria-label="toggle audio"
                        className="grid aspect-square w-7 place-items-center rounded-full bg-gray-700 ring-1 ring-white transition-opacity hover:opacity-90 active:opacity-100"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? (
                          <VolumeX
                            aria-hidden="true"
                            className="aspect-square w-4 text-white"
                          />
                        ) : (
                          <Volume2
                            aria-hidden="true"
                            className="aspect-square w-4 text-white"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mx-6 my-4 grid gap-2">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-medium leading-6 text-gray-900 sm:text-lg"
                  >
                    {show.title ?? show.original_title ?? show.name}
                  </Dialog.Title>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
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
                          {extractYear(
                            show.release_date ?? show.first_air_date
                          )}
                        </span>
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
                  <div className="text-xs sm:text-sm">
                    <span className="font-medium text-gray-900">Watch on:</span>{" "}
                    <a
                      href={show.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {show.homepage ?? "-"}
                    </a>
                  </div>
                  <p className="text-xs line-clamp-3 sm:text-sm">
                    {show.overview ?? "-"}
                  </p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-medium text-gray-900">Genres:</span>
                    {show.genres.map((genre) => genre.name).join(", ")}
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
