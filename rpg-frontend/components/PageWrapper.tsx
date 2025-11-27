"use client";
import { useTheme } from "../components/contexts/ThemeContext";
import ParticlesBackground from "./ParticlesBackground";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const { theme, setTheme, currentTheme } = useTheme();
  const router = useRouter();

  // Função de Logout (Disponível em todas as telas)
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Pega o usuário para mostrar no topo
  const user = typeof window !== "undefined" ? localStorage.getItem("rpg_user") : "Viajante";

  return (
    <div className={`relative min-h-screen w-full ${theme.bg} ${theme.text} font-sans transition-colors duration-500 overflow-x-hidden flex flex-col`}>
      
      {/* Fundo de Partículas Global */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ParticlesBackground />
      </div>

      {/* --- BARRA DE NAVEGAÇÃO GLOBAL (Topo) --- */}
       <nav className={`sticky top-0 z-50 flex justify-between items-center px-6 py-3 border-b ${theme.border} ${theme.panel} backdrop-blur-md shadow-lg shrink-0 relative`}>
        
        {/* Lado Esquerdo: Logo e Usuário */}
        <div className="z-10"> {/* z-10 para garantir que fique clicável */}
          <h1 className={`text-lg font-black uppercase tracking-widest ${theme.primary} flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform`} onClick={() => router.push("/")}>
            🔮 Grimório RPG
          </h1>
          <p className="text-[10px] opacity-60 font-mono mt-0.5 flex items-center gap-1">
            USER: <span className="font-bold text-white bg-white/10 px-1 rounded">{user}</span>
          </p>
        </div>

        {/* CENTRO ABSOLUTO: SELETOR DE TEMAS */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-3 bg-black/40 px-5 py-2 rounded-full border border-white/10 shadow-inner backdrop-blur-sm">
            {['cosmos', 'finxy', 'exidium', 'fox'].map((t) => (
                <button 
                    key={t}
                    onClick={() => setTheme(t as any)} 
                    className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 ${currentTheme === t ? 'border-white scale-125 shadow-[0_0_10px_white]' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                    style={{ backgroundColor: t === 'cosmos' ? '#9333ea' : t === 'finxy' ? '#facc15' : t === 'exidium' ? '#dc2626' : '#3b82f6' }}
                    title={`Tema ${t}`}
                ></button>
            ))}
        </div>

        {/* Lado Direito: Sair */}
        <button onClick={handleLogout} className="z-10 text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5">
          Sair
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>
      </nav>

      {/* --- CONTEÚDO DA PÁGINA --- */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>

    </div>
  );
}