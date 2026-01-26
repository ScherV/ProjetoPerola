"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";
import { useTheme } from "../../components/contexts/ThemeContext";
import { useNotification } from "../../components/contexts/NotificationContext";

export default function FichaPage() {
  const router = useRouter();
  const { theme, setTheme, currentTheme } = useTheme();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [personagem, setPersonagem] = useState<any>(null);
  const [imagemPerfil, setImagemPerfil] = useState<string | null>(null);
  
  const [listaClasses, setListaClasses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // --- NOVOS ESTADOS PARA A CRIAÇÃO ---
  const [nomeChar, setNomeChar] = useState("");
  const [terraNatal, setTerraNatal] = useState(""); // <--- NOVO ESTADO
  const [historiaChar, setHistoriaChar] = useState("");
  const [origem, setOrigem] = useState<"mandriosa" | "elemental" | "personalizado">("mandriosa");
  
  // Seleções específicas
  const [classeSelecionada, setClasseSelecionada] = useState(""); 
  const [elementoSelecionado, setElementoSelecionado] = useState(""); 
  const [origemPersonalizada, setOrigemPersonalizada] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const userId = localStorage.getItem("user_id");
    if (!userId) { router.push("/login"); return; }

    try {
      // Carrega Personagem
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

      // --- FILTRO DE CLASSES DE MANDRIOSA ---
      const resClasses = await fetch("http://127.0.0.1:5000/classes");
      if (resClasses.ok) {
        const todasClasses = await resClasses.json();
        // Filtramos apenas as classes oficiais da Cúpula
        const classesMandriosa = todasClasses.filter((c: any) => 
            ["Ceifeiro", "Ladino", "Alquimista"].includes(c.nome)
        );
        setListaClasses(classesMandriosa);
      }

    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

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
    
    // Validação baseada na Origem
    let classeFinal = null;
    let origemFinal = "";
    let elementoFinal = null;

    if (origem === "mandriosa") {
        if (!classeSelecionada) { showNotification("Escolha sua Classe de Mandriosa!", "erro"); return; }
        classeFinal = Number(classeSelecionada);
        origemFinal = "Cidadão da Cúpula";
    } 
    else if (origem === "elemental") {
        if (!elementoSelecionado) { showNotification("Escolha seu Elemento!", "erro"); return; }
        classeFinal = null; // Backend resolve
        const elemLimpo = elementoSelecionado.split(" ")[0]; 
        origemFinal = `Elemental de ${elemLimpo}`;
        elementoFinal = elemLimpo;
    }
    else if (origem === "personalizado") {
        if (!origemPersonalizada) { showNotification("Defina sua origem!", "erro"); return; }
        classeFinal = null;
        origemFinal = origemPersonalizada;
    }

    try {
      const historiaCompleta = `[Origem: ${origemFinal}]\n${historiaChar}`;

      const response = await fetch("http://127.0.0.1:5000/criar-personagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nome: nomeChar,
          terra_natal: terraNatal, // <--- ENVIO DO NOVO CAMPO
          historia: historiaCompleta,
          tipo_origem: origem,
          classe_id: classeFinal,
          elemento: elementoFinal
        }),
      });

      if (response.status === 201) {
        showNotification(`✨ ${nomeChar} despertou como ${origemFinal}!`, "sucesso");
        setShowModal(false);
        carregarDados();
      } else {
        const erro = await response.json();
        showNotification(erro.erro || "O caos impediu a criação.", "erro");
      }
    } catch (err) {
      showNotification("Erro de conexão com os planos superiores.", "erro");
    }
  }

  if (loading) return <div className={`h-screen w-full flex items-center justify-center ${theme.text} ${theme.bg} font-mono animate-pulse text-2xl`}>Carregando Alma...</div>;

  return (
    <div className={`relative min-h-screen w-full ${theme.bg} ${theme.text} font-sans overflow-x-hidden pb-10 transition-colors duration-500`}>
      
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <ParticlesBackground />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        
        {/* HEADER */}
        <div className={`flex justify-between items-center mb-8 border-b ${theme.border} pb-4 ${theme.panel} px-6 py-4 rounded-xl backdrop-blur-md shadow-lg`}>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push("/")} className="group flex items-center gap-2 opacity-70 hover:opacity-100 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
             </button>
            <h1 className={`text-3xl font-black uppercase tracking-wider ${theme.primary}`}>Minha Ficha</h1>
          </div>
          <div className="flex gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5">
            {['cosmos', 'finxy', 'exidium', 'fox'].map((t) => (
                <button key={t} onClick={() => setTheme(t as any)} className={`w-3 h-3 rounded-full border transition-all ${currentTheme === t ? 'border-white scale-125' : 'border-transparent opacity-50'}`} style={{ backgroundColor: t === 'cosmos' ? '#9333ea' : t === 'finxy' ? '#facc15' : t === 'exidium' ? '#dc2626' : '#3b82f6' }}></button>
            ))}
          </div>
        </div>

        {personagem ? (
          // --- VISUALIZAÇÃO DO PERSONAGEM ---
          <div className={`${theme.panel} backdrop-blur-md rounded-2xl border ${theme.border} shadow-2xl overflow-hidden`}>
            <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className={`w-40 h-40 rounded-full border-4 ${theme.border} overflow-hidden shadow-2xl bg-black/50 flex items-center justify-center relative group-hover:border-white transition-all`}>
                        {imagemPerfil ? <img src={imagemPerfil} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-5xl opacity-50">+</span>}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-xs font-bold text-white uppercase tracking-widest">Alterar Foto</span></div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                        <div>
                            <h2 className={`text-5xl font-black tracking-tight drop-shadow-lg ${theme.text}`}>{personagem.nome}</h2>
                            
                            {/* --- EXIBIÇÃO DA TERRA NATAL --- */}
                            <p className="text-lg italic opacity-60 font-serif mb-2 border-b border-white/5 pb-2 inline-block">
                                {personagem.terra_natal || "De terras desconhecidas..."}
                            </p>

                            <p className={`text-xl font-mono uppercase tracking-widest mt-1 flex items-center justify-center md:justify-start gap-2 ${theme.primary}`}>
                                <span className={`w-2 h-2 rounded-full ${theme.bgAttr || 'bg-white'}`}></span>
                                {personagem.classe}
                            </p>
                        </div>
                    </div>
                    {/* Botões de Ação */}
                    <div className="pt-6 flex flex-col md:flex-row gap-4">
                        <button onClick={() => router.push("/ficha/atributos")} className={`flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide`}>
                            <span className="text-xl">📊</span> Atributos & Status
                        </button>
                        <button onClick={() => router.push("/grimorio")} className={`flex-1 px-6 py-3 bg-gradient-to-r ${theme.button} font-black rounded-xl shadow-lg hover:shadow-purple-500/20 transition-transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide text-white border border-white/20`}>
                            <span className="text-xl">📖</span> Abrir Grimório
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-8 bg-black/20">
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 opacity-60 ${theme.text}`}>Biografia</h3>
                <div className={`border p-6 rounded-xl leading-relaxed whitespace-pre-wrap shadow-inner font-serif italic text-lg bg-black/20 border-white/5 ${theme.text} opacity-90`}>{personagem.historia || "A história deste herói ainda não foi escrita..."}</div>
            </div>
          </div>
        ) : (
          // --- BOTÃO DE CRIAR ---
          <div className={`text-center py-32 ${theme.panel} backdrop-blur-md rounded-2xl border-2 border-dashed ${theme.border} hover:border-opacity-100 transition-colors group`}>
            <h2 className={`text-3xl mb-4 font-light group-hover:scale-105 transition-transform ${theme.primary}`}>Sua alma vaga sem corpo...</h2>
            <button onClick={() => setShowModal(true)} className={`bg-gradient-to-r ${theme.button} font-bold py-5 px-12 rounded-2xl transition-all transform hover:scale-105 shadow-xl text-lg`}>✨ CRIAR NOVO PERSONAGEM</button>
          </div>
        )}
      </div>

      {/* --- MODAL DE CRIAÇÃO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className={`p-8 rounded-3xl w-full max-w-2xl border-2 ${theme.border} ${theme.panel} shadow-2xl relative max-h-[90vh] overflow-y-auto`}>
            
            <h2 className={`text-2xl font-black mb-6 text-center uppercase tracking-wide ${theme.primary}`}>Nova Origem</h2>
            
            <form onSubmit={handleCriarPersonagem} className="space-y-6">
              
              {/* Nome */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.primary}`}>Nome do Personagem</label>
                <input required value={nomeChar} onChange={e => setNomeChar(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-current outline-none transition-all text-white font-bold text-lg" placeholder="Ex: Gandalf" />
              </div>

              {/* --- CAMPO NOVO: TERRA NATAL --- */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.primary}`}>Terra Natal / Origem</label>
                <input 
                    value={terraNatal} 
                    onChange={e => setTerraNatal(e.target.value)} 
                    className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-current outline-none transition-all text-white font-bold text-sm" 
                    placeholder="Ex: Nascido na vila sem nome" 
                />
              </div>

              {/* ABAS DE ORIGEM */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${theme.primary}`}>Origem da Alma</label>
                <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setOrigem("mandriosa")} className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-2 ${origem === "mandriosa" ? `bg-white/10 border-white text-white` : "border-white/10 opacity-50 hover:opacity-100"}`}>
                        <span className="text-2xl">🏰</span>
                        MANDRIOSA
                    </button>
                    <button type="button" onClick={() => setOrigem("elemental")} className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-2 ${origem === "elemental" ? `bg-blue-500/20 border-blue-400 text-blue-100` : "border-white/10 opacity-50 hover:opacity-100"}`}>
                        <span className="text-2xl">🌪️</span>
                        ELEMENTAL
                    </button>
                    <button type="button" onClick={() => setOrigem("personalizado")} className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-2 ${origem === "personalizado" ? `bg-purple-500/20 border-purple-400 text-purple-100` : "border-white/10 opacity-50 hover:opacity-100"}`}>
                        <span className="text-2xl">✨</span>
                        OUTRO
                    </button>
                </div>
              </div>

              {/* CONTEÚDO DINÂMICO */}
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                  
                  {/* OPÇÃO 1: MANDRIOSA (Dropdown Filtrado) */}
                  {origem === "mandriosa" && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Classe da Cúpula</label>
                        <select required value={classeSelecionada} onChange={e => setClasseSelecionada(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-white outline-none cursor-pointer text-white font-bold">
                            <option value="" className="text-black">-- Selecione um Caminho --</option>
                            {listaClasses.map((classe) => (<option key={classe.id} value={classe.id} className="text-black">{classe.nome}</option>))}
                        </select>
                        {classeSelecionada && (<div className="mt-3 text-xs opacity-60 italic text-white px-2">"{listaClasses.find(c => c.id == classeSelecionada)?.descricao}"</div>)}
                    </div>
                  )}

                  {/* OPÇÃO 2: ELEMENTAL */}
                  {origem === "elemental" && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Afinidade Elemental</label>
                        <div className="grid grid-cols-4 gap-2">
                            {["Fogo 🔥", "Água 💧", "Terra 🌿", "Ar 💨"].map((el) => {
                                const nomeLimpo = el.split(" ")[0];
                                return (
                                    <button 
                                        key={el} 
                                        type="button" 
                                        onClick={() => setElementoSelecionado(el)} 
                                        className={`p-3 rounded-lg border font-bold text-sm transition-all ${elementoSelecionado === el ? "bg-white text-black border-white" : "bg-black/30 border-white/10 hover:border-white/50"}`}
                                    >
                                        {el}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                  )}

                  {/* OPÇÃO 3: PERSONALIZADO */}
                  {origem === "personalizado" && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Nome da Origem / Poder</label>
                        <input required value={origemPersonalizada} onChange={e => setOrigemPersonalizada(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-purple-400 outline-none text-white placeholder-white/20" placeholder="Ex: Viajante do Tempo, Ciborgue..." />
                    </div>
                  )}
              </div>

              {/* Biografia */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.primary}`}>Biografia Inicial</label>
                <textarea rows={3} value={historiaChar} onChange={e => setHistoriaChar(e.target.value)} className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-current outline-none resize-none text-white" placeholder="Escreva brevemente sobre seu passado..." />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors uppercase text-sm border border-white/10 text-white">Cancelar</button>
                <button type="submit" className={`flex-1 p-4 rounded-xl bg-gradient-to-r ${theme.button} font-black transition-transform active:scale-95 uppercase text-sm shadow-lg text-white`}>DESPERTAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}