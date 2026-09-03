// ==========================================================================
// Generador de invitaciones web — Lua Fotografía
//
// Tres diseños distintos que comparten los mismos datos. Cambiás el diseño
// en el selector del admin y se genera de nuevo con la misma información.
// El resultado es HTML autocontenido, listo para descargar y publicar.
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

// Script compartido por los 3 diseños: cuenta regresiva + envío de RSVP por email
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
        el.innerHTML =
          '<div><strong>' + dias + '</strong><span>días</span></div>' +
          '<div><strong>' + horas + '</strong><span>horas</span></div>' +
          '<div><strong>' + min + '</strong><span>min</span></div>';
      }
      actualizar();
      setInterval(actualizar, 60000);
    }
  })();

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

function prepararContexto(data) {
  return {
    acento: (LUA_ACENTOS[data.acento] || LUA_ACENTOS.dorado).hex,
    fechaLarga: formatearFechaLarga(data.fecha),
    fechaISOConHora: data.fecha ? `${data.fecha}T${data.horaCeremonia || '00:00'}:00` : '',
    mailtoRSVP: data.emailRSVP || 'hola@luafotografia.com',
  };
}

// ============================== DISEÑO 1: CLÁSICA ==============================
// Serif elegante, hero centrado en degradé, tarjetas para los detalles.
function plantillaClasica(data) {
  const { acento, fechaLarga, fechaISOConHora, mailtoRSVP } = prepararContexto(data);
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
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:10vw 8vw; background:linear-gradient(160deg, var(--linen) 0%, var(--cream) 100%); }
  .hero-kicker { letter-spacing:0.3em; text-transform:uppercase; font-size:0.75rem; color:var(--acento); margin-bottom:18px; }
  .hero-names { font-family:var(--serif); font-style:italic; font-weight:450; font-size:clamp(2.4rem,9vw,5rem); margin:0; line-height:1.15; }
  .hero-amp { color:var(--acento); }
  .hero-fecha { margin-top:22px; font-size:1.05rem; text-transform:capitalize; }
  .countdown { display:flex; gap:22px; justify-content:center; margin-top:34px; flex-wrap:wrap; }
  .countdown div { display:flex; flex-direction:column; align-items:center; }
  .countdown strong { font-family:var(--serif); font-size:1.8rem; }
  .countdown span { font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:#6b6255; }
  h2 { font-family:var(--serif); font-size:clamp(1.6rem,4vw,2.2rem); margin-bottom:20px; }
  .section p { line-height:1.7; color:#3c3830; }
  .detalles { display:grid; grid-template-columns:1fr 1fr; gap:24px; text-align:left; margin-top:30px; }
  .detalle-card { background:var(--cream); border:1px solid #d8cdb6; border-radius:2px; padding:24px; }
  .detalle-card h3 { font-family:var(--serif); font-size:1.15rem; margin:0 0 10px; }
  .detalle-card p { margin:4px 0; font-size:0.92rem; }
  .divider { width:40px; height:1px; background:var(--acento); margin:0 auto 22px; }
  .rsvp-form { display:flex; flex-direction:column; gap:14px; text-align:left; margin-top:24px; }
  .rsvp-form label { display:flex; flex-direction:column; gap:6px; font-size:0.9rem; }
  .rsvp-form input, .rsvp-form select, .rsvp-form textarea { background:var(--cream); border:1px solid #d8cdb6; padding:10px 12px; border-radius:2px; font-family:var(--sans); font-size:0.95rem; }
  .rsvp-form button { background:var(--acento); color:#fff; border:none; padding:14px; border-radius:2px; font-family:var(--sans); font-size:0.95rem; cursor:pointer; margin-top:6px; }
  footer { text-align:center; padding:30px; font-size:0.8rem; color:#8a8073; }
  @media (max-width:640px) { .detalles { grid-template-columns:1fr; } }
</style></head><body>
<section class="hero">
  <p class="hero-kicker">Nos casamos</p>
  <h1 class="hero-names">${escapeHtmlInv(data.novio1)} <span class="hero-amp">&amp;</span> ${escapeHtmlInv(data.novio2)}</h1>
  <p class="hero-fecha">${fechaLarga}</p>
  <div class="countdown" id="countdown"></div>
</section>
${data.historia ? `<section class="section"><div class="divider"></div><h2>Nuestra historia</h2>${nl2p(data.historia)}</section>` : ''}
<section class="section">
  <div class="divider"></div><h2>Detalles del evento</h2>
  <div class="detalles">
    <div class="detalle-card"><h3>Ceremonia</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaCeremonia)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarCeremonia)}</p>${data.direccionCeremonia ? `<p>${escapeHtmlInv(data.direccionCeremonia)}</p>` : ''}${data.mapaCeremonia ? `<p><a href="${escapeHtmlInv(data.mapaCeremonia)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
    <div class="detalle-card"><h3>Recepción</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaRecepcion)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarRecepcion)}</p>${data.direccionRecepcion ? `<p>${escapeHtmlInv(data.direccionRecepcion)}</p>` : ''}${data.mapaRecepcion ? `<p><a href="${escapeHtmlInv(data.mapaRecepcion)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
  </div>
</section>
${data.vestimenta ? `<section class="section"><div class="divider"></div><h2>Código de vestimenta</h2><p>${escapeHtmlInv(data.vestimenta)}</p></section>` : ''}
${data.regalos ? `<section class="section"><div class="divider"></div><h2>Mesa de regalos</h2>${nl2p(data.regalos)}</section>` : ''}
<section class="section"><div class="divider"></div><h2>Confirma tu asistencia</h2>${rsvpFormHTML(data, fechaLarga)}</section>
<footer>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)} · Fotografía por Lua Fotografía</footer>
${scriptComunInvitacion(fechaISOConHora, mailtoRSVP)}
</body></html>`;
}

// ============================== DISEÑO 2: MODERNA ==============================
// Minimalista, tipografía sans en mayúsculas, líneas finas, blanco y negro con acento.
function plantillaModerna(data) {
  const { acento, fechaLarga, fechaISOConHora, mailtoRSVP } = prepararContexto(data);
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
  .countdown { display:flex; gap:30px; margin-top:36px; }
  .countdown div { display:flex; flex-direction:column; }
  .countdown strong { font-size:2rem; font-weight:700; }
  .countdown span { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.1em; color:#666; }
  h2 { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.25em; color:var(--acento); font-weight:500; margin-bottom:24px; }
  .section p { line-height:1.8; font-size:1.05rem; max-width:56ch; }
  .detalles { display:grid; grid-template-columns:1fr 1fr; gap:0; margin-top:10px; border-top:1px solid var(--ink); }
  .detalle-card { padding:26px 0; border-bottom:1px solid var(--ink); }
  .detalle-card:first-child { border-right:1px solid var(--ink); padding-right:26px; }
  .detalle-card:last-child { padding-left:26px; }
  .detalle-card h3 { text-transform:uppercase; font-size:0.85rem; letter-spacing:0.1em; margin:0 0 12px; }
  .detalle-card p { margin:4px 0; font-size:0.92rem; }
  .rsvp-form { display:flex; flex-direction:column; gap:16px; margin-top:24px; max-width:480px; }
  .rsvp-form label { display:flex; flex-direction:column; gap:6px; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; }
  .rsvp-form input, .rsvp-form select, .rsvp-form textarea { background:var(--grey); border:none; border-bottom:2px solid var(--ink); padding:12px 10px; font-family:var(--sans); font-size:1rem; }
  .rsvp-form button { background:var(--ink); color:#fff; border:none; padding:16px; text-transform:uppercase; letter-spacing:0.1em; font-size:0.85rem; cursor:pointer; margin-top:8px; }
  footer { padding:30px 8vw; font-size:0.75rem; color:#888; border-top:1px solid var(--ink); text-transform:uppercase; letter-spacing:0.05em; }
  @media (max-width:640px) { .detalles { grid-template-columns:1fr; } .detalle-card:first-child { border-right:none; padding-right:0; border-bottom:1px solid var(--ink);} .detalle-card:last-child { padding-left:0; } }
</style></head><body>
<section class="hero">
  <p class="hero-kicker">Nos casamos</p>
  <h1 class="hero-names">${escapeHtmlInv(data.novio1)}<br><span class="hero-amp">&amp;</span> ${escapeHtmlInv(data.novio2)}</h1>
  <p class="hero-fecha">${fechaLarga}</p>
  <div class="countdown" id="countdown"></div>
</section>
${data.historia ? `<section class="section"><h2>Nuestra historia</h2>${nl2p(data.historia)}</section>` : ''}
<section class="section">
  <h2>Detalles del evento</h2>
  <div class="detalles">
    <div class="detalle-card"><h3>Ceremonia</h3><p><strong>Hora</strong> — ${escapeHtmlInv(data.horaCeremonia)}</p><p><strong>Lugar</strong> — ${escapeHtmlInv(data.lugarCeremonia)}</p>${data.direccionCeremonia ? `<p>${escapeHtmlInv(data.direccionCeremonia)}</p>` : ''}${data.mapaCeremonia ? `<p><a href="${escapeHtmlInv(data.mapaCeremonia)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
    <div class="detalle-card"><h3>Recepción</h3><p><strong>Hora</strong> — ${escapeHtmlInv(data.horaRecepcion)}</p><p><strong>Lugar</strong> — ${escapeHtmlInv(data.lugarRecepcion)}</p>${data.direccionRecepcion ? `<p>${escapeHtmlInv(data.direccionRecepcion)}</p>` : ''}${data.mapaRecepcion ? `<p><a href="${escapeHtmlInv(data.mapaRecepcion)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
  </div>
</section>
${data.vestimenta ? `<section class="section"><h2>Código de vestimenta</h2><p>${escapeHtmlInv(data.vestimenta)}</p></section>` : ''}
${data.regalos ? `<section class="section"><h2>Mesa de regalos</h2>${nl2p(data.regalos)}</section>` : ''}
<section class="section"><h2>Confirma tu asistencia</h2>${rsvpFormHTML(data, fechaLarga)}</section>
<footer>${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)} — Fotografía por Lua Fotografía</footer>
${scriptComunInvitacion(fechaISOConHora, mailtoRSVP)}
</body></html>`;
}

// ============================== DISEÑO 3: ROMÁNTICA ==============================
// Tonos suaves, nombres en script grande, tarjetas redondeadas, más íntimo.
function plantillaRomantica(data) {
  const { acento, fechaLarga, fechaISOConHora, mailtoRSVP } = prepararContexto(data);
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
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:12vw 8vw; background:radial-gradient(circle at 50% 30%, var(--blush2) 0%, var(--blush) 55%, var(--white) 100%); }
  .hero-deco { font-size:1.8rem; color:var(--acento); margin-bottom:10px; }
  .hero-names { font-family:var(--serif); font-style:italic; font-weight:450; font-size:clamp(2.8rem,11vw,5.5rem); margin:0; line-height:1.2; color:var(--acento); }
  .hero-fecha { margin-top:20px; font-size:1rem; }
  .countdown { display:flex; gap:16px; justify-content:center; margin-top:32px; flex-wrap:wrap; }
  .countdown div { display:flex; flex-direction:column; align-items:center; background:var(--white); border-radius:50%; width:74px; height:74px; justify-content:center; box-shadow:0 4px 18px rgba(60,52,44,0.08); }
  .countdown strong { font-family:var(--serif); font-size:1.4rem; }
  .countdown span { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.06em; color:#8a7d72; }
  h2 { font-family:var(--serif); font-style:italic; font-size:clamp(1.7rem,4vw,2.3rem); margin-bottom:18px; color:var(--acento); }
  .section p { line-height:1.8; color:#5a4f45; }
  .detalles { display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left; margin-top:28px; }
  .detalle-card { background:var(--blush); border-radius:22px; padding:26px; }
  .detalle-card h3 { font-family:var(--serif); font-style:italic; font-size:1.2rem; margin:0 0 10px; color:var(--acento); }
  .detalle-card p { margin:4px 0; font-size:0.92rem; }
  .rsvp-form { display:flex; flex-direction:column; gap:14px; text-align:left; margin-top:24px; }
  .rsvp-form label { display:flex; flex-direction:column; gap:6px; font-size:0.9rem; }
  .rsvp-form input, .rsvp-form select, .rsvp-form textarea { background:var(--blush); border:1px solid var(--blush2); padding:11px 14px; border-radius:14px; font-family:var(--sans); font-size:0.95rem; }
  .rsvp-form button { background:var(--acento); color:#fff; border:none; padding:14px; border-radius:30px; font-family:var(--sans); font-size:0.95rem; cursor:pointer; margin-top:6px; }
  footer { text-align:center; padding:34px; font-size:0.8rem; color:#a3958a; }
  @media (max-width:640px) { .detalles { grid-template-columns:1fr; } }
</style></head><body>
<section class="hero">
  <p class="hero-deco">❦</p>
  <h1 class="hero-names">${escapeHtmlInv(data.novio1)} &amp; ${escapeHtmlInv(data.novio2)}</h1>
  <p class="hero-fecha">${fechaLarga}</p>
  <div class="countdown" id="countdown"></div>
</section>
${data.historia ? `<section class="section"><h2>Nuestra historia</h2>${nl2p(data.historia)}</section>` : ''}
<section class="section">
  <h2>Los detalles</h2>
  <div class="detalles">
    <div class="detalle-card"><h3>Ceremonia</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaCeremonia)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarCeremonia)}</p>${data.direccionCeremonia ? `<p>${escapeHtmlInv(data.direccionCeremonia)}</p>` : ''}${data.mapaCeremonia ? `<p><a href="${escapeHtmlInv(data.mapaCeremonia)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
    <div class="detalle-card"><h3>Recepción</h3><p><strong>Hora:</strong> ${escapeHtmlInv(data.horaRecepcion)}</p><p><strong>Lugar:</strong> ${escapeHtmlInv(data.lugarRecepcion)}</p>${data.direccionRecepcion ? `<p>${escapeHtmlInv(data.direccionRecepcion)}</p>` : ''}${data.mapaRecepcion ? `<p><a href="${escapeHtmlInv(data.mapaRecepcion)}" target="_blank" rel="noopener">Ver mapa →</a></p>` : ''}</div>
  </div>
</section>
${data.vestimenta ? `<section class="section"><h2>Código de vestimenta</h2><p>${escapeHtmlInv(data.vestimenta)}</p></section>` : ''}
${data.regalos ? `<section class="section"><h2>Mesa de regalos</h2>${nl2p(data.regalos)}</section>` : ''}
<section class="section"><h2>Confirma tu asistencia</h2>${rsvpFormHTML(data, fechaLarga)}</section>
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
// Compatibilidad con el nombre anterior (por si algo lo sigue usando)
window.LUA_generarInvitacionHTML = (data) =>
  (LUA_INVITACION_TEMPLATES[data.plantilla] || LUA_INVITACION_TEMPLATES.clasica).generar(data);
