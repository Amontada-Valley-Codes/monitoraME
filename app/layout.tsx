import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  title: "MonitoraME",
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
      <body>
        <SmoothScrollProvider />
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
