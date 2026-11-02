import pool from '../config/database.js';

class ProdutoRepository {
  // Criar um novo produto
  async create(produto) {
    const { sku, nome, descricao, preco_custo, preco_venda, quantidade_atual, quantidade_minima, categoria_id, fornecedor_id } = produto;
    const query = `
      INSERT INTO produtos (sku, nome, descricao, preco_custo, preco_venda, quantidade_atual, quantidade_minima, categoria_id, fornecedor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [sku, nome, descricao, preco_custo, preco_venda, quantidade_atual, quantidade_minima, categoria_id, fornecedor_id]);
    return result.insertId;
  }

  // Buscar produto por SKU (útil para validação de duplicidade)
  async findBySku(sku) {
    const query = 'SELECT * FROM produtos WHERE sku = ?';
    const [rows] = await pool.query(query, [sku]);
    return rows[0];
  }

  // Listar todos os produtos (Trazendo nomes de categorias e fornecedores com JOIN)
  async findAll() {
    const query = `
      SELECT p.*, c.nome AS categoria_nome, f.razao_social AS fornecedor_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  // Buscar um produto específico por ID
  async findById(id) {
    const query = 'SELECT * FROM produtos WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  // Atualizar dados do produto
  async update(id, produto) {
    const { sku, nome, descricao, preco_custo, preco_venda, quantidade_atual, quantidade_minima, categoria_id, fornecedor_id } = produto;
    const query = `
      UPDATE produtos 
      SET sku = ?, nome = ?, descricao = ?, preco_custo = ?, preco_venda = ?, quantidade_atual = ?, quantidade_minima = ?, categoria_id = ?, fornecedor_id = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [sku, nome, descricao, preco_custo, preco_venda, quantidade_atual, quantidade_minima, categoria_id, fornecedor_id, id]);
    return result.affectedRows > 0;
  }

  // Deletar produto
  async delete(id) {
    const query = 'DELETE FROM produtos WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

export default new ProdutoRepository();
