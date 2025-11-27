"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { useTheme } from "../../components/contexts/ThemeContext";

export default function GrimorioPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [magias, setMagias] = useState<any[]>([]);
  const [personagem, setPersonagem] = useState<any>(null);

  useEffect(() => {
    async function carregarTudo() {
      const userId = localStorage.getItem("user_id");
      if (!userId) { router.push("/login"); return; }

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
          alert("Você precisa criar um personagem primeiro!");
          router.push("/ficha");
        }
      } catch (error) { console.error(error); }
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

  async function uparMagia(nomeMagia: string) {
    if (!personagem) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/habilidades/${personagem.id}/${nomeMagia}`, { method: "PUT" });
      const data = await res.json();
      if (res.status === 200) {
        alert(`✨ ${data.mensagem}`);
        carregarMagias(personagem.id);
      } else {
        alert(`🚫 ${data.erro}\n${data.detalhe || ""}`);
      }
    } catch (error) { alert("Erro de conexão"); }
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} flex items-center justify-center ${theme.text} font-mono text-2xl animate-pulse`}>Abrindo Grimório...</div>;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6 w-full">
        
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
                <p className="text-xs opacity-60 font-mono uppercase tracking-widest mt-1">User: <span className="font-bold">{personagem?.nome}</span></p>
             </div>
          </div>
        </div>

        {/* GRID DE MAGIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {magias.length === 0 ? (
            <div className={`col-span-full text-center py-20 ${theme.panel} rounded-xl border-2 border-dashed ${theme.border} opacity-70`}>
                <p className="text-xl font-light">Seu grimório está vazio.</p>
                <p className="text-sm mt-2 opacity-60">Visite a loja ou fale com o Mestre.</p>
            </div>
          ) : (
            magias.map((magia) => (
              <div key={magia.id_vinculo} className={`${theme.panel} p-5 rounded-xl border ${theme.border} shadow-lg hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between group min-h-[180px]`}>
                
                {/* Topo do Card */}
                <div>
                    <div className="flex justify-between items-start gap-3 mb-3">
                        <h3 className={`text-xl font-bold leading-tight ${theme.text}`}>{magia.nome}</h3>
                        <span className={`shrink-0 whitespace-nowrap text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${theme.bg === 'bg-[#f8fafc]' ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-black/40 text-white/80 border-white/10'}`}>
                            Nível {magia.nivel}
                        </span>
                    </div>
                    <p className={`text-sm mb-4 min-h-[40px] line-clamp-3 opacity-70 leading-relaxed`}>{magia.descricao}</p>
                </div>
                
                {/* Rodapé do Card */}
                <div className="flex justify-between items-center mt-4 border-t border-current/10 pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-2 py-1 rounded bg-current/5">{magia.tipo}</span>
                  
                  {/* BOTÃO DE EVOLUIR CORRIGIDO (Sólido e Visível) */}
                  <button 
                    onClick={() => uparMagia(magia.nome)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 font-bold text-xs uppercase tracking-wide"
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
    </PageWrapper>
  );
}