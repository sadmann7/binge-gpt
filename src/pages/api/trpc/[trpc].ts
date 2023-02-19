import { createNextApiHandler } from "@trpc/server/adapters/next";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { env } from "../../../env.mjs";
import { createTRPCContext } from "../../../server/api/trpc";
import { appRouter } from "../../../server/api/root";

// edge-runtime
export const config = {
  runtime: "edge",
};

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
