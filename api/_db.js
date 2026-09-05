// Helper compartido: conexión a la base de datos Postgres (Neon, vía Vercel Storage).
//
// La integración de Neon en Vercel creó las variables con el prefijo elegido
// EN MINÚSCULAS ("lua_fotografia_db_") + el nombre real de Neon en mayúsculas,
// ej: lua_fotografia_db_DATABASE_URL. Probamos varias por las dudas de que
// cambien en el futuro.
const { neon } = require('@neondatabase/serverless');

function getSql() {
  const url =
    process.env.lua_fotografia_db_DATABASE_URL ||
    process.env.lua_fotografia_db_DATABASE_URL_UNPOOLED ||
    process.env.LUA_FOTOGRAFIA_DB_URL ||
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      'No se encontró la variable de conexión a la base de datos. ' +
      'Revisá en Vercel → Settings → Environment Variables que exista lua_fotografia_db_DATABASE_URL.'
    );
  }
  return neon(url);
}

module.exports = { getSql };
