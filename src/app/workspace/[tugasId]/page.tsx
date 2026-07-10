"use client";
import { RequireAuth } from "@/components/guards";
import Workspace from "@/views/Workspace";

export default function Page() {
  return (
    <RequireAuth>
      <Workspace />
    </RequireAuth>
  );
}
