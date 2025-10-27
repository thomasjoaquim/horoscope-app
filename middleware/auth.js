// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar se o usuário está logado
const auth = async (req, res, next) => {
  try {
    // Pegar o token do cookie ou header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acesso negado. Por favor, faça login.' 
      });
    }

    // Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário no banco
    const user = await User.findById(decoded.id).select('-senha'); // Não retorna a senha
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado.' 
      });
    }

    // Adicionar o usuário à requisição
    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido. Por favor, faça login novamente.' 
    });
  }
};

module.exports = auth;