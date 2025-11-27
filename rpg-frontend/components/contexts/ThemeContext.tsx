"use client";
import { error } from "console";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- DEFINIÇÃO DAS DIMENSÕES (PALETAS) ---
const themes = {
  cosmos: {
    name: "A Pérola (Padrão)",
    bg: "bg-[#0b0c15]", // Preto levemente azulado
    text: "text-slate-100",
    textMuted: "text-slate-400", // <--- ADICIONADO AQUI
    primary: "text-purple-400",
    border: "border-purple-500/50",
    button: "from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white",
    panel: "bg-slate-900/80 border-slate-800",
    particleColor: "#ffffff",
    // Cores específicas
    accentAttr: "text-blue-400",
    borderAttr: "border-blue-500/30",
    bgAttr: "bg-blue-600",
    accentTalent: "text-green-400",
    borderTalent: "border-green-500/30",
    bgTalent: "bg-green-600",
    successBadge: "bg-green-900/20 text-green-400",
    errorBadge: "bg-red-600 text-white",
  },
  finxy: {
    name: "Criação (Finxy)",
    bg: "bg-[#fdfbf7]", // Creme muito claro (melhor que branco puro)
    text: "text-slate-900", // Texto PRETO (Crucial para legibilidade)
    textMuted: "text-slate-500", // Cinza escuro
    panel: "bg-white border-amber-200 shadow-[0_4px_20px_-5px_rgba(251,191,36,0.3)]",
    primary: "text-amber-600",
    border: "border-amber-400/50",
    // Botão mais escuro para dar leitura do texto branco dentro dele
    button: "from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white",
    
    // Cores específicas das colunas (Mais escuras para ler no fundo claro)
    accentAttr: "text-cyan-700",
    borderAttr: "border-cyan-600/30",
    bgAttr: "bg-cyan-600",
    accentTalent: "text-emerald-700",
    borderTalent: "border-emerald-600/30",
    bgTalent: "bg-emerald-600",
    
    particleColor: "#d97706",// Dourado Escuro
    successBadge: "bg-green-600 text-white",
    errorBadge: "bg-red-600 text-white",
  },
  exidium: {
    name: "Destruição (Exidium)",
    bg: "bg-[#1a0505]", // Vinho quase preto
    text: "text-red-50",
    textMuted: "text-red-300/60", // <--- ADICIONADO AQUI
    primary: "text-red-500",
    border: "border-red-600/50",
    button: "from-red-700 to-orange-800 hover:from-red-600 hover:to-orange-700 text-white",
    panel: "bg-black/60 border-red-900",
    particleColor: "#ff4444",
    // Cores específicas
    accentAttr: "text-orange-500",
    borderAttr: "border-orange-500/30",
    bgAttr: "bg-orange-600",
    accentTalent: "text-red-400",
    borderTalent: "border-red-500/30",
    bgTalent: "bg-red-600",
    successBadge: "bg-green-900/20 text-green-400",
    errorBadge: "bg-red-600 text-white",
  },
  fox: {
    name: "Magia (Fox)",
    bg: "bg-black",
    text: "text-blue-50",
    textMuted: "text-blue-400/60", // <--- ADICIONADO AQUI
    primary: "text-blue-400",
    border: "border-blue-500/50",
    button: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white",
    panel: "bg-zinc-900/80 border-blue-900",
    particleColor: "#60a5fa",
    // Cores específicas
    accentAttr: "text-indigo-400",
    borderAttr: "border-indigo-500/30",
    bgAttr: "bg-indigo-600",
    accentTalent: "text-violet-400",
    borderTalent: "border-violet-500/30",
    bgTalent: "bg-violet-600",
    successBadge: "bg-green-900/20 text-green-400",
    errorBadge: "bg-red-600 text-white",
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