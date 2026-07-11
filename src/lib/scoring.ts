// Aturan penilaian WebCraft — satu sumber kebenaran, dipakai server & UI.

// Kriteria Ketuntasan Minimal (seragam semua kelas, keputusan produk 2026-07).
export const KKM = 70;

export type RubrikCriterion = {
  name?: string;
  kriteria?: string; // beberapa data lama memakai kunci 'kriteria'
  bobot?: number;
  [key: string]: unknown;
};

export const criterionName = (c: RubrikCriterion): string =>
  String(c.name ?? c.kriteria ?? "Kriteria");

// Nilai proyek = rata-rata TERBOBOT kriteria rubrik:
//   total = Σ(skor × bobot) / Σ(bobot)
// Fallback rata-rata polos bila rubrik tanpa bobot (Σ bobot 0).
export function weightedRubricScore(
  rubrik: RubrikCriterion[],
  scores: Record<string, number>,
): number {
  if (!rubrik?.length) {
    const vals = Object.values(scores);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  let totalBobot = 0;
  let sum = 0;
  for (const c of rubrik) {
    const bobot = Number(c.bobot) || 0;
    totalBobot += bobot;
    sum += (scores[criterionName(c)] ?? 0) * bobot;
  }
  if (totalBobot === 0) {
    const vals = rubrik.map((c) => scores[criterionName(c)] ?? 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / rubrik.length);
  }
  return Math.round(sum / totalBobot);
}

// Nilai misi belajar = rata-rata akurasi & efisiensi:
//   akurasi  = 100 − 15 × jumlah error struktur pada AST final (min 0)
//   efisiensi= tangga percobaan: ≤1→100, 2→90, 3→80, 4→70, ≥5→60
export function accuracyFromErrors(errorCount: number): number {
  return errorCount === 0 ? 100 : Math.max(0, 100 - errorCount * 15);
}

export function efficiencyFromAttempts(attempts: number): number {
  if (attempts <= 1) return 100;
  if (attempts === 2) return 90;
  if (attempts === 3) return 80;
  if (attempts === 4) return 70;
  return 60;
}

export function learningFinalScore(accuracy: number, efficiency: number): number {
  return Math.trunc((accuracy + efficiency) / 2);
}
