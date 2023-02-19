import Head from "next/head";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import type { NextPageWithLayout } from "./_app";

// external imports
import DefaultLayout from "@/layouts/DefaultLayout";
import { api } from "@/utils/api";
import { z } from "zod";
import Button from "@/components/Button";

const screen = z.object({
  show: z.string().min(1),
});
type Inputs = z.infer<typeof screen>;

const Home: NextPageWithLayout = () => {
  // generate show mutation
  const generateShowMutation = api.openai.generate.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // show query
  const showQuery = api.shows.getOne.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // react-hook-form
  const { register, handleSubmit, formState } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await generateShowMutation.mutateAsync({
      show: data.show,
    });
    await showQuery.mutateAsync(66732);
  };

  return (
    <>
      <Head>
        <title>WatchCopilot</title>
      </Head>
      <main className="container mx-auto mt-24 mb-14 flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4">
        <h1>WatchCopilot</h1>
        <form
          aria-label="generate show from"
          className="grid w-full gap-5"
          onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        >
          <fieldset className="grid gap-3">
            <label htmlFor="show" className="text-base text-black">
              <span className="rounded-full text-gray-500">1.</span> Copy your
              current bio (or write a few sentences about yourself)
            </label>
            <input
              type="text"
              id="show"
              className="w-full rounded-md border-gray-500 bg-transparent px-4 py-2.5 text-base text-black transition-colors placeholder:text-gray-400"
              placeholder="e.g. Junor web developer, posting about web development, tech, and more."
              {...register("show")}
            />
          </fieldset>
          <Button
            aria-label="generate show"
            className="w-full"
            isLoading={formState.isSubmitting}
            disabled={formState.isSubmitting}
          >
            Generate Show
          </Button>
        </form>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
