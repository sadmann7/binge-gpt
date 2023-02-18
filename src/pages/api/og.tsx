import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ?title=<title>
    const hasTitle = searchParams.has("title");
    const title = hasTitle
      ? searchParams.get("title")?.slice(0, 100)
      : "My default title";

    // ?description=<description>
    const hasDescription = searchParams.has("description");
    const description = hasDescription
      ? searchParams.get("description")?.slice(0, 200)
      : "My default description";

    return new ImageResponse(
      (
        <div tw="bg-gray-50 bg-cover h-full w-full flex items-center justify-center flex-col">
          <div tw="flex items-center text-3xl justify-center flex-col">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="128"
              height="128"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="feather feather-monitor"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div tw="flex max-w-2xl items-center justify-center flex-col mt-8">
            <div tw="text-6xl font-bold whitespace-pre-wrap tracking-tight leading-tight text-black px-8">
              {title}
            </div>
            <div tw="mt-5 text-4xl text-gray-900 text-center font-normal whitespace-pre-wrap tracking-tight leading-tight px-8">
              {description}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(`${e.message as string}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
