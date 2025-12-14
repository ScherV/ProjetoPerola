"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../components/contexts/ThemeContext";
import { useNotification } from "../../components/contexts/NotificationContext";
// 1. IMPORTAR PARTÍCULAS
import ParticlesBackground from "../../components/ParticlesBackground"; 

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showNotification } = useNotification(); 

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. ESTADO PARA MESTRE
  const [isMasterRegister, setIsMasterRegister] = useState(false); 
  
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("rpg_user", data.username);
        localStorage.setItem("is_master", data.is_master);
        
        showNotification(`Bem-vindo, ${data.username}!`, "sucesso");
        router.push("/");
      } else {
        showNotification(data.erro || "Falha ao entrar.", "erro");
      }
    } catch (error) {
      showNotification("Servidor indisponível.", "erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 3. ENVIAR IS_MASTER
        body: JSON.stringify({ username, password, is_master: isMasterRegister }), 
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Conta criada! Faça login.", "sucesso");
        setIsRegister(false);
        setIsMasterRegister(false);
      } else {
        showNotification(data.erro || "Erro ao criar conta.", "erro");
      }
    } catch (error) {
      showNotification("Erro ao conectar.", "erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden ${theme.bg} ${theme.text}`}>
      
      {/* 4. PARTÍCULAS NO FUNDO */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>
      
      {/* CARD DE LOGIN (z-10 para ficar acima das partículas) */}
      <div className={`relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl border ${theme.panel} ${theme.border} backdrop-blur-md`}>
        
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.button}`}></div>

        <div className="text-center mb-8">
          <h1 className={`text-4xl font-black uppercase tracking-widest ${theme.primary} mb-2 drop-shadow-lg`}>
            Grimório RPG
          </h1>
          <p className="text-sm opacity-60 font-mono">
            {isRegister ? "Crie sua lenda" : "Acesse o sistema"}
          </p>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="flex flex-col gap-5">
          
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase opacity-70 ml-1">Usuário</label>
            <input
              type="text"
              placeholder="Nome do viajante..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-4 rounded-xl border bg-black/20 focus:bg-black/40 outline-none transition-all ${theme.border} focus:border-current`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase opacity-70 ml-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-4 rounded-xl border bg-black/20 focus:bg-black/40 outline-none transition-all ${theme.border} focus:border-current`}
              required
            />
          </div>

          {/* 5. CHECKBOX DE MESTRE (Só aparece no registro) */}
          {isRegister && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setIsMasterRegister(!isMasterRegister)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isMasterRegister ? 'bg-purple-600 border-purple-400' : 'border-white/30'}`}>
                    {isMasterRegister && <span className="text-xs font-bold text-white">✓</span>}
                </div>
                <span className="text-sm font-bold opacity-80">Sou um Mestre (Narrador)</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-4 rounded-xl font-black uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all bg-gradient-to-r ${theme.button} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processando..." : isRegister ? "Criar Conta" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
                setIsRegister(!isRegister);
                setIsMasterRegister(false);
            }}
            className={`text-xs font-bold uppercase tracking-wide opacity-60 hover:opacity-100 hover:${theme.primary} transition-colors border-b border-transparent hover:border-current pb-0.5`}
          >
            {isRegister ? "Já tenho uma conta? Entrar" : "Não tem conta? Criar agora"}
          </button>
        </div>

      </div>
      
      <p className="relative z-10 mt-8 text-[10px] opacity-30 font-mono uppercase tracking-[0.2em]">Sistema v1.0 • Projeto Pérola</p>
    </div>
  );
}