// src/PanelAutoridades.js
import React, { useEffect, useState } from "react";
import { ls } from "./storage";

export default function PanelAutoridades({ user }) {
  const [list, setList] = useState([]);
  const [cat, setCat] = useState("");
  const [est, setEst] = useState("");

  useEffect(() => {
    renderList();
    // eslint-disable-next-line
  }, [user, cat, est]);

  function renderList() {
    const u = ls.get("currentUser", null);
    if (!(u && u.rol === "autoridad")) {
      setList([]);
      return;
    }
    const all = ls.get("reports", []);
    const filtered = all.filter(x => !cat || x.categoria === cat).filter(x => !est || x.estado === est);
    setList(filtered);
  }

  function updateEstado(id, nuevo) {
    const arr = ls.get("reports", []);
    const idx = arr.findIndex(x => x.id === id);
    if (idx > -1) {
      arr[idx].estado = nuevo;
      ls.set("reports", arr);
      renderList();
      alert("Estado actualizado");
    }
  }

  return (
    <div>
      <h2>Panel de autoridades</h2>
      <div id="authAlert" className="muted spb10" style={{ display: (user && user.rol === "autoridad") ? "none" : "block" }}>Inicia sesión como autoridad en Cuenta para gestionar denuncias.</div>
      <div className="row spb12">
        <select id="filtrarCategoria" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          <option>Bache</option>
          <option>Alumbrado</option>
          <option>Residuos</option>
          <option>Seguridad</option>
          <option>Otro</option>
        </select>
        <select id="filtrarEstado" value={est} onChange={(e) => setEst(e.target.value)}>
          <option value="">Todos los estados</option>
          <option>Enviada</option>
          <option>En proceso</option>
          <option>Resuelta</option>
        </select>
      </div>

      <div id="tablaAutoridades" className="list">
        {user && user.rol === "autoridad" ? (
          list.length ? list.map(d => (
            <div key={d.id} className="ticket">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>{d.titulo}</div>
                <span className={`pill ${d.estado === "Resuelta" ? "resuelta" : (d.estado === "En proceso" ? "proceso" : "enviada")}`}>{d.estado}</span>
              </div>
              <div className="meta">
                <span className="pill">{d.categoria}</span>
                <span className="pill">{new Date(d.creado).toLocaleString()}</span>
                <span className="pill">{isFinite(d.lat) && isFinite(d.lng) ? `${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : "—"}</span>
                <span className="pill">por {d.creador}</span>
              </div>
              <div style={{ color: "#c9d6ff" }}>{d.descripcion}</div>
              {d.foto ? <img src={d.foto} alt="foto" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }} /> : null}
              <div className="row" style={{ marginTop: 8 }}>
                <select defaultValue={d.estado} onChange={(e) => updateEstado(d.id, e.target.value)}>
                  <option>Enviada</option>
                  <option>En proceso</option>
                  <option>Resuelta</option>
                </select>
              </div>
            </div>
          )) : <small className="muted">Sin registros.</small>
        ) : (
          <small className="muted">Acceso restringido. Inicia sesión como autoridad.</small>
        )}
      </div>
    </div>
  );
}
