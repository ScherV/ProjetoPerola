"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { useTheme } from "../../components/contexts/ThemeContext";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function MapasPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [mapas, setMapas] = useState<any[]>([]);
  const [mapaSelecionado, setMapaSelecionado] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(true);

  useEffect(() => {
    async function carregarMapas() {
      try {
        const res = await fetch("http://127.0.0.1:5000/mapas");
        if (res.ok) {
            const data = await res.json();
            setMapas(data);
            if (data.length > 0) setMapaSelecionado(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar mapas", error);
      } finally {
        setLoading(false);
      }
    }
    carregarMapas();
  }, []);

  if (loading) return <div className={`h-screen w-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono animate-pulse text-2xl`}>Desdobrando Pergaminhos...</div>;

  return (
    <PageWrapper>
      <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
        
        {/* --- MENU LATERAL --- */}
        <div 
            className={`${theme.panel} border-r ${theme.border} transition-all duration-500 ease-in-out flex flex-col z-20 absolute md:relative h-full shadow-2xl backdrop-blur-md`}
            style={{ width: menuAberto ? '300px' : '0px', opacity: menuAberto ? 1 : 0, overflow: 'hidden' }}
        >
            <div className="p-6 border-b border-current/10 flex justify-between items-center bg-black/20">
                <div>
                    <h2 className={`font-black uppercase tracking-widest ${theme.primary}`}>Cartografia</h2>
                    <p className="text-[10px] opacity-50 font-mono">Selecione uma região</p>
                </div>
                <button onClick={() => setMenuAberto(false)} className="md:hidden p-2 hover:bg-white/10 rounded">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {mapas.length === 0 ? (
                    <p className="text-sm opacity-50 text-center py-10">Nenhum mapa descoberto.</p>
                ) : (
                    mapas.map((mapa) => (
                        <button
                            key={mapa.id}
                            onClick={() => setMapaSelecionado(mapa)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all group relative overflow-hidden ${
                                mapaSelecionado?.id === mapa.id 
                                ? `border-${theme.primary.split('-')[1]}-500 bg-white/5` 
                                : 'border-transparent hover:bg-white/5 hover:border-white/10'
                            }`}
                        >
                            <span className="relative z-10 font-bold uppercase text-sm">{mapa.nome}</span>
                            {mapaSelecionado?.id === mapa.id && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bgAttr}`}></div>
                            )}
                        </button>
                    ))
                )}
            </div>
            
            <div className="p-4 border-t border-current/10">
                <button onClick={() => router.push("/")} className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-colors">
                    ← Voltar ao Menu
                </button>
            </div>
        </div>

        {/* --- VISUALIZADOR DE MAPA --- */}
        <div className="flex-1 relative bg-black/90 overflow-hidden flex items-center justify-center">
            
            {!menuAberto && (
                <button 
                    onClick={() => setMenuAberto(true)}
                    className={`absolute top-6 left-6 z-30 p-3 rounded-lg shadow-xl ${theme.button} text-white font-bold animate-in slide-in-from-left-10`}
                >
                    🗺️ MAPAS
                </button>
            )}

            {mapaSelecionado ? (
                <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* CONTROLES DE ZOOM */}
                            <div className="absolute bottom-8 right-8 z-30 flex flex-col gap-2">
                                <button onClick={() => zoomIn()} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xl font-bold flex items-center justify-center transition-transform active:scale-90" title="Zoom In">+</button>
                                <button onClick={() => zoomOut()} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xl font-bold flex items-center justify-center transition-transform active:scale-90" title="Zoom Out">-</button>
                                <button onClick={() => resetTransform()} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center justify-center transition-transform active:scale-90" title="Resetar">⟲</button>
                                <button onClick={() => setMenuAberto(!menuAberto)} className={`mt-4 w-10 h-10 rounded-full ${menuAberto ? 'bg-white/10' : 'bg-green-600'} hover:opacity-80 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center justify-center transition-colors`}>
                                    {menuAberto ? '↔' : '☰'}
                                </button>
                            </div>

                            {/* IMAGEM COM ZOOM */}
                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                                <img 
                                    src={mapaSelecionado.imagem_url || "/placeholder_map.jpg"} 
                                    alt={mapaSelecionado.nome} 
                                    className="max-w-none shadow-2xl"
                                    style={{ maxHeight: '90vh', objectFit: 'contain' }}
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            ) : (
                <div className="text-center opacity-30">
                    <p className="text-4xl mb-4">🗺️</p>
                    <p>Selecione um mapa para explorar</p>
                </div>
            )}
        </div>
      </div>
    </PageWrapper>
  );
}