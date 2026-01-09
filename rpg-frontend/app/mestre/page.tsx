"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { useTheme } from "../../components/contexts/ThemeContext";

const COR_RANK: any = {
  "F": "bg-slate-600 border-slate-400 text-slate-100",
  "E": "bg-green-700 border-green-500 text-green-100",
  "D": "bg-blue-700 border-blue-500 text-blue-100",
  "C": "bg-purple-700 border-purple-500 text-purple-100",
  "B": "bg-yellow-600 border-yellow-400 text-yellow-100",
  "A": "bg-red-700 border-red-500 text-red-100",
  "S": "bg-rose-900 border-rose-500 text-rose-100 animate-pulse",
  "Z": "bg-black border-white text-white shadow-[0_0_10px_white]",
  "-": "bg-gray-800 opacity-50"
};

export default function MestrePage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [nivel, setNivel] = useState(1);
  const [classe, setClasse] = useState("Aleatorio");
  const [arquetipo, setArquetipo] = useState("Aleatorio"); // Novo estado
  const [nomeOpcional, setNomeOpcional] = useState("");
  const [loading, setLoading] = useState(false);
  const [npc, setNpc] = useState<any>(null);

  const ordemAtributos = ["FOR", "DES", "VIG", "INT", "PER", "CAR", "EMO", "MAN"];

  async function gerarNPC() {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/gerar-npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia Classe E Arquétipo separados
        body: JSON.stringify({ nivel, classe, arquetipo, nome: nomeOpcional }),
      });
      const data = await res.json();
      setNpc(data);
    } catch (error) {
      console.error("Erro", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-[1600px] mx-auto p-6 flex flex-col gap-6">
        
        {/* HEADER */}
        <div className={`sticky top-0 z-50 flex justify-between items-center ${theme.panel} backdrop-blur-xl border ${theme.border} shadow-2xl px-6 py-4 rounded-xl shrink-0`}>
             <div className="flex items-center gap-6">
                <button onClick={() => router.push("/")} className={`group flex items-center gap-2 ${theme.textMuted} hover:${theme.text} transition-colors px-3 py-2 rounded-lg hover:bg-white/10`}>
                   <span className="text-sm font-bold uppercase tracking-wider">← Voltar</span>
                </button>
                <div className="h-8 w-px bg-current opacity-20 mx-2"></div>
                <h1 className={`text-2xl font-black uppercase tracking-wide leading-none ${theme.primary}`}>
                  Gerador de Ameaças
                </h1>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* --- CONTROLES (Esquerda) --- */}
            <div className={`lg:col-span-4 ${theme.panel} p-6 rounded-xl border ${theme.border} sticky top-28`}>
                <h2 className={`text-lg font-black uppercase tracking-wider mb-6 ${theme.text}`}>Configuração</h2>
                
                {/* NOME */}
                <div className="mb-6">
                    <label className={`text-xs font-bold uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Nome (Opcional)</label>
                    <input type="text" value={nomeOpcional} onChange={(e) => setNomeOpcional(e.target.value)} placeholder="Ex: Ceifeiro Sombrio..." className={`w-full p-4 rounded-xl bg-black/20 border border-white/10 outline-none focus:border-white/50 ${theme.text} font-bold`} />
                </div>

                {/* NÍVEL */}
                <div className="mb-6">
                    <label className={`text-xs font-bold uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Nível de Poder</label>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} onClick={() => setNivel(n)} className={`p-3 rounded-lg font-black text-lg border transition-all ${nivel === n ? `bg-white text-black scale-105 shadow-lg` : `bg-black/20 border-white/10 hover:border-white/30 text-white/50`}`}>{n}</button>
                        ))}
                    </div>
                </div>

                {/* SELETOR 1: CLASSE (Talentos) */}
                <div className="mb-4">
                    <label className={`text-xs font-bold uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Classe (Define Talentos)</label>
                    <select value={classe} onChange={(e) => setClasse(e.target.value)} className={`w-full p-4 rounded-xl bg-black/20 border border-white/10 outline-none focus:border-white/50 ${theme.text} font-bold`}>
                        <option value="Aleatorio">🎲 Aleatório</option>
                        <option value="Ceifeiro">💀 Ceifeiro</option>
                        <option value="Ladino">🗡️ Ladino</option>
                        <option value="Alquimista">⚗️ Alquimista</option>
                    </select>
                </div>

                {/* SELETOR 2: ARQUÉTIPO (Atributos) */}
                <div className="mb-8">
                    <label className={`text-xs font-bold uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Arquétipo (Define Atributos)</label>
                    <select value={arquetipo} onChange={(e) => setArquetipo(e.target.value)} className={`w-full p-4 rounded-xl bg-black/20 border border-white/10 outline-none focus:border-white/50 ${theme.text} font-bold`}>
                        <option value="Aleatorio">🎲 Aleatório</option>
                        <option value="Combatente">⚔️ Combatente (FOR/VIG)</option>
                        <option value="Atirador">🎯 Atirador (VIG/DES)</option>
                        <option value="Ocultista">🔮 Místico (INT/PER)</option>
                        <option value="Social">👑 Social (CAR/MAN)</option>
                        <option value="Tanque">🛡️ Tanque (VIG/FOR)</option>
                    </select>
                </div>

                <button onClick={gerarNPC} disabled={loading} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-xl transform active:scale-95 transition-all text-lg ${loading ? 'opacity-50' : `bg-gradient-to-r ${theme.button}`}`}>
                    {loading ? "Calculando..." : "⚡ GERAR NPC"}
                </button>
            </div>

            {/* --- RESULTADO (Direita) --- */}
            <div className="lg:col-span-8">
                {npc ? (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        
                        {/* HEADER NPC */}
                        <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r ${theme.button} relative overflow-hidden shadow-2xl`}>
                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/30 px-2 py-1 rounded text-white/80 border border-white/10">Nível {npc.nivel}</span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-1 rounded text-white border border-white/10">{npc.classe}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white leading-none">{npc.nome}</h2>
                                    <p className="font-mono font-bold text-white/60 uppercase tracking-widest mt-1 text-sm">{npc.arquetipo}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-white/60">Pontos Brutos</p>
                                    <p className="text-3xl font-mono font-black text-white">{npc.pontos_gastos}</p>
                                </div>
                            </div>
                        </div>

                        {/* GRID DE 3 COLUNAS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* ATRIBUTOS */}
                            <div className="md:col-span-1 space-y-3">
                                <div className="flex items-center gap-2 px-1 mb-2">
                                    <span className={`inline-block w-2 h-2 rounded-full ${theme.bgAttr}`}></span>
                                    <h3 className={`text-sm font-black uppercase tracking-wider ${theme.accentAttr}`}>Atributos</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                    {ordemAtributos.map((sigla) => {
                                        const attr = npc.ficha.atributos[sigla] || {valor: 1, rank: "F"};
                                        return (
                                            <div key={sigla} className={`${theme.panel} backdrop-blur-md rounded-lg border ${theme.borderAttr} p-2 flex items-center justify-between relative overflow-hidden`}>
                                                <span className={`text-xs font-black uppercase tracking-wide ${theme.text} opacity-70`}>{sigla}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded border shadow-sm ${COR_RANK[attr.rank] || COR_RANK["-"]}`}>
                                                        {attr.rank}
                                                    </span>
                                                    <span className={`text-xl font-mono font-black ${theme.accentAttr}`}>{attr.valor}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* TALENTOS */}
                            <div className="md:col-span-2 space-y-3">
                                <div className="flex items-center gap-2 px-1 mb-2">
                                    <span className={`inline-block w-2 h-2 rounded-full ${theme.bgTalent}`}></span>
                                    <h3 className={`text-sm font-black uppercase tracking-wider ${theme.accentTalent}`}>Talentos</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                    {npc.ficha.talentos.map((tal: any, idx: number) => (
                                        <div key={idx} className={`bg-black/10 rounded-lg border ${theme.borderTalent} p-3 flex items-center justify-between group hover:bg-black/20 transition-all`}>
                                            <div className="flex flex-col">
                                                <span className={`text-[9px] font-mono font-bold uppercase opacity-50 ${theme.text}`}>[{tal.pai}]</span>
                                                <span className={`font-bold text-sm ${theme.text}`}>{tal.nome}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${COR_RANK[tal.rank] || COR_RANK["-"]}`}>
                                                    {tal.rank}
                                                </span>
                                                <span className={`text-lg font-mono font-black ${theme.accentTalent}`}>+{tal.valor}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {npc.ficha.talentos.length === 0 && <p className="opacity-30 text-sm italic">Nenhum talento desenvolvido.</p>}
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 border-2 border-dashed border-white/10 rounded-3xl">
                        <span className="text-6xl mb-4 grayscale">🧬</span>
                        <p className="uppercase font-bold tracking-widest">Aguardando Parâmetros</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </PageWrapper>
  );
}