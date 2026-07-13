import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  ctScores,
  learningSubmissions,
  learningTasks,
  pertemuan,
  projectSubmissions,
  projectTasks,
  roomMembers,
  rooms,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { handler, HttpError } from "@/lib/http";
import { KKM } from "@/lib/scoring";

type Ctx = { params: Promise<{ roomId: string }> };

// GET /api/rooms/{roomId}/export — seluruh data penilaian kelas dalam satu
// JSON (bahan ekspor Excel guru): siswa, detail misi belajar, proyek, skor CT.
export const GET = handler<Ctx>(async (req, ctx) => {
  const user = await requireUser(req);
  const { roomId } = await ctx.params;
  const db = getDb();

  const [room] = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, roomId))
    .limit(1);
  if (!room) throw new HttpError(404, "Kelas tidak ditemukan.");
  if (user.role !== "guru" || room.guru_id !== user.id) {
    throw new HttpError(403, "Akses ditolak. Hanya pengajar kelas ini.");
  }

  const students = (
    await db
      .select()
      .from(users)
      .innerJoin(roomMembers, eq(users.id, roomMembers.siswa_id))
      .where(eq(roomMembers.room_id, roomId))
  ).map((r) => ({
    id: r.users.id,
    name: r.users.name,
    email: r.users.email,
    nisn: r.users.nisn_nip,
  }));

  const learning = (
    await db
      .select({
        sub: learningSubmissions,
        studentName: users.name,
        pertJudul: pertemuan.judul,
        pertUrutan: pertemuan.urutan,
      })
      .from(learningSubmissions)
      .innerJoin(learningTasks, eq(learningSubmissions.task_id, learningTasks.id))
      .innerJoin(pertemuan, eq(learningTasks.pertemuan_id, pertemuan.id))
      .innerJoin(users, eq(learningSubmissions.siswa_id, users.id))
      .where(eq(pertemuan.room_id, roomId))
  ).map(({ sub, studentName, pertJudul, pertUrutan }) => ({
    student_name: studentName,
    pertemuan: pertJudul,
    urutan: pertUrutan,
    final_score: sub.final_score,
    accuracy: sub.accuracy_score,
    efficiency: sub.efficiency_score,
    attempts: sub.attempt_count,
    is_remedial: sub.is_remedial,
    tuntas: sub.final_score >= KKM,
    submitted_at: sub.submitted_at,
  }));

  const projects = (
    await db
      .select({
        sub: projectSubmissions,
        studentName: users.name,
        taskJudul: projectTasks.judul,
        rubrik: projectTasks.rubrik_json,
      })
      .from(projectSubmissions)
      .innerJoin(projectTasks, eq(projectSubmissions.task_id, projectTasks.id))
      .innerJoin(pertemuan, eq(projectTasks.pertemuan_id, pertemuan.id))
      .innerJoin(users, eq(projectSubmissions.siswa_id, users.id))
      .where(eq(pertemuan.room_id, roomId))
  ).map(({ sub, studentName, taskJudul, rubrik }) => ({
    student_name: studentName,
    task: taskJudul,
    teacher_score: sub.teacher_score,
    teacher_comment: sub.teacher_comment,
    rubrik_scores: sub.rubrik_scores_json,
    rubrik,
    is_published: sub.is_published_to_gallery,
    attempts: sub.attempt_count,
    submitted_at: sub.submitted_at,
  }));

  const ct = (
    await db
      .select({
        score: ctScores,
        studentName: users.name,
        pertJudul: pertemuan.judul,
      })
      .from(ctScores)
      .innerJoin(pertemuan, eq(ctScores.pertemuan_id, pertemuan.id))
      .innerJoin(users, eq(ctScores.siswa_id, users.id))
      .where(eq(pertemuan.room_id, roomId))
  ).map(({ score, studentName, pertJudul }) => ({
    student_name: studentName,
    pertemuan: pertJudul,
    decomposition: score.decomposition,
    abstraction: score.abstraction,
    pattern_recognition: score.pattern_recognition,
    algorithm_design: score.algorithm_design,
    composite: score.composite_ct_score,
    recorded_at: score.recorded_at,
  }));

  return NextResponse.json({
    room: { id: room.id, name: room.name, code: room.code },
    kkm: KKM,
    students,
    learning,
    projects,
    ct,
  });
});
