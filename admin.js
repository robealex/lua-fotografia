// ==========================================================================
// Panel de administración — Lua Fotografía
//
// DEMO: usa localStorage (solo este navegador) porque todavía no hay backend
// ni base de datos real conectada. Cuando armemos Google Cloud + la base de
// datos, este archivo se reemplaza por llamadas reales a la API.
// El login tampoco es seguro todavía: cualquier email/contraseña entra.
// ==========================================================================

(function () {
  const STORAGE_USERS = 'lua_admin_usuarios';
  const STORAGE_RECIBOS = 'lua_admin_recibos';
  const STORAGE_CONTADOR = 'lua_admin_recibo_contador';
  const STORAGE_SESSION = 'lua_admin_session';

  const PRECIOS = window.LUA_PRECIOS;
  const IMPRESIONES = window.LUA_IMPRESIONES;
  const PAQUETES_FIJOS = window.LUA_PAQUETES_FIJOS;
  const fmt = window.LUA_FMT;

  // ----- Utilidades de almacenamiento -----
  const leer = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  };
  const guardar = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  let usuarios = leer(STORAGE_USERS, []);
  let recibos = leer(STORAGE_RECIBOS, []);
  let recibo = { items: [] }; // recibo en construcción

  // ===================== LOGIN =====================
  function login(e) {
    e.preventDefault();
    // DEMO: no valida contra nada real todavía.
    sessionStorage.setItem(STORAGE_SESSION, '1');
    mostrarPanel();
    return false;
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_SESSION);
    document.getElementById('admin-panel').hidden = true;
    document.getElementById('admin-login').hidden = false;
  }

  function mostrarPanel() {
    document.getElementById('admin-login').hidden = true;
    document.getElementById('admin-panel').hidden = false;
    renderUsuarios();
    renderSelectClientes();
    renderRecibos();
    renderInvitaciones();
    const fechaInput = document.getElementById('recibo-fecha');
    if (fechaInput && !fechaInput.value) fechaInput.value = new Date().toISOString().slice(0, 10);
  }

  // ===================== TABS =====================
  document.querySelectorAll('.admin-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((b) => b.classList.remove('is-active'));
      document.querySelectorAll('.admin-tab-panel').forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.querySelector(`[data-tab-panel="${btn.dataset.tab}"]`).classList.add('is-active');
      if (btn.dataset.tab === 'invitaciones') actualizarPreviewInvitacion();
    });
  });

  // ===================== USUARIOS =====================
  function renderUsuarios() {
    const body = document.getElementById('admin-users-body');
    const empty = document.getElementById('admin-users-empty');
    body.innerHTML = '';
    if (usuarios.length === 0) {
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    usuarios.forEach((u) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(u.nombre)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.evento || '')}</td>
        <td>${escapeHtml(u.carpeta)}</td>
        <td class="row-actions">
          <button data-edit="${u.id}">Editar</button>
          <button data-del="${u.id}">Eliminar</button>
        </td>`;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => abrirFormUsuario(b.dataset.edit)));
    body.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', () => eliminarUsuario(b.dataset.del)));
  }

  function abrirFormUsuario(id) {
    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('admin-modal-title');
    if (id) {
      const u = usuarios.find((x) => x.id === id);
      title.textContent = 'Editar usuario';
      document.getElementById('usuario-id').value = u.id;
      document.getElementById('usuario-nombre').value = u.nombre;
      document.getElementById('usuario-email').value = u.email;
      document.getElementById('usuario-password').value = u.password;
      document.getElementById('usuario-evento').value = u.evento || 'Boda';
      document.getElementById('usuario-carpeta').value = u.carpeta;
      document.getElementById('usuario-notas').value = u.notas || '';
    } else {
      title.textContent = 'Agregar usuario';
      document.getElementById('usuario-id').value = '';
      document.getElementById('usuario-nombre').value = '';
      document.getElementById('usuario-email').value = '';
      document.getElementById('usuario-password').value = '';
      document.getElementById('usuario-evento').value = 'Boda';
      document.getElementById('usuario-carpeta').value = '';
      document.getElementById('usuario-notas').value = '';
    }
    modal.hidden = false;
  }

  function cerrarFormUsuario() {
    document.getElementById('admin-modal').hidden = true;
  }

  function guardarUsuario(e) {
    e.preventDefault();
    const id = document.getElementById('usuario-id').value;
    const datos = {
      id: id || 'u' + Date.now(),
      nombre: document.getElementById('usuario-nombre').value.trim(),
      email: document.getElementById('usuario-email').value.trim(),
      password: document.getElementById('usuario-password').value,
      evento: document.getElementById('usuario-evento').value,
      carpeta: document.getElementById('usuario-carpeta').value.trim(),
      notas: document.getElementById('usuario-notas').value.trim(),
    };
    if (id) {
      usuarios = usuarios.map((u) => (u.id === id ? datos : u));
    } else {
      usuarios.push(datos);
    }
    guardar(STORAGE_USERS, usuarios);
    renderUsuarios();
    renderSelectClientes();
    cerrarFormUsuario();
    return false;
  }

  function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    usuarios = usuarios.filter((u) => u.id !== id);
    guardar(STORAGE_USERS, usuarios);
    renderUsuarios();
    renderSelectClientes();
  }

  // ===================== RECIBOS: armado =====================
  function renderSelectClientes() {
    const sel = document.getElementById('recibo-cliente');
    sel.innerHTML = '<option value="">— Sin cuenta / cliente manual —</option>';
    usuarios.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = `${u.nombre} (${u.email})`;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      const u = usuarios.find((x) => x.id === sel.value);
      document.getElementById('recibo-cliente-nombre').value = u ? u.nombre : '';
      if (u) document.getElementById('recibo-evento').value = u.evento || '';
    });
  }

  // Poblar tamaños del selector de impresión
  const impTipoSel = document.getElementById('quick-add-imp-tipo');
  const impTamanoSel = document.getElementById('quick-add-imp-tamano');
  function poblarTamanos() {
    impTamanoSel.innerHTML = '';
    Object.keys(IMPRESIONES[impTipoSel.value].tamanos).forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = `${t} — ${fmt(IMPRESIONES[impTipoSel.value].tamanos[t])}`;
      impTamanoSel.appendChild(opt);
    });
  }
  impTipoSel.addEventListener('change', poblarTamanos);
  poblarTamanos();

  document.getElementById('quick-add-tipo').addEventListener('change', (e) => {
    const esImpresion = e.target.value === 'impresion';
    document.querySelectorAll('.quick-add-imp').forEach((el) => (el.hidden = !esImpresion));
  });

  const CATALOGO_LABELS = {
    horaFoto: 'Hora de cobertura fotográfica',
    horaVideo: 'Hora de cobertura de video',
    usb: 'USB',
    fotoLibro: 'Foto libro',
    slideshow: 'Slideshow musicalizado',
    prebodaExterior: 'Sesión pre-boda exterior',
    prebodaEstudio: 'Sesión pre-boda estudio',
  };

  function agregarDelCatalogo() {
    const tipo = document.getElementById('quick-add-tipo').value;
    const cantidad = Math.max(1, parseInt(document.getElementById('quick-add-cantidad').value, 10) || 1);

    if (tipo === 'impresion') {
      const impTipo = impTipoSel.value;
      const tamano = impTamanoSel.value;
      const precioUnit = IMPRESIONES[impTipo].tamanos[tamano];
      recibo.items.push({
        descripcion: `${tamano} — ${IMPRESIONES[impTipo].label}`,
        cantidad, precioUnit,
      });
    } else if (PAQUETES_FIJOS[tipo]) {
      recibo.items.push({
        descripcion: PAQUETES_FIJOS[tipo].label,
        cantidad, precioUnit: PAQUETES_FIJOS[tipo].precio,
      });
    } else {
      recibo.items.push({
        descripcion: CATALOGO_LABELS[tipo],
        cantidad, precioUnit: PRECIOS[tipo],
      });
    }
    renderItems();
  }

  function agregarLibre() {
    const descripcion = document.getElementById('libre-descripcion').value.trim();
    const cantidad = Math.max(1, parseInt(document.getElementById('libre-cantidad').value, 10) || 1);
    const precioUnit = parseFloat(document.getElementById('libre-precio').value) || 0;
    if (!descripcion) return;
    recibo.items.push({ descripcion, cantidad, precioUnit });
    document.getElementById('libre-descripcion').value = '';
    document.getElementById('libre-cantidad').value = 1;
    document.getElementById('libre-precio').value = '';
    renderItems();
  }

  function quitarItem(idx) {
    recibo.items.splice(idx, 1);
    renderItems();
  }

  function calcularTotal() {
    return recibo.items.reduce((sum, it) => sum + it.cantidad * it.precioUnit, 0);
  }

  function renderItems() {
    const ul = document.getElementById('recibo-items');
    const empty = document.getElementById('recibo-items-empty');
    ul.querySelectorAll('.receipt-item').forEach((el) => el.remove());
    if (recibo.items.length === 0) {
      empty.style.display = '';
    } else {
      empty.style.display = 'none';
      recibo.items.forEach((it, idx) => {
        const li = document.createElement('li');
        li.className = 'receipt-item';
        const subtotal = it.cantidad * it.precioUnit;
        li.innerHTML = `<span>${it.cantidad} × ${escapeHtml(it.descripcion)} — ${fmt(subtotal)}</span>`;
        const btn = document.createElement('button');
        btn.textContent = 'Quitar';
        btn.addEventListener('click', () => quitarItem(idx));
        li.appendChild(btn);
        ul.appendChild(li);
      });
    }
    document.getElementById('recibo-total').textContent = fmt(calcularTotal());
  }

  // ===================== RECIBOS: generar / imprimir =====================
  function siguienteNumero() {
    const n = leer(STORAGE_CONTADOR, 0) + 1;
    guardar(STORAGE_CONTADOR, n);
    return String(n).padStart(4, '0');
  }

  function generarRecibo() {
    if (recibo.items.length === 0) {
      alert('Agregá al menos un concepto antes de generar el recibo.');
      return;
    }
    const numero = siguienteNumero();
    const cliente = document.getElementById('recibo-cliente-nombre').value.trim() || 'Cliente sin especificar';
    const evento = document.getElementById('recibo-evento').value.trim();
    const fecha = document.getElementById('recibo-fecha').value || new Date().toISOString().slice(0, 10);
    const total = calcularTotal();

    const registro = { numero, cliente, evento, fecha, total, items: recibo.items.slice() };
    recibos.unshift(registro);
    guardar(STORAGE_RECIBOS, recibos);
    renderRecibos();

    pintarVistaImpresion(registro);
    document.getElementById('recibo-preview').hidden = false;
    document.getElementById('recibo-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function pintarVistaImpresion(r) {
    document.getElementById('print-numero').textContent = r.numero;
    document.getElementById('print-cliente').textContent = r.cliente;
    document.getElementById('print-evento').textContent = r.evento || '—';
    document.getElementById('print-fecha').textContent = r.fecha;
    document.getElementById('print-total').textContent = fmt(r.total);
    const tbody = document.getElementById('print-items');
    tbody.innerHTML = '';
    r.items.forEach((it) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(it.descripcion)}</td><td>${it.cantidad}</td><td>${fmt(it.precioUnit)}</td><td>${fmt(it.cantidad * it.precioUnit)}</td>`;
      tbody.appendChild(tr);
    });
  }

  function nuevoRecibo() {
    recibo = { items: [] };
    renderItems();
    document.getElementById('recibo-evento').value = '';
    document.getElementById('recibo-cliente-nombre').value = '';
    document.getElementById('recibo-cliente').value = '';
    document.getElementById('recibo-fecha').value = new Date().toISOString().slice(0, 10);
    document.getElementById('recibo-preview').hidden = true;
  }

  // ===================== HISTORIAL =====================
  function renderRecibos() {
    const body = document.getElementById('admin-recibos-body');
    const empty = document.getElementById('admin-recibos-empty');
    body.innerHTML = '';
    if (recibos.length === 0) {
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    recibos.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.numero}</td>
        <td>${escapeHtml(r.cliente)}</td>
        <td>${escapeHtml(r.evento || '—')}</td>
        <td>${r.fecha}</td>
        <td>${fmt(r.total)}</td>
        <td class="row-actions"><button data-ver="${r.numero}">Ver / imprimir</button></td>`;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-ver]').forEach((b) =>
      b.addEventListener('click', () => {
        const r = recibos.find((x) => x.numero === b.dataset.ver);
        pintarVistaImpresion(r);
        document.querySelector('[data-tab="recibos"]').click();
        document.getElementById('recibo-preview').hidden = false;
        document.getElementById('recibo-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
  }

  // ===================== INVITACIONES WEB =====================
  const STORAGE_INVITACIONES = 'lua_admin_invitaciones';
  let invitaciones = leer(STORAGE_INVITACIONES, []);

  function leerFormInvitacion() {
    return {
      novio1: document.getElementById('inv-novio1').value.trim() || 'Novia',
      novio2: document.getElementById('inv-novio2').value.trim() || 'Novio',
      acento: document.getElementById('inv-acento').value,
      fecha: document.getElementById('inv-fecha').value,
      horaCeremonia: document.getElementById('inv-hora-ceremonia').value,
      lugarCeremonia: document.getElementById('inv-lugar-ceremonia').value.trim(),
      direccionCeremonia: document.getElementById('inv-direccion-ceremonia').value.trim(),
      mapaCeremonia: document.getElementById('inv-mapa-ceremonia').value.trim(),
      horaRecepcion: document.getElementById('inv-hora-recepcion').value,
      lugarRecepcion: document.getElementById('inv-lugar-recepcion').value.trim(),
      direccionRecepcion: document.getElementById('inv-direccion-recepcion').value.trim(),
      mapaRecepcion: document.getElementById('inv-mapa-recepcion').value.trim(),
      historia: document.getElementById('inv-historia').value.trim(),
      vestimenta: document.getElementById('inv-vestimenta').value.trim(),
      regalos: document.getElementById('inv-regalos').value.trim(),
      fechaLimiteRSVP: document.getElementById('inv-fecha-limite').value.trim(),
      emailRSVP: document.getElementById('inv-email-rsvp').value.trim(),
    };
  }

  function actualizarPreviewInvitacion() {
    const datos = leerFormInvitacion();
    const html = window.LUA_generarInvitacionHTML(datos);
    document.getElementById('invite-iframe').srcdoc = html;
    return html;
  }

  function descargarInvitacion() {
    const datos = leerFormInvitacion();
    const html = window.LUA_generarInvitacionHTML(datos);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (datos.novio1 + '-' + datos.novio2).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    a.href = url;
    a.download = `invitacion-${slug || 'boda'}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function guardarInvitacion() {
    const datos = leerFormInvitacion();
    const registro = { id: 'i' + Date.now(), datos, guardadoEl: new Date().toISOString().slice(0, 10) };
    invitaciones.unshift(registro);
    guardar(STORAGE_INVITACIONES, invitaciones);
    renderInvitaciones();
  }

  function cargarInvitacion(id) {
    const r = invitaciones.find((x) => x.id === id);
    if (!r) return;
    const d = r.datos;
    document.getElementById('inv-novio1').value = d.novio1 || '';
    document.getElementById('inv-novio2').value = d.novio2 || '';
    document.getElementById('inv-acento').value = d.acento || 'dorado';
    document.getElementById('inv-fecha').value = d.fecha || '';
    document.getElementById('inv-hora-ceremonia').value = d.horaCeremonia || '';
    document.getElementById('inv-lugar-ceremonia').value = d.lugarCeremonia || '';
    document.getElementById('inv-direccion-ceremonia').value = d.direccionCeremonia || '';
    document.getElementById('inv-mapa-ceremonia').value = d.mapaCeremonia || '';
    document.getElementById('inv-hora-recepcion').value = d.horaRecepcion || '';
    document.getElementById('inv-lugar-recepcion').value = d.lugarRecepcion || '';
    document.getElementById('inv-direccion-recepcion').value = d.direccionRecepcion || '';
    document.getElementById('inv-mapa-recepcion').value = d.mapaRecepcion || '';
    document.getElementById('inv-historia').value = d.historia || '';
    document.getElementById('inv-vestimenta').value = d.vestimenta || '';
    document.getElementById('inv-regalos').value = d.regalos || '';
    document.getElementById('inv-fecha-limite').value = d.fechaLimiteRSVP || '';
    document.getElementById('inv-email-rsvp').value = d.emailRSVP || '';
    actualizarPreviewInvitacion();
    document.querySelector('[data-tab="invitaciones"]').click();
  }

  function eliminarInvitacion(id) {
    if (!confirm('¿Eliminar esta invitación guardada?')) return;
    invitaciones = invitaciones.filter((x) => x.id !== id);
    guardar(STORAGE_INVITACIONES, invitaciones);
    renderInvitaciones();
  }

  function renderInvitaciones() {
    const body = document.getElementById('admin-invitaciones-body');
    const empty = document.getElementById('admin-invitaciones-empty');
    body.innerHTML = '';
    if (invitaciones.length === 0) {
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    invitaciones.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(r.datos.novio1)} &amp; ${escapeHtml(r.datos.novio2)}</td>
        <td>${escapeHtml(r.datos.fecha || '—')}</td>
        <td class="row-actions">
          <button data-cargar="${r.id}">Cargar</button>
          <button data-borrar="${r.id}">Eliminar</button>
        </td>`;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-cargar]').forEach((b) =>
      b.addEventListener('click', () => cargarInvitacion(b.dataset.cargar)));
    body.querySelectorAll('[data-borrar]').forEach((b) =>
      b.addEventListener('click', () => eliminarInvitacion(b.dataset.borrar)));
  }

  // ===================== Helpers =====================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  // ===================== Init =====================
  if (sessionStorage.getItem(STORAGE_SESSION)) mostrarPanel();

  window.LuaAdmin = {
    login, logout,
    abrirFormUsuario, cerrarFormUsuario, guardarUsuario, eliminarUsuario,
    agregarDelCatalogo, agregarLibre, generarRecibo, nuevoRecibo,
    actualizarPreviewInvitacion, descargarInvitacion, guardarInvitacion,
  };
})();
