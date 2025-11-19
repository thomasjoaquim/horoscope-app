/**
 * CORREÇÃO PARA PROBLEMAS DA API FREEASTROLOGY
 * 
 * Implementa fallbacks e endpoints alternativos
 */

const axios = require('axios');

// Endpoints alternativos para testar
const ENDPOINTS_ALTERNATIVOS = [
    'https://json.freeastrologyapi.com/western/planets',
    'https://api.freeastrologyapi.com/western/planets', 
    'https://freeastrologyapi.com/api/western/planets',
    'https://json.freeastrologyapi.com/planets'
];

/**
 * Tenta conectar com diferentes endpoints da API
 */
async function chamarAPIComFallback(payload, apiKey) {
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'User-Agent': 'HoroscopeApp/1.0',
        'Accept': 'application/json'
    };

    console.log('🔄 Tentando conectar com API...');

    for (let i = 0; i < ENDPOINTS_ALTERNATIVOS.length; i++) {
        const endpoint = ENDPOINTS_ALTERNATIVOS[i];
        console.log(`📡 Tentativa ${i + 1}: ${endpoint}`);

        try {
            const response = await axios.post(endpoint, payload, {
                headers,
                timeout: 15000, // 15 segundos
                validateStatus: (status) => status < 500 // Aceita códigos 4xx também
            });

            if (response.status === 200 && response.data?.output) {
                console.log('✅ Conexão bem-sucedida!');
                return response.data;
            } else if (response.status === 401) {
                throw new Error('Chave da API inválida ou expirada');
            } else if (response.status === 429) {
                throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
            }

        } catch (error) {
            console.log(`❌ Falha na tentativa ${i + 1}:`, error.message);
            
            // Se for o último endpoint, relançar o erro
            if (i === ENDPOINTS_ALTERNATIVOS.length - 1) {
                throw new Error(`Todos os endpoints falharam. Último erro: ${error.message}`);
            }
            
            // Aguardar um pouco antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

/**
 * Gera dados astrológicos simulados como fallback
 */
function gerarDadosSimulados(payload) {
    console.log('⚠️ Gerando dados simulados como fallback...');
    
    const signos = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const planetas = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant'];
    
    // Usar data de nascimento para gerar dados consistentes
    const seed = payload.year + payload.month + payload.date;
    
    const output = planetas.map((planeta, index) => {
        const signoIndex = (seed + index) % 12;
        const grau = ((seed + index * 7) % 30) + Math.random() * 30;
        
        return {
            planet: { en: planeta },
            zodiac_sign: { 
                name: { en: signos[signoIndex] }
            },
            normDegree: grau,
            isRetro: Math.random() > 0.8 ? 'True' : 'False'
        };
    });
    
    return { output };
}

/**
 * Função principal para calcular mapa astral com fallbacks
 */
async function calcularMapaAstralSeguro(payload, apiKey) {
    try {
        // Tentar API real primeiro
        const resultado = await chamarAPIComFallback(payload, apiKey);
        return { success: true, data: resultado, source: 'api' };
        
    } catch (error) {
        console.warn('⚠️ API indisponível, usando dados simulados:', error.message);
        
        // Fallback para dados simulados
        const dadosSimulados = gerarDadosSimulados(payload);
        return { 
            success: true, 
            data: dadosSimulados, 
            source: 'simulado',
            warning: 'API temporariamente indisponível. Dados simulados gerados.'
        };
    }
}

module.exports = {
    chamarAPIComFallback,
    gerarDadosSimulados,
    calcularMapaAstralSeguro
};