// Tarot Results Logic
const tarotCards = {
    clarity: {
        name: "O Mago", nameEn: "The Magician",
        emoji: "🎩", meaning: "Manifestação e Poder", meaningEn: "Manifestation and Power",
        description: "O Mago representa sua capacidade de transformar sonhos em realidade. Você tem todas as ferramentas necessárias para criar a vida que deseja.",
        descriptionEn: "The Magician represents your ability to transform dreams into reality. You have all the tools needed to create the life you desire."
    },
    love: {
        name: "A Estrela", nameEn: "The Star",
        emoji: "⭐", meaning: "Esperança e Renovação", meaningEn: "Hope and Renewal",
        description: "A Estrela traz uma mensagem de esperança e cura no amor. Depois de tempos difíceis, a renovação está chegando.",
        descriptionEn: "The Star brings a message of hope and healing in love. After difficult times, renewal is coming."
    },
    success: {
        name: "O Sol", nameEn: "The Sun",
        emoji: "☀️", meaning: "Realização e Ação", meaningEn: "Achievement and Action",
        description: "Sucesso vem através da ação deliberada. O Sol mostra que você possui todas as habilidades necessárias.",
        descriptionEn: "Success comes through deliberate action. The Sun shows you possess all necessary skills."
    },
    peace: {
        name: "A Temperança", nameEn: "Temperance",
        emoji: "🕊️", meaning: "Serenidade e Fé", meaningEn: "Serenity and Faith",
        description: "A paz interior que você busca está ao seu alcance. A Temperança traz equilíbrio após a tempestade.",
        descriptionEn: "The inner peace you seek is within reach. Temperance brings balance after the storm."
    },
    hopeful: {
        name: "O Louco", nameEn: "The Fool",
        emoji: "🃏", meaning: "Novos Começos", meaningEn: "New Beginnings",
        description: "O Louco celebra sua atitude positiva em relação ao futuro. Novas aventuras o aguardam.",
        descriptionEn: "The Fool celebrates your positive attitude toward the future. New adventures await you."
    },
    anxious: {
        name: "A Lua", nameEn: "The Moon",
        emoji: "🌙", meaning: "Orientação e Proteção", meaningEn: "Guidance and Protection",
        description: "A ansiedade que você sente será transformada em sabedoria. A Lua ilumina seu caminho interior.",
        descriptionEn: "The anxiety you feel will be transformed into wisdom. The Moon illuminates your inner path."
    },
    confident: {
        name: "O Imperador", nameEn: "The Emperor",
        emoji: "👑", meaning: "Poder e Controle", meaningEn: "Power and Control",
        description: "Sua confiança é justificada. O Imperador confirma que você está no controle de seu destino.",
        descriptionEn: "Your confidence is justified. The Emperor confirms you are in control of your destiny."
    },
    curious: {
        name: "O Eremita", nameEn: "The Hermit",
        emoji: "🔦", meaning: "Aventura e Descoberta", meaningEn: "Adventure and Discovery",
        description: "Sua curiosidade é uma bênção. O Eremita encoraja você a explorar novos caminhos sem medo.",
        descriptionEn: "Your curiosity is a blessing. The Hermit encourages you to explore new paths without fear."
    },
    career: {
        name: "A Roda da Fortuna", nameEn: "Wheel of Fortune",
        emoji: "🎡", meaning: "Mudança e Oportunidade", meaningEn: "Change and Opportunity",
        description: "Grandes mudanças profissionais estão chegando. A Roda gira a seu favor.",
        descriptionEn: "Great professional changes are coming. The Wheel turns in your favor."
    },
    relationships: {
        name: "Os Amantes", nameEn: "The Lovers",
        emoji: "💕", meaning: "Conexão e Harmonia", meaningEn: "Connection and Harmony",
        description: "Seus relacionamentos florescerão. Os Amantes trazem harmonia e compreensão mútua.",
        descriptionEn: "Your relationships will flourish. The Lovers bring harmony and mutual understanding."
    },
    health: {
        name: "A Força", nameEn: "Strength",
        emoji: "💪", meaning: "Vitalidade e Cura", meaningEn: "Vitality and Healing",
        description: "Sua força interior é sua maior medicina. A cura vem de dentro para fora.",
        descriptionEn: "Your inner strength is your greatest medicine. Healing comes from within."
    },
    spiritual: {
        name: "O Hierofante", nameEn: "The Hierophant",
        emoji: "🙏", meaning: "Sabedoria Espiritual", meaningEn: "Spiritual Wisdom",
        description: "Seu crescimento espiritual está acelerado. O Hierofante guia sua jornada sagrada.",
        descriptionEn: "Your spiritual growth is accelerated. The Hierophant guides your sacred journey."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const answers = JSON.parse(urlParams.get('answers') || '{}');
    const personalInfo = JSON.parse(urlParams.get('personalInfo') || '{}');
    
    if (Object.keys(answers).length === 0) {
        window.location.href = 'tarot-quiz.html';
        return;
    }
    
    displayResults(answers, personalInfo);
});

