// Database globale degli utenti (caricato da memoria locale)
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};
const challenges5 = {
    "HTML": { 
        task: "Crea un link (tag 'a') che punta a 'https://google.com' con il testo 'Cerca'.", 
        // Accetta spazi e diversi tipi di apici
        check: (code) => /<a\s+href=["']https:\/\/google\.com["']\s*>Cerca<\/a>/i.test(code.trim())
    },
    "CSS": { 
        task: "Cambia il colore di tutti i tag h1 in rosso (red).", 
        check: (code) => {
            const clean = code.replace(/\s/g, '').toLowerCase();
            return clean.includes('h1{color:red') || clean.includes('h1{color:#ff0000');
        }
    },
    "JS": { 
        task: "Scrivi una funzione 'saluta' che restituisce la stringa 'ciao'.", 
        check: (code) => {
            const clean = code.replace(/\s/g, '');
            return (clean.includes('functionsaluta()') || clean.includes('constsaluta=()=>')) && 
                   (clean.includes('return"ciao"') || clean.includes("return'ciao'"));
        }
    },
    "PYTHON": {
        task: "Crea una variabile 'x' con valore 10 e stampala.",
        check: (code) => {
            const clean = code.trim().split('\n').map(line => line.trim());
            return clean.includes('x=10') || clean.includes('x = 10') && 
                   (clean.includes('print(x)') || clean.includes('print (x)'));
        }
    }
};

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
    if(pin.length !== 4) { errorEl.innerText = "Il PIN deve essere di 4 cifre"; errorEl.style.display = "block"; return; }

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
        dbUsers[pin] = { name: name, progress: {}, history: {}, activeProgress: {}, savedQuizzes: {} };
    } else {
        if (!dbUsers[pin]) { errorEl.innerText = "PIN errato o utente inesistente"; errorEl.style.display = "block"; return; }
    }

    state.currentPin = pin;
    state.currentUser = dbUsers[pin].name;
    state.mode = 'user';
    state.progress = dbUsers[pin].progress || {};
    state.history = dbUsers[pin].history || {};
    saveMasterDB();
    showHome();
}

function setGuest() { 
    state.mode = 'guest'; state.progress = {}; state.history = {}; showHome(); 
}

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
    if(state.mode !== 'guest') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'PANNELLO ADMIN':'IL MIO PROFILO'}</div></div>`;
    }
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

        if (state.mode === 'user') {
            // Utente: 1, 2, 3 liberi subito. 4 e 5 bloccati se non ha finito i primi 3.
            if ((i === 4 || i === 5) && comp < 3) isLocked = true;
        } else if (state.mode === 'guest') {
            // Guest: 4 e 5 sempre bloccati (Demo)
            if (i === 4 || i === 5) isLocked = true;
        } 
        // Admin: isLocked rimane sempre false.

        // Recupero progresso (Solo per Admin e User)
        let currentIdx = 0;
        if (state.mode !== 'guest' && dbUsers[state.currentPin]?.activeProgress) {
            currentIdx = dbUsers[state.currentPin].activeProgress[`${lang}_${i}`] || 0;
        }
        if (comp >= i) currentIdx = 15;
        const percentage = (currentIdx / 15) * 100;

        html += `
            <button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})" style="display:block; text-align:left; padding: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                    <span>${label} ${isLocked ? '🔒' : ''}</span>
                    ${(state.mode !== 'guest' && !isLocked) ? `<span style="font-size:12px; opacity:0.6">${currentIdx}/15</span>` : ''}
                </div>
                ${(state.mode !== 'guest' && !isLocked) ? `
                    <div class="progress-container">
                        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>` : ''}
                ${(state.mode === 'guest' && isLocked) ? `<div style="font-size:10px; color:var(--accent); margin-top:5px">Registrati per sbloccare</div>` : ''}
            </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}


function startStep(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    
    const key = "L" + lvl;
    const stringhe = domandaRepo[lang][key];
    const storageKey = `${lang}_${lvl}`;
    
    // Impostiamo il limite: 3 domande per guest, 15 per gli altri
    const limiteDomande = (state.mode === 'guest') ? 3 : 15;

    let selezione;
    // Se utente o admin, cerchiamo il quiz salvato
    if (state.mode !== 'guest' && dbUsers[state.currentPin]?.savedQuizzes?.[storageKey]) {
        selezione = dbUsers[state.currentPin].savedQuizzes[storageKey];
    } else {
        // Altrimenti rimescoliamo
        const rimescolate = [...stringhe].sort(() => 0.5 - Math.random());
        selezione = rimescolate.slice(0, limiteDomande).map(r => {
            const p = r.split("|");
            return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
        });

        // Salviamo solo se non è guest
        if (state.mode !== 'guest') {
            if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};
            dbUsers[state.currentPin].savedQuizzes[storageKey] = selezione;
            saveMasterDB();
        }
    }

    let savedIdx = 0;
    if (state.mode !== 'guest') {
        savedIdx = dbUsers[state.currentPin].activeProgress?.[storageKey] || 0;
    }

    session = { lang: lang, lvl: lvl, q: selezione, idx: savedIdx };
    renderQ();
}

