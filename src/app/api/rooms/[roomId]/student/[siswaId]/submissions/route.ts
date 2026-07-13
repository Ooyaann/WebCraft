import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  learningSubmissions,
  learningTasks,
  pertemuan,
  projectSubmissions,
  projectTasks,
  rooms,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handler, HttpError } from "@/lib/http";
import { KKM } from "@/lib/scoring";

type Ctx = { params: Promise<{ roomId: string; siswaId: string }> };

export const GET = handler<Ctx>(async (req, ctx) => {
  const user = await requireUser(req);
  const { roomId, siswaId } = await ctx.params;
  const db = getDb();

  // Verify room exists and user is the teacher of the room
  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);

  if (!room) {
    throw new HttpError(404, "Kelas tidak ditemukan.");
  }
  if (user.role !== "guru" || room.guru_id !== user.id) {
    throw new HttpError(403, "Akses ditolak. Hanya pengajar kelas ini yang dapat melihat rincian.");
  }

  // Fetch learning submissions for this student in this room
  const learningRows = await db
    .select({
      sub: learningSubmissions,
      taskJudul: learningTasks.judul,
      pertId: pertemuan.id,
      pertJudul: pertemuan.judul,
      pertUrutan: pertemuan.urutan,
    })
    .from(learningSubmissions)
    .innerJoin(learningTasks, eq(learningSubmissions.task_id, learningTasks.id))
    .innerJoin(pertemuan, eq(learningTasks.pertemuan_id, pertemuan.id))
    .where(
      and(
        eq(pertemuan.room_id, roomId),
        eq(learningSubmissions.siswa_id, siswaId)
      )
    );

  // Fetch project submissions for this student in this room
  const projectRows = await db
    .select({
      sub: projectSubmissions,
      taskJudul: projectTasks.judul,
      pertId: pertemuan.id,
      pertJudul: pertemuan.judul,
      pertUrutan: pertemuan.urutan,
      rubrik: projectTasks.rubrik_json,
    })
    .from(projectSubmissions)
    .innerJoin(projectTasks, eq(projectSubmissions.task_id, projectTasks.id))
    .innerJoin(pertemuan, eq(projectTasks.pertemuan_id, pertemuan.id))
    .where(
      and(
        eq(pertemuan.room_id, roomId),
        eq(projectSubmissions.siswa_id, siswaId)
      )
    );

  const formattedLearning = learningRows.map(({ sub, taskJudul, pertId, pertJudul, pertUrutan }) => {
    const lastSnapshot = sub.ast_snapshots_json?.length
      ? sub.ast_snapshots_json[sub.ast_snapshots_json.length - 1]
      : null;

    return {
      id: sub.id,
      task_id: sub.task_id,
      pertemuan_id: pertId,
      pertemuan_title: pertJudul,
      pertemuan_urutan: pertUrutan,
      levelTitle: taskJudul,
      accuracy: sub.accuracy_score,
      efficiency: sub.efficiency_score,
      attempts: sub.attempt_count,
      ctScore: sub.final_score,
      kkm: KKM,
      tuntas: sub.final_score >= KKM,
      is_remedial: sub.is_remedial,
      ct_post_score: sub.ct_post_score_json,
      reflection_answers: sub.reflection_answers_json,
      ast: (lastSnapshot?.["ast"] as unknown[] | undefined) ?? [],
      teacherComment: sub.teacher_comment || sub.ai_feedback || "Kerja bagus! Terus asah logika pemrogramanmu.",
      submitted_at: sub.submitted_at,
    };
  });

  const formattedProjects = projectRows.map(({ sub, taskJudul, pertId, pertJudul, pertUrutan, rubrik }) => ({
    id: sub.id,
    task_id: sub.task_id,
    pertemuan_id: pertId,
    pertemuan_title: pertJudul,
    pertemuan_urutan: pertUrutan,
    task_title: taskJudul,
    final_ast: sub.final_ast_json,
    ai_suggestion: sub.ai_suggestion_json,
    teacher_score: sub.teacher_score,
    teacher_comment: sub.teacher_comment,
    rubrik_scores: sub.rubrik_scores_json,
    rubrik,
    is_published_to_gallery: sub.is_published_to_gallery,
    is_remedial: sub.is_remedial,
    attempts: sub.attempt_count,
    submitted_at: sub.submitted_at,
    graded_at: sub.graded_at,
  }));

  // Fetch defined tasks for the room meetings to know which cards should exist
  const roomPertemuans = await db
    .select({ id: pertemuan.id })
    .from(pertemuan)
    .where(eq(pertemuan.room_id, roomId));
  
  const pertIds = roomPertemuans.map((p) => p.id);

  const lTasks = pertIds.length
    ? await db
        .select({ id: learningTasks.id, pertemuan_id: learningTasks.pertemuan_id })
        .from(learningTasks)
        .where(inArray(learningTasks.pertemuan_id, pertIds))
    : [];

  const pTasks = pertIds.length
    ? await db
        .select({ id: projectTasks.id, pertemuan_id: projectTasks.pertemuan_id })
        .from(projectTasks)
        .where(inArray(projectTasks.pertemuan_id, pertIds))
    : [];

  return NextResponse.json({
    learning: formattedLearning,
    projects: formattedProjects,
    definedTasks: {
      learning: lTasks,
      projects: pTasks,
    },
  });
});
