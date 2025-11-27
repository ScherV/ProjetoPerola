"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";
import { useTheme } from "../../components/contexts/ThemeContext"; // <--- IMPORTAR

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme(); // <--- USAR O TEMA

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: any) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, is_master: isMaster }),
      });

      if (response.status === 201) {
        alert(`Conta criada!`);
        router.push("/login");
      } else {
        const data = await response.json();
        setErro(data.erro || "Erro ao criar conta");
      }
    } catch (err) {
      setErro("Erro de conexão.");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${theme.bg} ${theme.text} transition-colors duration-500`}>
      
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      <div className={`z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl border relative backdrop-blur-md mx-4 ${theme.panel} ${theme.border}`}>
        
        <h1 className={`text-2xl font-bold mb-2 text-center ${theme.primary}`}>Criar Conta</h1>
        <p className="text-center opacity-60 mb-6 text-sm">Junte-se à aventura</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            type="text" placeholder="Nome de Usuário" value={username} onChange={e => setUsername(e.target.value)} 
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:border-current outline-none transition-colors" 
          />
          <input 
            type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 rounded-lg bg-black/30 border border-white/10 focus:border-current outline-none transition-colors" 
          />

          <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/10">
            <input type="checkbox" id="masterCheck" checked={isMaster} onChange={e => setIsMaster(e.target.checked)} className="w-5 h-5 accent-current cursor-pointer" />
            <label htmlFor="masterCheck" className="cursor-pointer select-none text-sm opacity-80">Eu sou um <strong className={theme.primary}>Mestre de RPG</strong></label>
          </div>

          {erro && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-500/30">{erro}</p>}
          
          <button type="submit" disabled={loading} className={`w-full p-3 rounded-lg font-bold transition-all transform active:scale-95 shadow-lg bg-gradient-to-r ${theme.button} disabled:opacity-50`}>
            {loading ? "CRIANDO..." : "CRIAR CONTA"}
          </button>
        </form>
        
        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <p className="text-sm opacity-60 mb-2">Já possui um cadastro?</p>
          <button onClick={() => router.push("/login")} className="w-full rounded-lg border border-white/20 py-2 text-sm font-medium hover:bg-white/10 transition-all">FAZER LOGIN</button>
        </div>

      </div>
    </div>
  );
}