import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import type { NextPageWithLayout } from "./_app";

// external imports
import Button from "@/components/Button";
import DefaultLayout from "@/layouts/DefaultLayout";
import { api } from "@/utils/api";
import { z } from "zod";

const schema = z.object({
  show: z.string().min(1, { message: "Please enter a show" }),
});
type Inputs = z.infer<typeof schema>;

const Home: NextPageWithLayout = () => {
  // generate show mutation
  const generatedMovieMuation = api.openai.generate.useMutation({
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
    await generatedMovieMuation.mutateAsync({ ...data });
  };

  return (
    <>
      <Head>
        <title>WatchCopilot</title>
      </Head>
      <main className="container mx-auto mt-24 mb-14 flex w-full max-w-5xl flex-col gap-10 px-4">
        <div>
          <h1 className="text-4xl font-bold text-black">
            Discover Your Next Binge-Worthy Show
          </h1>
          <p className="text-base text-black">
            WatchCopilot is a tool that helps you discover your next
            binge-worthy show.
          </p>
        </div>
        <form
          aria-label="generate show from"
          className="grid w-full gap-5"
          onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
        >
          <fieldset className="grid gap-3">
            <label htmlFor="show" className="text-base text-black">
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
            isLoading={generatedMovieMuation.isLoading}
            disabled={generatedMovieMuation.isLoading}
          >
            Discover your shows
          </Button>
        </form>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
