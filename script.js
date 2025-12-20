// Database di test espanso
const quizDB = {
    Python: Array.from({length: 50}, (_, i) => ({
        id: i, q: `Esercizio Python #${i+1}: Qual è il valore di ${i} + 5?`,
        options: [`${i+5}`, `${i+10}`, `${i*5}`], correct: 0,
        exp: "Somma aritmetica semplice.", code: `x = ${i} + 5\nprint(x)`
    })),
    JavaScript: [{q: "Keyword per costanti?", options: ["const", "let", "var"], correct: 0, exp: "const non cambia.", code: "const x = 10;"}]
};

// --- CONTROLLER ERRORI GLOBALE ---
window.onerror = function(msg, url, line) {
    console.error("Errore rilevato: ", msg);
    // Se c'è un errore critico, resettiamo la sessione quiz per non bloccare l'utente
    localStorage.removeItem('devResume');
    appState.resume = {};
    initApp(); 
    return true;
};

let appState = {
    userId: localStorage.getItem('devUserId'),
    mode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};

let currentSession = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupThemeUI();
});

// POPUP APPLE STYLE (Fix: rimosso auto-popup all'avvio)
function showAlert(title, body, btnText = "OK", callback = null) {
    const m = document.getElementById('apple-modal');
    if (!m) return;
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = body;
    const actions = document.getElementById('modal-actions');
    actions.innerHTML = `<button class="modal-btn" style="width:100%" id="m-ok">${btnText}</button>`;
    m.classList.remove('hidden');
    document.getElementById('m-ok').onclick = () => {
        m.classList.add('hidden');
        if(callback) callback();
    };
}

function initApp() {
    updateBackBtn(false);
    const area = document.getElementById('content-area');
    if (!area) return;

    if (!appState.mode) showAuth(); else showHome();
}

function updateBackBtn(show, targetFunc = null) {
    const nav = document.getElementById('back-nav');
    if (!nav) return;
    nav.innerHTML = show ? `<div class="back-link" onclick="${targetFunc}">〈 Indietro</div>` : "";
}

function showAuth() {
    document.getElementById('app-title').innerText = "DevMaster";
    updateBackBtn(false);
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <h2 style="margin-bottom:5px;">Benvenuto</h2>
            <p style="opacity:0.5; margin-bottom:30px;">Impara a programmare</p>
            <button class="btn-apple btn-primary" onclick="uiPinEntry()">Accedi come Utente</button>
            <button class="btn-apple" onclick="uiSetGuest()">Modalità Guest</button>
        </div>`;
}

function uiPinEntry() {
    updateBackBtn(true, "showAuth()");
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <h3>Inserisci PIN</h3>
            <input type="password" id="pin-field" class="pin-input" maxlength="4" placeholder="••••" inputmode="numeric">
            <button class="btn-apple btn-primary" onclick="validateUser()">Entra</button>
        </div>`;
}

function validateUser() {
    const pin = document.getElementById('pin-field').value;
    const forbidden = ["1234","0000","1111"];
    if(pin.length < 4 || forbidden.includes(pin)) {
        showAlert("Accesso Negato", "PIN non valido o troppo semplice.");
        return;
    }
    appState.userId = pin; appState.mode = 'user';
    localStorage.setItem('devUserId', pin);
    localStorage.setItem('devUserMode', 'user');
    showHome();
}

function showHome() {
    document.getElementById('app-title').innerText = "Percorsi";
    updateBackBtn(false);
    const area = document.getElementById('content-area');
    let html = (appState.mode === 'user') ? `<div class="progress-card">Utente ID: ${appState.userId}</div>` : "";
    
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${l.toLowerCase()}/${l.toLowerCase()}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:600;">${l}</div>
        </div>`).join('') + `</div>
        <button class="btn-apple" onclick="uiLogout()" style="margin-top:auto; background:none; color:var(--accent);">Logout</button>`;
    area.innerHTML = html;
}

function showLevels(lang) {
    updateBackBtn(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    const area = document.getElementById('content-area');
    let html = "";
    for(let i=1; i<=4; i++) {
        const resumePoint = appState.resume[`${lang}_${i}`];
        const label = resumePoint !== undefined ? `Livello ${i} (Riprendi da ${resumePoint + 1})` : `Livello ${i}`;
        html += `<button class="btn-apple" onclick="startQuiz('${lang}', ${i})">${label}</button>`;
    }
    area.innerHTML = html;
}

function startQuiz(lang, lvl) {
    updateBackBtn(true, `showLevels('${lang}')`);
    
    // Shuffle reale dell'intero pool e selezione di 15
    const pool = [...quizDB[lang]].sort(() => 0.5 - Math.random()).slice(0, 15);
    const savedIdx = appState.resume[`${lang}_${lvl}`] || 0;

    currentSession = { lang, lvl, questions: pool, idx: savedIdx };
    renderQuestion();
}

function renderQuestion() {
    const q = currentSession.questions[currentSession.idx];
    if (!q) { uiFinishQuiz(); return; }

    // SHUFFLE REALE OPZIONI
    let options = q.options.map((o, i) => ({ text: o, isCorrect: i === q.correct }));
    options = options.sort(() => Math.random() - 0.5);

    document.getElementById('content-area').innerHTML = `
        <p style="font-size:11px; color:var(--accent); font-weight:800;">DOMANDA ${currentSession.idx + 1} DI 15</p>
        <h2 style="margin: 20px 0;">${q.q}</h2>
        <div id="options-list">
            ${options.map(opt => `<button class="btn-apple" onclick="handleAnswer(${opt.isCorrect})">${opt.text}</button>`).join('')}
        </div>
    `;

    // Salva progresso sessione
    if(appState.mode === 'user') {
        appState.resume[`${currentSession.lang}_${currentSession.lvl}`] = currentSession.idx;
        localStorage.setItem('devResume', JSON.stringify(appState.resume));
    }
}

function handleAnswer(correct) {
    const q = currentSession.questions[currentSession.idx];
    if(correct) {
        showAlert("Corretto!", q.exp, "Continua", () => {
            currentSession.idx++;
            if(currentSession.idx < 15) renderQuestion();
            else uiFinishQuiz();
        });
    } else {
        showAlert("Sbagliato", "Rileggi bene la domanda e riprova.");
    }
}

function uiFinishQuiz() {
    delete appState.resume[`${currentSession.lang}_${currentSession.lvl}`];
    localStorage.setItem('devResume', JSON.stringify(appState.resume));
    
    // Aggiorna progresso permanente
    if(appState.mode === 'user') {
        appState.progress[currentSession.lang] = Math.max(appState.progress[currentSession.lang] || 0, currentSession.lvl);
        localStorage.setItem('devProgress', JSON.stringify(appState.progress));
    }
    
    showAlert("Completato!", "Hai superato il livello con successo.", "Fine", () => showLevels(currentSession.lang));
}

function setupThemeUI() {
    const f = document.getElementById('theme-footer');
    let t;
    const resetIdle = () => { f.classList.remove('invisible'); clearTimeout(t); t = setTimeout(()=>f.classList.add('invisible'), 3000); };
    ['mousemove','touchstart','click'].forEach(e => window.addEventListener(e, resetIdle));
    resetIdle();
}

function uiLogout() { localStorage.clear(); location.reload(); }
function uiSetGuest() { appState.mode = 'guest'; localStorage.setItem('devUserMode', 'guest'); showHome(); }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
