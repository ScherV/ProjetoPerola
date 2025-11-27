"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../../components/ParticlesBackground";
import { useTheme } from "../../../components/contexts/ThemeContext"; // Se o arquivo estiver direto em components

export default function AtributosPage() {
  const router = useRouter();
  const { theme } = useTheme(); // Usar Tema

  const [loading, setLoading] = useState(true);
  const [personagem, setPersonagem] = useState<any>(null);
  const [msg, setMsg] = useState<{texto: string, tipo: 'sucesso'|'erro'|''} | null>(null);

  const [itemEvoluir, setItemEvoluir] = useState<any>(null);
  const [tipoEvolucao, setTipoEvolucao] = useState("");
  const [aposta, setAposta] = useState("par");

  const ordemAtributos = ["DES", "INT", "FOR", "PER", "VIG", "EMO", "CAR", "MAN"];

  async function carregarFicha() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    try {
        const res = await fetch("http://127.0.0.1:5000/meu-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
        });
        if (res.ok) {
        const data = await res.json();
        if (data.atributos) {
            data.atributos.sort((a: any, b: any) => 
            ordemAtributos.indexOf(a.sigla) - ordemAtributos.indexOf(b.sigla)
            );
        }
        setPersonagem(data);
        }
    } catch (error) {}
    setLoading(false);
  }

  useEffect(() => { carregarFicha(); }, []);

  const talentosOrdenados = ordemAtributos.map(sigla => {
    return {
        pai: sigla,
        lista: personagem?.talentos?.filter((t: any) => t.atributo_base === sigla) || []
    };
  }).filter(grupo => grupo.lista.length > 0);

  function abrirEvolucao(item: any, tipo: string) {
    setItemEvoluir(item);
    setTipoEvolucao(tipo);
    setMsg(null);
  }

  async function confirmarEvolucao() {
    if (!itemEvoluir) return;
    try {
        const res = await fetch("http://127.0.0.1:5000/tentar-evoluir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: tipoEvolucao,
                id_vinculo: itemEvoluir.id_vinculo,
                aposta: aposta
            })
        });
        const data = await res.json();
        setItemEvoluir(null);
        if (res.ok) {
            carregarFicha();
            let texto = `🎲 ${data.pontosGanhos} ACERTOS!`;
            if (data.subiuRank) texto += ` 🎉 RANK UP -> ${data.novoRank}!`;
            mostrarMensagem(texto, "sucesso");
        } else {
            mostrarMensagem(`🚫 ${data.erro}`, "erro");
        }
    } catch (error) {
        mostrarMensagem("Erro de conexão.", "erro");
    }
  }

  function mostrarMensagem(texto: string, tipo: 'sucesso'|'erro') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 4000);
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono text-2xl animate-pulse`}>Sincronizando...</div>;

  return (
    <div className={`relative min-h-screen w-full ${theme.bg} ${theme.text} font-sans pb-10 select-none overflow-x-hidden transition-colors duration-500`}>
      
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ParticlesBackground />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto p-6 flex flex-col gap-6">
        
        {/* CABEÇALHO */}
        <div className={`sticky top-0 z-50 flex justify-between items-center ${theme.panel} backdrop-blur-xl border ${theme.border} shadow-2xl px-6 py-3 rounded-xl shrink-0 mb-2`}>
          <div className="flex items-center gap-6">
             <button onClick={() => router.push("/ficha")} className={`group flex items-center gap-2 ${theme.textMuted} hover:${theme.text} transition-colors px-3 py-2 rounded-lg hover:bg-white/10`} title="Voltar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
             </button>
             <div className="h-8 w-px bg-current opacity-20 mx-2"></div>
             <div>
                <h1 className={`text-2xl font-black uppercase tracking-wide leading-none ${theme.primary}`}>
                  Painel de Evolução
                </h1>
                <p className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${theme.textMuted}`}>User: <span className={`font-bold ${theme.text}`}>{personagem?.nome}</span></p>
             </div>
          </div>

          <div className={`text-right px-5 py-2 rounded-lg border shadow-inner min-w-[120px] bg-black/10 border-white/10`}>
            <p className={`text-[9px] uppercase font-bold tracking-widest mb-0.5 ${theme.primary}`}>XP Livre</p>
            <p className="text-3xl font-mono font-bold drop-shadow-md leading-none">{personagem?.xp_livre}</p>
          </div>
        </div>

        {/* MENSAGEM FLUTUANTE */}
        {msg && (
            <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-8 py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-5 text-lg border-2 ${msg.tipo === 'sucesso' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                {msg.texto}
            </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
            
            {/* --- COLUNA ESQUERDA: ATRIBUTOS --- */}
            <div className="xl:sticky xl:top-28 space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${theme.bgAttr}`}></span>
                    <h2 className={`text-lg font-black uppercase tracking-wider ${theme.accentAttr}`}>Atributos Centrais</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                {personagem?.atributos?.map((attr: any) => (
                    <div key={attr.id_vinculo} className={`${theme.panel} backdrop-blur-md rounded-xl border ${theme.borderAttr} p-3 relative group hover:brightness-110 transition-all flex items-center justify-between`}>
                        <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border bg-black/20 border-white/10 ${theme.textMuted}`}>
                                    RANK {attr.rank}
                                </span>
                             </div>
                             <p className={`text-lg font-black uppercase tracking-wide ${theme.text}`}>{attr.nome}</p>
                        </div>

                        <div className={`flex items-center gap-3 bg-black/10 px-4 py-2 rounded-lg border border-white/5 group-hover:${theme.borderAttr} transition-colors`}>
                            <span className={`text-4xl font-mono font-black leading-none min-w-[40px] text-center ${theme.accentAttr}`}>{attr.valor}</span>
                            <button 
                                onClick={() => abrirEvolucao(attr, "atributo")}
                                className={`w-10 h-10 rounded-lg ${theme.bgAttr} text-white font-bold text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all pb-1`}
                            >+</button>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            {/* --- COLUNA DIREITA: TALENTOS --- */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${theme.bgTalent}`}></span>
                    <h2 className={`text-lg font-black uppercase tracking-wider ${theme.accentTalent}`}>Matriz de Talentos</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {talentosOrdenados.map((grupo: any) => (
                    <div key={grupo.pai} className={`${theme.panel} backdrop-blur-sm rounded-xl border ${theme.border} p-3 h-fit shadow-lg`}>
                        
                        <div className={`mb-3 pb-1 border-b border-white/10 flex items-center justify-between`}>
                            <span className={`text-base font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5 bg-black/20 ${theme.textMuted}`}>
                                {grupo.pai}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {grupo.lista.map((tal: any) => (
                                <div key={tal.id_vinculo} className={`bg-black/10 rounded-lg border ${theme.borderTalent} p-2 relative group hover:bg-black/20 transition-all flex flex-col justify-between min-h-[80px]`}>
                                    
                                    {/* TOPO */}
                                    <div className="flex justify-between items-center w-full mb-1">
                                        <span className={`text-[10px] font-mono tracking-widest uppercase border px-1.5 rounded-sm font-bold shrink-0 opacity-80 ${theme.borderTalent} ${theme.accentTalent}`}>
                                            [{tal.atributo_base}]
                                        </span>
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border shrink-0 bg-black/20 border-white/10 ${theme.textMuted}`}>
                                            {tal.rank}
                                        </span>
                                    </div>

                                    <p className={`font-bold text-sm leading-tight text-center mx-1 truncate mb-auto ${theme.text}`} title={tal.nome}>
                                        {tal.nome}
                                    </p>

                                    {/* BASE */}
                                    <div className={`mt-2 flex items-center justify-between bg-black/10 p-1.5 rounded border border-white/5 group-hover:${theme.borderTalent} transition-colors`}>
                                        <span className={`text-2xl font-mono font-black leading-none pl-2 ${theme.accentTalent}`}>{tal.valor}</span>
                                        <button 
                                            onClick={() => abrirEvolucao(tal, "talento")}
                                            className={`w-7 h-7 rounded ${theme.bgTalent} text-white font-bold flex items-center justify-center shadow-sm active:scale-95 transition-all text-base pb-0.5`}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                </div>
            </div>

        </div>
      </div>

      {/* MODAL DE APOSTA (Usa cores do tema também) */}
      {itemEvoluir && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className={`p-8 rounded-3xl w-full max-w-lg border-2 ${theme.border} ${theme.panel} relative shadow-2xl`}>
            <h2 className={`text-3xl font-black mb-2 text-center uppercase ${theme.primary}`}>Ritual de Evolução</h2>
            
            <div className="flex justify-center my-6">
                <div className={`border px-8 py-4 rounded-xl shadow-inner bg-black/20 ${theme.border}`}>
                    <span className={`font-black text-2xl tracking-wide ${theme.primary}`}>{itemEvoluir.nome}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 font-mono">
                <button onClick={() => setAposta("par")} className={`py-6 rounded-2xl border-2 font-bold text-xl transition-all ${aposta === "par" ? `bg-white text-black scale-105` : `border-white/20 ${theme.textMuted}`}`}>PAR <span className="block text-xs font-normal mt-1 opacity-70">2,4,6,8,0</span></button>
                <button onClick={() => setAposta("impar")} className={`py-6 rounded-2xl border-2 font-bold text-xl transition-all ${aposta === "impar" ? `bg-white text-black scale-105` : `border-white/20 ${theme.textMuted}`}`}>ÍMPAR <span className="block text-xs font-normal mt-1 opacity-70">1,3,5,7,9</span></button>
            </div>

            <div className="flex gap-4 text-lg">
                <button onClick={() => setItemEvoluir(null)} className="flex-1 p-4 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 font-bold transition-colors uppercase">CANCELAR</button>
                <button onClick={confirmarEvolucao} className={`flex-[1.5] p-4 rounded-xl bg-gradient-to-r ${theme.button} font-black shadow-xl transition-all transform hover:-translate-y-1`}>ROLAR DADOS 🎲</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}