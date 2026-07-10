import { redirect } from "next/navigation";

// Fallback: rute tak dikenal → beranda (paritas <Route path="*"> lama)
export default function NotFoundCatchAll() {
  redirect("/");
}
