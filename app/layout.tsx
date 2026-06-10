import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Instruments Backoffice",
  description: "Operational admin panel for musical instruments retail.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
