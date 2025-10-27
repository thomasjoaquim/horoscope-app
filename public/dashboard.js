// Carregar script de autenticação
const scriptAuth = document.createElement('script');
scriptAuth.src = 'auth.js';
document.head.appendChild(scriptAuth);

// Esperar carregar e verificar autenticação
scriptAuth.onload = async () => {
    const user = await protegerPagina();
    if (user) {
        inicializarDashboard(user);
    }
};

// Inicializar dashboard
function inicializarDashboard(user) {
    // Mostrar informações do usuário
    document.getElementById('nomeUsuario').textContent = `Olá, ${user.nome}!`;
    document.getElementById('emailUsuario').textContent = user.email;
    
    // Botão de logout
    document.getElementById('btnLogout').addEventListener('click', fazerLogout);
    
    // Sistema de tabs
    configurarTabs();
    
    // Carregar histórico
    carregarHistorico();
    
    // Formulário de novo mapa
    configurarFormularioMapa();
    
    // Formulário de perfil
    configurarFormularioPerfil(user);
}

// Configurar sistema de tabs
function configurarTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remover active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Adicionar active no clicado
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
            
            // Se for histórico, recarregar
            if (tabName === 'historico') {
                carregarHistorico();
            }
        });
    });
}

// Configurar formulário de novo mapa
function configurarFormularioMapa() {
    const form = document.getElementById('formAstrologia');
    const loading = document.getElementById('loading');
    const resultado = document.getElementById('resultado');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dados = {
            year: document.getElementById('ano').value,
            month: document.getElementById('mes').value,
            date: document.getElementById('dia').value,
            hours: document.getElementById('hora').value,
            minutes: document.getElementById('minutos').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value,
            timezone: document.getElementById('timezone').value,
            cidade: document.getElementById('cidade').value,
            salvar: document.getElementById('salvar').checked
        };
        
        resultado.style.display = 'none';
        loading.style.display = 'block';
        
        try {
            const response = await fetch('/api/horoscopo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            const data = await response.json();
            loading.style.display = 'none';
            
            if (data.success) {
                mostrarResultado(data);
                if (dados.salvar) {
                    alert('✅ Mapa salvo no seu histórico!');
                }
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            loading.style.display = 'none';
            alert('Erro ao buscar dados.');
            console.error(error);
        }
    });
}

// Mostrar resultado do mapa
function mostrarResultado(data) {
    document.getElementById('signosSolLuaAsc').textContent = 
        `☀️ Sol em ${traduzirSigno(data.signoSolar)} | 🌙 Lua em ${traduzirSigno(data.signoLunar)} | ⬆️ Ascendente em ${traduzirSigno(data.ascendente)}`;
    
    document.getElementById('mensagemHoroscopo').textContent = data.mensagem;
    
    const listaPlanetas = document.getElementById('listaPlanetas');
    listaPlanetas.innerHTML = '';
    
    const planetasPrincipais = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    data.planetas.forEach(planeta => {
        if (planetasPrincipais.includes(planeta.planet.en)) {
            const card = document.createElement('div');
            card.className = 'planeta-card';
            
            const emoji = getEmojiPlaneta(planeta.planet.en);
            const retrograde = planeta.isRetro === 'True' || planeta.isRetro === 'true' ? ' ℞' : '';
            
            card.innerHTML = `
                <strong>${emoji} ${traduzirPlaneta(planeta.planet.en)}${retrograde}</strong>
                <p>Signo: ${traduzirSigno(planeta.zodiac_sign.name.en)}</p>
                <p>Posição: ${planeta.normDegree.toFixed(2)}°</p>
            `;
            
            listaPlanetas.appendChild(card);
        }
    });
    
    document.getElementById('resultado').style.display = 'block';
    resultado.scrollIntoView({ behavior: 'smooth' });
}

