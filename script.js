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

// Se domandaRepo non esiste nel tuo file, creiamo un oggetto vuoto per evitare il crash
if (typeof domandaRepo === 'undefined') {
    var domandaRepo = {}; 
}

const ADMIN_PIN = "3473";

window.onload = () => {
    initTheme();
    renderLogin();
};

function initTheme() {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

// 3. NAVIGAZIONE
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
    }
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// 4. LOGIN E PIN
function renderLogin() {
    state.mode = null;
    state.currentPin = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:10px; width:100%; align-items:center">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent); text-align:center" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    let title = type === 'login' ? 'Bentornato' : 'Crea Profilo';
    let nameField = type === 'register' ? `<input type="text" id="name-field" class="btn-apple" placeholder="Il tuo Nome" style="text-align:center; margin-bottom:15px; background:var(--card)">` : '';
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <h3 style="margin-bottom:20px">${title}</h3>
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin-bottom:10px; display:none; padding:0 20px"></div>
            ${nameField}
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px; background:var(--card)" maxlength="4" inputmode="numeric" placeholder="PIN">
            <button class="btn-apple btn-primary" style="margin-top:25px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const errorEl = document.getElementById('pin-error');
    if(pin.length !== 4) { if(errorEl){errorEl.innerText = "Il PIN deve essere di 4 cifre"; errorEl.style.display = "block";} return; }

    if (pin === ADMIN_PIN) {
        state.mode = 'admin'; state.currentUser = "Creatore"; showHome(); return;
    }

    if (type === 'register') {
        const name = document.getElementById('name-field')?.value.trim();
        if(!name) { errorEl.innerText = "Inserisci il tuo nome"; errorEl.style.display = "block"; return; }
        if (dbUsers[pin]) { errorEl.innerText = "Questo PIN è già in uso"; errorEl.style.display = "block"; return; }
        dbUsers[pin] = { name: name, progress: {}, history: {}, activeProgress: {} };
        saveMasterDB();
    } else {
        if (!dbUsers[pin]) { errorEl.innerText = "PIN errato"; errorEl.style.display = "block"; return; }
    }

    state.currentPin = pin;
    state.currentUser = dbUsers[pin].name;
    state.mode = 'user';
    state.progress = dbUsers[pin].progress || {};
    state.history = dbUsers[pin].history || {};
    showHome();
}

function setGuest() { 
    state.mode = 'guest'; 
    state.progress = {}; 
    state.history = {}; 
    state.currentUser = "Guest";
    showHome(); 
}

