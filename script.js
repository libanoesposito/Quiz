const quizDB = {
    Python: Array.from({length: 50}, (_, i) => ({
        q: `Python Q${i+1}: Quanto fa ${i} + 10?`,
        options: [`${i+10}`, `${i+5}`, `${i*10}`],
        correct: 0, exp: "Base aritmetica Python.", code: `print(${i} + 10)`
    })),
    JavaScript: [{q: "Quale usa JS?", options: ["let", "def"], correct: 0, exp: "JS usa let.", code: "let x = 5;"}],
    MySQL: [{q: "Comando per dati?", options: ["SELECT", "GET"], correct: 0, exp: "SQL usa SELECT.", code: "SELECT * FROM t;"}],
    Java: [{q: "Main in Java?", options: ["SI", "NO"], correct: 0, exp: "Java richiede il main.", code: "public static void main..."}],
    HTML: [{q: "Tag Titolo?", options: ["h1", "title-tag"], correct: 0, exp: "h1 è il titolo principale.", code: "<h1>Ciao</h1>"}]
};

let state = {
    userId: localStorage.getItem('devUserId'),
    mode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};

let session = null;

document.addEventListener('DOMContentLoaded', () => {
    renderApp();
    setupThemeTimer();
});

function renderApp() {
    const area = document.getElementById('content-area');
    if (!state.mode) {
        updateNav(false);
        document.getElementById('app-title').innerText = "DevMaster";
        area.innerHTML = `
            <div class="auth-container">
                <h2 style="margin-bottom:5px">Impara a programmare</h2>
                <p style="opacity:0.5; margin-bottom:30px">Scegli il tuo percorso</p>
                <button class="btn-apple btn-primary" onclick="goPin()">Accedi come Utente</button>
                <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
            </div>`;
    } else {
        showHome();
    }
}

function goPin() {
    updateNav(true, "renderApp()");
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container">
            <h3 style="margin-bottom:20px">Inserisci PIN</h3>
            <input type="password" id="p-in" class="ios-slider" style="position:relative; width:80%; height:50px; border-radius:12px; border:1px solid var(--border); text-align:center; font-size:24px; letter-spacing:10px; background:rgba(255,255,255,0.1); color:var(--text)" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin()">Accedi</button>
        </div>`;
}

function validatePin() {
    const val = document.getElementById('p-in').value;
    if(val.length < 4 || ["1234","0000","1111"].includes(val)) {
        showAppleAlert("PIN Invalido", "Scegli un codice più complesso a 4 cifre.");
        return;
    }
    state.userId = val; state.mode = 'user';
    localStorage.setItem('devUserId', val);
    localStorage.setItem('devUserMode', 'user');
    showHome();
}

function setGuest() {
    state.mode = 'guest';
    localStorage.setItem('devUserMode', 'guest');
    showHome();
}

function showHome() {
    updateNav(false);
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let html = (state.mode === 'user') ? `<div class="progress-card">Utente ID: ${state.userId}</div>` : "";
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${l.toLowerCase()}/${l.toLowerCase()}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:600; font-size:14px;">${l}</div>
        </div>`).join('') + `</div>
        <button class="btn-apple" onclick="logout()" style="margin-top:40px; background:none; color:var(--accent); font-weight:700">LOGOUT</button>`;
    area.innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = "";
    for(let i=1; i<=4; i++) {
        const resIdx = state.resume[`${lang}_${i}`];
        const label = resIdx !== undefined ? `Livello ${i} (Domanda ${resIdx + 1})` : `Livello ${i}`;
        html += `<button class="btn-apple" onclick="startQuiz('${lang}', ${i})">${label}</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startQuiz(lang, lvl) {
    updateNav(true, `showLevels('${lang}')`);
    const pool = [...quizDB[lang]].sort(() => 0.5 - Math.random()).slice(0, 15);
    const startIdx = state.resume[`${lang}_${lvl}`] || 0;
    session = { lang, lvl, questions: pool, idx: startIdx };
    renderQ();
}

function renderQ() {
    const q = session.questions[session.idx];
    // Shuffle risposte
    let options = q.options.map((o, i) => ({ text: o, correct: i === q.correct }));
    options.sort(() => Math.random() - 0.5);

    document.getElementById('content-area').innerHTML = `
        <p style="color:var(--accent); font-weight:800; font-size:11px; margin-bottom:15px">DOMANDA ${session.idx + 1} DI 15</p>
        <h2 style="margin-bottom:30px; font-size:22px; line-height:1.2">${q.q}</h2>
        ${options.map(opt => `<button class="btn-apple" onclick="check(${opt.correct})">${opt.text}</button>`).join('')}
    `;

    if(state.mode === 'user') {
        state.resume[`${session.lang}_${session.lvl}`] = session.idx;
        localStorage.setItem('devResume', JSON.stringify(state.resume));
    }
}

function check(isOk) {
    const q = session.questions[session.idx];
    if(isOk) {
        showAppleAlert("Corretto!", q.exp, "Avanti", () => {
            session.idx++;
            if(session.idx < 15) renderQ();
            else finish();
        });
    } else {
        showAppleAlert("Non corretto", "Riprova con attenzione.");
    }
}

function finish() {
    delete state.resume[`${session.lang}_${session.lvl}`];
    localStorage.setItem('devResume', JSON.stringify(state.resume));
    if(state.mode === 'user') {
        state.progress[session.lang] = Math.max(state.progress[session.lang] || 0, session.lvl);
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
    }
    showAppleAlert("Livello Finito!", "Ottimo lavoro.", "Chiudi", () => showLevels(session.lang));
}

// UTILS
function showAppleAlert(t, b, btn="OK", cb=null) {
    const m = document.getElementById('apple-modal');
    document.getElementById('modal-title').innerText = t;
    document.getElementById('modal-body').innerText = b;
    const act = document.getElementById('modal-actions');
    act.innerHTML = `<button class="modal-btn" style="width:100%">${btn}</button>`;
    m.classList.remove('hidden');
    act.onclick = () => { m.classList.add('hidden'); if(cb) cb(); };
}

function updateNav(show, target="") {
    document.getElementById('back-nav').innerHTML = show ? `<div class="back-link" onclick="${target}">〈 Indietro</div>` : "";
}

function setupThemeTimer() {
    const f = document.getElementById('theme-footer');
    let timer;
    const reset = () => { f.classList.remove('invisible'); clearTimeout(timer); timer = setTimeout(() => f.classList.add('invisible'), 3000); };
    ['mousemove','click','touchstart'].forEach(e => window.addEventListener(e, reset));
    reset();
}

function logout() { localStorage.clear(); location.reload(); }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
