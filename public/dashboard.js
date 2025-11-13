/**
 * ============================================
 * 🌙 PORTAL ASTROLÓGICO - DASHBOARD
 * ============================================
 * Dashboard completo com:
 * - Sistema de tabs
 * - Consulta de mapa astral
 * - Geração de imagem personalizada
 * - Histórico de mapas
 * - Perfil do usuário
 */

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let usuarioAtual = null;
let imageGenerator = null;
let dadosMapaAtual = null;

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando dashboard...');
    
    // Verificar autenticação
    verificarAutenticacao();
    
    // Inicializar gerador de imagem
    if (window.MapaAstralImageGenerator) {
        imageGenerator = new MapaAstralImageGenerator();
        console.log('✅ Gerador de imagem inicializado');
    } else {
        console.warn('⚠️ MapaAstralImageGenerator não encontrado');
    }
    
    // Configurar componentes
    setupTabs();
    setupFormAstrologia();
    setupImageButtons();
    setupFormPerfil();
    
    // Carregar dados
    carregarDadosUsuario();
    carregarHistorico();
    
    // Configurar logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }
    
    console.log('✅ Dashboard inicializado');
});

// ============================================
// VERIFICAR AUTENTICAÇÃO
// ============================================

function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ Usuário não autenticado, redirecionando...');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ Usuário autenticado');
}

// ============================================
// SISTEMA DE TABS
// ============================================

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Remover active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Adicionar active no clicado
            btn.classList.add('active');
            const targetTab = document.getElementById(`tab-${tabId}`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
            
            console.log(`📑 Tab ativa: ${tabId}`);
            
            // Carregar dados específicos da tab
            if (tabId === 'historico') {
                carregarHistorico();
            }
        });
    });
    
    console.log('✅ Sistema de tabs configurado');
}

// ============================================
// CONFIGURAR FORMULÁRIO DE ASTROLOGIA
// ============================================

function setupFormAstrologia() {
    const formAstrologia = document.getElementById('formAstrologia');
    
    if (!formAstrologia) {
        console.warn('⚠️ Formulário de astrologia não encontrado');
        return;
    }
    
    formAstrologia.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🔮 Consultando mapa astral...');
        
        // Coletar dados do formulário
        const dados = {
            dia: parseInt(document.getElementById('dia').value),
            mes: parseInt(document.getElementById('mes').value),
            ano: parseInt(document.getElementById('ano').value),
            hora: parseInt(document.getElementById('hora').value),
            minutos: parseInt(document.getElementById('minutos').value),
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            timezone: parseFloat(document.getElementById('timezone').value),
            cidade: document.getElementById('cidade').value,
            salvar: document.getElementById('salvar').checked
        };
        
        console.log('📝 Dados coletados:', dados);
        
        // Validar dados
        if (!validarDados(dados)) {
            return;
        }
        
        // Mostrar loading
        mostrarLoading();
        
        try {
            // Chamar API
            const response = await fetch('/api/astrologia/calcular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dados)
            });
            
            const resultado = await response.json();
            console.log('📊 Resposta da API:', resultado);
            
            if (resultado.success) {
                // Exibir resultado
                exibirResultado(resultado);
                
                // Salvar dados para geração de imagem
                salvarDadosMapa(resultado);
                
                // Ocultar loading e mostrar resultado
                ocultarLoading();
                mostrarResultado();
                
                // Scroll suave até o resultado
                setTimeout(() => {
                    document.getElementById('resultado').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 300);
                
                console.log('✅ Resultado exibido com sucesso');
                
                // Se salvou, atualizar histórico
                if (dados.salvar) {
                    setTimeout(() => {
                        carregarHistorico();
                    }, 1000);
                }
                
            } else {
                ocultarLoading();
                alert('Erro ao calcular mapa: ' + (resultado.error || 'Erro desconhecido'));
                console.error('❌ Erro da API:', resultado.error);
            }
            
        } catch (error) {
            ocultarLoading();
            console.error('❌ Erro ao consultar mapa:', error);
            alert('Erro ao consultar mapa astral. Verifique sua conexão e tente novamente.');
        }
    });
    
    console.log('✅ Formulário de astrologia configurado');
}

// ============================================
// VALIDAR DADOS DO FORMULÁRIO
// ============================================

