"use client";
import { RequireRole } from "@/components/guards";
import Tugasku from "@/views/Tugasku";

export default function Page() {
  return (
    <RequireRole role="siswa">
      <Tugasku />
    </RequireRole>
  );
}
