class ModernLoading {
    constructor() {
        this.loadingElement = null;
    }

    show(message = 'Carregando...', progress = 0) {
        this.hide(); // Remove loading anterior se existir

        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'modern-loading-overlay';
        this.loadingElement.innerHTML = `
            <div class="modern-loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <h3 class="loading-title">${message}</h3>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}%</span>
                </div>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        // Estilos inline para garantir que funcione
        this.loadingElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        // Adicionar estilos CSS se não existirem
        if (!document.getElementById('modern-loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modern-loading-styles';
            styles.textContent = `
                .modern-loading-content {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                }

                .loading-spinner {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                }

                .spinner-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 4px solid transparent;
                    border-radius: 50%;
                    animation: spin 2s linear infinite;
                }

                .spinner-ring:nth-child(1) {
                    border-top-color: #667eea;
                    animation-delay: 0s;
                }

                .spinner-ring:nth-child(2) {
                    border-right-color: #764ba2;
                    animation-delay: 0.3s;
                }

                .spinner-ring:nth-child(3) {
                    border-bottom-color: #f093fb;
                    animation-delay: 0.6s;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-title {
                    color: #333;
                    margin-bottom: 20px;
                    font-size: 18px;
                    font-weight: 600;
                }

                .loading-progress {
                    margin: 20px 0;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .progress-bar {
                    flex: 1;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    position: relative;
                }

                .progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .progress-text {
                    font-weight: 600;
                    color: #667eea;
                    min-width: 40px;
                }

                .loading-dots {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 20px;
                }

                .loading-dots span {
                    width: 8px;
                    height: 8px;
                    background: #667eea;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }

                .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
                .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
                .loading-dots span:nth-child(3) { animation-delay: 0s; }

                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(this.loadingElement);
    }

    updateProgress(progress, message) {
        if (!this.loadingElement) return;

        const progressFill = this.loadingElement.querySelector('.progress-fill');
        const progressText = this.loadingElement.querySelector('.progress-text');
        const loadingTitle = this.loadingElement.querySelector('.loading-title');

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}%`;
        if (message && loadingTitle) loadingTitle.textContent = message;
    }

    hide() {
        if (this.loadingElement) {
            this.loadingElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (this.loadingElement && this.loadingElement.parentNode) {
                    this.loadingElement.parentNode.removeChild(this.loadingElement);
                }
                this.loadingElement = null;
            }, 300);
        }
    }

    // Simulação de progresso automático
    showWithAutoProgress(message = 'Carregando...', duration = 3000) {
        this.show(message, 0);
        
        let progress = 0;
        const interval = 50;
        const increment = 100 / (duration / interval);
        
        const progressInterval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            this.updateProgress(Math.round(progress));
        }, interval);

        return progressInterval;
    }
}

// Adicionar fadeOut animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(fadeOutStyle);

// Instância global
window.modernLoading = new ModernLoading();