function validarDados(dados) {
    // Validar data
    if (dados.dia < 1 || dados.dia > 31) {
        alert('Dia inválido! Use valores entre 1 e 31.');
        return false;
    }
    
    if (dados.mes < 1 || dados.mes > 12) {
        alert('Mês inválido! Use valores entre 1 e 12.');
        return false;
    }
    
    if (dados.ano < 1900 || dados.ano > 2025) {
        alert('Ano inválido! Use valores entre 1900 e 2025.');
        return false;
    }
    
    // Validar hora
    if (dados.hora < 0 || dados.hora > 23) {
        alert('Hora inválida! Use valores entre 0 e 23.');
        return false;
    }
    
    if (dados.minutos < 0 || dados.minutos > 59) {
        alert('Minutos inválidos! Use valores entre 0 e 59.');
        return false;
    }
    
    // Validar coordenadas
    if (isNaN(dados.latitude) || dados.latitude < -90 || dados.latitude > 90) {
        alert('Latitude inválida! Use valores entre -90 e 90.');
        return false;
    }
    
    if (isNaN(dados.longitude) || dados.longitude < -180 || dados.longitude > 180) {
        alert('Longitude inválida! Use valores entre -180 e 180.');
        return false;
    }
    
    return true;
}

// ============================================
// EXIBIR RESULTADO
// ============================================

