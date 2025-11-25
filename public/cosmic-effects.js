// ============================================
// 🌌 COSMIC EFFECTS - Efeitos Cósmicos Globais
// ============================================

class CosmicEffects {
    constructor() {
        this.particles = [];
        this.init();
    }

    init() {
        this.createParticlesContainer();
        this.startParticleSystem();
        this.addCosmicGlow();
        this.initScrollEffects();
    }

    createParticlesContainer() {
        if (document.querySelector('.cosmic-particles')) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'cosmic-particles';
        document.body.appendChild(particlesContainer);
        this.particlesContainer = particlesContainer;
    }

    startParticleSystem() {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 4 + 4;
            const delay = Math.random() * 2;
            
            particle.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${animationDuration}s;
                animation-delay: ${delay}s;
            `;
            
            this.particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (animationDuration + delay) * 1000);
        };

        // Create particles periodically
        setInterval(createParticle, 300);
        
        // Create initial burst
        for (let i = 0; i < 10; i++) {
            setTimeout(createParticle, i * 100);
        }
    }

    addCosmicGlow() {
        // Add glow effects to important elements
        const addGlowToElements = () => {
            const selectors = [
                '.btn-modern',
                '.btn-cosmic',
                '.btn-primary',
                '.card',
                '.modern-card',
                '.form-section',
                '.stat-card',
                '.chart-card'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!el.classList.contains('cosmic-enhanced')) {
                        el.classList.add('cosmic-enhanced');
                        this.enhanceElement(el);
                    }
                });
            });
        };

        // Initial enhancement
        setTimeout(addGlowToElements, 500);
        
        // Re-enhance on DOM changes
        const observer = new MutationObserver(addGlowToElements);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceElement(element) {
        // Add cosmic pulse on hover
        element.addEventListener('mouseenter', () => {
            element.style.animation = 'cosmicPulse 0.6s ease-out';
        });

        element.addEventListener('mouseleave', () => {
            setTimeout(() => {
                element.style.animation = '';
            }, 600);
        });

        // Add cosmic border animation for special elements
        if (element.classList.contains('btn-primary') || 
            element.classList.contains('btn-cosmic')) {
            this.addCosmicBorder(element);
        }
    }

    addCosmicBorder(element) {
        const border = document.createElement('div');
        border.className = 'cosmic-border';
        border.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: inherit;
            background: linear-gradient(45deg, 
                var(--cosmic-violet), 
                var(--starlight-gold), 
                var(--nebula-purple),
                var(--cosmic-violet)
            );
            background-size: 300% 300%;
            animation: cosmicBorderFlow 3s ease infinite;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        if (element.style.position !== 'absolute' && 
            element.style.position !== 'relative') {
            element.style.position = 'relative';
        }

        element.appendChild(border);

        element.addEventListener('mouseenter', () => {
            border.style.opacity = '0.7';
        });

        element.addEventListener('mouseleave', () => {
            border.style.opacity = '0';
        });
    }

    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('cosmic-visible');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animateOnScroll = () => {
            const elements = document.querySelectorAll(`
                .card, .modern-card, .feature-card, 
                .form-section, .stat-card, .chart-card,
                .mapa-card, .planeta-card
            `);
            
            elements.forEach(el => {
                if (!el.classList.contains('cosmic-observed')) {
                    el.classList.add('cosmic-observed');
                    observer.observe(el);
                }
            });
        };

        setTimeout(animateOnScroll, 100);
        
        // Re-observe new elements
        const mutationObserver = new MutationObserver(animateOnScroll);
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Shooting star effect
    createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight * 0.5;
        
        star.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: 2px;
            height: 2px;
            background: var(--starlight-gold);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--starlight-gold);
            z-index: 1000;
            pointer-events: none;
        `;

        document.body.appendChild(star);

        // Animate shooting star
        star.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 0 
            },
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1,
                offset: 0.1
            },
            { 
                transform: `translate(${window.innerWidth * 0.3}px, ${window.innerHeight * 0.3}px) scale(0)`,
                opacity: 0 
            }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            star.remove();
        };
    }

    // Constellation effect
    createConstellation() {
        const constellation = document.createElement('div');
        constellation.className = 'constellation';
        constellation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        // Create constellation points
        for (let i = 0; i < 5; i++) {
            const point = document.createElement('div');
            point.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: var(--starlight-gold);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle 2s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            constellation.appendChild(point);
        }

        document.body.appendChild(constellation);

        // Remove after animation
        setTimeout(() => {
            constellation.remove();
        }, 10000);
    }
}

// CSS Animations
const cosmicCSS = `
@keyframes cosmicPulse {
    0%, 100% {
        box-shadow: var(--shadow-glow);
    }
    50% {
        box-shadow: var(--shadow-glow), var(--starlight-shadow);
        transform: scale(1.02);
    }
}

@keyframes cosmicBorderFlow {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

@keyframes twinkle {
    0%, 100% {
        opacity: 0.3;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
    }
}

.cosmic-observed {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-visible {
    opacity: 1;
    transform: translateY(0);
}

.cosmic-enhanced {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = cosmicCSS;
document.head.appendChild(styleSheet);

// Initialize cosmic effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cosmicEffects = new CosmicEffects();
    
    // Periodic shooting stars
    setInterval(() => {
        if (Math.random() < 0.3) {
            cosmicEffects.createShootingStar();
        }
    }, 5000);
    
    // Periodic constellations
    setInterval(() => {
        if (Math.random() < 0.2) {
            cosmicEffects.createConstellation();
        }
    }, 15000);
});

// Export for use in other scripts
window.CosmicEffects = CosmicEffects;