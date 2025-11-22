"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ParticlesBackground from "../../components/ParticlesBackground";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setErro("");

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
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      
      {/* Fundo de Partículas */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>

      {/* Cartão de Login */}
      <div className="z-10 w-full max-w-md rounded-2xl bg-slate-900/90 p-8 shadow-2xl border border-slate-800 relative backdrop-blur-sm mx-4">
        
        <div className="text-center mb-8">
            <div className="text-5xl mb-2 drop-shadow-lg animate-bounce">
                🔐
            </div>
            <h1 className="text-3xl font-bold text-purple-500">
                Acesso ao Grimório
            </h1>
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

          {erro && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{erro}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20 mt-4"
          >
            ENTRAR
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