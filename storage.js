// src/storage.js

export const ls = {
  get(key, def) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? def;
    } catch {
      return def;
    }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
};

// ---- seed inicial de datos demo
export function seedData() {
  const users = ls.get("users", []);
  const reports = ls.get("reports", []);
  if (users.length === 0) {
    ls.set("users", [
      { nombre: "Ana Ciudadana", email: "ana@demo.com", password: "1234", rol: "ciudadano" },
      { nombre: "Luis Autoridad", email: "luis@muni.com", password: "1234", rol: "autoridad" },
    ]);
  }
  if (reports.length === 0) {
    const now = Date.now();
    ls.set("reports", [
      {
        id: crypto.randomUUID(),
        titulo: "Bache frente al parque",
        categoria: "Bache",
        descripcion: "Hueco profundo, riesgo para motos.",
        foto: "",
        lat: -13.516,
        lng: -71.978,
        estado: "Enviada",
        creador: "ana@demo.com",
        creado: now - 86400000,
      },
      {
        id: crypto.randomUUID(),
        titulo: "Zona sin alumbrado",
        categoria: "Alumbrado",
        descripcion: "3 postes sin luz",
        foto: "",
        lat: -13.52,
        lng: -71.97,
        estado: "En proceso",
        creador: "ana@demo.com",
        creado: now - 43200000,
      },
      {
        id: crypto.randomUUID(),
        titulo: "Punto crítico de residuos",
        categoria: "Residuos",
        descripcion: "Acumulación constante",
        foto: "",
        lat: -13.515,
        lng: -71.975,
        estado: "Resuelta",
        creador: "ana@demo.com",
        creado: now - 7200000,
      },
    ]);
  }
}
