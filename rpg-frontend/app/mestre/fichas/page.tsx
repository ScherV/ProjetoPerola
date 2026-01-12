"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../../components/PageWrapper";
import { useTheme } from "../../../components/contexts/ThemeContext";
import { useNotification } from "../../../components/contexts/NotificationContext";

export default function FichasMestrePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [charSelecionado, setCharSelecionado] = useState<any>(null);
  const [grimorio, setGrimorio] = useState<any[]>([]);

  // Estados de Edição
  const [editandoMagia, setEditandoMagia] = useState<any>(null);
  const [novoNivel, setNovoNivel] = useState(1);
  
  // Estados de CRIAÇÃO (Novo Modal Completo)
  const [showAddModal, setShowAddModal] = useState(false);
  const [novaMagia, setNovaMagia] = useState({
      nome: "",
      tipo: "Ataque",
      descricao: "",
      detalhes: ""
  });

  useEffect(() => {
    carregarPersonagens();
  }, []);

  async function carregarPersonagens() {
    try {
      const res = await fetch("http://127.0.0.1:5000/mestre/personagens");
      if (res.ok) setPersonagens(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function selecionarChar(char: any) {
    setCharSelecionado(char);
    carregarGrimorio(char.id);
  }

  async function carregarGrimorio(charId: number) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/meu-grimorio/${charId}`);
        if (res.ok) setGrimorio(await res.json());
    } catch (e) { console.error(e); }
  }

  // --- AÇÕES DO MESTRE ---

  async function toggleStatus(magia: any) {
    try {
        const res = await fetch("http://127.0.0.1:5000/mestre/habilidade/status", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_vinculo: magia.id_vinculo, ativo: !magia.is_active })
        });
        
        if (res.ok) {
            showNotification(`Status alterado!`, "sucesso");
            carregarGrimorio(charSelecionado.id);
        }
    } catch (e) { showNotification("Erro ao alterar status.", "erro"); }
  }

  async function salvarEdicaoNivel() {
    if (!editandoMagia) return;
    try {
        const res = await fetch("http://127.0.0.1:5000/mestre/habilidade/editar", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_vinculo: editandoMagia.id_vinculo, nivel: novoNivel })
        });
        
        if (res.ok) {
            showNotification("Nível alterado!", "sucesso");
            setEditandoMagia(null);
            carregarGrimorio(charSelecionado.id);
        }
    } catch (e) { showNotification("Erro ao editar.", "erro"); }
  }

  // NOVA FUNÇÃO DE CRIAR/ADICIONAR
  async function criarEAdicionarHabilidade() {
    if (!novaMagia.nome) { showNotification("O nome é obrigatório!", "erro"); return; }
    
    try {
        const res = await fetch("http://127.0.0.1:5000/mestre/adicionar-habilidade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                personagem_id: charSelecionado.id, 
                nome_habilidade: novaMagia.nome, 
                tipo: novaMagia.tipo,
                descricao: novaMagia.descricao,
                detalhes: novaMagia.detalhes,
                nivel: 1 
            })
        });

        if (res.status === 201 || res.status === 200) {
            const data = await res.json();
            showNotification(data.mensagem, "sucesso");
            setShowAddModal(false);
            setNovaMagia({ nome: "", tipo: "Ataque", descricao: "", detalhes: "" }); // Limpa form
            carregarGrimorio(charSelecionado.id);
        } else {
            const erro = await res.json();
            showNotification(erro.erro || "Erro ao adicionar.", "erro");
        }
    } catch (e) { showNotification("Erro de conexão.", "erro"); }
  }

  if (loading) return <div className="flex h-screen items-center justify-center font-mono text-2xl animate-pulse">Carregando Fichas...</div>;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
        
        {/* LISTA DE PERSONAGENS (ESQUERDA) */}
        <div className={`w-full md:w-1/3 ${theme.panel} border ${theme.border} rounded-xl flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-white/10 bg-black/20">
                <h2 className={`font-black uppercase tracking-wider ${theme.primary} flex items-center gap-2`}>👥 Personagens</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {personagens.map((char) => (
                    <button 
                        key={char.id} onClick={() => selecionarChar(char)}
                        className={`w-full p-4 rounded-lg text-left transition-all border border-transparent ${charSelecionado?.id === char.id ? `bg-white/10 border-white/20 ${theme.primary}` : 'hover:bg-white/5 hover:border-white/5 opacity-70 hover:opacity-100'}`}
                    >
                        <div className="font-bold text-lg">{char.nome}</div>
                        <div className="text-xs font-mono opacity-50 uppercase">{char.classe} • Lvl {char.nivel || 1}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* DETALHES (DIREITA) */}
        <div className={`w-full md:w-2/3 ${theme.panel} border ${theme.border} rounded-xl flex flex-col overflow-hidden relative`}>
            {charSelecionado ? (
                <>
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/40 to-transparent flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">{charSelecionado.nome}</h1>
                            <p className="opacity-60 font-mono text-sm mt-1">{charSelecionado.classe}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">XP Livre</span>
                            <span className="text-2xl font-mono text-green-400">{charSelecionado.xp_livre}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold uppercase tracking-widest ${theme.primary}`}>📖 Grimório</h3>
                            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">+ Criar/Adicionar</button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {grimorio.length === 0 && <p className="opacity-30 italic text-center py-10">Grimório Vazio.</p>}
                            {grimorio.map((magia) => (
                                <div key={magia.id_vinculo} className={`p-4 rounded-xl border ${magia.is_active ? 'bg-white/5 border-white/10' : 'bg-red-900/10 border-red-900/30 opacity-60 grayscale'} transition-all group hover:border-white/30 flex justify-between items-center`}>
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-3">
                                            <h4 className={`font-bold text-lg ${magia.is_active ? 'text-white' : 'text-red-400 line-through'}`}>{magia.nome}</h4>
                                            <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded border border-white/10">NVL {magia.nivel}</span>
                                            <span className="text-[10px] uppercase opacity-50 tracking-wide">{magia.tipo}</span>
                                        </div>
                                        <p className="text-xs opacity-50 mt-1 line-clamp-2">{magia.descricao}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditandoMagia(magia); setNovoNivel(magia.nivel); }} className="p-2 hover:bg-white/10 rounded-lg text-blue-400" title="Editar Nível">✏️</button>
                                        <button onClick={() => toggleStatus(magia)} className={`p-2 hover:bg-white/10 rounded-lg ${magia.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`} title={magia.is_active ? "Inativar" : "Reativar"}>{magia.is_active ? "🚫" : "✅"}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full opacity-30 flex-col gap-4"><span className="text-6xl">🛡️</span><p className="uppercase tracking-widest font-bold">Selecione um Personagem</p></div>
            )}
        </div>

        {/* --- MODAL DE EDITAR NÍVEL --- */}
        {editandoMagia && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in">
                <div className={`${theme.panel} border ${theme.border} p-6 rounded-xl w-full max-w-sm shadow-2xl`}>
                    <h3 className="font-bold uppercase tracking-widest mb-4">Editar Nível</h3>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <button onClick={() => setNovoNivel(n => Math.max(1, n-1))} className="w-10 h-10 rounded bg-white/10 hover:bg-white/20 font-bold">-</button>
                        <span className="text-4xl font-mono font-black">{novoNivel}</span>
                        <button onClick={() => setNovoNivel(n => Math.min(6, n+1))} className="w-10 h-10 rounded bg-white/10 hover:bg-white/20 font-bold">+</button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setEditandoMagia(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-bold text-xs uppercase">Cancelar</button>
                        <button onClick={salvarEdicaoNivel} className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-xs uppercase text-white shadow-lg">Salvar</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- NOVO MODAL: CRIAR HABILIDADE --- */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-in zoom-in-95">
                <div className={`${theme.panel} border ${theme.border} p-8 rounded-2xl w-full max-w-lg shadow-2xl relative`}>
                    <h3 className="font-black text-xl uppercase tracking-widest mb-6 text-green-400 flex items-center gap-2">
                        <span>✨</span> Criar / Adicionar Habilidade
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Nome da Habilidade</label>
                            <input 
                                value={novaMagia.nome} 
                                onChange={e => setNovaMagia({...novaMagia, nome: e.target.value})} 
                                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg outline-none focus:border-green-500 transition-colors font-bold text-white"
                                placeholder="Ex: Soco de Vento"
                                autoFocus
                            />
                        </div>

                        {/* Tipo */}
                        <div>
                            <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Tipo</label>
                            <select 
                                value={novaMagia.tipo} 
                                onChange={e => setNovaMagia({...novaMagia, tipo: e.target.value})} 
                                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg outline-none focus:border-white transition-colors cursor-pointer text-sm"
                            >
                                <option value="Ataque">Ataque ⚔️</option>
                                <option value="Defesa">Defesa 🛡️</option>
                                <option value="Passiva">Passiva ✨</option>
                                <option value="Controle">Controle 🕸️</option>
                                <option value="Buff">Buff 💪</option>
                                <option value="Mental">Mental 🧠</option>
                                <option value="Mobilidade">Mobilidade 👟</option>
                                <option value="Outro">Outro ❓</option>
                            </select>
                        </div>

                        {/* Descrição Curta */}
                        <div>
                            <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Descrição Curta (Card)</label>
                            <textarea 
                                value={novaMagia.descricao} 
                                onChange={e => setNovaMagia({...novaMagia, descricao: e.target.value})} 
                                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg outline-none focus:border-white transition-colors resize-none text-sm h-20"
                                placeholder="O que ela faz resumidamente..."
                            />
                        </div>

                        {/* Detalhes (Opcional) */}
                        <div>
                            <label className="text-[10px] font-bold uppercase opacity-60 mb-1 block">Detalhes & Regras (Modal)</label>
                            <textarea 
                                value={novaMagia.detalhes} 
                                onChange={e => setNovaMagia({...novaMagia, detalhes: e.target.value})} 
                                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg outline-none focus:border-white transition-colors resize-none text-sm h-24 font-mono"
                                placeholder="Regras de dados, duração, observações..."
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-8">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase transition-colors">Cancelar</button>
                        <button onClick={criarEAdicionarHabilidade} className="flex-1 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-black text-xs uppercase text-white shadow-lg transform active:scale-95 transition-all">CRIAR & VINCULAR</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </PageWrapper>
  );
}