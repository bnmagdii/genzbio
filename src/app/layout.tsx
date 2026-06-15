import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { PWARegistrar } from "@/components/PWARegistrar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GEN-Z BIO | Cosmic Link-in-Bio Universe",
  description: "Create your digital universe in space. Custom themes, AI utilities, interactive guestbooks, and premium animations for Gen-Z creators.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-bg-space text-gray-100 font-sans selection:bg-primary/50 selection:text-white">
        <AuthProvider>
          <BackgroundCanvas />
          <PWARegistrar />
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
