const quizDB = {
    Python: Array.from({length: 20}, (_, i) => ({
        q: `Esercizio Python #${i+1}: Cosa stampa print(5 + ${i})?`,
        options: [`${5+i}`, "5", "Error"], correct: 0,
        exp: "La funzione print() invia i dati allo standard output (console).",
        code: `print(5 + ${i})`
    })),
    HTML: [{q: "Tag per un'immagine?", options: ["<img>", "<picture>", "<src>"], correct: 0, exp: "Il tag <img> è vuoto e richiede l'attributo src.", code: "<img src='logo.png'>"}],
    JavaScript: [{q: "Definisci una costante x = 1?", options: ["const x = 1", "let x = 1", "var x = 1"], correct: 0, exp: "const crea un legame immutabile.", code: "const x = 1;"}]
};

const challenges5 = {
    Python: { task: "Scrivi print('Hello World')", target: "print('Hello World')", color: "#4B8BBE" },
    JavaScript: { task: "Usa console.log('Hi')", target: "console.log('Hi')", color: "#F7DF1E" },
    HTML: { task: "Crea tag <a>", target: "<a></a>", color: "#E34C26" }
};

let state = {
    mode: null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};

let session = null;

// INIT
window.onload = () => { renderLogin(); setupThemeUI(); };

function renderLogin() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "DevMaster";
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container">
            <h2 style="margin-bottom:5px">Benvenuto</h2>
            <p style="opacity:0.5; margin-bottom:35px">Seleziona modalità di accesso</p>
            <button class="btn-apple btn-primary" onclick="renderPinEntry()">Accedi come Utente</button>
            <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
        </div>`;
}

function renderPinEntry() {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container">
            <h3>Inserisci PIN</h3>
            <input type="password" id="pin-in" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:10px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validateUser()">Accedi</button>
        </div>`;
}

function validateUser() {
    const pin = document.getElementById('pin-in').value;
    if(pin.length === 4) {
        state.mode = 'user';
        showHome();
    }
}

function setGuest() { state.mode = 'guest'; showHome(); }

function showHome() {
    updateNav(false);
    document.getElementById('app-title').innerText = "Percorsi";
    let html = `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:600; font-size:14px;">${l}</div>
        </div>`}).join('') + `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    const completed = state.progress[lang] || 0;
    let html = "";
    for(let i=1; i<=5; i++) {
        const isLocked = (state.mode === 'user' && i === 5 && completed < 4);
        const savedIdx = state.resume[`${lang}_${i}`];
        const label = (i === 5) ? "Livello 5: Coding Challenge" : (savedIdx != null ? `Livello ${i} (Continua da ${savedIdx+1})` : `Livello ${i}`);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}', ${i})">
            ${label} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderLvl5(lang);
    else {
        const startIdx = state.resume[`${lang}_${lvl}`] || 0;
        const questions = [...quizDB[lang]].sort(() => 0.5 - Math.random()).slice(0, 15);
        session = { lang, lvl, questions, idx: startIdx };
        renderQ();
    }
}

function renderQ() {
    const q = session.questions[session.idx];
    let opts = q.options.map((o, i) => ({ t: o, c: i === q.correct })).sort(() => Math.random() - 0.5);
    document.getElementById('content-area').innerHTML = `
        <small style="color:var(--accent); font-weight:800">DOMANDA ${session.idx + 1} DI 15</small>
        <h2 style="margin:20px 0">${q.q}</h2>
        <div id="opts-grid">${opts.map(o => `<button class="btn-apple" onclick="handleAnswer(${o.c})">${o.t}</button>`).join('')}</div>
        <div id="feedback-area"></div>`;
}

function handleAnswer(isCorrect) {
    const q = session.questions[session.idx];
    const area = document.getElementById('feedback-area');
    document.getElementById('opts-grid').style.pointerEvents = "none";

    area.innerHTML = `
        <div class="feedback-box ${isCorrect ? 'correct' : 'wrong'}">
            <strong>${isCorrect ? 'Ottimo!' : 'Errore'}</strong>
            <p style="font-size:14px; margin:8px 0">${q.exp}</p>
            <pre>${q.code}</pre>
            <button class="btn-apple btn-primary" style="margin-top:15px" onclick="nextQuestion()">Continua</button>
            ${!isCorrect ? `<button class="btn-apple" style="background:none; border:1px solid var(--accent)" onclick="retry()">Riprova</button>` : ''}
        </div>`;
}

function retry() {
    document.getElementById('opts-grid').style.pointerEvents = "auto";
    document.getElementById('feedback-area').innerHTML = "";
}

function nextQuestion() {
    session.idx++;
    if(session.idx < 15) {
        state.resume[`${session.lang}_${session.lvl}`] = session.idx;
        localStorage.setItem('devResume', JSON.stringify(state.resume));
        renderQ();
    } else {
        finishLvl();
    }
}

function finishLvl() {
    delete state.resume[`${session.lang}_${session.lvl}`];
    localStorage.setItem('devResume', JSON.stringify(state.resume));
    state.progress[session.lang] = Math.max(state.progress[session.lang] || 0, session.lvl);
    localStorage.setItem('devProgress', JSON.stringify(state.progress));
    showLevels(session.lang);
}

// LIVELLO 5 LOGIC
function renderLvl5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>Challenge Expert: ${lang}</h3>
        <p style="opacity:0.7">${c.task}</p>
        <textarea id="editor" class="code-editor" style="border-left: 5px solid ${c.color}"></textarea>
        <div id="console" class="console-terminal" style="display:none"></div>
        <button class="btn-apple btn-primary" style="margin-top:20px" onclick="runCode('${lang}')">Esegui (Run)</button>
    `;
}

function runCode(lang) {
    const val = document.getElementById('editor').value.trim();
    const cons = document.getElementById('console');
    const target = challenges5[lang].target;
    cons.style.display = "block";
    
    if(val === target) {
        cons.innerHTML = `> In esecuzione...<br>> Output: SUCCESS`;
        setTimeout(() => {
            state.progress[lang] = 5;
            localStorage.setItem('devProgress', JSON.stringify(state.progress));
            showHome();
        }, 1200);
    } else {
        cons.innerHTML = `<span style="color:#ff3b30">> SyntaxError: Input non valido. Riprova.</span>`;
    }
}

// UTILS
function updateNav(show, target) {
    document.getElementById('back-nav').innerHTML = show ? `<div class="back-link" onclick="${target}">〈 Indietro</div>` : "";
}
function setupThemeUI() {
    document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
}
