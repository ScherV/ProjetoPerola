"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  // Carrega a lista de usuários
  async function carregarUsuarios() {
    const res = await fetch("http://127.0.0.1:5000/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    // Proteção básica: Se não for admin (salvo no login), chuta fora
    if (localStorage.getItem("rpg_user") !== "admin") {
        alert("Acesso Negado!");
        router.push("/");
    }
    carregarUsuarios();
  }, []);

  // Função para promover/rebaixar
  async function toggleMaster(id: number, statusAtual: boolean) {
    await fetch(`http://127.0.0.1:5000/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_master: !statusAtual }),
    });
    carregarUsuarios();
  }

  // Função para BANIR
  async function banirUsuario(id: number, nome: string) {
    if (confirm(`Tem certeza que deseja banir ${nome}? Isso apagará o personagem dele!`)) {
        await fetch(`http://127.0.0.1:5000/users/${id}`, { method: "DELETE" });
        carregarUsuarios();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-500">👑 Painel do Deus (Admin)</h1>
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white">Voltar</button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-purple-400">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Usuário</th>
              <th className="p-4">Cargo</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-800/50">
                <td className="p-4 text-slate-500">#{u.id}</td>
                <td className="p-4 font-bold">{u.username}</td>
                <td className="p-4">
                  {u.is_admin ? (
                    <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs border border-red-700">DEUS</span>
                  ) : u.is_master ? (
                    <span className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded text-xs border border-yellow-700">MESTRE</span>
                  ) : (
                    <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs border border-blue-700">JOGADOR</span>
                  )}
                </td>
                <td className="p-4 flex justify-center gap-3">
                  {!u.is_admin && (
                    <>
                      <button 
                        onClick={() => toggleMaster(u.id, u.is_master)}
                        className="px-3 py-1 rounded bg-slate-700 hover:bg-purple-600 text-xs transition-colors"
                      >
                        {u.is_master ? "Rebaixar p/ Jogador" : "Promover p/ Mestre"}
                      </button>
                      
                      <button 
                        onClick={() => banirUsuario(u.id, u.username)}
                        className="px-3 py-1 rounded bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50 text-xs transition-colors"
                      >
                        BANIR
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}