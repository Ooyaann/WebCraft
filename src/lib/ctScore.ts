import { randomUUID } from "node:crypto";
import { ctScores } from "@/db/schema";

type CtScoreInput = {
  siswa_id: string;
  pertemuan_id: string;
  decomposition: number;
  pattern_recognition: number;
  abstraction: number;
  algorithm_design: number;
  source?: "student" | "teacher";
};

// Upsert satu skor CT per (siswa, pertemuan) — penilaian terbaru menimpa.
// db bisa instance utama atau transaksi. Mengembalikan baris tersimpan.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertCtScore(db: any, input: CtScoreInput) {
  const composite = Math.trunc(
    (input.decomposition +
      input.pattern_recognition +
      input.abstraction +
      input.algorithm_design) /
      4,
  );
  const values = {
    decomposition: input.decomposition,
    pattern_recognition: input.pattern_recognition,
    abstraction: input.abstraction,
    algorithm_design: input.algorithm_design,
    composite_ct_score: composite,
    source: input.source ?? "student",
    recorded_at: new Date(),
  };
  const [row] = await db
    .insert(ctScores)
    .values({
      id: randomUUID(),
      siswa_id: input.siswa_id,
      pertemuan_id: input.pertemuan_id,
      ...values,
    })
    .onConflictDoUpdate({
      target: [ctScores.siswa_id, ctScores.pertemuan_id],
      set: values,
    })
    .returning();
  return row;
}
