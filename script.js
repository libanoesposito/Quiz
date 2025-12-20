// Database di test (20 domande per permettere lo shuffle di 15)
const db = {
    Python: Array.from({length: 20}, (_, i) => ({
        q: `Domanda Python #${i+1}: Qual è il risultato di ${i} + 1?`,
        options: [i+1, i+2, i+3],
        correct: 0,
        exp: "Operazione aritmetica base in Python.",
        code: `print(${i} + 1) # Risultato: ${i+1}`
    })),
    JavaScript: [{q: "Esempio JS", options: ["A","B"], correct: 0, exp: "...", code: ""}],
    MySQL: [{q: "Esempio MySQL", options: ["A","B"], correct: 0, exp: "...", code: ""}],
    Java: [{q: "Esempio Java", options: ["A","B"], correct: 0, exp: "...", code: ""}],
    HTML: [{q: "Esempio HTML", options: ["A","B"], correct: 0, exp: "...", code: ""}]
};

let user = { 
    id: localStorage.getItem('devUserId'), 
    mode: localStorage.getItem('devUserMode'), 
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    toStudy: JSON.parse(localStorage.getItem('devToStudy')) || []
};

let currentQuiz = { lang: "", lvl: 0, questions: [], idx: 0 };

function init() {
    setupIdleTheme();
    if (!user.mode) showAuth(); else showHome();
    updateReviewIcon();
}

// --- AUTH (CENTRATURA CORRETTA) ---
function showAuth() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <h2 style="font-size: 28px; margin-bottom: 10px;">Benvenuto</h2>
            <p style="opacity: 0.6; margin-bottom: 30px;">Scegli come accedere</p>
            <button class="btn-apple btn-primary" onclick="setupUser()">Accedi come Utente</button>
            <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
        </div>
    `;
}

function setupUser() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <h3>Crea PIN Univoco</h3>
            <input type="password" id="pin-input" class="pin-input" maxlength="4" placeholder="••••">
            <button class="btn-apple btn-primary" onclick="validatePin()">Salva e Continua</button>
            <button class="btn-apple" onclick="showAuth()" style="background:none;">Annulla</button>
        </div>
    `;
}

function validatePin() {
    const pin = document.getElementById('pin-input').value;
    const forbidden = ["1234","0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"];
    if(pin.length < 4 || forbidden.includes(pin)) {
        alert("PIN non valido o troppo semplice!"); return;
    }
    user.id = pin; user.mode = 'user';
    localStorage.setItem('devUserId', pin);
    localStorage.setItem('devUserMode', 'user');
    showHome();
}

function setGuest() {
    user.mode = 'guest';
    localStorage.setItem('devUserMode', 'guest');
    showHome();
}

// --- HOME & PROGRESS CARD ---
function showHome() {
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let html = "";

    if(user.mode === 'user') {
        const total = Object.values(user.progress).reduce((a,b) => a+b, 0);
        html += `<div class="progress-card">
            <small style="opacity:0.8; font-weight:700;">ID UTENTE: ${user.id}</small>
            <div style="font-size:22px; font-weight:800; margin-top:5px;">Progresso: ${total}/20 Livelli</div>
        </div>`;
    }

    html += `<div class="lang-grid">` + Object.keys(db).map(l => `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${l.toLowerCase()}/${l.toLowerCase()}-original.svg" width="35">
            <div style="font-weight:600; font-size:14px; margin-top:8px;">${l}</div>
        </div>`).join('') + `</div>
        <button class="btn-apple" onclick="logout()" style="margin-top:auto; background:none; color:var(--accent); text-align:center;">Logout</button>`;
    area.innerHTML = html;
}

function showLevels(lang) {
    currentQuiz.lang = lang;
    document.getElementById('app-title').innerText = lang;
    const completed = user.progress[lang] || 0;
    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent); padding:0; margin-bottom:20px;">← Indietro</button>`;
    for(let i=1; i<=5; i++) {
        const locked = i === 5 && completed < 4;
        html += `<button class="btn-apple" ${locked ? 'disabled' : ''} onclick="startQuiz('${lang}', ${i})">
            Livello ${i} <span style="float:right">${locked ? '🔒' : (i <= completed ? '✅' : '🚀')}</span>
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// --- QUIZ LOGIC (15 DOMANDE) ---
function startQuiz(lang, lvl) {
    const all = db[lang];
    // Pesca 15 o il massimo disponibile
    currentQuiz = { 
        lang, lvl, idx: 0, 
        questions: [...all].sort(() => 0.5 - Math.random()).slice(0, 15) 
    };
    renderQuestion();
}

function renderQuestion() {
    const q = currentQuiz.questions[currentQuiz.idx];
    document.getElementById('content-area').innerHTML = `
        <p style="color:var(--accent); font-weight:800; font-size:12px;">DOMANDA ${currentQuiz.idx + 1}/15</p>
        <h2 style="margin: 15px 0 30px;">${q.q}</h2>
        ${q.options.map((opt, i) => `<button class="btn-apple" onclick="checkAnswer(${i})">${opt}</button>`).join('')}
    `;
}

function checkAnswer(i) {
    const q = currentQuiz.questions[currentQuiz.idx];
    const isCorrect = i === q.correct;
    document.getElementById('content-area').innerHTML = `
        <h2 style="color:${isCorrect ? '#34c759' : '#ff3b30'}">${isCorrect ? 'Ottimo!' : 'Sbagliato'}</h2>
        <div style="background:rgba(120,120,128,0.1); padding:20px; border-radius:20px; margin:20px 0;">
            <p>${q.exp}</p>
            ${q.code ? `<pre style="background:#000; color:#fff; padding:15px; border-radius:10px; font-size:13px; overflow-x:auto;">${q.code}</pre>` : ''}
        </div>
        <button class="btn-apple btn-primary" onclick="nextQuestion()">Continua</button>
    `;
}

function nextQuestion() {
    currentQuiz.idx++;
    if(currentQuiz.idx < currentQuiz.questions.length) renderQuestion();
    else finishLevel();
}

function finishLevel() {
    if(user.mode === 'user' && currentQuiz.lvl < 5) {
        user.progress[currentQuiz.lang] = Math.max(user.progress[currentQuiz.lang] || 0, currentQuiz.lvl);
        localStorage.setItem('devProgress', JSON.stringify(user.progress));
    }
    showLevels(currentQuiz.lang);
}

// --- UI UTILS ---
function setupIdleTheme() {
    let timer;
    const f = document.getElementById('theme-footer');
    const reset = () => { f.classList.remove('idle'); clearTimeout(timer); timer = setTimeout(()=>f.classList.add('idle'), 3000); };
    ['mousedown','mousemove','touchstart','scroll'].forEach(e => window.addEventListener(e, reset));
    reset();
}

function logout() { localStorage.clear(); location.reload(); }
function updateReviewIcon() { /* Logica icona 📚 */ }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');

window.onload = init;
