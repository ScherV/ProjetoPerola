"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";
import { useTheme } from "../../components/contexts/ThemeContext"; // Importar Tema

export default function FichaPage() {
  const router = useRouter();
  const { theme, setTheme, currentTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [personagem, setPersonagem] = useState<any>(null);
  const [imagemPerfil, setImagemPerfil] = useState<string | null>(null);
  
  const [listaClasses, setListaClasses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nomeChar, setNomeChar] = useState("");
  const [historiaChar, setHistoriaChar] = useState("");
  const [classeSelecionada, setClasseSelecionada] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function carregarDados() {
      const userId = localStorage.getItem("user_id");
      if (!userId) { router.push("/login"); return; }

      try {
        const resFicha = await fetch("http://127.0.0.1:5000/meu-personagem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (resFicha.status === 200) {
          setPersonagem(await resFicha.json());
          const savedImage = localStorage.getItem(`foto_personagem_${userId}`);
          if (savedImage) setImagemPerfil(savedImage);
        }

        const resClasses = await fetch("http://127.0.0.1:5000/classes");
        if (resClasses.ok) setListaClasses(await resClasses.json());

      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagemPerfil(base64String);
        const userId = localStorage.getItem("user_id");
        if (userId) localStorage.setItem(`foto_personagem_${userId}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleCriarPersonagem(e: any) {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");
    if (!classeSelecionada) { alert("Escolha uma classe!"); return; }

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
        window.location.reload();
      } else {
        const erro = await response.json();
        alert("Erro: " + erro.erro);
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  }

  if (loading) return <div className={`h-screen w-full flex items-center justify-center ${theme.text} ${theme.bg} font-mono animate-pulse text-2xl`}>Carregando Alma...</div>;

  return (
    <div className={`relative min-h-screen w-full ${theme.bg} ${theme.text} font-sans overflow-x-hidden pb-10 transition-colors duration-500`}>
      
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <ParticlesBackground />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        
        {/* CABEÇALHO PADRÃO COM TEMA */}
        <div className={`flex justify-between items-center mb-8 border-b ${theme.border} pb-4 ${theme.panel} px-6 py-4 rounded-xl backdrop-blur-md shadow-lg`}>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push("/")} className="group flex items-center gap-2 opacity-70 hover:opacity-100 transition-colors px-3 py-2 rounded-lg hover:bg-white/5" title="Voltar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
             </button>
            <h1 className={`text-3xl font-black uppercase tracking-wider ${theme.primary}`}>Minha Ficha</h1>
          </div>

          {/* SELETOR DE TEMAS MINI */}
          <div className="flex gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
            {['cosmos', 'finxy', 'exidium', 'fox'].map((t) => (
                <button key={t} onClick={() => setTheme(t as any)} className={`w-3 h-3 rounded-full border transition-all ${currentTheme === t ? 'border-white scale-125' : 'border-transparent opacity-50'}`} style={{ backgroundColor: t === 'cosmos' ? '#9333ea' : t === 'finxy' ? '#facc15' : t === 'exidium' ? '#dc2626' : '#3b82f6' }}></button>
            ))}
          </div>
        </div>

        {personagem ? (
          <div className={`${theme.panel} backdrop-blur-md rounded-2xl border ${theme.border} shadow-2xl overflow-hidden`}>
            
            {/* BANNER */}
            <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                {/* FOTO */}
                <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className={`w-40 h-40 rounded-full border-4 ${theme.border} overflow-hidden shadow-2xl bg-black/50 flex items-center justify-center relative group-hover:border-white transition-all`}>
                        {imagemPerfil ? (
                            <img src={imagemPerfil} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl opacity-50">+</span>
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Alterar Foto</span>
                        </div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                </div>

                {/* DADOS */}
                <div className="flex-1 text-center md:text-left space-y-2 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                        <div>
                            <h2 className={`text-5xl font-black tracking-tight drop-shadow-lg ${theme.text}`}>{personagem.nome}</h2>
                            <p className={`text-xl font-mono uppercase tracking-widest mt-1 flex items-center justify-center md:justify-start gap-2 ${theme.primary}`}>
                                <span className={`w-2 h-2 rounded-full ${theme.bgAttr || 'bg-white'}`}></span>
                                {personagem.classe}
                            </p>
                        </div>
                        
                        <div className={`mt-4 md:mt-0 px-4 py-1.5 rounded-full text-sm font-black border uppercase tracking-widest shadow-lg ${personagem.is_dead ? 'bg-red-900/40 text-red-400 border-red-800' : 'bg-green-900/40 text-green-400 border-green-800'}`}>
                            {personagem.is_dead ? "💀 Morto" : "❤️ Vivo"}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={() => router.push("/ficha/atributos")}
                            className={`w-full md:w-auto px-8 py-3 bg-gradient-to-r ${theme.button} font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
                            </svg>
                            DISTRIBUIR PONTOS & ATRIBUTOS
                        </button>
                    </div>
                </div>
            </div>
            
            {/* BIOGRAFIA */}
            <div className="p-8 bg-black/20">
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 opacity-60 ${theme.text}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    Biografia
                </h3>
                <div className={`border p-6 rounded-xl leading-relaxed whitespace-pre-wrap shadow-inner font-serif italic text-lg bg-black/20 border-white/5 ${theme.text} opacity-90`}>
                    {personagem.historia || "A história deste herói ainda não foi escrita nas estrelas..."}
                </div>
            </div>
          </div>
        ) : (
          // --- TELA DE CRIAR PERSONAGEM ---
          <div className={`text-center py-32 ${theme.panel} backdrop-blur-md rounded-2xl border-2 border-dashed ${theme.border} hover:border-opacity-100 transition-colors group`}>
            <h2 className={`text-3xl mb-4 font-light group-hover:scale-105 transition-transform ${theme.primary}`}>Sua alma vaga sem corpo...</h2>
            <button 
              onClick={() => setShowModal(true)}
              className={`bg-gradient-to-r ${theme.button} font-bold py-5 px-12 rounded-2xl transition-all transform hover:scale-105 shadow-xl text-lg`}
            >
              ✨ CRIAR NOVO PERSONAGEM
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className={`p-8 rounded-3xl w-full max-w-lg border-2 ${theme.border} ${theme.panel} shadow-2xl relative`}>
            <h2 className={`text-2xl font-black mb-6 text-center uppercase tracking-wide ${theme.primary}`}>Novo Herói</h2>
            <form onSubmit={handleCriarPersonagem} className="space-y-5">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.primary}`}>Nome</label>
                <input required value={nomeChar} onChange={e => setNomeChar(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-current outline-none transition-all" placeholder="Ex: Gandalf" />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.primary}`}>Classe</label>
                <div className="relative">
                    <select required value={classeSelecionada} onChange={e => setClasseSelecionada(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-current outline-none appearance-none cursor-pointer hover:bg-black/40 transition-colors">
                        <option value="">-- Selecione --</option>
                        {listaClasses.map((classe) => (<option key={classe.id} value={classe.id}>{classe.nome}</option>))}
                    </select>
                </div>
                {classeSelecionada && (<div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10 text-xs opacity-80 italic">{listaClasses.find(c => c.id == classeSelecionada)?.descricao}</div>)}
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.primary}`}>Biografia</label>
                <textarea rows={4} value={historiaChar} onChange={e => setHistoriaChar(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-current outline-none resize-none" placeholder="Origem..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors uppercase text-sm border border-white/10">Cancelar</button>
                <button type="submit" className={`flex-1 p-4 rounded-xl bg-gradient-to-r ${theme.button} font-black transition-transform active:scale-95 uppercase text-sm shadow-lg`}>NASCER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}