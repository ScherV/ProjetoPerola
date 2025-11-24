"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../../components/ParticlesBackground";

export default function AtributosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [personagem, setPersonagem] = useState<any>(null);
  const [msg, setMsg] = useState<{texto: string, tipo: 'sucesso'|'erro'|''} | null>(null);
  
  const [itemEvoluir, setItemEvoluir] = useState<any>(null);
  const [tipoEvolucao, setTipoEvolucao] = useState("");
  const [aposta, setAposta] = useState("par");

  // Carregar Dados
  async function carregarFicha() {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    const res = await fetch("http://127.0.0.1:5000/meu-personagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    if (res.ok) setPersonagem(await res.json());
    setLoading(false);
  }

  useEffect(() => { carregarFicha(); }, []);

  // Agrupar Talentos por Atributo Pai (Ex: DES -> [Atletismo, Furtividade...])
  const talentosAgrupados = personagem?.talentos?.reduce((acc: any, tal: any) => {
    if (!acc[tal.atributo_base]) acc[tal.atributo_base] = [];
    acc[tal.atributo_base].push(tal);
    return acc;
  }, {});

  // Funções do Modal
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
            body: JSON.stringify({ tipo: tipoEvolucao, id_vinculo: itemEvoluir.id_vinculo, aposta: aposta })
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
    setTimeout(() => setMsg(null), 5000);
  }

  if (loading) return <div className="h-screen w-full bg-slate-950 text-white flex items-center justify-center font-mono text-xl">Sincronizando Ficha...</div>;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white font-sans overflow-y-auto custom-scrollbar selection:bg-purple-500 selection:text-white">
      
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ParticlesBackground />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto p-6 flex flex-col gap-8 pb-20">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center bg-slate-900/90 px-8 py-4 rounded-2xl backdrop-blur-xl border border-slate-800 shadow-2xl sticky top-4 z-50">
          <div className="flex items-center gap-6">
             <button onClick={() => router.push("/ficha")} className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5" title="Voltar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
             </button>
             <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-wide">
                  Painel de Evolução
                </h1>
                <p className="text-sm text-slate-500 font-mono uppercase tracking-widest mt-1">User: <span className="text-white font-bold">{personagem?.nome}</span></p>
             </div>
          </div>

          <div className="text-right bg-black/60 px-6 py-3 rounded-xl border border-yellow-500/30 shadow-inner min-w-[140px]">
            <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest mb-1">XP Livre</p>
            <p className="text-4xl font-mono font-bold text-yellow-300 drop-shadow-md leading-none">{personagem?.xp_livre}</p>
          </div>
        </div>

        {/* MENSAGEM FLUTUANTE */}
        {msg && (
            <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 px-8 py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-5 text-lg border-2 ${msg.tipo === 'sucesso' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                {msg.texto}
            </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-8 items-start">
            
            {/* --- COLUNA ESQUERDA: ATRIBUTOS (STICKY) --- */}
            <div className="xl:sticky xl:top-28 space-y-4">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                    <h2 className="text-xl font-black text-blue-400 uppercase tracking-wider">Atributos Centrais</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                {personagem?.atributos?.map((attr: any) => (
                    <div key={attr.id_vinculo} className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-blue-900/40 p-5 relative group hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] transition-all flex items-center justify-between">
                        
                        <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-black border ${attr.rank === '-' ? 'bg-slate-950 text-slate-500 border-slate-800' : 'bg-blue-900 text-blue-200 border-blue-500'}`}>
                                    RANK {attr.rank}
                                </span>
                             </div>
                             <p className="text-xl font-bold text-gray-100 uppercase tracking-wide">{attr.nome}</p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-950/50 px-4 py-3 rounded-xl border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                            <span className="text-4xl font-mono font-black text-blue-400 leading-none min-w-[40px] text-center">{attr.valor}</span>
                            <button 
                                onClick={() => abrirEvolucao(attr, "atributo")}
                                className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                            >+</button>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            {/* --- COLUNA DIREITA: TALENTOS (AGRUPADOS POR PAI) --- */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <h2 className="text-xl font-black text-green-400 uppercase tracking-wider">Matriz de Talentos</h2>
                </div>
                
                {/* Renderiza os grupos (Ex: Um bloco só para DES, outro para FOR...) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(talentosAgrupados || {}).map(([pai, talentos]: any) => (
                        <div key={pai} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 hover:border-green-900/50 transition-colors">
                            
                            {/* Título do Grupo (Ex: [DES]) */}
                            <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                                <span className="text-lg font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                    {pai}
                                </span>
                                <span className="text-xs text-slate-600 font-bold uppercase">Talentos Base</span>
                            </div>

                            {/* Lista de Talentos desse Pai */}
                            <div className="space-y-3">
                                {talentos.map((tal: any) => (
                                    <div key={tal.id_vinculo} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-green-500/50 hover:bg-slate-900 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded border ${tal.rank === '-' ? 'text-slate-600 border-slate-800 bg-slate-900' : 'text-green-300 bg-green-900 border-green-700'}`}>
                                                {tal.rank}
                                            </span>
                                            <p className="font-bold text-base text-gray-300 group-hover:text-white transition-colors">
                                                {tal.nome}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-mono font-bold text-green-400">{tal.valor}</span>
                                            <button 
                                                onClick={() => abrirEvolucao(tal, "talento")}
                                                className="w-8 h-8 rounded-lg bg-green-900/50 hover:bg-green-600 text-green-400 hover:text-white border border-green-800 hover:border-green-500 font-bold flex items-center justify-center transition-all"
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

      {/* MODAL (SEU MODAL BONITO) */}
      {itemEvoluir && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-lg border-2 border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.3)] relative">
            <h2 className="text-3xl font-black mb-2 text-white text-center uppercase">Ritual de Evolução</h2>
            
            <div className="flex justify-center my-6">
                <div className="bg-slate-950 border border-purple-500/50 px-8 py-4 rounded-xl shadow-inner">
                    <span className="text-purple-400 font-black text-2xl tracking-wide">{itemEvoluir.nome}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 font-mono">
                <button onClick={() => setAposta("par")} className={`py-6 rounded-2xl border-2 font-bold text-xl transition-all ${aposta === "par" ? "border-purple-500 bg-purple-600 text-white shadow-lg scale-105" : "border-slate-700 text-slate-500 hover:border-purple-500/50"}`}>PAR <span className="block text-xs font-normal mt-1 opacity-70">2,4,6,8,0</span></button>
                <button onClick={() => setAposta("impar")} className={`py-6 rounded-2xl border-2 font-bold text-xl transition-all ${aposta === "impar" ? "border-purple-500 bg-purple-600 text-white shadow-lg scale-105" : "border-slate-700 text-slate-500 hover:border-purple-500/50"}`}>ÍMPAR <span className="block text-xs font-normal mt-1 opacity-70">1,3,5,7,9</span></button>
            </div>

            <div className="flex gap-4 text-lg">
                <button onClick={() => setItemEvoluir(null)} className="flex-1 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-transparent hover:border-slate-500 font-bold text-slate-300 transition-all">CANCELAR</button>
                <button onClick={confirmarEvolucao} className="flex-[1.5] p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black shadow-xl hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1">🎲 ROLAR DADOS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}