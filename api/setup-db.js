// Crea las tablas si todavía no existen. Es seguro llamarlo más de una vez
// (no borra ni duplica nada). Requiere ?confirmar=si para evitar ejecuciones
// accidentales por robots o previews de link.
const { getSql } = require('./_db');

module.exports = async (req, res) => {
  if (req.query.confirmar !== 'si') {
    return res.status(400).json({
      ok: false,
      error: 'Agregá ?confirmar=si al final de la URL para crear las tablas.',
    });
  }

  try {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        evento TEXT,
        carpeta TEXT,
        notas TEXT,
        creado_en TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS invitaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        datos JSONB NOT NULL,
        slug TEXT UNIQUE,
        link_publicado TEXT,
        creado_en TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS recibos (
        id SERIAL PRIMARY KEY,
        numero TEXT UNIQUE,
        cliente TEXT,
        evento TEXT,
        fecha DATE,
        total NUMERIC,
        items JSONB,
        creado_en TIMESTAMPTZ DEFAULT now()
      )
    `;

    res.status(200).json({
      ok: true,
      mensaje: 'Listo: las tablas usuarios, invitaciones y recibos ya existen.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
