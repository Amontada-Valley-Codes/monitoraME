import React from "react";

export function AuthHeroPanel() {
  return (
    <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-6 lg:p-8 flex flex-col justify-between h-full min-h-[580px] relative overflow-hidden shadow-sm">
      {/* Topo do painel */}
      <div className="flex justify-between items-center z-10">
        <div className="bg-white px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
          SLA Cidadão 99.8%
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 text-slate-600">
          🔔
        </div>
      </div>

      {/* Elementos flutuantes superiores */}
      <div className="flex justify-between items-center px-2 z-10">
        <div className="bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
          <span className="text-xs">🏛️</span>
          <div className="text-[10px] leading-tight text-slate-600 font-medium">
            Controle Interno<br />Audit. Estadual
          </div>
        </div>
        
        <div className="bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <div className="text-xs font-bold text-slate-800">
            184 <span className="text-[10px] font-normal text-slate-400 block">MUNICÍPIOS ATIVOS</span>
          </div>
        </div>
      </div>

      {/* Centro com o círculo pontilhado e o card central */}
      <div className="my-auto py-6 flex flex-col items-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 border border-dashed border-slate-300 rounded-full opacity-60" />
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 text-center z-10 w-48">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl mx-auto mb-2 flex items-center justify-center text-indigo-600">
            🟦
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Poder público</h4>
          <p className="text-[10px] text-slate-400">Conformidade 100%</p>
        </div>

        <div className="mt-4 z-10 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-medium shadow-md flex items-center gap-1.5">
          <span>⚡</span> Diário Oficial Sincronizado
        </div>
      </div>

      {/* Bloco inferior flutuante */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between z-10">
        <div>
          <div className="text-xs font-bold text-slate-800">Índice de Transparência</div>
          <div className="text-[10px] text-slate-400">4.280 licitações tiradas hoje</div>
          <span className="inline-block mt-1 bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-medium">
            Padrões de controle público
          </span>
        </div>
        <div className="w-10 h-10 rounded-full border-4 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-600">
          88%
        </div>
      </div>

      {/* Rodapé do painel */}
      <div className="z-10 text-center mt-6 pt-4 border-t border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm mb-0.5">
          Inteligência fiscal e transparência pública ao seu alcance
        </h3>
        <p className="text-[10px] text-slate-400">
          Painel Oficial MonitoraME • Licenciamento Cívico Livre
        </p>
      </div>
    </div>
  );
}
