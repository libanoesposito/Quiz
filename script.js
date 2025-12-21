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
let session = null;
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
    b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">‹ Indietro</span>` : "";
    r.innerHTML = state.mode ? `<span class="logout-link" onclick="logout()">Esci</span>` : "";
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
    if(pin.length !== 4) { errorEl.innerText = "Il PIN deve essere di 4 cifre"; errorEl.style.display = "block"; return; }

    if (pin === ADMIN_PIN) {
        state.mode = 'admin'; state.currentUser = "Creatore"; showHome(); return;
    }

    if (type === 'register') {
        const nameInput = document.getElementById('name-field');
        const name = nameInput ? nameInput.value.trim() : "";
        if(!name) { errorEl.innerText = "Inserisci il tuo nome"; errorEl.style.display = "block"; return; }
        if (dbUsers[pin]) { errorEl.innerText = "Questo PIN è già in uso"; errorEl.style.display = "block"; return; }
        dbUsers[pin] = { name: name, progress: {}, history: {} };
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

function setGuest() { state.mode = 'guest'; state.progress = {}; state.history = {}; showHome(); }

// 5. HOME E LIVELLI
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `<div class="lang-item" onclick="renderLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });
    if(state.mode !== 'guest') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'PANNELLO ADMIN':'IL MIO PROFILO'}</div></div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function renderLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; 
    const currentMax = state.progress[lang] || 0; // Il livello massimo completato
    
    for(let i=1; i<=5; i++) {
        let isLocked = false;
        
        // Logica richiesta: Utente blocca 4 e 5 se non ha finito 1,2,3. Guest sbloccato.
        if (state.mode !== 'guest') {
            if ((i === 4 || i === 5) && currentMax < 3) {
                isLocked = true;
            }
        }

        html += `
            <div class="level-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}" style="margin-bottom:10px; padding:18px; position:relative; background:var(--card); border-radius:12px; border:1px solid var(--border)">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-weight:600">${i === 5 ? 'ESAMINATI' : 'Livello ' + i} ${isLocked ? '🔒' : ''}</span>
                    <span style="font-size:12px; opacity:0.5">${currentMax >= i ? 'Completato ✅' : ''}</span>
                </div>
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. LOGICA QUIZ (15 DOMANDE CASUALI)
function startQuiz(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    
    const allQuestions = domandaRepo[lang]["L" + lvl];
    if(!allQuestions || allQuestions.length === 0) return;

    // Mescola e pesca 15
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, 15).map(raw => {
        const p = raw.split("|");
        return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
    });

    state.currentQuiz = { lang, level: lvl, questions: selection };
    state.currentQuestionIndex = 0;
    updateNav(true, `renderLevels('${lang}')`);
    renderQuestion();
}

function renderQuestion() {
    const quiz = state.currentQuiz;
    if (state.currentQuestionIndex >= quiz.questions.length) { finishQuiz(); return; }

    const qData = quiz.questions[state.currentQuestionIndex];
    const progress = (state.currentQuestionIndex / quiz.questions.length) * 100;

    document.getElementById('content-area').innerHTML = `
        <div style="width:100%; margin-bottom:25px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:8px; font-weight:600">
                <span>DOMANDA ${state.currentQuestionIndex + 1} DI 15</span>
            </div>
            <div style="width:100%; height:6px; background:rgba(120,120,128,0.1); border-radius:10px; overflow:hidden">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.4s ease"></div>
            </div>
        </div>
        <h2 style="font-size:22px; margin-bottom:30px; line-height:1.3">${qData.q}</h2>
        <div id="opts" style="display:flex; flex-direction:column; gap:12px; width:100%">
            ${qData.options.map((o,i)=>`<button class="btn-apple" style="text-align:left; padding:18px; font-size:16px; background:var(--card)" onclick="checkAnswer(${i === qData.correct}, '${qData.exp.replace(/'/g, "\\'")}')">${o}</button>`).join('')}
        </div>
        <div id="fb"></div>`;
}

function checkAnswer(isOk, exp) {
    const { lang } = state.currentQuiz;
    if(state.mode === 'user') {
        if(!state.history[lang]) state.history[lang] = [];
        state.history[lang].push({ q: "Liv " + state.currentQuiz.level, ok: isOk });
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}" style="margin-top:25px; padding:20px; border-radius:15px">
            <strong style="font-size:18px">${isOk?'Ottimo!':'Riprova'}</strong>
            <p style="margin:10px 0; font-size:15px; line-height:1.4 opacity:0.9">${exp}</p>
            <button class="btn-apple btn-primary" onclick="nextQuestion()">Continua</button>
        </div>`;
}

function nextQuestion() {
    state.currentQuestionIndex++;
    renderQuestion();
}

function finishQuiz() {
    const { lang, level } = state.currentQuiz;
    if (state.mode === 'user') {
        // Salva il livello come completato se è maggiore di quello salvato prima
        state.progress[lang] = Math.max(state.progress[lang] || 0, level);
        saveMasterDB();
    }
    alert("Livello completato con successo!");
    renderLevels(lang);
}

// 7. PROFILO E AZIONI
function renderProfile() {
    updateNav(true, "showHome()");
    let html = `<h3>Profilo di ${state.currentUser || 'Guest'}</h3>`;
    if (state.mode === 'user') {
        html += `<button class="btn-apple" style="color:#ff3b30; margin-top:20px" onclick="userSelfDelete()">Elimina Account</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function logout() { state.mode = null; location.reload(); }
function userSelfDelete() { if(confirm("Eliminare il profilo?")) { delete dbUsers[state.currentPin]; localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers)); location.reload(); } }

// ==========================================
// SEZIONE LIVELLO 5 - MODIFICA SOLO QUI SOTTO
// ==========================================

const challenges5 = {
    "HTML": { task: "Crea un elemento lista puntata.", logic: "li" },
    "Python": { task: "Stampa la parola 'Ciao'.", logic: "print" },
    "JavaScript": { task: "Crea un ciclo for.", logic: "for" }
};

function renderL5(lang) {
    updateNav(true, `renderLevels('${lang}')`);
    const c = challenges5[lang] || { task: "Completa la sfida", logic: "" };
    document.getElementById('app-title').innerText = "ESAMINATI";
    document.getElementById('content-area').innerHTML = `
        <h3 style="margin-bottom:15px">${lang}</h3>
        <p style="font-size:15px; margin-bottom:20px; opacity:0.8">${c.task}</p>
        <textarea id="ed" style="width:100%; height:150px; background:var(--card); color:var(--text); border:1px solid var(--border); border-radius:12px; padding:15px; font-family:monospace; font-size:16px"></textarea>
        <button class="btn-apple btn-primary" style="margin-top:20px" onclick="runL5('${lang}')">Verifica Codice</button>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-top:15px">Codice errato, riprova.</div>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value.toLowerCase();
    if(v.includes(challenges5[l].logic)) {
        if (state.mode === 'user') {
            state.progress[l] = 5;
            saveMasterDB();
        }
        alert("Esame superato!");
        showHome();
    } else { document.getElementById('l5-err').style.display = "block"; }
}
