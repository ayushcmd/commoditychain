import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "CommodityChain — Real-time Commodity Intelligence",
  description: "Live commodity prices, AI analysis, India macro impact, news and alerts.",
};

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="app-main">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
