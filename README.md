<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Plataforma de Denuncia Ciudadana</title>

  <!-- CSS propio -->
  <link rel="stylesheet" href="styles.css"/>

  <!-- Leaflet (mapa) -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

  <!-- Chart.js (estadísticas) -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>
  <header>
    <div class="wrap topbar">
      <div class="brand">
        <div class="logo"><span>DC</span></div>
        <div>
          <div class="brand-title">Plataforma de Denuncia Ciudadana</div>
          <div class="brand-sub">ODS 11 • ODS 16 · Baches · Alumbrado · Residuos · Seguridad</div>
        </div>
      </div>
      <nav id="navTabs">
        <button class="tab active" data-target="denunciar">Denunciar</button>
        <button class="tab" data-target="misdenuncias">Mis denuncias</button>
        <button class="tab" data-target="autoridades">Panel autoridades</button>
        <button class="tab" data-target="estadisticas">Estadísticas</button>
        <button class="tab" data-target="cuenta">Cuenta</button>
      </nav>
    </div>
  </header>

  <main>
    <aside class="side">
      <div class="card">
        <div class="body">
          <h3>Resumen</h3>
          <div class="kpi">
            <div class="item"><small>Total</small><div id="kpiTotal" class="kpi-num">0</div></div>
            <div class="item"><small>Resueltas</small><div id="kpiResueltas" class="kpi-num kpi-ok">0</div></div>
            <div class="item"><small>En proceso</small><div id="kpiProceso" class="kpi-num kpi-warn">0</div></div>
            <div class="item"><small>Enviadas</small><div id="kpiEnviadas" class="kpi-num kpi-info">0</div></div>
          </div>
          <div class="ods">
            <span class="badge ods11">ODS 11 · Ciudades sostenibles</span>
            <span class="badge ods16">ODS 16 · Instituciones sólidas</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="body">
          <h3>Buenas prácticas</h3>
          <ul class="tips">
            <li>Envía fotos claras del problema.</li>
            <li>Activa tu ubicación para georreferenciar.</li>
            <li>Haz seguimiento del estado y comenta.</li>
          </ul>
        </div>
      </div>
    </aside>

    <section>
      <!-- Denunciar -->
      <div id="denunciar" class="section active card">
        <div class="body">
          <h2>Nueva denuncia</h2>
          <form id="formDenuncia" class="grid cols-2">
            <div>
              <label>Título</label>
              <input required name="titulo" placeholder="Ej. Bache peligroso en la Av. Principal"/>
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
            <div class="grid cols-1" style="grid-column:1/-1">
              <label>Descripción</label>
              <textarea name="descripcion" placeholder="Describe el problema, referencias, horarios, riesgos..." required></textarea>
            </div>
            <div>
              <label>Foto (opcional)</label>
              <input type="file" accept="image/*" id="fotoInput"/>
              <div id="fotoPreview" class="thumb"><small>Vista previa aparecerá aquí…</small></div>
            </div>
            <div>
              <label>Ubicación</label>
              <div class="row">
                <input id="lat" name="lat" placeholder="Lat" readonly>
                <input id="lng" name="lng" placeholder="Lng" readonly>
              </div>
              <div class="sp8"></div>
              <div id="map" class="map"></div>
              <div class="sp8"></div>
              <div class="row">
                <button type="button" class="ghost" id="btnUbicacion">Usar mi ubicación</button>
                <button type="button" class="ghost" id="btnCentrar">Centrar mapa</button>
              </div>
            </div>
            <div class="actions">
              <button type="reset" class="ghost">Limpiar</button>
              <button class="primary" type="submit">Enviar denuncia</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Mis denuncias -->
      <div id="misdenuncias" class="section card">
        <div class="body">
          <h2>Mis denuncias</h2>
          <div class="row spb10">
            <input id="filtroTexto" placeholder="Buscar por título o categoría…"/>
            <select id="filtroEstado">
              <option value="">Todos los estados</option>
              <option value="Enviada">Enviada</option>
              <option value="En proceso">En proceso</option>
              <option value="Resuelta">Resuelta</option>
            </select>
          </div>
          <div class="list" id="listaMisDenuncias"></div>
        </div>
      </div>

      <!-- Panel autoridades -->
      <div id="autoridades" class="section card">
        <div class="body">
          <h2>Panel de autoridades</h2>
          <div id="authAlert" class="muted spb10">Inicia sesión como autoridad en <b>Cuenta</b> para gestionar denuncias.</div>
          <div class="row spb12">
            <select id="filtrarCategoria">
              <option value="">Todas las categorías</option>
              <option>Bache</option>
              <option>Alumbrado</option>
              <option>Residuos</option>
              <option>Seguridad</option>
              <option>Otro</option>
            </select>
            <select id="filtrarEstado">
              <option value="">Todos los estados</option>
              <option>Enviada</option>
              <option>En proceso</option>
              <option>Resuelta</option>
            </select>
          </div>
          <div id="tablaAutoridades" class="list"></div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div id="estadisticas" class="section card">
        <div class="body">
          <h2>Estadísticas</h2>
          <div class="grid cols-2">
            <div class="card"><div class="body"><canvas id="chartEstados" height="180"></canvas></div></div>
            <div class="card"><div class="body"><canvas id="chartCategorias" height="180"></canvas></div></div>
          </div>
        </div>
      </div>

      <!-- Cuenta -->
      <div id="cuenta" class="section card">
        <div class="body">
          <h2>Cuenta</h2>
          <div class="grid cols-2">
            <div>
              <h3>Acceder</h3>
              <form id="formLogin">
                <label>Correo</label>
                <input name="email" type="email" required placeholder="ciudadano@correo.com"/>
                <label>Contraseña</label>
                <input name="password" type="password" required/>
                <button class="primary sp8">Iniciar sesión</button>
                <small id="loginMsg" class="muted"></small>
              </form>
            </div>
            <div>
              <h3>Registrarse</h3>
              <form id="formRegistro" class="grid">
                <div class="row">
                  <div>
                    <label>Nombre</label>
                    <input name="nombre" required/>
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
                <input name="email" type="email" required/>
                <label>Contraseña</label>
                <input name="password" type="password" minlength="4" required/>
                <button class="primary">Crear cuenta</button>
                <small id="regMsg" class="muted"></small>
              </form>
              <div class="sp12">
                <button id="btnSalir" class="ghost">Cerrar sesión</button>
                <small id="userInfo" class="muted ml8"></small>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  </main>

  <div id="toast" class="toast"></div>

  <!-- JS propio -->
  <script src="app.js"></script>
</body>
</html>
