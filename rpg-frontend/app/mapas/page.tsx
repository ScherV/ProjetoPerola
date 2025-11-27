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
      if (!userId) return;

      const res = await fetch("http://127.0.0.1:5000/meu-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setMapas(data.mapas || []);
        if (data.mapas && data.mapas.length > 0) {
            setMapaSelecionado(data.mapas[0]);
        }
      }
      setLoading(false);
    }
    carregarMapas();
  }, []);

  if (loading) return <div className={`h-screen w-full ${theme.bg} flex items-center justify-center ${theme.text}`}>Carregando Cartografia...</div>;

  return (
    <PageWrapper>
      <div className="relative z-10 w-full h-full flex flex-col p-6 gap-6 max-w-7xl mx-auto flex-1">
        
        {/* CABEÇALHO */}
        <div className={`flex justify-between items-center ${theme.panel} px-6 py-4 rounded-xl border ${theme.border} shadow-lg shrink-0`}>
          <div className="flex items-center gap-4">
             <button onClick={() => router.push("/")} className={`group flex items-center gap-2 opacity-70 hover:opacity-100 transition-colors px-3 py-2 rounded-lg hover:bg-white/5`} title="Voltar">
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

        <div className="flex-1 flex gap-6 overflow-hidden" style={{ minHeight: "60vh" }}>
            
            {/* LISTA LATERAL */}
            <div className={`w-72 ${theme.panel} backdrop-blur-md rounded-xl border ${theme.border} p-4 flex flex-col gap-2 overflow-y-auto shadow-xl`}>
                <h3 className="text-xs font-black opacity-50 uppercase mb-2 tracking-widest px-2">Locais Descobertos</h3>
                {mapas.map(mapa => (
                    <button 
                        key={mapa.id}
                        onClick={() => setMapaSelecionado(mapa)}
                        className={`p-4 rounded-lg text-left transition-all border group flex items-center justify-between ${mapaSelecionado?.id === mapa.id ? `bg-white/10 border-white/20 text-white` : `bg-black/20 border-transparent opacity-60 hover:opacity-100 hover:bg-white/5`}`}
                    >
                        <span className="font-bold text-sm uppercase tracking-wide">{mapa.nome}</span>
                        {mapaSelecionado?.id === mapa.id && <div className={`w-2 h-2 rounded-full ${theme.bgAttr || 'bg-white'}`}></div>}
                    </button>
                ))}
            </div>

            {/* VISUALIZADOR DO MAPA */}
            <div className="flex-1 bg-black/80 rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center group shadow-2xl">
                {mapaSelecionado ? (
                    <>
                        <img 
                            src={mapaSelecionado.url} 
                            alt={mapaSelecionado.nome} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-6 backdrop-blur-md border-t border-white/10">
                            <h2 className={`text-2xl font-bold ${theme.primary}`}>{mapaSelecionado.nome}</h2>
                            <p className="text-sm opacity-70 mt-1 leading-relaxed">{mapaSelecionado.descricao}</p>
                        </div>
                    </>
                ) : (
                    <p className="opacity-50 font-mono">Nenhum mapa selecionado.</p>
                )}
            </div>

        </div>
      </div>
    </PageWrapper>
  );
}