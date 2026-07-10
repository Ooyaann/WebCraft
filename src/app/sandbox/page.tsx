"use client";
// Ruang coba fitur Workspace untuk pengunjung umum (tanpa login):
// bebas merakit blok, tanpa tugas, tanpa penilaian, tanpa kirim karya.
import Workspace from "@/views/Workspace";

export default function Page() {
  return <Workspace isSandbox />;
}
