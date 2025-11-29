"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { useTheme } from "../../components/contexts/ThemeContext";

export default function MapasPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapas, setMapas] = useState<any[]>([]);
  const [mapaSelecionado, setMapaSelecionado] = useState<any>(null);

  useEffect(() => {
    async function carregarMapas() {
      const userId = localStorage.getItem("user_id");
      // Recupera se é mestre (convertendo string "true" para booleano)
      const isMaster = localStorage.getItem("is_master") === "true";
      
      if (!userId) { router.push("/login"); return; }

      try {
        let url = "";
        let options = {};

        // --- LÓGICA INTELIGENTE DE CARREGAMENTO ---
        if (isMaster) {
            // Mestre vê TUDO (Rota que lista todos os mapas do banco)
            url = "http://127.0.0.1:5000/todos-mapas";
            options = { method: "GET" };
        } else {
            // Jogador vê apenas o SEU (Rota da ficha)
            url = "http://127.0.0.1:5000/meu-personagem";
            options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            };
        }

        const res = await fetch(url, options);

        if (res.ok) {
          const data = await res.json();
          
          // Se for Mestre, a API devolve uma lista direta [mapa1, mapa2]
          // Se for Jogador, devolve a ficha { nome: "...", mapas: [mapa1] }
          const listaMapas = isMaster ? data : (data.mapas || []);
          
          setMapas(listaMapas);
          
          if (listaMapas.length > 0) {
            setMapaSelecionado(listaMapas[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar mapas:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarMapas();
  }, []);

  if (loading) return <div className={`h-screen w-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono text-2xl animate-pulse`}>Carregando Cartografia...</div>;

  return (
    <PageWrapper>
      <div className="relative z-10 w-full h-full flex flex-col p-6 gap-6 max-w-7xl mx-auto flex-1">
        
        {/* CABEÇALHO */}
        <div className={`flex justify-between items-center ${theme.panel} px-6 py-4 rounded-xl border ${theme.border} shadow-lg shrink-0`}>
          <div className="flex items-center gap-4">
             <button onClick={() => router.push("/")} className={`group flex items-center gap-2 ${theme.textMuted} hover:${theme.text} transition-colors px-3 py-2 rounded-lg hover:bg-white/5`} title="Voltar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
             </button>
             <div className="h-8 w-px bg-current opacity-20 mx-2"></div>
             <h1 className={`text-3xl font-black uppercase tracking-widest ${theme.primary}`}>
               Mapas & Localizações
             </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden" style={{ minHeight: "60vh" }}>
            
            {/* LISTA LATERAL */}
            <div className={`w-full lg:w-80 ${theme.panel} backdrop-blur-md rounded-xl border ${theme.border} p-4 flex flex-col gap-2 overflow-y-auto shadow-xl shrink-0`}>
                <h3 className={`text-xs font-black opacity-50 uppercase mb-2 tracking-widest px-2 ${theme.textMuted}`}>
                    Disponíveis ({mapas.length})
                </h3>
                
                {mapas.length === 0 ? (
                    <p className="text-sm opacity-50 italic px-2">Nenhum mapa encontrado.</p>
                ) : (
                    mapas.map(mapa => (
                        <button 
                            key={mapa.id}
                            onClick={() => setMapaSelecionado(mapa)}
                            className={`p-4 rounded-lg text-left transition-all border flex items-center justify-between group ${mapaSelecionado?.id === mapa.id ? `${theme.bgAttr} border-transparent text-white shadow-lg` : 'bg-black/20 border-transparent opacity-70 hover:opacity-100 hover:bg-black/40'}`}
                        >
                            <span className="font-bold text-sm uppercase tracking-wide z-10 relative">{mapa.nome}</span>
                            {mapaSelecionado?.id === mapa.id && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 z-10 relative animate-pulse">
                                    <path fillRule="evenodd" d="M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5zm6.61 10.936a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 14.47a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))
                )}
            </div>

            {/* VISUALIZADOR */}
            <div className={`flex-1 bg-black/60 rounded-xl border ${theme.border} relative overflow-hidden flex items-center justify-center group shadow-2xl p-2`}>
                {mapaSelecionado ? (
                    <>
                        <img 
                            src={mapaSelecionado.url} 
                            alt={mapaSelecionado.nome} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 cursor-grab active:cursor-grabbing"
                        />
                    </>
                ) : (
                    <div className="text-center opacity-50">
                        <span className="text-6xl mb-4 block">🗺️</span>
                        <p className="font-mono text-lg">Selecione um mapa para explorar</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </PageWrapper>
  );
}