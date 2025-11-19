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
    
    // Escutar mudanças de idioma para re-traduzir conteúdo dinâmico
    document.addEventListener('languageChanged', () => {
        // Re-carregar dados do usuário para atualizar saudação
        carregarDadosUsuario();
        
        // Se houver resultado visível, re-exibir com nova tradução
        if (dadosMapaAtual && document.getElementById('resultado').style.display !== 'none') {
            // Re-gerar a exibição dos planetas com nova tradução
            setTimeout(() => {
                const resultado = document.getElementById('resultado');
                if (resultado && resultado.style.display !== 'none') {
                    // Forçar re-renderização dos planetas
                    const listaPlanetas = document.getElementById('listaPlanetas');
                    if (listaPlanetas && listaPlanetas.children.length > 0) {
                        // Simular re-exibição
                        const event = new Event('submit');
                        // Não re-submeter o form, apenas re-renderizar se já tem dados
                    }
                }
            }, 100);
        }
    });
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
    const tabBtns = document.querySelectorAll('.modern-tab');
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
        
        // Mostrar loading moderno
        window.modernLoading.showWithAutoProgress('🔮 Consultando as estrelas...', 4000);
        
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
                window.modernLoading.hide();
                mostrarResultado();
                
                // Toast de sucesso ou aviso
                if (resultado.isSimulado) {
                    window.toast.warning('⚠️ API temporáriamente indisponível. Dados simulados gerados para demonstração.');
                } else {
                    window.toast.success('✨ Mapa astral calculado com sucesso!');
                }
                
                // Mostrar aviso se houver
                if (resultado.warning) {
                    setTimeout(() => {
                        window.toast.info(resultado.warning);
                    }, 2000);
                }
                
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
                    const mensagemSalvar = resultado.isSimulado ? 
                        '💾 Mapa simulado salvo (API indisponível)' : 
                        '💾 Mapa salvo no seu histórico!';
                    window.toast.info(mensagemSalvar);
                    setTimeout(() => {
                        carregarHistorico();
                    }, 1000);
                }
                
            } else {
                window.modernLoading.hide();
                window.toast.error('Erro ao calcular mapa: ' + (resultado.error || 'Erro desconhecido'));
                console.error('❌ Erro da API:', resultado.error);
            }
            
        } catch (error) {
            window.modernLoading.hide();
            console.error('❌ Erro ao consultar mapa:', error);
            window.toast.error('Erro ao consultar mapa astral. Verifique sua conexão e tente novamente.');
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
        window.toast.warning(window.i18n?.t('errors.invalidDay') || 'Dia inválido! Use valores entre 1 e 31.');
        return false;
    }
    
    if (dados.mes < 1 || dados.mes > 12) {
        window.toast.warning(window.i18n?.t('errors.invalidMonth') || 'Mês inválido! Use valores entre 1 e 12.');
        return false;
    }
    
    if (dados.ano < 1900 || dados.ano > 2025) {
        window.toast.warning(window.i18n?.t('errors.invalidYear') || 'Ano inválido! Use valores entre 1900 e 2025.');
        return false;
    }
    
    // Validar hora
    if (dados.hora < 0 || dados.hora > 23) {
        window.toast.warning(window.i18n?.t('errors.invalidHour') || 'Hora inválida! Use valores entre 0 e 23.');
        return false;
    }
    
    if (dados.minutos < 0 || dados.minutos > 59) {
        window.toast.warning(window.i18n?.t('errors.invalidMinutes') || 'Minutos inválidos! Use valores entre 0 e 59.');
        return false;
    }
    
    // Validar coordenadas
    if (isNaN(dados.latitude) || dados.latitude < -90 || dados.latitude > 90) {
        window.toast.warning(window.i18n?.t('errors.invalidLatitude') || 'Latitude inválida! Use valores entre -90 e 90.');
        return false;
    }
    
    if (isNaN(dados.longitude) || dados.longitude < -180 || dados.longitude > 180) {
        window.toast.warning(window.i18n?.t('errors.invalidLongitude') || 'Longitude inválida! Use valores entre -180 e 180.');
        return false;
    }
    
    return true;
}

// ============================================
// EXIBIR RESULTADO
// ============================================

