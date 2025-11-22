"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FichaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [personagem, setPersonagem] = useState<any>(null);
  
  // Estados para o Formulário de Criação
  const [showModal, setShowModal] = useState(false);
  const [nomeChar, setNomeChar] = useState("");
  const [historiaChar, setHistoriaChar] = useState("");

  // 1. Função de Busca (A mesma de antes)
  async function buscarFicha() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/meu-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setPersonagem(data);
      } else {
        setPersonagem(null);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarFicha();
  }, []);

  // 2. Função de Criação (NOVA!)
  async function handleCriarPersonagem(e: any) {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");

    try {
      const response = await fetch("http://127.0.0.1:5000/criar-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nome: nomeChar,
          historia: historiaChar
        }),
      });

      if (response.status === 201) {
        alert("Personagem criado com sucesso!");
        setShowModal(false); // Fecha o modal
        buscarFicha(); // Recarrega a tela para mostrar a ficha nova
      } else {
        const erro = await response.json();
        alert("Erro: " + erro.erro);
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10">Consultando os astros...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-500">📜 Minha Ficha</h1>
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white">Voltar</button>
        </div>

        {/* Conteúdo Principal */}
        {personagem ? (
          // --- VISUAL DA FICHA ---
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl animate-in fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">{personagem.nome}</h2>
                <p className="text-xl text-slate-300 font-mono border-l-4 border-purple-500 pl-3">{personagem.classe}</p>
              </div>
              <div className="bg-green-900/50 text-green-400 px-4 py-2 rounded-full text-sm font-bold border border-green-800 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                {personagem.is_dead ? "💀 MORTO" : "❤️ VIVO"}
              </div>
            </div>
            
            <hr className="my-8 border-slate-800"/>
            
            <div className="bg-slate-950/50 p-6 rounded-lg border border-slate-800/50">
                <h3 className="font-bold text-lg mb-4 text-slate-400 uppercase tracking-wider">Biografia</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{personagem.historia || "Sem história definida."}</p>
            </div>
          </div>
        ) : (
          // --- TELA DE "SEM PERSONAGEM" ---
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
            <h2 className="text-2xl text-slate-300 mb-4">Sua alma vaga sem corpo...</h2>
            <p className="text-slate-500 mb-8">Você ainda não possui um personagem vivo neste mundo.</p>
            
            <button 
              onClick={() => setShowModal(true)} // Abre o Modal
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Criar Novo Personagem
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL DE CRIAÇÃO (Janela Flutuante) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Novo Herói</h2>
            
            <form onSubmit={handleCriarPersonagem} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome do Personagem</label>
                <input 
                  required
                  value={nomeChar}
                  onChange={e => setNomeChar(e.target.value)}
                  className="w-full p-3 rounded bg-slate-950 border border-slate-700 text-white focus:border-purple-500 outline-none"
                  placeholder="Ex: Gandalf, o Cinzento"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">História / Origem</label>
                <textarea 
                  rows={4}
                  value={historiaChar}
                  onChange={e => setHistoriaChar(e.target.value)}
                  className="w-full p-3 rounded bg-slate-950 border border-slate-700 text-white focus:border-purple-500 outline-none resize-none"
                  placeholder="Conte brevemente seu passado..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 p-3 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Nascer!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}