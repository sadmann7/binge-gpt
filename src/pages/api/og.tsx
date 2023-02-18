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
        <div tw="bg-black bg-cover h-full w-full flex items-center justify-center flex-col">
          <div tw="flex items-center text-3xl justify-center flex-col">
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="https://tourwise.vercel.app/logo.png"
                alt="Tourwise"
                tw="w-60 h-60"
              />
            }
          </div>
          <div tw="flex max-w-2xl items-center justify-center flex-col mt-8">
            <div tw="text-6xl font-bold whitespace-pre-wrap tracking-tight leading-tight text-white px-8">
              {title}
            </div>
            <div tw="mt-5 text-4xl text-zinc-300 text-center font-normal whitespace-pre-wrap tracking-tight leading-tight px-8">
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
