import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Provider} from "@/components/provider/provider";
import {Suspense} from "react";
import {Toaster} from "@/components/ui/toaster";
import {FirebaseAuthProvider} from "@/components/provider/firebase-auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="relative h-full">
          <Provider>
            <FirebaseAuthProvider>
              <Toaster />
              <Suspense fallback={<div>loading</div>}>
                {children}
              </Suspense>
            </FirebaseAuthProvider>
          </Provider>
        </main>
      </body>
    </html>
  );
}
