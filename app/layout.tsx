import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/util/provider/provider";
import { Toaster } from "@/components/ui/toaster";
import { BaseContainer } from "@/components/util/provider/base-container";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wooriworship",
  description: "A web application designed for church worship teams to create and manage song-board lists and service schedules. Users can create and share song-board lists, add personal notes to each song-board, and access shared service schedules.",
  metadataBase: new URL("https://www.wooriworship.com/"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <title>Wooriworship | Worship team collaborator</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/image/fill-logo-192.png" type="image/<generated>" sizes="<generated>" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <main className="relative h-full">
          <Provider>
            <Toaster />
            <BaseContainer>
              {children}
            </BaseContainer>
          </Provider>
        </main>
      </body>
    </html>
  );
}
