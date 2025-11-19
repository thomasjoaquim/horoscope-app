/**
 * VERIFICADOR DE STATUS DA API FREEASTROLOGY
 * 
 * Script para verificar periodicamente o status da API
 */

const { calcularMapaAstralSeguro } = require('./correcao-api');
require('dotenv').config();

async function verificarStatusAPI() {
    console.log('🔍 Verificando status da API FreeAstrology...');
    console.log('='.repeat(50));
    
    const payloadTeste = {
        year: 1990,
        month: 6,
        date: 15,
        hours: 12,
        minutes: 0,
        seconds: 0,
        latitude: -23.5505,
        longitude: -46.6333,
        timezone: -3,
        config: {
            observation_point: "topocentric",
            ayanamsha: "tropical",
            language: "en"
        }
    };
    
    try {
        const inicio = Date.now();
        const resultado = await calcularMapaAstralSeguro(payloadTeste, process.env.API_KEY);
        const tempoResposta = Date.now() - inicio;
        
        console.log(`⏱️  Tempo de resposta: ${tempoResposta}ms`);
        console.log(`📊 Fonte dos dados: ${resultado.source}`);
        console.log(`✅ Status: ${resultado.success ? 'FUNCIONANDO' : 'COM PROBLEMAS'}`);
        
        if (resultado.warning) {
            console.log(`⚠️  Aviso: ${resultado.warning}`);
        }
        
        if (resultado.data?.output) {
            console.log(`🪐 Planetas retornados: ${resultado.data.output.length}`);
            
            // Mostrar alguns planetas como exemplo
            const planetas = resultado.data.output.slice(0, 3);
            planetas.forEach(p => {
                console.log(`   - ${p.planet.en}: ${p.zodiac_sign.name.en} (${p.normDegree?.toFixed(1)}°)`);
            });
        }
        
        return resultado;
        
    } catch (error) {
        console.log('❌ ERRO:', error.message);
        return { success: false, error: error.message };
    }
}

// Função para verificar conectividade básica
async function verificarConectividade() {
    const axios = require('axios');
    
    console.log('\n🌐 Verificando conectividade básica...');
    
    const sitesParaTestar = [
        'https://google.com',
        'https://httpbin.org/get',
        'https://jsonplaceholder.typicode.com/posts/1'
    ];
    
    for (const site of sitesParaTestar) {
        try {
            const response = await axios.get(site, { timeout: 5000 });
            console.log(`✅ ${site}: OK (${response.status})`);
        } catch (error) {
            console.log(`❌ ${site}: FALHA (${error.message})`);
        }
    }
}

// Executar verificação completa
async function verificacaoCompleta() {
    console.log('🚀 INICIANDO VERIFICAÇÃO COMPLETA');
    console.log('='.repeat(50));
    
    await verificarConectividade();
    console.log('\n');
    const resultado = await verificarStatusAPI();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMO:');
    console.log(`   Status da API: ${resultado.success ? '✅ OK' : '❌ PROBLEMA'}`);
    console.log(`   Fonte: ${resultado.source || 'N/A'}`);
    console.log(`   Timestamp: ${new Date().toLocaleString('pt-BR')}`);
    
    return resultado;
}

// Se executado diretamente
if (require.main === module) {
    verificacaoCompleta().then(resultado => {
        process.exit(resultado.success ? 0 : 1);
    });
}

module.exports = {
    verificarStatusAPI,
    verificarConectividade,
    verificacaoCompleta
};