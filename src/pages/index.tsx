import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import Balancer from "react-wrap-balancer";
import { z } from "zod";
import type { NextPageWithLayout } from "./_app";

// external imports
import Button from "@/components/Button";
import DefaultLayout from "@/layouts/DefaultLayout";
import type { Show } from "@/types/globals";
import { api } from "@/utils/api";

const schema = z.object({
  show: z.string().min(1, { message: "Please enter a show" }),
});
type Inputs = z.infer<typeof schema>;

const Home: NextPageWithLayout = () => {
  // generate show mutation
  const generatedShowMutation = api.openai.generate.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // generateAI show mutation
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
    await generatedShowMutation.mutateAsync({ ...data });
    await generateAIShowMutation.mutateAsync({ ...data });
  };

  return (
    <>
      <Head>
        <title>WatchCopilot</title>
      </Head>
      <main className="container mx-auto mt-24 mb-14 flex w-full max-w-5xl flex-col gap-10 px-4">
        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-5xl">
            <Balancer ratio={0.5}>
              Discover Your Next Binge-Worthy Show
            </Balancer>
          </h1>
          <p className="text-base text-gray-700">
            Tired of searching for your next binge-worthy show? Let our advanced
            AI recommendation system do the work for you. Simply tell us your
            favorite show, and {`we'll`} analyze your viewing habits to suggest
            the perfect options just for you.
          </p>
        </div>
        <form
          aria-label="generate show from"
          className="grid w-full gap-5"
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
            isLoading={generatedShowMutation.isLoading}
            disabled={generatedShowMutation.isLoading}
          >
            Discover your shows
          </Button>
        </form>
        <div>
          {generatedShowMutation.isError ? (
            <p className="text-red-500">
              {generatedShowMutation.error?.message}
            </p>
          ) : generatedShowMutation.isSuccess ? (
            <div className="grid gap-2">
              {generatedShowMutation.data.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;

const ShowCard = ({ show }: { show: Show }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-medium text-gray-900">
        {show.name ?? show.title ?? show.original_title}
      </h2>
      <p className="text-sm text-gray-700 line-clamp-2">{show.overview}</p>
    </div>
  );
};
