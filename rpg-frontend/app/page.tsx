"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../components/PageWrapper";
import { useTheme } from "../components/contexts/ThemeContext";

// Tabelas de Bônus
const BONUS_RANK_TALENTO: Record<string, number> = {
  "-": 0, "F": 3, "E": 6, "D": 9, "C": 12, "B": 15, "A": 18, "S": 21, "Z": 25
};

const BONUS_RANK_ATRIBUTO: Record<string, number> = {
  "-": 0, "F": 2, "E": 4, "D": 6, "C": 8, "B": 10, "A": 12, "S": 15, "Z": 20
};

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [user, setUser] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const [hasCharacter, setHasCharacter] = useState(false);
  const [personagem, setPersonagem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{texto: string, tipo: 'sucesso'|'erro'|''} | null>(null);

  // Dados do Rolador
  const [qtd, setQtd] = useState(1);
  const [faces, setFaces] = useState(20);
  const [bonusManual, setBonusManual] = useState(0);
  const [talentoSelecionado, setTalentoSelecionado] = useState("");
  const [bonusCalculado, setBonusCalculado] = useState(0);

  // Estado da Explosão e Karma
  const [resultado, setResultado] = useState<any>(null);
  const [modoExplosao, setModoExplosao] = useState(false);
  const [modoFalha, setModoFalha] = useState(false);
  const [somaAcumulada, setSomaAcumulada] = useState(0);

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

  // --- CÁLCULO AUTOMÁTICO DE BÔNUS ---
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
      // Se for explosão (dado extra), o bônus é 0 (já foi somado no primeiro)
      const bonusDaVez = isExplosao ? 0 : bonusCalculado;
      
      const response = await fetch("http://127.0.0.1:5000/rolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qtd: Number(qtd), faces: Number(faces), bonus: bonusDaVez }),
      });
      const data = await response.json();

      // RESET VISUAL INICIAL
      setModoExplosao(false);
      setModoFalha(false);

      // LÓGICA D20
      if (Number(faces) === 20) {
          
          // SUCESSO CRÍTICO (20) - Abre opções: Abrir ou Guardar
          if (data.critico) {
              setModoExplosao(true);
              // Se for a primeira rolagem, o acumulado é o resultado dela.
              // Se já for uma explosão, soma ao que já tinha.
              const novoAcumulado = isExplosao ? (somaAcumulada + data.totalFinal) : data.totalFinal;
              setSomaAcumulada(novoAcumulado);
              
              // Mostra o resultado temporário
              setResultado({...data, totalFinal: novoAcumulado});
              
              mostrarMensagem("🔥 CRÍTICO! Escolha: Abrir o dado ou Guardar?", "sucesso");
              return;
          } 
          
          // FALHA CRÍTICA (1) - Abre opções: Aceitar ou Guardar
          if (data.falhaCritica && !isExplosao) {
              setModoFalha(true);
              setResultado({...data, totalFinal: "FALHA!"});
              mostrarMensagem("💀 FALHA CRÍTICA! Aceitar destino ou Guardar?", "erro");
              return;
          }
      }
      
      // ROLAGEM NORMAL (Ou fim da explosão que não deu critico)
      let finalValue = data.totalFinal;
      if (isExplosao) {
          finalValue += somaAcumulada; // Soma o novo dado ao acumulado
          setSomaAcumulada(0); // Reseta
      }
      
      setResultado({...data, totalFinal: finalValue});
      
    } catch (error) { console.error("Erro:", error); }
  }

  // --- AÇÕES DE KARMA ---

  async function guardarCritico() {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
          const res = await fetch("http://127.0.0.1:5000/guardar-critico", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId })
          });
          if (res.ok) {
              mostrarMensagem("✨ Crítico guardado no Banco Espiritual!", "sucesso");
              resetarMesa();
          }
      } catch (e) { mostrarMensagem("Erro ao guardar.", "erro"); }
  }

  async function guardarFalha() {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
          const res = await fetch("http://127.0.0.1:5000/guardar-falha", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId })
          });
          mostrarMensagem("💀 Maldição guardada para o futuro...", "erro");
          resetarMesa();
      } catch (e) { mostrarMensagem("Erro ao guardar.", "erro"); }
  }

  function aceitarFalha() {
      mostrarMensagem("Destino aceito. A falha ocorreu.", "erro");
      resetarMesa();
  }

  function resetarMesa() {
      setModoExplosao(false);
      setModoFalha(false);
      setSomaAcumulada(0);
      setResultado(null);
      carregarPersonagem(localStorage.getItem("user_id") || "");
  }

  // --- NOTAS E UI ---

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

  function mostrarMensagem(texto: string, tipo: 'sucesso'|'erro') {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 4000);
  }

  if (loading) return <div className={`h-screen w-full ${theme.bg} ${theme.text} flex items-center justify-center font-mono animate-pulse text-2xl`}>Carregando...</div>;

  return (
    <PageWrapper>
      <main className={`p-6 max-w-6xl mx-auto ${hasCharacter ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" : "flex flex-col items-center justify-center min-h-[70vh]"}`}>
        
        {/* --- COLUNA 1 (ESQUERDA) --- */}
        <div className="flex flex-col gap-6 w-full h-full">
            
            {/* MENSAGEM FLUTUANTE */}
            {msg && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-8 py-3 rounded-full font-bold shadow-2xl animate-in fade-in slide-in-from-top-5 text-lg border-2 ${msg.tipo === 'sucesso' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                    {msg.texto}
                </div>
            )}

            {/* Painel de Navegação */}
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
                        <button onClick={() => router.push("/grimorio")} className="group p-4 bg-black/10 hover:bg-black/20 rounded-lg text-left border-l-4 border-green-500 transition-all hover:translate-x-1"><h3 className="font-bold group-hover:text-green-500 transition-colors">Meu Grimório</h3><p className={`text-xs opacity-60 ${theme.textMuted}`}>Consultar e lançar magias</p></button>
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

            {/* Anotações */}
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
                    className="w-full flex-1 bg-black/10 border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-current/30 transition-colors custom-scrollbar text-current placeholder:opacity-30"
                    placeholder="Escreva suas memórias aqui..."
                ></textarea>
            </section>
            )}
        </div>

        {/* --- COLUNA 2 (DIREITA) --- */}
        <div className="flex flex-col gap-6 w-full">
            
            {/* ROLADOR DE DADOS */}
            {hasCharacter && (
            <>
            <section className={`${theme.panel} backdrop-blur-md p-6 rounded-xl border ${theme.border} shadow-xl relative overflow-hidden shrink-0`}>
                
                <div className="flex items-center gap-3 mb-5 border-b border-current/10 pb-3">
                    <span className="text-2xl">
                        {modoExplosao ? "🔥" : modoFalha ? "💀" : "🎲"}
                    </span>
                    <h2 className={`text-xl font-black uppercase tracking-wider ${theme.primary}`}>Dados</h2>
                </div>
                
                {/* SELETOR DE TALENTO */}
                {!modoExplosao && !modoFalha && (
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
                  <div className="flex flex-col items-center"><span className={`text-[9px] font-bold uppercase mb-1 opacity-80`}>Qtd</span><input type="number" value={qtd} onChange={(e) => setQtd(Number(e.target.value))} className={`w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold outline-none ${theme.text}`} disabled={modoExplosao || modoFalha} /></div>
                  <span className="self-center text-xl font-bold opacity-30 mt-4">d</span>
                  <div className="flex flex-col items-center"><span className={`text-[9px] font-bold uppercase mb-1 opacity-80`}>Faces</span><input type="number" value={faces} onChange={(e) => setFaces(Number(e.target.value))} className={`w-16 p-2 rounded-lg bg-black/10 border border-current/20 text-center text-xl font-bold outline-none ${theme.text}`} disabled={modoExplosao || modoFalha} /></div>
                  <span className="self-center text-xl font-bold opacity-30 mt-4">+</span>
                  <div className="flex flex-col items-center"><span className={`text-[9px] font-bold uppercase mb-1 opacity-80`}>Bônus</span><input type="number" value={bonusCalculado} onChange={(e) => { setBonusManual(Number(e.target.value)); setTalentoSelecionado(""); }} className={`w-16 p-2 rounded-lg border border-current/20 text-center text-xl font-bold outline-none ${theme.text}`} disabled={modoExplosao || modoFalha} /></div>
                </div>

                {/* BOTÕES DE AÇÃO */}
                {!modoExplosao && !modoFalha ? (
                    <button onClick={() => rolarDado(false)} className={`w-full bg-gradient-to-r ${theme.button} font-black text-lg py-3 rounded-lg shadow-md transform active:scale-95 transition-all uppercase tracking-widest`}>ROLAR</button>
                ) : modoExplosao ? (
                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2">
                        <button onClick={() => rolarDado(true)} className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-black py-3 rounded-lg shadow-lg hover:scale-105 transition-all uppercase text-xs border-2 border-yellow-400/50">💥 Abrir (+1)</button>
                        <button onClick={guardarCritico} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg border border-slate-600 transition-all uppercase text-xs">📥 Guardar</button>
                    </div>
                ) : (
                    // OPÇÕES DE FALHA (NOVO!)
                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2">
                        <button onClick={aceitarFalha} className="bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 font-bold py-3 rounded-lg border border-slate-600 transition-all uppercase text-xs">💀 Aceitar</button>
                        <button onClick={guardarFalha} className="bg-red-900/80 hover:bg-red-800 text-red-200 font-black py-3 rounded-lg border border-red-600 transition-all uppercase text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)]">📥 Guardar Maldição</button>
                    </div>
                )}

                {/* RESULTADO */}
                {resultado && (
                  <div className="mt-6 p-4 bg-black/10 rounded-xl border border-current/10 text-center animate-in zoom-in duration-200">
                    <p className="text-xs opacity-60 mb-1 font-mono uppercase tracking-wider">{resultado.formula}</p>
                    <div className={`text-6xl font-black my-1 tracking-tighter ${resultado.critico ? "text-yellow-500 drop-shadow-lg" : resultado.falhaCritica ? "text-red-500 drop-shadow-lg" : ""}`}>{modoExplosao ? somaAcumulada : resultado.totalFinal}</div>
                    <div className="text-[10px] font-mono opacity-50 mt-2">[{resultado.rolagensIndividuais?.join(", ")}] Mod: {resultado.somaDados - (resultado.rolagensIndividuais?.reduce((a:any,b:any)=>a+b,0) || 0)}</div>
                    {resultado.critico && <div className="text-yellow-600 font-black text-sm mt-3 animate-bounce uppercase tracking-widest border border-yellow-500/50 inline-block px-3 py-0.5 rounded bg-yellow-500/10">🔥 Crítico 🔥</div>}
                    {resultado.falhaCritica && <div className="text-red-600 font-black text-sm mt-3 animate-pulse uppercase tracking-widest border border-red-500/50 inline-block px-3 py-0.5 rounded bg-red-500/10">💀 Falha Crítica 💀</div>}
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
                    <div className="bg-black/10 rounded-lg p-4 flex flex-col items-center border border-green-500/20 group hover:bg-green-900/10 transition-colors cursor-help"><span className="text-4xl font-black text-green-500 drop-shadow-sm group-hover:scale-110 transition-transform">{personagem?.banco_criticos || 0}</span><span className="text-[10px] font-bold uppercase text-green-600/70 mt-1">Milagres (20)</span></div>
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