import jwt from 'jsonwebtoken';

// Garante que o usuário está logado
export const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // O formato esperado do header é: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado; // Injeta os dados do token (id, role) na requisição
    next(); // Passa para o próximo controller/função
  } catch (error) {
    return res.status(403).json({ erro: "Token inválido ou expirado." });
  }
};

// Garante que apenas papéis específicos acessem a rota (ex: ADMIN)
export const permitirApenas = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({ erro: "Acesso negado. Nível de permissão insuficiente." });
    }
    next();
  };
};
