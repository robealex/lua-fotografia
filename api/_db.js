// Helper compartido: conexión a la base de datos Postgres (Neon, vía Vercel Storage).
//
// La variable de entorno la crea Vercel automáticamente al conectar la base
// desde Storage → Neon, usando el prefijo elegido (lua_fotografia_db) + "_URL".
// Si en algún momento cambia el prefijo, actualizar acá.
const { neon } = require('@neondatabase/serverless');

function getSql() {
  const url =
    process.env.LUA_FOTOGRAFIA_DB_URL ||
    process.env.LUA_FOTOGRAFIA_DB_DATABASE_URL ||
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'No se encontró la variable de conexión a la base de datos. ' +
      'Revisá en Vercel → Settings → Environment Variables que exista LUA_FOTOGRAFIA_DB_URL.'
    );
  }
  return neon(url);
}

module.exports = { getSql };
