import { configuration } from "@/utils/openai";
import type { MEDIA_TYPE } from "@prisma/client";
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

      const prompt = `I have watched ${input.show}. Suggest me 5 popular shows of the same genre or mood that I might like. 
      Make sure to add a small description, and type (tv or movie). You can use the following template: 1. Name - Description - Type.
      `;

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
      if (!completion.data.choices[0]?.text) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during your request.",
        });
      }

      const formattedData = completion.data.choices[0].text
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

      const genCount = await ctx.prisma.genCount.findFirst();
      if (!genCount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Generation count not found.",
        });
      }
      await ctx.prisma.genCount.update({
        where: {
          id: genCount.id,
        },
        data: {
          count: genCount.count + formattedData.length,
        },
      });

      return {
        formattedData,
        generations: genCount.count + formattedData.length,
      };
    }),
});
