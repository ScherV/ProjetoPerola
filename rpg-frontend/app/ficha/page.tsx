"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground"; // Importando o fundo

export default function FichaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Dados do Personagem e Classes
  const [personagem, setPersonagem] = useState<any>(null);
  const [listaClasses, setListaClasses] = useState<any[]>([]);
  
  // Formulário de Criação
  const [showModal, setShowModal] = useState(false);
  const [nomeChar, setNomeChar] = useState("");
  const [historiaChar, setHistoriaChar] = useState("");
  const [classeSelecionada, setClasseSelecionada] = useState("");

  // --- 1. BUSCAR DADOS AO CARREGAR ---
  useEffect(() => {
    async function carregarDados() {
      const userId = localStorage.getItem("user_id");
      if (!userId) { 
        router.push("/login"); 
        return; 
      }

      try {
        // Busca a ficha do usuário
        const resFicha = await fetch("http://127.0.0.1:5000/meu-personagem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (resFicha.status === 200) {
          setPersonagem(await resFicha.json());
        }

        // Busca as classes disponíveis para o formulário
        const resClasses = await fetch("http://127.0.0.1:5000/classes");
        if (resClasses.ok) {
          setListaClasses(await resClasses.json());
        }

      } catch (error) {
        console.error("Erro de conexão:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // --- 2. CRIAR PERSONAGEM ---
  async function handleCriarPersonagem(e: any) {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");

    if (!classeSelecionada) {
        alert("Escolha uma classe!");
        return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/criar-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nome: nomeChar,
          historia: historiaChar,
          classe_id: Number(classeSelecionada)
        }),
      });

      if (response.status === 201) {
        alert("Personagem criado com sucesso!");
        window.location.reload(); // Recarrega a página
      } else {
        const erro = await response.json();
        alert("Erro: " + erro.erro);
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10 flex items-center justify-center">Carregando destino...</div>;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white font-sans overflow-hidden">
      
      {/* Fundo de Partículas */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-purple-500 drop-shadow-md">📜 Minha Ficha</h1>
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white transition-colors">Voltar</button>
        </div>

        {personagem ? (
          // --- CENÁRIO 1: FICHA DO PERSONAGEM ---
          <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-xl border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                  {personagem.nome}
                </h2>
                <p className="text-xl text-slate-300 font-mono border-l-4 border-purple-500 pl-3">
                  {personagem.classe}
                </p>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-bold border shadow-lg ${personagem.is_dead ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-green-900/50 text-green-400 border-green-800'}`}>
                {personagem.is_dead ? "💀 MORTO" : "❤️ VIVO"}
              </div>
            </div>
            
            <hr className="my-8 border-slate-700"/>
            
            {/* Biografia */}
            <div className="bg-black/30 p-6 rounded-lg border border-white/10">
                <h3 className="font-bold text-lg mb-3 text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   📖 Biografia
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {personagem.historia || "A história deste herói ainda não foi escrita..."}
                </p>
            </div>

            {/* Botão para Atributos (Futuro) */}
            <button 
              onClick={() => router.push("/ficha/atributos")}
              className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
            >
              📊 Distribuir Pontos & Atributos
            </button>

          </div>
        ) : (
          // --- CENÁRIO 2: SEM PERSONAGEM ---
          <div className="text-center py-20 bg-slate-900/80 backdrop-blur-md rounded-xl border border-dashed border-slate-700 shadow-xl">
            <h2 className="text-2xl text-slate-300 mb-4 font-light">Sua alma vaga sem corpo...</h2>
            <p className="text-slate-500 mb-8">Você ainda não encarnou neste mundo.</p>
            
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ✨ Criar Novo Personagem
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL DE CRIAÇÃO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl relative">
            
            <h2 className="text-2xl font-bold mb-6 text-white">Novo Herói</h2>
            
            <form onSubmit={handleCriarPersonagem} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input required value={nomeChar} onChange={e => setNomeChar(e.target.value)} className="w-full p-3 rounded bg-slate-950 border border-slate-700 text-white focus:border-purple-500 outline-none" placeholder="Ex: Gandalf" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Classe</label>
                <select 
                    required
                    value={classeSelecionada}
                    onChange={e => setClasseSelecionada(e.target.value)}
                    className="w-full p-3 rounded bg-slate-950 border border-slate-700 text-white focus:border-purple-500 outline-none appearance-none"
                >
                    <option value="">-- Selecione --</option>
                    {listaClasses.map((classe) => (
                        <option key={classe.id} value={classe.id}>
                            {classe.nome}
                        </option>
                    ))}
                </select>
                {classeSelecionada && (
                    <div className="mt-2 p-2 bg-purple-900/30 rounded border border-purple-500/30 text-xs text-purple-200">
                        {listaClasses.find(c => c.id == classeSelecionada)?.descricao}
                    </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">História</label>
                <textarea rows={3} value={historiaChar} onChange={e => setHistoriaChar(e.target.value)} className="w-full p-3 rounded bg-slate-950 border border-slate-700 text-white focus:border-purple-500 outline-none resize-none" placeholder="Origem..." />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 p-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-transform active:scale-95">Nascer!</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}