// 5. HOME E LIVELLI
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 10px;">`;
    
    // Controlla se ci sono linguaggi nel database domande
    const languages = Object.keys(domandaRepo);
    if (languages.length === 0) {
        html = `<p style="text-align:center; opacity:0.6; padding:20px">Nessun corso caricato nel database domande.</p>`;
    } else {
        languages.forEach(l => {
            const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
            html += `<div class="lang-item" onclick="renderLevels('${l}')" style="background:var(--card); padding:20px; border-radius:15px; text-align:center; cursor:pointer">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
                <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
            </div>`;
        });
    }

    if(state.mode !== 'guest') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()" style="background:var(--card); padding:20px; border-radius:15px; text-align:center; cursor:pointer; grid-column: span 2"><div style="font-weight:700">${state.mode==='admin'?'PANNELLO ADMIN':'IL MIO PROFILO'}</div></div>`;
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
        const key = "L" + i;
        const totalQ = (domandaRepo[lang] && domandaRepo[lang][key]) ? domandaRepo[lang][key].length : 0;
        
        let isLocked = false;
        if (state.mode === 'user') {
            if ((i === 4 || i === 5) && comp < 3) isLocked = true;
        }

        let percentage = 0;
        let progDisplay = "∞";
        
        if (state.mode !== 'guest' && state.currentPin && dbUsers[state.currentPin]) {
            const savedIdx = (dbUsers[state.currentPin].activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${i}`]) || 0;
            percentage = totalQ > 0 ? (savedIdx / totalQ) * 100 : 0;
            progDisplay = `${savedIdx}/${totalQ}`;
        }

        html += `
            <div class="level-card" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}" style="margin-bottom:10px; padding:18px; border-radius: 12px; background: var(--card); opacity: ${isLocked ? '0.5' : '1'}; cursor: ${isLocked ? 'not-allowed' : 'pointer'}; border: 1px solid var(--border)">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-weight:600">${i === 5 ? 'ESAMINATI' : 'Livello ' + i} ${isLocked ? '🔒' : ''}</span>
                    <span style="font-size:12px; opacity:0.5">${progDisplay}</span>
                </div>
                ${state.mode !== 'guest' ? `
                <div style="width:100%; height:5px; background:rgba(120,120,128,0.1); border-radius:10px; margin-top:12px; overflow:hidden">
                    <div style="width:${percentage}%; height:100%; background:var(--accent); border-radius:10px; transition:0.4s ease"></div>
                </div>` : ''}
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. LOGICA QUIZ
function startQuiz(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    state.currentQuiz = { lang, level: lvl };
    
    let savedIdx = 0;
    if (state.mode === 'user' && state.currentPin && dbUsers[state.currentPin]) {
        savedIdx = (dbUsers[state.currentPin].activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${lvl}`]) || 0;
    }
    
    state.currentQuestionIndex = savedIdx;
    updateNav(true, `renderLevels('${lang}')`);
    renderQuestion();
}

function renderQuestion() {
    const { lang, level } = state.currentQuiz;
    const questions = domandaRepo[lang]["L" + level];
    if (!questions || state.currentQuestionIndex >= questions.length) { finishQuiz(lang, level); return; }

    const raw = questions[state.currentQuestionIndex].split("|");
    const qData = { q: raw[0], options: [raw[1], raw[2], raw[3]], correct: parseInt(raw[4]), exp: raw[5] };
    const progress = (state.currentQuestionIndex / questions.length) * 100;

    document.getElementById('content-area').innerHTML = `
        <div style="width:100%; margin-bottom:25px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:8px; font-weight:600">
                <span>DOMANDA ${state.currentQuestionIndex + 1} DI ${questions.length}</span>
            </div>
            <div style="width:100%; height:6px; background:rgba(120,120,128,0.1); border-radius:10px; overflow:hidden">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.4s ease"></div>
            </div>
        </div>
        <h2 style="font-size:20px; margin-bottom:30px;">${qData.q}</h2>
        <div id="opts" style="display:flex; flex-direction:column; gap:12px; width:100%">
            ${qData.options.map((o,i)=>`<button class="btn-apple" style="text-align:left; padding:18px; background:var(--card)" onclick="checkAnswer(${i === qData.correct}, '${qData.exp.replace(/'/g, "\\'")}')">${o}</button>`).join('')}
        </div>
        <div id="fb"></div>`;
}

function checkAnswer(isOk, exp) {
    const { lang, level } = state.currentQuiz;
    if(state.mode === 'user') {
        if(!state.history[lang]) state.history[lang] = [];
        state.history[lang].push({ q: "Livello " + level, ok: isOk });
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div style="margin-top:25px; padding:20px; border-radius:15px; background: ${isOk?'rgba(52,199,89,0.1)':'rgba(255,59,48,0.1)'}; border: 1px solid ${isOk?'#34c759':'#ff3b30'}">
            <strong style="color:${isOk?'#34c759':'#ff3b30'}">${isOk?'Ottimo!':'Riprova'}</strong>
            <p style="margin:10px 0; font-size:14px;">${exp}</p>
            <button class="btn-apple btn-primary" onclick="nextQuestion()">Continua</button>
        </div>`;
}

function nextQuestion() {
    const { lang, level } = state.currentQuiz;
    state.currentQuestionIndex++;
    if (state.mode === 'user' && state.currentPin && dbUsers[state.currentPin]) {
        if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
        dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = state.currentQuestionIndex;
        saveMasterDB();
    }
    renderQuestion();
}

function finishQuiz(lang, level) {
    if (state.mode === 'user' && state.currentPin && dbUsers[state.currentPin]) {
        if (dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = 0;
        state.progress[lang] = Math.max(state.progress[lang] || 0, level);
        saveMasterDB();
    }
    alert("Livello completato!");
    renderLevels(lang);
}

// 9. LIVELLO 5 (VS CODE)
function renderL5(lang) {
    updateNav(true, `renderLevels('${lang}')`);
    const challenges = {
        "python": { task: "Conta da 1 a 10 utilizzando un ciclo", logic: "range", file: "main.py" },
        "javascript": { task: "Crea un ciclo che stampi i numeri da 1 a 10", logic: "for", file: "index.js" },
        "html": { task: "Crea un elenco puntato con <li>", logic: "li", file: "index.html" }
    };
    const current = challenges[lang.toLowerCase()] || { task: "Esercizio di logica", logic: "10", file: "script.txt" };

    document.getElementById('content-area').innerHTML = `
        <div style="text-align:left; margin-bottom:15px">
            <h3 style="font-size:16px; color:var(--accent)">Esercizio di Logica</h3>
            <p style="font-size:14px; opacity:0.8">${current.task}</p>
        </div>
        <div style="background:#1e1e1e; border-radius:8px; overflow:hidden; border:1px solid #3c3c3c; font-family:monospace; text-align:left">
            <div style="background:#323233; padding:8px 15px; color:#cccccc; font-size:11px; display:flex; justify-content:space-between">
                <span>${current.file}</span><span style="color:#6a9955">// Visual Studio Code</span>
            </div>
            <textarea id="code-editor" spellcheck="false" style="width:100%; height:150px; background:#1e1e1e; color:#d4d4d4; border:none; padding:15px; font-size:14px; outline:none; resize:none;"></textarea>
        </div>
        <div id="l5-feedback" style="margin-top:10px"></div>
        <div style="display:flex; gap:10px; margin-top:15px">
            <button class="btn-apple btn-primary" onclick="verifyL5('${lang}', '${current.logic}')">Esegui Code</button>
            <button class="btn-apple" style="background:none; border:1px solid var(--border)" onclick="renderLevels('${lang}')">Next</button>
        </div>
        <div id="console-output" style="display:none; margin-top:20px; background:#1e1e1e; border-top:2px solid #007acc; padding:12px; font-family:monospace; text-align:left">
            <div style="color:#007acc; font-size:10px; margin-bottom:5px; font-weight:bold">DEBUG CONSOLE</div>
            <div id="console-text" style="color:#ffffff; font-size:12px;"></div>
        </div>`;
}

function verifyL5(lang, logic) {
    const code = document.getElementById('code-editor').value;
    const fb = document.getElementById('l5-feedback');
    const cBox = document.getElementById('console-output');
    const cText = document.getElementById('console-text');

    if (code.toLowerCase().includes(logic.toLowerCase())) {
        fb.innerHTML = `<div style="color:#4ec9b0; font-size:13px;">✓ Successo! Logica corretta.</div>`;
        cBox.style.display = "block";
        cText.innerHTML = "1, 2, 3, 4, 5, 6, 7, 8, 9, 10<br><span style="color:#6a9955">> Esecuzione terminata.</span>";
        if (state.mode === 'user') { state.progress[lang] = 5; saveMasterDB(); }
    } else {
        fb.innerHTML = `<div style="color:#f44336; font-size:13px;"><strong>ERRORE:</strong> Logica non trovata. Riprova.</div>`;
        cBox.style.display = "none";
    }
}

function logout() { location.reload(); }
