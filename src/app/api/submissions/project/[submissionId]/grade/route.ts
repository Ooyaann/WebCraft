import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import {
  galleryItems,
  pertemuan,
  projectSubmissions,
  projectTasks,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PILLAR_LABEL_TO_KEY } from "@/lib/ctRubric";
import { upsertCtScore } from "@/lib/ctScore";
import { handler, HttpError, parseBody } from "@/lib/http";

type Ctx = { params: Promise<{ submissionId: string }> };

const gradeSchema = z.object({
  teacher_score: z.number().int(),
  teacher_comment: z.string(),
  rubrik_scores: z.record(z.string(), z.number()),
  is_published_to_gallery: z.boolean(),
});

// PUT /api/submissions/project/{submissionId}/grade — nilai proyek (guru) +
// kelola publikasi galeri
export const PUT = handler<Ctx>(async (req, ctx) => {
  const user = await requireUser(req);
  if (user.role !== "guru") {
    throw new HttpError(403, "Akses ditolak. Hanya guru yang dapat menilai.");
  }
  const { submissionId } = await ctx.params;
  const body = await parseBody(req, gradeSchema);
  const db = getDb();

  // Ambil submission + pertemuan_id (untuk menulis skor CT resmi).
  const [submission] = await db
    .select({
      id: projectSubmissions.id,
      siswa_id: projectSubmissions.siswa_id,
      pertemuan_id: projectTasks.pertemuan_id,
    })
    .from(projectSubmissions)
    .innerJoin(projectTasks, eq(projectSubmissions.task_id, projectTasks.id))
    .where(eq(projectSubmissions.id, submissionId))
    .limit(1);
  if (!submission) {
    throw new HttpError(404, "Submission proyek tidak ditemukan.");
  }

  // Bila rubrik memakai 4 pilar CT → petakan skor ke key CT untuk analitik.
  const pillarScores: Partial<Record<string, number>> = {};
  for (const [label, score] of Object.entries(body.rubrik_scores)) {
    const key = PILLAR_LABEL_TO_KEY[label];
    if (key) pillarScores[key] = score;
  }
  const hasAllPillars =
    pillarScores.decomposition != null &&
    pillarScores.pattern_recognition != null &&
    pillarScores.abstraction != null &&
    pillarScores.algorithm_design != null;

  // Transaksi: nilai + galeri + skor CT resmi harus konsisten.
  await db.transaction(async (tx) => {
    await tx
      .update(projectSubmissions)
      .set({
        teacher_score: body.teacher_score,
        teacher_comment: body.teacher_comment,
        rubrik_scores_json: body.rubrik_scores,
        is_published_to_gallery: body.is_published_to_gallery,
        graded_at: new Date(),
      })
      .where(eq(projectSubmissions.id, submissionId));

    const [galleryItem] = await tx
      .select({ id: galleryItems.id })
      .from(galleryItems)
      .where(eq(galleryItems.project_submission_id, submissionId))
      .limit(1);

    if (body.is_published_to_gallery) {
      if (!galleryItem) {
        await tx.insert(galleryItems).values({
          id: randomUUID(),
          project_submission_id: submissionId,
          appreciation_count: 0,
        });
      }
    } else if (galleryItem) {
      await tx.delete(galleryItems).where(eq(galleryItems.id, galleryItem.id));
    }

    // Validasi guru = skor CT resmi (menimpa self-assessment siswa).
    if (hasAllPillars) {
      // Pastikan pertemuan masih ada (FK) sebelum menulis.
      const [pert] = await tx
        .select({ id: pertemuan.id })
        .from(pertemuan)
        .where(eq(pertemuan.id, submission.pertemuan_id))
        .limit(1);
      if (pert) {
        await upsertCtScore(tx, {
          siswa_id: submission.siswa_id,
          pertemuan_id: submission.pertemuan_id,
          decomposition: pillarScores.decomposition!,
          pattern_recognition: pillarScores.pattern_recognition!,
          abstraction: pillarScores.abstraction!,
          algorithm_design: pillarScores.algorithm_design!,
          source: "teacher",
        });
      }
    }
  });

  return NextResponse.json({
    message: "Submission berhasil dinilai!",
    submission_id: submissionId,
  });
});
