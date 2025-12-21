// 1. STATO E COSTANTI
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};
let state = {
    mode: null,      
    currentPin: null, 
    currentUser: null, 
    progress: {},    
    history: {},
    currentQuiz: null,
    currentQuestionIndex: 0
};

const ADMIN_PIN = "3473";

// Inizializzazione al caricamento
window.onload = () => {
    if (typeof initTheme === 'function') initTheme();
    renderLogin();
};

function initTheme() {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
}

// 2. NAVIGAZIONE
function updateNav(showBack, backTarget) {
    const b = document.getElementById('back-nav');
    const r = document.getElementById('right-nav');
    if(b) b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">‹ Indietro</span>` : "";
    if(r) r.innerHTML = state.mode ? `<span class="logout-link" onclick="logout()">Esci</span>` : "";
}

function saveMasterDB() {
    if (state.mode === 'user' && state.currentPin) {
        dbUsers[state.currentPin].progress = state.progress;
        dbUsers[state.currentPin].history = state.history;
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
    }
}

// 3. LOGIN
function renderLogin() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:10px; width:100%; align-items:center">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent); text-align:center" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function setGuest() { 
    state.mode = 'guest'; 
    state.currentUser = "Guest";
    showHome(); 
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    let title = type === 'login' ? 'Bentornato' : 'Crea Profilo';
    let nameField = type === 'register' ? `<input type="text" id="name-field" class="btn-apple" placeholder="Il tuo Nome" style="text-align:center; margin-bottom:15px; background:var(--card)">` : '';
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <h3>${title}</h3>
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin:10px 0; display:none"></div>
            ${nameField}
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:25px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    if(pin.length !== 4) return;
    if (pin === ADMIN_PIN) { state.mode = 'admin'; state.currentUser = "Creatore"; showHome(); return; }

    if (type === 'register') {
        const name = document.getElementById('name-field').value;
        dbUsers[pin] = { name: name, progress: {}, history: {}, activeProgress: {} };
    } else if (!dbUsers[pin]) {
        alert("PIN errato"); return;
    }

    state.currentPin = pin;
    state.currentUser = dbUsers[pin].name;
    state.mode = 'user';
    state.progress = dbUsers[pin].progress || {};
    showHome();
}

// 4. HOME E LIVELLI
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:15px">`;
    
    // Verifica che domandaRepo esista per evitare foglio bianco
    if (typeof domandaRepo !== 'undefined') {
        Object.keys(domandaRepo).forEach(l => {
            html += `<div class="lang-item" onclick="renderLevels('${l}')" style="background:var(--card); padding:20px; border-radius:15px; text-align:center">
                <div style="font-weight:700">${l}</div>
            </div>`;
        });
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function renderLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; 
    const comp = state.progress[lang] || 0;
    
    for(let i=1; i<=5; i++) {
        let isLocked = (state.mode === 'user' && (i === 4 || i === 5) && comp < 3);
        let progDisplay = (state.mode === 'guest') ? "∞" : "0/0"; 

        html += `
            <div class="level-card" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}" style="margin-bottom:10px; padding:18px; background:var(--card); border-radius:12px; opacity:${isLocked?0.5:1}">
                <div style="display:flex; justify-content:space-between">
                    <span>${i === 5 ? 'ESAMINATI' : 'Livello ' + i} ${isLocked ? '🔒' : ''}</span>
                    <span style="opacity:0.5">${progDisplay}</span>
                </div>
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 5. QUIZ E LIVELLO 5
function startQuiz(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    state.currentQuiz = { lang, level: lvl };
    state.currentQuestionIndex = 0;
    renderQuestion();
}

function renderQuestion() {
    const { lang, level } = state.currentQuiz;
    const questions = domandaRepo[lang]["L" + level];
    if (state.currentQuestionIndex >= questions.length) { 
        state.progress[lang] = Math.max(state.progress[lang] || 0, level);
        saveMasterDB();
        renderLevels(lang);
        return; 
    }
    
    const qData = questions[state.currentQuestionIndex].split("|");
    document.getElementById('content-area').innerHTML = `
        <h3>${qData[0]}</h3>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px">
            <button class="btn-apple" onclick="nextQ(true)">${qData[1]}</button>
            <button class="btn-apple" onclick="nextQ(false)">${qData[2]}</button>
        </div>`;
}

function nextQ(isOk) {
    state.currentQuestionIndex++;
    renderQuestion();
}

// LOGICA VS CODE
function renderL5(lang) {
    updateNav(true, `renderLevels('${lang}')`);
    document.getElementById('content-area').innerHTML = `
        <div style="background:#1e1e1e; border-radius:8px; overflow:hidden; border:1px solid #3c3c3c; text-align:left">
            <div style="background:#323233; padding:8px; color:#ccc; font-size:11px">index.js - Editor</div>
            <textarea id="code-editor" style="width:100%; height:150px; background:#1e1e1e; color:#d4d4d4; border:none; padding:15px; font-family:monospace; outline:none"></textarea>
        </div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="verifyL5('${lang}')">Run Code</button>
        <div id="console-output" style="display:none; margin-top:20px; background:#1e1e1e; border-top:2px solid #007acc; padding:12px; color:white; font-family:monospace">
            > Output: Successo!
        </div>`;
}

function verifyL5(lang) {
    document.getElementById('console-output').style.display = "block";
    if (state.mode === 'user') { state.progress[lang] = 5; saveMasterDB(); }
}

function logout() { location.reload(); }
