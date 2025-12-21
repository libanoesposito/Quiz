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
    const comp = state.progress[lang] || 1;
    
    for(let i=1; i<=5; i++) {
        const key = "L" + i;
        const totalQ = (domandaRepo[lang] && domandaRepo[lang][key]) ? domandaRepo[lang][key].length : 0;
        const savedIdx = (dbUsers[state.currentPin]?.activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${i}`]) || 0;
        const percentage = totalQ > 0 ? (savedIdx / totalQ) * 100 : 0;
        
        let isLocked = i > comp;
        if (i === 5 && comp < 4) isLocked = true;

        html += `
            <div class="level-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}" style="margin-bottom:10px; padding:18px; position:relative">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-weight:600">${i === 5 ? 'ESAMINATI' : 'Livello ' + i} ${isLocked ? '🔒' : ''}</span>
                    <span style="font-size:12px; opacity:0.5">${savedIdx}/${totalQ}</span>
                </div>
                <div class="progress-container" style="width:100%; height:5px; background:rgba(120,120,128,0.1); border-radius:10px; margin-top:12px; overflow:hidden">
                    <div class="progress-bar-fill" style="width:${percentage}%; height:100%; background:var(--accent); border-radius:10px; transition:0.4s ease"></div>
                </div>
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. LOGICA QUIZ
function startQuiz(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    const key = "L" + lvl;
    state.currentQuiz = { lang, level: lvl };
    const savedIdx = (dbUsers[state.currentPin]?.activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${lvl}`]) || 0;
    state.currentQuestionIndex = savedIdx;
    updateNav(true, `renderLevels('${lang}')`);
    renderQuestion();
}

function renderQuestion() {
    const { lang, level } = state.currentQuiz;
    const questions = domandaRepo[lang]["L" + level];
    if (state.currentQuestionIndex >= questions.length) { finishQuiz(lang, level); return; }

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
        <h2 style="font-size:22px; margin-bottom:30px; line-height:1.3">${qData.q}</h2>
        <div id="opts" style="display:flex; flex-direction:column; gap:12px; width:100%">
            ${qData.options.map((o,i)=>`<button class="btn-apple" style="text-align:left; padding:18px; font-size:16px; background:var(--card)" onclick="checkAnswer(${i === qData.correct}, '${qData.exp.replace(/'/g, "\\'")}')">${o}</button>`).join('')}
        </div>
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
        <div class="feedback-box ${isOk?'correct':'wrong'}" style="margin-top:25px; padding:20px; border-radius:15px; animation: slideUp 0.3s ease">
            <strong style="font-size:18px">${isOk?'Ottimo!':'Riprova'}</strong>
            <p style="margin:10px 0; font-size:15px; line-height:1.4 opacity:0.9">${exp}</p>
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
    alert("Livello completato con successo!");
    renderLevels(lang);
}

// 7. PROFILO
function renderProfile() {
    updateNav(true, "showHome()");
    let html = "";
    if (state.mode === 'admin') {
        document.getElementById('app-title').innerText = "GESTIONE";
        html += `<div style="text-align:right; margin-bottom:15px"><button onclick="renderProfile()" class="btn-apple" style="width:auto; padding:8px 15px; font-size:13px">Aggiorna 🔄</button></div>`;
        Object.keys(dbUsers).forEach(pin => {
            if (pin === ADMIN_PIN) return;
            const u = dbUsers[pin];
            html += `
            <div class="review-card" style="border-left:4px solid var(--accent); margin-bottom:12px; padding:15px; display:flex; justify-content:space-between; align-items:center">
                <div><strong>${u.name}</strong><br><small style="opacity:0.6">PIN: ${pin}</small></div>
                <div style="display:flex; gap:10px">
                    <button onclick="adminReset('${pin}')" style="background:none; border:none; font-size:20px; cursor:pointer">🔄</button>
                    <button onclick="adminDelete('${pin}')" style="background:none; border:none; font-size:20px; cursor:pointer">🗑️</button>
                </div>
            </div>`;
        });
    } else {
        document.getElementById('app-title').innerText = "PROFILO";
        html += `<h3 style="margin-bottom:20px">Ciao, ${state.currentUser}</h3>
            <div class="security-box" style="background:rgba(120,120,128,0.08); border-radius:12px; margin-bottom:25px">
                <div class="security-header" onclick="toggleSecurity()" style="padding:15px; cursor:pointer; display:flex; justify-content:space-between">
                    <span>Sicurezza Account</span><span class="chevron">›</span>
                </div>
                <div class="security-content" style="padding:0 15px; max-height:0; overflow:hidden; transition:0.3s ease">
                    <button class="btn-apple" onclick="userChangePin()" style="margin-bottom:10px; background:var(--card)">Cambia PIN</button>
                    <button class="btn-apple" style="color:#ff3b30; background:none; border:none" onclick="userSelfDelete()">Elimina Profilo</button>
                </div>
            </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 8. POPUP E AZIONI
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
function logout() { showPopup("Esci", "Vuoi disconnetterti?", "Esci", () => { state.mode = null; state.currentPin = null; location.reload(); }); }
function toggleSecurity() { document.querySelector('.security-box')?.classList.toggle('open'); }
function adminReset(pin) { showPopup("Reset", "Azzera progressi?", "Resetta", () => { dbUsers[pin].progress = {}; dbUsers[pin].activeProgress = {}; saveMasterDB(); renderProfile(); }); }
function adminDelete(pin) { showPopup("Elimina", "Elimina utente?", "Elimina", () => { delete dbUsers[pin]; saveMasterDB(); renderProfile(); }); }
function userChangePin() {
    const n = prompt("Nuovo PIN (4 cifre):");
    if (n && n.length === 4) {
        const d = dbUsers[state.currentPin]; delete dbUsers[state.currentPin];
        dbUsers[n] = d; state.currentPin = n; saveMasterDB(); alert("PIN Cambiato");
    }
}
function userSelfDelete() { showPopup("Elimina", "Elimina il tuo profilo?", "Elimina", () => { delete dbUsers[state.currentPin]; saveMasterDB(); location.reload(); }); }

// ==========================================
// SEZIONE LIVELLO 5 - MODIFICA SOLO QUI SOTTO
// ==========================================

const sfideL5 = {
    "HTML": { q: "Crea una lista puntata usando il tag corretto.", ok: "li" },
    "Python": { q: "Qual è il comando per stampare un messaggio?", ok: "print" },
    "JavaScript": { q: "Come scrivi un ciclo che si ripete (for)?", ok: "for" }
};

function renderL5(lang) {
    updateNav(true, `renderLevels('${lang}')`);
    const sfida = sfideL5[lang] || { q: "Scrivi il codice corretto per procedere.", ok: "" };
    
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:left; width:100%">
            <h2 style="margin-bottom:10px">Esame ${lang}</h2>
            <p style="margin-bottom:20px; opacity:0.8; font-size:15px">${sfira.q}</p>
            
            <textarea id="editorL5" 
                style="width:100%; height:180px; background:var(--card); color:var(--text); border:1px solid var(--border); border-radius:12px; padding:15px; font-family:monospace; font-size:16px; resize:none"
                placeholder="Scrivi qui..."></textarea>
            
            <div id="msgL5" style="margin-top:15px; font-size:14px; display:none"></div>
            
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="verifyL5('${lang}')">Verifica Esame</button>
        </div>
    `;
}

function verifyL5(lang) {
    const code = document.getElementById('editorL5').value.toLowerCase();
    const msg = document.getElementById('msgL5');
    const target = sfideL5[lang]?.ok || "";

    if (code.includes(target) && code.length > 2) {
        msg.style.display = "block";
        msg.style.color = "var(--accent)";
        msg.innerText = "Complimenti! Esame superato con successo.";
        
        // Sblocca progresso
        state.progress[lang] = 5;
        saveMasterDB();
        
        setTimeout(() => renderLevels(lang), 1500);
    } else {
        msg.style.display = "block";
        msg.style.color = "#ff3b30";
        msg.innerText = "Risposta non corretta. Controlla la logica e riprova.";
    }
}
