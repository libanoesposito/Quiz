const quizDB = {
    Python: Array.from({length: 50}, (_, i) => ({
        id: i, q: `Q${i+1}: Qual è il risultato di ${i} + 2?`,
        options: [`${i+2}`, `${i*2}`, `${i+10}`], correct: 0,
        exp: "Somma base Python.", code: `print(${i} + 2)`
    }))
};

let appState = {
    userId: localStorage.getItem('devUserId'),
    mode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {} // Per riprendere dove si è lasciato
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupThemeUI();
});

// POPUP APPLE STYLE
function showAlert(title, body, btnText = "OK", callback = null) {
    const m = document.getElementById('apple-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = body;
    const actions = document.getElementById('modal-actions');
    actions.innerHTML = `<button class="modal-btn" style="width:100%" id="m-ok">${btnText}</button>`;
    m.classList.remove('hidden');
    document.getElementById('m-ok').onclick = () => { m.classList.add('hidden'); if(callback) callback(); };
}

function initApp() {
    updateBackBtn(false);
    if (!appState.mode) showAuth(); else showHome();
}

function updateBackBtn(show, target = null) {
    const container = document.getElementById('back-nav');
    container.innerHTML = show ? `<div class="back-link" onclick="${target}">Indietro</div>` : "";
}

function showAuth() {
    document.getElementById('app-title').innerText = "DevMaster";
    updateBackBtn(false);
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <button class="btn-apple btn-primary" onclick="uiSetupUser()">Accedi come Utente</button>
            <button class="btn-apple" onclick="uiSetGuest()">Modalità Guest</button>
        </div>`;
}

function uiSetupUser() {
    updateBackBtn(true, "showAuth()");
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div class="auth-container">
            <input type="password" id="pin-field" class="pin-input" maxlength="4" placeholder="••••">
            <button class="btn-apple btn-primary" onclick="validateUserPin()">Entra</button>
        </div>`;
}

function validateUserPin() {
    const pin = document.getElementById('pin-field').value;
    if(pin.length < 4 || ["1234","0000"].includes(pin)) {
        showAlert("Errore PIN", "Il PIN è troppo semplice o incompleto.");
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
    let html = (appState.mode === 'user') ? `<div class="progress-card">ID: ${appState.userId}</div>` : "";
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${l.toLowerCase()}/${l.toLowerCase()}-original.svg" width="35">
            <div>${l}</div>
        </div>`).join('') + `</div>`;
    area.innerHTML = html;
}

function showLevels(lang) {
    updateBackBtn(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    const area = document.getElementById('content-area');
    let html = "";
    for(let i=1; i<=4; i++) {
        // Controllo se c'è un progresso salvato per riprendere
        const savedIdx = appState.resume[`${lang}_${i}`];
        const label = savedIdx ? `Livello ${i} (Continua da ${savedIdx + 1})` : `Livello ${i}`;
        html += `<button class="btn-apple" onclick="startQuiz('${lang}', ${i})">${label}</button>`;
    }
    area.innerHTML = html;
}

function startQuiz(lang, lvl) {
    updateBackBtn(true, `showLevels('${lang}')`);
    const savedIdx = appState.resume[`${lang}_${lvl}`] || 0;
    
    // Shuffle reale
    const pool = [...quizDB[lang]].sort(() => 0.5 - Math.random()).slice(0, 15);
    
    currentSession = { lang, lvl, questions: pool, idx: savedIdx };
    renderQuestion();
}

function renderQuestion() {
    const q = currentSession.questions[currentSession.idx];
    
    // Mischia le opzioni ogni volta
    const choices = q.options.map((text, i) => ({ text, correct: i === q.correct }));
    choices.sort(() => Math.random() - 0.5);

    document.getElementById('content-area').innerHTML = `
        <p style="font-size:12px; color:var(--accent)">DOMANDA ${currentSession.idx + 1} DI 15</p>
        <h2>${q.q}</h2>
        ${choices.map(c => `<button class="btn-apple" onclick="checkAnswer(${c.correct})">${c.text}</button>`).join('')}
    `;

    // Salva il punto in cui si trova l'utente (solo se Utente)
    if(appState.mode === 'user') {
        appState.resume[`${currentSession.lang}_${currentSession.lvl}`] = currentSession.idx;
        localStorage.setItem('devResume', JSON.stringify(appState.resume));
    }
}

function checkAnswer(isCorrect) {
    if(isCorrect) {
        showAlert("Corretto!", "Ottimo lavoro.", "Avanti", () => {
            currentSession.idx++;
            if(currentSession.idx < 15) renderQuestion();
            else finishQuiz();
        });
    } else {
        showAlert("Sbagliato", "Riprova o studia l'argomento.");
    }
}

function finishQuiz() {
    delete appState.resume[`${currentSession.lang}_${currentSession.lvl}`];
    localStorage.setItem('devResume', JSON.stringify(appState.resume));
    showAlert("Completato!", "Hai finito il livello.", "Menu", showHome);
}

function setupThemeUI() {
    const f = document.getElementById('theme-footer');
    let t;
    const reset = () => { f.classList.remove('invisible'); clearTimeout(t); t = setTimeout(()=>f.classList.add('invisible'), 3000); };
    window.onmousemove = reset; window.onclick = reset;
    reset();
}

function uiSetGuest() { appState.mode = 'guest'; localStorage.setItem('devUserMode', 'guest'); showHome(); }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
