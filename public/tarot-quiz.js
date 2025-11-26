// Tarot Quiz Logic
const questions = [
    {
        id: 1,
        type: "personal",
        question: "Primeiro, me diga... qual é o seu nome?",
        questionEn: "First, tell me... what is your name?",
        placeholder: "Seu nome completo",
        placeholderEn: "Your full name",
        label: "Digite seu nome para que as cartas possam conhecê-lo melhor",
        labelEn: "Enter your name so the cards can know you better"
    },
    {
        id: 2,
        type: "personal",
        question: "Quantos anos você tem?",
        questionEn: "How old are you?",
        placeholder: "Sua idade",
        placeholderEn: "Your age",
        label: "Sua idade nos ajuda a entender sua jornada",
        labelEn: "Your age helps us understand your journey"
    },
    {
        id: 3,
        type: "personal",
        question: "De qual cidade você está nos consultando?",
        questionEn: "From which city are you consulting us?",
        placeholder: "Sua cidade",
        placeholderEn: "Your city",
        label: "De onde você está se conectando com o cosmos?",
        labelEn: "Where are you connecting with the cosmos from?"
    },
    {
        id: 4,
        type: "choice",
        question: "O que seu coração mais deseja neste momento da sua vida?",
        questionEn: "What does your heart desire most at this moment in your life?",
        options: [
            { text: "Encontrar meu verdadeiro propósito", textEn: "Find my true purpose", value: "clarity" },
            { text: "Viver um amor profundo e verdadeiro", textEn: "Live a deep and true love", value: "love" },
            { text: "Conquistar meus objetivos e prosperar", textEn: "Achieve my goals and prosper", value: "success" },
            { text: "Alcançar paz interior e equilíbrio", textEn: "Achieve inner peace and balance", value: "peace" }
        ]
    },
    {
        id: 5,
        type: "choice",
        question: "Quando você pensa no futuro, o que sente?",
        questionEn: "When you think about the future, what do you feel?",
        options: [
            { text: "Esperança e entusiasmo", textEn: "Hope and enthusiasm", value: "hopeful" },
            { text: "Incerteza e ansiedade", textEn: "Uncertainty and anxiety", value: "anxious" },
            { text: "Confiança e segurança", textEn: "Confidence and security", value: "confident" },
            { text: "Curiosidade e abertura", textEn: "Curiosity and openness", value: "curious" }
        ]
    },
    {
        id: 6,
        type: "choice",
        question: "Se você pudesse mudar algo na sua vida agora, seria em qual área?",
        questionEn: "If you could change something in your life now, what area would it be?",
        options: [
            { text: "Minha carreira e realização profissional", textEn: "My career and professional fulfillment", value: "career" },
            { text: "Meus relacionamentos e conexões", textEn: "My relationships and connections", value: "relationships" },
            { text: "Minha saúde física e mental", textEn: "My physical and mental health", value: "health" },
            { text: "Meu crescimento espiritual", textEn: "My spiritual growth", value: "spiritual" }
        ]
    },
    {
        id: 7,
        type: "choice",
        question: "Como você costuma enfrentar os obstáculos da vida?",
        questionEn: "How do you usually face life's obstacles?",
        options: [
            { text: "Com coragem, mesmo quando tenho medo", textEn: "With courage, even when I'm afraid", value: "courage" },
            { text: "Com calma, pensando antes de agir", textEn: "Calmly, thinking before acting", value: "patience" },
            { text: "Com criatividade, buscando novos caminhos", textEn: "With creativity, seeking new paths", value: "creativity" },
            { text: "Com intuição, ouvindo minha voz interior", textEn: "With intuition, listening to my inner voice", value: "wisdom" }
        ]
    },
    {
        id: 8,
        type: "choice",
        question: "O que te faz sentir realmente forte e poderoso?",
        questionEn: "What makes you feel truly strong and powerful?",
        options: [
            { text: "Superar minhas próprias emoções", textEn: "Overcoming my own emotions", value: "emotional" },
            { text: "Realizar e conquistar meus sonhos", textEn: "Achieving and conquering my dreams", value: "achievement" },
            { text: "Me conectar com algo maior que eu", textEn: "Connecting with something greater than me", value: "spiritual" },
            { text: "Ser livre para ser quem eu sou", textEn: "Being free to be who I am", value: "freedom" }
        ]
    }
];

