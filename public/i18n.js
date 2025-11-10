// Sistema de Internacionalização (i18n)

class I18n {
    constructor() {
        this.translations = null;
        this.currentLang = this.getStoredLanguage() || null;
        this.defaultLang = 'pt';
    }

    // Carregar traduções do arquivo JSON
    async loadTranslations() {
        try {
            const response = await fetch('/translations.json');
            this.translations = await response.json();
            return true;
        } catch (error) {
            console.error('Erro ao carregar traduções:', error);
            return false;
        }
    }

    // Obter idioma armazenado no localStorage
    getStoredLanguage() {
        return localStorage.getItem('language');
    }

    // Salvar idioma no localStorage
    setStoredLanguage(lang) {
        localStorage.setItem('language', lang);
        this.currentLang = lang;
    }

    // Verificar se já escolheu o idioma
    hasChosenLanguage() {
        return this.getStoredLanguage() !== null;
    }

    // Obter tradução por chave
    t(key) {
        if (!this.translations || !this.currentLang) {
            return key;
        }

        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key;
            }
        }

        return value;
    }

    // Traduzir toda a página
    translatePage() {
        if (!this.currentLang) return;

        // Traduzir elementos com atributo data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Traduzir placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Traduzir valores de input
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            element.value = this.t(key);
        });

        // Traduzir títulos (title attribute)
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }

    // Mostrar popup de seleção de idioma
    showLanguagePopup() {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.id = 'language-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s;
        `;

        // Criar popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            text-align: center;
            animation: slideUp 0.3s;
        `;

        popup.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .lang-title {
                    font-size: 2em;
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .lang-subtitle {
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 0.95em;
                }
                .lang-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }
                .lang-btn {
                    flex: 1;
                    padding: 20px;
                    border: 3px solid #667eea;
                    border-radius: 15px;
                    background: white;
                    color: #667eea;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .lang-btn:hover {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }
                .lang-btn .flag {
                    font-size: 2.5em;
                }
                .lang-btn .text {
                    font-size: 1em;
                }
            </style>
            <div class="lang-title">🌍 Choose your language / Escolha seu idioma</div>
            <div class="lang-subtitle">Select your preferred language / Selecione seu idioma preferido</div>
            <div class="lang-buttons">
                <button class="lang-btn" data-lang="pt">
                    <span class="flag">🇧🇷</span>
                    <span class="text">Português</span>
                </button>
                <button class="lang-btn" data-lang="en">
                    <span class="flag">🇺🇸</span>
                    <span class="text">English</span>
                </button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Adicionar event listeners nos botões
        popup.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
                this.closeLanguagePopup();
            });
        });

        // Evitar fechar ao clicar no popup
        popup.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Fechar popup de idioma
    closeLanguagePopup() {
        const overlay = document.getElementById('language-popup-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    // Definir idioma e traduzir página
    setLanguage(lang) {
        this.setStoredLanguage(lang);
        this.translatePage();
        
        // Disparar evento customizado para outras partes da aplicação
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    // Inicializar sistema de idiomas
    async init() {
        // Carregar traduções
        const loaded = await this.loadTranslations();
        if (!loaded) {
            console.error('Falha ao carregar traduções');
            return;
        }

        // Se não escolheu idioma, mostrar popup
        if (!this.hasChosenLanguage()) {
            this.showLanguagePopup();
        } else {
            // Se já escolheu, aplicar o idioma
            this.translatePage();
        }
    }

    // Criar botão de troca de idioma
    createLanguageToggle() {
        const toggle = document.createElement('div');
        toggle.id = 'language-toggle';
        toggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            border-radius: 10px;
            padding: 10px 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            cursor: pointer;
            font-weight: bold;
            color: #667eea;
            transition: all 0.3s;
        `;

        const currentFlag = this.currentLang === 'pt' ? '🇧🇷' : '🇺🇸';
        const currentText = this.currentLang === 'pt' ? 'PT' : 'EN';
        
        toggle.innerHTML = `${currentFlag} ${currentText}`;

        toggle.addEventListener('click', () => {
            const newLang = this.currentLang === 'pt' ? 'en' : 'pt';
            this.setLanguage(newLang);
            
            // Atualizar o botão
            const newFlag = newLang === 'pt' ? '🇧🇷' : '🇺🇸';
            const newText = newLang === 'pt' ? 'PT' : 'EN';
            toggle.innerHTML = `${newFlag} ${newText}`;
        });

        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
            toggle.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
        });

        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
            toggle.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });

        document.body.appendChild(toggle);
    }
}

// Adicionar animação de fadeOut ao CSS global
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Criar instância global
const i18n = new I18n();

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        i18n.init();
        i18n.createLanguageToggle();
    });
} else {
    i18n.init();
    i18n.createLanguageToggle();
}

// Exportar para uso em outros scripts
window.i18n = i18n;
