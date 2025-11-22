import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticlesBackground from "../components/ParticlesBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grimório RPG",
  description: "Gerenciador de fichas e magias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ParticlesBackground /> {/* <--- ADICIONAR AQUI */}
        <div className="relative z-10"> {/* Garante que o conteúdo fique na frente */}
          {children}
        </div>
      </body>
    </html>
  );
}