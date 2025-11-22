"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  // Estados do Usuário
  const [user, setUser] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Estados do Dado (Mantidos)
  const [qtd, setQtd] = useState(1);
  const [faces, setFaces] = useState(20);
  const [bonus, setBonus] = useState(0);
  const [resultado, setResultado] = useState<any>(null);

  // --- 1. VERIFICAÇÃO DE LOGIN (Ao carregar a página) ---
  useEffect(() => {
    const storedUser = localStorage.getItem("rpg_user");
    const storedMaster = localStorage.getItem("is_master");

    if (!storedUser) {
      // Se não tem usuário salvo, chuta pro login
      router.push("/login");
    } else {
      setUser(storedUser);
      // O localStorage salva tudo como texto ("true"/"false"), precisamos converter
      setIsMaster(storedMaster === "true"); 
      setLoading(false);
    }
  }, []);

  // Função de Logout
  function handleLogout() {
    localStorage.clear(); // Limpa os dados
    router.push("/login"); // Manda pro login
  }

  // Função de Rolar Dado (A mesma de antes)
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

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10">Carregando Grimório...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* --- CABEÇALHO (Navbar) --- */}
      <nav className="bg-slate-900 p-4 border-b border-purple-900/50 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-purple-400">Pérola, O Ultimo Relógio</h1>
          <p className="text-sm text-slate-400">
            Logado como: <span className="text-white font-bold">{user}</span> 
            {isMaster ? <span className="ml-2 px-2 py-0.5 bg-red-900 text-red-200 text-xs rounded border border-red-700">MESTRE</span> : <span className="ml-2 px-2 py-0.5 bg-blue-900 text-blue-200 text-xs rounded border border-blue-700">JOGADOR</span>}
          </p>
        </div>
        <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white hover:underline">
          Sair
        </button>
      </nav>

      <main className="p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- COLUNA 1: PAINEL ESPECÍFICO (Muda conforme quem logou) --- */}
        <section className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {isMaster ? "🛡️ Painel do Mestre" : "⚔️ Painel do Jogador"}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {isMaster ? (
                // BOTÕES DO MESTRE
                <>
                  <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border-l-4 border-red-500 transition-all">
                    <h3 className="font-bold">Gerenciar NPCs</h3>
                    <p className="text-sm text-slate-400">Criar ou editar fichas de inimigos</p>
                  </button>
                  <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border-l-4 border-yellow-500 transition-all">
                    <h3 className="font-bold">Mapa Mundi</h3>
                    <p className="text-sm text-slate-400">Visualizar e editar o mapa global</p>
                  </button>
                  <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border-l-4 border-purple-500 transition-all">
                    <h3 className="font-bold">Todas as Fichas</h3>
                    <p className="text-sm text-slate-400">Ver fichas de todos os jogadores</p>
                  </button>
                </>
              ) : (
                // BOTÕES DO JOGADOR
                <>
                  <button 
                    onClick={() => router.push("/ficha")} // <--- ADICIONADO AQUI!
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border-l-4 border-blue-500 transition-all"
                  >
                    <h3 className="font-bold">Minha Ficha</h3>
                    <p className="text-sm text-slate-400">Ver atributos, história e status</p>
                  </button>

                  <button 
                    onClick={() => alert("Em breve: Grimório de Magias!")} 
                    className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border-l-4 border-green-500 transition-all"
                  >
                    <h3 className="font-bold">Meu Grimório</h3>
                    <p className="text-sm text-slate-400">Consultar e lançar magias</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- COLUNA 2: ROLADOR DE DADOS (Comum a todos) --- */}
        <section>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-6">
            <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              🎲 Dados Rápidos
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input type="number" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className="w-16 p-2 rounded bg-slate-800 border border-slate-600 text-center" placeholder="Qtd" />
              <span className="self-center font-bold">d</span>
              <input type="number" value={faces} onChange={(e) => setFaces(Number(e.target.value))} className="w-16 p-2 rounded bg-slate-800 border border-slate-600 text-center" placeholder="Lados" />
              <span className="self-center font-bold">+</span>
              <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-16 p-2 rounded bg-slate-800 border border-slate-600 text-center" placeholder="Bônus" />
            </div>

            <button onClick={rolarDado} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition-all">
              ROLAR
            </button>

            {resultado && (
              <div className="mt-4 p-4 bg-slate-950 rounded border border-purple-500/30 text-center">
                <div className="text-4xl font-bold text-white">{resultado.totalFinal}</div>
                <div className="text-xs text-slate-400 mt-1">{resultado.formula} : [{resultado.rolagensIndividuais.join(", ")}]</div>
                {resultado.critico && <div className="text-yellow-400 font-bold text-sm mt-1">CRÍTICO!</div>}
                {resultado.falhaCritica && <div className="text-red-500 font-bold text-sm mt-1">FALHA!</div>}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}