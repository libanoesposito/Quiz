const quizDB = {
    Python: Array.from({length: 20}, (_, i) => ({
        q: `Python Q${i+1}: Cosa stampa print(${i} + 1)?`,
        options: [`${i+1}`, `${i}`, "Error"], correct: 0,
        exp: "La funzione print visualizza l'output nella console.", code: `print(${i} + 1)`
    })),
    JavaScript: [{q: "Come dichiari x=5?", options: ["let x=5", "x:=5"], correct: 0, exp: "In JS usiamo let o const.", code: "let x = 5;"}],
    HTML: [{q: "Tag per link?", options: ["<a>", "<link>"], correct: 0, exp: "<a> è l'anchor tag.", code: "<a href='#'>Link</a>"}],
    Java: [{q: "Tipo decimale?", options: ["double", "decimal"], correct: 0, exp: "Java usa double o float.", code: "double d = 1.5;"}]
};

const challenges5 = {
    Python: { task: "Stampa a video la parola 'System'", target: "print('System')", langClass: "editor-python" },
    JavaScript: { task: "Crea un alert con 'Ciao'", target: "alert('Ciao')", langClass: "editor-javascript" },
    Java: { task: "Dichiara int y = 20", target: "int y = 20", langClass: "editor-java" },
    HTML: { task: "Crea un tag h1", target: "<h1></h1>", langClass: "editor-html" }
};

let state = {
    userId: localStorage.getItem('devUserId'),
    mode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};

function init() { renderApp(); }

function renderApp() {
    state.mode = null; // Forza il ritorno al login se chiamato
    const area = document.getElementById('content-area');
    updateNav(false);
    document.getElementById('app-title').innerText = "DevMaster";
    area.innerHTML = `
        <div class="auth-container">
            <h2 style="margin-bottom:30px">Accesso</h2>
            <button class="btn-apple btn-primary" onclick="uiPinEntry()">Accedi come Utente</button>
            <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
        </div>`;
}

function showHome() {
    updateNav(false);
    document.getElementById('app-title').innerText = "Percorsi";
    let html = (state.mode === 'user') ? `<div class="progress-card">ID: ${state.userId}</div>` : "";
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:600;">${l}</div>
        </div>`}).join('') + `</div>
        <button class="btn-apple" onclick="renderApp()" style="margin-top:30px; background:none; color:var(--accent)">LOGOUT</button>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    const completed = state.progress[lang] || 0;
    let html = "";
    for(let i=1; i<=5; i++) {
        const isLocked = (state.mode === 'user' && i === 5 && completed < 4);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}', ${i})">
            ${i === 5 ? 'Livello 5: Expert Console 👨‍💻' : 'Livello ' + i} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderLvl5(lang);
    else {
        const pool = [...quizDB[lang]].sort(() => 0.5 - Math.random()).slice(0, 15);
        session = { lang, lvl, questions: pool, idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const q = session.questions[session.idx];
    let opts = q.options.map((o, i) => ({ t: o, c: i === q.correct })).sort(() => Math.random() - 0.5);
    document.getElementById('content-area').innerHTML = `
        <small>LIVELLO ${session.lvl} - Q ${session.idx + 1}/15</small>
        <h2 style="margin:20px 0">${q.q}</h2>
        <div id="opts-box">${opts.map(o => `<button class="btn-apple" onclick="checkQ(${o.c})">${o.t}</button>`).join('')}</div>
        <div id="feedback-area"></div>`;
}

function checkQ(isOk) {
    const q = session.questions[session.idx];
    const area = document.getElementById('feedback-area');
    document.getElementById('opts-box').style.pointerEvents = "none";
    area.innerHTML = `
        <div class="feedback-box ${isOk ? 'correct' : 'wrong'}">
            <strong>${isOk ? 'Corretto!' : 'Errore'}</strong>
            <p style="font-size:13px">${q.exp}</p>
            <pre>${q.code}</pre>
            <button class="btn-apple btn-primary" onclick="nextQ()">Continua</button>
            ${!isOk ? `<button class="retry-btn" onclick="retryQ()">Riprova</button>` : ''}
        </div>`;
}

function retryQ() {
    document.getElementById('opts-box').style.pointerEvents = "auto";
    document.getElementById('feedback-area').innerHTML = "";
}

function renderLvl5(lang) {
    const c = challenges5[lang] || challenges5.Python;
    document.getElementById('content-area').innerHTML = `
        <h3>Livello 5: ${lang}</h3>
        <p style="font-size:14px; opacity:0.8">${c.task}</p>
        <textarea id="code-in" class="code-editor ${c.langClass}" placeholder="Scrivi codice..."></textarea>
        <div id="console-out" class="terminal-output"></div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="checkL5('${lang}')">Esegui (Run)</button>
    `;
}

function checkL5(lang) {
    const val = document.getElementById('code-in').value.trim();
    const term = document.getElementById('console-out');
    const target = challenges5[lang].target;
    
    term.classList.add('show');
    
    if(val === target) {
        // Simula output terminale
        let output = "Output: ";
        if(val.includes('print')) output += val.match(/'([^']+)'/)[1];
        else output += "Success (Codice validato)";
        
        term.innerHTML = `<span>> ${output}</span>`;
        setTimeout(() => showAppleAlert("Ottimo!", "Livello 5 superato!", "Fine", () => {
            if(state.mode === 'user') state.progress[lang] = 5;
            showHome();
        }), 1000);
    } else {
        term.innerHTML = `<span class="terminal-error">> SyntaxError: Codice non corrispondente.</span>`;
    }
}

// Navigazione e Utils (Mantieni le altre funzioni come logout, validatePin, etc.)
function uiPinEntry() {
    updateNav(true, "renderApp()");
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container">
            <h3>Crea PIN</h3>
            <input type="password" id="p-in" class="btn-apple" style="text-align:center; font-size:24px" maxlength="4" inputmode="numeric">
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
function updateNav(s, t="") { document.getElementById('back-nav').innerHTML = s ? `<div class="back-link" onclick="${t}">〈 Indietro</div>` : ""; }
function showAppleAlert(t, b, bt, cb) {
    const m = document.getElementById('apple-modal');
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerText = b;
    const acts = document.getElementById('modal-actions');
    acts.innerHTML = `<button class="modal-btn">${bt}</button>`;
    m.classList.remove('hidden');
    acts.onclick = () => { m.classList.add('hidden'); if(cb) cb(); };
}
function nextQ() { session.idx++; if(session.idx < 15) renderQ(); else showHome(); }

window.onload = init;
