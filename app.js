// -------- LocalStorage helper
const ls = {
  get(key, def){ try{ return JSON.parse(localStorage.getItem(key)) ?? def }catch{ return def } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)) }
};

// -------- Seed data demo
(function seedIfEmpty(){
  const users = ls.get('users', []);
  const reports = ls.get('reports', []);
  if(users.length === 0){
    ls.set('users', [
      {nombre:'Ana Ciudadana', email:'ana@demo.com', password:'1234', rol:'ciudadano'},
      {nombre:'Luis Autoridad', email:'luis@muni.com', password:'1234', rol:'autoridad'}
    ]);
  }
  if(reports.length === 0){
    const now = Date.now();
    ls.set('reports', [
      {id:crypto.randomUUID(), titulo:'Bache frente al parque', categoria:'Bache', descripcion:'Hueco profundo, riesgo para motos.', foto:'', lat:-13.516, lng:-71.978, estado:'Enviada', creador:'ana@demo.com', creado:now-86400000},
      {id:crypto.randomUUID(), titulo:'Zona sin alumbrado', categoria:'Alumbrado', descripcion:'3 postes sin luz', foto:'', lat:-13.52, lng:-71.97, estado:'En proceso', creador:'ana@demo.com', creado:now-43200000},
      {id:crypto.randomUUID(), titulo:'Punto crítico de residuos', categoria:'Residuos', descripcion:'Acumulación constante', foto:'', lat:-13.515, lng:-71.975, estado:'Resuelta', creador:'ana@demo.com', creado:now-7200000}
    ]);
  }
})();

// -------- Tabs
const tabs = document.querySelectorAll('#navTabs .tab');
const sections = document.querySelectorAll('.section');
tabs.forEach(t=>t.addEventListener('click',()=>{
  tabs.forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  sections.forEach(s=>s.classList.remove('active'));
  document.getElementById(t.dataset.target).classList.add('active');
  if(t.dataset.target==='estadisticas') renderCharts();
  if(t.dataset.target==='misdenuncias') renderMisDenuncias();
  if(t.dataset.target==='autoridades') renderAutoridades();
}));

// -------- Toast
const toastEl = document.getElementById('toast');
const toast = (msg)=>{
  toastEl.textContent = msg; toastEl.style.display='block';
  setTimeout(()=> toastEl.style.display='none', 2500);
};

// -------- Auth
const userInfo = document.getElementById('userInfo');
function updateUserInfo(){
  const u = ls.get('currentUser', null);
  userInfo.textContent = u? `Conectado como ${u.nombre} (${u.rol})` : 'No has iniciado sesión';
  document.getElementById('authAlert').style.display = (u && u.rol==='autoridad') ? 'none' : 'block';
}
updateUserInfo();

document.getElementById('formRegistro').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const nuevo = Object.fromEntries(fd.entries());
  const users = ls.get('users', []);
  if(users.some(x=>x.email===nuevo.email)){
    document.getElementById('regMsg').textContent = 'Ese correo ya está registrado.'; return;
  }
  users.push(nuevo); ls.set('users', users);
  document.getElementById('regMsg').textContent = 'Cuenta creada. Ahora inicia sesión.';
  e.target.reset();
});

document.getElementById('formLogin').addEventListener('submit',(e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const {email, password} = Object.fromEntries(fd.entries());
  const u = ls.get('users', []).find(x=>x.email===email && x.password===password);
  const msg = document.getElementById('loginMsg');
  if(u){ ls.set('currentUser', u); msg.textContent='Ingreso correcto.'; updateUserInfo(); toast('Sesión iniciada'); }
  else{ msg.textContent='Credenciales inválidas'; }
});
document.getElementById('btnSalir').addEventListener('click', ()=>{ ls.set('currentUser', null); updateUserInfo(); toast('Sesión cerrada'); });

