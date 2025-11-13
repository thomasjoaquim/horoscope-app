/**
 * 🎨 GERADOR AVANÇADO DE IMAGEM DO MAPA ASTRAL
 * 
 * Cria uma imagem circular profissional com:
 * - Roda zodiacal com 12 signos
 * - Posição dos planetas em graus
 * - Design elegante e compartilhável
 * - Informações do usuário (nome e data)
 */

class MapaAstralImageGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 1400;
        this.height = 1600;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2 - 100;
        this.mainRadius = 320; // Raio da roda zodiacal
    }

    /**
     * Gera a imagem completa do mapa astral
     */
    async gerarImagem(dados) {
        // Criar canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Desenhar componentes
        this.desenharFundo();
        this.desenharTitulo(dados);
        this.desenharRodaZodiacal();
        this.desenharPlanetas(dados.planetas);
        this.desenharLegenda(dados);
        this.desenharRodape();

        return this.canvas.toDataURL('image/png', 0.95);
    }

    /**
     * Desenha fundo com gradiente
     */
    desenharFundo() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f23');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Adicionar estrelas de fundo
        this.desenharEstrelas();
    }

    /**
     * Desenha estrelas decorativas
     */
    desenharEstrelas() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * (this.height * 0.6);
            const size = Math.random() * 1.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Desenha título com nome e data
     */
    desenharTitulo(dados) {
        // Nome
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌙 Seu Mapa Astral 🌙', this.centerX, 60);

        // Data e hora
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        const data = `${dados.dia}/${dados.mes}/${dados.ano} às ${String(dados.hora).padStart(2, '0')}:${String(dados.minutos).padStart(2, '0')}`;
        this.ctx.fillText(data, this.centerX, 100);

        // Nome da pessoa
        if (dados.nome) {
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillStyle = '#667eea';
            this.ctx.fillText(dados.nome, this.centerX, 140);
        }

        // Linha decorativa
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(150, 155);
        this.ctx.lineTo(this.width - 150, 155);
        this.ctx.stroke();
    }

    /**
     * Desenha a roda zodiacal principal
     */
    desenharRodaZodiacal() {
        // Círculos concêntricos
        this.desenharCirculos();

        // Dividir em 12 casas
        this.desenharSignosZodiacais();

        // Desenhar graus
        this.desenharGraus();
    }

    /**
     * Desenha os círculos concêntricos
     */
    desenharCirculos() {
        // Círculo externo principal
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mainRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Círculo intermediário
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mainRadius - 60, 0, Math.PI * 2);
        this.ctx.stroke();

        // Círculo interno
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.mainRadius - 120, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Desenha os 12 signos zodiacais
     */
    desenharSignosZodiacais() {
        const signos = [
            { símbolo: '♈', nome: 'Áries', cor: '#FF6B6B' },
            { símbolo: '♉', nome: 'Touro', cor: '#4ECDC4' },
            { símbolo: '♊', nome: 'Gêmeos', cor: '#FFE66D' },
            { símbolo: '♋', nome: 'Câncer', cor: '#95E1D3' },
            { símbolo: '♌', nome: 'Leão', cor: '#F38181' },
            { símbolo: '♍', nome: 'Virgem', cor: '#AA96DA' },
            { símbolo: '♎', nome: 'Libra', cor: '#FCBAD3' },
            { símbolo: '♏', nome: 'Escorpião', cor: '#A8E6CF' },
            { símbolo: '♐', nome: 'Sagitário', cor: '#FFD3B6' },
            { símbolo: '♑', nome: 'Capricórnio', cor: '#FFAAA5' },
            { símbolo: '♒', nome: 'Aquário', cor: '#FF8B94' },
            { símbolo: '♓', nome: 'Peixes', cor: '#B4A7D6' }
        ];

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            
            // Linha divisória
            const x1 = this.centerX + Math.cos(angle) * (this.mainRadius - 60);
            const y1 = this.centerY + Math.sin(angle) * (this.mainRadius - 60);
            const x2 = this.centerX + Math.cos(angle) * this.mainRadius;
            const y2 = this.centerY + Math.sin(angle) * this.mainRadius;
            
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            // Símbolo do signo no exterior
            const signoAngle = (i * 30 + 15 - 90) * (Math.PI / 180);
            const signoX = this.centerX + Math.cos(signoAngle) * (this.mainRadius + 55);
            const signoY = this.centerY + Math.sin(signoAngle) * (this.mainRadius + 55);
            
            this.ctx.fillStyle = signos[i].cor;
            this.ctx.font = 'bold 44px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(signos[i].símbolo, signoX, signoY);

            // Nome do signo no interior
            const nomeAngle = (i * 30 + 15 - 90) * (Math.PI / 180);
            const nomeX = this.centerX + Math.cos(nomeAngle) * (this.mainRadius - 90);
            const nomeY = this.centerY + Math.sin(nomeAngle) * (this.mainRadius - 90);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(signos[i].nome, nomeX, nomeY);
        }
    }

    /**
     * Desenha marcadores de graus
     */
    desenharGraus() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Marcadores a cada 10 graus
        for (let i = 0; i < 36; i++) {
            const angle = (i * 10 - 90) * (Math.PI / 180);
            
            const isMarked = i % 3 === 0; // A cada 30 graus
            const length = isMarked ? 15 : 8;
            
            const x1 = this.centerX + Math.cos(angle) * (this.mainRadius - length);
            const y1 = this.centerY + Math.sin(angle) * (this.mainRadius - length);
            const x2 = this.centerX + Math.cos(angle) * this.mainRadius;
            const y2 = this.centerY + Math.sin(angle) * this.mainRadius;
            
            this.ctx.lineWidth = isMarked ? 2 : 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            // Texto dos graus
            if (isMarked) {
                const textX = this.centerX + Math.cos(angle) * (this.mainRadius + 25);
                const textY = this.centerY + Math.sin(angle) * (this.mainRadius + 25);
                this.ctx.fillText(i * 10 + '°', textX, textY);
            }
        }
    }

    /**
     * Desenha os planetas nas posições corretas
     */
    desenharPlanetas(planetas) {
        const planetasConfig = {
            'Sol': { emoji: '☉', cor: '#FFD700', tamanho: 28, raio: this.mainRadius - 80 },
            'Lua': { emoji: '☽', cor: '#C0C0C0', tamanho: 26, raio: this.mainRadius - 110 },
            'Mercúrio': { emoji: '☿', cor: '#B8B8B8', tamanho: 20, raio: this.mainRadius - 140 },
            'Vênus': { emoji: '♀', cor: '#FFC0CB', tamanho: 24, raio: this.mainRadius - 80 },
            'Marte': { emoji: '♂', cor: '#FF4500', tamanho: 22, raio: this.mainRadius - 110 },
            'Júpiter': { emoji: '♃', cor: '#FFA500', tamanho: 26, raio: this.mainRadius - 140 },
            'Saturno': { emoji: '♄', cor: '#DAA520', tamanho: 24, raio: this.mainRadius - 80 },
            'Urano': { emoji: '♅', cor: '#00CED1', tamanho: 20, raio: this.mainRadius - 110 },
            'Netuno': { emoji: '♆', cor: '#4169E1', tamanho: 20, raio: this.mainRadius - 140 },
            'Plutão': { emoji: '♇', cor: '#8B4513', tamanho: 18, raio: this.mainRadius - 80 }
        };

        Object.entries(planetas).forEach(([nome, info]) => {
            const config = planetasConfig[nome];
            if (!config) return;

            // Converter grau para radianos (0° = Áries, à direita)
            // Em astrologia: 0° Áries é à direita (0°), 90° Câncer é no topo (-90°)
            const angle = (info.grau - 90) * (Math.PI / 180);
            
            const x = this.centerX + Math.cos(angle) * config.raio;
            const y = this.centerY + Math.sin(angle) * config.raio;

            // Desenhar círculo de fundo
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.strokeStyle = config.cor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, config.tamanho / 2 + 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Desenhar planeta
            this.ctx.fillStyle = config.cor;
            this.ctx.font = `${config.tamanho}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(config.emoji, x, y);

            // Desenhar linha até o planeta
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Informação ao lado
            const labelX = x > this.centerX ? x + 30 : x - 30;
            const labelY = y - 15;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = x > this.centerX ? 'left' : 'right';
            this.ctx.fillText(`${nome}`, labelX, labelY);

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(`${info.grau.toFixed(1)}°`, labelX, labelY + 15);
        });
    }

    /**
     * Desenha legenda com informações dos signos principais
     */
    desenharLegenda(dados) {
        const legendaY = this.centerY + this.mainRadius + 80;

        // Caixa de fundo
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(50, legendaY, this.width - 100, 120);
        this.ctx.strokeRect(50, legendaY, this.width - 100, 120);

        // Título da legenda
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✨ Informações de Seu Mapa ✨', this.centerX, legendaY + 25);

        // Informações em coluna
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';

        const signos = dados.signosSolLuaAsc ? dados.signosSolLuaAsc.split(' | ') : [];
        let yOffset = legendaY + 50;

        if (signos.length > 0) {
            this.ctx.fillText(`☀️ Sol: ${this.extrairSigno(signos[0])}`, this.centerX - 250, yOffset);
            this.ctx.fillText(`🌙 Lua: ${this.extrairSigno(signos[1])}`, this.centerX, yOffset);
            this.ctx.fillText(`⬆️ Ascendente: ${this.extrairSigno(signos[2])}`, this.centerX + 250, yOffset);
        }

        // Local (se tiver)
        if (dados.cidade) {
            yOffset += 25;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`📍 Local: ${dados.cidade}`, this.centerX, yOffset);
        }
    }

    /**
     * Extrai o signo de uma string tipo "☀️ Sol em Áries"
     */
    extrairSigno(texto) {
        const partes = texto.split(' ');
        return partes[partes.length - 1];
    }

    /**
     * Desenha rodapé
     */
    desenharRodape() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            '✨ Portal Astrológico • ' + new Date().toLocaleDateString('pt-BR'),
            this.centerX,
            this.height - 20
        );
    }

    /**
     * Baixa a imagem gerada
     */
    baixarImagem(dataUrl, nomeArquivo = 'mapa-astral.png') {
        const link = document.createElement('a');
        link.download = nomeArquivo;
        link.href = dataUrl;
        link.click();
    }

    /**
     * Compartilha a imagem (se suportado)
     */
    async compartilharImagem(dataUrl, dados) {
        if (navigator.share && navigator.canShare) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'mapa-astral.png', { type: 'image/png' });

                await navigator.share({
                    title: 'Meu Mapa Astral',
                    text: `Mapa Astral de ${dados.nome || 'Anônimo'} - ${dados.signosSolLuaAsc}`,
                    files: [file]
                });

                return true;
            } catch (error) {
                console.log('Compartilhamento cancelado ou não suportado');
                return false;
            }
        }
        return false;
    }
}

// Exportar para uso global
window.MapaAstralImageGenerator = MapaAstralImageGenerator;