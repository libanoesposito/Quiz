// 1. DATABASE E STATO (TUO ORIGINALE)
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};
let state = {
    mode: null,      
    currentPin: null, 
    currentUser: null, 
    progress: {},    
    history: {}
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

function updateNav(showBack, backTarget) {
    const b = document.getElementById('back-nav');
    const r = document.getElementById('right-nav');
    b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">\u2039 Indietro</span>` : "";
    r.innerHTML = state.mode ? `<span class="logout-link" onclick="logout()">Esci</span>` : "";
}

function saveMasterDB() {
    if (state.mode === 'user' && state.currentPin) {
        dbUsers[state.currentPin].progress = state.progress;
        dbUsers[state.currentPin].history = state.history;
    }
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// 2. LOGIN E PIN (TUO ORIGINALE)
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
    if (pin === ADMIN_PIN) { state.mode = 'admin'; state.currentUser = "Creatore"; showHome(); return; }

    if (type === 'register') {
        const name = document.getElementById('name-field')?.value.trim();
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

// 3. NAVIGAZIONE PERCORSI (TUO ORIGINALE)
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });
    if(state.mode !== 'guest') html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'PANNELLO ADMIN':'IL MIO PROFILO'}</div></div>`;
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; 
    const comp = state.progress[lang] || 0;
    for(let i=1; i<=5; i++) {
        let label = (i === 5) ? "ESAMINATI" : "Livello " + i;
        let isLocked = false;
        // Logica blocchi originale
        if (state.mode !== 'guest') {
            if (i === 4 && comp < 3) isLocked = true;
            if (i === 5 && comp < 3) isLocked = true;
            if (i > comp + 1 && i < 4) isLocked = true;
        }
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">
            ${label} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 4. QUIZ (TUO ORIGINALE)
function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const key = "L" + lvl;
        const stringhe = domandaRepo[lang][key];
        if(!stringhe) return;
        const selezione = stringhe.slice(0, 15).map(r => {
            const p = r.split("|");
            return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
        });
        session = { lang: lang, lvl: lvl, q: selezione, idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    const progress = (session.idx / session.q.length) * 100;
    document.getElementById('content-area').innerHTML = `
        <div style="width:100%; margin-bottom:15px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:5px">
                <span>DOMANDA ${session.idx + 1}/${session.q.length}</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.3s"></div>
            </div>
        </div>
        <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
        <div id="opts" style="width:100%">${data.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({ q: data.q, ok: isOk });
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}">
            <strong>${isOk?'Giusto!':'Sbagliato'}</strong>
            <p>${data.exp}</p>
            <button class="btn-apple btn-primary" onclick="next()">Continua</button>
        </div>`;
}

function next() {
    session.idx++; 
    if(session.idx < session.q.length) renderQ(); 
    else { 
        state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
        saveMasterDB();
        showLevels(session.lang); 
    }
}

// 5. LIVELLO 5 (INTEGRATO CON DOMANDA E CONTROLLO)
function renderL5(lang) {
    updateNav(true, `showLevels('${lang}')`);
    // Definiamo le sfide per lingua
    const sfide = {
        "Python": { task: "Stampa a video la parola 'Hello'.", logic: "print" },
        "JavaScript": { task: "Crea un ciclo che usi 'for' o 'while'.", logic: "for" },
        "HTML": { task: "Inserisci un tag per una lista puntata.", logic: "li" }
    };
    const sfidaCorrente = sfide[lang] || { task: "Scrivi il codice richiesto.", logic: "" };

    document.getElementById('content-area').innerHTML = `
        <h3>ESAMINATI: ${lang}</h3>
        <p style="font-size:14px; margin-bottom:15px; opacity:0.8">${sfidaCorrente.task}</p>
        <textarea id="ed" class="btn-apple" style="width:100%; height:180px; font-family:monospace; text-align:left; padding:15px; background:var(--card); resize:none" placeholder="// Scrivi qui il codice..."></textarea>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-top:10px; font-size:13px">Codice non corretto, controlla la logica.</div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="runL5('${lang}', '${sfidaCorrente.logic}')">Verifica Esame</button>`;
}

function runL5(l, parolaChiave) {
    const v = document.getElementById('ed').value.toLowerCase();
    if(v.includes(parolaChiave.toLowerCase()) && v.trim().length > 3) {
        state.progress[l] = 5;
        saveMasterDB();
        alert("Esame Superato!");
        showHome();
    } else { 
        document.getElementById('l5-err').style.display = "block"; 
    }
}

// 6. PROFILO E POPUP (TUO ORIGINALE)
function renderProfile() {
    updateNav(true, "showHome()");
    let html = "";
    if (state.mode === 'admin') {
        document.getElementById('app-title').innerText = "GESTIONE";
        Object.keys(dbUsers).forEach(pin => {
            if (pin === ADMIN_PIN) return;
            const u = dbUsers[pin];
            html += `<div class="review-card" style="border-left:4px solid var(--accent); margin-bottom:10px">
                <strong>${u.name}</strong> (PIN: ${pin})
                <div style="margin-top:5px">
                    <button onclick="adminReset('${pin}')" style="background:none; border:none; color:orange">Resetta</button>
                    <button onclick="adminDelete('${pin}')" style="background:none; border:none; color:red; margin-left:10px">Elimina</button>
                </div>
            </div>`;
        });
    } else {
        document.getElementById('app-title').innerText = "PROFILO";
        html += `<h3>Ciao, ${state.currentUser}</h3>
        <div class="security-box" onclick="toggleSecurity()" style="cursor:pointer; padding:10px; background:var(--card); border-radius:8px">Sicurezza Account ›</div>
        <div class="security-content" style="display:none; margin-top:10px">
            <button class="btn-apple" onclick="userChangePin()">Cambia PIN</button>
            <button class="btn-apple" onclick="userSelfDelete()" style="color:red">Elimina Profilo</button>
        </div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function toggleSecurity() {
    const content = document.querySelector('.security-content');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    if(confirm("Vuoi uscire?")) {
        state.mode = null;
        renderLogin();
    }
}
