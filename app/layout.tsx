import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MonitoraME — Inteligência em compras públicas",
  description:
    "Dados públicos transformados em inteligência para municípios e pequenos negócios do Ceará.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemeToggle />
          <Toaster
            position="bottom-right"
            offset={{ right: "1rem", bottom: "4.75rem" }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
