// Rubrik penilaian Computational Thinking (4 pilar) — Tabel 5 proposal.
// SATU sumber kebenaran, dipakai: panduan siswa, modal nilai guru,
// prompt AI (server), dan ekspor Excel. Objektif & transparan.

export type CtLevel = {
  level: 1 | 2 | 3 | 4;
  desc: string; // kriteria persis Tabel 5
};

export type CtPillar = {
  key: 'decomposition' | 'pattern_recognition' | 'abstraction' | 'algorithm_design';
  label: string; // nama kriteria (dipakai sbg key rubrik_json)
  icon: string; // tabler icon
  color: string; // aksen tailwind
  summary: string;
  levels: CtLevel[]; // urut 4→1
};

export const CT_PILLARS: CtPillar[] = [
  {
    key: 'decomposition',
    label: 'Dekomposisi',
    icon: 'ti-puzzle',
    color: 'blue',
    summary: 'Memecah tantangan coding menjadi bagian-bagian penyusun.',
    levels: [
      { level: 4, desc: 'Dapat menguraikan tantangan coding menjadi elemen-elemen penyusun secara detail dan tepat.' },
      { level: 3, desc: 'Dapat menguraikan tantangan coding menjadi elemen-elemen penyusun secara detail namun kurang tepat.' },
      { level: 2, desc: 'Dapat menguraikan tantangan coding menjadi elemen-elemen penyusun secara tepat namun tidak detail.' },
      { level: 1, desc: 'Menguraikan tantangan coding secara tidak detail dan tidak tepat.' },
    ],
  },
  {
    key: 'pattern_recognition',
    label: 'Pengenalan Pola',
    icon: 'ti-subtask',
    color: 'amber',
    summary: 'Mengenali pola/struktur yang sudah dipelajari dan menerapkannya.',
    levels: [
      { level: 4, desc: 'Dapat mengenali pola/struktur yang telah dipelajari sebelumnya dan menerapkannya secara tepat dan konsisten.' },
      { level: 3, desc: 'Dapat mengenali pola/struktur yang telah dipelajari sebelumnya dan menerapkannya secara tepat namun belum konsisten.' },
      { level: 2, desc: 'Dapat mengenali pola/struktur yang telah dipelajari namun kurang tepat dalam penerapannya.' },
      { level: 1, desc: 'Belum dapat mengenali pola/struktur yang relevan dengan tantangan yang diberikan.' },
    ],
  },
  {
    key: 'abstraction',
    label: 'Abstraksi',
    icon: 'ti-filter',
    color: 'rose',
    summary: 'Memilih elemen HTML/CSS esensial, mengabaikan yang tak perlu.',
    levels: [
      { level: 4, desc: 'Dapat memilih elemen HTML/CSS yang esensial secara tepat dan mengabaikan detail yang tidak diperlukan.' },
      { level: 3, desc: 'Dapat memilih elemen HTML/CSS yang esensial namun masih menyertakan sebagian detail yang tidak diperlukan.' },
      { level: 2, desc: 'Memilih elemen HTML/CSS namun sebagian besar belum relevan dengan kebutuhan tantangan.' },
      { level: 1, desc: 'Belum dapat membedakan elemen HTML/CSS yang esensial dari yang tidak diperlukan.' },
    ],
  },
  {
    key: 'algorithm_design',
    label: 'Algoritma',
    icon: 'ti-list-numbers',
    color: 'emerald',
    summary: 'Menyusun langkah-langkah solusi secara logis dan berurutan.',
    levels: [
      { level: 4, desc: 'Dapat menyusun langkah-langkah solusi secara logis, berurutan, dan menghasilkan luaran yang sesuai.' },
      { level: 3, desc: 'Dapat menyusun langkah-langkah solusi secara logis dan berurutan namun luaran belum sepenuhnya sesuai.' },
      { level: 2, desc: 'Menyusun langkah-langkah solusi namun urutan kurang logis sehingga luaran tidak sesuai.' },
      { level: 1, desc: 'Belum dapat menyusun langkah-langkah solusi secara logis dan berurutan.' },
    ],
  },
];

// Peta label kriteria → key pilar CT (utk menulis ct_scores dari rubrik).
export const PILLAR_LABEL_TO_KEY: Record<string, CtPillar['key']> =
  Object.fromEntries(CT_PILLARS.map((p) => [p.label, p.key]));

// Bobot default 25% tiap pilar (paritas objektif proposal; guru boleh ubah).
export const CT_RUBRIC_CRITERIA = CT_PILLARS.map((p) => ({
  name: p.label,
  bobot: 25,
}));

export const isCtPillar = (name: string): boolean => name in PILLAR_LABEL_TO_KEY;

// Konversi skor 0-100 → level 1-4 + label kualifikasi (Tabel 5 / rencana).
export type LevelInfo = {
  level: 1 | 2 | 3 | 4;
  label: string;
  status: string;
  tone: 'emerald' | 'blue' | 'amber' | 'rose';
};

export function scoreToLevel(score: number): LevelInfo {
  if (score >= 90) return { level: 4, label: 'Sangat Baik', status: 'Tuntas', tone: 'emerald' };
  if (score >= 75) return { level: 3, label: 'Baik', status: 'Tuntas', tone: 'blue' };
  if (score >= 60) return { level: 2, label: 'Cukup', status: 'Perlu Bimbingan', tone: 'amber' };
  return { level: 1, label: 'Kurang', status: 'Perlu Bimbingan', tone: 'rose' };
}

// Skor representatif tiap level (dipakai tombol level 1-4 → nilai).
const LEVEL_SCORE: Record<number, number> = { 4: 95, 3: 82, 2: 67, 1: 50 };
export const levelToScore = (level: number): number => LEVEL_SCORE[level] ?? 0;

// Deskripsi kriteria pilar pada level tertentu.
export function pillarLevelDesc(pillarLabel: string, level: number): string {
  const p = CT_PILLARS.find((x) => x.label === pillarLabel);
  return p?.levels.find((l) => l.level === level)?.desc ?? '';
}
