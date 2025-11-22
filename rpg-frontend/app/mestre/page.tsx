"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PainelMestre() {
  const router = useRouter();
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Proteção: Só Mestre entra aqui
    const isMaster = localStorage.getItem("is_master");
    if (isMaster !== "true") {
        alert("Apenas o Mestre pode ver isso!");
        router.push("/");
        return;
    }

    // 2. Busca todos os personagens
    async function carregarTodos() {
      try {
        const res = await fetch("http://127.0.0.1:5000/mestre/personagens");
        const data = await res.json();
        setPersonagens(data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarTodos();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10">Consultando a Bola de Cristal...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 border-b border-red-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500">👁️ Visão do Mestre</h1>
          <p className="text-slate-400 text-sm">Gerenciamento Global de Personagens</p>
        </div>
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white">Voltar</button>
      </div>

      {/* Grid de Personagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personagens.map((char) => (
          <div key={char.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg hover:border-red-500 transition-all group">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">{char.nome}</h3>
                <p className="text-xs text-slate-500">Jogador: <span className="text-slate-300">{char.dono}</span></p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold border ${char.is_dead ? 'bg-red-900/20 text-red-500 border-red-900' : 'bg-green-900/20 text-green-500 border-green-900'}`}>
                {char.is_dead ? "MORTO" : "VIVO"}
              </span>
            </div>

            <div className="mb-4">
                <p className="text-sm text-purple-400 font-mono mb-1">{char.classe}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{char.historia || "Sem história..."}</p>
            </div>

            {/* Botão de Gerenciar (Futuro) */}
            <button 
              onClick={() => alert(`Em breve: Editar ficha de ${char.nome}`)}
              className="w-full py-2 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 text-sm font-bold transition-all border border-slate-700"
            >
              ⚙️ GERENCIAR FICHA
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}