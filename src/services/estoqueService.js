import pool from '../config/database.js';

class EstoqueService {
  async movimentarEstoque(produtoId, tipo, quantidade, motivo) {
    // Pegar uma conexão dedicada do Pool para gerenciar a transação
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Buscar a quantidade atual do produto e travar a linha para evitar concorrência (FOR UPDATE)
      const [produtos] = await connection.query(
        'SELECT quantidade_atual, nome FROM produtos WHERE id = ? FOR UPDATE',
        [produtoId]
      );

      if (produtos.length === 0) {
        throw new Error('Produto não encontrado.');
      }

      const produto = produtos[0];
      let novaQuantidade = produto.quantidade_atual;

      // 2. Calcular o novo saldo dependendo do tipo de movimentação
      if (tipo === 'ENTRADA') {
        novaQuantidade += quantidade;
      } else if (tipo === 'SAIDA') {
        novaQuantidade -= quantidade;
        
        // REGRA DE NEGÓCIO: Impedir estoque negativo
        if (novaQuantidade < 0) {
          throw new Error(`Saldo insuficiente em estoque para o produto "${produto.nome}". Estoque atual: ${produto.quantidade_atual}.`);
        }
      } else {
        throw new Error('Tipo de movimentação inválido. Use "ENTRADA" ou "SAIDA".');
      }

      // 3. Atualizar a quantidade atual na tabela de produtos
      await connection.query(
        'UPDATE produtos SET quantidade_atual = ? WHERE id = ?',
        [novaQuantidade, produtoId]
      );

      // 4. Registrar o histórico na tabela de movimentações
      await connection.query(
        'INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)',
        [produtoId, tipo, quantidade, motivo]
      );

      // Salva as alterações definitivamente no banco de dados
      await connection.commit();
      return { sucesso: true, novoSaldo: novaQuantidade };

    } catch (error) {
      // Desfaz qualquer alteração feita caso ocorra um erro no meio do caminho
      await connection.rollback();
      throw error;
    } finally {
      // Devolve a conexão para o pool
      connection.release();
    }
  }
}

export default new EstoqueService();
