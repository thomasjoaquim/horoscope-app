/**
 * 🎨 GERADOR DE IMAGEM DO MAPA ASTRAL
 * 
 * Cria uma imagem personalizada com:
 * - Nome do usuário
 * - Data de nascimento
 * - Posição dos planetas
 * - Design bonito e compartilhável
 */

class MapaAstralImageGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 1200;
        this.height = 1200;
    }

    /**
     * Gera imagem do mapa astral
     * @param {Object} dados - Dados do mapa astral
     * @returns {Promise<string>} - Data URL da imagem
     */
    async gerarImagem(dados) {
        // Criar canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        // Desenhar fundo
        this.desenharFundo();

        // Desenhar círculo zodiacal
        await this.desenharCirculoZodiacal();

        // Desenhar planetas
        this.desenharPlanetas(dados.planetas);

        // Desenhar informações
        this.desenharInformacoes(dados);

        // Desenhar assinatura
        this.desenharAssinatura();

        // Retornar imagem
        return this.canvas.toDataURL('image/png');
    }

    /**
     * Desenha fundo gradiente
     */
    desenharFundo() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Adicionar estrelas de fundo
        this.desenharEstrelas();
    }

    /**
     * Desenha estrelas decorativas no fundo
     */
    desenharEstrelas() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Desenha círculo zodiacal com as casas
     */
    async desenharCirculoZodiacal() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = 400;

        // Círculo externo
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Círculo interno
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - 50, 0, Math.PI * 2);
        this.ctx.stroke();

        // Dividir em 12 casas (signos)
        const signos = [
            { nome: '♈', label: 'Áries' },
            { nome: '♉', label: 'Touro' },
            { nome: '♊', label: 'Gêmeos' },
            { nome: '♋', label: 'Câncer' },
            { nome: '♌', label: 'Leão' },
            { nome: '♍', label: 'Virgem' },
            { nome: '♎', label: 'Libra' },
            { nome: '♏', label: 'Escorpião' },
            { nome: '♐', label: 'Sagitário' },
            { nome: '♑', label: 'Capricórnio' },
            { nome: '♒', label: 'Aquário' },
            { nome: '♓', label: 'Peixes' }
        ];

        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            
            // Linha divisória
            const x1 = centerX + Math.cos(angle) * (radius - 50);
            const y1 = centerY + Math.sin(angle) * (radius - 50);
            const x2 = centerX + Math.cos(angle) * radius;
            const y2 = centerY + Math.sin(angle) * radius;
            
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            // Símbolo do signo
            const signoAngle = (i * 30 + 15 - 90) * (Math.PI / 180);
            const signoX = centerX + Math.cos(signoAngle) * (radius + 40);
            const signoY = centerY + Math.sin(signoAngle) * (radius + 40);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(signos[i].nome, signoX, signoY);
        }
    }

    /**
     * Desenha os planetas nas posições corretas
     */
    desenharPlanetas(planetas) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = 300;

        const planetasConfig = {
            'Sol': { emoji: '☉', cor: '#FFD700', tamanho: 20 },
            'Lua': { emoji: '☽', cor: '#C0C0C0', tamanho: 18 },
            'Mercúrio': { emoji: '☿', cor: '#B8B8B8', tamanho: 12 },
            'Vênus': { emoji: '♀', cor: '#FFC0CB', tamanho: 16 },
            'Marte': { emoji: '♂', cor: '#FF4500', tamanho: 14 },
            'Júpiter': { emoji: '♃', cor: '#FFA500', tamanho: 18 },
            'Saturno': { emoji: '♄', cor: '#DAA520', tamanho: 16 },
            'Urano': { emoji: '♅', cor: '#00CED1', tamanho: 14 },
            'Netuno': { emoji: '♆', cor: '#4169E1', tamanho: 14 },
            'Plutão': { emoji: '♇', cor: '#8B4513', tamanho: 10 }
        };

        Object.entries(planetas).forEach(([nome, info]) => {
            const config = planetasConfig[nome] || { emoji: '●', cor: '#ffffff', tamanho: 12 };
            
            // Converter grau para radianos (0° = Áries, no topo)
            const angle = (info.grau - 90) * (Math.PI / 180);
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // Desenhar planeta
            this.ctx.fillStyle = config.cor;
            this.ctx.font = `${config.tamanho}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(config.emoji, x, y);

            // Desenhar nome do planeta
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(nome, x, y + 25);

            // Desenhar grau
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillText(`${info.grau.toFixed(1)}°`, x, y + 38);
        });
    }

    /**
     * Desenha informações principais (nome, data, signos)
     */
    desenharInformacoes(dados) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Retângulo central com fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(centerX - 150, centerY - 100, 300, 200);

        // Borda do retângulo
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(centerX - 150, centerY - 100, 300, 200);

        // Nome
        if (dados.nome) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(dados.nome, centerX, centerY - 60);
        }

        // Data de nascimento
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(
            `${dados.dia}/${dados.mes}/${dados.ano}`,
            centerX,
            centerY - 30
        );

        // Hora
        this.ctx.fillText(
            `${String(dados.hora).padStart(2, '0')}:${String(dados.minutos).padStart(2, '0')}`,
            centerX,
            centerY - 10
        );

        // Sol, Lua, Ascendente
        const signos = dados.signosSolLuaAsc || 'Sol -, Lua -, Asc -';
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('☉ ☽ ↑', centerX, centerY + 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(signos, centerX, centerY + 45);

        // Local
        if (dados.cidade) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(dados.cidade, centerX, centerY + 70);
        }
    }

    /**
     * Desenha assinatura do app
     */
    desenharAssinatura() {
        // Logo no topo
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌙 Portal Astrológico', this.width / 2, 70);

        // Rodapé
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(
            'Criado em ' + new Date().toLocaleDateString('pt-BR'),
            this.width / 2,
            this.height - 30
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
                // Converter data URL para blob
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
                console.log('Erro ao compartilhar:', error);
                return false;
            }
        }
        return false;
    }
}

// Exportar para uso global
window.MapaAstralImageGenerator = MapaAstralImageGenerator;