// Carregar histórico de mapas
async function carregarHistorico() {
    const mapasLista = document.getElementById('mapasLista');
    mapasLista.innerHTML = '<p style="text-align: center; padding: 20px;">Carregando...</p>';
    
    try {
        const response = await fetch('/api/mapas');
        const data = await response.json();
        
        if (data.success && data.mapas.length > 0) {
            mapasLista.innerHTML = '';
            
            data.mapas.forEach(mapa => {
                const card = criarCardMapa(mapa);
                mapasLista.appendChild(card);
            });
        } else {
            mapasLista.innerHTML = `
                <div class="empty-state">
                    <h3>📭 Nenhum mapa salvo ainda</h3>
                    <p>Consulte seu primeiro mapa astral na aba "Novo Mapa"</p>
                </div>
            `;
        }
    } catch (error) {
        mapasLista.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar mapas.</p>';
        console.error(error);
    }
}

// Criar card de mapa
function criarCardMapa(mapa) {
    const card = document.createElement('div');
    card.className = 'mapa-card';
    
    const data = `${mapa.dataNascimento.dia}/${mapa.dataNascimento.mes}/${mapa.dataNascimento.ano}`;
    const hora = `${String(mapa.horaNascimento.hora).padStart(2, '0')}:${String(mapa.horaNascimento.minutos).padStart(2, '0')}`;
    const cidade = mapa.local.cidade || 'Local não informado';
    
    card.innerHTML = `
        <h3>${mapa.titulo}</h3>
        <p><strong>📅 Data:</strong> ${data}</p>
        <p><strong>🕐 Hora:</strong> ${hora}</p>
        <p><strong>📍 Local:</strong> ${cidade}</p>
        <p><strong>☀️ Sol:</strong> ${traduzirSigno(mapa.resultado.signoSolar)}</p>
        <p><strong>🌙 Lua:</strong> ${traduzirSigno(mapa.resultado.signoLunar)}</p>
        <p><strong>⬆️ Ascendente:</strong> ${traduzirSigno(mapa.resultado.ascendente)}</p>
        <button class="btn-delete" onclick="deletarMapa('${mapa._id}')">🗑️ Excluir</button>
    `;
    
    return card;
}

// Deletar mapa
async function deletarMapa(id) {
    if (!confirm('Tem certeza que deseja excluir este mapa?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/mapas/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Mapa excluído com sucesso!');
            carregarHistorico();
        } else {
            alert('Erro ao excluir mapa: ' + data.error);
        }
    } catch (error) {
        alert('Erro ao excluir mapa.');
        console.error(error);
    }
}

// Configurar formulário de perfil
function configurarFormularioPerfil(user) {
    document.getElementById('perfilNome').value = user.nome;
    document.getElementById('perfilEmail').value = user.email;
    
    document.getElementById('formPerfil').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dados = {
            nome: document.getElementById('perfilNome').value
        };
        
        try {
            const response = await fetch('/api/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Perfil atualizado com sucesso!');
                document.getElementById('nomeUsuario').textContent = `Olá, ${dados.nome}!`;
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao atualizar perfil.');
            console.error(error);
        }
    });
}

// Funções auxiliares (mesmas do script.js)
function traduzirPlaneta(nome) {
    const traducoes = {
        'Sun': 'Sol', 'Moon': 'Lua', 'Mercury': 'Mercúrio', 'Venus': 'Vênus',
        'Mars': 'Marte', 'Jupiter': 'Júpiter', 'Saturn': 'Saturno',
        'Uranus': 'Urano', 'Neptune': 'Netuno', 'Pluto': 'Plutão'
    };
    return traducoes[nome] || nome;
}

function traduzirSigno(nome) {
    const traducoes = {
        'Aries': 'Áries', 'Taurus': 'Touro', 'Gemini': 'Gêmeos', 'Cancer': 'Câncer',
        'Leo': 'Leão', 'Virgo': 'Virgem', 'Libra': 'Libra', 'Scorpio': 'Escorpião',
        'Sagittarius': 'Sagitário', 'Capricorn': 'Capricórnio', 'Aquarius': 'Aquário', 'Pisces': 'Peixes'
    };
    return traducoes[nome] || nome;
}

function getEmojiPlaneta(nome) {
    const emojis = {
        'Sun': '☀️', 'Moon': '🌙', 'Mercury': '☿️', 'Venus': '♀️', 'Mars': '♂️',
        'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇'
    };
    return emojis[nome] || '🪐';
}