import pool from '../config/database.js';

class UsuarioRepository {
  async create(nome, email, senhaCriptografada, role) {
    const query = 'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [nome, email, senhaCriptografada, role || 'VENDEDOR']);
    return result.insertId;
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows[0] || null;
  }
}

export default new UsuarioRepository();
