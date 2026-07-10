"use client";
import { RequireAuth } from "@/components/guards";
import TugasDetail from "@/views/TugasDetail";

export default function Page() {
  return (
    <RequireAuth>
      <TugasDetail />
    </RequireAuth>
  );
}
