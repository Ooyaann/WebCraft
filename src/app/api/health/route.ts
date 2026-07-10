import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "online",
    service: "WebCraft API",
    version: "3.0.0",
  });
}
