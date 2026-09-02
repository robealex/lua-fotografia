// ==========================================================================
// Catálogo de precios — Lua Fotografía
// Fuente única de verdad, usada por paquetes.js (armador público) y
// admin.js (generador de recibos). Editar acá actualiza los dos lugares.
// ==========================================================================

window.LUA_PRECIOS = {
  horaFoto: 800,   // confirmado
  horaVideo: 1000, // confirmado
  usb: 250,        // confirmado
  fotoLibro: 700,  // confirmado
  slideshow: 300,  // confirmado en "Servicios Extras"
  prebodaExterior: 600, // confirmado en "Servicios Extras"
  prebodaEstudio: 800,  // confirmado en "Servicios Extras"
};

// Tablas de impresión, tomadas tal cual de las listas de precios
window.LUA_IMPRESIONES = {
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

// Paquetes fijos de boda (Paquete 1/2/3), para referencia rápida en recibos
window.LUA_PAQUETES_FIJOS = {
  paquete1: { label: 'Paquete 1 — Boda', precio: 4000 },
  paquete2: { label: 'Paquete 2 — Boda', precio: 5600 },
  paquete3: { label: 'Paquete 3 — Boda', precio: 6400 },
  video: { label: 'Servicio de video', precio: 3000 },
};

window.LUA_FMT = (n) => '$' + n.toLocaleString('es-MX');
