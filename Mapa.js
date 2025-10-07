// src/Mapa.js
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ls } from "./storage";

export default function Mapa({ user }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [preview, setPreview] = useState("");
  const fotoInputRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map").setView([-13.516, -71.978], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    map.on("click", (e) => setLocation(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    // eslint-disable-next-line
  }, []);

  function setLocation(lat, lng) {
    const latI = document.getElementById("lat");
    const lngI = document.getElementById("lng");
    latI.value = lat.toFixed(6);
    lngI.value = lng.toFixed(6);
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    mapRef.current.setView([lat, lng], 16);
  }

  function useMyLocation() {
    if (!navigator.geolocation) { alert("Geolocalización no soportada"); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords; setLocation(latitude, longitude);
    }, () => alert("No se pudo obtener tu ubicación"));
  }

  function onFotoChange(e) {
    const f = e.target.files?.[0];
    if (!f) { setPreview(""); return; }
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(f);
  }

  function onSubmit(e) {
    e.preventDefault();
    const currentUser = ls.get("currentUser", null);
    if (!currentUser) { alert("Inicia sesión para enviar"); return; }
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    const f = fotoInputRef.current.files?.[0];

    const save = (foto64 = "") => {
      const report = {
        id: crypto.randomUUID(),
        titulo: data.titulo,
        categoria: data.categoria,
        descripcion: data.descripcion,
        foto: foto64,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        estado: "Enviada",
        creador: currentUser.email,
        creado: Date.now()
      };
      const arr = ls.get("reports", []); arr.unshift(report); ls.set("reports", arr);
      e.target.reset(); setPreview(""); if (markerRef.current) markerRef.current.remove();
      alert("Denuncia enviada");
    };

    if (f) {
      const r = new FileReader();
      r.onload = () => save(r.result);
      r.readAsDataURL(f);
    } else save();
  }

  return (
    <div>
      <h2>Nueva denuncia</h2>
      <form id="formDenuncia" onSubmit={onSubmit} className="grid cols-2">
        <div>
          <label>Título</label>
          <input name="titulo" required placeholder="Ej. Bache peligroso en la Av. Principal" />
        </div>
        <div>
          <label>Categoría</label>
          <select name="categoria" required>
            <option value="Bache">Bache</option>
            <option value="Alumbrado">Falta de alumbrado</option>
            <option value="Residuos">Acumulación de basura</option>
            <option value="Seguridad">Seguridad ciudadana</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label>Descripción</label>
          <textarea name="descripcion" placeholder="Describe el problema..." required />
        </div>
        <div>
          <label>Foto (opcional)</label>
          <input type="file" accept="image/*" ref={fotoInputRef} onChange={onFotoChange} />
          <div className="thumb">{preview ? <img src={preview} alt="foto" style={{ width: "100%", borderRadius: 10 }} /> : <small>Vista previa aparecerá aquí…</small>}</div>
        </div>
        <div>
          <label>Ubicación</label>
          <div className="row">
            <input id="lat" name="lat" placeholder="Lat" readOnly />
            <input id="lng" name="lng" placeholder="Lng" readOnly />
          </div>
          <div className="sp8" />
          <div id="map" className="map"></div>
          <div className="sp8" />
          <div className="row">
            <button type="button" className="ghost" onClick={useMyLocation}>Usar mi ubicación</button>
            <button type="button" className="ghost" onClick={() => mapRef.current && mapRef.current.setView([mapRef.current.getCenter().lat, mapRef.current.getCenter().lng], 15)}>Centrar mapa</button>
          </div>
        </div>
        <div className="actions" style={{ gridColumn: "1/-1" }}>
          <button type="reset" className="ghost">Limpiar</button>
          <button className="primary" type="submit">Enviar denuncia</button>
        </div>
      </form>
    </div>
  );
}
