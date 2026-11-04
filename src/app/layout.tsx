import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav, SmoothScroll, Toaster } from "@/components/chrome";
import { profile } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Nathalia Lemes · Engenharia de Software", template: "%s · Nathalia Lemes" },
  description:
    "Portfólio de Nathalia Lemes, estudante de Engenharia de Software (UMC, 4º semestre) em busca de estágio em TI. Quatro sistemas acadêmicos para testar no navegador.",
  openGraph: {
    title: "Nathalia Lemes · Engenharia de Software",
    description: "Quatro sistemas acadêmicos para testar no navegador. Em busca de estágio em TI.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0e0f1a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-svh">
        <SmoothScroll />
        <Nav />
        {children}
        <footer className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-muted sm:px-8">
          <span>© {new Date().getFullYear()} {profile.fullName}</span>
          <span className="flex gap-6">
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">GitHub</a>
            <a href={`mailto:${profile.email}`} className="transition-colors hover:text-fg">E-mail</a>
          </span>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
