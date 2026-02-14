import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunchMitra",
  description: "Your Startup Journey, Simplified",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
