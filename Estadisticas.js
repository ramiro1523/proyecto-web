// src/Estadisticas.js
import React, { useEffect, useRef } from "react";
import { ls } from "./storage";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Estadisticas() {
  const chartEstadosRef = useRef(null);
  const chartCategoriasRef = useRef(null);
  let cEstados = useRef(null);
  let cCategorias = useRef(null);

  useEffect(() => {
    const reps = ls.get("reports", []);
    const estados = ["Enviada", "En proceso", "Resuelta"];
    const estData = estados.map(e => reps.filter(r => r.estado === e).length);
    const cats = ["Bache", "Alumbrado", "Residuos", "Seguridad", "Otro"];
    const catData = cats.map(c => reps.filter(r => r.categoria === c).length);
    const opt = { responsive: true, plugins: { legend: { display: false } } };

    if (cEstados.current) cEstados.current.destroy();
    if (cCategorias.current) cCategorias.current.destroy();

    cEstados.current = new Chart(chartEstadosRef.current, { type: "bar", data: { labels: estados, datasets: [{ label: "Cantidad", data: estData }] }, options: opt });
    cCategorias.current = new Chart(chartCategoriasRef.current, { type: "doughnut", data: { labels: cats, datasets: [{ label: "Incidencias", data: catData }] }, options: opt });

    return () => {
      if (cEstados.current) cEstados.current.destroy();
      if (cCategorias.current) cCategorias.current.destroy();
    };
  }, []);

  return (
    <div>
      <h2>Estadísticas</h2>
      <div className="grid cols-2">
        <div className="card"><div className="body"><canvas ref={chartEstadosRef} id="chartEstados" height="180" /></div></div>
        <div className="card"><div className="body"><canvas ref={chartCategoriasRef} id="chartCategorias" height="180" /></div></div>
      </div>
    </div>
  );
}
