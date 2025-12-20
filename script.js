const quizDB = {
    Python: Array.from({length: 20}, (_, i) => ({
        q: `Python Q${i+1}: Cosa restituisce ${i} + 5?`,
        options: [`${i+5}`, `${i+10}`, "0"], correct: 0,
        exp: "L'operatore + esegue una somma aritmetica.", code: `print(${i} + 5)`
    })),
    JavaScript: [{q: "Keyword per costanti?", options: ["const", "let", "var"], correct: 0, exp: "const crea riferimenti immutabili.", code: "const X = 10;"}],
    HTML: [{q: "Tag per il titolo principale?", options: ["h1", "title", "head"], correct: 0, exp: "h1 definisce l'intestazione più importante.", code: "<h1>Titolo</h1>"}],
    MySQL: [{q: "Comando per leggere dati?", options: ["SELECT", "READ", "GET"], correct: 0, exp: "SELECT è il comando standard SQL.", code: "SELECT * FROM users;"}],
    Java: [{q: "Tipo per numeri interi?", options: ["int", "String", "boolean"], correct: 0, exp: "int è il tipo primitivo per gli interi.", code: "int x = 10;"}]
};

const challenges5 = {
    Python: { task: "Scrivi print('Ciao')", target: "print('Ciao')", hint: "Usa apici singoli." },
    JavaScript: { task: "Crea x = 10", target: "let x = 10", hint: "Usa let." },
    HTML: { task: "Crea un tag p", target: "<p></p>", hint: "Tag paragrafo vuoto." }
};

let state = {
    userId: localStorage.getItem('devUserId'),
    mode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};

let session = null;

function init() {
    renderApp();
    setupThemeUI();
}

function renderApp() {
    const area = document.getElementById('content-area');
    if (!state.mode) {
        updateNav(false);
        area.innerHTML = `
            <div class="auth-container">
                <h2 style="margin-bottom:10px;">Benvenuto</h2>
                <p style="opacity:0.5; margin-bottom:30px;">Inizia la tua scalata</p>
                <button class="btn-apple btn-primary" onclick="uiPinEntry()">Accedi come Utente</button>
                <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
            </div>`;
    } else { showHome(); }
}

function showHome() {
    updateNav(false);
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let html = (state.mode === 'user') ? `<div class="progress-card">Utente: ${state.userId}</div>` : "";
    
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:600; font-size:14px;">${l}</div>
        </div>`}).join('') + `</div>`;
    area.innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    const completed = state.progress[lang] || 0;
    let html = "";
    for(let i=1; i<=5; i++) {
        const isLocked = (state.mode === 'user' && i === 5 && completed < 4);
        const resIdx = state.resume[`${lang}_${i}`];
        const label = resIdx !== undefined ? `Livello ${i} (Q: ${resIdx + 1})` : `Livello ${i}`;
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}', ${i})">
            ${i === 5 ? 'Livello 5: Coding Challenge' : label} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderLvl5(lang);
    else {
        const pool = [...quizDB[lang]].sort(() => 0.5 - Math.random()).slice(0, 15);
        const startIdx = state.resume[`${lang}_${lvl}`] || 0;
        session = { lang, lvl, questions: pool, idx: startIdx };
        renderQ();
    }
}

function renderQ() {
    const q = session.questions[session.idx];
    let opts = q.options.map((o, i) => ({ t: o, c: i === q.correct })).sort(() => Math.random() - 0.5);
    
    document.getElementById('content-area').innerHTML = `
        <small style="color:var(--accent); font-weight:800;">DOMANDA ${session.idx + 1} / 15</small>
        <h2 style="margin: 20px 0; font-size:22px;">${q.q}</h2>
        <div id="opts-box">${opts.map(o => `<button class="btn-apple" onclick="checkQ(${o.c})">${o.t}</button>`).join('')}</div>
        <div id="feedback-area"></div>`;
    
    if(state.mode === 'user') {
        state.resume[`${session.lang}_${session.lvl}`] = session.idx;
        localStorage.setItem('devResume', JSON.stringify(state.resume));
    }
}

function checkQ(isOk) {
    const q = session.questions[session.idx];
    document.getElementById('opts-box').style.pointerEvents = "none";
    const area = document.getElementById('feedback-area');
    area.innerHTML = `
        <div class="feedback-box ${isOk ? 'correct' : 'wrong'}">
            <h4 style="margin:0">${isOk ? 'Ottimo!' : 'Sbagliato'}</h4>
            <p style="font-size:14px; margin:10px 0">${q.exp}</p>
            <pre>${q.code}</pre>
            <button class="btn-apple btn-primary" style="margin-top:15px" onclick="nextQ()">Continua</button>
        </div>`;
}

function nextQ() {
    session.idx++;
    if(session.idx < 15) renderQ(); else finish();
}

function renderLvl5(lang) {
    const c = challenges5[lang] || challenges5.Python;
    document.getElementById('content-area').innerHTML = `
        <h2>Coding Challenge</h2>
        <p>${c.task}</p>
        <textarea id="code-in" class="code-editor" placeholder="Scrivi il codice..."></textarea>
        <button class="btn-apple btn-primary" onclick="checkL5('${lang}')">Verifica</button>
    `;
}

function checkL5(lang) {
    if(document.getElementById('code-in').value.trim() === challenges5[lang].target) {
        showAppleAlert("Completato!", "Percorso terminato con successo!", "Chiudi", () => {
            if(state.mode === 'user') { state.progress[lang] = 5; localStorage.setItem('devProgress', JSON.stringify(state.progress)); }
            showHome();
        });
    } else { showAppleAlert("Errore", "Riprova la sintassi."); }
}

function finish() {
    delete state.resume[`${session.lang}_${session.lvl}`];
    localStorage.setItem('devResume', JSON.stringify(state.resume));
    if(state.mode === 'user') {
        state.progress[session.lang] = Math.max(state.progress[session.lang] || 0, session.lvl);
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
    }
    showHome();
}

// UI UTILS
function uiPinEntry() {
    updateNav(true, "renderApp()");
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container">
            <h3>Crea PIN</h3>
            <input type="password" id="p-in" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px;" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" onclick="validatePin()">Salva</button>
        </div>`;
}

function validatePin() {
    const p = document.getElementById('p-in').value;
    if(p.length < 4) return;
    state.userId = p; state.mode = 'user';
    localStorage.setItem('devUserId', p); localStorage.setItem('devUserMode', 'user');
    showHome();
}

function setGuest() { state.mode = 'guest'; localStorage.setItem('devUserMode', 'guest'); showHome(); }

function showAppleAlert(t, b, bt="OK", cb=null) {
    const m = document.getElementById('apple-modal');
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerText = b;
    const acts = document.getElementById('modal-actions');
    acts.innerHTML = `<button class="modal-btn">${bt}</button>`;
    m.classList.remove('hidden');
    acts.onclick = () => { m.classList.add('hidden'); if(cb) cb(); };
}

function updateNav(s, t="") { document.getElementById('back-nav').innerHTML = s ? `<div class="back-link" onclick="${t}">〈 Indietro</div>` : ""; }

function setupThemeUI() {
    const f = document.getElementById('theme-footer');
    let timer;
    const r = () => { f.style.opacity = "1"; clearTimeout(timer); timer = setTimeout(() => f.style.opacity = "0.05", 3000); };
    ['mousemove','touchstart'].forEach(e => window.addEventListener(e, r));
}

function logout() { localStorage.clear(); location.reload(); }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');

window.onload = init;
