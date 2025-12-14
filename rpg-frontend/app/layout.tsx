import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Importando os Contextos (Verifique se os caminhos batem com sua pasta components)
import { ThemeProvider } from '../components/contexts/ThemeContext'
import { NotificationProvider } from '../components/contexts/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Grimório RPG',
  description: 'Sistema de RPG do Projeto Pérola',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* 1. O ThemeProvider cuida das cores */}
        <ThemeProvider>
          {/* 2. O NotificationProvider cuida das mensagens flutuantes */}
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}