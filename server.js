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
const { calcularMapaAstralSeguro } = require('./correcao-api');

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

function gerarMensagemHoroscopo(sol, lua, ascendente, idioma = 'pt') {
  const mensagensPersonalizadasPt = {
    'Aries': [
      'Sua energia ariana te impulsiona a novos começos. O momento é de ação e coragem!',
      'Marte desperta sua força interior. Use essa energia para conquistar seus objetivos.',
      'Sua natureza pioneira abre caminhos únicos. Lidere com determinação e paixão.',
      'O fogo ariano queima intenso em você. Canalize essa energia para grandes realizações.'
    ],
    'Taurus': [
      'Sua estabilidade taurina é seu maior tesouro. Construa com paciência e persistência.',
      'Vênus abençoa seus caminhos com beleza e harmonia. Aprecie os prazeres da vida.',
      'Sua determinação move montanhas. Mantenha-se firme em seus propósitos.',
      'A terra nutre seus sonhos. Cultive com amor aquilo que deseja colher.'
    ],
    'Gemini': [
      'Sua curiosidade geminiana abre mil portas. Explore novos conhecimentos com entusiasmo.',
      'Mercúrio acelera seus pensamentos. Use sua versatilidade para se adaptar às mudanças.',
      'Sua comunicação é um dom especial. Conecte-se com o mundo através das palavras.',
      'Duas faces, infinitas possibilidades. Abrace sua natureza multifacetada.'
    ],
    'Cancer': [
      'Sua sensibilidade canceriana é um dom raro. Cuide de si e dos que ama.',
      'A Lua guia suas emoções profundas. Confie em sua intuição maternal.',
      'Seu coração é um lar para muitos. Ofereça acolhimento sem se esquecer de você.',
      'As marés emocionais te fortalecem. Flua com os ciclos naturais da vida.'
    ],
    'Leo': [
      'Seu brilho leonino ilumina qualquer ambiente. Lidere com generosidade e carisma.',
      'O Sol desperta sua realeza interior. Brilhe sem ofuscar os outros.',
      'Sua criatividade é uma chama eterna. Inspire e seja inspirado.',
      'O palco da vida te espera. Apresente-se com autenticidade e orgulho.'
    ],
    'Virgo': [
      'Sua precisão virginiana faz toda a diferença. Organize sua vida com sabedoria.',
      'Mercúrio aprimora seus detalhes. Busque a perfeição sem se cobrar demais.',
      'Seu serviço ao mundo é sagrado. Ajude outros enquanto cuida de si mesmo.',
      'A terra te ensina paciência. Cultive seus projetos com dedicação constante.'
    ],
    'Libra': [
      'Seu equilíbrio libriano harmoniza todos os ambientes. Busque a paz interior.',
      'Vênus embeleza seus relacionamentos. Cultive conexões autênticas e duradouras.',
      'Sua diplomacia resolve conflitos. Use sua justiça natural para mediar situações.',
      'A balança da vida pede equilíbrio. Encontre harmonia entre dar e receber.'
    ],
    'Scorpio': [
      'Sua intensidade escorpiana transforma vidas. Confie no poder da sua intuição.',
      'Plutão revela seus mistérios mais profundos. Renasça das suas próprias cinzas.',
      'Sua paixão move o impossível. Mergulhe fundo em tudo que faz.',
      'O escorpião renasce sempre. Transforme desafios em oportunidades de crescimento.'
    ],
    'Sagittarius': [
      'Sua aventura sagitariana expande horizontes infinitos. Explore com sabedoria.',
      'Júpiter amplia sua visão de mundo. Busque conhecimento em cada jornada.',
      'Sua flecha mira sempre alto. Persiga seus ideais com otimismo contagiante.',
      'O mundo é sua universidade. Aprenda com cada cultura e experiência.'
    ],
    'Capricorn': [
      'Sua determinação capricorniana constrói impérios duradouros. Persista sempre!',
      'Saturno te ensina disciplina e paciência. Cada passo te leva ao topo.',
      'Sua ambição é nobre e justa. Construa seu legado com integridade.',
      'A montanha te chama para o cume. Escale com determinação e humildade.'
    ],
    'Aquarius': [
      'Sua originalidade aquariana revoluciona o mundo. Seja autêntico e inovador.',
      'Urano desperta sua genialidade única. Pense fora da caixa sempre.',
      'Sua visão futurista inspira gerações. Lidere mudanças positivas.',
      'O futuro se constrói hoje. Use sua criatividade para melhorar o mundo.'
    ],
    'Pisces': [
      'Sua empatia pisciana conecta almas profundamente. Sonhe e crie sem limites.',
      'Netuno desperta sua intuição mística. Confie nos sinais do universo.',
      'Sua compaixão cura feridas invisíveis. Seja um farol de esperança.',
      'O oceano das emoções te fortalece. Nade nas águas da criatividade infinita.'
    ]
  };

  const mensagensPersonalizadasEn = {
    'Aries': [
      'Your Arian energy propels you to new beginnings. The time is for action and courage!',
      'Mars awakens your inner strength. Use this energy to achieve your goals.',
      'Your pioneering nature opens unique paths. Lead with determination and passion.',
      'The Arian fire burns intensely within you. Channel this energy for great achievements.'
    ],
    'Taurus': [
      'Your Taurus stability is your greatest treasure. Build with patience and persistence.',
      'Venus blesses your paths with beauty and harmony. Appreciate life\'s pleasures.',
      'Your determination moves mountains. Stay firm in your purposes.',
      'The earth nourishes your dreams. Cultivate with love what you wish to harvest.'
    ],
    'Gemini': [
      'Your Gemini curiosity opens a thousand doors. Explore new knowledge with enthusiasm.',
      'Mercury accelerates your thoughts. Use your versatility to adapt to changes.',
      'Your communication is a special gift. Connect with the world through words.',
      'Two faces, infinite possibilities. Embrace your multifaceted nature.'
    ],
    'Cancer': [
      'Your Cancer sensitivity is a rare gift. Take care of yourself and those you love.',
      'The Moon guides your deep emotions. Trust your maternal intuition.',
      'Your heart is a home for many. Offer shelter without forgetting yourself.',
      'Emotional tides strengthen you. Flow with life\'s natural cycles.'
    ],
    'Leo': [
      'Your Leo brilliance illuminates any environment. Lead with generosity and charisma.',
      'The Sun awakens your inner royalty. Shine without overshadowing others.',
      'Your creativity is an eternal flame. Inspire and be inspired.',
      'Life\'s stage awaits you. Present yourself with authenticity and pride.'
    ],
    'Virgo': [
      'Your Virgo precision makes all the difference. Organize your life with wisdom.',
      'Mercury refines your details. Seek perfection without being too hard on yourself.',
      'Your service to the world is sacred. Help others while taking care of yourself.',
      'The earth teaches you patience. Cultivate your projects with constant dedication.'
    ],
    'Libra': [
      'Your Libra balance harmonizes all environments. Seek inner peace.',
      'Venus beautifies your relationships. Cultivate authentic and lasting connections.',
      'Your diplomacy resolves conflicts. Use your natural justice to mediate situations.',
      'Life\'s scale asks for balance. Find harmony between giving and receiving.'
    ],
    'Scorpio': [
      'Your Scorpio intensity transforms lives. Trust the power of your intuition.',
      'Pluto reveals your deepest mysteries. Rise from your own ashes.',
      'Your passion moves the impossible. Dive deep into everything you do.',
      'The scorpion always rebirths. Transform challenges into growth opportunities.'
    ],
    'Sagittarius': [
      'Your Sagittarius adventure expands infinite horizons. Explore with wisdom.',
      'Jupiter amplifies your worldview. Seek knowledge in every journey.',
      'Your arrow always aims high. Pursue your ideals with contagious optimism.',
      'The world is your university. Learn from every culture and experience.'
    ],
    'Capricorn': [
      'Your Capricorn determination builds lasting empires. Always persist!',
      'Saturn teaches you discipline and patience. Each step takes you to the top.',
      'Your ambition is noble and just. Build your legacy with integrity.',
      'The mountain calls you to the summit. Climb with determination and humility.'
    ],
    'Aquarius': [
      'Your Aquarius originality revolutionizes the world. Be authentic and innovative.',
      'Uranus awakens your unique genius. Always think outside the box.',
      'Your futuristic vision inspires generations. Lead positive changes.',
      'The future is built today. Use your creativity to improve the world.'
    ],
    'Pisces': [
      'Your Pisces empathy connects souls deeply. Dream and create without limits.',
      'Neptune awakens your mystical intuition. Trust the universe\'s signs.',
      'Your compassion heals invisible wounds. Be a beacon of hope.',
      'The ocean of emotions strengthens you. Swim in the waters of infinite creativity.'
    ]
  };

  const signoSol = sol.zodiac_sign.name.en;
  const signoLua = lua.zodiac_sign.name.en;
  const signoAsc = ascendente.zodiac_sign.name.en;
  
  // Selecionar mensagem aleatória baseada no signo solar e idioma
  const mensagensPersonalizadas = idioma === 'en' ? mensagensPersonalizadasEn : mensagensPersonalizadasPt;
  const mensagensDoSigno = mensagensPersonalizadas[signoSol] || 
    (idioma === 'en' ? ['The stars shine especially for you today!'] : ['As estrelas brilham especialmente para você hoje!']);
  const mensagemAleatoria = mensagensDoSigno[Math.floor(Math.random() * mensagensDoSigno.length)];
  
  // Adicionar insights baseados na combinação Sol/Lua/Ascendente
  const insightsPt = [
    `Sua combinação ${traduzirSigno(signoSol)}-${traduzirSigno(signoLua)}-${traduzirSigno(signoAsc)} revela uma personalidade única e fascinante.`,
    `Com Sol em ${traduzirSigno(signoSol)}, você brilha naturalmente, enquanto sua Lua em ${traduzirSigno(signoLua)} nutre sua alma.`,
    `Seu Ascendente em ${traduzirSigno(signoAsc)} é como você se apresenta ao mundo, complementando perfeitamente seu Sol em ${traduzirSigno(signoSol)}.`,
    `A dança entre seu Sol em ${traduzirSigno(signoSol)} e Lua em ${traduzirSigno(signoLua)} cria uma sinfonia única em sua personalidade.`
  ];
  
  const insightsEn = [
    `Your ${signoSol}-${signoLua}-${signoAsc} combination reveals a unique and fascinating personality.`,
    `With Sun in ${signoSol}, you shine naturally, while your Moon in ${signoLua} nourishes your soul.`,
    `Your Ascendant in ${signoAsc} is how you present yourself to the world, perfectly complementing your Sun in ${signoSol}.`,
    `The dance between your Sun in ${signoSol} and Moon in ${signoLua} creates a unique symphony in your personality.`
  ];
  
  const insights = idioma === 'en' ? insightsEn : insightsPt;
  const insightAleatorio = insights[Math.floor(Math.random() * insights.length)];
  
  return `🌟 ${mensagemAleatoria}\n\n✨ ${insightAleatorio}`;
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

    // Usar sistema de fallback para API
    const apiResult = await calcularMapaAstralSeguro(payload, process.env.API_KEY);
    
    if (!apiResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao conectar com serviços astrológicos. Tente novamente em alguns minutos.' 
      });
    }

    const planetas = apiResult.data.output;
    const isSimulado = apiResult.source === 'simulado';
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
      planetas: planetasSimples,
      isSimulado: isSimulado,
      warning: apiResult.warning || null
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