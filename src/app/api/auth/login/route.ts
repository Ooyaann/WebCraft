import { and, eq, lt, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import {
  createAccessToken,
  createRefreshToken,
  toUserResponse,
  verifyPassword,
} from "@/lib/auth";
import { handler, HttpError, parseBody } from "@/lib/http";

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const POST = handler(async (req) => {
  const body = await parseBody(req, loginSchema);
  const db = getDb();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email))
    .limit(1);
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    throw new HttpError(401, "Email atau kata sandi Anda salah.");
  }

  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  // Housekeeping: bersihkan refresh token kedaluwarsa/tercabut milik user ini
  // agar tabel refresh_tokens tidak tumbuh tanpa batas.
  await db
    .delete(refreshTokens)
    .where(
      and(
        eq(refreshTokens.user_id, user.id),
        or(
          eq(refreshTokens.revoked, true),
          lt(refreshTokens.expires_at, new Date()),
        ),
      ),
    );

  return NextResponse.json({
    access_token: accessToken,
    token_type: "bearer",
    user: toUserResponse(user),
    refresh_token: refreshToken,
  });
});
