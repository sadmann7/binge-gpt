import { containerReveal, itemFadeDown } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MEDIA_TYPE } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import Balancer from "react-wrap-balancer";
import { z } from "zod";
import type { NextPageWithLayout } from "./_app";

// external imports
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import DefaultLayout from "@/layouts/DefaultLayout";
import type { GeneratedShow } from "@/types/globals";
import { api } from "@/utils/api";

const schema = z.object({
  show: z.string().min(1, { message: "Please enter a show" }),
});
type Inputs = z.infer<typeof schema>;

const Home: NextPageWithLayout = () => {
  const generateAIShowMutation = api.openai.generateAI.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // react-hook-form
  const { register, handleSubmit, formState } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    // console.log(data);
    await generateAIShowMutation.mutateAsync({ ...data });
  };

  // scroll to recommended shows
  const generatedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!generatedRef.current || !generateAIShowMutation.data) return;
    const offset = generatedRef.current.offsetTop - 90;
    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }, [generateAIShowMutation.data]);

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
        <title>WatchCopilot</title>
      </Head>
      <motion.main
        className="container mx-auto mt-28 mb-10 grid w-full max-w-5xl justify-items-center px-4"
        initial="hidden"
        whileInView="visible"
        animate="visible"
        viewport={{ once: true }}
        variants={containerReveal}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          variants={itemFadeDown}
        >
          <h1 className="mx-auto text-center text-4xl font-bold text-gray-900 sm:text-6xl">
            <Balancer ratio={0.5}>
              Discover your next binge-worthy show
            </Balancer>
          </h1>
          <p className="w-full max-w-3xl text-center text-base text-gray-700 sm:text-lg">
            Endless scrolling for something to watch? Input your favorite show
            for AI-generated show recommendations
          </p>
        </motion.div>
        <motion.form
          aria-label="generate show from"
          className="mt-8 grid w-full max-w-3xl gap-5"
          variants={itemFadeDown}
          onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        >
          <fieldset className="grid gap-3">
            <label htmlFor="show" className="text-base font-medium text-black">
              What show have you already watched?
            </label>
            <input
              type="text"
              id="show"
              className="w-full rounded-md border-gray-500 bg-transparent px-4 py-2.5 text-base text-black transition-colors placeholder:text-gray-500"
              placeholder="e.g. Stranger Things"
              {...register("show")}
            />
            {formState.errors.show ? (
              <p className="-mt-1 text-sm font-medium text-red-500">
                {formState.errors.show.message}
              </p>
            ) : null}
          </fieldset>
          <Button
            aria-label="discover your shows"
            variant="primary"
            className="w-full"
            isLoading={generateAIShowMutation.isLoading}
            loadingVariant="dots"
            disabled={generateAIShowMutation.isLoading}
          >
            Discover your shows
          </Button>
        </motion.form>
        <motion.div
          className="mt-12 w-full max-w-3xl"
          ref={generatedRef}
          variants={itemFadeDown}
        >
          {generateAIShowMutation.isError ? (
            <p className="text-red-500">
              {generateAIShowMutation.error?.message}
            </p>
          ) : generateAIShowMutation.isSuccess ? (
            <div className="grid place-items-center gap-8">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Recommended shows
              </h2>
              <motion.div
                className="grid w-full gap-3"
                ref={ref}
                variants={containerReveal}
              >
                {generateAIShowMutation.data.map((show) => (
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
    <motion.div className="rounded-md bg-blue-900/20" variants={itemFadeDown}>
      {findShowMutation.isSuccess ? (
        <Modal
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
        className="flex cursor-pointer flex-col gap-2 rounded-md bg-white/90 p-4 shadow-md ring-1 ring-gray-200 transition-colors hover:bg-gray-100 active:bg-gray-50"
        onClick={() => {
          if (!show.name || !show.mediaType) return;
          findShowMutation.mutate({
            query: show.name,
            mediaType: show.mediaType,
          });
          setIsOpen(true);
        }}
      >
        <div className="flex justify-between gap-2">
          <h3 className="flex-1 text-base font-medium text-gray-900 sm:text-lg">
            {show.name}
          </h3>
          <span className="text-xs text-gray-700 sm:text-sm">
            {show.mediaType === "tv" ? "TV show" : "Movie"}
          </span>
        </div>
        <p className="text-xs text-gray-700 line-clamp-2 sm:text-sm">
          {show.description}
        </p>
      </div>
    </motion.div>
  );
};
