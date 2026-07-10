"use client";
import { RequireAuth } from "@/components/guards";
import Rekap from "@/views/Rekap";

export default function Page() {
  return (
    <RequireAuth>
      <Rekap />
    </RequireAuth>
  );
}
