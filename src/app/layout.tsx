import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Link Creator",
  description: "Create commercetools cart links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <body className={`${inter.className} bg-[#F7F2EA]`}>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  );
}