let currentQuestion = 0;
let answers = {};
let personalInfo = { name: "", age: "", city: "" };

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    showQuestion();
});

function showQuestion() {
    const question = questions[currentQuestion];
    const lang = window.i18n?.currentLang || 'pt';
    
    // Update progress
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('questionCounter').textContent = 
        lang === 'en' ? `Question ${currentQuestion + 1} of ${questions.length}` : 
        `Pergunta ${currentQuestion + 1} de ${questions.length}`;
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
    
    // Update question text
    document.getElementById('questionText').textContent = 
        lang === 'en' ? question.questionEn : question.question;
    
    if (question.type === 'personal') {
        showPersonalInput(question, lang);
    } else {
        showChoiceOptions(question, lang);
    }
    
    updateNavigation();
}

function showPersonalInput(question, lang) {
    document.getElementById('personalInput').style.display = 'block';
    document.getElementById('choiceOptions').style.display = 'none';
    
    const label = document.getElementById('inputLabel');
    const field = document.getElementById('personalField');
    
    label.textContent = lang === 'en' ? question.labelEn : question.label;
    field.placeholder = lang === 'en' ? question.placeholderEn : question.placeholder;
    field.type = question.id === 2 ? 'number' : 'text';
    
    // Set current value
    if (question.id === 1) field.value = personalInfo.name;
    else if (question.id === 2) field.value = personalInfo.age;
    else if (question.id === 3) field.value = personalInfo.city;
    
    field.oninput = () => {
        const value = field.value.trim();
        if (question.id === 1) personalInfo.name = value;
        else if (question.id === 2) personalInfo.age = value;
        else if (question.id === 3) personalInfo.city = value;
        
        updateNavigation();
    };
    
    field.focus();
}

function showChoiceOptions(question, lang) {
    document.getElementById('personalInput').style.display = 'none';
    document.getElementById('choiceOptions').style.display = 'block';
    
    const container = document.getElementById('choiceOptions');
    container.innerHTML = '';
    
    question.options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'choice-option';
        div.textContent = lang === 'en' ? option.textEn : option.text;
        
        if (answers[currentQuestion] === option.value) {
            div.classList.add('selected');
        }
        
        div.onclick = () => {
            container.querySelectorAll('.choice-option').forEach(opt => 
                opt.classList.remove('selected'));
            div.classList.add('selected');
            answers[currentQuestion] = option.value;
            updateNavigation();
        };
        
        container.appendChild(div);
    });
}

function updateNavigation() {
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const lang = window.i18n?.currentLang || 'pt';
    
    // Update button text
    if (currentQuestion < questions.length - 1) {
        nextBtn.innerHTML = `<span>${lang === 'en' ? 'Next' : 'Próxima'}</span> →`;
    } else {
        nextBtn.innerHTML = `<span>${lang === 'en' ? 'See My Cards' : 'Ver Minhas Cartas'}</span> →`;
    }
    
    backBtn.innerHTML = `← <span>${lang === 'en' ? 'Back' : 'Voltar'}</span>`;
    
    // Enable/disable next button
    const hasAnswer = hasCurrentAnswer();
    nextBtn.disabled = !hasAnswer;
    
    // Show/hide back button
    backBtn.style.visibility = currentQuestion > 0 ? 'visible' : 'hidden';
}

function hasCurrentAnswer() {
    const question = questions[currentQuestion];
    
    if (question.type === 'personal') {
        if (question.id === 1) return personalInfo.name.trim().length > 0;
        if (question.id === 2) return personalInfo.age.trim().length > 0;
        if (question.id === 3) return personalInfo.city.trim().length > 0;
    }
    
    return answers[currentQuestion] !== undefined;
}

function goNext() {
    if (!hasCurrentAnswer()) return;
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        // Go to results
        const params = new URLSearchParams({
            answers: JSON.stringify(answers),
            personalInfo: JSON.stringify(personalInfo)
        });
        window.location.href = 'tarot-results.html?' + params.toString();
    }
}

function goBack() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    } else {
        window.location.href = 'choice.html';
    }
}