function exibirResultado(resultado) {
    // Sol, Lua, Ascendente com estilo melhorado
    const signosSolLuaAsc = document.getElementById('signosSolLuaAsc');
    if (signosSolLuaAsc) {
        signosSolLuaAsc.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                text-align: center;
                font-size: 1.3em;
                font-weight: bold;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                margin-bottom: 20px;
            ">
                ${resultado.signosSolLuaAsc || 'Informação não disponível'}
            </div>
        `;
    }
    
    // Mensagem do horóscopo com formatação melhorada
    const mensagemHoroscopo = document.getElementById('mensagemHoroscopo');
    if (mensagemHoroscopo) {
        const mensagem = resultado.mensagem || resultado.horoscopo || 'Consulte os planetas abaixo para mais detalhes.';
        mensagemHoroscopo.innerHTML = `
            <div style="
                background: rgba(102, 126, 234, 0.1);
                border-left: 4px solid #667eea;
                padding: 20px;
                border-radius: 10px;
                font-size: 1.1em;
                line-height: 1.6;
                color: #333;
                white-space: pre-line;
            ">
                ${mensagem}
            </div>
        `;
    }
    
    // Lista de planetas
    const listaPlanetas = document.getElementById('listaPlanetas');
    if (listaPlanetas && resultado.planetas) {
        listaPlanetas.innerHTML = '';
        
        // Emojis e cores para cada planeta
        const planetaConfig = {
            'Sol': { emoji: '☀️', cor: '#FFD700' },
            'Lua': { emoji: '🌙', cor: '#C0C0C0' },
            'Mercúrio': { emoji: '☿️', cor: '#B8B8B8' },
            'Vênus': { emoji: '♀️', cor: '#FFC0CB' },
            'Marte': { emoji: '♂️', cor: '#FF4500' },
            'Júpiter': { emoji: '♃', cor: '#FFA500' },
            'Saturno': { emoji: '♄', cor: '#8B4513' },
            'Urano': { emoji: '♅', cor: '#4FD0E3' },
            'Netuno': { emoji: '♆', cor: '#4169E1' },
            'Plutão': { emoji: '♇', cor: '#8B008B' }
        };
        
        resultado.planetas.forEach(planeta => {
            const config = planetaConfig[planeta.nome] || { emoji: '🪐', cor: '#667eea' };
            const descricao = traduzirMensagemPlaneta(planeta.nome);
            const grau = planeta.grau ? planeta.grau.toFixed(1) : '0.0';
            const retrogrado = planeta.retrógrado ? ' ℞' : '';
            
            const div = document.createElement('div');
            div.className = 'planeta-item-modern';
            
            div.innerHTML = `
                <div class="planeta-card" data-planeta="${planeta.nome}" style="
                    background: linear-gradient(135deg, ${config.cor}15 0%, ${config.cor}05 100%);
                    border: 2px solid ${config.cor}30;
                    border-radius: 15px;
                    padding: 20px;
                    margin-bottom: 15px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                ">
                    <div class="planeta-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                        <span class="planeta-emoji" style="font-size: 2.5em;">${config.emoji}</span>
                        <div class="planeta-info" style="flex: 1;">
                            <h4 style="margin: 0; color: ${config.cor}; font-size: 1.4em; font-weight: bold;">
                                ${planeta.nome}${retrogrado}
                            </h4>
                            <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">${descricao}</p>
                        </div>
                        <div class="planeta-grau" style="text-align: right;">
                            <div style="font-size: 1.2em; font-weight: bold; color: ${config.cor};">${grau}°</div>
                            <div style="font-size: 0.8em; color: #999;">graus</div>
                        </div>
                    </div>
                    <div class="planeta-signo" style="
                        background: ${config.cor}20;
                        padding: 10px 15px;
                        border-radius: 10px;
                        text-align: center;
                        border: 1px solid ${config.cor}40;
                    ">
                        <span style="font-size: 1.1em; font-weight: bold; color: #333;">
                            ${window.i18n?.currentLang === 'en' ? 'Positioned in' : 'Posicionado em'} ${planeta.signo}
                        </span>
                    </div>
                </div>
            `;
            
            // Adicionar efeito hover
            div.addEventListener('mouseenter', () => {
                div.querySelector('.planeta-card').style.transform = 'translateY(-5px)';
                div.querySelector('.planeta-card').style.boxShadow = `0 10px 30px ${config.cor}40`;
            });
            
            div.addEventListener('mouseleave', () => {
                div.querySelector('.planeta-card').style.transform = 'translateY(0)';
                div.querySelector('.planeta-card').style.boxShadow = 'none';
            });
            
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
        window.toast.error('Gerador de imagem não está disponível. Recarregue a página.');
        return;
    }
    
    if (!dadosMapaAtual) {
        window.toast.warning('Nenhum mapa astral foi consultado ainda!');
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
        
        window.toast.success('🎨 Imagem gerada com sucesso!');
        console.log('✅ Imagem gerada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao gerar imagem:', error);
        window.toast.error('Erro ao gerar imagem. Tente novamente.');
        
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
        window.toast.warning('Nenhuma imagem foi gerada ainda!');
        return;
    }
    
    const imageDataUrl = mapaImage.src;
    
    // Criar nome do arquivo
    const nome = dadosMapaAtual.nome || 'Anonimo';
    const data = `${dadosMapaAtual.dia}-${dadosMapaAtual.mes}-${dadosMapaAtual.ano}`;
    const nomeArquivo = `mapa-astral-${nome}-${data}.png`.replace(/\s+/g, '-');
    
    // Baixar
    imageGenerator.baixarImagem(imageDataUrl, nomeArquivo);
    window.toast.success('📥 Download iniciado!');
    
    console.log('📥 Download iniciado:', nomeArquivo);
}

// ============================================
// COMPARTILHAR IMAGEM
// ============================================

async function compartilharImagem() {
    const mapaImage = document.getElementById('mapaImage');
    
    if (!mapaImage || !mapaImage.src) {
        window.toast.warning('Nenhuma imagem foi gerada ainda!');
        return;
    }
    
    const imageDataUrl = mapaImage.src;
    
    // Tentar compartilhar
    const compartilhado = await imageGenerator.compartilharImagem(imageDataUrl, dadosMapaAtual);
    
    if (!compartilhado) {
        window.toast.info('Compartilhamento não suportado neste navegador. Use o botão "Baixar Imagem" e compartilhe manualmente.');
    } else {
        window.toast.success('🔗 Imagem compartilhada!');
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
                const helloText = window.i18n?.t('dashboard.header.hello') || 'Olá,';
                nomeUsuario.innerHTML = `<span style="color: white !important; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${helloText} ${data.usuario.nome}!</span>`;
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
    card.className = 'modern-card mapa-card';
    
    const data = new Date(mapa.criadoEm || mapa.data).toLocaleDateString('pt-BR');
    
    card.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">
                <span class="card-icon">🌙</span>
                ${mapa.nome || 'Mapa Astral'}
            </h3>
            <span class="badge badge-primary">${mapa.dia}/${mapa.mes}/${mapa.ano}</span>
        </div>
        
        <div class="card-content">
            <div class="info-row">
                <span class="info-icon">🕐</span>
                <span class="info-text">${String(mapa.hora).padStart(2, '0')}:${String(mapa.minutos).padStart(2, '0')}</span>
            </div>
            
            ${mapa.cidade ? `
                <div class="info-row">
                    <span class="info-icon">📍</span>
                    <span class="info-text">${mapa.cidade}</span>
                </div>
            ` : ''}
            
            <div class="info-row">
                <span class="info-icon">📅</span>
                <span class="info-text">Consultado em ${data}</span>
            </div>
        </div>
        
        <div class="card-actions">
            <button class="btn-modern btn-sm" onclick="event.stopPropagation(); visualizarMapa(${JSON.stringify(mapa).replace(/"/g, '&quot;')})">
                👁️ Visualizar
            </button>
            <button class="btn-delete btn-sm" onclick="event.stopPropagation(); deletarMapa('${mapa.id || mapa._id}')">
                🗑️ Excluir
            </button>
        </div>
    `;
    
    // Adicionar estilos específicos do card
    const cardStyles = document.createElement('style');
    if (!document.getElementById('card-styles')) {
        cardStyles.id = 'card-styles';
        cardStyles.textContent = `
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 16px;
            }
            
            .card-title {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }
            
            .card-icon {
                font-size: 20px;
            }
            
            .card-content {
                margin-bottom: 20px;
            }
            
            .info-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                font-size: 14px;
                color: #666;
            }
            
            .info-icon {
                font-size: 16px;
                width: 20px;
            }
            
            .info-text {
                flex: 1;
            }
            
            .card-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                border-top: 1px solid #f0f0f0;
                padding-top: 16px;
            }
            
            .btn-sm {
                padding: 8px 16px;
                font-size: 12px;
                border-radius: 8px;
            }
            
            .btn-delete.btn-sm {
                background: #ff6b6b;
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-delete.btn-sm:hover {
                background: #ff5252;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(cardStyles);
    }
    
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

// Função para traduzir mensagens dos planetas
function traduzirMensagemPlaneta(nomePlaneta) {
    const traducoes = {
        'Sol': { pt: 'Sua essência e identidade', en: 'Your essence and identity' },
        'Lua': { pt: 'Suas emoções e instintos', en: 'Your emotions and instincts' },
        'Mercúrio': { pt: 'Sua comunicação e mente', en: 'Your communication and mind' },
        'Vênus': { pt: 'Seu amor e valores', en: 'Your love and values' },
        'Marte': { pt: 'Sua energia e ação', en: 'Your energy and action' },
        'Júpiter': { pt: 'Sua expansão e sabedoria', en: 'Your expansion and wisdom' },
        'Saturno': { pt: 'Sua disciplina e estrutura', en: 'Your discipline and structure' },
        'Urano': { pt: 'Sua originalidade e mudanças', en: 'Your originality and changes' },
        'Netuno': { pt: 'Sua intuição e espiritualidade', en: 'Your intuition and spirituality' },
        'Plutão': { pt: 'Sua transformação profunda', en: 'Your deep transformation' }
    };
    
    const lang = window.i18n?.currentLang || 'pt';
    return traducoes[nomePlaneta]?.[lang] || 'Influência planetária';
}

// Tornar funções acessíveis globalmente
window.deletarMapa = deletarMapa;
window.visualizarMapa = visualizarMapa;
window.traduzirMensagemPlaneta = traduzirMensagemPlaneta;

console.log('📜 dashboard.js carregado completamente');