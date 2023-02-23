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
      const mostPopularShow = shows.results.sort(
        (a, b) => b.popularity - a.popularity
      )[0];
      const anotherResponse = await fetch(
        `https://api.themoviedb.org/3/${input.mediaType}/${
          mostPopularShow?.id ?? 66732
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

  getPaginated: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
        mediaType: z.nativeEnum(MEDIA_TYPE).optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const savedShows = await ctx.prisma.savedShow.findMany({
        take: input.limit + 1,
        where: {
          mediaType: input.mediaType ? { equals: input.mediaType } : undefined,
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          favoriteCount: "desc",
        },
      });
      let nextCursor: typeof input.cursor | undefined = undefined;
      if (savedShows.length > input.limit) {
        const nextItem = savedShows.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextItem!.id;
      }
      return {
        savedShows,
        nextCursor,
      };
    }),

  update: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        name: z.string(),
        description: z.string(),
        image: z.string(),
        favoriteCount: z.number().min(0),
        mediaType: z.nativeEnum(MEDIA_TYPE),
        trailerId: z.string(),
        genres: z.array(z.string()),
        releaseDate: z.string(),
        voteAverage: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const savedShow = await ctx.prisma.savedShow.upsert({
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
          image: input.image,
          mediaType: input.mediaType,
          favoriteCount: input.favoriteCount,
          trailerId: input.trailerId,
          genres: input.genres,
          releaseDate: input.releaseDate,
          voteAverage: input.voteAverage,
        },
      });
      if (!savedShow) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not save show",
        });
      }
      if (savedShow.favoriteCount <= 0) {
        await ctx.prisma.savedShow.delete({
          where: {
            tmdbId: input.tmdbId,
          },
        });
      }

      return savedShow;
    }),
});
