import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { learningSubmissions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handler, HttpError, parseBody } from "@/lib/http";

type Ctx = { params: Promise<{ submissionId: string }> };

const commentSchema = z.object({
  teacher_comment: z.string(),
});

// PUT /api/submissions/learning/{submissionId}/comment — guru memberikan komentar/catatan
export const PUT = handler<Ctx>(async (req, ctx) => {
  const user = await requireUser(req);
  if (user.role !== "guru") {
    throw new HttpError(403, "Akses ditolak. Hanya guru yang dapat memberikan catatan.");
  }
  const { submissionId } = await ctx.params;
  const body = await parseBody(req, commentSchema);
  const db = getDb();

  const [sub] = await db
    .select()
    .from(learningSubmissions)
    .where(eq(learningSubmissions.id, submissionId))
    .limit(1);

  if (!sub) {
    throw new HttpError(404, "Submission misi belajar tidak ditemukan.");
  }

  await db
    .update(learningSubmissions)
    .set({
      teacher_comment: body.teacher_comment,
    })
    .where(eq(learningSubmissions.id, submissionId));

  return NextResponse.json({
    status: "updated",
    message: "Catatan guru untuk misi belajar berhasil disimpan.",
  });
});
