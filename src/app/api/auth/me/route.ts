import { NextResponse } from "next/server";
import { requireUser, toUserResponse } from "@/lib/auth";
import { handler } from "@/lib/http";

export const GET = handler(async (req) => {
  const user = await requireUser(req);
  return NextResponse.json(toUserResponse(user));
});
