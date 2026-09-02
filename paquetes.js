// ==========================================================================
// Arma tu paquete — Lua Fotografía
// Usa el catálogo compartido de catalogo.js (LUA_PRECIOS / LUA_IMPRESIONES)
// ==========================================================================

const PRECIOS = window.LUA_PRECIOS;
const IMPRESIONES = window.LUA_IMPRESIONES;
const fmt = window.LUA_FMT;

// ----- Estado -----
const state = {
  'foto-horas': 0,
  'video-horas': 0,
  'usb': 0,
  'foto-libro': 0,
  slideshow: false,
  preboda: 'ninguna',
  impresiones: [], // { tipo, tamano, cantidad, precioUnit }
};

// ----- Steppers -----
document.querySelectorAll('[data-stepper]').forEach((el) => {
  const key = el.dataset.stepper;
  const valueEl = el.querySelector('[data-value]');
  el.querySelectorAll('.stepper-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = btn.dataset.action === 'plus' ? 1 : -1;
      state[key] = Math.max(0, state[key] + delta);
      valueEl.textContent = state[key];
      render();
    });
  });
});

// ----- Slideshow toggle -----
document.querySelector('[data-toggle="slideshow"]').addEventListener('change', (e) => {
  state.slideshow = e.target.checked;
  render();
});

// ----- Preboda radios -----
document.querySelectorAll('[data-radio="preboda"]').forEach((r) => {
  r.addEventListener('change', (e) => {
    state.preboda = e.target.value;
    render();
  });
});

// ----- Impresiones -----
const typeSelect = document.querySelector('[data-print-type]');
const sizeSelect = document.querySelector('[data-print-size]');
const qtyInput = document.querySelector('[data-print-qty]');
const addBtn = document.querySelector('[data-print-add]');
const printList = document.querySelector('[data-print-list]');
const printEmpty = document.querySelector('[data-print-empty]');

function populateSizes() {
  const tipo = typeSelect.value;
  sizeSelect.innerHTML = '';
  Object.keys(IMPRESIONES[tipo].tamanos).forEach((tamano) => {
    const opt = document.createElement('option');
    opt.value = tamano;
    opt.textContent = `${tamano} — ${fmt(IMPRESIONES[tipo].tamanos[tamano])}`;
    sizeSelect.appendChild(opt);
  });
}
typeSelect.addEventListener('change', populateSizes);
populateSizes();

addBtn.addEventListener('click', () => {
  const tipo = typeSelect.value;
  const tamano = sizeSelect.value;
  const cantidad = Math.max(1, parseInt(qtyInput.value, 10) || 1);
  const precioUnit = IMPRESIONES[tipo].tamanos[tamano];
  state.impresiones.push({ tipo, tamano, cantidad, precioUnit });
  qtyInput.value = 1;
  render();
});

function renderPrintList() {
  printList.querySelectorAll('.print-item').forEach((el) => el.remove());
  if (state.impresiones.length === 0) {
    printEmpty.style.display = '';
    return;
  }
  printEmpty.style.display = 'none';
  state.impresiones.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'print-item';
    const subtotal = item.precioUnit * item.cantidad;
    li.innerHTML = `<span>${item.cantidad} × ${item.tamano} (${IMPRESIONES[item.tipo].label}) — ${fmt(subtotal)}</span>`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'print-remove';
    removeBtn.textContent = 'Quitar';
    removeBtn.addEventListener('click', () => {
      state.impresiones.splice(idx, 1);
      render();
    });
    li.appendChild(removeBtn);
    printList.appendChild(li);
  });
}

// ----- Resumen -----
const summaryList = document.querySelector('[data-summary-list]');
const summaryEmpty = document.querySelector('[data-summary-empty]');
const summaryTotal = document.querySelector('[data-summary-total]');
const summarySend = document.querySelector('[data-summary-send]');

function buildSummaryLines() {
  const lines = [];

  if (state['foto-horas'] > 0) {
    const subtotal = state['foto-horas'] * PRECIOS.horaFoto;
    lines.push({ label: `Cobertura fotográfica — ${state['foto-horas']} hora(s)`, subtotal });
  }
  if (state['video-horas'] > 0) {
    const subtotal = state['video-horas'] * PRECIOS.horaVideo;
    lines.push({ label: `Cobertura de video — ${state['video-horas']} hora(s)`, subtotal });
  }
  if (state.usb > 0) {
    const subtotal = state.usb * PRECIOS.usb;
    lines.push({ label: `USB — ${state.usb} unidad(es)`, subtotal });
  }
  if (state['foto-libro'] > 0) {
    const subtotal = state['foto-libro'] * PRECIOS.fotoLibro;
    lines.push({ label: `Foto libro — ${state['foto-libro']} unidad(es)`, subtotal });
  }
  if (state.slideshow) {
    lines.push({ label: 'Slideshow musicalizado', subtotal: PRECIOS.slideshow });
  }
  if (state.preboda === 'exterior') {
    lines.push({ label: 'Sesión pre-boda en exterior', subtotal: PRECIOS.prebodaExterior });
  }
  if (state.preboda === 'estudio') {
    lines.push({ label: 'Sesión pre-boda en estudio', subtotal: PRECIOS.prebodaEstudio });
  }
  state.impresiones.forEach((item) => {
    lines.push({
      label: `${item.cantidad} × ${item.tamano} — ${IMPRESIONES[item.tipo].label}`,
      subtotal: item.precioUnit * item.cantidad,
    });
  });

  return lines;
}

function render() {
  renderPrintList();

  const lines = buildSummaryLines();
  summaryList.querySelectorAll('.summary-item').forEach((el) => el.remove());

  if (lines.length === 0) {
    summaryEmpty.style.display = '';
  } else {
    summaryEmpty.style.display = 'none';
    lines.forEach((line) => {
      const li = document.createElement('li');
      li.className = 'summary-item';
      li.innerHTML = `<span>${line.label}</span><span>${fmt(line.subtotal)}</span>`;
      summaryList.appendChild(li);
    });
  }

  const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
  summaryTotal.textContent = fmt(total);

  // Link de email con el resumen
  const bodyLines = lines.map((l) => `- ${l.label}: ${fmt(l.subtotal)}`).join('%0D%0A');
  const body = lines.length
    ? `Hola! Arme este paquete en la pagina:%0D%0A%0D%0A${bodyLines}%0D%0A%0D%0ATotal estimado: ${fmt(total)}%0D%0A%0D%0A(Cuentame la fecha y el lugar de tu evento)`
    : 'Hola! Quiero armar un paquete a medida, me ayudas?';
  summarySend.href = `mailto:hola@luafotografia.com?subject=${encodeURIComponent('Mi paquete armado')}&body=${body}`;
}

render();
