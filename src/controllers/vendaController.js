import vendaService from '../services/vendaService.js';
import vendaRepository from '../repositories/vendaRepository.js';

class VendaController {
  // Finalizar checkout de venda
  async efetuarVenda(req, res) {
    try {
      const { itens, desconto } = req.body;

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: "Para efetuar uma venda, o carrinho de itens é obrigatório." });
      }

      const resultado = await vendaService.registrarVenda({ itens, desconto });
      return res.status(201).json({
        mensagem: "Venda realizada com sucesso e estoque atualizado!",
        vendaId: resultado.vendaId,
        total_pago: resultado.total
      });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao processar venda.", detalhe: error.message });
    }
  }

  // Cancelamento de venda por ID
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      await vendaService.cancelarVenda(id);
      return res.json({ mensagem: `Venda #${id} cancelada e produtos estornados com sucesso!` });
    } catch (error) {
      return res.status(400).json({ erro: "Não foi possível cancelar a venda.", detalhe: error.message });
    }
  }

  // Listar histórico de todas as vendas executadas
  async listarHistorico(req, res) {
    try {
      const vendas = await vendaRepository.findAll();
      return res.json(vendas);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar histórico de vendas.", detalhe: error.message });
    }
  }

  // Detalhar itens de uma venda específica
  async detalharVenda(req, res) {
    try {
      const { id } = req.params;
      const venda = await vendaRepository.findById(id);
      
      if (!venda) {
        return res.status(404).json({ erro: "Venda não encontrada." });
      }

      const itens = await vendaRepository.findItensByVendaId(id);
      return res.json({ ...venda, itens });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao detalhar venda.", detalhe: error.message });
    }
  }
}

export default new VendaController();
