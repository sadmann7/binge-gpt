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

      const prompt = `Suggest 5 shows to watch for someone who likes ${input.show} show with the TMDB movie_id. Make sure not to include ${input.show} show in the suggested list. You can use the following template: 1. Show name: TMDB movie_id. 
      For example: 1. The Office: 1396. Make sure to suggest The Office (US) instead of The Office.`;

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

      const shows = completion.data.choices[0].text
        .split("\n")
        .filter((show) => show !== "")
        .map((show) => {
          const [name, id] = show.split(": ");
          return {
            name: name?.replace(/^[0-9]+\. /, ""),
            id: id ? parseInt(id) : id,
          };
        });

      return shows;
    }),
});
