"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados para Feedback Visual
  const [msg, setMsg] = useState("");
  const [tipoMsg, setTipoMsg] = useState(""); // "erro" ou "sucesso"
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: any) {
    e.preventDefault();
    setMsg("");
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
        
        setTipoMsg("sucesso");
        setMsg(`Bem-vindo, ${data.username}! Entrando...`);
        
        // Pequeno delay para o usuário ler antes de mudar de página
        setTimeout(() => router.push("/"), 1000);
      } else {
        setTipoMsg("erro");
        setMsg(data.erro || "Falha ao entrar.");
      }
    } catch (err) {
      setTipoMsg("erro");
      setMsg("Servidor indisponível. Tente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      <div className="z-10 w-full max-w-md rounded-2xl bg-slate-900/90 p-8 shadow-2xl border border-slate-800 relative backdrop-blur-sm mx-4">
        
        <div className="text-center mb-8">
            <div className="text-5xl mb-2 drop-shadow-lg animate-bounce">🔐</div>
            <h1 className="text-3xl font-bold text-purple-500">Acesso ao Grimório</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-slate-800 p-3 text-white border border-slate-700 focus:border-purple-500 focus:outline-none transition-all"
              placeholder="Seu nome de herói"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 p-3 text-white border border-slate-700 focus:border-purple-500 focus:outline-none transition-all"
              placeholder="••••••"
            />
          </div>

          {/* --- ÁREA DE FEEDBACK (Sem Pop-up!) --- */}
          {msg && (
            <div className={`text-center p-3 rounded-lg text-sm font-bold animate-pulse ${tipoMsg === "erro" ? "bg-red-900/50 text-red-200 border border-red-800" : "bg-green-900/50 text-green-200 border border-green-800"}`}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando..." : "ENTRAR"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800 pt-4">
          <p className="text-sm text-slate-500 mb-2">Ainda não tem uma conta?</p>
          <button
            onClick={() => router.push("/register")}
            className="w-full rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            CRIAR NOVA CONTA
          </button>
        </div>

      </div>
    </div>
  );
}