import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const error = new Error("Sentry test error from /api/debug/sentry");
  Sentry.captureException(error);

  return NextResponse.json(
    {
      message: "Sentry test error captured.",
    },
    {
      status: 500,
    },
  );
}
