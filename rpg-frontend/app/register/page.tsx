"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";

export default function RegisterPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  
  // Estados de Feedback
  const [msg, setMsg] = useState("");
  const [tipoMsg, setTipoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: any) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, is_master: isMaster }),
      });

      if (response.status === 201) {
        setTipoMsg("sucesso");
        setMsg("Conta criada com sucesso! Redirecionando...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        const data = await response.json();
        setTipoMsg("erro");
        setMsg(data.erro || "Erro ao criar conta");
      }
    } catch (err) {
      setTipoMsg("erro");
      setMsg("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      <div className="z-10 w-full max-w-md rounded-2xl bg-slate-900/90 p-8 shadow-2xl border border-slate-800 relative backdrop-blur-sm mx-4">
        
        <h1 className="text-2xl font-bold mb-2 text-center text-green-500">Criar Conta</h1>
        <p className="text-center text-slate-400 mb-6 text-sm">Junte-se à aventura</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Nome de Usuário" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-green-500 outline-none transition-colors text-white" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-green-500 outline-none transition-colors text-white" />

          <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded border border-slate-800">
            <input type="checkbox" id="masterCheck" checked={isMaster} onChange={e => setIsMaster(e.target.checked)} className="w-5 h-5 accent-green-500 cursor-pointer" />
            <label htmlFor="masterCheck" className="cursor-pointer select-none text-sm text-slate-300">Eu sou um <strong className="text-green-400">Mestre de RPG</strong></label>
          </div>

          {/* FEEDBACK VISUAL */}
          {msg && (
            <div className={`text-center p-3 rounded-lg text-sm font-bold animate-pulse ${tipoMsg === "erro" ? "bg-red-900/50 text-red-200 border border-red-800" : "bg-green-900/50 text-green-200 border border-green-800"}`}>
              {msg}
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-green-600 p-3 rounded font-bold hover:bg-green-700 transition-all transform active:scale-95 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "CRIANDO..." : "CRIAR CONTA"}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-slate-800 pt-4">
          <p className="text-sm text-slate-500 mb-2">Já possui um cadastro?</p>
          <button onClick={() => router.push("/login")} className="w-full rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all">FAZER LOGIN</button>
        </div>

      </div>
    </div>
  );
}