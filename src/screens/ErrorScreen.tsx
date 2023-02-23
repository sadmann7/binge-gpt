import type { AppRouter } from "@/server/api/root";
import type { TRPCClientErrorLike } from "@trpc/client";

// external imports
import { AlertTriangle } from "lucide-react";

const ErrorScreen = ({ error }: { error?: TRPCClientErrorLike<AppRouter> }) => {
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center">
      <AlertTriangle className="h-16 w-16 text-red-400" />
      <h1 className="mt-4 text-2xl font-semibold text-red-400 line-clamp-1">
        {error?.message ?? "Something went wrong"}
      </h1>
      <table className="mt-2.5">
        <thead className="text-text text-base font-medium md:text-lg">
          <tr className="text-gray-900">
            <th>Try doing these:</th>
          </tr>
        </thead>
        <tbody className="text-base font-medium text-gray-700 md:text-lg">
          <tr>
            <td>1. Spine transfer to nosegrab frontflip</td>
          </tr>
          <tr>
            <td>2. Wall flip to natas spin</td>
          </tr>
          <tr>
            <td>3. Sticker slap to manual to wallplant</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ErrorScreen;