// AGGIORNA QUESTA FUNZIONE: Aggiunta sincronizzazione scroll
function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3 style="text-align:center">ESAME FINALE: ${lang}</h3>
        <p style="font-size:14px; opacity:0.8; text-align:center">${c.task}</p>
        
        <div class="editor-wrapper">
            <pre class="code-highlight" id="pre-highlight"><code id="highlighting-content" class="language-javascript"></code></pre>
            <textarea id="ed" class="code-input" 
                spellcheck="false" 
                autocorrect="off" 
                autocapitalize="off" 
                placeholder="Scrivi il tuo codice qui..."
                oninput="updateEditor(this.value)"
                onscroll="syncScroll(this)"
                onkeydown="handleTab(event, this)"></textarea>
        </div>

        <button class="btn-apple btn-primary" style="margin-top:10px" onclick="runL5('${lang}')">Verifica Codice</button>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-top:10px; text-align:center">Il codice non soddisfa i requisiti logici.</div>`;
}

// NUOVA FUNZIONE: Sincronizza lo scroll per evitare che il colore "scappi" via dal testo
function syncScroll(el) {
    const pre = document.getElementById('pre-highlight');
    pre.scrollTop = el.scrollTop;
    pre.scrollLeft = el.scrollLeft;
}

// AGGIORNA QUESTA FUNZIONE: Migliorata la stabilità del click
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    
    // Assicurati che domandaRepo esista prima di ciclare
    if (typeof domandaRepo !== 'undefined') {
        Object.keys(domandaRepo).forEach(l => {
            const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
            html += `
            <div class="lang-item" onclick="showLevels('${l}')" style="cursor:pointer">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
                <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
            </div>`;
        });
    }

    if(state.mode !== 'guest') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'PANNELLO ADMIN':'IL MIO PROFILO'}</div></div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

// Funzione per sincronizzare testo e colori
function updateEditor(text) {
    let resultElement = document.getElementById("highlighting-content");
    // Protezione per i caratteri HTML
    let content = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;");
    resultElement.innerHTML = content;
    Prism.highlightElement(resultElement);
}

// Per permettere l'uso del tasto TAB nell'editor
function handleTab(e, el) {
    if (e.key === 'Tab') {
        e.preventDefault();
        let start = el.selectionStart;
        let end = el.selectionEnd;
        el.value = el.value.substring(0, start) + "    " + el.value.substring(end);
        el.selectionStart = el.selectionEnd = start + 4;
        updateEditor(el.value);
    }
}


function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({ q: data.q, ok: isOk, exp: data.exp });
        if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
        dbUsers[state.currentPin].activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;
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
    if(session.idx < session.q.length) {
        renderQ(); 
    } else { 
        if (state.mode !== 'guest') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
            const sk = `${session.lang}_${session.lvl}`;
            if(dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress[sk] = 0;
            if(dbUsers[state.currentPin].savedQuizzes) delete dbUsers[state.currentPin].savedQuizzes[sk];
            saveMasterDB();
            alert("Livello completato!");
        } else {
            alert("Fine della Demo! Registrati per accedere a tutte le 15 domande e ai livelli avanzati.");
        }
        showLevels(session.lang); 
    }
}


function logout() {
    state.mode = null; state.currentPin = null; session = null; renderLogin();
}
function runL5(lang) {
    const code = document.getElementById('ed').value;
    const challenge = challenges5[lang];
    const errorEl = document.getElementById('l5-err');
    
    if (challenge.check(code)) {
        errorEl.style.display = "none";
        alert("Esame Superato! Sei un esperto di " + lang);
        // Segna come completato il livello 5
        state.progress[lang] = 5;
        saveMasterDB();
        showLevels(lang);
    } else {
        errorEl.style.display = "block";
        errorEl.innerText = "Logica errata. Controlla i requisiti dell'esame.";
    }
}

// Inserisci qui le tue funzioni renderProfile, adminReset, adminDelete, userChangePin che hai nel file
// (Mantenile come sono, sono corrette nel tuo originale)
