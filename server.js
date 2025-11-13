// Importar as ferramentas
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Importar modelos e middleware
const User = require('./models/User');
const MapaAstral = require('./models/MapaAstral');
const auth = require('./middleware/auth');

// Criar o servidor
const app = express();
const PORT = 3000;

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado ao MongoDB!'))
  .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

// Configurações do servidor
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true
  }
}));
app.use(express.static('public'));

// ==================== FUNÇÕES AUXILIARES ====================

function traduzirSigno(nome) {
  const traducoes = {
    'Aries': 'Áries',
    'Taurus': 'Touro',
    'Gemini': 'Gêmeos',
    'Cancer': 'Câncer',
    'Leo': 'Leão',
    'Virgo': 'Virgem',
    'Libra': 'Libra',
    'Scorpio': 'Escorpião',
    'Sagittarius': 'Sagitário',
    'Capricorn': 'Capricórnio',
    'Aquarius': 'Aquário',
    'Pisces': 'Peixes'
  };
  return traducoes[nome] || nome;
}

function traduzirPlaneta(nome) {
  const traducoes = {
    'Sun': 'Sol',
    'Moon': 'Lua',
    'Mercury': 'Mercúrio',
    'Venus': 'Vênus',
    'Mars': 'Marte',
    'Jupiter': 'Júpiter',
    'Saturn': 'Saturno',
    'Uranus': 'Urano',
    'Neptune': 'Netuno',
    'Pluto': 'Plutão'
  };
  return traducoes[nome] || nome;
}

function gerarMensagemHoroscopo(sol, lua, ascendente) {
  const mensagensPorSigno = {
    'Aries': 'Sua energia ariana te impulsiona a novos começos. Mantenha o foco!',
    'Taurus': 'Sua estabilidade taurina é seu maior tesouro. Aprecie os prazeres simples.',
    'Gemini': 'Sua curiosidade geminiana abre portas. Comunique-se com clareza.',
    'Cancer': 'Sua sensibilidade canceriana é um dom. Cuide de si e dos seus.',
    'Leo': 'Seu brilho leonino ilumina o caminho. Lidere com o coração.',
    'Virgo': 'Sua precisão virginiana faz a diferença. Organize suas prioridades.',
    'Libra': 'Seu equilíbrio libriano harmoniza ambientes. Busque a paz interior.',
    'Scorpio': 'Sua intensidade escorpiana transforma vidas. Confie em sua intuição.',
    'Sagittarius': 'Sua aventura sagitariana expande horizontes. Explore novas ideias.',
    'Capricorn': 'Sua determinação capricorniana constrói impérios. Persista!',
    'Aquarius': 'Sua originalidade aquariana inova. Seja autêntico.',
    'Pisces': 'Sua empatia pisciana conecta almas. Sonhe e crie.'
  };

  const signo = sol.zodiac_sign.name.en;
  const mensagemBase = mensagensPorSigno[signo] || 'As estrelas brilham para você!';

  return `🌟 ${mensagemBase}\n\nSeu Sol em ${traduzirSigno(signo)}, Lua em ${traduzirSigno(lua.zodiac_sign.name.en)} e Ascendente em ${traduzirSigno(ascendente.zodiac_sign.name.en)} criam uma combinação única e especial!`;
}

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Rota de Registro
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ success: false, error: 'Preencha todos os campos!' });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ success: false, error: 'As senhas não coincidem!' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ success: false, error: 'A senha deve ter no mínimo 6 caracteres!' });
    }

    const emailExiste = await User.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ success: false, error: 'Este email já está cadastrado!' });
    }

    const user = new User({ nome, email, senha });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Usuário criado com sucesso!',
      token: token,
      usuario: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar usuário.' });
  }
});

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ success: false, error: 'Preencha todos os campos!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos!' });
    }

    const senhaCorreta = await user.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log('✅ Login realizado para:', email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token: token,
      usuario: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro ao fazer login.' });
  }
});

// Rota de Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout realizado com sucesso!' });
});

// Rota para pegar dados do usuário logado
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      usuario: {
        id: req.user._id,
        nome: req.user.nome,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar dados do usuário.' });
  }
});

// Rota para atualizar usuário
app.put('/api/auth/atualizar', auth, async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({ success: false, error: 'Nome não pode estar vazio!' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nome: nome },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      usuario: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar usuário.' });
  }
});

// ==================== ROTAS DE MAPA ASTRAL ====================

