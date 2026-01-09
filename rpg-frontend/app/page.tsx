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

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  
  const [user, setUser] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [personagem, setPersonagem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dados do Rolador
  const [qtd, setQtd] = useState(1);
  const [faces, setFaces] = useState(20);
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
    try {
      const bonusDaVez = isExplosao ? 0 : bonusCalculado;
      
      const response = await fetch("http://127.0.0.1:5000/rolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qtd: Number(qtd), faces: Number(faces), bonus: bonusDaVez }),
      });
      const data = await response.json();
      const valorDado = data.rolagensIndividuais[0]; 

      if (!isExplosao) {
          setModoExplosao(false);
          setModoFalha(false);
          setIsMilagre(false);
          setComboCritico(0);
          setSomaAcumulada(0);
      }

      if (Number(faces) === 20) {
          // --- 1. PRIMEIRO CRÍTICO (20) ---
          if (valorDado === 20 && !isExplosao) {
              setModoExplosao(true);
              setComboCritico(1);
              
              // REGRA: O primeiro 20 vale 10 + Bônus
              const valorRegraCasa = 10 + bonusCalculado;
              setSomaAcumulada(valorRegraCasa); 
              
              setResultado({...data, totalFinal: "CRÍTICO!"});
              showNotification("🔥 CRÍTICO! Escolha: Abrir (+1 dado) ou Guardar?", "sucesso");
              return;
          } 
          
          // --- 2. EXPLOSÃO (Abrir Dado) ---
          if (isExplosao) {
              if (valorDado === 20) {
                  // --- TIROU OUTRO 20! ---
                  const novoCombo = comboCritico + 1;
                  setComboCritico(novoCombo);
                  
                  // Se for o 3º Crítico -> MILAGRE
                  if (novoCombo >= 3) {
                      setModoExplosao(false); 
                      setIsMilagre(true);
                      
                      // Conta: Acumulado + 20
                      const valorFinalMilagre = somaAcumulada + 20; 
                      
                      setResultado({...data, totalFinal: valorFinalMilagre});
                      showNotification("✨ MILAGRE (Total +50)! O IMPOSSÍVEL ACONTECEU!", "sucesso");
                      return;
                  }

                  // Se for o 2º Crítico -> Soma +20
                  setSomaAcumulada(prev => prev + 20); 
                  setModoExplosao(true);
                  
                  setResultado({...data, totalFinal: `DUPLO 20!`});
                  showNotification(`😱 DUPLO CRÍTICO! AGORA É TUDO OU NADA!`, "sucesso");
                  return;

              } else {
                  // --- TIROU NÚMERO NORMAL (Fim da Explosão) ---
                  setModoExplosao(false);
                  
                  // Soma: Acumulado + Valor do Dado
                  const valorFinal = somaAcumulada + valorDado;
                  
                  setResultado({...data, totalFinal: valorFinal});
                  showNotification(`💥 Ciclo encerrado! Resultado Final: ${valorFinal}`, "sucesso");
                  
                  setSomaAcumulada(0);
                  setComboCritico(0);
                  return;
              }
          }

          // --- 3. FALHA CRÍTICA (1) ---
          if (valorDado === 1 && !isExplosao) {
              setModoFalha(true);
              setResultado({...data, totalFinal: "FALHA!"});
              showNotification("💀 FALHA CRÍTICA! Aceitar destino ou Guardar Maldição?", "erro");
              return;
          }
      }
      
      // ROLAGEM NORMAL
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
                        {isMaster ? "Mestre" : "Jogador"}
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {!isMaster ? (
                        <>
                        <button onClick={() => router.push("/ficha")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-blue-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-blue-500 transition-colors">Minha Ficha</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Status, Biografia e Atributos</p></button>
                        {/* Botão Grimório Removido */}
                        <button onClick={() => router.push("/mapas")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-yellow-500 transition-colors">Mapas</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Locais descobertos</p></button>
                        </>
                    ) : (
                        <>
                        <button onClick={() => router.push("/mestre")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-purple-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-purple-500 transition-colors">Todas as Fichas</h3></button>
                        <button onClick={() => router.push("/mapas")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-yellow-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-yellow-500 transition-colors">Mapas</h3></button>
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
                        {isMilagre ? "MILAGRE" : "Dados"}
                    </h2>
                </div>
                
                {/* SELETOR DE TALENTO */}
                {!modoExplosao && !modoFalha && !isMilagre && (
                    <div className="mb-4">
                        <label className={`text-[10px] font-bold uppercase mb-1 block opacity-80`}>Usar Talento</label>
                        <select 
                            value={talentoSelecionado}
                            onChange={(e) => setTalentoSelecionado(e.target.value)}
                            className={`w-full p-3 rounded-xl bg-black/10 border border-current/10 text-current/90 focus:border-current outline-none transition-all cursor-pointer`}
                        >
                            <option value="" className="text-black font-bold">Manual (Digitar Bônus)</option>
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

                {/* INPUTS */}
                <div className="flex gap-2 mb-6 justify-center">
                  <div className="flex flex-col items-center"><span className={`text-[9px] font-bold uppercase mb-1 opacity-80`}>Qtd</span><input type="number" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={`w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold outline-none ${theme.text}`} disabled={modoExplosao || modoFalha || isMilagre} /></div>
                  <span className="self-center text-xl font-bold opacity-30 mt-4">d</span>
                  <div className="flex flex-col items-center"><span className={`text-[9px] font-bold uppercase mb-1 opacity-80`}>Faces</span><input type="number" value={faces} onChange={(e) => setFaces(Number(e.target.value))} className={`w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold outline-none ${theme.text}`} disabled={modoExplosao || modoFalha || isMilagre} /></div>
                  <span className="self-center text-xl font-bold opacity-30 mt-4">+</span>
                  <div className="flex flex-col items-center"><span className={`text-[9px] font-bold uppercase mb-1 opacity-80`}>Bônus</span><input type="number" value={bonusCalculado} onChange={(e) => { setBonusManual(Number(e.target.value)); setTalentoSelecionado(""); }} className={`w-16 p-2 rounded-lg border border-current/20 text-center text-xl font-bold outline-none ${theme.text}`} disabled={modoExplosao || modoFalha || isMilagre} /></div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                {!modoExplosao && !modoFalha && !isMilagre ? (
                    <button onClick={() => rolarDado(false)} className={`w-full bg-gradient-to-r ${theme.button} font-black text-lg py-3 rounded-lg shadow-md transform active:scale-95 transition-all uppercase tracking-widest`}>ROLAR</button>
                ) : modoExplosao ? (
                    // AQUI ESTÁ A LÓGICA DO BOTÃO
                    <div className={`grid gap-3 animate-in slide-in-from-bottom-2 ${comboCritico === 2 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <button 
                            onClick={() => rolarDado(true)} 
                            className={`text-white font-black py-3 rounded-lg shadow-lg hover:scale-105 transition-all uppercase text-xs border-2 ${comboCritico === 2 ? 'bg-gradient-to-r from-yellow-400 to-orange-600 border-yellow-300 animate-pulse text-sm w-full' : 'bg-gradient-to-r from-yellow-500 to-orange-600 border-yellow-400/50'}`}
                        >
                            {comboCritico === 2 ? "🍀 TENTAR O MILAGRE (1/400) 🍀" : "💥 Abrir (+1)"}
                        </button>
                        
                        {/* SE O COMBO FOR MENOR QUE 2, MOSTRA O BOTÃO DE GUARDAR. SE FOR 2, ELE SOME. */}
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

                {/* RESULTADO */}
                {resultado && (
                  <div className={`mt-6 p-4 rounded-xl border-2 text-center animate-in zoom-in duration-200 ${isMilagre ? 'bg-yellow-900/30 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'bg-black/10 border-current/10'}`}>
                    
                    {!isMilagre && <p className="text-xs opacity-60 mb-1 font-mono uppercase tracking-wider">{resultado.formula}</p>}
                    
                    <div className={`text-6xl font-black my-1 tracking-tighter ${isMilagre ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : resultado.critico ? "text-yellow-500 drop-shadow-lg" : resultado.falhaCritica ? "text-red-500 drop-shadow-lg" : ""}`}>
                        {modoExplosao ? somaAcumulada : resultado.totalFinal}
                    </div>
                    
                    {!isMilagre && !modoExplosao && <div className="text-[10px] font-mono opacity-50 mt-2">[{resultado.rolagensIndividuais?.join(", ")}]</div>}
                    
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