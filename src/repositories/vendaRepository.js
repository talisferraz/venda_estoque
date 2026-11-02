import pool from '../config/database.js';

class VendaRepository {
  // Consultar histórico geral de vendas
  async findAll() {
    const query = `
      SELECT * FROM vendas 
      ORDER BY data_venda DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  // Buscar uma venda detalhada pelo ID
  async findById(id) {
    const query = 'SELECT * FROM vendas WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Buscar todos os itens associados a uma venda específica
  async findItensByVendaId(vendaId) {
    const query = `
      SELECT iv.*, p.nome AS produto_nome, p.sku 
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = ?
    `;
    const [rows] = await pool.query(query, [vendaId]);
    return rows;
  }
}

export default new VendaRepository();
