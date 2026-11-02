import relatorioRepository from '../repositories/relatorioRepository.js';

class RelatorioController {
  async obterDashboardGeral(req, res) {
    try {
      // Executa todas as consultas analíticas de forma paralela e otimizada
      const [
        faturamento,
        maisVendidos,
        estoqueBaixo,
        valorEstoque,
        lucroBruto
      ] = await Promise.all([
        relatorioRepository.getFaturamento(),
        relatorioRepository.getProdutosMaisVendidos(5),
        relatorioRepository.getEstoqueBaixo(),
        relatorioRepository.getValorTotalEstoqueCusto(),
        relatorioRepository.getEstimativaLucroBruto()
      ]);

      return res.json({
        dashboard: {
          financeiro: {
            faturamento_diario: faturamento.faturamento_diario,
            faturamento_semanal: faturamento.faturamento_semanal,
            faturamento_mensal: faturamento.faturamento_mensal,
            lucro_bruto_vendas: lucroBruto.lucro_bruto_estimado || 0,
            receita_bruta_acumulada: lucroBruto.receita_vendas || 0
          },
          patrimonio: {
            total_itens_em_estoque: valorEstoque.total_itens_estoque || 0,
            valor_investido_estoque_custo: valorEstoque.valor_total_custo || 0
          },
          alertas: {
            total_produtos_estoque_baixo: estoqueBaixo.length,
            produtos_criticos: estoqueBaixo
          },
          rankings: {
            produtos_mais_vendidos: maisVendidos
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao compilar relatórios analíticos.", detalhe: error.message });
    }
  }
}

export default new RelatorioController();
