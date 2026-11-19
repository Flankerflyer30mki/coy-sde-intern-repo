import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import TabBar from "@/components/TabBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coy · Discover",
  description: "Swipe-based discovery tab for Coy (intern assignment)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff3d7f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full bg-zinc-100">
        {/* Mobile-first: a phone-width column, centered on larger screens */}
        <div className="mx-auto flex h-full max-w-md flex-col bg-background shadow-sm">
          {/* overflow-x-hidden: a swiped card flies off-screen sideways; without
              clipping, it briefly widens the page and a horizontal scrollbar appears. */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
