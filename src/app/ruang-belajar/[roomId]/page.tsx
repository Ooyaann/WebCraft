"use client";
import { RequireAuth } from "@/components/guards";
import RoomDetail from "@/views/RoomDetail";

export default function Page() {
  return (
    <RequireAuth>
      <RoomDetail />
    </RequireAuth>
  );
}
