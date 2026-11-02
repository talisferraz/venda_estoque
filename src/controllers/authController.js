import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import usuarioRepository from '../repositories/usuarioRepository.js';

class AuthController {
  // Registrar novo usuário
  async registrar(req, res) {
    try {
      const { nome, email, senha, role } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Nome, email e senha são obrigatórios." });
      }

      const usuarioExiste = await usuarioRepository.findByEmail(email);
      if (usuarioExiste) {
        return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
      }

      // Criptografar a senha antes de salvar
      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      const usuarioId = await usuarioRepository.create(nome, email, senhaCriptografada, role);
      return res.status(201).json({ mensagem: "Usuário registrado com sucesso!", usuarioId });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao registrar usuário.", detalhe: error.message });
    }
  }

  // Fazer login e gerar token JWT
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
      }

      const usuario = await usuarioRepository.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ erro: "E-mail ou senha inválidos." });
      }

      // Comparar a senha digitada com a criptografada do banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: "E-mail ou senha inválidos." });
      }

      // Gerar o Token JWT com ID e Permissão (role) válido por 1 dia
      const token = jwt.sign(
        { id: usuario.id, role: usuario.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        mensagem: "Login realizado com sucesso!",
        usuario: { nome: usuario.nome, email: usuario.email, role: usuario.role },
        token
      });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao realizar login.", detalhe: error.message });
    }
  }
}

export default new AuthController();
