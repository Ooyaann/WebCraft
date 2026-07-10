import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { createAccessToken, createRefreshToken, hashToken } from "@/lib/auth";
import { handler, HttpError, parseBody } from "@/lib/http";

const refreshSchema = z.object({ refresh_token: z.string() });

const invalid = () =>
  new HttpError(401, "Refresh token tidak sah atau kedaluwarsa.");

export const POST = handler(async (req) => {
  const body = await parseBody(req, refreshSchema);
  const db = getDb();

  const [stored] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token_hash, hashToken(body.refresh_token)))
    .limit(1);
  if (!stored || stored.revoked || stored.expires_at < new Date()) {
    throw invalid();
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, stored.user_id))
    .limit(1);
  if (!user) throw invalid();

  // Rotasi: cabut token yang dipakai, terbitkan pasangan baru.
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.id, stored.id));

  return NextResponse.json({
    access_token: await createAccessToken(user),
    token_type: "bearer",
    refresh_token: await createRefreshToken(user.id),
  });
});
