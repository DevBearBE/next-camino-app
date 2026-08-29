import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/organisms/nav/sidebar";
import { ClerkProvider, SignInButton, Show } from "@clerk/nextjs";
import LandingPage from "@/components/pages/landing-page";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoFlex.variable} h-full antialiased`}>
      <body className="h-screen flex bg-primary-250">
        <ClerkProvider>
          <Show when="signed-out">
            <LandingPage />
          </Show>
          <Show when="signed-in">
            <Sidebar />
            {children}
          </Show>
        </ClerkProvider>
      </body>
    </html>
  );
}
