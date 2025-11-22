"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  const [user, setUser] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dados do Rolador
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

  function handleLogout() {
    localStorage.clear();
    router.push("/login");
  }

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

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10 flex items-center justify-center">Carregando Grimório...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* --- CABEÇALHO --- */}
      <nav className="bg-slate-900 p-4 border-b border-purple-900/50 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            🔮 Grimório RPG
          </h1>
          <p className="text-sm text-slate-400">
            Logado como: <span className="text-white font-bold">{user}</span> 
            {isMaster ? <span className="ml-2 px-2 py-0.5 bg-red-900 text-red-200 text-xs rounded border border-red-700">MESTRE</span> : <span className="ml-2 px-2 py-0.5 bg-blue-900 text-blue-200 text-xs rounded border border-blue-700">JOGADOR</span>}
          </p>
        </div>
        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">
          Sair
        </button>
      </nav>

      {/* --- CONTEÚDO PRINCIPAL (Layout Dinâmico) --- */}
      <main className={`p-6 max-w-6xl mx-auto ${hasCharacter ? "grid grid-cols-1 md:grid-cols-2 gap-8 items-start" : "flex flex-col items-center justify-center min-h-[80vh]"}`}>
        
        {/* --- COLUNA 1: PAINEL DE BOTÕES --- */}
        <section className={`space-y-6 transition-all duration-500 ${!hasCharacter ? "w-full max-w-md" : "w-full"}`}>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              {isMaster ? "🛡️ Painel do Mestre" : "⚔️ Painel do Jogador"}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {isMaster ? (
                <>
                  <button onClick={() => alert("Em breve")} className="group p-4 bg-slate-800 hover:bg-slate-750 rounded-lg text-left border-l-4 border-red-500 transition-all hover:shadow-lg hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-red-400 transition-colors">Gerenciar NPCs</h3>
                    <p className="text-sm text-slate-400">Criar ou editar fichas de inimigos</p>
                  </button>
                  <button onClick={() => alert("Em breve")} className="group p-4 bg-slate-800 hover:bg-slate-750 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:shadow-lg hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-yellow-400 transition-colors">Mapa Mundi</h3>
                    <p className="text-sm text-slate-400">Visualizar e editar o mapa global</p>
                  </button>
                  <button onClick={() => router.push("/mestre")} className="group p-4 bg-slate-800 hover:bg-slate-750 rounded-lg text-left border-l-4 border-purple-500 transition-all hover:shadow-lg hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-purple-400 transition-colors">Todas as Fichas</h3>
                    <p className="text-sm text-slate-400">Ver fichas de todos os jogadores</p>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push("/ficha")} className="group p-4 bg-slate-800 hover:bg-slate-750 rounded-lg text-left border-l-4 border-blue-500 transition-all hover:shadow-lg hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-blue-400 transition-colors">Minha Ficha</h3>
                    <p className="text-sm text-slate-400">Ver atributos, história e status</p>
                  </button>
                  <button onClick={() => router.push("/grimorio")} className="group p-4 bg-slate-800 hover:bg-slate-750 rounded-lg text-left border-l-4 border-green-500 transition-all hover:shadow-lg hover:translate-x-1">
                    <h3 className="font-bold group-hover:text-green-400 transition-colors">Meu Grimório</h3>
                    <p className="text-sm text-slate-400">Consultar e lançar magias</p>
                  </button>
                  {/* Botão Futuro de Mapa */}
                  <button onClick={() => alert("Em breve: Mapas Desbloqueados")} className="group p-4 bg-slate-800 hover:bg-slate-750 rounded-lg text-left border-l-4 border-yellow-600 transition-all hover:shadow-lg hover:translate-x-1 opacity-80 hover:opacity-100">
                    <h3 className="font-bold group-hover:text-yellow-400 transition-colors">Mapas</h3>
                    <p className="text-sm text-slate-400">Locais descobertos</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- COLUNA 2: ROLADOR DE DADOS (Condicional) --- */}
        {hasCharacter && (
        <section className="animate-in fade-in slide-in-from-right-10 duration-500">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-24 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              🎲 Dados Rápidos
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input type="number" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className="w-16 p-2 rounded bg-slate-800 border border-slate-600 text-center text-white focus:border-purple-500 outline-none" />
              <span className="self-center font-bold text-slate-500">d</span>
              <input type="number" value={faces} onChange={(e) => setFaces(Number(e.target.value))} className="w-16 p-2 rounded bg-slate-800 border border-slate-600 text-center text-white focus:border-purple-500 outline-none" />
              <span className="self-center font-bold text-slate-500">+</span>
              <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-16 p-2 rounded bg-slate-800 border border-slate-600 text-center text-white focus:border-purple-500 outline-none" />
            </div>

            <button onClick={rolarDado} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg transform active:scale-95">
              ROLAR
            </button>

            {resultado && (
              <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-purple-500/30 text-center animate-in zoom-in duration-300">
                <p className="text-sm text-gray-400 mb-2 font-mono">
                  {resultado.formula} : [{resultado.rolagensIndividuais?.join(", ") || "?"}] 
                </p>
                
                <div className={`text-6xl font-black mt-2 ${resultado.critico ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" : "text-white"}`}>
                  {resultado.totalFinal}
                </div>

                <div className="mt-2 min-h-[24px]">
                  <span className="text-slate-500 text-xs uppercase tracking-widest">Resultado Final</span>
                </div>

                {resultado.critico && <div className="text-yellow-400 font-bold text-sm mt-2 animate-bounce">🔥 CRÍTICO! 🔥</div>}
                {resultado.falhaCritica && <div className="text-red-500 font-bold text-sm mt-2 animate-pulse">💀 FALHA CRÍTICA! 💀</div>}
              </div>
            )}
          </div>
        </section>
        )}

      </main>
    </div>
  );
}