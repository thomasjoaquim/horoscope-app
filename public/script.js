// Pegar elementos do HTML
const form = document.getElementById('formAstrologia');
const loading = document.getElementById('loading');
const resultado = document.getElementById('resultado');

// Quando o formulário for enviado
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o reload da página

    // Pegar os valores dos campos
    const dados = {
        year: document.getElementById('ano').value,
        month: document.getElementById('mes').value,
        date: document.getElementById('dia').value,
        hours: document.getElementById('hora').value,
        minutes: document.getElementById('minutos').value,
        latitude: document.getElementById('latitude').value,
        longitude: document.getElementById('longitude').value,
        timezone: document.getElementById('timezone').value
    };

    // Esconder resultado anterior e mostrar loading
    resultado.style.display = 'none';
    loading.style.display = 'block';

    try {
        // Fazer a chamada para o servidor
        const response = await fetch('/api/horoscopo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        // Esconder loading
        loading.style.display = 'none';

        if (data.success) {
            // Mostrar os resultados
            mostrarResultado(data);
        } else {
            alert(data.error || window.i18n.t('errors.genericError'));
        }

    } catch (error) {
        loading.style.display = 'none';
        alert(window.i18n.t('errors.fetchError'));
        console.error('Erro:', error);
    }
});

// Função para mostrar os resultados
function mostrarResultado(data) {
    const lang = window.i18n.currentLang || 'pt';
    
    // Título com os signos principais
    const sunText = window.i18n.t('result.sun');
    const moonText = window.i18n.t('result.moon');
    const ascText = window.i18n.t('result.ascendant');
    
    document.getElementById('signosSolLuaAsc').textContent = 
        `${sunText} ${traduzirSigno(data.signoSolar)} | ${moonText} ${traduzirSigno(data.signoLunar)} | ${ascText} ${traduzirSigno(data.ascendente)}`;
    
    // Mensagem do horóscopo
    document.getElementById('mensagemHoroscopo').textContent = data.mensagem;

    // Lista de planetas
    const listaPlanetas = document.getElementById('listaPlanetas');
    listaPlanetas.innerHTML = ''; // Limpar conteúdo anterior

    // Planetas principais para mostrar
    const planetasPrincipais = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    data.planetas.forEach(planeta => {
        if (planetasPrincipais.includes(planeta.planet.en)) {
            const card = document.createElement('div');
            card.className = 'planeta-card';
            
            const emoji = getEmojiPlaneta(planeta.planet.en);
            const retrograde = planeta.isRetro === 'True' || planeta.isRetro === 'true' ? ' ' + window.i18n.t('result.retrograde') : '';
            
            const signText = window.i18n.t('result.sign');
            const posText = window.i18n.t('result.position');
            
            card.innerHTML = `
                <strong>${emoji} ${traduzirPlaneta(planeta.planet.en)}${retrograde}</strong>
                <p>${signText} ${traduzirSigno(planeta.zodiac_sign.name.en)}</p>
                <p>${posText} ${planeta.normDegree.toFixed(2)}°</p>
            `;
            
            listaPlanetas.appendChild(card);
        }
    });

    // Mostrar o resultado
    resultado.style.display = 'block';
    
    // Rolar até o resultado
    resultado.scrollIntoView({ behavior: 'smooth' });
}

// Função para traduzir nomes de planetas
function traduzirPlaneta(nome) {
    if (window.i18n && window.i18n.translations) {
        return window.i18n.t(`planets.${nome}`);
    }
    
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

// Função para traduzir signos
function traduzirSigno(nome) {
    if (window.i18n && window.i18n.translations) {
        return window.i18n.t(`signs.${nome}`);
    }
    
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

// Função para pegar emoji do planeta
function getEmojiPlaneta(nome) {
    const emojis = {
        'Sun': '☀️',
        'Moon': '🌙',
        'Mercury': '☿️',
        'Venus': '♀️',
        'Mars': '♂️',
        'Jupiter': '♃',
        'Saturn': '♄',
        'Uranus': '♅',
        'Neptune': '♆',
        'Pluto': '♇'
    };
    return emojis[nome] || '🪐';
}

// Preencher exemplo (opcional - apenas para teste)
function preencherExemplo() {
    document.getElementById('dia').value = 15;
    document.getElementById('mes').value = 6;
    document.getElementById('ano').value = 1990;
    document.getElementById('hora').value = 14;
    document.getElementById('minutos').value = 30;
    document.getElementById('latitude').value = -23.5505;
    document.getElementById('longitude').value = -46.6333;
    document.getElementById('timezone').value = -3;
}
