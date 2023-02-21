import { containerReveal, itemFadeDown } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MEDIA_TYPE } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { toast } from "react-toastify";
import Balancer from "react-wrap-balancer";
import { z } from "zod";
import type { NextPageWithLayout } from "./_app";

// external imports
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import DefaultLayout from "@/layouts/DefaultLayout";
import type { GeneratedShow } from "@/types/globals";
import { api } from "@/utils/api";

const shows: GeneratedShow[] = [
  {
    name: "Stranger Things",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    mediaType: "tv",
  },
  {
    name: "The Witcher",
    description:
      "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    mediaType: "tv",
  },
  {
    name: "The Umbrella Academy",
    description:
      "A dysfunctional family of superheroes comes together to solve the mystery of their father's death, the threat of the apocalypse and more.",

    mediaType: "tv",
  },
  {
    name: "Dark",
    description:
      "A missing child causes four families to help each other for answers. What they could not imagine is that this mystery would be connected to innumerable other secrets of the small town.",
    mediaType: "tv",
  },
  {
    name: "The Last of Us",
    description:
      "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the United States and depend on each other for survival.",
    mediaType: "tv",
  },
];

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
    const offset = generatedRef.current.offsetTop - 100;
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
        className="container mx-auto mt-28 mb-14 flex w-full max-w-3xl flex-col gap-16 px-4"
        initial="hidden"
        whileInView="visible"
        animate="visible"
        viewport={{ once: true }}
        variants={containerReveal}
      >
        <motion.div className="flex flex-col gap-5" variants={itemFadeDown}>
          <h1 className="text-center text-3xl font-bold text-gray-900 sm:text-5xl">
            <Balancer ratio={0.5}>
              Discover Your Next Binge-Worthy Show
            </Balancer>
          </h1>
          <p className="text-center text-base text-gray-700">
            Tired of searching for your next binge-worthy show? Let our advanced
            AI recommendation system do the work for you. Simply tell us your
            favorite show, and {`we'll`} analyze your viewing habits to suggest
            the perfect options just for you.
          </p>
        </motion.div>
        <motion.form
          aria-label="generate show from"
          className="grid w-full gap-5"
          variants={itemFadeDown}
          onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        >
          <fieldset className="grid gap-3">
            <label htmlFor="show" className="text-base font-medium text-black">
              What show have you recently watched?
            </label>
            <input
              type="text"
              id="show"
              className="w-full rounded-md border-gray-500 bg-transparent px-4 py-2.5 text-base text-black transition-colors placeholder:text-gray-400"
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
            aria-label="discover your showsw"
            className="w-full"
            isLoading={generateAIShowMutation.isLoading}
            disabled={generateAIShowMutation.isLoading}
          >
            Discover your shows
          </Button>
        </motion.form>
        <motion.div ref={generatedRef} variants={itemFadeDown}>
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
                className="grid gap-3"
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
        {/* <motion.div
          className="grid place-items-center gap-6"
          ref={generatedRef}
          variants={itemFadeDown}
        >
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Recommended shows
          </h2>
          <div className="grid gap-3" ref={ref}>
            {shows
              ? shows.map((show) => <ShowCard key={show.name} show={show} />)
              : null}
          </div>
        </motion.div> */}
      </motion.main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

const ShowCard = ({ show }: { show: GeneratedShow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

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
          mediaType={show.mediaType as MEDIA_TYPE}
          show={findShowMutation.data}
          isAdded={isAdded}
          setIsAdded={setIsAdded}
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
        <h2 className="text-lg font-medium text-gray-900">{show.name}</h2>
        <p className="text-sm text-gray-700 line-clamp-2">{show.description}</p>
      </div>
    </motion.div>
  );
};
