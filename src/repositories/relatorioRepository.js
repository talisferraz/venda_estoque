import pool from '../config/database.js';

class RelatorioRepository {
  // 💰 Faturamento Diário, Semanal e Mensal (Apenas de vendas CONCLUIDAS)
  async getFaturamento() {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(data_venda) = CURDATE() THEN total END), 0) AS faturamento_diario,
        COALESCE(SUM(CASE WHEN data_venda >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN total END), 0) AS faturamento_semanal,
        COALESCE(SUM(CASE WHEN data_venda >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total END), 0) AS faturamento_mensal
      FROM vendas
      WHERE status = 'CONCLUIDA';
    `;
    const [rows] = await pool.query(query);
    return rows[0];
  }

  // 🏆 Produtos Mais Vendidos (Ranqueados por quantidade de saída nas vendas concluídas)
  async getProdutosMaisVendidos(limit = 5) {
    const query = `
      SELECT p.id, p.sku, p.nome, SUM(iv.quantidade) AS total_vendido, SUM(iv.quantidade * iv.preco_unitario) AS receita_total
      FROM itens_venda iv
      JOIN vendas v ON iv.venda_id = v.id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE v.status = 'CONCLUIDA'
      GROUP BY p.id
      ORDER BY total_vendido DESC
      LIMIT ?;
    `;
    const [rows] = await pool.query(query, [limit]);
    return rows;
  }

  // ⚠️ Alerta de Produtos com Estoque Baixo (Quantidade atual <= Quantidade mínima)
  async getEstoqueBaixo() {
    const query = `
      SELECT id, sku, nome, quantidade_atual, quantidade_minima, (quantidade_minima - quantidade_atual) AS deficit
      FROM produtos
      WHERE quantidade_atual <= quantidade_minima
      ORDER BY quantidade_atual ASC;
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  // 📦 Valor Total do Estoque pelo Custo (Valuation do estoque atual)
  async getValorTotalEstoqueCusto() {
    const query = `
      SELECT 
        SUM(quantidade_atual) AS total_itens_estoque,
        SUM(quantidade_atual * preco_custo) AS valor_total_custo
      FROM produtos;
    `;
    const [rows] = await pool.query(query);
    return rows[0];
  }

  // 📈 Estimativa de Lucro Bruto Realizado (Receita de vendas concluídas menos custo real dos produtos vendidos)
  async getEstimativaLucroBruto() {
    const query = `
      SELECT 
        SUM(iv.quantidade * iv.preco_unitario) AS receita_vendas,
        SUM(iv.quantidade * p.preco_custo) AS custo_produtos_vendidos,
        (SUM(iv.quantidade * iv.preco_unitario) - SUM(iv.quantidade * p.preco_custo)) AS lucro_bruto_estimado
      FROM itens_venda iv
      JOIN vendas v ON iv.venda_id = v.id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE v.status = 'CONCLUIDA';
    `;
    const [rows] = await pool.query(query);
    return rows[0];
  }
}

export default new RelatorioRepository();
