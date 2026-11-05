import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explore Local | AI Heritage Lens & Vibe Discovery",
  description: "Identify heritage landmarks from photos with AI, listen to stories via audio, and explore places based on vibe and tailored trip plans.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col antialiased selection:bg-heritage-200 selection:text-heritage-900">
        {children}
      </body>
    </html>
  );
}
