"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-xl w-96 border border-slate-800">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-500">Login RPG</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Usuário" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none" 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none" 
          />
          {/* ... (inputs e botão de entrar acima) ... */}
          
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
          >
            ENTRAR
          </button>
        </form>

        {/* --- BOTÃO DE TROCA --- */}
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