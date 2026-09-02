// ==========================================================================
// Arma tu paquete — Lua Fotografía
// ==========================================================================

const PRECIOS = {
  horaFoto: 800,   // confirmado
  horaVideo: 1000, // confirmado
  usb: 250,        // confirmado
  fotoLibro: 700,  // confirmado
  slideshow: 300,  // confirmado en "Servicios Extras"
  prebodaExterior: 600, // confirmado en "Servicios Extras"
  prebodaEstudio: 800,  // confirmado en "Servicios Extras"
};

// Tablas de impresión, tomadas tal cual de las listas de precios
const IMPRESIONES = {
  papel: {
    label: "Impresión en papel fotográfico",
    tamanos: {
      '4x6"': 10, '5x7"': 15, '6x8"': 15, '8x10"': 60, '8x12"': 72,
      '11x14"': 115, '12x18"': 160, '16x20"': 370, '16x24"': 450,
      '20x24"': 550, '20x30"': 690, '24x30"': 820, '24x36"': 1000, '30x40"': 1400,
    },
  },
  mdf12: {
    label: 'Impresión + laminado + montado en MDF 1/2"',
    tamanos: {
      '4x6"': 50, '5x7"': 70, '6x8"': 100, '8x10"': 200, '11x14"': 380,
      '12x18"': 530, '16x20"': 960, '20x24"': 1450, '20x30"': 1800,
      '24x30"': 2600, '30x40"': 3600,
    },
  },
  mdf18: {
    label: 'Impresión + laminado + montado en MDF 1/8"',
    tamanos: {
      '4x6"': 35, '5x7"': 50, '6x8"': 75, '8x10"': 160, '11x14"': 330,
      '12x18"': 460, '16x20"': 800, '20x24"': 1200, '20x30"': 1500,
      '24x30"': 2160, '30x40"': 3000,
    },
  },
};

const fmt = (n) => '$' + n.toLocaleString('es-MX');

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
