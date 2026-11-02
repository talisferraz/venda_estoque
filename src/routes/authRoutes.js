import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

router.post('/registrar', authController.registrar); // POST /api/auth/registrar
router.post('/login', authController.login);         // POST /api/auth/login

export default router;
