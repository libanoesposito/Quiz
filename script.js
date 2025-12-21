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
    const prog = state.progress[lang] || []; // Array di livelli completati es. [1, 2]
    
    for(let i=1; i<=5; i++) {
        let isLocked = false;
        
        // Logica di sblocco Utente vs Guest
        if (state.mode !== 'guest') {
            const completatiBase = [1, 2, 3].every(n => prog.includes(n));
            if ((i === 4 || i === 5) && !completatiBase) {
                isLocked = true;
            }
        }

        html += `
            <div class="level-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}" style="margin-bottom:10px; padding:18px; position:relative">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-weight:600">${i === 5 ? 'ESAMINATI' : 'Livello ' + i} ${isLocked ? '🔒' : ''}</span>
                    <span style="font-size:12px; opacity:0.5">${prog.includes(i) ? 'Completato ✅' : ''}</span>
                </div>
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. LOGICA QUIZ (RANDOM 15 DOMANDE)
function startQuiz(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    
    const allQuestions = domandaRepo[lang]["L" + lvl];
    if(!allQuestions) return;

    // Mescola e pesca 15 domande
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
        state.history[lang].push({ q: "Q" + (state.currentQuestionIndex+1), ok: isOk });
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}" style="margin-top:25px; padding:20px; border-radius:15px; animation: slideUp 0.3s ease">
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
        if (!state.progress[lang]) state.progress[lang] = [];
        if (!state.progress[lang].includes(level)) {
            state.progress[lang].push(level);
        }
        saveMasterDB();
    }
    alert("Livello completato!");
    renderLevels(lang);
}

// 7. PROFILO E ALTRE AZIONI (Invariate)
function renderProfile() {
    updateNav(true, "showHome()");
    let html = "";
    if (state.mode === 'admin') {
        document.getElementById('app-title').innerText = "GESTIONE";
        Object.keys(dbUsers).forEach(pin => {
            if (pin === ADMIN_PIN) return;
            html += `<div class="review-card" style="margin-bottom:12px; padding:15px; display:flex; justify-content:space-between">
                <div><strong>${dbUsers[pin].name}</strong></div>
                <button onclick="adminDelete('${pin}')">🗑️</button>
            </div>`;
        });
    } else {
        document.getElementById('app-title').innerText = "PROFILO";
        html += `<h3>Ciao, ${state.currentUser}</h3><button class="btn-apple" onclick="userSelfDelete()">Elimina Profilo</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function showPopup(title, desc, confirmLabel, actionFn) { if (confirm(desc)) actionFn(); }
function logout() { state.mode = null; location.reload(); }
function adminDelete(pin) { delete dbUsers[pin]; saveMasterDB(); renderProfile(); }
function userSelfDelete() { delete dbUsers[state.currentPin]; saveMasterDB(); location.reload(); }

// ==========================================
// SEZIONE LIVELLO 5 - MODIFICA SOLO QUI SOTTO
// ==========================================

const challenges5 = {
    "HTML": { task: "Usa il tag per creare un elemento di una lista.", logic: "li" },
    "Python": { task: "Scrivi il comando per stampare un testo.", logic: "print" },
    "JavaScript": { task: "Scrivi il comando per creare un ciclo for.", logic: "for" }
};

function renderL5(lang) {
    updateNav(true, `renderLevels('${lang}')`);
    const c = challenges5[lang] || { task: "In arrivo", logic: "" };
    document.getElementById('content-area').innerHTML = `
        <h3>ESAMINATI: ${lang}</h3>
        <p style="font-size:14px; margin-bottom:10px">${c.task}</p>
        <textarea id="ed" style="width:100%; height:150px; background:var(--card); color:var(--text); border:1px solid var(--border); border-radius:10px; padding:10px; font-size:16px"></textarea>
        <button class="btn-apple btn-primary" style="margin-top:10px" onclick="runL5('${lang}')">Verifica</button>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-top:10px">Codice non corretto.</div>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value.toLowerCase();
    if(v.includes(challenges5[l].logic)) {
        if (state.mode === 'user') {
            if (!state.progress[l]) state.progress[l] = [];
            if (!state.progress[l].includes(5)) state.progress[l].push(5);
            saveMasterDB();
        }
        alert("Esame superato!");
        showHome();
    } else { document.getElementById('l5-err').style.display = "block"; }
}
