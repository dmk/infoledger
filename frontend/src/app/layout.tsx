'use client';

import { Header } from "@/components/Header";
import "./globals.css";
import { SWRConfig } from "swr/_internal";

const SWR_CONFIG = {
  fetcher: (url: string) => {
    console.log('in swr fetcher', url);
    return fetch(`http://localhost:4891/${url}`).then((res) => res.json());
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SWRConfig value={SWR_CONFIG}>
          <Header />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </main>
        </SWRConfig>
      </body>
    </html>
  );
}