// -------- KPI
function refreshKPI(){
  const r = ls.get('reports', []);
  document.getElementById('kpiTotal').textContent = r.length;
  document.getElementById('kpiResueltas').textContent = r.filter(x=>x.estado==='Resuelta').length;
  document.getElementById('kpiProceso').textContent = r.filter(x=>x.estado==='En proceso').length;
  document.getElementById('kpiEnviadas').textContent = r.filter(x=>x.estado==='Enviada').length;
}
refreshKPI();

// -------- Mapa
let map, marker;
function initMap(){
  map = L.map('map');
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' });
  tiles.addTo(map);
  map.setView([-13.516, -71.978], 13);
  map.on('click', (e)=> setLocation(e.latlng.lat, e.latlng.lng) );
}
function setLocation(lat, lng){
  document.getElementById('lat').value = lat.toFixed(6);
  document.getElementById('lng').value = lng.toFixed(6);
  if(marker) marker.remove();
  marker = L.marker([lat,lng]).addTo(map);
  map.setView([lat,lng], 16);
}
function getMyLocation(){
  if(!navigator.geolocation){ toast('Geolocalización no soportada'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords; setLocation(latitude, longitude);
  }, ()=> toast('No se pudo obtener tu ubicación'));
}
window.addEventListener('load', ()=>{ initMap(); });
document.getElementById('btnUbicacion').addEventListener('click', getMyLocation);
document.getElementById('btnCentrar').addEventListener('click', ()=> map.setView([map.getCenter().lat, map.getCenter().lng], 15));

// -------- Foto preview
const fotoInput = document.getElementById('fotoInput');
const fotoPreview = document.getElementById('fotoPreview');
fotoInput.addEventListener('change', ()=>{
  const f = fotoInput.files?.[0];
  if(!f){ fotoPreview.innerHTML = '<small>Vista previa aparecerá aquí…</small>'; return }
  const reader = new FileReader();
  reader.onload = ()=>{ fotoPreview.innerHTML = `<img src="${reader.result}" alt="foto"/>` }
  reader.readAsDataURL(f);
});

// -------- Envío de denuncia
document.getElementById('formDenuncia').addEventListener('submit',(e)=>{
  e.preventDefault();
  const user = ls.get('currentUser', null);
  if(!user){ toast('Inicia sesión para enviar'); return; }
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  const f = fotoInput.files?.[0];

  const save = (foto64='')=>{
    const report = {
      id: crypto.randomUUID(),
      titulo: data.titulo, categoria: data.categoria, descripcion: data.descripcion,
      foto: foto64, lat: parseFloat(data.lat), lng: parseFloat(data.lng),
      estado: 'Enviada', creador: user.email, creado: Date.now()
    };
    const arr = ls.get('reports', []); arr.unshift(report); ls.set('reports', arr);
    e.target.reset(); fotoPreview.innerHTML = '<small>Vista previa aparecerá aquí…</small>';
    toast('Denuncia enviada'); refreshKPI(); renderMisDenuncias(); if(marker) marker.remove();
  };

  if(f){ const r = new FileReader(); r.onload = ()=> save(r.result); r.readAsDataURL(f); }
  else save();
});

// -------- Mis denuncias
const filtroTexto = document.getElementById('filtroTexto');
const filtroEstado = document.getElementById('filtroEstado');
filtroTexto.addEventListener('input', renderMisDenuncias);
filtroEstado.addEventListener('change', renderMisDenuncias);