function exibirResultado(resultado) {
    // Sol, Lua, Ascendente
    const signosSolLuaAsc = document.getElementById('signosSolLuaAsc');
    if (signosSolLuaAsc) {
        signosSolLuaAsc.textContent = resultado.signosSolLuaAsc || 'Informação não disponível';
    }
    
    // Mensagem do horóscopo
    const mensagemHoroscopo = document.getElementById('mensagemHoroscopo');
    if (mensagemHoroscopo) {
        mensagemHoroscopo.textContent = resultado.mensagem || resultado.horoscopo || 'Consulte os planetas abaixo para mais detalhes.';
    }
    
    // Lista de planetas
    const listaPlanetas = document.getElementById('listaPlanetas');
    if (listaPlanetas && resultado.planetas) {
        listaPlanetas.innerHTML = '';
        
        resultado.planetas.forEach(planeta => {
            const div = document.createElement('div');
            div.className = 'planeta-item';
            
            const grau = planeta.grau ? ` (${planeta.grau.toFixed(2)}°)` : '';
            
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(102, 126, 234, 0.1); border-radius: 8px; margin-bottom: 10px;">
                    <div>
                        <strong style="color: #667eea;">${planeta.nome}</strong>
                        <span style="color: #666;"> em </span>
                        <strong>${planeta.signo}</strong>
                    </div>
                    <small style="color: #999;">${grau}</small>
                </div>
            `;
            
            listaPlanetas.appendChild(div);
        });
    }
}

// ============================================
// CONTROLAR LOADING
// ============================================

function mostrarLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
}

function ocultarLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function mostrarResultado() {
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.style.display = 'block';
    }
}

// ============================================
// CONFIGURAR BOTÕES DE IMAGEM
// ============================================

function setupImageButtons() {
    // Botão "Gerar Imagem"
    const btnGerarImagem = document.getElementById('btnGerarImagem');
    if (btnGerarImagem) {
        btnGerarImagem.addEventListener('click', gerarImagemMapa);
    }
    
    // Botão "Baixar Imagem"
    const btnBaixarImagem = document.getElementById('btnBaixarImagem');
    if (btnBaixarImagem) {
        btnBaixarImagem.addEventListener('click', baixarImagem);
    }
    
    // Botão "Compartilhar"
    const btnCompartilhar = document.getElementById('btnCompartilhar');
    if (btnCompartilhar) {
        btnCompartilhar.addEventListener('click', compartilharImagem);
    }
    
    console.log('✅ Botões de imagem configurados');
}

// ============================================
// GERAR IMAGEM DO MAPA
// ============================================

async function gerarImagemMapa() {
    if (!imageGenerator) {
        alert('Gerador de imagem não está disponível. Recarregue a página.');
        return;
    }
    
    if (!dadosMapaAtual) {
        alert('Nenhum mapa astral foi consultado ainda!');
        return;
    }
    
    console.log('🎨 Gerando imagem do mapa...');
    
    try {
        const btnGerarImagem = document.getElementById('btnGerarImagem');
        const textoOriginal = btnGerarImagem.innerHTML;
        btnGerarImagem.innerHTML = '⏳ Gerando imagem...';
        btnGerarImagem.disabled = true;
        
        // Gerar imagem
        const imageDataUrl = await imageGenerator.gerarImagem(dadosMapaAtual);
        
        // Mostrar preview
        const imagePreview = document.getElementById('imagePreview');
        const mapaImage = document.getElementById('mapaImage');
        
        if (imagePreview && mapaImage) {
            mapaImage.src = imageDataUrl;
            imagePreview.style.display = 'block';
            
            // Scroll suave até a imagem
            setTimeout(() => {
                imagePreview.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
        
        // Restaurar botão
        btnGerarImagem.innerHTML = textoOriginal;
        btnGerarImagem.disabled = false;
        
        console.log('✅ Imagem gerada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao gerar imagem:', error);
        alert('Erro ao gerar imagem. Tente novamente.');
        
        const btnGerarImagem = document.getElementById('btnGerarImagem');
        if (btnGerarImagem) {
            btnGerarImagem.innerHTML = '🎨 Gerar Imagem do Mapa';
            btnGerarImagem.disabled = false;
        }
    }
}

// ============================================
// BAIXAR IMAGEM
// ============================================

function baixarImagem() {
    const mapaImage = document.getElementById('mapaImage');
    
    if (!mapaImage || !mapaImage.src) {
        alert('Nenhuma imagem foi gerada ainda!');
        return;
    }
    
    const imageDataUrl = mapaImage.src;
    
    // Criar nome do arquivo
    const nome = dadosMapaAtual.nome || 'Anonimo';
    const data = `${dadosMapaAtual.dia}-${dadosMapaAtual.mes}-${dadosMapaAtual.ano}`;
    const nomeArquivo = `mapa-astral-${nome}-${data}.png`.replace(/\s+/g, '-');
    
    // Baixar
    imageGenerator.baixarImagem(imageDataUrl, nomeArquivo);
    
    console.log('📥 Download iniciado:', nomeArquivo);
}

// ============================================
// COMPARTILHAR IMAGEM
// ============================================

async function compartilharImagem() {
    const mapaImage = document.getElementById('mapaImage');
    
    if (!mapaImage || !mapaImage.src) {
        alert('Nenhuma imagem foi gerada ainda!');
        return;
    }
    
    const imageDataUrl = mapaImage.src;
    
    // Tentar compartilhar
    const compartilhado = await imageGenerator.compartilharImagem(imageDataUrl, dadosMapaAtual);
    
    if (!compartilhado) {
        alert('Compartilhamento não suportado neste navegador. Use o botão "Baixar Imagem" e compartilhe manualmente.');
    } else {
        console.log('✅ Imagem compartilhada');
    }
}

// ============================================
// SALVAR DADOS DO MAPA PARA GERAÇÃO DE IMAGEM
// ============================================

function salvarDadosMapa(resultado) {
    const dia = parseInt(document.getElementById('dia').value);
    const mes = parseInt(document.getElementById('mes').value);
    const ano = parseInt(document.getElementById('ano').value);
    const hora = parseInt(document.getElementById('hora').value);
    const minutos = parseInt(document.getElementById('minutos').value);
    const cidade = document.getElementById('cidade').value;
    
    // Montar objeto com dados
    dadosMapaAtual = {
        nome: usuarioAtual?.nome || document.getElementById('perfilNome')?.value || 'Anônimo',
        dia: dia,
        mes: mes,
        ano: ano,
        hora: hora,
        minutos: minutos,
        cidade: cidade || '',
        signosSolLuaAsc: resultado.signosSolLuaAsc || '',
        planetas: {}
    };
    
    // Converter planetas para o formato do gerador
    if (resultado.planetas && Array.isArray(resultado.planetas)) {
        resultado.planetas.forEach(planeta => {
            dadosMapaAtual.planetas[planeta.nome] = {
                signo: planeta.signo,
                grau: planeta.grau || 0
            };
        });
    }
    
    console.log('✅ Dados do mapa salvos para geração de imagem:', dadosMapaAtual);
}

// ============================================
// CARREGAR DADOS DO USUÁRIO
// ============================================

async function carregarDadosUsuario() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.usuario) {
            usuarioAtual = data.usuario;
            
            // Atualizar header
            const nomeUsuario = document.getElementById('nomeUsuario');
            if (nomeUsuario) {
                nomeUsuario.textContent = `Olá, ${data.usuario.nome}!`;
            }
            
            const emailUsuario = document.getElementById('emailUsuario');
            if (emailUsuario) {
                emailUsuario.textContent = data.usuario.email;
            }
            
            // Atualizar perfil
            const perfilNome = document.getElementById('perfilNome');
            if (perfilNome) {
                perfilNome.value = data.usuario.nome;
            }
            
            const perfilEmail = document.getElementById('perfilEmail');
            if (perfilEmail) {
                perfilEmail.value = data.usuario.email;
            }
            
            console.log('✅ Dados do usuário carregados:', data.usuario);
        } else {
            console.warn('⚠️ Erro ao carregar dados do usuário');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
    }
}

// ============================================
// CARREGAR HISTÓRICO DE MAPAS
// ============================================

async function carregarHistorico() {
    const mapasLista = document.getElementById('mapasLista');
    
    if (!mapasLista) {
        return;
    }
    
    try {
        const response = await fetch('/api/astrologia/historico', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.mapas && data.mapas.length > 0) {
            mapasLista.innerHTML = '';
            
            data.mapas.forEach(mapa => {
                const card = criarCardMapa(mapa);
                mapasLista.appendChild(card);
            });
            
            console.log(`✅ ${data.mapas.length} mapas carregados no histórico`);
            
        } else {
            // Empty state
            mapasLista.innerHTML = `
                <div class="empty-state">
                    <h3>📚 Nenhum mapa salvo ainda</h3>
                    <p>Consulte seu primeiro mapa astral e salve-o para vê-lo aqui!</p>
                    <button class="btn-novo-mapa" onclick="document.querySelector('[data-tab=novo]').click()">
                        🔮 Consultar Novo Mapa
                    </button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        mapasLista.innerHTML = `
            <div class="empty-state">
                <h3>❌ Erro ao carregar histórico</h3>
                <p>Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// ============================================
// CRIAR CARD DE MAPA
// ============================================

function criarCardMapa(mapa) {
    const card = document.createElement('div');
    card.className = 'mapa-card';
    
    const data = new Date(mapa.criadoEm || mapa.data).toLocaleDateString('pt-BR');
    
    card.innerHTML = `
        <h3>${mapa.nome || 'Mapa Astral'}</h3>
        <p><strong>Data:</strong> ${mapa.dia}/${mapa.mes}/${mapa.ano}</p>
        <p><strong>Hora:</strong> ${String(mapa.hora).padStart(2, '0')}:${String(mapa.minutos).padStart(2, '0')}</p>
        ${mapa.cidade ? `<p><strong>Local:</strong> ${mapa.cidade}</p>` : ''}
        <p><strong>Consultado em:</strong> ${data}</p>
        <button class="btn-delete" onclick="deletarMapa('${mapa.id || mapa._id}')">
            🗑️ Excluir
        </button>
    `;
    
    // Clique no card para visualizar
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-delete')) {
            visualizarMapa(mapa);
        }
    });
    
    return card;
}

// ============================================
// VISUALIZAR MAPA DO HISTÓRICO
// ============================================

function visualizarMapa(mapa) {
    // Mudar para tab de novo mapa
    document.querySelector('[data-tab="novo"]').click();
    
    // Preencher formulário com dados do mapa
    document.getElementById('dia').value = mapa.dia;
    document.getElementById('mes').value = mapa.mes;
    document.getElementById('ano').value = mapa.ano;
    document.getElementById('hora').value = mapa.hora;
    document.getElementById('minutos').value = mapa.minutos;
    document.getElementById('latitude').value = mapa.latitude;
    document.getElementById('longitude').value = mapa.longitude;
    document.getElementById('timezone').value = mapa.timezone;
    document.getElementById('cidade').value = mapa.cidade || '';
    
    // Scroll até formulário
    document.getElementById('formAstrologia').scrollIntoView({ behavior: 'smooth' });
    
    console.log('📋 Mapa carregado no formulário');
}

// ============================================
// DELETAR MAPA
// ============================================

async function deletarMapa(mapaId) {
    if (!confirm('Tem certeza que deseja excluir este mapa?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/astrologia/mapa/${mapaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Mapa deletado');
            carregarHistorico();
        } else {
            alert('Erro ao deletar mapa: ' + data.error);
        }
        
    } catch (error) {
        console.error('❌ Erro ao deletar mapa:', error);
        alert('Erro ao deletar mapa. Tente novamente.');
    }
}

// ============================================
// CONFIGURAR FORMULÁRIO DE PERFIL
// ============================================

function setupFormPerfil() {
    const formPerfil = document.getElementById('formPerfil');
    
    if (!formPerfil) {
        return;
    }
    
    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const novoNome = document.getElementById('perfilNome').value;
        
        if (!novoNome.trim()) {
            alert('O nome não pode estar vazio!');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/atualizar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nome: novoNome })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Perfil atualizado com sucesso!');
                carregarDadosUsuario();
                console.log('✅ Perfil atualizado');
            } else {
                alert('Erro ao atualizar perfil: ' + data.error);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        }
    });
    
    console.log('✅ Formulário de perfil configurado');
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
        console.log('👋 Logout realizado');
    }
}

// ============================================
// FUNÇÕES GLOBAIS (para onclick no HTML)
// ============================================

// Tornar funções acessíveis globalmente
window.deletarMapa = deletarMapa;
window.visualizarMapa = visualizarMapa;

console.log('📜 dashboard.js carregado completamente');