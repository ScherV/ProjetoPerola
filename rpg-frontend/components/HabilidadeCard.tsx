"use client";
import { useTheme } from "./contexts/ThemeContext";

interface HabilidadeProps {
  nome: string;
  nivel: number;
  descricao: string;
  tag: "Ataque" | "Defesa" | "Mental" | "Suporte" | "Passiva" | string;
  podeEvoluir?: boolean;
  onEvolve?: () => void;
}

export default function HabilidadeCard({ nome, nivel, descricao, tag, podeEvoluir, onEvolve }: HabilidadeProps) {
  const { theme } = useTheme();

  // Cores das Tags
  const corTag: Record<string, string> = {
    "Ataque": "bg-red-500/20 text-red-200 border-red-500/50",
    "Defesa": "bg-blue-500/20 text-blue-200 border-blue-500/50",
    "Mental": "bg-purple-500/20 text-purple-200 border-purple-500/50",
    "Suporte": "bg-green-500/20 text-green-200 border-green-500/50",
    "Passiva": "bg-yellow-500/20 text-yellow-200 border-yellow-500/50",
  };

  return (
    <div className={`${theme.panel} border ${theme.border} rounded-xl p-4 flex flex-col gap-3 shadow-lg hover:border-white/30 transition-all group h-full`}>
      
      {/* --- TOPO: NOME + NÍVEL --- */}
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <h3 className={`font-black text-lg uppercase tracking-wide ${theme.primary} group-hover:scale-[1.02] transition-transform`}>
            {nome}
        </h3>
        <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold opacity-50">Nível</span>
            <span className={`text-xl font-mono font-black ${nivel > 0 ? "text-white" : "text-white/30"}`}>
                {nivel}
            </span>
        </div>
      </div>

      {/* --- MEIO: DESCRIÇÃO --- */}
      <div className="flex-1">
        <p className="text-sm leading-relaxed opacity-80 font-serif">
            {descricao || "O conhecimento desta habilidade ainda é um mistério..."}
        </p>
      </div>

      {/* --- RODAPÉ: TAG + BOTÃO --- */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
        
        {/* Tag */}
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${corTag[tag] || "bg-gray-500/20 border-gray-500 text-gray-300"}`}>
            {tag}
        </span>

        {/* Botão Evoluir */}
        <button 
            onClick={onEvolve}
            disabled={!podeEvoluir}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                podeEvoluir 
                ? `bg-gradient-to-r ${theme.button} hover:scale-105 shadow-md text-white` 
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
        >
            {nivel === 0 ? "Aprender" : nivel >= 3 ? "Maximizado" : "Evoluir"}
        </button>
      </div>

    </div>
  );
}