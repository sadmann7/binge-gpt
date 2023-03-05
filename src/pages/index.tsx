import ShowModal from "@/components/ShowModal";
import Button from "@/components/ui/Button";
import DropdownSelect from "@/components/ui/DropdownSelect";
import DefaultLayout from "@/layouts/DefaultLayout";
import { FORM_MEDIA_TYPE, type GeneratedShow } from "@/types/globals";
import { api } from "@/utils/api";
import { containerReveal, itemFadeDown } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MEDIA_TYPE } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import Balancer from "react-wrap-balancer";
import { z } from "zod";
import type { NextPageWithLayout } from "./_app";

const schema = z.object({
  show: z.string().min(1, { message: "Please enter a show" }),
  mediaType: z.nativeEnum(FORM_MEDIA_TYPE),
});
type Inputs = z.infer<typeof schema>;

const Home: NextPageWithLayout = () => {
  const formMediaTypes = Object.values(FORM_MEDIA_TYPE).map((mediaType) => ({
    value: mediaType,
    label: mediaType,
  }));

  const generateShowMutation = api.openai.generate.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // react-hook-form
  const { register, handleSubmit, formState, control, watch } = useForm<Inputs>(
    {
      resolver: zodResolver(schema),
    }
  );
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    // console.log(data);
    await generateShowMutation.mutateAsync({ ...data });
  };

  // scroll to recommended shows
  const generatedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!generatedRef.current || !generateShowMutation.data) return;
    const offset = generatedRef.current.offsetTop - 90;
    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }, [generateShowMutation.data]);

  // framer-motion
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: "-100px",
  });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      void controls.start("visible");
    } else {
      void controls.start("hidden");
    }
    return () => controls.stop();
  }, [controls, inView]);

  return (
    <>
      <Head>
        <title>BingeGPT</title>
      </Head>
      <motion.main
        className="container mx-auto mt-32 mb-10 grid w-full max-w-2xl justify-items-center px-4"
        initial="hidden"
        whileInView="visible"
        animate="visible"
        viewport={{ once: true }}
        variants={containerReveal}
      >
        <motion.div
          className="flex flex-col items-center gap-8"
          variants={itemFadeDown}
        >
          <h1 className="mx-auto text-center text-4xl font-bold text-gray-50 sm:text-6xl">
            <Balancer ratio={0.5}>
              Discover your next binge-worthy show
            </Balancer>
          </h1>
          <p className="w-full text-center text-base text-gray-300 sm:text-lg">
            Endless scrolling for something to watch? Input your favorite show
            for AI-generated show recommendations
          </p>
        </motion.div>
        <motion.form
          aria-label="generate show from"
          className="mt-14 grid w-full max-w-xl gap-7"
          variants={itemFadeDown}
          onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        >
          <fieldset className="grid gap-5">
            <label
              htmlFor="show"
              className="flex items-center gap-3 text-sm font-medium text-white sm:text-base"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-600 text-sm text-white sm:text-base">
                {watch("show") ? (
                  <Check aria-hidden="true" className="h-5 w-5" />
                ) : (
                  1
                )}
              </span>
              What show have you already watched?
            </label>
            <input
              type="text"
              id="show"
              className="w-full rounded-md border-gray-400 bg-transparent px-4 py-2.5 text-base text-gray-50 transition-colors placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="e.g. Stranger things"
              {...register("show")}
            />
            {formState.errors.show ? (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle aria-hidden="true" className="h-4 w-4" />
                <p className="text-sm font-medium">
                  {formState.errors.show.message}
                </p>
              </div>
            ) : null}
          </fieldset>
          <fieldset className="grid gap-5">
            <label
              htmlFor="mediaType"
              className="flex items-center gap-3 text-sm font-medium text-white sm:text-base"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gray-600 text-sm text-white sm:text-base">
                {true ? <Check aria-hidden="true" className="h-5 w-5" /> : 2}
              </span>
              What type of show are you looking for?
            </label>
            <DropdownSelect<Inputs>
              control={control}
              name="mediaType"
              options={formMediaTypes}
            />

            {formState.errors.mediaType ? (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle aria-hidden="true" className="h-4 w-4" />
                <p className="text-sm font-medium">
                  {formState.errors.mediaType.message}
                </p>
              </div>
            ) : null}
          </fieldset>
          <Button
            aria-label="discover your shows"
            variant="primary"
            className="w-full"
            isLoading={generateShowMutation.isLoading}
            loadingVariant="spinner"
            disabled={generateShowMutation.isLoading}
          >
            Discover your shows
          </Button>
        </motion.form>
        <motion.div
          className="mt-16 w-full max-w-xl"
          ref={generatedRef}
          variants={itemFadeDown}
        >
          {generateShowMutation.isError ? (
            <p className="text-red-500">
              {generateShowMutation.error?.message}
            </p>
          ) : generateShowMutation.isSuccess ? (
            <div className="grid place-items-center gap-8">
              <h2 className="text-2xl font-bold text-gray-50 sm:text-3xl">
                Recommended shows
              </h2>
              <motion.div
                className="grid w-full gap-3"
                ref={ref}
                variants={containerReveal}
              >
                {generateShowMutation.data.formattedData
                  .filter((show) => !!show.name)
                  .map((show) => (
                    <ShowCard key={show.name} show={show} />
                  ))}
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      </motion.main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

const ShowCard = ({ show }: { show: GeneratedShow }) => {
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
        <ShowModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mediaType={show.mediaType as MEDIA_TYPE}
          show={findShowMutation.data}
          isLiked={isLiked}
          setIsLiked={setIsLiked}
        />
      ) : null}
      <div
        role="button"
        aria-label={`view ${show.name ?? ""} details`}
        className="grid w-full gap-2 bg-white/10 py-3.5 px-5 bg-blend-multiply shadow-md backdrop-blur-lg backdrop-filter transition-colors hover:bg-white/[0.15] active:bg-white/20"
        onClick={() => {
          if (!show.name || !show.mediaType) return;
          findShowMutation.mutate({
            query: show.name,
            mediaType: show.mediaType,
          });
          setIsOpen(true);
        }}
      >
        <div className="flex w-full items-center justify-between gap-5">
          <h3 className="text-base font-medium text-gray-50 sm:text-lg">
            {show.name ?? ""}
          </h3>
          <p className="text-sm text-gray-300">
            {show.mediaType === "tv" ? "TV show" : "Movie"}
          </p>
        </div>
        <p className="text-sm text-gray-300 sm:text-base">
          {show.description ?? ""}
        </p>
      </div>
    </motion.div>
  );
};
