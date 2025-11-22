"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados do Formulário
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isMaster, setIsMaster] = useState(false); // <--- NOVO ESTADO (Começa como Jogador/Falso)
  const [erro, setErro] = useState("");

  async function handleRegister(e: any) {
    e.preventDefault();
    setErro("");

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // AGORA ENVIAMOS A ESCOLHA DO USUÁRIO
        body: JSON.stringify({ 
            username, 
            password, 
            is_master: isMaster 
        }),
      });

      if (response.status === 201) {
        alert(`Conta de ${isMaster ? "Mestre" : "Jogador"} criada com sucesso!`);
        router.push("/login");
      } else {
        const data = await response.json();
        setErro(data.erro || "Erro ao criar conta");
      }
    } catch (err) {
      setErro("Erro de conexão.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-xl w-96 border border-slate-800 shadow-lg">
        
        <h1 className="text-2xl font-bold mb-2 text-center text-green-500">Criar Conta</h1>
        <p className="text-center text-slate-400 mb-6 text-sm">Junte-se à aventura</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Inputs de Texto */}
          <input 
            type="text" 
            placeholder="Nome de Usuário" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-green-500 outline-none transition-colors" 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-green-500 outline-none transition-colors" 
          />

          {/* --- NOVO: CHECKBOX DE MESTRE --- */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded border border-slate-800">
            <input 
              type="checkbox" 
              id="masterCheck"
              checked={isMaster}
              onChange={e => setIsMaster(e.target.checked)}
              className="w-5 h-5 accent-green-500 cursor-pointer"
            />
            <label htmlFor="masterCheck" className="cursor-pointer select-none text-sm text-slate-300">
              Eu sou um <strong className="text-green-400">Mestre de RPG</strong>
            </label>
          </div>

          {erro && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{erro}</p>}
          
          <button type="submit" className="w-full bg-green-600 p-3 rounded font-bold hover:bg-green-700 transition-all transform active:scale-95">
            CRIAR CONTA
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-500">
          Já tem conta? <a href="/login" className="text-green-400 hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}