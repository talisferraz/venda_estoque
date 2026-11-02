import express from 'express';
import dotenv from 'dotenv';
import './config/database.js'; // Testa a conexão com o banco ao iniciar

import produtoRoutes from './routes/produtoRoutes.js';
import estoqueRoutes from './routes/estoqueRoutes.js';
import vendaRoutes from './routes/vendaRoutes.js';
import relatorioRoutes from './routes/relatorioRoutes.js';
import authRoutes from './routes/authRoutes.js';


import { autenticarToken, permitirApenas } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para ler JSON no corpo (body) das requisições
app.use(express.json());

// Rota pública de autenticação (não precisa de token para logar ou registrar o primeiro admin)
app.use('/api/auth', authRoutes);

// Rotas protegidas (Exigem apenas estar logado)
app.use('/api/produtos', autenticarToken, produtoRoutes);
app.use('/api/estoque', autenticarToken, estoqueRoutes);
app.use('/api/vendas', autenticarToken, vendaRoutes);

app.use('/api/relatorios', autenticarToken, permitirApenas('ADMIN'), relatorioRoutes);
// Rota padrão de teste
app.get('/', (req, res) => {
  res.json({ mensagem: "API de Estoque e Vendas Rodando! 🚀" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});
