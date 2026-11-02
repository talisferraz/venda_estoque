import estoqueService from '../services/estoqueService.js';
import estoqueRepository from '../repositories/estoqueRepository.js';

class EstoqueController {
  // Realizar uma movimentação manual (Entrada/Saída)
  async movimentar(req, res) {
    try {
      const { produto_id, tipo, quantidade, motivo } = req.body;

      if (!produto_id || !tipo || !quantidade || !motivo) {
        return res.status(400).json({ erro: "Campos obrigatórios: produto_id, tipo, quantidade e motivo." });
      }

      if (quantidade <= 0) {
        return res.status(400).json({ erro: "A quantidade deve ser maior que zero." });
      }

      const resultado = await estoqueService.movimentarEstoque(produto_id, tipo.toUpperCase(), quantidade, motivo);
      return res.json({ mensagem: "Movimentação registrada com sucesso!", novoSaldo: resultado.novoSaldo });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao processar movimentação.", detalhe: error.message });
    }
  }

  // Consultar histórico por produto
  async historicoPorProduto(req, res) {
    try {
      const historico = await estoqueRepository.findHistoricoPorProduto(req.params.produtoId);
      return res.json(historico);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar histórico.", detalhe: error.message });
    }
  }

  // Consultar extrato completo de movimentações
  async historicoGeral(req, res) {
    try {
      const historico = await estoqueRepository.findTodoHistorico();
      return res.json(historico);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar extrato geral.", detalhe: error.message });
    }
  }
}

export default new EstoqueController();
