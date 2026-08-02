import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/organisms/nav/sidebar";

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Camino",
    template: "%s | Camino",
  },
  description: "Camino Intranet app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoFlex.variable} h-full antialiased`}>
      <body className="h-screen flex bg-primary-250">
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
