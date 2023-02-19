import { env } from "@/env.mjs";
import type { Show } from "@/types/globals";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const showsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.array(z.number().min(1)))
    .mutation(async ({ input }) => {
      const movies = input.map(async (id) => {
        const movie = (await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${env.TMDB_API_KEY}&language=en-US`
        ).then((res) => res.json())) as Show;
        if (!movie) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Movie not found.",
          });
        }
        return movie;
      });
      return Promise.all(movies);
    }),

  getOne: publicProcedure
    .input(z.number().min(1))
    .mutation(async ({ input }) => {
      const show = (await fetch(
        `https://api.themoviedb.org/3/tv/${input}?api_key=${env.TMDB_API_KEY}&language=en-US`
      ).then((res) => res.json())) as Show;
      if (!show) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Movie not found.",
        });
      }
      return show;
    }),
});
