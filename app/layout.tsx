import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maram's Cafe — مرام Virtual Barista",
  description: "Order from Maram's Cafe with Maram, the bilingual virtual barista.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}<script src="/addons/local-training-recorder.js" defer></script>
      </body></html>;
}
