import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { refreshTokens } from "@/db/schema";
import { hashToken } from "@/lib/auth";
import { handler, parseBody } from "@/lib/http";

const logoutSchema = z.object({ refresh_token: z.string() });

export const POST = handler(async (req) => {
  const body = await parseBody(req, logoutSchema);
  await getDb()
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.token_hash, hashToken(body.refresh_token)));
  return NextResponse.json({ message: "Logout berhasil." });
});
