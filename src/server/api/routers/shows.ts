import { env } from "@/env.mjs";
import type { Show, Shows } from "@/types/globals";
import { MEDIA_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const showsRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.number(),
          mediaType: z.nativeEnum(MEDIA_TYPE),
        })
      )
    )
    .mutation(async ({ input }) => {
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

  getOne: publicProcedure
    .input(
      z.object({
        id: z.number(),
        mediaType: z.nativeEnum(MEDIA_TYPE),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `https://api.themoviedb.org/3/${input.mediaType}/${input.id}?api_key=${env.TMDB_API_KEY}&append_to_response=videos`
      );
      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `TMDB returned ${response.status} ${response.statusText}`,
        });
      }
      const show = (await response.json()) as Show;
      return show;
    }),

  findOne: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        mediaType: z.nativeEnum(MEDIA_TYPE),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${
          env.TMDB_API_KEY
        }&query=${encodeURIComponent(input.query)}`
      );
      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `TMDB returned ${response.status} ${response.statusText}`,
        });
      }
      const shows = (await response.json()) as Shows;
      const anotherResponse = await fetch(
        `https://api.themoviedb.org/3/${input.mediaType}/${
          shows.results[0]?.id ?? 66732
        }?api_key=${env.TMDB_API_KEY}&append_to_response=videos`
      );
      if (!anotherResponse.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `TMDB returned ${anotherResponse.status} ${anotherResponse.statusText}`,
        });
      }
      const showWithVideos = (await anotherResponse.json()) as Show;
      return showWithVideos;
    }),

  update: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        name: z.string(),
        description: z.string(),
        favoriteCount: z.number(),
        mediaType: z.nativeEnum(MEDIA_TYPE),
        trailerId: z.string(),
        genres: z.array(z.string()),
        releaseDate: z.string(),
        voteAverage: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const show = await ctx.prisma.savedShow.upsert({
        where: {
          tmdbId: input.tmdbId,
        },
        update: {
          favoriteCount: {
            increment: input.favoriteCount,
          },
        },
        create: {
          tmdbId: input.tmdbId,
          name: input.name,
          description: input.description,
          mediaType: input.mediaType,
          favoriteCount: input.favoriteCount,
          trailerId: input.trailerId,
          genres: input.genres,
          releaseDate: input.releaseDate,
          voteAverage: input.voteAverage,
        },
      });
      if (!show) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not save show",
        });
      }
      if (show.favoriteCount <= 0) {
        await ctx.prisma.savedShow.delete({
          where: {
            tmdbId: input.tmdbId,
          },
        });
      }

      return show;
    }),
});