function renderTicket(d, isAuthority=false){
  const pillClass = d.estado==='Resuelta'?'resuelta':(d.estado==='En proceso'?'proceso':'enviada');
  const foto = d.foto? `<img src="${d.foto}" style="width:100%; max-height:180px; object-fit:cover; border-radius:10px"/>` : '';
  const coord = (isFinite(d.lat) && isFinite(d.lng)) ? `${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}` : '—';
  return `
    <div class="ticket">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div style="font-weight:800">${d.titulo}</div>
        <span class="pill ${pillClass}">${d.estado}</span>
      </div>
      <div class="meta">
        <span class="pill">${d.categoria}</span>
        <span class="pill">${new Date(d.creado).toLocaleString()}</span>
        <span class="pill">${coord}</span>
        ${d.creador?`<span class="pill">por ${d.creador}</span>`:''}
      </div>
      <div style="color:#c9d6ff">${d.descripcion}</div>
      ${foto}
      ${isAuthority ? `
        <div class="row">
          <select data-id="${d.id}" class="estadoSelector">
            <option ${d.estado==='Enviada'?'selected':''}>Enviada</option>
            <option ${d.estado==='En proceso'?'selected':''}>En proceso</option>
            <option ${d.estado==='Resuelta'?'selected':''}>Resuelta</option>
          </select>
          <button class="ghost asignarBtn" data-id="${d.id}">Asignar</button>
          <button class="primary actualizarBtn" data-id="${d.id}">Actualizar</button>
        </div>` : ``}
    </div>`;
}

function renderMisDenuncias(){
  const cont = document.getElementById('listaMisDenuncias');
  const u = ls.get('currentUser', null);
  const all = ls.get('reports', []);
  const t = filtroTexto.value.toLowerCase();
  const e = filtroEstado.value;
  const list = all
    .filter(x=> u? x.creador===u.email : false)
    .filter(x=> !e || x.estado===e)
    .filter(x=> !t || (x.titulo+x.categoria).toLowerCase().includes(t));
  cont.innerHTML = list.length? list.map(d=>renderTicket(d)).join('') : '<small class="muted">No hay denuncias aún.</small>';
}

// -------- Panel autoridades
const filtrarCategoria = document.getElementById('filtrarCategoria');
const filtrarEstado = document.getElementById('filtrarEstado');
filtrarCategoria.addEventListener('change', renderAutoridades);
filtrarEstado.addEventListener('change', renderAutoridades);

function renderAutoridades(){
  const u = ls.get('currentUser', null);
  const cont = document.getElementById('tablaAutoridades');
  if(!(u && u.rol==='autoridad')){
    cont.innerHTML = '<small class="muted">Acceso restringido. Inicia sesión como autoridad.</small>'; 
    return;
  }
  const all = ls.get('reports', []);
  const cat = filtrarCategoria.value;
  const est = filtrarEstado.value;
  const list = all.filter(x=>!cat || x.categoria===cat).filter(x=>!est || x.estado===est);
  cont.innerHTML = list.length? list.map(d=>renderTicket(d,true)).join('') : '<small class="muted">Sin registros.</small>';

  // Bind actualizar
  cont.querySelectorAll('.actualizarBtn').forEach(btn=> btn.addEventListener('click', ()=>{
    const id = btn.dataset.id; const sel = cont.querySelector(`.estadoSelector[data-id="${id}"]`);
    const arr = ls.get('reports', []); const idx = arr.findIndex(x=>x.id===id);
    if(idx>-1){ arr[idx].estado = sel.value; ls.set('reports', arr); toast('Estado actualizado'); refreshKPI(); renderAutoridades(); }
  }));
}

// -------- Charts
let cEstados, cCategorias;
function renderCharts(){
  const reps = ls.get('reports', []);
  const estados = ['Enviada','En proceso','Resuelta'];
  const estData = estados.map(e=> reps.filter(x=>x.estado===e).length );
  const cats = ['Bache','Alumbrado','Residuos','Seguridad','Otro'];
  const catData = cats.map(c=> reps.filter(x=>x.categoria===c).length );
  const opt = {responsive:true, plugins:{legend:{display:false}}};
  const dsBar = {label:'Cantidad', data:estData};
  const dsPie = {label:'Incidencias', data:catData};
  if(cEstados) cEstados.destroy();
  if(cCategorias) cCategorias.destroy();
  cEstados = new Chart(document.getElementById('chartEstados'), { type:'bar', data:{labels:estados, datasets:[dsBar]}, options:opt });
  cCategorias = new Chart(document.getElementById('chartCategorias'), { type:'doughnut', data:{labels:cats, datasets:[dsPie]}, options:opt });
}
