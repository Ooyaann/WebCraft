import { eq, inArray } from "drizzle-orm";
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

type Ctx = { params: Promise<{ roomId: string }> };

const avg = (nums: number[]) =>
  nums.length ? Math.trunc(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const list = map.get(k) ?? [];
    list.push(row);
    map.set(k, list);
  }
  return map;
}

// GET /api/rooms/{roomId}/grades — rekap nilai & progres semua siswa (guru saja)
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

  const members = (
    await db
      .select()
      .from(users)
      .innerJoin(roomMembers, eq(users.id, roomMembers.siswa_id))
      .where(eq(roomMembers.room_id, roomId))
  ).map((m) => m.users);

  const pertemuanRows = await db
    .select({ id: pertemuan.id })
    .from(pertemuan)
    .where(eq(pertemuan.room_id, roomId));
  const pertemuanIds = pertemuanRows.map((p) => p.id);

  const learningTaskIds = pertemuanIds.length
    ? (
        await db
          .select({ id: learningTasks.id })
          .from(learningTasks)
          .where(inArray(learningTasks.pertemuan_id, pertemuanIds))
      ).map((t) => t.id)
    : [];
  const projectTaskIds = pertemuanIds.length
    ? (
        await db
          .select({ id: projectTasks.id })
          .from(projectTasks)
          .where(inArray(projectTasks.pertemuan_id, pertemuanIds))
      ).map((t) => t.id)
    : [];

  const learningSubs = learningTaskIds.length
    ? await db
        .select()
        .from(learningSubmissions)
        .where(inArray(learningSubmissions.task_id, learningTaskIds))
    : [];
  const projectSubs = projectTaskIds.length
    ? await db
        .select()
        .from(projectSubmissions)
        .where(inArray(projectSubmissions.task_id, projectTaskIds))
    : [];
  const ctScoreRows = pertemuanIds.length
    ? await db
        .select()
        .from(ctScores)
        .where(inArray(ctScores.pertemuan_id, pertemuanIds))
    : [];

  const learningBySiswa = groupBy(learningSubs, (s) => s.siswa_id);
  const projectBySiswa = groupBy(projectSubs, (s) => s.siswa_id);
  const ctBySiswa = groupBy(ctScoreRows, (s) => s.siswa_id);

  const grades = members.map((student) => {
    const lSubs = learningBySiswa.get(student.id) ?? [];
    const pSubs = projectBySiswa.get(student.id) ?? [];
    const ctRows = ctBySiswa.get(student.id) ?? [];

    const lScore = avg(lSubs.map((s) => s.final_score));

    let pScore: number | null = null;
    let statusStr: string;
    if (pSubs.length) {
      pScore = pSubs[pSubs.length - 1].teacher_score;
      statusStr = pScore !== null ? "Selesai" : "Perlu Dinilai";
    } else if (lSubs.length) {
      statusStr = "Dalam Proses";
    } else {
      statusStr = "Belum Mengerjakan";
    }

    // CT: hanya angka nyata. null bila siswa belum punya skor CT terekam —
    // tidak lagi memakai nilai learning sebagai pengganti (anti "dibikin-bikin").
    const hasCt = ctRows.length > 0;

    const lSubmitted = new Set(
      lSubs.filter((s) => learningTaskIds.includes(s.task_id)).map((s) => s.task_id),
    );
    const pSubmitted = new Set(
      pSubs.filter((s) => projectTaskIds.includes(s.task_id)).map((s) => s.task_id),
    );
    const alreadyDone = lSubmitted.size + pSubmitted.size;
    const totalTasks = learningTaskIds.length + projectTaskIds.length;

    return {
      name: student.name,
      email: student.email,
      // null = belum ada data nyata (bukan angka fiktif)
      learning: lSubs.length ? lScore : null,
      project: pScore,
      ct: hasCt ? avg(ctRows.map((s) => s.composite_ct_score)) : null,
      decomposition: hasCt ? avg(ctRows.map((s) => s.decomposition)) : null,
      abstraction: hasCt ? avg(ctRows.map((s) => s.abstraction)) : null,
      pattern_recognition: hasCt ? avg(ctRows.map((s) => s.pattern_recognition)) : null,
      algorithm_design: hasCt ? avg(ctRows.map((s) => s.algorithm_design)) : null,
      status: statusStr,
      already_done: alreadyDone,
      not_done: Math.max(0, totalTasks - alreadyDone),
    };
  });

  return NextResponse.json(grades);
});
