// ==========================================================================
// Generador de invitaciones web — Lua Fotografía
//
// 3 diseños (clásica / moderna / romántica), cada uno respeta las mismas
// "features" (planes Básica/Pro/Gold definidos en admin.js): cuenta
// regresiva con segundos, foto de portada, galería de fotos, itinerario,
// hashtag y música de fondo — todo opcional según lo que esté activado.
// ==========================================================================

const LUA_ACENTOS = {
  dorado: { nombre: 'Dorado', hex: '#C9A15A' },
  terracota: { nombre: 'Terracota', hex: '#B5714A' },
  rosa: { nombre: 'Rosa polvo', hex: '#C79C93' },
  salvia: { nombre: 'Verde salvia', hex: '#8A9A73' },
};

function escapeHtmlInv(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

function nl2p(str) {
  return (str || '')
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtmlInv(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function formatearFechaLarga(fechaISO) {
  if (!fechaISO) return '';
  const [y, m, d] = fechaISO.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function prepararContexto(data) {
  return {
    acento: (LUA_ACENTOS[data.acento] || LUA_ACENTOS.dorado).hex,
    fechaLarga: formatearFechaLarga(data.fecha),
    fechaISOConHora: data.fecha ? `${data.fecha}T${data.horaCeremonia || '00:00'}:00` : '',
    mailtoRSVP: data.emailRSVP || 'hola@luafotografia.com',
    f: data.features || {},
  };
}

// ============================== BLOQUES COMPARTIDOS ==============================

function itinerarioHTML(itinerario) {
  const items = (itinerario || []).filter((it) => it.hora || it.actividad);
  if (items.length === 0) return '';
  return items.map((it) =>
    `<div class="itin-item"><span class="itin-hora">${escapeHtmlInv(it.hora)}</span><span class="itin-actividad">${escapeHtmlInv(it.actividad)}</span></div>`
  ).join('');
}

function galeriaGridHTML(fotos) {
  const lista = (fotos || []).filter(Boolean);
  if (lista.length === 0) return '';
  return lista.map((src) => `<div class="galeria-item"><img src="${src}" alt=""></div>`).join('');
}

function musicaHTML(musicaUrl) {
  if (!musicaUrl) return '';
  return `<audio id="musica-fondo" loop src="${escapeHtmlInv(musicaUrl)}"></audio>
<button type="button" class="musica-btn" id="musica-btn" onclick="toggleMusica()">♪ Música</button>`;
}

function hashtagHTML(hashtag) {
  if (!hashtag) return '';
  const limpio = hashtag.replace(/^#/, '');
  return `<p class="hashtag">#${escapeHtmlInv(limpio)}</p>`;
}

// Script compartido por los 3 diseños: cuenta regresiva (con segundos), RSVP y música
function scriptComunInvitacion(fechaISOConHora, mailtoRSVP) {
  return `
<script>
  (function () {
    const fechaBoda = new Date("${fechaISOConHora}");
    const el = document.getElementById('countdown');
    if (el && !isNaN(fechaBoda.getTime())) {
      function actualizar() {
        const ahora = new Date();
        let diff = Math.max(0, fechaBoda - ahora);
        const dias = Math.floor(diff / 86400000);
        const horas = Math.floor((diff % 86400000) / 3600000);
        const min = Math.floor((diff % 3600000) / 60000);
        const seg = Math.floor((diff % 60000) / 1000);
        el.innerHTML =
          '<div><strong>' + dias + '</strong><span>días</span></div>' +
          '<div><strong>' + horas + '</strong><span>horas</span></div>' +
          '<div><strong>' + min + '</strong><span>min</span></div>' +
          '<div><strong>' + seg + '</strong><span>seg</span></div>';
      }
      actualizar();
      setInterval(actualizar, 1000);
    }
  })();

  function toggleMusica() {
    const audio = document.getElementById('musica-fondo');
    const btn = document.getElementById('musica-btn');
    if (!audio) return;
    if (audio.paused) { audio.play().catch(function(){}); btn.textContent = '❚❚ Música'; }
    else { audio.pause(); btn.textContent = '♪ Música'; }
  }

  function enviarRSVP(e) {
    e.preventDefault();
    const nombre = document.getElementById('rsvp-nombre').value;
    const asiste = document.getElementById('rsvp-asiste').value;
    const acompanantes = document.getElementById('rsvp-acompanantes').value;
    const restricciones = document.getElementById('rsvp-restricciones').value;
    const mensaje = document.getElementById('rsvp-mensaje').value;
    const cuerpo = 'Nombre: ' + nombre +
      '%0D%0AAsiste: ' + asiste +
      '%0D%0AAcompañantes: ' + acompanantes +
      '%0D%0ARestricciones: ' + restricciones +
      '%0D%0AMensaje: ' + mensaje;
    window.location.href = 'mailto:${escapeHtmlInv(mailtoRSVP)}?subject=' + encodeURIComponent('Confirmación de asistencia — ' + nombre) + '&body=' + cuerpo;
    return false;
  }
<\/script>`;
}

function rsvpFormHTML(data, fechaLarga) {
  return `
    <p>Antes del ${escapeHtmlInv(data.fechaLimiteRSVP || fechaLarga)}, contanos si venís.</p>
    <form class="rsvp-form" onsubmit="return enviarRSVP(event)">
      <label>Nombre completo<input type="text" id="rsvp-nombre" required></label>
      <label>¿Asistirás?
        <select id="rsvp-asiste">
          <option value="Sí, ahí estaré">Sí, ahí estaré</option>
          <option value="No podré ir">No podré ir</option>
        </select>
      </label>
      <label>Número de acompañantes<input type="number" id="rsvp-acompanantes" min="0" value="0"></label>
      <label>Restricciones alimentarias<input type="text" id="rsvp-restricciones"></label>
      <label>Mensaje para los novios<textarea id="rsvp-mensaje" rows="3"></textarea></label>
      <button type="submit">Enviar confirmación</button>
    </form>`;
}

// Arma las secciones que son iguales en estructura entre diseños (cada diseño
// las envuelve con su propio <section class="section">, por eso van sueltas)
function seccionesExtra(data, f) {
  let out = '';
  if (f.itinerario && data.itinerario && data.itinerario.length) {
    out += `<section class="section"><div class="divider"></div><h2>Itinerario</h2><div class="itin-list">${itinerarioHTML(data.itinerario)}</div></section>`;
  }
  if (f.galeria && data.galeriaFotos && data.galeriaFotos.filter(Boolean).length) {
    out += `<section class="section section-wide"><div class="divider"></div><h2>Nuestros momentos</h2><div class="galeria-grid">${galeriaGridHTML(data.galeriaFotos)}</div></section>`;
  }
  if (f.hospedaje && data.hospedaje) {
    out += `<section class="section"><div class="divider"></div><h2>Dónde hospedarse</h2>${nl2p(data.hospedaje)}</section>`;
  }
  return out;
}

// ============================== DISEÑO 1: CLÁSICA ==============================
function plantillaClasica(data) {
  const { acento, fechaLarga, fechaISOConHora, mailtoRSVP, f } = prepararContexto(data);
  const fotoPortada = f.fotoPortada && data.fotoPortada
    ? `<img class="foto-portada" src="${data.fotoPortada}" alt="">` : '';
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,450;0,9..144,600;1,9..144,450&family=Work+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root { --ink:#14182B; --cream:#FAF6EC; --linen:#E6D9BC; --parchment:#EFE8D8; --acento:${acento}; --serif:'Fraunces',serif; --sans:'Work Sans',sans-serif; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:var(--sans); color:var(--ink); background:var(--parchment); }
  a { color:var(--acento); }
  .section { padding:10vw 8vw; max-width:760px; margin:0 auto; text-align:center; }
  .section-wide { max-width:920px; }
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:10vw 8vw; background:linear-gradient(160deg, var(--linen) 0%, var(--cream) 100%); }
  .hero-kicker { letter-spacing:0.3em; text-transform:uppercase; font-size:0.75rem; color:var(--acento); margin-bottom:18px; }
  .hero-names { font-family:var(--serif); font-style:italic; font-weight:450; font-size:clamp(2.4rem,9vw,5rem); margin:0; line-height:1.15; }
  .hero-amp { color:var(--acento); }
  .hero-fecha { margin-top:22px; font-size:1.05rem; text-transform:capitalize; }
  .foto-portada { width:260px; height:340px; object-fit:cover; border-radius:2px; box-shadow:0 18px 40px rgba(20,24,43,0.18); margin:28px 0 6px; }
  .countdown { display:flex; gap:18px; justify-content:center; margin-top:34px; flex-wrap:wrap; }
  .countdown div { display:flex; flex-direction:column; align-items:center; }
  .countdown strong { font-family:var(--serif); font-size:1.8rem; }
  .countdown span { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:#6b6255; }
  .hashtag { margin-top:18px; color:var(--acento); font-size:0.9rem; letter-spacing:0.03em; }
  h2 { font-family:var(--serif); font-size:clamp(1.6rem,4vw,2.2rem); margin-bottom:20px; }
  .section p { line-height:1.7; color:#3c3830; }
  .detalles { display:grid; grid-template-columns:1fr 1fr; gap:24px; text-align:left; margin-top:30px; }
  .detalle-card { background:var(--cream); border:1px solid #d8cdb6; border-radius:2px; padding:24px; }
  .detalle-card h3 { font-family:var(--serif); font-size:1.15rem; margin:0 0 10px; }
  .detalle-card p { margin:4px 0; font-size:0.92rem; }
  .divider { width:40px; height:1px; background:var(--acento); margin:0 auto 22px; }
  .itin-list { text-align:left; max-width:420px; margin:0 auto; }
  .itin-item { display:flex; gap:18px; padding:12px 0; border-bottom:1px solid #d8cdb6; }
  .itin-hora { font-family:var(--serif); color:var(--acento); min-width:70px; }
  .galeria-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:26px; }
  .galeria-item img { width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:2px; }
  .rsvp-form { display:flex; flex-direction:column; gap:14px; text-align:left; margin-top:24px; }
  .rsvp-form label { display:flex; flex-direction:column; gap:6px; font-size:0.9rem; }
  .rsvp-form input, .rsvp-form select, .rsvp-form textarea { background:var(--cream); border:1px solid #d8cdb6; padding:10px 12px; border-radius:2px; font-family:var(--sans); font-size:0.95rem; }
  .rsvp-form button { background:var(--acento); color:#fff; border:none; padding:14px; border-radius:2px; font-family:var(--sans); font-size:0.95rem; cursor:pointer; margin-top:6px; }
  .musica-btn { position:fixed; top:18px; right:18px; background:rgba(255,255,255,0.85); border:1px solid var(--acento); color:var(--acento); border-radius:20px; padding:8px 16px; font-size:0.8rem; cursor:pointer; z-index:10; }
  footer { text-align:center; padding:30px; font-size:0.8rem; color:#8a8073; }
  @media (max-width:640px) { .detalles { grid-template-columns:1fr; } .galeria-grid { grid-template-columns:repeat(2,1fr); } }
</style></head><body>
${musicaHTML(f.musica ? data.musicaUrl : '')}
<section class="hero">
  <p class="hero-kicker">Nos casamos</p>
  <h1 class="hero-names">${escapeHtmlInv(data.novio1)} <span class="hero-amp">&amp;</span> ${escapeHtmlInv(data.novio2)}</h1>
  ${fotoPortada}
  <p class="hero-fecha">${fechaLarga}</p>
  <div class="countdown" id="countdown"></div>
  ${f.hashtag ? hashtagHTML(data.hashtag) : ''}
</section>
${data.historia ? `<section class="section"><div class="divider"></div><h2>Nuestra historia</h2>${nl2p(data.historia)}</section>` : ''}
<section class="section">
  <div class="divider"></div><h2>Detalles del evento</h2>
  <div class="detalles">
    <div class="detalle-card"><h3>Ceremonia</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaCeremonia)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarCeremonia)}</p>${data.direccionCeremonia ? `<p>${escapeHtmlInv(data.direccionCeremonia)}</p>` : ''}${f.mapa && data.mapaCeremonia ? `<p><a href="${escapeHtmlInv(data.mapaCeremonia)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
    <div class="detalle-card"><h3>Recepción</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaRecepcion)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarRecepcion)}</p>${data.direccionRecepcion ? `<p>${escapeHtmlInv(data.direccionRecepcion)}</p>` : ''}${f.mapa && data.mapaRecepcion ? `<p><a href="${escapeHtmlInv(data.mapaRecepcion)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
  </div>
</section>
${f.vestimenta && data.vestimenta ? `<section class="section"><div class="divider"></div><h2>Código de vestimenta</h2><p>${escapeHtmlInv(data.vestimenta)}</p></section>` : ''}
${f.regalos && data.regalos ? `<section class="section"><div class="divider"></div><h2>Mesa de regalos</h2>${nl2p(data.regalos)}</section>` : ''}
${seccionesExtra(data, f)}
${f.rsvp !== false ? `<section class="section"><div class="divider"></div><h2>Confirma tu asistencia</h2>${rsvpFormHTML(data, fechaLarga)}</section>` : ''}
<footer>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)} · Fotografía por Lua Fotografía</footer>
${scriptComunInvitacion(fechaISOConHora, mailtoRSVP)}
</body></html>`;
}

// ============================== DISEÑO 2: MODERNA ==============================
function plantillaModerna(data) {
  const { acento, fechaLarga, fechaISOConHora, mailtoRSVP, f } = prepararContexto(data);
  const fotoPortada = f.fotoPortada && data.fotoPortada
    ? `<div class="foto-portada-wrap"><img class="foto-portada" src="${data.fotoPortada}" alt=""></div>` : '';
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  :root { --ink:#0F0F0F; --white:#FFFFFF; --grey:#F4F3F1; --acento:${acento}; --sans:'Work Sans',sans-serif; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:var(--sans); color:var(--ink); background:var(--white); }
  a { color:var(--acento); }
  .section { padding:9vw 8vw; max-width:820px; margin:0 auto; }
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding:9vw 8vw; border-bottom:1px solid var(--ink); }
  .hero-kicker { letter-spacing:0.35em; text-transform:uppercase; font-size:0.7rem; color:var(--acento); margin-bottom:20px; font-weight:500; }
  .hero-names { font-weight:700; text-transform:uppercase; font-size:clamp(2.6rem,10vw,6.5rem); margin:0; line-height:0.95; letter-spacing:-0.01em; }
  .hero-amp { color:var(--acento); font-weight:300; }
  .hero-fecha { margin-top:26px; font-size:1rem; letter-spacing:0.05em; text-transform:uppercase; }
  .foto-portada-wrap { width:100%; margin-top:8vw; }
  .foto-portada { width:100%; max-height:56vh; object-fit:cover; display:block; }
  .countdown { display:flex; gap:26px; margin-top:36px; }
  .countdown div { display:flex; flex-direction:column; }
  .countdown strong { font-size:1.9rem; font-weight:700; }
  .countdown span { font-size:0.65rem; text-transform:uppercase; letter-spacing:0.1em; color:#666; }
  .hashtag { margin-top:16px; font-size:0.85rem; letter-spacing:0.05em; color:var(--acento); }
  h2 { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.25em; color:var(--acento); font-weight:500; margin-bottom:24px; }
  .section p { line-height:1.8; font-size:1.05rem; max-width:56ch; }
  .detalles { display:grid; grid-template-columns:1fr 1fr; gap:0; margin-top:10px; border-top:1px solid var(--ink); }
  .detalle-card { padding:26px 0; border-bottom:1px solid var(--ink); }
  .detalle-card:first-child { border-right:1px solid var(--ink); padding-right:26px; }
  .detalle-card:last-child { padding-left:26px; }
  .detalle-card h3 { text-transform:uppercase; font-size:0.85rem; letter-spacing:0.1em; margin:0 0 12px; }
  .detalle-card p { margin:4px 0; font-size:0.92rem; }
  .itin-list { border-top:1px solid var(--ink); }
  .itin-item { display:flex; gap:20px; padding:14px 0; border-bottom:1px solid var(--ink); text-transform:uppercase; font-size:0.85rem; letter-spacing:0.04em; }
  .itin-hora { color:var(--acento); min-width:80px; font-weight:700; }
  .galeria-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:10px; }
  .galeria-item img { width:100%; aspect-ratio:1/1; object-fit:cover; display:block; }
  .rsvp-form { display:flex; flex-direction:column; gap:16px; margin-top:24px; max-width:480px; }
  .rsvp-form label { display:flex; flex-direction:column; gap:6px; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; }
  .rsvp-form input, .rsvp-form select, .rsvp-form textarea { background:var(--grey); border:none; border-bottom:2px solid var(--ink); padding:12px 10px; font-family:var(--sans); font-size:1rem; }
  .rsvp-form button { background:var(--ink); color:#fff; border:none; padding:16px; text-transform:uppercase; letter-spacing:0.1em; font-size:0.85rem; cursor:pointer; margin-top:8px; }
  .musica-btn { position:fixed; top:18px; right:18px; background:var(--ink); color:#fff; border:none; border-radius:0; padding:10px 16px; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; z-index:10; }
  footer { padding:30px 8vw; font-size:0.75rem; color:#888; border-top:1px solid var(--ink); text-transform:uppercase; letter-spacing:0.05em; }
  @media (max-width:640px) { .detalles { grid-template-columns:1fr; } .detalle-card:first-child { border-right:none; padding-right:0; border-bottom:1px solid var(--ink);} .detalle-card:last-child { padding-left:0; } .galeria-grid { grid-template-columns:repeat(2,1fr); } }
</style></head><body>
${musicaHTML(f.musica ? data.musicaUrl : '')}
<section class="hero">
  <p class="hero-kicker">Nos casamos</p>
  <h1 class="hero-names">${escapeHtmlInv(data.novio1)}<br><span class="hero-amp">&amp;</span> ${escapeHtmlInv(data.novio2)}</h1>
  <p class="hero-fecha">${fechaLarga}</p>
  <div class="countdown" id="countdown"></div>
  ${f.hashtag ? hashtagHTML(data.hashtag) : ''}
  ${fotoPortada}
</section>
${data.historia ? `<section class="section"><h2>Nuestra historia</h2>${nl2p(data.historia)}</section>` : ''}
<section class="section">
  <h2>Detalles del evento</h2>
  <div class="detalles">
    <div class="detalle-card"><h3>Ceremonia</h3><p><strong>Hora</strong> — ${escapeHtmlInv(data.horaCeremonia)}</p><p><strong>Lugar</strong> — ${escapeHtmlInv(data.lugarCeremonia)}</p>${data.direccionCeremonia ? `<p>${escapeHtmlInv(data.direccionCeremonia)}</p>` : ''}${f.mapa && data.mapaCeremonia ? `<p><a href="${escapeHtmlInv(data.mapaCeremonia)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
    <div class="detalle-card"><h3>Recepción</h3><p><strong>Hora</strong> — ${escapeHtmlInv(data.horaRecepcion)}</p><p><strong>Lugar</strong> — ${escapeHtmlInv(data.lugarRecepcion)}</p>${data.direccionRecepcion ? `<p>${escapeHtmlInv(data.direccionRecepcion)}</p>` : ''}${f.mapa && data.mapaRecepcion ? `<p><a href="${escapeHtmlInv(data.mapaRecepcion)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
  </div>
</section>
${f.vestimenta && data.vestimenta ? `<section class="section"><h2>Código de vestimenta</h2><p>${escapeHtmlInv(data.vestimenta)}</p></section>` : ''}
${f.regalos && data.regalos ? `<section class="section"><h2>Mesa de regalos</h2>${nl2p(data.regalos)}</section>` : ''}
${seccionesExtra(data, f)}
${f.rsvp !== false ? `<section class="section"><h2>Confirma tu asistencia</h2>${rsvpFormHTML(data, fechaLarga)}</section>` : ''}
<footer>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)} — Fotografía por Lua Fotografía</footer>
${scriptComunInvitacion(fechaISOConHora, mailtoRSVP)}
</body></html>`;
}

// ============================== DISEÑO 3: ROMÁNTICA ==============================
function plantillaRomantica(data) {
  const { acento, fechaLarga, fechaISOConHora, mailtoRSVP, f } = prepararContexto(data);
  const fotoPortada = f.fotoPortada && data.fotoPortada
    ? `<img class="foto-portada" src="${data.fotoPortada}" alt="">` : '';
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,450&family=Work+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root { --ink:#3c342c; --blush:#FBF1EE; --blush2:#F3DED9; --white:#FFFDFB; --acento:${acento}; --serif:'Fraunces',serif; --sans:'Work Sans',sans-serif; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:var(--sans); color:var(--ink); background:var(--white); }
  a { color:var(--acento); }
  .section { padding:11vw 8vw; max-width:640px; margin:0 auto; text-align:center; }
  .section-wide { max-width:820px; }
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:12vw 8vw; background:radial-gradient(circle at 50% 30%, var(--blush2) 0%, var(--blush) 55%, var(--white) 100%); }
  .hero-deco { font-size:1.8rem; color:var(--acento); margin-bottom:10px; }
  .foto-portada { width:190px; height:190px; object-fit:cover; border-radius:50%; box-shadow:0 14px 34px rgba(60,52,44,0.18); margin-bottom:22px; border:6px solid var(--white); }
  .hero-names { font-family:var(--serif); font-style:italic; font-weight:450; font-size:clamp(2.8rem,11vw,5.5rem); margin:0; line-height:1.2; color:var(--acento); }
  .hero-fecha { margin-top:20px; font-size:1rem; }
  .countdown { display:flex; gap:14px; justify-content:center; margin-top:32px; flex-wrap:wrap; }
  .countdown div { display:flex; flex-direction:column; align-items:center; background:var(--white); border-radius:50%; width:68px; height:68px; justify-content:center; box-shadow:0 4px 18px rgba(60,52,44,0.08); }
  .countdown strong { font-family:var(--serif); font-size:1.25rem; }
  .countdown span { font-size:0.56rem; text-transform:uppercase; letter-spacing:0.06em; color:#8a7d72; }
  .hashtag { margin-top:18px; color:var(--acento); font-style:italic; font-family:var(--serif); }
  h2 { font-family:var(--serif); font-style:italic; font-size:clamp(1.7rem,4vw,2.3rem); margin-bottom:18px; color:var(--acento); }
  .section p { line-height:1.8; color:#5a4f45; }
  .detalles { display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left; margin-top:28px; }
  .detalle-card { background:var(--blush); border-radius:22px; padding:26px; }
  .detalle-card h3 { font-family:var(--serif); font-style:italic; font-size:1.2rem; margin:0 0 10px; color:var(--acento); }
  .detalle-card p { margin:4px 0; font-size:0.92rem; }
  .itin-list { text-align:left; max-width:420px; margin:0 auto; }
  .itin-item { display:flex; gap:16px; padding:12px 18px; background:var(--blush); border-radius:16px; margin-bottom:8px; }
  .itin-hora { font-family:var(--serif); font-style:italic; color:var(--acento); min-width:66px; }
  .galeria-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-top:26px; }
  .galeria-item img { width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:22px; }
  .rsvp-form { display:flex; flex-direction:column; gap:14px; text-align:left; margin-top:24px; }
  .rsvp-form label { display:flex; flex-direction:column; gap:6px; font-size:0.9rem; }
  .rsvp-form input, .rsvp-form select, .rsvp-form textarea { background:var(--blush); border:1px solid var(--blush2); padding:11px 14px; border-radius:14px; font-family:var(--sans); font-size:0.95rem; }
  .rsvp-form button { background:var(--acento); color:#fff; border:none; padding:14px; border-radius:30px; font-family:var(--sans); font-size:0.95rem; cursor:pointer; margin-top:6px; }
  .musica-btn { position:fixed; top:18px; right:18px; background:var(--white); border:1px solid var(--acento); color:var(--acento); border-radius:30px; padding:8px 16px; font-size:0.8rem; cursor:pointer; z-index:10; }
  footer { text-align:center; padding:34px; font-size:0.8rem; color:#a3958a; }
  @media (max-width:640px) { .detalles { grid-template-columns:1fr; } .galeria-grid { grid-template-columns:repeat(2,1fr); } }
</style></head><body>
${musicaHTML(f.musica ? data.musicaUrl : '')}
<section class="hero">
  <p class="hero-deco">❦</p>
  ${fotoPortada}
  <h1 class="hero-names">${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)}</h1>
  <p class="hero-fecha">${fechaLarga}</p>
  <div class="countdown" id="countdown"></div>
  ${f.hashtag ? hashtagHTML(data.hashtag) : ''}
</section>
${data.historia ? `<section class="section"><h2>Nuestra historia</h2>${nl2p(data.historia)}</section>` : ''}
<section class="section">
  <h2>Los detalles</h2>
  <div class="detalles">
    <div class="detalle-card"><h3>Ceremonia</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaCeremonia)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarCeremonia)}</p>${data.direccionCeremonia ? `<p>${escapeHtmlInv(data.direccionCeremonia)}</p>` : ''}${f.mapa && data.mapaCeremonia ? `<p><a href="${escapeHtmlInv(data.mapaCeremonia)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
    <div class="detalle-card"><h3>Recepción</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaRecepcion)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarRecepcion)}</p>${data.direccionRecepcion ? `<p>${escapeHtmlInv(data.direccionRecepcion)}</p>` : ''}${f.mapa && data.mapaRecepcion ? `<p><a href="${escapeHtmlInv(data.mapaRecepcion)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
  </div>
</section>
${f.vestimenta && data.vestimenta ? `<section class="section"><h2>Código de vestimenta</h2><p>${escapeHtmlInv(data.vestimenta)}</p></section>` : ''}
${f.regalos && data.regalos ? `<section class="section"><h2>Mesa de regalos</h2>${nl2p(data.regalos)}</section>` : ''}
${seccionesExtra(data, f)}
${f.rsvp !== false ? `<section class="section"><h2>Confirma tu asistencia</h2>${rsvpFormHTML(data, fechaLarga)}</section>` : ''}
<footer>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)} · Fotografía por Lua Fotografía</footer>
${scriptComunInvitacion(fechaISOConHora, mailtoRSVP)}
</body></html>`;
}

window.LUA_ACENTOS = LUA_ACENTOS;
window.LUA_INVITACION_TEMPLATES = {
  clasica: { label: 'Clásica — serif elegante', generar: plantillaClasica },
  moderna: { label: 'Moderna — minimalista', generar: plantillaModerna },
  romantica: { label: 'Romántica — suave e íntima', generar: plantillaRomantica },
};

// ============================== PLANES ==============================
// Cada plan prende un set de features por default; el admin puede
// prender/apagar cada una a mano después de elegir el plan.
window.LUA_PLANES = {
  basica: {
    label: 'Básica',
    descripcion: 'Cuenta regresiva, detalles del evento y confirmación de asistencia.',
    features: { rsvp: true, mapa: true, vestimenta: false, regalos: false, musica: false, galeria: false, itinerario: false, hashtag: false, hospedaje: false, fotoPortada: false },
  },
  pro: {
    label: 'Pro',
    descripcion: 'Todo lo de Básica + música de fondo, galería de fotos, código de vestimenta, mesa de regalos y hashtag.',
    features: { rsvp: true, mapa: true, vestimenta: true, regalos: true, musica: true, galeria: true, itinerario: false, hashtag: true, hospedaje: false, fotoPortada: true },
  },
  gold: {
    label: 'Gold',
    descripcion: 'Todo lo de Pro + itinerario detallado y opciones de hospedaje.',
    features: { rsvp: true, mapa: true, vestimenta: true, regalos: true, musica: true, galeria: true, itinerario: true, hashtag: true, hospedaje: true, fotoPortada: true },
  },
};
