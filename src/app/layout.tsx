import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebCraft",
  description:
    "Platform pembelajaran Computational Thinking & Web Development untuk SMP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
