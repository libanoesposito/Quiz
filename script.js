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
        if (/^(\d)\1{3}$/.test(pin)) { errorEl.innerText = "PIN troppo semplice (cifre ripetute)"; errorEl.style.display = "block"; return; }
        if ("0123456789876543210".includes(pin)) { errorEl.innerText = "PIN non valido (sequenza numerica)"; errorEl.style.display = "block"; return; }
        if (dbUsers[pin]) { errorEl.innerText = "Questo PIN è già in uso"; errorEl.style.display = "block"; return; }

        dbUsers[pin] = { name: name, progress: {}, history: {} };
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
    } else {
        if (!dbUsers[pin]) { errorEl.innerText = "PIN errato o utente inesistente"; errorEl.style.display = "block"; return; }
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
        
        // I blocchi valgono solo per 'user'
        if (state.mode === 'user') {
            if (i === 4 && comp < 3) isLocked = true;
            if (i === 5 && comp < 3) isLocked = true;
        }

        // Recupero progresso parziale per visualizzazione X/15
        let currentIdx = 0;
        if (state.mode === 'user' && dbUsers[state.currentPin] && dbUsers[state.currentPin].activeProgress) {
            currentIdx = dbUsers[state.currentPin].activeProgress[`${lang}_${i}`] || 0;
        }
        
        // Se il livello è già completato, mostriamo 15/15
        if (comp >= i) currentIdx = 15;

        // Calcolo percentuale per la barra
        const percentage = (currentIdx / 15) * 100;

        html += `
            <button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})" style="display:block; text-align:left; padding: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                    <span>${label} ${isLocked ? '🔒' : ''}</span>
                    ${(state.mode === 'user' && !isLocked) ? `<span style="font-size:12px; opacity:0.6">${currentIdx}/15</span>` : ''}
                </div>
                ${(state.mode === 'user' && !isLocked) ? `
                    <div class="progress-container">
                        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                ` : ''}
            </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}



function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const key = "L" + lvl;
        const stringhe = domandaRepo[lang][key];
        if(!stringhe || stringhe.length === 0) {
            document.getElementById('content-area').innerHTML = `<h3>In arrivo</h3><button class="btn-apple" onclick="showLevels('${lang}')">Indietro</button>`;
            return;
        }
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
        
        // --- NUOVO: Salva il progresso parziale ---
        if (!dbUsers[state.currentPin].activeProgress) {
            dbUsers[state.currentPin].activeProgress = {};
        }
        // Salviamo l'indice della prossima domanda (idx + 1)
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
    if(session.idx < session.q.length) renderQ(); 
    else { 
        if (state.mode === 'user') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
            
            // RESETTA IL PROGRESSO PARZIALE PERCHÉ IL LIVELLO È FINITO
            if (dbUsers[state.currentPin].activeProgress) {
                dbUsers[state.currentPin].activeProgress[`${session.lang}_${session.lvl}`] = 0;
            }
            
            saveMasterDB();
        }
        alert("Ottimo lavoro!");
        showLevels(session.lang); 
    }
}


function renderProfile() {
    updateNav(true, "showHome()");
    let html = "";

    // Cerca questo punto dentro renderProfile()
if (state.mode === 'admin') {
    document.getElementById('app-title').innerText = "GESTIONE UTENTI";
    html += `
        <div style="text-align:right; margin-bottom: 15px;">
            <button onclick="adminRefresh()" class="btn-apple" style="display:inline-block; width:auto; padding:5px 15px; font-size:12px">Aggiorna Dati 🔄</button>
        </div>
        <div style="text-align:left; width:100%">
    `;
    // ... resta del ciclo Object.keys ...

        Object.keys(dbUsers).forEach(pin => {
            if (pin === '3473') return; // Nasconde l'admin dalla lista utenti
            
            const u = dbUsers[pin];
            html += `
            <div class="review-card" style="border-left:4px solid var(--accent); margin-bottom:15px">
                <div style="display:flex; justify-content:space-between; align-items:start">
                    <div>
                        <strong style="font-size:16px">${u.name}</strong><br>
                        <span style="font-size:11px; opacity:0.6">${Object.keys(u.progress).map(l=>`${l}:L${u.progress[l]}`).join(' | ') || 'Nessun progresso'}</span>
                    </div>
                    <div style="display:flex; gap:10px">
                        <button onclick="adminReset('${pin}')" style="background:none; border:none; color:#ff9500; font-size:18px; cursor:pointer" title="Resetta Progressi">🔄</button>
                        <button onclick="adminDelete('${pin}')" style="background:none; border:none; color:#ff3b30; font-size:18px; cursor:pointer" title="Elimina Utente">🗑️</button>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    } else {
        document.getElementById('app-title').innerText = "PROFILO";
        html += `
            <div style="width:100%; text-align:left">
                <h3>Ciao, ${state.currentUser}</h3>
                
                <div class="security-box">
                    <div class="security-header" onclick="toggleSecurity()">
                        <span>Sicurezza Account</span>
                        <span class="chevron">›</span>
                    </div>
                    <div class="security-content">
                        <button class="btn-apple" style="background:var(--card); font-size:14px; margin-bottom:8px" onclick="userChangePin()">Cambia il tuo PIN</button>
                        <button class="btn-apple" style="background:rgba(255,59,48,0.1); color:#ff3b30; font-size:14px; border:none" onclick="userSelfDelete()">Elimina il mio profilo</button>
                    </div>
                </div>

                <h4 style="border-bottom:1px solid var(--border); padding-bottom:5px; margin-top:20px">Cronologia Ripasso</h4>
        `;
        
        Object.keys(state.history).forEach(lang => {
            state.history[lang].slice(-3).reverse().forEach(item => {
                html += `<div class="review-card ${item.ok?'is-ok':'is-err'}" style="font-size:12px; margin-bottom:5px">${item.q}</div>`;
            });
        });
        html += `</div>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

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
        state.progress[l] = 5;
        saveMasterDB();
        showHome();
    } else { document.getElementById('l5-err').style.display = "block"; }
}
// --- FUNZIONI ADMIN ---
function adminReset(pin) {
    if(confirm(`Vuoi resettare i progressi di ${dbUsers[pin].name}?`)) {
        dbUsers[pin].progress = {};
        dbUsers[pin].history = {};
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
        renderProfile();
    }
}

function adminDelete(pin) {
    if(confirm(`ELIMINARE DEFINITIVAMENTE l'utente ${dbUsers[pin].name}?`)) {
        delete dbUsers[pin];
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
        renderProfile();
    }
}

