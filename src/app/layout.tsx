import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deskmate",
  description:
    "A daily-life management app for developers that feels like a physical desk.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
