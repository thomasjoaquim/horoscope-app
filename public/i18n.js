class I18n {
    constructor() {
        this.translations = null;
        this.currentLang = null;
        this.defaultLang = 'pt';
        this.languageChosen = false;
    }

    async loadTranslations() {
        try {
            const response = await fetch('/translations.json');
            this.translations = await response.json();
            return true;
        } catch (error) {
            console.error('Erro ao carregar traduções:', error);
            this.translations = {
                pt: { app: { title: 'Aplicação', subtitle: 'Bem-vindo' } },
                en: { app: { title: 'Application', subtitle: 'Welcome' } }
            };
            return false;
        }
    }

    getStoredLanguage() {
        return localStorage.getItem('selectedLanguage');
    }

    setStoredLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);
        this.currentLang = lang;
        this.languageChosen = true;
    }

    hasChosenLanguage() {
        return localStorage.getItem('selectedLanguage') !== null;
    }

    t(key, params = {}) {
        if (!this.translations || !this.currentLang) return key;

        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                value = this.translations[this.defaultLang];
                for (const k2 of keys) {
                    if (value && value[k2] !== undefined) {
                        value = value[k2];
                    } else {
                        return key;
                    }
                }
                break;
            }
        }

        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }

        return value;
    }

    translatePage() {
        if (!this.currentLang) return;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = this.getDataParams(element);
            element.textContent = this.t(key, params);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            element.value = this.t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        document.documentElement.setAttribute('lang', this.currentLang);
    }

    getDataParams(element) {
        const params = {};
        const attributes = element.attributes;
        
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.name.startsWith('data-i18n-param-')) {
                const paramName = attr.name.replace('data-i18n-param-', '');
                params[paramName] = attr.value;
            }
        }
        
        return params;
    }

    showLanguagePopup() {
        if (document.getElementById('language-popup-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'language-popup-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex;
            justify-content: center; align-items: center; z-index: 9999;
        `;

        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white; border-radius: 20px; padding: 40px;
            max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            text-align: center;
        `;

        popup.innerHTML = `
            <style>
                .lang-title { font-size: 2em; color: #667eea; margin-bottom: 10px; }
                .lang-subtitle { color: #666; margin-bottom: 30px; }
                .lang-buttons { display: flex; gap: 15px; justify-content: center; }
                .lang-btn {
                    flex: 1; padding: 20px; border: 3px solid #667eea;
                    border-radius: 15px; background: white; color: #667eea;
                    font-size: 1.2em; font-weight: bold; cursor: pointer;
                    transition: all 0.3s; display: flex; flex-direction: column;
                    align-items: center; gap: 10px;
                }
                .lang-btn:hover {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; transform: translateY(-5px);
                }
                .lang-btn .flag { font-size: 2.5em; }
            </style>
            <div class="lang-title">🌍 Choose your language / Escolha seu idioma</div>
            <div class="lang-subtitle">Select your preferred language / Selecione seu idioma preferido</div>
            <div class="lang-buttons">
                <button class="lang-btn" data-lang="pt">
                    <span class="flag">🇧🇷</span>
                    <span>Português</span>
                </button>
                <button class="lang-btn" data-lang="en">
                    <span class="flag">🇺🇸</span>
                    <span>English</span>
                </button>
            </div>
        `;

        popup.addEventListener('click', (e) => {
            const langBtn = e.target.closest('.lang-btn');
            if (langBtn) {
                const selectedLang = langBtn.getAttribute('data-lang');
                this.setLanguage(selectedLang);
                this.hideLanguagePopup();
            }
        });

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    hideLanguagePopup() {
        const overlay = document.getElementById('language-popup-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    setLanguage(lang) {
        this.setStoredLanguage(lang);
        this.translatePage();
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getAvailableLanguages() {
        return this.translations ? Object.keys(this.translations) : [];
    }
}

// Instância global
const i18n = new I18n();

// Inicialização automática
document.addEventListener('DOMContentLoaded', async () => {
    await i18n.loadTranslations();
    
    if (!i18n.hasChosenLanguage()) {
        i18n.showLanguagePopup();
    } else {
        const savedLang = i18n.getStoredLanguage();
        i18n.currentLang = savedLang;
        i18n.translatePage();
    }
});