// Calcular mapa astral
app.post('/api/astrologia/calcular', auth, async (req, res) => {
  try {
    const { dia, mes, ano, hora, minutos, latitude, longitude, timezone, cidade, salvar } = req.body;

    if (!dia || !mes || !ano || hora === undefined || minutos === undefined || !latitude || !longitude || timezone === undefined) {
      return res.status(400).json({ success: false, error: 'Por favor, preencha todos os campos!' });
    }

    const payload = {
      year: parseInt(ano),
      month: parseInt(mes),
      date: parseInt(dia),
      hours: parseInt(hora),
      minutes: parseInt(minutos),
      seconds: 0,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: parseFloat(timezone),
      config: {
        observation_point: "topocentric",
        ayanamsha: "tropical",
        language: "en"
      }
    };

    console.log('📡 Chamando API com payload:', payload);

    const response = await axios.post(
      'https://json.freeastrologyapi.com/western/planets',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY
        }
      }
    );

    const planetas = response.data.output;
    const sol = planetas.find(p => p.planet.en === 'Sun');
    const lua = planetas.find(p => p.planet.en === 'Moon');
    const ascendente = planetas.find(p => p.planet.en === 'Ascendant');
    
    if (!sol || !lua || !ascendente) {
      return res.status(400).json({ success: false, error: 'Dados astrológicos incompletos.' });
    }

    const mensagem = gerarMensagemHoroscopo(sol, lua, ascendente);

    const planetasSimples = planetas.map(p => ({
      nome: traduzirPlaneta(p.planet.en),
      signo: traduzirSigno(p.zodiac_sign.name.en),
      grau: p.normDegree || 0,
      retrógrado: p.isRetro === 'True' || p.isRetro === 'true'
    }));

    const resultado = {
      success: true,
      signosSolLuaAsc: `☀️ ${traduzirSigno(sol.zodiac_sign.name.en)} | 🌙 ${traduzirSigno(lua.zodiac_sign.name.en)} | ⬆️ ${traduzirSigno(ascendente.zodiac_sign.name.en)}`,
      signoSolar: traduzirSigno(sol.zodiac_sign.name.en),
      signoLunar: traduzirSigno(lua.zodiac_sign.name.en),
      ascendente: traduzirSigno(ascendente.zodiac_sign.name.en),
      mensagem: mensagem,
      planetas: planetasSimples
    };

    if (salvar) {
      const mapaAstral = new MapaAstral({
        userId: req.user._id,
        titulo: `Mapa Astral de ${new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR')}`,
        dataNascimento: { dia: parseInt(dia), mes: parseInt(mes), ano: parseInt(ano) },
        horaNascimento: { hora: parseInt(hora), minutos: parseInt(minutos) },
        local: { 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude), 
          timezone: parseFloat(timezone),
          cidade: cidade || 'Não informada'
        },
        resultado: resultado
      });
      await mapaAstral.save();
      console.log('✅ Mapa salvo no banco:', mapaAstral._id);
    }

    res.json(resultado);

  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error.message);
    res.status(500).json({ success: false, error: 'Erro ao buscar dados astrológicos: ' + error.message });
  }
});

// Histórico de mapas
app.get('/api/astrologia/historico', auth, async (req, res) => {
  try {
    const mapas = await MapaAstral.find({ userId: req.user._id })
      .sort({ criadoEm: -1 });

    const mapasFormatados = mapas.map(m => ({
      id: m._id,
      _id: m._id,
      nome: m.titulo,
      dia: m.dataNascimento.dia,
      mes: m.dataNascimento.mes,
      ano: m.dataNascimento.ano,
      hora: m.horaNascimento.hora,
      minutos: m.horaNascimento.minutos,
      latitude: m.local.latitude,
      longitude: m.local.longitude,
      timezone: m.local.timezone,
      cidade: m.local.cidade,
      criadoEm: m.criadoEm
    }));

    res.json({ success: true, mapas: mapasFormatados });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar histórico.' });
  }
});

// Deletar um mapa
app.delete('/api/astrologia/mapa/:id', auth, async (req, res) => {
  try {
    const mapa = await MapaAstral.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!mapa) {
      return res.status(404).json({ success: false, error: 'Mapa não encontrado.' });
    }

    res.json({ success: true, message: 'Mapa deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar mapa:', error);
    res.status(500).json({ success: false, error: 'Erro ao deletar mapa.' });
  }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📖 Abra seu navegador e acesse o link acima!`);
});

module.exports = app;