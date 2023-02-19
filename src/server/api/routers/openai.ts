import { env } from "@/env.mjs";
import type { Show } from "@/types/globals";
import { configuration } from "@/utils/openai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const openaiRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        show: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!configuration.apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "OpenAI API key not configured, please follow instructions in README.md",
        });
      }

      const prompt = `I have watched ${input.show} show and I liked it. Suggest me 5 shows of the same genre and vibe. 
      Make sure not to suggest ${input.show} show again. 
      You can use the following template: 1. Show type: TMDB movie_id. 
      For example: 1. TV: 66732.  If ${input.show} is a tv show, then use TV instead of Movie.`;

      if (!prompt) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }

      const completion = await ctx.openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 250,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false,
        n: 1,
      });
      if (!completion.data.choices) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }
      if (!completion.data.choices[0]?.text) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }

      const formattedData = completion.data.choices[0].text
        .split("\n")
        .filter((movie) => movie !== "")
        .map((movie) => {
          const [mediaType, id] = movie.split(": ");
          return {
            mediaType: mediaType?.replace(/[0-9]+. /, "").toLowerCase(),
            id: id ? parseInt(id) : id,
          };
        });

      if (!formattedData) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }

      const shows = formattedData.map(async (show) => {
        if (!show.mediaType || !show.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An error occurred during your request.",
          });
        }
        const fetchedShow = (await fetch(
          `https://api.themoviedb.org/3/${show.mediaType}/${show.id}?api_key=${env.TMDB_API_KEY}&language=en-US`
        ).then((res) => res.json())) as Show;
        if (!show) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Movie not found.",
          });
        }
        return fetchedShow;
      });
      return Promise.all(shows);
    }),
});
