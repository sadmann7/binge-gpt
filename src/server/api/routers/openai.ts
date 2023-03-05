import { FORM_MEDIA_TYPE } from "@/types/globals";
import { configuration } from "@/utils/openai";
import type { MEDIA_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const openaiRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        shows: z.string().min(1),
        mediaType: z.nativeEnum(FORM_MEDIA_TYPE),
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
      const prompt = `Recommend me 5 popular ${
        input.mediaType === FORM_MEDIA_TYPE.TV
          ? "TV shows only"
          : input.mediaType === FORM_MEDIA_TYPE.MOVIE
          ? "movies only"
          : "TV shows and movies"
      } of the same genre or mood as ${
        input.shows.split(",").length > 1
          ? input.shows
              .split(",")
              .map((show, index) => `${index + 1}. ${show.trim()}`)
              .join(", ")
          : input.shows
      } that I might like. 
      Make sure to recommend only ${input.mediaType} type shows.
      Make sure to include the name, short description (between 1-2 sentences), and type of media (tv or movie) for each show.
      """ 
      You can use the following template: 1. Name - Description - Type of media
      For example: 1. The Office - A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium. - TV
      """`;

      if (!prompt) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }

      const completion = await ctx.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
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
      if (!completion.data.choices[0]?.message?.content) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }

      const formattedData = completion.data.choices[0].message?.content
        .split("\n")
        .filter((show) => show !== "")
        .map((show) => {
          const [name, description, mediaType] = show.split("- ");
          return {
            name: name?.replace(/[0-9]+. /, "").trim(),
            description: description?.trim(),
            mediaType: mediaType?.toLowerCase().trim() as MEDIA_TYPE,
          };
        });

      return {
        formattedData,
      };
    }),
});
