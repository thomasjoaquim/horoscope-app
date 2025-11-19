/**
 * DIAGNÓSTICO E TESTE DA API FREEASTROLOGY
 * 
 * Este arquivo testa a conexão com a API e identifica problemas
 */

const axios = require('axios');
require('dotenv').config();

async function testarAPI() {
    console.log('🔍 DIAGNÓSTICO DA API FREEASTROLOGY');
    console.log('=====================================');
    
    // 1. Verificar variáveis de ambiente
    console.log('\n1. Verificando configurações:');
    console.log('API_KEY:', process.env.API_KEY ? '✅ Configurada' : '❌ Não encontrada');
    console.log('Tamanho da chave:', process.env.API_KEY?.length || 0, 'caracteres');
    
    // 2. Testar payload básico
    const payload = {
        year: 1990,
        month: 1,
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
    
    console.log('\n2. Payload de teste:');
    console.log(JSON.stringify(payload, null, 2));
    
    // 3. Testar diferentes endpoints
    const endpoints = [
        'https://json.freeastrologyapi.com/western/planets',
        'https://json.freeastrologyapi.com/planets',
        'https://api.freeastrologyapi.com/western/planets'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n3. Testando endpoint: ${endpoint}`);
        
        try {
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.API_KEY,
                    'User-Agent': 'HoroscopeApp/1.0'
                },
                timeout: 10000
            });
            
            console.log('✅ Sucesso!');
            console.log('Status:', response.status);
            console.log('Planetas encontrados:', response.data?.output?.length || 0);
            
            if (response.data?.output?.length > 0) {
                console.log('Primeiro planeta:', response.data.output[0]);
                return { success: true, endpoint, data: response.data };
            }
            
        } catch (error) {
            console.log('❌ Erro:');
            console.log('Status:', error.response?.status || 'Sem resposta');
            console.log('Mensagem:', error.response?.data?.message || error.message);
            console.log('Headers de resposta:', error.response?.headers || 'Nenhum');
        }
    }
    
    return { success: false };
}

// Executar teste se chamado diretamente
if (require.main === module) {
    testarAPI().then(result => {
        console.log('\n=====================================');
        console.log('RESULTADO FINAL:', result.success ? '✅ API FUNCIONANDO' : '❌ API COM PROBLEMAS');
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = { testarAPI };