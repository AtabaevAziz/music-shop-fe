import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Music Shop Backoffice",
  description: "Admin panel demo for a musical instruments store.",
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
