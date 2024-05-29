import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Provider} from "@/components/provider/provider";
import {Suspense} from "react";
import {Toaster} from "@/components/ui/toaster";
import {ErrorPage} from "@/app/_components/error-page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wooriworship",
  description: "A web application designed for church worship teams to create and manage song lists and service schedules. Users can create and share song lists, add personal notes to each song, and access shared service schedules.",
  metadataBase: new URL("https://www.wooriworship.com/"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
    <head>
      <title>Wooriworship | Collaborate with team</title>
      <link rel="icon" href="/image/logo.png"/>
    </head>
    <body className={inter.className}>
    <main className="relative h-full">
      <Provider>
        <Toaster/>
        {children}
      </Provider>
    </main>
    </body>
    </html>
  );
}
