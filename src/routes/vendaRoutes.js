import { Router } from 'express';
import vendaController from '../controllers/vendaController.js';

const router = Router();

router.post('/', vendaController.efetuarVenda);         // POST http://localhost:3000/api/vendas
router.get('/', vendaController.listarHistorico);       // GET  http://localhost:3000/api/vendas
router.get('/:id', vendaController.detalharVenda);     // GET  http://localhost:3000/api/vendas/1
router.put('/:id/cancelar', vendaController.cancelar);  // PUT  http://localhost:3000/api/vendas/1/cancelar

export default router;
