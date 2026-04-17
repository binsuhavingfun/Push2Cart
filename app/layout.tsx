import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Push2Cart",
  description: "Play. Shop. Save. Your cart just got more fun."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_hsl(var(--secondary)/0.12),_transparent_28%)]" />
            <Navbar />
            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-20 pt-28 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
