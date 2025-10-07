// src/MisDenuncias.js
import React, { useEffect, useState } from "react";
import { ls } from "./storage";

function Ticket({ d, isAuthority, onUpdate }) {
  const pillClass = d.estado === "Resuelta" ? "resuelta" : (d.estado === "En proceso" ? "proceso" : "enviada");
  const foto = d.foto ? <img src={d.foto} alt="foto" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }} /> : null;
  const coord = (isFinite(d.lat) && isFinite(d.lng)) ? `${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : "—";

  return (
    <div className="ticket">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>{d.titulo}</div>
        <span className={`pill ${pillClass}`}>{d.estado}</span>
      </div>
      <div className="meta">
        <span className="pill">{d.categoria}</span>
        <span className="pill">{new Date(d.creado).toLocaleString()}</span>
        <span className="pill">{coord}</span>
        {d.creador ? <span className="pill">por {d.creador}</span> : null}
      </div>
      <div style={{ color: "#c9d6ff" }}>{d.descripcion}</div>
      {foto}
      {isAuthority ? (
        <div className="row" style={{ marginTop: 8 }}>
          <select defaultValue={d.estado} data-id={d.id} className="estadoSelector" onChange={(e) => onUpdate(d.id, e.target.value)}>
            <option>Enviada</option>
            <option>En proceso</option>
            <option>Resuelta</option>
          </select>
        </div>
      ) : null}
    </div>
  );
}

export default function MisDenuncias({ user }) {
  const [list, setList] = useState([]);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");

  useEffect(() => {
    renderList();
    // eslint-disable-next-line
  }, [user]);

  function renderList() {
    const all = ls.get("reports", []);
    const u = user;
    const t = texto.toLowerCase();
    const e = estado;
    const filtered = all
      .filter(x => u ? x.creador === u.email : false)
      .filter(x => !e || x.estado === e)
      .filter(x => !t || (x.titulo + x.categoria).toLowerCase().includes(t));
    setList(filtered);
  }

  useEffect(() => {
    renderList();
    // eslint-disable-next-line
  }, [texto, estado]);

  return (
    <div>
      <h2>Mis denuncias</h2>
      <div className="row spb10">
        <input placeholder="Buscar por título o categoría…" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Enviada">Enviada</option>
          <option value="En proceso">En proceso</option>
          <option value="Resuelta">Resuelta</option>
        </select>
      </div>

      <div className="list" id="listaMisDenuncias">
        {list.length ? list.map(d => <Ticket key={d.id} d={d} />) : <small className="muted">No hay denuncias aún.</small>}
      </div>
    </div>
  );
}
