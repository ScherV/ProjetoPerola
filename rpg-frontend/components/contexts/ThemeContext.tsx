"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const themes = {
  cosmos: {
    name: "A Pérola (Padrão)",
    bg: "bg-[#0b0c15]", 
    text: "text-slate-100",
    textMuted: "text-slate-400",
    panel: "bg-slate-900/80 border-slate-800",
    primary: "text-purple-400",
    button: "from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white",
    border: "border-purple-500/50",
    accentAttr: "text-blue-400",
    borderAttr: "border-blue-500/30",
    bgAttr: "bg-blue-600",
    accentTalent: "text-green-400",
    borderTalent: "border-green-500/30",
    bgTalent: "bg-green-600",
    particleColor: "#ffffff",
    successBadge: "bg-green-900/40 text-green-400 border-green-800",
    errorBadge: "bg-red-900/40 text-red-400 border-red-800",
  },
  finxy: {
    name: "Criação (Finxy)",
    // NOVO: Fundo mais suave e confortável (Pedra Polida)
    bg: "bg-[#f0ece5]", 
    text: "text-slate-800", // Texto PRINCIPAL Escuro
    textMuted: "text-slate-600", // Texto Secundário (Opaco)
    // Painel claro, mas com sombra para dar destaque
    panel: "bg-white/90 border-amber-200 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)]", 
    primary: "text-amber-700", // Título Principal
    border: "border-amber-400/40",
    button: "from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white",
    // Cores específicas das colunas
    accentAttr: "text-cyan-800",
    borderAttr: "border-cyan-600/40",
    bgAttr: "bg-cyan-600",
    accentTalent: "text-emerald-800",
    borderTalent: "border-emerald-600/40",
    bgTalent: "bg-emerald-600",
    particleColor: "#c0b300ff", // Partículas Dourado Escuro (Visíveis)
    // BADGES: Usam fundo sólido e texto escuro para alto contraste
    successBadge: "bg-green-500 text-slate-800 border-green-700/50",
    errorBadge: "bg-red-500 text-slate-800 border-red-700/50"
  },
  exidium: {
    name: "Destruição (Exidium)",
    bg: "bg-[#1a0505]",
    text: "text-red-50",
    textMuted: "text-red-300/60",
    panel: "bg-black/60 border-red-900",
    primary: "text-red-500",
    button: "from-red-700 to-orange-800 hover:from-red-600 hover:to-orange-700 text-white",
    border: "border-red-600/50",
    accentAttr: "text-orange-500",
    borderAttr: "border-orange-500/30",
    bgAttr: "bg-orange-600",
    accentTalent: "text-red-400",
    borderTalent: "border-red-500/30",
    bgTalent: "bg-red-600",
    particleColor: "#ff4444",
    successBadge: "bg-green-600/90 text-white border-green-700",
    errorBadge: "bg-red-600/90 text-white border-red-700"
  },
  fox: {
    name: "Magia (Fox)",
    bg: "bg-black",
    text: "text-blue-50",
    textMuted: "text-blue-400/60",
    panel: "bg-zinc-900/80 border-blue-900",
    primary: "text-blue-400",
    button: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white",
    border: "border-blue-500/50",
    accentAttr: "text-indigo-400",
    borderAttr: "border-indigo-500/30",
    bgAttr: "bg-indigo-600",
    accentTalent: "text-violet-400",
    borderTalent: "border-violet-500/30",
    bgTalent: "bg-violet-600",
    particleColor: "#60a5fa",
    successBadge: "bg-green-600/90 text-white border-green-700",
    errorBadge: "bg-red-600/90 text-white border-red-700"
  }
};

type ThemeType = keyof typeof themes;

interface ThemeContextProps {
  theme: typeof themes["cosmos"];
  currentTheme: ThemeType;
  setTheme: (t: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("cosmos");

  useEffect(() => {
    const saved = localStorage.getItem("rpg_theme") as ThemeType;
    if (saved && themes[saved]) setCurrentTheme(saved);
  }, []);

  const changeTheme = (t: ThemeType) => {
    setCurrentTheme(t);
    localStorage.setItem("rpg_theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[currentTheme], currentTheme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  return context;
}