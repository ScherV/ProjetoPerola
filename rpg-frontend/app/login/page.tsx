"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";
import { useTheme } from "../../components/contexts/ThemeContext"; // <--- IMPORTAR

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme(); // <--- USAR O TEMA

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem("rpg_user", data.username);
        localStorage.setItem("is_master", data.is_master);
        localStorage.setItem("user_id", data.user_id);
        router.push("/"); 
      } else {
        setErro(data.erro || "Erro ao logar");
      }
    } catch (err) {
      setErro("Erro de conexão.");
    } finally {
        setLoading(false);
    }
  }

  return (
    // Fundo dinâmico baseado no tema
    <div className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${theme.bg} ${theme.text} transition-colors duration-500`}>
      
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      {/* Painel com a cor do tema (theme.panel) */}
      <div className={`z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl border relative backdrop-blur-md mx-4 ${theme.panel} ${theme.border}`}>
        
        <div className="text-center mb-8">
            <div className="text-5xl mb-2 drop-shadow-lg animate-bounce">🔐</div>
            <h1 className={`text-3xl font-bold ${theme.primary}`}>
                Acesso ao Grimório
            </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium opacity-80 mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-black/30 p-3 border border-white/10 focus:border-current outline-none transition-all"
              placeholder="Seu nome de herói"
            />
          </div>

          <div>
            <label className="block text-sm font-medium opacity-80 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-black/30 p-3 border border-white/10 focus:border-current outline-none transition-all"
              placeholder="••••••"
            />
          </div>

          {erro && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-500/30">{erro}</p>}

          {/* Botão com gradiente do tema */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3 font-bold text-white shadow-lg transition-all mt-4 bg-gradient-to-r ${theme.button} disabled:opacity-50`}
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <p className="text-sm opacity-60 mb-2">Ainda não tem uma conta?</p>
          <button
            onClick={() => router.push("/register")}
            className="w-full rounded-lg border border-white/20 py-2 text-sm font-medium hover:bg-white/10 transition-all"
          >
            CRIAR NOVA CONTA
          </button>
        </div>

      </div>
    </div>
  );
}