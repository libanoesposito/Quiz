// Database globale degli utenti (caricato da memoria locale)
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
    if (state.mode) {
        r.innerHTML = `<span class="logout-link" onclick="logout()">Esci</span>`;
    } else {
        r.innerHTML = "";
    }
}

function saveMasterDB() {
    if (state.mode === 'user' && state.currentPin) {
        dbUsers[state.currentPin].progress = state.progress;
        dbUsers[state.currentPin].history = state.history;
    }
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

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
    let nameField = type === 'register' ? 
        `<input type="text" id="name-field" class="btn-apple" placeholder="Il tuo Nome" style="text-align:center; margin-bottom:10px">` : '';

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
    errorEl.style.display = "none";

    if(pin.length !== 4) {
        errorEl.innerText = "Il PIN deve essere di 4 cifre";
        errorEl.style.display = "block";
        return;
    }

    if (pin === ADMIN_PIN) {
        state.mode = 'admin';
        state.currentUser = "Creatore";
        showHome();
        return;
    }

    if (type === 'register') {
        const nameInput = document.getElementById('name-field');
        const name = nameInput ? nameInput.value.trim() : "";
        if(!name) { errorEl.innerText = "Inserisci il tuo nome"; errorEl.style.display = "block"; return; }
        if (dbUsers[pin]) { errorEl.innerText = "Questo PIN è già in uso"; errorEl.style.display = "block"; return; }

        dbUsers[pin] = { name: name, progress: {}, history: {} };
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
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
    showHome(); 
}

function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });
    if(state.mode !== 'guest') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'ADMIN':'PROFILO'}</div></div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

// MODIFICATO: Logica sblocchi Guest vs Utente
function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; 
    const prog = state.progress[lang] || 0;
    
    // Per Utente: controlliamo se 1, 2 e 3 sono stati completati
    // In questo sistema, se prog >= 3 significa che ha completato il Livello 3.
    const baseCompletata = (prog >= 3);

    for(let i=1; i<=5; i++) {
        let label = (i === 5) ? "ESAMINATI" : "Livello " + i;
        let isLocked = false;
        
        if (state.mode === 'user') {
            // 1, 2, 3 sempre sbloccati. 4 e 5 richiedono il completamento del 3.
            if ((i === 4 || i === 5) && !baseCompletata) isLocked = true;
        } 
        // Se mode è 'guest', isLocked resta false per tutti i livelli.

        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">
            ${label} ${isLocked ? '🔒' : ''} ${(!isLocked && prog >= i) ? '✅' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// MODIFICATO: Selezione random di 15 domande
function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const key = "L" + lvl;
        const stringhe = domandaRepo[lang][key];
        if(!stringhe || stringhe.length === 0) {
            document.getElementById('content-area').innerHTML = `<h3>In arrivo</h3><button class="btn-apple" onclick="showLevels('${lang}')">Indietro</button>`;
            return;
        }
        
        // Mischia tutte le domande disponibili e ne prende 15
        const rimescolate = [...stringhe].sort(() => 0.5 - Math.random());
        const selezione = rimescolate.slice(0, 15).map(r => {
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
        state.history[session.lang].push({ q: data.q, ok: isOk, exp: data.exp });
        saveMasterDB();
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
        // Salvataggio progressi solo se utente
        if (state.mode === 'user') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
            saveMasterDB();
        }
        alert("Livello completato!");
        showLevels(session.lang); 
    }
}

// --- RESTO DEL CODICE (Profilo, Admin, Livello 5) INVARIATO ---

function renderProfile() {
    updateNav(true, "showHome()");
    let html = "";
    if (state.mode === 'admin') {
        document.getElementById('app-title').innerText = "GESTIONE UTENTI";
        html += `<div style="text-align:left; width:100%">`;
        Object.keys(dbUsers).forEach(pin => {
            if (pin === ADMIN_PIN) return;
            const u = dbUsers[pin];
            html += `<div class="review-card"><strong>${u.name}</strong> (PIN: ${pin})</div>`;
        });
        html += `</div>`;
    } else {
        document.getElementById('app-title').innerText = "PROFILO";
        html += `<h3>Ciao, ${state.currentUser}</h3><button class="btn-apple" onclick="logout()">Esci</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

const challenges5 = {
    "HTML": { task: "Usa il tag per creare un elemento di una lista.", logic: "li" },
    "Python": { task: "Scrivi il comando per stampare un testo.", logic: "print" },
    "JavaScript": { task: "Scrivi il comando per creare un ciclo for.", logic: "for" }
};

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>ESAMINATI: ${lang}</h3>
        <p style="font-size:14px; margin-bottom:10px">${c.task}</p>
        <textarea id="ed" class="code-editor" style="width:100%; height:150px; font-size:16px"></textarea>
        <button class="btn-apple btn-primary" style="margin-top:10px" onclick="runL5('${lang}')">Verifica</button>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-top:10px">Codice non corretto.</div>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value;
    if(v.includes(challenges5[l].logic)) {
        if (state.mode === 'user') {
            state.progress[l] = 5;
            saveMasterDB();
        }
        showHome();
    } else { document.getElementById('l5-err').style.display = "block"; }
}

function logout() {
    state.mode = null;
    renderLogin();
}
