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

// 2. INIZIALIZZAZIONE
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
    let nameField = type === 'register' ? `<input type="text" id="name-field" class="btn-apple" placeholder="Il tuo Nome" style="text-align:center; margin-bottom:10px">` : '';
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <h3 style="margin-bottom:20px">${title}</h3>
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin-bottom:10px; display:none; padding:0 20px"></div>
            ${nameField}
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric" placeholder="PIN">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
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
    const comp = state.progress[lang] || 1;
    
    for(let i=1; i<=5; i++) {
        const key = "L" + i;
        const totalQ = (domandaRepo[lang] && domandaRepo[lang][key]) ? domandaRepo[lang][key].length : 0;
        const savedIdx = (dbUsers[state.currentPin]?.activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${i}`]) || 0;
        const percentage = totalQ > 0 ? (savedIdx / totalQ) * 100 : 0;
        
        let isLocked = i > comp;
        if (i === 5 && comp < 4) isLocked = true;

        html += `
            <div class="level-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span>Livello ${i === 5 ? 'ESAMINATI' : 'Livello ' + i} ${isLocked ? '🔒' : ''}</span>
                    <span style="font-size:11px; opacity:0.6">${savedIdx}/${totalQ}</span>
                </div>
                <div class="progress-container" style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px; margin-top:8px">
                    <div class="progress-bar-fill" style="width:${percentage}%; height:100%; background:var(--accent); border-radius:10px; transition:0.3s"></div>
                </div>
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. LOGICA QUIZ (startQuiz, renderQuestion, checkAnswer)
function startQuiz(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    
    const key = "L" + lvl;
    if(!domandaRepo[lang][key]) { alert("Livello non disponibile"); return; }

    state.currentQuiz = { lang, level: lvl };
    const savedIdx = (dbUsers[state.currentPin]?.activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${lvl}`]) || 0;
    state.currentQuestionIndex = savedIdx;

    updateNav(true, `renderLevels('${lang}')`);
    renderQuestion();
}

function renderQuestion() {
    const { lang, level } = state.currentQuiz;
    const questions = domandaRepo[lang]["L" + level];
    
    if (state.currentQuestionIndex >= questions.length) {
        finishQuiz(lang, level);
        return;
    }

    const raw = questions[state.currentQuestionIndex].split("|");
    const qData = { q: raw[0], options: [raw[1], raw[2], raw[3]], correct: parseInt(raw[4]), exp: raw[5] };
    const progress = (state.currentQuestionIndex / questions.length) * 100;

    document.getElementById('content-area').innerHTML = `
        <div style="width:100%; margin-bottom:15px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:5px">
                <span>DOMANDA ${state.currentQuestionIndex + 1}/${questions.length}</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.3s"></div>
            </div>
        </div>
        <h2 style="font-size:18px; margin-bottom:20px">${qData.q}</h2>
        <div id="opts" style="width:100%">${qData.options.map((o,i)=>`<button class="btn-apple" onclick="checkAnswer(${i === qData.correct}, '${qData.exp.replace(/'/g, "\\'")}')">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function checkAnswer(isOk, exp) {
    const { lang, level } = state.currentQuiz;
    if(state.mode === 'user') {
        if(!state.history[lang]) state.history[lang] = [];
        state.history[lang].push({ q: "Domanda " + (state.currentQuestionIndex+1), ok: isOk });
    }

    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}">
            <strong>${isOk?'Giusto!':'Sbagliato'}</strong>
            <p>${exp}</p>
            <button class="btn-apple btn-primary" onclick="nextQuestion()">Continua</button>
        </div>`;
}

function nextQuestion() {
    const { lang, level } = state.currentQuiz;
    state.currentQuestionIndex++;
    
    if (dbUsers[state.currentPin]) {
        if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
        dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = state.currentQuestionIndex;
    }
    saveMasterDB();
    renderQuestion();
}

function finishQuiz(lang, level) {
    if (dbUsers[state.currentPin]?.activeProgress) dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = 0;
    state.progress[lang] = Math.max(state.progress[lang] || 1, level + 1);
    saveMasterDB();
    alert("Livello completato!");
    renderLevels(lang);
}

// 7. PROFILO E AZIONI ADMIN/USER
function renderProfile() {
    updateNav(true, "showHome()");
    let html = "";

    if (state.mode === 'admin') {
        document.getElementById('app-title').innerText = "GESTIONE UTENTI";
        html += `<div style="text-align:right; margin-bottom:15px"><button onclick="renderProfile()" class="btn-apple" style="width:auto; padding:5px 15px">Aggiorna 🔄</button></div>`;
        Object.keys(dbUsers).forEach(pin => {
            if (pin === ADMIN_PIN) return;
            const u = dbUsers[pin];
            html += `
            <div class="review-card" style="border-left:4px solid var(--accent); margin-bottom:15px">
                <div style="display:flex; justify-content:space-between; align-items:start">
                    <div><strong>${u.name}</strong><br><small>PIN: ${pin}</small></div>
                    <div style="display:flex; gap:10px">
                        <button onclick="adminReset('${pin}')" style="background:none; border:none; font-size:18px">🔄</button>
                        <button onclick="adminDelete('${pin}')" style="background:none; border:none; font-size:18px">🗑️</button>
                    </div>
                </div>
            </div>`;
        });
    } else {
        document.getElementById('app-title').innerText = "PROFILO";
        html += `<h3>Ciao, ${state.currentUser}</h3>
            <div class="security-box">
                <div class="security-header" onclick="toggleSecurity()"><span>Sicurezza Account</span><span class="chevron">›</span></div>
                <div class="security-content">
                    <button class="btn-apple" onclick="userChangePin()">Cambia PIN</button>
                    <button class="btn-apple" style="color:#ff3b30" onclick="userSelfDelete()">Elimina Profilo</button>
                </div>
            </div>
            <h4>Cronologia Recente</h4>`;
        (state.history[Object.keys(state.history)[0]] || []).slice(-3).reverse().forEach(h => {
            html += `<div class="review-card ${h.ok?'is-ok':'is-err'}">${h.q}</div>`;
        });
    }
    document.getElementById('content-area').innerHTML = html;
}

// 8. POPUP E MODALI
function showPopup(title, desc, confirmLabel, actionFn) {
    const modal = document.getElementById('universal-modal');
    if (!modal) { if (confirm(desc)) actionFn(); return; }
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    const btn = document.getElementById('modal-confirm-btn');
    btn.innerText = confirmLabel;
    btn.onclick = () => { actionFn(); closeModal(); };
    modal.style.setProperty('display', 'flex', 'important');
}

function closeModal() { document.getElementById('universal-modal').style.display = 'none'; }

function logout() {
    showPopup("Esci", "Vuoi disconnetterti?", "Esci", () => {
        state.mode = null; state.currentPin = null; location.reload();
    });
}

function toggleSecurity() { document.querySelector('.security-box')?.classList.toggle('open'); }

// 9. AZIONI SPECIFICHE
function adminReset(pin) {
    showPopup("Reset", "Azzera progressi?", "Resetta", () => {
        dbUsers[pin].progress = {}; dbUsers[pin].activeProgress = {}; saveMasterDB(); renderProfile();
    });
}

function adminDelete(pin) {
    showPopup("Elimina", "Elimina utente?", "Elimina", () => {
        delete dbUsers[pin]; saveMasterDB(); renderProfile();
    });
}

function userChangePin() {
    const n = prompt("Nuovo PIN (4 cifre):");
    if (n && n.length === 4) {
        const d = dbUsers[state.currentPin]; delete dbUsers[state.currentPin];
        dbUsers[n] = d; state.currentPin = n; saveMasterDB(); alert("PIN Cambiato");
    }
}

function userSelfDelete() {
    showPopup("Elimina", "Elimina il tuo profilo?", "Elimina", () => {
        delete dbUsers[state.currentPin]; saveMasterDB(); location.reload();
    });
}

function renderL5(lang) {
    document.getElementById('content-area').innerHTML = `<h3>Esame ${lang}</h3><p>In arrivo...</p><button class="btn-apple" onclick="renderLevels('${lang}')">Indietro</button>`;
}