// --- FUNZIONI UTENTE ---
function userChangePin() {
    const nuovo = prompt("Inserisci il nuovo PIN di 4 cifre:");
    if (!nuovo || nuovo.length !== 4 || isNaN(nuovo)) {
        alert("PIN non valido.");
        return;
    }
    if ("0123456789876543210".includes(nuovo) || /^(\d)\1{3}$/.test(nuovo)) {
        alert("PIN troppo semplice, scegline un altro.");
        return;
    }
    
    // Sposta i dati dal vecchio PIN al nuovo
    const datiVecchi = dbUsers[state.currentPin];
    delete dbUsers[state.currentPin];
    dbUsers[nuovo] = datiVecchi;
    state.currentPin = nuovo;
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
    alert("PIN aggiornato con successo!");
}

function userSelfDelete() {
    if(confirm("Sei sicuro di voler eliminare il tuo profilo? Questa azione è irreversibile.")) {
        delete dbUsers[state.currentPin];
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
        location.reload(); // Torna al login
    }
}
// Mostra il popup invece del confirm
function logout() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
    }
}

function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
    }
}


function confirmLogout() {
    closeLogoutModal();
    state.mode = null;
    state.currentPin = null;
    state.currentUser = null;
    state.progress = {};
    state.history = {};
    session = null;
    renderLogin();
}
// --- FUNZIONI DI SUPPORTO ---
function saveMasterDB() {
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// --- AZIONI PER L'ADMIN ---
function adminReset(pin) {
    showPopup(
        "Reset Progressi", 
        `Vuoi azzerare i progressi di ${dbUsers[pin].name}?`, 
        "Resetta", 
        () => {
            dbUsers[pin].progress = {};
            dbUsers[pin].history = {};
            saveMasterDB();
            renderProfile(); // Ricarica la vista per vedere le modifiche
        }
    );
}

function adminDelete(pin) {
    showPopup(
        "Elimina Utente", 
        `Sei sicuro di voler eliminare definitivamente ${dbUsers[pin].name}?`, 
        "Elimina", 
        () => {
            delete dbUsers[pin];
            saveMasterDB();
            renderProfile();
        }
    );
}

// --- AZIONI PER L'UTENTE ---
function userChangePin() {
    const nuovo = prompt("Inserisci il nuovo PIN di 4 cifre:");
    if (!nuovo || nuovo.length !== 4 || isNaN(nuovo)) {
        alert("PIN non valido. Usa 4 cifre.");
        return;
    }
    // Verifica sicurezza base
    if (/^(\d)\1{3}$/.test(nuovo) || "0123456789876543210".includes(nuovo)) {
        alert("PIN troppo semplice.");
        return;
    }
    
    const dati = dbUsers[state.currentPin];
    delete dbUsers[state.currentPin];
    dbUsers[nuovo] = dati;
    state.currentPin = nuovo;
    saveMasterDB();
    alert("PIN aggiornato con successo!");
}
function toggleSecurity() {
    const box = document.querySelector('.security-box');
    if (box) box.classList.toggle('open');
}


function userSelfDelete() {
    showPopup(
        "Elimina Profilo", 
        "Questa azione è irreversibile. Tutti i tuoi progressi andranno persi.", 
        "Elimina Account", 
        () => {
            delete dbUsers[state.currentPin];
            saveMasterDB();
            location.reload(); // Torna al login
        }
    );
}

// --- FUNZIONI DI SALVATAGGIO ---
function saveMasterDB() {
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// --- AZIONI PER L'UTENTE (PROFILO) ---

// Cambia il PIN con un prompt (standard ma efficace)
function userChangePin() {
    const nuovo = prompt("Inserisci il nuovo PIN di 4 cifre:");
    if (!nuovo || nuovo.length !== 4 || isNaN(nuovo)) {
        alert("PIN non valido. Inserisci 4 numeri.");
        return;
    }
    
    const datiUtente = dbUsers[state.currentPin];
    delete dbUsers[state.currentPin]; // Rimuove il vecchio PIN
    dbUsers[nuovo] = datiUtente;     // Crea il nuovo record
    state.currentPin = nuovo;        // Aggiorna la sessione
    saveMasterDB();
    alert("PIN aggiornato! Ricordalo per il prossimo accesso.");
    renderProfile();
}

// Elimina profilo UTENTE (con Popup)
function userSelfDelete() {
    showPopup(
        "Elimina Profilo", 
        "Questa azione è irreversibile. Tutti i tuoi progressi andranno persi.", 
        "Elimina Account", 
        () => {
            delete dbUsers[state.currentPin];
            saveMasterDB();
            location.reload(); // Torna alla schermata di login
        }
    );
}

// --- AZIONI PER L'ADMIN ---

// Resetta i progressi (con Popup)
function adminReset(pin) {
    showPopup(
        "Resetta Progressi", 
        `Vuoi azzerare i punteggi di ${dbUsers[pin].name}?`, 
        "Resetta", 
        () => {
            dbUsers[pin].progress = {};
            dbUsers[pin].history = {};
            saveMasterDB();
            renderProfile();
        }
    );
}

// Elimina utente (con Popup)
function adminDelete(pin) {
    showPopup(
        "Elimina Utente", 
        `Sei sicuro di voler eliminare definitivamente ${dbUsers[pin].name}?`, 
        "Elimina", 
        () => {
            delete dbUsers[pin];
            saveMasterDB();
            renderProfile();
        }
    );
}

// Funzione "Aggiorna" (Ricarica i dati dalla vista Admin)
function adminRefresh() {
    renderProfile();
}
function showPopup(title, desc, confirmLabel, actionFn) {
    const modal = document.getElementById('universal-modal'); // Controlla che l'ID sia questo
    if (!modal) {
        // Se il modale non esiste nell'HTML, usa il vecchio confirm come emergenza
        if (confirm(desc)) actionFn();
        return;
    }
    
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    
    const btn = document.getElementById('modal-confirm-btn');
    btn.innerText = confirmLabel;
    
    // Collega l'azione al tasto di conferma
    btn.onclick = () => {
        actionFn();
        closeModal();
    };
    
    modal.style.setProperty('display', 'flex', 'important');
}

function closeModal() {
    const modal = document.getElementById('universal-modal');
    if (modal) modal.style.setProperty('display', 'none', 'important');
}

function saveCurrentStep(lang, level, questionIndex) {
    if (!dbUsers[state.currentPin].activeProgress) {
        dbUsers[state.currentPin].activeProgress = {};
    }
    
    // Salva a che domanda siamo arrivati per quel preciso livello
    dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = questionIndex;
    saveMasterDB();
}
function renderLevels(lang) {
    updateNav(true, "showHome()");
    let html = `<h2>Livelli ${lang.toUpperCase()}</h2>`;
    
    for (let i = 1; i <= 5; i++) {
        // Recuperiamo il numero REALE di domande dal tuo database
        // Se il livello non esiste ancora, mettiamo 0 come backup
        const totalQuestions = (domandaRepo[lang] && domandaRepo[lang][i]) ? domandaRepo[lang][i].length : 0;
        
        // Recuperiamo il progresso salvato
        const savedProgress = (dbUsers[state.currentPin].activeProgress && dbUsers[state.currentPin].activeProgress[`${lang}_${i}`]) || 0;
        
        // Calcoliamo la percentuale (evitando divisioni per zero)
        const percentage = totalQuestions > 0 ? (savedProgress / totalQuestions) * 100 : 0;
        
        const isLocked = i > (dbUsers[state.currentPin].progress[lang] || 1);
        
        html += `
            <div class="level-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `startQuiz('${lang}', ${i})`}">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span>Livello ${i}</span>
                    <span style="font-size:12px; opacity:0.6">${savedProgress}/${totalQuestions}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    document.getElementById('content-area').innerHTML = html;
}


// Funzione per far partire il quiz
// Funzione per far partire il quiz (USA domandaRepo)
function startQuiz(lang, level) {
    state.currentQuiz = { lang, level };
    
    // Recupera progresso
    if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
    const savedIdx = dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] || 0;
    state.currentQuestionIndex = savedIdx;

    // QUESTO È IL PUNTO CHIAVE: forza il tasto indietro ai livelli
    updateNav(true, `renderLevels('${lang}')`); 
    
    renderQuestion();
}


// Funzione per visualizzare la domanda (USA domandaRepo)
function renderQuestion() {
    const { lang, level } = state.currentQuiz;
    const questions = domandaRepo[lang][level];

    if (state.currentQuestionIndex >= questions.length) {
        finishQuiz(lang, level);
        return;
    }

    const q = questions[state.currentQuestionIndex];
    
    let html = `
        <div class="quiz-container">
            <p style="font-size:12px; opacity:0.5; margin-bottom:10px">Domanda ${state.currentQuestionIndex + 1} di ${questions.length}</p>
            <h2 style="margin-bottom:25px; font-size:20px">${q.question}</h2>
            <div style="display:flex; flex-direction:column; gap:12px">
    `;

    q.options.forEach((opt, idx) => {
        html += `<button class="btn-apple" onclick="checkAnswer(${idx})" style="text-align:left; padding:15px">${opt}</button>`;
    });

    html += `</div></div>`;
    document.getElementById('content-area').innerHTML = html;
}

// Funzione per gestire la risposta (USA domandaRepo)
function checkAnswer(selectedIndex) {
    const { lang, level } = state.currentQuiz;
    const questions = domandaRepo[lang][level];
    
    // 1. Controlla risposta
    const isCorrect = selectedIndex === questions[state.currentQuestionIndex].correct;
    
    // 2. Salva in cronologia
    if (!state.history[lang]) state.history[lang] = [];
    state.history[lang].push({ q: questions[state.currentQuestionIndex].question, ok: isCorrect });

    // 3. Incrementa indice
    state.currentQuestionIndex++;

    // 4. SALVA NEL DATABASE
    if (!dbUsers[state.currentPin].activeProgress) {
        dbUsers[state.currentPin].activeProgress = {};
    }
    dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = state.currentQuestionIndex;
    
    saveMasterDB(); // Assicurati che questa funzione faccia localStorage.setItem

    // 5. Vai avanti
    if (state.currentQuestionIndex < questions.length) {
        renderQuestion();
    } else {
        finishQuiz(lang, level);
    }
}

function finishQuiz(lang, level) {
    // 1. Reset progressi parziali del livello appena finito
    if (dbUsers[state.currentPin].activeProgress) {
        dbUsers[state.currentPin].activeProgress[`${lang}_${level}`] = 0;
    }
    
    // 2. Sblocca il livello successivo se l'utente ha finito il suo livello attuale più alto
    const currentMax = dbUsers[state.currentPin].progress[lang] || 1;
    if (level == currentMax) {
        dbUsers[state.currentPin].progress[lang] = level + 1;
    }
    
    saveMasterDB();
    alert("Complimenti! Livello completato!");
    renderLevels(lang); // Torna alla lista livelli aggiornata
}
function saveMasterDB() {
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}
