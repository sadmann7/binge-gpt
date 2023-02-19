import { env } from "@/env.mjs";
import type { Movie } from "@/types/globals";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const showsRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(z.number().min(1))
    .mutation(async ({ input }) => {
      const show = (await fetch(
        `https://api.themoviedb.org/3/tv/${input}?api_key=${env.TMDB_API_KEY}&language=en-US`
      ).then((res) => res.json())) as Movie;
      if (!show) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Show not found.",
        });
      }
      return show;
    }),
});
