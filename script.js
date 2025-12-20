// Database robusto per il test
const quizDB = {
    Python: Array.from({length: 20}, (_, i) => ({
        q: `Esercizio Python #${i+1}: Qual è il valore di ${i} + ${i}?`,
        options: [i+i, i*i, i+1],
        correct: 0,
        exp: "Calcolo matematico base.",
        code: `print(${i} + ${i})`
    })),
    JavaScript: [{q: "Quale keyword usa JS?", options: ["let", "def", "var"], correct: 0, exp: "...", code: ""}],
    MySQL: [{q: "Comando Select?", options: ["SI", "NO"], correct: 0, exp: "...", code: ""}],
    Java: [{q: "Classe Main?", options: ["SI", "NO"], correct: 0, exp: "...", code: ""}],
    HTML: [{q: "Tag Title?", options: ["SI", "NO"], correct: 0, exp: "...", code: ""}]
};

let appState = {
    userId: localStorage.getItem('devUserId'),
    mode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    toStudy: JSON.parse(localStorage.getItem('devToStudy')) || []
};

let currentSession = { lang: "", lvl: 0, questions: [], idx: 0 };

// Inizializzazione sicura
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupThemeLogic();
});

function initApp() {
    if (!appState.mode) {
        showAuthScreen();
    } else {
        showHomeScreen();
    }
}

function showAuthScreen() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <h2 style="font-size: 28px; margin-bottom: 8px;">Benvenuto</h2>
            <p style="opacity: 0.5; margin-bottom: 35px;">Mastering Development</p>
            <button class="btn-apple btn-primary" onclick="uiSetupUser()">Accedi come Utente</button>
            <button class="btn-apple" onclick="uiSetGuest()">Modalità Guest</button>
        </div>
    `;
}

function uiSetupUser() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <h3>Inserisci il tuo PIN</h3>
            <input type="password" id="pin-field" class="pin-input" maxlength="4" placeholder="••••">
            <button class="btn-apple btn-primary" onclick="uiValidatePin()">Accedi</button>
            <button class="btn-apple" onclick="showAuthScreen()" style="background:none;">Indietro</button>
        </div>
    `;
}

function uiValidatePin() {
    const p = document.getElementById('pin-field').value;
    const blacklist = ["1234","0000","1111","2222","3333","4444","5555","6666","7777","8888","9999"];
    if(p.length < 4 || blacklist.includes(p)) {
        alert("PIN troppo semplice o incompleto."); return;
    }
    appState.userId = p; appState.mode = 'user';
    localStorage.setItem('devUserId', p);
    localStorage.setItem('devUserMode', 'user');
    showHomeScreen();
}

function uiSetGuest() {
    appState.mode = 'guest';
    localStorage.setItem('devUserMode', 'guest');
    showHomeScreen();
}

function showHomeScreen() {
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let htmlContent = "";

    if(appState.mode === 'user') {
        const totalLvl = Object.values(appState.progress).reduce((a,b) => a+b, 0);
        htmlContent += `
            <div class="progress-card">
                <small>ID UTENTE: ${appState.userId}</small>
                <div style="font-size:22px; font-weight:800; margin-top:4px;">Progresso: ${totalLvl}/20</div>
            </div>`;
    }

    htmlContent += `<div class="lang-grid">` + Object.keys(quizDB).map(lang => `
        <div class="lang-item" onclick="showLevelsScreen('${lang}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${lang.toLowerCase()}/${lang.toLowerCase()}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="font-weight:600; font-size:14px; margin-top:8px;">${lang}</div>
        </div>`).join('') + `</div>
        <button class="btn-apple" onclick="uiLogout()" style="margin-top:auto; background:none; color:var(--accent); font-weight:700;">LOGOUT</button>`;
    
    area.innerHTML = htmlContent;
}

function showLevelsScreen(lang) {
    currentSession.lang = lang;
    document.getElementById('app-title').innerText = lang;
    const completed = appState.progress[lang] || 0;
    let html = `<button class="btn-apple" onclick="showHomeScreen()" style="background:none; color:var(--accent); margin-bottom:15px; text-align:left; padding-left:0;">← Indietro</button>`;
    
    for(let i=1; i<=5; i++) {
        const locked = i === 5 && completed < 4;
        html += `<button class="btn-apple" ${locked ? 'disabled' : ''} onclick="uiStartQuiz('${lang}', ${i})">
            Livello ${i} <span style="float:right">${locked ? '🔒' : (i <= completed ? '✅' : '🚀')}</span>
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function uiStartQuiz(lang, lvl) {
    const pool = quizDB[lang] || [];
    currentSession = { 
        lang, lvl, idx: 0, 
        questions: [...pool].sort(() => 0.5 - Math.random()).slice(0, 15) 
    };
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const q = currentSession.questions[currentSession.idx];
    document.getElementById('content-area').innerHTML = `
        <p style="color:var(--accent); font-weight:800; font-size:11px; margin-bottom:10px;">DOMANDA ${currentSession.idx + 1} DI 15</p>
        <h2 style="margin-bottom:30px; font-size:22px;">${q.q}</h2>
        ${q.options.map((opt, i) => `<button class="btn-apple" onclick="uiCheckAnswer(${i})">${opt}</button>`).join('')}
    `;
}

function uiCheckAnswer(idx) {
    const q = currentSession.questions[currentSession.idx];
    const ok = idx === q.correct;
    document.getElementById('content-area').innerHTML = `
        <h2 style="color:${ok ? '#34c759' : '#ff3b30'}; text-align:center;">${ok ? 'Ottimo!' : 'Non proprio'}</h2>
        <div style="background:rgba(120,120,128,0.1); padding:20px; border-radius:20px; margin:25px 0;">
            <p style="margin-bottom:15px; font-size:15px; line-height:1.4;">${q.exp}</p>
            ${q.code ? `<pre style="background:#1e1e1e; color:#d4d4d4; padding:15px; border-radius:12px; font-size:12px; overflow-x:auto;">${q.code}</pre>` : ''}
        </div>
        <button class="btn-apple btn-primary" onclick="uiNext()">Continua</button>
    `;
}

function uiNext() {
    currentSession.idx++;
    if(currentSession.idx < currentSession.questions.length) renderQuizQuestion();
    else uiFinishLvl();
}

function uiFinishLvl() {
    if(appState.mode === 'user' && currentSession.lvl < 5) {
        appState.progress[currentSession.lang] = Math.max(appState.progress[currentSession.lang] || 0, currentSession.lvl);
        localStorage.setItem('devProgress', JSON.stringify(appState.progress));
    }
    showLevelsScreen(currentSession.lang);
}

function setupThemeLogic() {
    const s = document.getElementById('theme-slider');
    const f = document.getElementById('theme-footer');
    let timer;

    s.onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');

    const resetIdle = () => {
        f.classList.remove('idle');
        clearTimeout(timer);
        timer = setTimeout(() => f.classList.add('idle'), 3000);
    };

    ['mousedown', 'mousemove', 'keypress', 'touchstart'].forEach(ev => window.addEventListener(ev, resetIdle));
    resetIdle();
}

function uiLogout() {
    localStorage.clear();
    location.reload();
}

function showReviewSession() { alert("Area Studio in arrivo!"); }
