import { env } from "@/env.mjs";
import type { Show, Shows } from "@/types/globals";
import { MEDIA_TYPE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const showsRouter = createTRPCRouter({
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
      const mostVotedShow = shows.results.sort(
        (a, b) => b.vote_count - a.vote_count
      )[0];
      const anotherResponse = await fetch(
        `https://api.themoviedb.org/3/${input.mediaType}/${
          mostVotedShow?.id ?? 66732
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
      const shows = await ctx.prisma.favoritedShow.findMany({
        take: input.limit + 1,
        where: {
          mediaType: input.mediaType ?? undefined,
        },
        distinct: ["id"],
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          favoriteCount: "desc",
        },
      });
      let nextCursor: typeof input.cursor | undefined = undefined;
      if (shows.length > input.limit) {
        const nextItem = shows.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextItem!.id;
      }
      return {
        shows,
        nextCursor,
      };
    }),

  getOne: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const show = await ctx.prisma.favoritedShow.findUnique({
      where: {
        tmdbId: input,
      },
    });
    if (!show) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not find show",
      });
    }
    return show;
  }),

  update: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        name: z.string(),
        description: z.string(),
        image: z.string(),
        favoriteCount: z.number(),
        mediaType: z.nativeEnum(MEDIA_TYPE),
        trailerId: z.string(),
        genres: z.array(z.string()),
        firstAired: z.string(),
        lastAired: z.string(),
        voteAverage: z.number().min(0),
        voteCount: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const show = await ctx.prisma.favoritedShow.upsert({
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
          firstAired: input.firstAired,
          lastAired: input.lastAired,
          voteAverage: input.voteAverage,
          voteCount: input.voteCount,
        },
      });
      if (!show) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not save show",
        });
      }
      if (show.favoriteCount <= 0) {
        await ctx.prisma.favoritedShow.delete({
          where: {
            tmdbId: input.tmdbId,
          },
        });
      }

      return show;
    }),
});
