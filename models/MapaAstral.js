// models/MapaAstral.js
const mongoose = require('mongoose');

// Definir como será um mapa astral salvo no banco
const mapaAstralSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referência ao usuário dono deste mapa
    required: true
  },
  titulo: {
    type: String,
    default: 'Meu Mapa Astral'
  },
  dataNascimento: {
    dia: Number,
    mes: Number,
    ano: Number
  },
  horaNascimento: {
    hora: Number,
    minutos: Number
  },
  local: {
    latitude: Number,
    longitude: Number,
    timezone: Number,
    cidade: String
  },
  resultado: {
    signoSolar: String,
    signoLunar: String,
    ascendente: String,
    mensagem: String,
    planetas: Array // Array com todos os planetas
  },
  criadoEm: {
    type: Date,
    default: Date.now
  },
  favorito: {
    type: Boolean,
    default: false
  }
});

// Criar o modelo
const MapaAstral = mongoose.model('MapaAstral', mapaAstralSchema);

module.exports = MapaAstral;