"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../components/PageWrapper";
import { useTheme } from "../components/contexts/ThemeContext";
import { useNotification } from "../components/contexts/NotificationContext";

// --- TABELAS DE BÔNUS ---
const BONUS_RANK_TALENTO: Record<string, number> = {
  "-": 0, "F": 3, "E": 6, "D": 9, "C": 12, "B": 15, "A": 18, "S": 21, "Z": 25
};

const BONUS_RANK_ATRIBUTO: Record<string, number> = {
  "-": 0, "F": 2, "E": 4, "D": 6, "C": 8, "B": 10, "A": 12, "S": 15, "Z": 20
};

// --- ÍCONES DE DADOS (SVG GEOMÉTRICOS) ---

const IconD4 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 2v13.5l8.5 6.5" opacity="0.5" /> 
    <path d="M12 15.5L3.5 22" opacity="0.5" />
  </svg>
);

// D6 ATUALIZADO: CUBO 3D
const IconD6 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    {/* Contorno Hexagonal (Silhueta do Cubo) */}
    <path d="M21 16.5L12 21.5L3 16.5V7.5L12 2.5L21 7.5V16.5Z" />
    {/* Y Interno (Divisão das Faces) */}
    <path d="M3 7.5L12 12.5L21 7.5" />
    <path d="M12 12.5V21.5" />
  </svg>
);

const IconD8 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
    <path d="M12 2v20" />
    <path d="M2 12h20" />
  </svg>
);

const IconD10 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 8l10 14 10-14L12 2z" />
    <path d="M2 8l10 6 10-6" />
    <path d="M12 2v20" />
  </svg>
);

const IconD12 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8.5 L8.5 11 L9.8 15 L14.2 15 L15.5 11 Z" />
      <path d="M12 2 L12 8.5" />
      <path d="M2 9 L8.5 11" />
      <path d="M5 20 L9.8 15" />
      <path d="M19 20 L14.2 15" />
      <path d="M22 9 L15.5 11" />
      <path d="M12 2 L2 9 L5 20 L19 20 L22 9 Z" />
  </svg>
);

const IconD20 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 L3 7 L3 17 L12 22 L21 17 L21 7 Z" />
    <path d="M12 12 L12 2" /> 
    <path d="M12 12 L3 7" />  
    <path d="M12 12 L21 7" /> 
    <path d="M12 12 L3 17" /> 
    <path d="M12 12 L21 17" />
    <path d="M3 17 L12 22 L21 17" />
  </svg>
);

const IconD100 = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-current fill-none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 5 L3 9 L8 19 L13 9 L8 5 Z" strokeWidth="1.5" />
    <path d="M3 9 L13 9" strokeWidth="1" opacity="0.5" />
    <path d="M18 5 L13 9 L18 19 L23 9 L18 5 Z" strokeWidth="1.5" />
    <path d="M13 9 L23 9" strokeWidth="1" opacity="0.5" />
    <text x="13" y="15" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontWeight="bold">%</text>
  </svg>
);


