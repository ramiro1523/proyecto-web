// src/AppDenuncias.js
import React, { useEffect, useState } from "react";
import Cuenta from "./Cuenta";
import Mapa from "./Mapa";
import MisDenuncias from "./MisDenuncias";
import PanelAutoridades from "./PanelAutoridades";
import Estadisticas from "./Estadisticas";
import "./styles.css";
import { ls, seedData } from "./storage";

function AppDenuncias() {
  const [tab, setTab] = useState("denunciar");
  const [user, setUser] = useState(ls.get("currentUser", null));

  useEffect(() => {
    seedData();
    setUser(ls.get("currentUser", null));
    // eslint-disable-next-line
  }, []);

  const handleLogin = (u) => {
    ls.set("currentUser", u);
    setUser(u);
  };

  const handleLogout = () => {
    ls.set("currentUser", null);
    setUser(null);
  };

  return (
    <div className="wrap app-denuncias">
      <header className="topbar">
        <div className="brand">
          <div className="logo"><span>DC</span></div>
          <div>
            <div className="brand-title">Plataforma de Denuncia Ciudadana</div>
            <div className="brand-sub">ODS 11 · ODS 16 · Baches · Alumbrado · Residuos · Seguridad</div>
          </div>
        </div>

        <nav id="navTabs">
          <button className={tab === "denunciar" ? "tab active" : "tab"} onClick={() => setTab("denunciar")}>Denunciar</button>
          <button className={tab === "misdenuncias" ? "tab active" : "tab"} onClick={() => setTab("misdenuncias")}>Mis denuncias</button>
          <button className={tab === "autoridades" ? "tab active" : "tab"} onClick={() => setTab("autoridades")}>Panel autoridades</button>
          <button className={tab === "estadisticas" ? "tab active" : "tab"} onClick={() => setTab("estadisticas")}>Estadísticas</button>
          <button className={tab === "cuenta" ? "tab active" : "tab"} onClick={() => setTab("cuenta")}>Cuenta</button>
        </nav>
      </header>

      <main>
        <aside className="side">
          <div className="card">
            <div className="body">
              <h3>Resumen</h3>
              <div className="kpi">
                <div className="item"><small>Total</small><div id="kpiTotal" className="kpi-num">{ls.get("reports", []).length}</div></div>
                <div className="item"><small>Resueltas</small><div id="kpiResueltas" className="kpi-num kpi-ok">{ls.get("reports", []).filter(r => r.estado === "Resuelta").length}</div></div>
                <div className="item"><small>En proceso</small><div id="kpiProceso" className="kpi-num kpi-warn">{ls.get("reports", []).filter(r => r.estado === "En proceso").length}</div></div>
                <div className="item"><small>Enviadas</small><div id="kpiEnviadas" className="kpi-num kpi-info">{ls.get("reports", []).filter(r => r.estado === "Enviada").length}</div></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="body">
              <h3>Buenas prácticas</h3>
              <ul className="tips">
                <li>Envía fotos claras del problema.</li>
                <li>Activa tu ubicación para georreferenciar.</li>
                <li>Haz seguimiento del estado y comenta.</li>
              </ul>
            </div>
          </div>
        </aside>

        <section className="card">
          <div className="body">
            {tab === "denunciar" && <Mapa user={user} />}
            {tab === "misdenuncias" && <MisDenuncias user={user} />}
            {tab === "autoridades" && <PanelAutoridades user={user} />}
            {tab === "estadisticas" && <Estadisticas />}
            {tab === "cuenta" && <Cuenta user={user} onLogin={handleLogin} onLogout={handleLogout} />}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AppDenuncias;
