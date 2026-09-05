const { getSql } = require('./_db');

module.exports = async (req, res) => {
  try {
    const sql = getSql();
    const rows = await sql`select now() as ahora, current_database() as base`;
    res.status(200).json({
      ok: true,
      mensaje: 'Conexión a la base de datos exitosa.',
      ahora: rows[0].ahora,
      base: rows[0].base,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
