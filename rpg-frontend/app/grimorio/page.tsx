"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GrimorioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [magias, setMagias] = useState<any[]>([]);
  const [personagem, setPersonagem] = useState<any>(null);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    async function carregarTudo() {
      const userId = localStorage.getItem("user_id");
      if (!userId) { router.push("/login"); return; }

      try {
        // 1. Descobre quem é o personagem do usuário
        const resChar = await fetch("http://127.0.0.1:5000/meu-personagem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (resChar.status === 200) {
          const charData = await resChar.json();
          setPersonagem(charData);

          // 2. Busca o Grimório desse personagem
          carregarMagias(charData.id);
        } else {
          alert("Você precisa criar um personagem primeiro!");
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

  // --- FUNÇÃO DE UPAR (Com Regra da Média) ---
  async function uparMagia(nomeMagia: string) {
    if (!personagem) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/habilidades/${personagem.id}/${nomeMagia}`, {
        method: "PUT"
      });

      const data = await res.json();

      if (res.status === 200) {
        alert(`✨ ${data.mensagem}`);
        carregarMagias(personagem.id); // Atualiza a tela
      } else {
        // Mostra o erro da regra da média
        alert(`🚫 ${data.erro}\n${data.detalhe || ""}`);
      }
    } catch (error) {
      alert("Erro de conexão");
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-10">Abrindo Grimório...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-500">🔮 Grimório</h1>
            <p className="text-slate-400 text-sm">Conhecimento Arcano de <span className="text-white font-bold">{personagem?.nome}</span></p>
          </div>
          <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white">Voltar</button>
        </div>

        {/* Lista de Magias */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {magias.length === 0 ? (
            <p className="text-slate-500">Você ainda não aprendeu nenhuma magia.</p>
          ) : (
            magias.map((magia) => (
              <div key={magia.id_vinculo} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-lg hover:border-purple-500/50 transition-all">
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{magia.nome}</h3>
                  <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded border border-purple-700">
                    Nível {magia.nivel}
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm mb-4 min-h-[40px]">{magia.descricao}</p>
                
                <div className="flex justify-between items-center mt-4 border-t border-slate-800 pt-4">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{magia.tipo}</span>
                  
                  <button 
                    onClick={() => uparMagia(magia.nome)}
                    className="flex items-center gap-2 bg-green-900/20 text-green-400 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg transition-all border border-green-900/50"
                  >
                    <span>Upar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}