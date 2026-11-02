import produtoRepository from '../repositories/produtoRepository.js';

class ProdutoController {
  // Criar Produto
  async criar(req, res) {
    try {
      const { sku, nome, preco_custo, preco_venda, quantidade_atual } = req.body;

      // Validação simples de campos obrigatórios
      if (!sku || !nome || preco_custo === undefined || preco_venda === undefined) {
        return res.status(400).json({ erro: "Campos obrigatórios: sku, nome, preco_custo e preco_venda." });
      }

      // Validação da quantidade inicial (deve ser um número positivo)
      if (quantidade_atual !== undefined && (isNaN(quantidade_atual) || quantidade_atual < 0)) {
        return res.status(400).json({ erro: "A quantidade atual não pode ser um número negativo." });
      }

      // Validar se SKU já existe
      const skuExistente = await produtoRepository.findBySku(sku);
      if (skuExistente) {
        return res.status(400).json({ erro: "Este código SKU já está cadastrado em outro produto." });
      }

      // Envia os dados completos para o repository, incluindo a quantidade informada
      const produtoId = await produtoRepository.create(req.body);
      
      return res.status(201).json({ 
        mensagem: "Produto cadastrado com sucesso!", 
        produtoId 
      });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao cadastrar produto.", detalhe: error.message });
    }
  }

  // Listar Todos os Produtos
  async listar(req, res) {
    try {
      const produtos = await produtoRepository.findAll();
      return res.json(produtos);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar produtos.", detalhe: error.message });
    }
  }

  // Buscar por ID
  async buscarPorId(req, res) {
    try {
      const produto = await produtoRepository.findById(req.params.id);
      if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado." });
      }
      return res.json(produto);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar produto.", detalhe: error.message });
    }
  }

  // Atualizar Produto
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { sku } = req.body;

      // Validar se o produto existe antes de alterar
      const produtoAtual = await produtoRepository.findById(id);
      if (!produtoAtual) {
        return res.status(404).json({ erro: "Produto não encontrado." });
      }

      // Se alterou o SKU, verifica se o novo SKU já pertence a outro produto
      if (sku && sku !== produtoAtual.sku) {
        const skuExistente = await produtoRepository.findBySku(sku);
        if (skuExistente) {
          return res.status(400).json({ erro: "O novo SKU informado já está em uso por outro produto." });
        }
      }

      const atualizado = await produtoRepository.update(id, req.body);
      if (atualizado) {
        return res.json({ mensagem: "Produto atualizado com sucesso!" });
      }
      return res.status(400).json({ erro: "Nenhuma alteração foi realizada." });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao atualizar produto.", detalhe: error.message });
    }
  }

  // Deletar Produto
  async deletar(req, res) {
    try {
      const deletado = await produtoRepository.delete(req.params.id);
      if (!deletado) {
        return res.status(404).json({ erro: "Produto não encontrado para exclusão." });
      }
      return res.json({ mensagem: "Produto excluído com sucesso!" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao excluir produto.", detalhe: error.message });
    }
  }
}

export default new ProdutoController();
