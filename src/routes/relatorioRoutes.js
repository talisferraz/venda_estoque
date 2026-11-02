import { Router } from 'express';
import relatorioController from '../controllers/relatorioController.js';

const router = Router();

// Rota unificada para carregar os indicadores do painel
router.get('/dashboard', relatorioController.obterDashboardGeral); // GET http://localhost:3000/api/relatorios/dashboard

export default router;
