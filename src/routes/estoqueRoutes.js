import { Router } from 'express';
import estoqueController from '../controllers/estoqueController.js';

const router = Router();

router.post('/movimentar', estoqueController.movimentar);              // POST /api/estoque/movimentar
router.get('/historico', estoqueController.historicoGeral);            // GET  /api/estoque/historico
router.get('/historico/produto/:produtoId', estoqueController.historicoPorProduto); // GET /api/estoque/historico/produto/1

export default router;
