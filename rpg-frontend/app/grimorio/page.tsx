"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { useTheme } from "../../components/contexts/ThemeContext";
// 1. IMPORTAR NOTIFICAÇÃO
import { useNotification } from "../../components/contexts/NotificationContext";

export default function GrimorioPage() {
  const router = useRouter();
  const { theme } = useTheme();
  // 2. USAR O HOOK
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [magias, setMagias] = useState<any[]>([]);
  const [personagem, setPersonagem] = useState<any>(null);
  
  const [detalhesMagia, setDetalhesMagia] = useState<any>(null);

  useEffect(() => {
    async function carregarTudo() {
      const userId = localStorage.getItem("user_id");
      if (!userId) { 
          router.push("/login"); 
          return; 
      }

      try {
        const resChar = await fetch("http://127.0.0.1:5000/meu-personagem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (resChar.status === 200) {
          const charData = await resChar.json();
          setPersonagem(charData);
          carregarMagias(charData.id);
        } else {
          // 3. MENSAGEM TEMÁTICA DE BLOQUEIO
          showNotification("O Grimório permanece selado. Você deve forjar sua lenda (Ficha) antes de ler estas páginas.", "erro");
          router.push("/ficha");
        }
      } catch (error) { 
          console.error(error); 
      }
    }
    carregarTudo();
  }, []);

  async function carregarMagias(charId: number) {
    const res = await fetch(`http://127.0.0.1:5000/meu-grimorio/${charId}`);
    if (res.ok) {
      const data = await res.json();
      setMagias(data);
    }
    setLoading(false);
  }

  async function uparMagia(e: any, nomeMagia: string) {
    e.stopPropagation(); 
    if (!personagem) return;
    
    try {
      const res = await fetch(`http://127.0.0.1:5000/habilidades/${personagem.id}/${nomeMagia}`, { method: "PUT" });
      const data = await res.json();
      
      if (res.status === 200) {
        // 4. MENSAGEM DE SUCESSO ÉPICA
        showNotification(`✨ O éter responde ao seu chamado! ${nomeMagia} evoluiu.`, "sucesso");
        carregarMagias(personagem.id);
      } else {
        // 5. MENSAGEM DE ERRO IMERSIVA
        showNotification(`🚫 Sua mente falha... ${data.erro || "Insuficiente."}`, "erro");
      }
    } catch (error) { 
        showNotification("Os ventos da magia estão parados (Erro de Conexão).", "erro"); 
    }
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} flex items-center justify-center ${theme.text} font-mono text-2xl animate-pulse`}>Decifrando Runas...</div>;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6 w-full relative z-10">
        
        {/* CABEÇALHO */}
        <div className={`flex justify-between items-center mb-8 border-b ${theme.border} pb-4 ${theme.panel} px-6 py-4 rounded-xl shadow-lg`}>
          <div className="flex items-center gap-6">
             <button onClick={() => router.push("/")} className={`group flex items-center gap-2 opacity-70 hover:opacity-100 transition-colors px-3 py-2 rounded-lg hover:bg-white/5`} title="Voltar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
             </button>
             <div className="h-8 w-px bg-current opacity-20"></div>
             <div>
                <h1 className={`text-3xl font-black uppercase tracking-wide ${theme.primary}`}>🔮 Grimório</h1>
                <p className="text-xs opacity-60 font-mono uppercase tracking-widest mt-1">Arcanista: <span className="font-bold">{personagem?.nome}</span></p>
             </div>
          </div>
        </div>

        {/* GRID DE MAGIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {magias.length === 0 ? (
            <div className={`col-span-full text-center py-20 ${theme.panel} rounded-xl border-2 border-dashed ${theme.border} opacity-70`}>
                <p className="text-xl font-light">Seu grimório está vazio.</p>
                <p className="text-sm mt-2 opacity-60">Sua jornada mágica ainda não começou.</p>
            </div>
          ) : (
            magias.map((magia) => (
              <div 
                key={magia.id_vinculo} 
                onClick={() => setDetalhesMagia(magia)} 
                className={`${theme.panel} p-5 rounded-xl border ${theme.border} shadow-lg hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between group min-h-[180px] cursor-pointer hover:border-opacity-100`}
              >
                <div>
                    <div className="flex justify-between items-start gap-3 mb-3">
                        <h3 className={`text-xl font-bold leading-tight ${theme.text} group-hover:${theme.primary} transition-colors`}>{magia.nome}</h3>
                        <span className={`shrink-0 whitespace-nowrap text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${theme.bg === 'bg-[#f8fafc]' ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-black/40 text-white/80 border-white/10'}`}>
                            Nível {magia.nivel}
                        </span>
                    </div>
                    <p className={`text-sm mb-4 min-h-[40px] line-clamp-3 opacity-70 leading-relaxed`}>{magia.descricao}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4 border-t border-current/10 pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1 rounded bg-current/5">{magia.tipo}</span>
                  
                  <button 
                    onClick={(e) => uparMagia(e, magia.nome)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 font-bold text-xs uppercase tracking-wide z-10"
                  >
                    <span>Evoluir</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                  </button>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL DE DETALHES --- */}
      {detalhesMagia && (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setDetalhesMagia(null)}
        >
            <div 
                className={`${theme.panel} p-8 rounded-2xl max-w-2xl w-full border-2 ${theme.border} shadow-2xl relative overflow-y-auto max-h-[80vh] animate-in zoom-in-95`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6 border-b border-current/10 pb-4">
                    <div>
                        <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded bg-current/5 opacity-70 mb-2 inline-block border border-current/10`}>
                            {detalhesMagia.tipo}
                        </span>
                        <h2 className={`text-3xl md:text-4xl font-black uppercase ${theme.primary} leading-none`}>
                            {detalhesMagia.nome}
                        </h2>
                    </div>
                    <button 
                        onClick={() => setDetalhesMagia(null)} 
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-2xl leading-none opacity-70 hover:opacity-100"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className={`text-xs font-black opacity-50 uppercase tracking-widest mb-2 ${theme.text}`}>Descrição Resumida</h3>
                        <p className={`text-lg italic opacity-90 border-l-4 pl-4 py-1 ${theme.border} ${theme.text}`}>
                            {detalhesMagia.descricao}
                        </p>
                    </div>

                    {detalhesMagia.detalhes ? (
                        <div className="bg-black/5 p-6 rounded-xl border border-current/10 shadow-inner">
                            <h3 className={`text-xs font-black opacity-50 uppercase tracking-widest mb-4 flex items-center gap-2 ${theme.text}`}>
                                <span>📜</span> Detalhes & Regras
                            </h3>
                            <div className={`leading-relaxed whitespace-pre-wrap text-sm md:text-base opacity-90 ${theme.text}`}>
                                {detalhesMagia.detalhes}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center opacity-40 text-sm italic">Sem detalhes adicionais registrados no grimório.</p>
                    )}
                </div>

                <div className="mt-8 text-right">
                    <button 
                        onClick={() => setDetalhesMagia(null)}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform bg-gradient-to-r ${theme.button}`}
                    >
                        ENTENDIDO
                    </button>
                </div>
            </div>
        </div>
      )}

    </PageWrapper>
  );
}