import { env } from "@/env.mjs";
import type { Show } from "@/types/globals";
import { MEDIA_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const showsRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          mediaType: z.nativeEnum(MEDIA_TYPE),
        })
      )
    )
    .query(async ({ input }) => {
      const shows = await Promise.all(
        input.map(async ({ id, mediaType }) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${env.TMDB_API_KEY}`
          );
          if (!response.ok) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `TMDB returned ${response.status} ${response.statusText}`,
            });
          }
          const show = (await response.json()) as Show;
          return show;
        })
      );
      return shows;
    }),
});
