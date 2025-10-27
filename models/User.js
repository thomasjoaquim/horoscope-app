// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir como será um usuário no banco de dados
const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Não pode ter email repetido
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true,
    minlength: 6
  },
  dataNascimento: {
    dia: Number,
    mes: Number,
    ano: Number
  },
  localNascimento: {
    latitude: Number,
    longitude: Number,
    timezone: Number,
    cidade: String
  },
  horaNascimento: {
    hora: Number,
    minutos: Number
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

// Antes de salvar, criptografar a senha
userSchema.pre('save', async function(next) {
  // Só criptografa se a senha foi modificada
  if (!this.isModified('senha')) {
    return next();
  }
  
  try {
    // Gerar "salt" (sal) para deixar a criptografia mais forte
    const salt = await bcrypt.genSalt(10);
    // Criptografar a senha
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha digitada com a do banco
userSchema.methods.compararSenha = async function(senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

// Criar o modelo
const User = mongoose.model('User', userSchema);

module.exports = User;