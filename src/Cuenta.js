// src/Cuenta.js
import React, { useState } from "react";
import { ls } from "./storage";

export default function Cuenta({ user, onLogin, onLogout }) {
  const [loginMsg, setLoginMsg] = useState("");
  const [regMsg, setRegMsg] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const { email, password } = Object.fromEntries(fd.entries());
    const u = ls.get("users", []).find(x => x.email === email && x.password === password);
    if (u) {
      ls.set("currentUser", u);
      setLoginMsg("Ingreso correcto.");
      onLogin?.(u);
    } else {
      setLoginMsg("Credenciales inválidas");
    }
  }

  function handleRegister(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nuevo = Object.fromEntries(fd.entries());
    const users = ls.get("users", []);
    if (users.some(x => x.email === nuevo.email)) {
      setRegMsg("Ese correo ya está registrado.");
      return;
    }
    users.push(nuevo);
    ls.set("users", users);
    setRegMsg("Cuenta creada. Ahora inicia sesión.");
    e.target.reset();
  }

  return (
    <div className="grid cols-2">
      <div>
        <h3>Acceder</h3>
        <form onSubmit={handleLogin}>
          <label>Correo</label>
          <input name="email" type="email" required placeholder="ciudadano@correo.com" />
          <label>Contraseña</label>
          <input name="password" type="password" required />
          <button className="primary sp8">Iniciar sesión</button>
          <small className="muted">{loginMsg}</small>
        </form>
      </div>

      <div>
        <h3>Registrarse</h3>
        <form onSubmit={handleRegister} className="grid">
          <div className="row">
            <div>
              <label>Nombre</label>
              <input name="nombre" required />
            </div>
            <div>
              <label>Rol</label>
              <select name="rol" required>
                <option value="ciudadano">Ciudadano</option>
                <option value="autoridad">Autoridad</option>
              </select>
            </div>
          </div>
          <label>Correo</label>
          <input name="email" type="email" required />
          <label>Contraseña</label>
          <input name="password" type="password" minLength="4" required />
          <button className="primary">Crear cuenta</button>
          <small className="muted">{regMsg}</small>
        </form>

        <div className="sp12">
          <button className="ghost" onClick={() => { ls.set("currentUser", null); onLogout?.(); }}>Cerrar sesión</button>
          <small className="muted ml8">{user ? `Conectado como ${user.nombre} (${user.rol})` : "No has iniciado sesión"}</small>
        </div>
      </div>
    </div>
  );
}
