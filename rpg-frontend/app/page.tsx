"use client";
import { useState } from "react";

export default function Home() {
  // Variáveis que guardam o que está escrito na tela
  const [qtd, setQtd] = useState(1);
  const [faces, setFaces] = useState(20);
  const [bonus, setBonus] = useState(0);
  const [resultado, setResultado] = useState<any>(null);

  // Função que conecta com o seu Python
  async function rolarDado() {
    try {
      const response = await fetch("http://127.0.0.1:5000/rolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qtd: Number(qtd),
          faces: Number(faces),
          bonus: Number(bonus),
        }),
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error("Erro ao conectar:", error);
      alert("Erro! O servidor Python (app.py) está rodando?");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans p-4">
      
      {/* Cartão Principal */}
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        
        <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Rolagem de Dados
        </h1>

        <div className="space-y-6">
          
          {/* Input: Quantidade */}
          <div className="flex justify-between items-center">
            <label className="font-bold text-slate-300">Dados:</label>
            <input
              type="number"
              value={qtd}
              onChange={(e) => setQtd(Number(e.target.value))}
              className="w-24 p-2 rounded-lg bg-slate-800 border border-slate-600 text-center focus:border-purple-500 focus:outline-none text-white"
            />
          </div>

          {/* Input: Lados */}
          <div className="flex justify-between items-center">
            <label className="font-bold text-slate-300">Lados (d):</label>
            <input
              type="number"
              value={faces}
              onChange={(e) => setFaces(Number(e.target.value))}
              className="w-24 p-2 rounded-lg bg-slate-800 border border-slate-600 text-center focus:border-purple-500 focus:outline-none text-white"
            />
          </div>

          {/* Input: Bônus */}
          <div className="flex justify-between items-center">
            <label className="font-bold text-slate-300">Bônus (+):</label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value))}
              className="w-24 p-2 rounded-lg bg-slate-800 border border-slate-600 text-center focus:border-purple-500 focus:outline-none text-white"
            />
          </div>

          {/* Botão de Rolar */}
          <button
            onClick={rolarDado}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg mt-6"
          >
            ROLAR DADOS
          </button>
        </div>

        {/* Área de Resultado (Só aparece quando o Python responde) */}
        {resultado && (
          <div className="mt-8 p-6 bg-slate-950 rounded-xl border border-purple-500/30 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              
              <p className="text-sm text-gray-400 mb-2 font-mono">
                {resultado.formula} : [{resultado.rolagensIndividuais.join(", ")}] + {resultado.bonus}
              </p>
              
              <h2 className={`text-6xl font-black my-4 ${resultado.critico ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-white"}`}>
                {resultado.totalFinal}
              </h2>
              
              {resultado.critico && (
                <p className="text-yellow-400 font-bold text-lg animate-bounce">🔥 CRÍTICO! 🔥</p>
              )}
              
              {resultado.falhaCritica && (
                <p className="text-red-500 font-bold text-lg">💀 FALHA CRÍTICA! 💀</p>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}