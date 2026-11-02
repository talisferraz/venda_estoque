import pool from '../config/database.js';

class VendaService {
  // 🛒 REGISTRAR UMA NOVA VENDA COM VÁRIOS PRODUTOS
  async registrarVenda(dadosVenda) {
    const { itens, desconto = 0 } = dadosVenda;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let subtotal = 0;
      const itensProcessados = [];

      // 1. Validar estoque e calcular preços para cada item do carrinho
      for (const item of itens) {
        const { produto_id, quantidade } = item;

        // Buscar dados do produto travando a linha para evitar concorrência dupla
        const [produtos] = await connection.query(
          'SELECT nome, preco_venda, quantidade_atual FROM produtos WHERE id = ? FOR UPDATE',
          [produto_id]
        );

        if (produtos.length === 0) {
          throw new Error(`Produto com ID ${produto_id} não encontrado.`);
        }

        const produto = produtos[0];

        // Validar estoque disponível
        if (produto.quantidade_atual < quantidade) {
          throw new Error(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidade_atual}, Solicitado: ${quantidade}.`);
        }

        const itemSubtotal = produto.preco_venda * quantidade;
        subtotal += itemSubtotal;

        itensProcessados.push({
          produto_id,
          quantidade,
          preco_unitario: produto.preco_venda,
          novo_estoque: produto.quantidade_atual - quantidade,
          nome: produto.nome
        });
      }

      // Calcular o total final aplicando o desconto
      const total = subtotal - desconto;
      if (total < 0) {
        throw new Error("O valor do desconto não pode ser maior que o subtotal da venda.");
      }

      // 2. Inserir o cabeçalho da venda
      const [vendaResult] = await connection.query(
        'INSERT INTO vendas (subtotal, desconto, total, status) VALUES (?, ?, ?, "CONCLUIDA")',
        [subtotal, desconto, total]
      );
      const vendaId = vendaResult.insertId;

      // 3. Baixar estoque e registrar itens + movimentações históricas
      for (const item of itensProcessados) {
        // Inserir item da venda
        await connection.query(
          'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
          [vendaId, item.produto_id, item.quantidade, item.preco_unitario]
        );

        // Atualizar saldo do produto na tabela produtos
        await connection.query(
          'UPDATE produtos SET quantidade_atual = ? WHERE id = ?',
          [item.novo_estoque, item.produto_id]
        );

        // Registrar no histórico de movimentações o motivo
        const motivoMovimentacao = `Venda #${vendaId}`;
        await connection.query(
          'INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, "SAIDA", ?, ?)',
          [item.produto_id, item.quantidade, motivoMovimentacao]
        );
      }

      await connection.commit();
      return { sucesso: true, vendaId, total };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // CANCELAR UMA VENDA E DEVOLVER PRODUTOS AO ESTOQUE
  async cancelarVenda(vendaId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Verificar se a venda existe e se já não está cancelada
      const [vendas] = await connection.query(
        'SELECT status FROM vendas WHERE id = ? FOR UPDATE',
        [vendaId]
      );

      if (vendas.length === 0) {
        throw new Error('Venda não encontrada.');
      }

      if (vendas[0].status === 'CANCELADA') {
        throw new Error('Esta venda já foi cancelada anteriormente.');
      }

      // 2. Buscar todos os itens que foram comprados nessa venda
      const [itens] = await connection.query(
        'SELECT produto_id, quantidade FROM itens_venda WHERE venda_id = ?',
        [vendaId]
      );

      // 3. Estornar as quantidades de volta ao estoque
      for (const item of itens) {
        // Atualizar a quantidade atual somando o que foi devolvido
        await connection.query(
          'UPDATE produtos SET quantidade_atual = quantidade_atual + ? WHERE id = ?',
          [item.quantidade, item.produto_id]
        );

        // Registrar a movimentação de ENTRADA por motivo de cancelamento
        const motivoMovimentacao = `Estorno da Venda #${vendaId}`;
        await connection.query(
          'INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo) VALUES (?, "ENTRADA", ?, ?)',
          [item.produto_id, item.quantidade, motivoMovimentacao]
        );
      }

      // 4. Mudar o status da venda para CANCELADA
      await connection.query(
        'UPDATE vendas SET status = "CANCELADA" WHERE id = ?',
        [vendaId]
      );

      await connection.commit();
      return { sucesso: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new VendaService();