function displayResults(answers, personalInfo) {
    const lang = window.i18n?.currentLang || 'pt';
    
    // Update header
    const title = document.getElementById('resultsTitle');
    const subtitle = document.getElementById('resultsSubtitle');
    
    if (personalInfo.name) {
        title.textContent = lang === 'en' ? 
            `${personalInfo.name}, Your Cards Have Been Revealed` :
            `${personalInfo.name}, Suas Cartas Foram Reveladas`;
    } else {
        title.textContent = lang === 'en' ? 
            'Your Cards Have Been Revealed' :
            'Suas Cartas Foram Reveladas';
    }
    
    subtitle.textContent = lang === 'en' ?
        'The cosmos heard your words and revealed these messages especially for you' :
        'O cosmos ouviu suas palavras e revelou estas mensagens especialmente para você';
    
    // Select cards based on answers (skip personal questions 0,1,2)
    const selectedCards = [
        tarotCards[answers[3]] || tarotCards.clarity,
        tarotCards[answers[4]] || tarotCards.hopeful,
        tarotCards[answers[5]] || tarotCards.success
    ];
    
    // Display cards
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    
    selectedCards.forEach((card, index) => {
        const cardElement = createCardElement(card, index + 1, lang);
        cardsGrid.appendChild(cardElement);
    });
    
    // Show personal message
    if (personalInfo.name) {
        showPersonalMessage(personalInfo, lang);
    }
}

function createCardElement(card, cardNumber, lang) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'tarot-card';
    
    cardDiv.innerHTML = `
        <div class="card-image">
            ${card.emoji}
        </div>
        
        <div class="card-number">
            ${lang === 'en' ? `Card ${cardNumber} of 3` : `Carta ${cardNumber} de 3`}
        </div>
        
        <h2 class="card-name">
            ${lang === 'en' ? card.nameEn : card.name}
        </h2>
        
        <div class="card-meaning">
            <span class="meaning-badge">
                ${lang === 'en' ? card.meaningEn : card.meaning}
            </span>
        </div>
        
        <p class="card-description">
            ${lang === 'en' ? card.descriptionEn : card.description}
        </p>
    `;
    
    return cardDiv;
}

function showPersonalMessage(personalInfo, lang) {
    const messageDiv = document.getElementById('personalMessage');
    const textElement = document.getElementById('personalText');
    
    const message = lang === 'en' ?
        `${personalInfo.name}, the cards have revealed deep messages about your journey. Remember that you have the power to shape your destiny. The stars illuminate the path, but you choose how to walk it.` :
        `${personalInfo.name}, as cartas revelaram mensagens profundas sobre sua jornada. Lembre-se de que você tem o poder de moldar seu destino. As estrelas iluminam o caminho, mas você escolhe como caminhar.`;
    
    textElement.innerHTML = message;
    messageDiv.style.display = 'block';
}

function newReading() {
    window.location.href = 'tarot-quiz.html';
}

function goHome() {
    window.location.href = 'choice.html';
}