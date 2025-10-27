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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true
  }
}));
app.use(express.static('public'));

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Rota de Registro
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ error: 'As senhas não coincidem!' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres!' });
    }

    // Verificar se o email já existe
    const emailExiste = await User.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ error: 'Este email já está cadastrado!' });
    }

    // Criar novo usuário
    const user = new User({ nome, email, senha });
    await user.save();

    // Criar token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d' // Token válido por 7 dias
    });

    // Enviar token no cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.json({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos!' });
    }

    // Verificar senha
    const senhaCorreta = await user.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Email ou senha incorretos!' });
    }

    // Criar token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Enviar token no cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
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
      user: {
        id: req.user._id,
        nome: req.user.nome,
        email: req.user.email,
        dataNascimento: req.user.dataNascimento,
        localNascimento: req.user.localNascimento,
        horaNascimento: req.user.horaNascimento
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
});

// ==================== ROTAS DE MAPA ASTRAL ====================

// Buscar horóscopo E salvar no banco
app.post('/api/horoscopo', auth, async (req, res) => {
  try {
    const { year, month, date, hours, minutes, latitude, longitude, timezone, cidade, salvar } = req.body;

    // Validar dados
    if (!year || !month || !date || !hours || !minutes || !latitude || !longitude || !timezone) {
      return res.status(400).json({ error: 'Por favor, preencha todos os campos!' });
    }

    // Preparar payload para a API
    const payload = {
      year: parseInt(year),
      month: parseInt(month),
      date: parseInt(date),
      hours: parseInt(hours),
      minutes: parseInt(minutes),
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

    // Chamar a API de astrologia
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
    const mensagem = gerarMensagemHoroscopo(sol, lua, ascendente);

    const resultado = {
      signoSolar: sol.zodiac_sign.name.en,
      signoLunar: lua.zodiac_sign.name.en,
      ascendente: ascendente.zodiac_sign.name.en,
      mensagem: mensagem,
      planetas: planetas
    };

    // Salvar no banco se o usuário quiser
    if (salvar) {
      const mapaAstral = new MapaAstral({
        userId: req.user._id,
        dataNascimento: { dia: parseInt(date), mes: parseInt(month), ano: parseInt(year) },
        horaNascimento: { hora: parseInt(hours), minutos: parseInt(minutes) },
        local: { 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude), 
          timezone: parseFloat(timezone),
          cidade: cidade || 'Não informada'
        },
        resultado: resultado
      });
      await mapaAstral.save();
    }

    res.json({ success: true, ...resultado });

  } catch (error) {
    console.error('Erro ao buscar dados:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados astrológicos.' });
  }
});

// Listar mapas salvos do usuário
app.get('/api/mapas', auth, async (req, res) => {
  try {
    const mapas = await MapaAstral.find({ userId: req.user._id })
      .sort({ criadoEm: -1 }); // Mais recentes primeiro

    res.json({ success: true, mapas });
  } catch (error) {
    console.error('Erro ao buscar mapas:', error);
    res.status(500).json({ error: 'Erro ao buscar mapas salvos.' });
  }
});

// Buscar um mapa específico
app.get('/api/mapas/:id', auth, async (req, res) => {
  try {
    const mapa = await MapaAstral.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!mapa) {
      return res.status(404).json({ error: 'Mapa não encontrado.' });
    }

    res.json({ success: true, mapa });
  } catch (error) {
    console.error('Erro ao buscar mapa:', error);
    res.status(500).json({ error: 'Erro ao buscar mapa.' });
  }
});

// Deletar um mapa
app.delete('/api/mapas/:id', auth, async (req, res) => {
  try {
    const mapa = await MapaAstral.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!mapa) {
      return res.status(404).json({ error: 'Mapa não encontrado.' });
    }

    res.json({ success: true, message: 'Mapa deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar mapa:', error);
    res.status(500).json({ error: 'Erro ao deletar mapa.' });
  }
});

// Atualizar perfil do usuário
app.put('/api/perfil', auth, async (req, res) => {
  try {
    const { nome, dataNascimento, horaNascimento, localNascimento } = req.body;

    const user = await User.findById(req.user._id);
    
    if (nome) user.nome = nome;
    if (dataNascimento) user.dataNascimento = dataNascimento;
    if (horaNascimento) user.horaNascimento = horaNascimento;
    if (localNascimento) user.localNascimento = localNascimento;

    await user.save();

    res.json({ 
      success: true, 
      message: 'Perfil atualizado com sucesso!',
      user: {
        nome: user.nome,
        email: user.email,
        dataNascimento: user.dataNascimento,
        horaNascimento: user.horaNascimento,
        localNascimento: user.localNascimento
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// ==================== FUNÇÃO AUXILIAR ====================

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

  return `🌟 ${mensagemBase}\n\nSeu Sol em ${signo}, Lua em ${lua.zodiac_sign.name.en} e Ascendente em ${ascendente.zodiac_sign.name.en} criam uma combinação única e especial!`;
}

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📖 Abra seu navegador e acesse o link acima!`);
});