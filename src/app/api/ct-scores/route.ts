import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { upsertCtScore } from "@/lib/ctScore";
import { handler, HttpError, parseBody } from "@/lib/http";
import { assertMemberOfPertemuan } from "@/lib/rooms";

const createSchema = z.object({
  decomposition: z.number().int(),
  abstraction: z.number().int(),
  pattern_recognition: z.number().int(),
  algorithm_design: z.number().int(),
  pertemuan_id: z.string(),
});

// POST /api/ct-scores — simpan skor CT siswa
export const POST = handler(async (req) => {
  const user = await requireUser(req);
  if (user.role !== "siswa") {
    throw new HttpError(403, "Hanya siswa yang dapat menyimpan data nilai CT.");
  }
  const body = await parseBody(req, createSchema);
  // Cegah pencemaran analitik guru: hanya anggota kelas pertemuan ini
  await assertMemberOfPertemuan(user, body.pertemuan_id);

  const score = await upsertCtScore(getDb(), {
    siswa_id: user.id,
    pertemuan_id: body.pertemuan_id,
    decomposition: body.decomposition,
    pattern_recognition: body.pattern_recognition,
    abstraction: body.abstraction,
    algorithm_design: body.algorithm_design,
    source: "student",
  });

  return NextResponse.json(score, { status: 201 });
});
