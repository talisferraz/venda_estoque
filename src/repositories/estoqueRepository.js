import pool from '../config/database.js';

class EstoqueRepository {
  // Buscar movimentações por ID de produto (Histórico)
  async findHistoricoPorProduto(produtoId) {
    const query = `
      SELECT m.*, p.nome AS produto_nome 
      FROM movimentacoes_estoque m
      JOIN produtos p ON m.produto_id = p.id
      WHERE m.produto_id = ?
      ORDER BY m.criado_em DESC
    `;
    const [rows] = await pool.query(query, [produtoId]);
    return rows;
  }

  // Listar todas as movimentações do sistema
  async findTodoHistorico() {
    const query = `
      SELECT m.*, p.nome AS produto_nome, p.sku 
      FROM movimentacoes_estoque m
      JOIN produtos p ON m.produto_id = p.id
      ORDER BY m.criado_em DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }
}

export default new EstoqueRepository();
