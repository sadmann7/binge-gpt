import { openaiRouter } from "./routers/openai";
import { showsRouter } from "./routers/shows";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  openai: openaiRouter,
  shows: showsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
