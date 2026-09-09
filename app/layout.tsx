import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/organisms/nav/sidebar";
import { ClerkProvider, SignInButton, Show } from "@clerk/nextjs";
import LandingPage from "@/components/pages/landing-page";
import AppToastProvider from "@/components/organisms/toasts/app-toast-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
    <html lang="nl-BE" className={`${robotoFlex.variable} h-full antialiased`}>
      <body className="h-screen flex bg-primary-250">
        <ClerkProvider>
          <Show when="signed-out">
            <LandingPage />
          </Show>
          <Show when="signed-in">
            <Sidebar />
            <NuqsAdapter>
              <AppToastProvider>{children}</AppToastProvider>
            </NuqsAdapter>
          </Show>
        </ClerkProvider>
      </body>
    </html>
  );
}
