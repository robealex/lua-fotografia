# Lua Fotografía — sitio web

Sitio estático (HTML + CSS) para el estudio de fotografía de bodas Lua Fotografía.

## Antes de publicar
- Reemplazá los bloques de `.ph` en `index.html` (sección Portfolio) y el `.hero-frame` por tus fotos reales.
- Cambiá el email de contacto y conectá el formulario a un servicio como [Formspree](https://formspree.io) (gratis y sin backend propio).
- Ajustá los textos de servicios y testimonios con casos reales.

## 1. Subir a GitHub
```bash
cd lua-fotografia
git init
git add .
git commit -m "Sitio Lua Fotografía"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/lua-fotografia.git
git push -u origin main
```
(Creá antes el repo vacío en github.com → "New repository", sin README.)

## 2. Publicar en Vercel
1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con tu cuenta de GitHub.
2. "Add New… → Project" y elegí el repo `lua-fotografia`.
3. Framework: **Other** (es HTML plano, no necesita build).
4. Deploy. En un minuto tenés una URL tipo `lua-fotografia.vercel.app`.

## 3. Dominio propio (opcional)
En el proyecto de Vercel → Settings → Domains, agregá tu dominio (por ejemplo `luafotografia.com`) y seguí las instrucciones de DNS que te muestra.

Cada vez que hagas `git push` a `main`, Vercel vuelve a publicar el sitio automáticamente.
