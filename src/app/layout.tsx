import type { Metadata, Viewport } from "next";
// Font & ikon self-hosted (tanpa CDN, tetap jalan offline) — paritas main.jsx lama.
import "@fontsource-variable/fredoka/index.css";
import "@fontsource-variable/nunito/index.css";
import "@fontsource-variable/nunito/wght-italic.css";
import "material-symbols/rounded.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./index.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "WebCraft - Belajar Coding Web Interaktif",
  description:
    "WebCraft - Platform pembelajaran interaktif pengembangan Computational Thinking melalui Web Development untuk siswa SMP.",
  authors: [{ name: "WebCraft Team" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    title: "WebCraft - Belajar Coding Web Interaktif",
    description:
      "Platform CBL & CT interaktif untuk siswa SMP. Rakit halaman web secara visual dengan AI tutor.",
    images: ["/favicon.svg"],
  },
  twitter: {
    card: "summary",
    title: "WebCraft - Belajar Coding Web Interaktif",
    description: "Platform CBL & CT interaktif untuk siswa SMP.",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#E0F2FE] text-[#0F172A] font-nunito antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
