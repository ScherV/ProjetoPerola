import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/contexts/ThemeContext"; // <--- IMPORTANTE

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grimório RPG",
  description: "Gerenciador de Fichas e Magias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ThemeProvider> {/* <--- O PROVEDOR AQUI */}
           {children}
        </ThemeProvider>
      </body>
    </html>
  );
}