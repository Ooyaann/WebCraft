"use client";
import { RequireRole } from "@/components/guards";
import PenilaianAnalitik from "@/views/PenilaianAnalitik";

export default function Page() {
  return (
    <RequireRole role="guru">
      <PenilaianAnalitik />
    </RequireRole>
  );
}
