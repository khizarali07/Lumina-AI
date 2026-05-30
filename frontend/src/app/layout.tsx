import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina AI - Faceless Video Generation",
  description: "Configure and generate faceless video pipelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-body-sm overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
