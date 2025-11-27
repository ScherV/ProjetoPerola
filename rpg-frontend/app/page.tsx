"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../components/PageWrapper";
import { useTheme } from "../components/contexts/ThemeContext";

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [user, setUser] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [loading, setLoading] = useState(true);

  const [qtd, setQtd] = useState(1);
  const [faces, setFaces] = useState(20);
  const [bonus, setBonus] = useState(0);
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("rpg_user");
    const storedMaster = localStorage.getItem("is_master");
    const userId = localStorage.getItem("user_id");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(storedUser);
    setIsMaster(storedMaster === "true");

    if (userId) {
      fetch("http://127.0.0.1:5000/meu-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      .then(res => {
        if (res.status === 200) setHasCharacter(true);
      })
      .catch(err => console.error("Erro ao buscar personagem", err))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function rolarDado() {
    try {
      const response = await fetch("http://127.0.0.1:5000/rolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qtd: Number(qtd), faces: Number(faces), bonus: Number(bonus) }),
      });
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error("Erro:", error);
    }
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono animate-pulse text-2xl`}>Carregando...</div>;

  return (
    <PageWrapper>
      {/* Restaurei max-w-6xl para o tamanho que você gostava */}
      <main className={`p-6 max-w-6xl mx-auto ${hasCharacter ? "grid grid-cols-1 md:grid-cols-2 gap-8 items-start" : "flex flex-col items-center justify-center min-h-[70vh]"}`}>
        
        {/* --- COLUNA 1: PAINEL DE BOTÕES --- */}
        <section className={`space-y-6 transition-all duration-500 ${!hasCharacter ? "w-full max-w-md" : "w-full"}`}>
          {/* Voltei para p-6 (tamanho médio) */}
          <div className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} shadow-2xl`}>
            
            <div className="flex items-center gap-3 mb-6 border-b border-current/10 pb-4">
                <span className="text-3xl">{isMaster ? "🛡️" : "⚔️"}</span>
                <div>
                    <h2 className={`text-2xl font-black uppercase tracking-wider ${theme.primary}`}>
                    {isMaster ? "Mestre" : "Jogador"}
                    </h2>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {isMaster ? (
                <>
                  <button onClick={() => alert("Em breve")} className="group p-4 bg-black/5 hover:bg-black/10 rounded-lg text-left border-l-4 border-red-500 transition-all hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-red-500 transition-colors">Gerenciar NPCs</h3>
                    <p className="text-sm opacity-60">Criar fichas de inimigos</p>
                  </button>
                  <button onClick={() => router.push("/mapas")} className="group p-4 bg-black/5 hover:bg-black/10 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-yellow-500 transition-colors">Mapa Mundi</h3>
                    <p className="text-sm opacity-60">Visualizar cartografia global</p>
                  </button>
                  <button onClick={() => router.push("/mestre")} className="group p-4 bg-black/5 hover:bg-black/10 rounded-lg text-left border-l-4 border-purple-500 transition-all hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-purple-500 transition-colors">Todas as Fichas</h3>
                    <p className="text-sm opacity-60">Gerenciar jogadores</p>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push("/ficha")} className="group p-4 bg-black/5 hover:bg-black/10 rounded-lg text-left border-l-4 border-blue-500 transition-all hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-blue-500 transition-colors">Minha Ficha</h3>
                    <p className="text-sm opacity-60">Status, Biografia e Atributos</p>
                  </button>
                  <button onClick={() => router.push("/grimorio")} className="group p-4 bg-black/5 hover:bg-black/10 rounded-lg text-left border-l-4 border-green-500 transition-all hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-green-500 transition-colors">Meu Grimório</h3>
                    <p className="text-sm opacity-60">Consultar e lançar magias</p>
                  </button>
                  <button onClick={() => router.push("/mapas")} className="group p-4 bg-black/5 hover:bg-black/10 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-yellow-500 transition-colors">Mapas</h3>
                    <p className="text-sm opacity-60">Locais descobertos</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- COLUNA 2: ROLADOR DE DADOS --- */}
        {hasCharacter && (
        <section className="animate-in fade-in slide-in-from-right-10 duration-500">
          <div className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} sticky top-24 shadow-xl`}>
            
            <div className="flex items-center gap-3 mb-6 border-b border-current/10 pb-4">
                <span className="text-3xl">🎲</span>
                <div>
                    <h2 className={`text-2xl font-black uppercase tracking-wider ${theme.primary}`}>
                        Dados Rápidos
                    </h2>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">Sistema D20</p>
                </div>
            </div>
            
            <div className="flex gap-2 mb-6 justify-center">
              <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Qtd</span>
                  <input type="number" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className="w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold focus:border-current outline-none transition-all" />
              </div>
              <span className="self-center text-xl font-bold opacity-30 mt-4">d</span>
              <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Faces</span>
                  <input type="number" value={faces} onChange={(e) => setFaces(Number(e.target.value))} className="w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold focus:border-current outline-none transition-all" />
              </div>
              <span className="self-center text-xl font-bold opacity-30 mt-4">+</span>
              <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Bônus</span>
                  <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold focus:border-current outline-none transition-all" />
              </div>
            </div>

            <button onClick={rolarDado} className={`w-full bg-gradient-to-r ${theme.button} font-black text-lg py-3 rounded-lg shadow-md transform active:scale-95 transition-all uppercase tracking-widest`}>
              ROLAR
            </button>

            {resultado && (
              <div className="mt-6 p-4 bg-black/10 rounded-xl border border-current/10 text-center animate-in zoom-in duration-200">
                {/* SEM AS LINHAS ESTRANHAS AQUI */}
                <p className="text-xs opacity-60 mb-1 font-mono uppercase tracking-wider">
                  {resultado.formula}
                </p>
                
                <div className={`text-6xl font-black my-1 tracking-tighter ${resultado.critico ? "text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" : ""}`}>
                  {resultado.totalFinal}
                </div>
                
                <div className="text-[10px] font-mono opacity-50 mt-1">
                   [{resultado.rolagensIndividuais?.join(", ")}] Mod: {resultado.somaDados - (resultado.rolagensIndividuais?.reduce((a:any,b:any)=>a+b,0) || 0)}
                </div>

                {resultado.critico && <div className="text-yellow-600 font-black text-sm mt-3 animate-bounce uppercase tracking-widest border border-yellow-500/50 inline-block px-3 py-0.5 rounded bg-yellow-500/10">🔥 Crítico 🔥</div>}
                {resultado.falhaCritica && <div className="text-red-600 font-black text-sm mt-3 animate-pulse uppercase tracking-widest border border-red-500/50 inline-block px-3 py-0.5 rounded bg-red-500/10">💀 Falha Crítica 💀</div>}
              </div>
            )}
          </div>
        </section>
        )}

      </main>
    </PageWrapper>
  );
}