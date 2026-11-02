import { Router } from 'express';
import produtoController from '../controllers/produtoController.js';

const router = Router();

router.post('/', produtoController.criar);       // POST http://localhost:3000/api/produtos
router.get('/', produtoController.listar);        // GET  http://localhost:3000/api/produtos
router.get('/:id', produtoController.buscarPorId); // GET  http://localhost:3000/api/produtos/1
router.put('/:id', produtoController.atualizar); // PUT  http://localhost:3000/api/produtos/1
router.delete('/:id', produtoController.deletar); // DELETE http://localhost:3000/api/produtos/1

export default router;
