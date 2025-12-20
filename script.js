// DATABASE ESEMPIO (Puoi aggiungere fino a 50 domande per array)
const quizData = {
    Python: [
        { q: "Come si definisce una funzione in Python?", options: ["function x()", "def x():", "void x()"], correct: 1, exp: "In Python si usa 'def' seguito dal nome e i due punti.", code: "def mia_funzione():\n    print('Ciao')" },
        { q: "Quale di questi è un dizionario?", options: ["[]", "{}", "()"], correct: 1, exp: "Le parentesi graffe definiscono i dizionari (chiave-valore).", code: "mio_dict = {'id': 1}" }
    ],
    JavaScript: [
        { q: "Quale keyword dichiara una costante?", options: ["let", "var", "const"], correct: 2, exp: "const crea una variabile che non può essere riassegnata.", code: "const PI = 3.14;" }
    ],
    MySQL: [
        { q: "Quale comando estrae dati?", options: ["GET", "SELECT", "EXTRACT"], correct: 1, exp: "SELECT è l'operazione base per interrogare tabelle.", code: "SELECT * FROM utenti;" }
    ],
    Java: [
        { q: "Tipo di dato per un numero intero?", options: ["int", "String", "boolean"], correct: 0, exp: "int è il tipo primitivo per i numeri interi.", code: "int x = 10;" }
    ],
    HTML: [
        { q: "Tag per il titolo più importante?", options: ["<p>", "<h6>", "<h1>"], correct: 2, exp: "h1 definisce l'intestazione di primo livello.", code: "<h1>Titolo Pagina</h1>" }
    ]
};

let state = {
    userMode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    toStudy: JSON.parse(localStorage.getItem('devToStudy')) || [],
    currentLang: null,
    currentLvl: null,
    currentQuestions: [],
    idx: 0
};

function init() {
    updateReviewIcon();
    if (!state.userMode) showAuth(); else showHome();
}

// --- NAVIGAZIONE ---
function setAuth(mode) {
    state.userMode = mode;
    localStorage.setItem('devUserMode', mode);
    showHome();
}

function showHome() {
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let html = `<div class="lang-grid">`;
    ["Python", "JavaScript", "MySQL", "Java", "HTML"].forEach(lang => {
        html += `
            <div class="lang-item" onclick="showLevels('${lang}')">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${lang.toLowerCase()}/${lang.toLowerCase()}-original.svg">
                <div style="font-weight:600; font-size:14px;">${lang}</div>
            </div>`;
    });
    html += `</div>`;
    area.innerHTML = html;
}

function showLevels(langId) {
    state.currentLang = langId;
    document.getElementById('app-title').innerText = langId;
    const completed = state.progress[langId] || 0;
    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent);">← Indietro</button>`;
    
    for(let i=1; i<=5; i++) {
        const isLocked = i === 5 && completed < 4;
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startQuiz('${langId}', ${i})">Livello ${i} ${isLocked ? '🔒' : (i <= completed ? '✅' : '🚀')}</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// --- LOGICA QUIZ ---
function startQuiz(langId, lvl) {
    state.currentLvl = lvl;
    state.idx = 0;
    // Peschiamo 10 domande casuali dal database (qui ne usiamo quante ce ne sono)
    state.currentQuestions = [...quizData[langId]].sort(() => 0.5 - Math.random()).slice(0, 10);
    renderQuestion();
}

function renderQuestion() {
    const q = state.currentQuestions[state.idx];
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="badge-cat">${state.currentLang} • LVL ${state.currentLvl}</div>
        <div class="question-text">${q.q}</div>
        ${q.options.map((opt, i) => `<button class="btn-apple" onclick="checkAnswer(${i})">${opt}</button>`).join('')}
        <button class="btn-danger" onclick="addToStudy()">Non l'ho studiato</button>
    `;
}

function checkAnswer(selected) {
    const q = state.currentQuestions[state.idx];
    const isCorrect = selected === q.correct;
    
    if(!isCorrect) addToStudy(false);

    const area = document.getElementById('content-area');
    area.innerHTML = `
        <h2 class="${isCorrect ? 'success' : 'error'}">${isCorrect ? 'Corretto!' : 'Sbagliato'}</h2>
        <div class="explanation-card">
            <strong>Spiegazione:</strong><br>${q.exp}
        </div>
        <div class="code-block">${q.code}</div>
        <button class="btn-apple btn-primary" style="margin-top:20px" onclick="nextStep()">Continua</button>
    `;
}

function nextStep() {
    state.idx++;
    if(state.idx < state.currentQuestions.length) {
        renderQuestion();
    } else {
        completeLevel();
    }
}

function completeLevel() {
    if(state.userMode === 'user' && state.currentLvl < 5) {
        state.progress[state.currentLang] = Math.max(state.progress[state.currentLang] || 0, state.currentLvl);
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
    }
    showLevels(state.currentLang);
}

// --- AREA RIPASSO ---
function addToStudy(isNew = true) {
    const q = state.currentQuestions[state.idx];
    // Evita duplicati nel ripasso
    if(!state.toStudy.some(item => item.q === q.q)) {
        state.toStudy.push(q);
        localStorage.setItem('devToStudy', JSON.stringify(state.toStudy));
        updateReviewIcon();
    }
    if(isNew) nextStep(); // Se clicca "Non studiato" passa oltre
}

function updateReviewIcon() {
    const btn = document.getElementById('btn-review');
    if(state.toStudy.length > 0) btn.classList.remove('hidden');
    else btn.classList.add('hidden');
}

function showReviewSession() {
    document.getElementById('app-title').innerText = "Area Ripasso";
    const area = document.getElementById('content-area');
    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent);">← Esci</button>
                <p style="margin-bottom:20px; opacity:0.7;">Qui trovi gli argomenti che hai saltato o sbagliato:</p>`;
    
    state.toStudy.forEach((item, i) => {
        html += `
            <div class="review-item">
                <div class="badge-cat">Argomento Quiz</div>
                <div style="font-weight:600; margin:5px 0;">${item.q}</div>
                <div class="explanation-card" style="font-size:14px;">${item.exp}</div>
                <div class="code-block">${item.code}</div>
                <button class="btn-danger" style="text-align:left; padding:0;" onclick="removeFromReview(${i})">Rimosso (L'ho capito)</button>
            </div>`;
    });
    area.innerHTML = html;
}

function removeFromReview(index) {
    state.toStudy.splice(index, 1);
    localStorage.setItem('devToStudy', JSON.stringify(state.toStudy));
    if(state.toStudy.length === 0) showHome(); else showReviewSession();
    updateReviewIcon();
}

// --- TEMA ---
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

window.onload = init;