export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  
  const [user, setUser] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [personagem, setPersonagem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- NOVO ESTADO DE DADOS (POOL) ---
  const [dicePool, setDicePool] = useState<Record<number, number>>({ 20: 1 }); 
  
  const [bonusManual, setBonusManual] = useState(0);
  const [talentoSelecionado, setTalentoSelecionado] = useState("");
  const [bonusCalculado, setBonusCalculado] = useState(0);

  // Estado da Explosão, Falha e Milagre
  const [resultado, setResultado] = useState<any>(null);
  const [modoExplosao, setModoExplosao] = useState(false);
  const [modoFalha, setModoFalha] = useState(false);
  const [comboCritico, setComboCritico] = useState(0);
  const [somaAcumulada, setSomaAcumulada] = useState(0);
  const [isMilagre, setIsMilagre] = useState(false);

  // Notas
  const [notas, setNotas] = useState("");
  const [salvandoNotas, setSalvandoNotas] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("rpg_user");
    const storedMaster = localStorage.getItem("is_master");
    const userId = localStorage.getItem("user_id");

    if (!storedUser) { router.push("/login"); return; }

    setUser(storedUser);
    setIsMaster(storedMaster === "true");

    if (userId) {
        carregarPersonagem(userId);
    } else {
      setLoading(false);
    }
  }, []);

  async function carregarPersonagem(userId: string) {
      try {
        const res = await fetch("http://127.0.0.1:5000/meu-personagem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
        });
        if (res.status === 200) {
            const data = await res.json();
            setHasCharacter(true);
            setPersonagem(data);
            setNotas(data.notas || "");
        }
      } catch (e) { console.error(e); }
      setLoading(false);
  }

  // Funções de manipulação do Pool de Dados
  const addDie = (faces: number) => {
    setDicePool(prev => ({ ...prev, [faces]: (prev[faces] || 0) + 1 }));
  };
  
  const removeDie = (faces: number) => {
    setDicePool(prev => {
      const novo = { ...prev };
      if (novo[faces] > 1) novo[faces]--;
      else delete novo[faces];
      return novo;
    });
  };

  const clearPool = () => setDicePool({ 20: 1 });

  // --- CÁLCULO DE BÔNUS ---
  useEffect(() => {
    if (talentoSelecionado === "" || !personagem) {
        setBonusCalculado(bonusManual);
        return;
    }
    const talento = personagem.talentos.find((t: any) => t.id_vinculo.toString() === talentoSelecionado);
    
    if (talento) {
        const bonusRankTalento = BONUS_RANK_TALENTO[talento.rank] || 0;
        const totalTalento = talento.valor + bonusRankTalento;

        const rankAttr = talento.rank_atributo_pai || "-";
        const bonusRankAtributo = BONUS_RANK_ATRIBUTO[rankAttr] || 0;
        const totalAtributo = (talento.valor_atributo_pai || 0) + bonusRankAtributo;

        setBonusCalculado(totalTalento + totalAtributo);
    }
  }, [talentoSelecionado, bonusManual, personagem]);

  // --- LÓGICA DO DADO ---
  async function rolarDado(isExplosao = false) {
    const poolArray = Object.entries(dicePool).map(([faces, qtd]) => ({
        faces: Number(faces),
        qtd: qtd
    }));

    try {
      const bonusDaVez = isExplosao ? 0 : bonusCalculado;
      
      const response = await fetch("http://127.0.0.1:5000/rolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pool: poolArray, bonus: bonusDaVez }),
      });
      const data = await response.json();

      if (!isExplosao) {
          setModoExplosao(false);
          setModoFalha(false);
          setIsMilagre(false);
          setComboCritico(0);
          setSomaAcumulada(0);
      }

      if (data.temD20) {
          if (data.critico && !isExplosao) {
              setModoExplosao(true);
              setComboCritico(1);
              setSomaAcumulada(data.totalFinal); 
              setResultado({...data, totalFinal: "CRÍTICO!"});
              showNotification("🔥 CRÍTICO! Escolha: Abrir (+1 dado) ou Guardar?", "sucesso");
              return;
          } 
          
          if (isExplosao) {
              const d20Detail = data.detalhes.find((d: any) => d.dado === "D20");
              const valorD20Real = d20Detail ? d20Detail.rolagens[0] : 0;

              if (valorD20Real === 20) {
                  const novoCombo = comboCritico + 1;
                  setComboCritico(novoCombo);
                  
                  if (novoCombo >= 3) {
                      setModoExplosao(false); 
                      setIsMilagre(true);
                      const valorFinalMilagre = somaAcumulada + 20; 
                      setResultado({...data, totalFinal: valorFinalMilagre});
                      showNotification("✨ MILAGRE (Total +50)! O IMPOSSÍVEL ACONTECEU!", "sucesso");
                      return;
                  }

                  setSomaAcumulada(prev => prev + data.somaDados); 
                  setModoExplosao(true);
                  setResultado({...data, totalFinal: `DUPLO 20!`});
                  showNotification(`😱 DUPLO CRÍTICO! AGORA É TUDO OU NADA!`, "sucesso");
                  return;

              } else {
                  setModoExplosao(false);
                  const valorFinal = somaAcumulada + data.somaDados;
                  setResultado({...data, totalFinal: valorFinal});
                  showNotification(`💥 Ciclo encerrado! Resultado Final: ${valorFinal}`, "sucesso");
                  setSomaAcumulada(0);
                  setComboCritico(0);
                  return;
              }
          }

          if (data.falhaCritica && !isExplosao) {
              setModoFalha(true);
              setResultado({...data, totalFinal: "FALHA!"});
              showNotification("💀 FALHA CRÍTICA! Aceitar destino ou Guardar Maldição?", "erro");
              return;
          }
      }
      
      setResultado(data);
      
    } catch (error) { console.error("Erro:", error); }
  }

  // --- AÇÕES DE KARMA ---
  async function guardarCritico() {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
          await fetch("http://127.0.0.1:5000/guardar-critico", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId })
          });
          showNotification("✨ Crítico guardado no Banco Espiritual!", "sucesso");
          resetarMesa();
      } catch (e) { showNotification("Erro ao guardar.", "erro"); }
  }

  async function guardarFalha() {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
          await fetch("http://127.0.0.1:5000/guardar-falha", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId })
          });
          showNotification("💀 Maldição guardada para o futuro...", "erro");
          resetarMesa();
      } catch (e) { showNotification("Erro ao guardar.", "erro"); }
  }

  function aceitarFalha() {
      showNotification("Destino aceito. A falha ocorreu.", "erro");
      resetarMesa();
  }

  function resetarMesa() {
      setModoExplosao(false);
      setModoFalha(false);
      setIsMilagre(false);
      setSomaAcumulada(0);
      setComboCritico(0);
      setResultado(null);
      clearPool();
      carregarPersonagem(localStorage.getItem("user_id") || "");
  }

  async function salvarNotasBackend(texto: string) {
    setSalvandoNotas(true);
    const userId = localStorage.getItem("user_id");
    try {
        await fetch("http://127.0.0.1:5000/salvar-notas", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, texto: texto })
        });
    } catch (e) { console.error(e); }
    setTimeout(() => setSalvandoNotas(false), 1000);
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono animate-pulse text-2xl`}>Carregando...</div>;

  return (
    <PageWrapper>
      <main className={`p-6 max-w-6xl mx-auto ${hasCharacter ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" : "flex flex-col items-center justify-center min-h-[70vh]"}`}>
        
        {/* --- COLUNA 1 (ESQUERDA) --- */}
        <div className="flex flex-col gap-6 w-full h-full">
            
            {/* PAINEL DE NAVEGAÇÃO */}
            <section className={`transition-all duration-500 w-full shrink-0`}>
              <div className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} shadow-xl`}>
                <div className="flex items-center gap-3 mb-5 border-b border-current/10 pb-3">
                    <span className="text-2xl">{isMaster ? "🛡️" : "⚔️"}</span>
                    <h2 className={`text-xl font-black uppercase tracking-wider ${theme.primary}`}>
                        {isMaster ? "Painel do Mestre" : "Jogador"}
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {!isMaster ? (
                        <>
                        <button onClick={() => router.push("/ficha")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-blue-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-blue-500 transition-colors">Minha Ficha</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Status, Biografia e Atributos</p></button>
                        <button onClick={() => router.push("/mapas")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-yellow-500 transition-colors">Mapas</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Locais descobertos</p></button>
                        </>
                    ) : (
                        <>
                        {/* MENU MESTRE */}
                        <button onClick={() => router.push("/mestre/fichas")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-purple-500 transition-all hover:translate-x-1 flex justify-between items-center">
                            <div><h3 className="font-bold group-hover:text-purple-500 transition-colors">Gerenciar Fichas</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Editar Players e NPCs</p></div><span className="text-2xl">👥</span>
                        </button>
                        <button onClick={() => router.push("/mestre/npc")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-red-500 transition-all hover:translate-x-1 flex justify-between items-center">
                            <div><h3 className="font-bold group-hover:text-red-500 transition-colors">Gerador de NPC</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Criar inimigos rápidos</p></div><span className="text-2xl">👹</span>
                        </button>
                        <button onClick={() => router.push("/mapas")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:translate-x-1 flex justify-between items-center">
                            <div><h3 className="font-bold group-hover:text-yellow-500 transition-colors">Mapas</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Gerenciar locais</p></div><span className="text-2xl">🗺️</span>
                        </button>
                        </>
                    )}
                </div>
              </div>
            </section>

            {/* ANOTAÇÕES */}
            {hasCharacter && (
            <section className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} shadow-xl flex-1 flex flex-col min-h-[250px]`}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className={`text-lg font-black uppercase tracking-wider ${theme.primary} flex items-center gap-2`}>
                        📝 Anotações
                    </h2>
                    <span className={`text-[10px] uppercase font-bold ${salvandoNotas ? "text-green-500 animate-pulse" : "text-green-500 opacity-0 transition-opacity"}`}>
                        Salvando...
                    </span>
                </div>
                <textarea 
                    value={notas}
                    onChange={(e) => {
                        setNotas(e.target.value);
                        clearTimeout((window as any).saveTimeout);
                        (window as any).saveTimeout = setTimeout(() => salvarNotasBackend(e.target.value), 1000);
                    }}
                    className="w-full flex-1 bg-black/10 border border-current/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-current/30 transition-colors custom-scrollbar text-current placeholder:opacity-30"
                    placeholder="Escreva suas memórias aqui..."
                ></textarea>
            </section>
            )}
        </div>

        {/* --- COLUNA 2 (DIREITA) --- */}
        <div className="flex flex-col gap-6 w-full h-full">
            
            {/* ROLADOR DE DADOS */}
            {hasCharacter && (
            <>
            <section className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} shadow-xl relative overflow-hidden shrink-0`}>
                
                <div className="flex items-center gap-3 mb-5 border-b border-current/10 pb-3">
                    <span className="text-2xl">
                        {isMilagre ? "✨" : modoExplosao ? "🔥" : modoFalha ? "💀" : "🎲"}
                    </span>
                    <h2 className={`text-xl font-black uppercase tracking-wider ${theme.primary}`}>
                        {isMilagre ? "MILAGRE" : "Mesa de Dados"}
                    </h2>
                    {/* Botão Limpar */}
                    {!modoExplosao && !modoFalha && !isMilagre && (
                        <button onClick={clearPool} className="ml-auto text-[10px] opacity-50 hover:opacity-100 hover:text-red-400 font-bold uppercase transition-colors border border-white/20 px-2 py-1 rounded">
                            Limpar
                        </button>
                    )}
                </div>
                
                {/* 1. SELETOR DE DADOS (GRID) */}
                {!modoExplosao && !modoFalha && !isMilagre && (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
                    {[4, 6, 8, 10, 12, 20, 100].map(face => (
                        <button 
                            key={face} 
                            onClick={() => addDie(face)}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/20 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group active:scale-95"
                        >
                            <div className={`transition-transform duration-300 opacity-70 group-hover:opacity-100 group-hover:text-${face === 20 ? 'yellow-400' : 'white'}`}>
                                {face === 4 && <IconD4 />}
                                {face === 6 && <IconD6 />}
                                {face === 8 && <IconD8 />}
                                {face === 10 && <IconD10 />}
                                {face === 12 && <IconD12 />}
                                {face === 20 && <IconD20 />}
                                {face === 100 && <IconD100 />}
                            </div>
                            <span className="text-[10px] font-bold mt-1 opacity-50">D{face}</span>
                        </button>
                    ))}
                </div>
                )}

                {/* 2. POOL ATUAL (BANDEJA) */}
                {!modoExplosao && !modoFalha && !isMilagre && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-6 min-h-[80px] flex flex-wrap gap-3 items-center justify-center relative">
                    {Object.keys(dicePool).length === 0 && <span className="opacity-30 text-sm italic">Toque nos dados acima para adicionar...</span>}
                    
                    {Object.entries(dicePool).map(([faces, qtd]) => (
                        <div key={faces} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10 animate-in zoom-in duration-200">
                            <span className={`font-bold text-lg ${Number(faces) === 20 ? 'text-yellow-500' : 'text-white'}`}>
                                {qtd}d{faces}
                            </span>
                            <div className="flex flex-col gap-0.5 ml-2">
                                <button onClick={() => addDie(Number(faces))} className="w-4 h-4 flex items-center justify-center bg-white/10 hover:bg-green-500 rounded text-[8px]">+</button>
                                <button onClick={() => removeDie(Number(faces))} className="w-4 h-4 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded text-[8px]">-</button>
                            </div>
                        </div>
                    ))}
                    
                    {/* BÔNUS MANUAL */}
                    <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-4">
                        <span className="text-xs font-bold opacity-50 uppercase">Bônus</span>
                        <input 
                            type="number" 
                            value={bonusCalculado} 
                            onChange={(e) => { setBonusManual(Number(e.target.value)); setTalentoSelecionado(""); }} 
                            className={`w-14 p-1 rounded bg-black/20 border border-white/10 text-center font-bold outline-none focus:border-white/50 transition-colors ${theme.text}`}
                        />
                    </div>
                </div>
                )}

                {/* 3. SELETOR DE TALENTO */}
                {!modoExplosao && !modoFalha && !isMilagre && (
                    <div className="mb-6">
                        <select 
                            value={talentoSelecionado}
                            onChange={(e) => setTalentoSelecionado(e.target.value)}
                            className={`w-full p-3 rounded-xl bg-black/10 border border-current/10 text-current/90 focus:border-current outline-none transition-all cursor-pointer text-sm`}
                        >
                            <option value="" className="text-black font-bold">-- Selecionar Talento (Opcional) --</option>
                            <optgroup label="Meus Talentos" className="text-black font-bold">
                                {personagem?.talentos?.map((t: any) => (
                                    <option key={t.id_vinculo} value={t.id_vinculo} className="text-black font-normal">
                                        {t.nome} [Rank {t.rank}] Total: +{t.valor + (BONUS_RANK_TALENTO[t.rank] || 0) + (t.valor_atributo_pai || 0) + (BONUS_RANK_ATRIBUTO[t.rank_atributo_pai || "-"] || 0)}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                )}

                {/* 4. BOTÕES DE AÇÃO */}
                {!modoExplosao && !modoFalha && !isMilagre ? (
                    <button 
                        onClick={() => rolarDado(false)} 
                        disabled={Object.keys(dicePool).length === 0}
                        className={`w-full bg-gradient-to-r ${theme.button} font-black text-lg py-4 rounded-xl shadow-lg transform active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        ROLAR DADOS
                    </button>
                ) : modoExplosao ? (
                    <div className={`grid gap-3 animate-in slide-in-from-bottom-2 ${comboCritico === 2 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <button 
                            onClick={() => rolarDado(true)} 
                            className={`text-white font-black py-3 rounded-lg shadow-lg hover:scale-105 transition-all uppercase text-xs border-2 ${comboCritico === 2 ? 'bg-gradient-to-r from-yellow-400 to-orange-600 border-yellow-300 animate-pulse text-sm w-full' : 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-400/50'}`}
                        >
                            {comboCritico === 2 ? "🍀 TENTAR O MILAGRE (1/400) 🍀" : "💥 Abrir (+1)"}
                        </button>
                        
                        {comboCritico < 2 && (
                            <button onClick={guardarCritico} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg border border-slate-600 transition-all uppercase text-xs">📥 Guardar</button>
                        )}
                    </div>
                ) : modoFalha ? (
                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2">
                        <button onClick={aceitarFalha} className="bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 font-bold py-3 rounded-lg border border-slate-600 transition-all uppercase text-xs">💀 Aceitar</button>
                        <button onClick={guardarFalha} className="bg-red-900/80 hover:bg-red-800 text-red-200 font-black py-3 rounded-lg border border-red-600 transition-all uppercase text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)]">📥 Guardar Maldição</button>
                    </div>
                ) : (
                    <button onClick={resetarMesa} className="w-full bg-gradient-to-r from-yellow-300 to-yellow-600 text-black font-black py-3 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-pulse uppercase tracking-widest text-lg">
                        ✨ REALIZAR MILAGRE ✨
                    </button>
                )}

                {/* 5. RESULTADO VISUAL */}
                {resultado && (
                  <div className={`mt-6 p-4 rounded-xl border-2 text-center animate-in zoom-in duration-200 ${isMilagre ? 'bg-yellow-900/30 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'bg-black/10 border-current/10'}`}>
                    
                    {!isMilagre && <p className="text-xs opacity-60 mb-2 font-mono uppercase tracking-wider">{resultado.formula}</p>}
                    
                    <div className={`text-6xl font-black my-2 tracking-tighter ${isMilagre ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : resultado.critico ? "text-yellow-500 drop-shadow-lg" : resultado.falhaCritica ? "text-red-500 drop-shadow-lg" : ""}`}>
                        {modoExplosao ? somaAcumulada : resultado.totalFinal}
                    </div>
                    
                    {/* Detalhes por dado */}
                    {!isMilagre && !modoExplosao && resultado.detalhes && (
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {resultado.detalhes.map((d: any, i: number) => (
                                <div key={i} className="bg-black/20 px-3 py-1 rounded text-xs font-mono border border-white/5">
                                    <span className="opacity-50 mr-2">{d.dado}:</span>
                                    <span className="font-bold text-white">[{d.rolagens.join(", ")}]</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {resultado.critico && !isMilagre && <div className="text-yellow-600 font-black text-sm mt-3 animate-bounce uppercase tracking-widest border border-yellow-500/50 inline-block px-3 py-0.5 rounded bg-yellow-500/10">{comboCritico === 2 ? "DUPLO 20!" : "🔥 Crítico 🔥"}</div>}
                    {resultado.falhaCritica && <div className="text-red-600 font-black text-sm mt-3 animate-pulse uppercase tracking-widest border border-red-500/50 inline-block px-3 py-0.5 rounded bg-red-500/10">💀 Falha Crítica 💀</div>}
                    {isMilagre && <div className="text-yellow-300 font-black text-lg mt-3 uppercase tracking-widest">O IMPOSSÍVEL ACONTECEU!</div>}
                  </div>
                )}
            </section>

            {/* KARMA */}
            <section className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} shadow-xl shrink-0`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-black uppercase tracking-wider ${theme.primary}`}>Karma</h2>
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest border border-current/10 px-2 py-0.5 rounded">Banco Espiritual</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/10 rounded-lg p-4 flex flex-col items-center border border-green-500/20 group hover:bg-green-900/10 transition-colors cursor-help"><span className="text-4xl font-black text-green-500 drop-shadow-sm group-hover:scale-110 transition-transform">{personagem?.banco_criticos || 0}</span><span className="text-[10px] font-bold uppercase text-green-600/70 mt-1">Bençãos (20)</span></div>
                    <div className="bg-black/10 rounded-lg p-4 flex flex-col items-center border border-red-500/20 group hover:bg-red-900/10 transition-colors cursor-help"><span className="text-4xl font-black text-red-500 drop-shadow-sm group-hover:scale-110 transition-transform">{personagem?.banco_falhas || 0}</span><span className="text-[10px] font-bold uppercase text-red-600/70 mt-1">Maldições (1)</span></div>
                </div>
            </section>
            </>
            )}
        </div>

      </main>
    </PageWrapper>
  );
}