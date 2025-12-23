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
    r.innerHTML = state.mode ? `<span class="logout-link" onclick="logout()">Esci</span>` : "";
}

function saveMasterDB() {
    // Salviamo i progressi solo se siamo in modalità utente e il pin esiste nel database
    if (state.mode === 'user' && state.currentPin && dbUsers[state.currentPin]) {
        dbUsers[state.currentPin].progress = state.progress || {};
        dbUsers[state.currentPin].history = state.history || {};
    }
    
    // Salvataggio fisico sul browser
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
    console.log("DB salvato correttamente.");
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

function isWeakPin(pin) {
    // tutti uguali
    if (/^(\d)\1{3}$/.test(pin)) return true;

    // sequenza crescente
    const asc = "0123456789";
    if (asc.includes(pin)) return true;

    // sequenza decrescente
    const desc = "9876543210";
    if (desc.includes(pin)) return true;

    return false;
}

function validatePin(type) {
    const pinField = document.getElementById('pin-field');
    const pin = pinField ? pinField.value : "";
    const errorEl = document.getElementById('pin-error');
    
    if (errorEl) errorEl.style.display = "none";

    if (pin.length !== 4) {
        errorEl.innerText = "Il PIN deve essere di 4 cifre";
        errorEl.style.display = "block";
        return;
    }

    // Accesso Admin
    if (pin === ADMIN_PIN) {
        state.mode = 'admin';
        state.currentUser = "Creatore";
        state.currentPin = pin; 
        showHome();
        return;
    }

    if (type === 'register') {
        const nameInput = document.getElementById('name-field');
        const name = nameInput ? nameInput.value.trim() : "";

        if (!name) {
            errorEl.innerText = "Inserisci il tuo nome";
            errorEl.style.display = "block";
            return;
        }

        // Controllo reale se il PIN esiste
        if (dbUsers && dbUsers[pin]) {
            errorEl.innerText = "PIN non disponibile";
            errorEl.style.display = "block";
            return;
        }

        if (isWeakPin(pin)) {
            errorEl.innerText = "PIN troppo semplice";
            errorEl.style.display = "block";
            return;
        }

        // Creazione utente pulita
        dbUsers[pin] = {
            name: name,
            progress: {},
            history: {},
            activeProgress: {},
            savedQuizzes: {},
            ripasso: { wrong: [], notStudied: [] }
        };
    } else {
        // Login
        if (!dbUsers || !dbUsers[pin]) {
            errorEl.innerText = "PIN errato o utente inesistente";
            errorEl.style.display = "block";
            return;
        }
    }

    // Login effettuato con successo
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
    updateNav(false);
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;

    // Linguaggi standard
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });

    // Ripasso e Profilo (Solo Utente)
    if(state.mode === 'user') {
        html += `
        <div class="lang-item" onclick="renderRipasso()">
            <img src="https://cdn-icons-png.flaticon.com/512/3389/3389081.png" width="35">
            <div style="margin-top:10px; font-weight:700; font-size:13px">RIPASSO</div>
        </div>
        <div class="lang-item profile-slot" onclick="renderProfile()">
            <div style="font-weight:700">IL MIO PROFILO</div>
        </div>`;
    }

    if(state.mode === 'admin') {
        html += `<div class="lang-item profile-slot" onclick="renderAdminPanel()"><div style="font-weight:700">PANNELLO ADMIN</div></div>`;
    }

    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;

    let html = "";
    const comp = state.progress[lang] || 0;

    for (let i = 1; i <= 5; i++) {

        let label = (i === 5) ? "ESAMINATI" : "Livello " + i;
        let isLocked = false;

        // LOGICA UTENTE
        if (state.mode === 'user') {
            if (i >= 4 && comp < 3) {
                isLocked = true;
            }
        }

        // ADMIN e GUEST sempre sbloccati
        if (state.mode === 'admin' || state.mode === 'guest') {
            isLocked = false;
        }

        let currentIdx = 0;
        if (state.mode === 'user' && dbUsers[state.currentPin]?.activeProgress) {
            currentIdx = dbUsers[state.currentPin].activeProgress[`${lang}_${i}`] || 0;
        }

        if (comp >= i) currentIdx = 15;
        const percentage = (currentIdx / 15) * 100;

        html += `
            <button class="btn-apple"
                ${isLocked ? 'disabled' : ''}
                onclick="startStep('${lang}', ${i})"
                style="display:block; text-align:left; padding:15px">

                <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                    <span>${label} ${isLocked ? '🔒' : ''}</span>
                    ${(state.mode === 'user' && !isLocked)
                        ? `<span style="font-size:12px; opacity:0.6">${currentIdx}/15</span>`
                        : ''}
                </div>

                ${(state.mode === 'user' && !isLocked)
                    ? `<div class="progress-container">
                           <div class="progress-bar-fill" style="width:${percentage}%"></div>
                       </div>`
                    : ''}
            </button>`;
    }

    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    // Mostra sempre tasto esci
    updateNav(true, "showLevels('" + lang + "')");

    // Controllo livello 5 utente
    if(lvl === 5 && state.mode === 'user' && (state.progress[lang] || 0) < 3) return;
    if(lvl === 5) { renderL5(lang); return; }
    
    const key = "L" + lvl;
    const stringhe = domandaRepo[lang][key];
    const storageKey = `${lang}_${lvl}`;

    let selezione;
    if (state.mode === 'user' && dbUsers[state.currentPin].savedQuizzes?.[storageKey]) {
        selezione = dbUsers[state.currentPin].savedQuizzes[storageKey];
    } else {
        const rimescolate = [...stringhe].sort(() => 0.5 - Math.random());
        selezione = rimescolate.slice(0, 15).map(r => {
            const p = r.split("|");
            return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
        });
        if (state.mode === 'user') {
            if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};
            dbUsers[state.currentPin].savedQuizzes[storageKey] = selezione;
        }
    }

    let savedIdx = 0;
    if (state.mode === 'user') {
        savedIdx = dbUsers[state.currentPin].activeProgress?.[storageKey] || 0;
    }

    session = { lang: lang, lvl: lvl, q: selezione, idx: savedIdx };
    saveMasterDB();
    renderQ();
}

function renderQ() {
    updateNav(true, `showLevels('${session.lang}')`);
    const data = session.q[session.idx];
    const progress = (session.idx / session.q.length) * 100;

    const container = document.getElementById('content-area');
    if (!container) return;

    container.innerHTML = `
        <div style="width:100%; margin-bottom:15px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:5px">
                <span>DOMANDA ${session.idx + 1}/${session.q.length}</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.3s"></div>
            </div>
        </div>
        <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
        <div id="opts" style="width:100%">
            ${data.options.map((o, i) => `<button class="btn-apple" onclick="check(${i === data.correct})">${o}</button>`).join('')}
        </div>
        <div id="fb"></div>
        <div style="margin-top:10px; text-align:right">
            <button class="btn-apple btn-info" onclick="markNotStudied(${session.idx})">Non l'ho studiato</button>
        </div>`;
}

function markNotStudied(idx) {
    if (!state.currentPin || !dbUsers[state.currentPin]) return;
    
    const data = session.q[idx];
    const user = dbUsers[state.currentPin];

    // 1. Logica esistente per la sezione Ripasso
    if (!user.ripasso) {
        user.ripasso = { wrong: [], notStudied: [] };
    }
    const giaPresente = user.ripasso.notStudied.some(d => d.q === data.q);
    if (!giaPresente) {
        user.ripasso.notStudied.push({
            q: data.q,
            options: data.options,
            correct: data.correct,
            exp: data.exp
        });
    }

    // 2. NUOVO: Salva nello storico (per colorare la barra di BLU nel profilo)
    if (!state.history[session.lang]) state.history[session.lang] = [];
    state.history[session.lang].push({
        question: data.q,
        isNotStudied: true, // Questo attiva il blu nel renderProfile
        level: session.lvl,  // Indica a quale barra aggiungere il blu
        lvl: session.lvl     // Doppia sicurezza
    });

    // 3. NUOVO: Avanza l'indice del progresso attivo
    if (!user.activeProgress) user.activeProgress = {};
    user.activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;

    // 4. Salva tutto nel DB
    if (typeof saveMasterDB === 'function') saveMasterDB();
    
    // 5. NUOVO: Passa subito alla prossima domanda
    next();
}
function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({
            question: data.q,
            correctAnswer: data.options[data.correct],
            ok: isOk,
            exp: data.exp,
            level: session.lvl // <--- AGGIUNGI QUESTA RIGA
        });
        
        if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
        dbUsers[state.currentPin].activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;
        saveMasterDB();
    }
    if (!isOk && state.mode === 'user') {
    if (!dbUsers[state.currentPin].ripasso) dbUsers[state.currentPin].ripasso = { wrong: [], notStudied: [] };
    if (!dbUsers[state.currentPin].ripasso.wrong.some(d => d.q === data.q)) {
        dbUsers[state.currentPin].ripasso.wrong.push({
            q: data.q,
            options: data.options,
            correct: data.correct,
            exp: data.exp
        });
    }
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
        if (state.mode === 'user') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
            const sk = `${session.lang}_${session.lvl}`;
            dbUsers[state.currentPin].activeProgress[sk] = 0;
            delete dbUsers[state.currentPin].savedQuizzes[sk];
            saveMasterDB();
        }
        showLevels(session.lang); 
    }
}

function logout() {
    state.mode = null; state.currentPin = null; session = null; renderLogin();
}

/* =========================
   PROFILO UTENTE
   ========================= */

function ensureUserId() {
    if (state.mode !== 'user' || !state.currentPin) return;
    const u = dbUsers[state.currentPin];
    if (!u) return;

    if (!u.userId) {
        // Estraiamo tutti gli ID esistenti in modo sicuro
        const allUsers = Object.values(dbUsers);
        const ids = allUsers
            .map(x => x.userId)
            .filter(id => id !== undefined && id !== null);
        
        // Se non ci sono ID, partiamo da 1000 (più professionale), altrimenti Max + 1
        u.userId = ids.length ? Math.max(...ids) + 1 : 1000;
        
        console.log(`Assegnato nuovo ID: ${u.userId} all'utente ${u.name}`);
        saveMasterDB();
    }
}

function calcStats() {
    let tot = 0;
    let ok = 0;
    Object.values(state.history || {}).forEach(arr => {
        arr.forEach(h => {
            tot++;
            if (h.ok) ok++;
        });
    });
    return {
        total: tot,
        correct: ok,
        wrong: tot - ok,
        perc: tot ? Math.round((ok / tot) * 100) : 0
    };
}

function toggleSecurity(el) {
    const content = el.nextElementSibling; // il div .security-content
    if (!content) return;
    content.style.display = content.style.display === 'none' ? 'flex' : 'none';
}

function renderProfile() {
    if (!state.currentPin || !dbUsers[state.currentPin]) return;

    ensureUserId();
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "IL MIO PROFILO";

    const u = dbUsers[state.currentPin];
    const stats = calcStats();
    const totalLevels = Object.keys(domandaRepo);

    const percentTotal = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentTotal / 100) * circumference;

    const isDark = document.body.classList.contains('dark-mode');
    const appleGray = isDark ? '#2c2c2e' : '#e5e5ea';

    const noScrollStyle = `
    <style>
        /* 1. Blocca lo scroll del body esterno */
        body { 
            overflow: hidden !important; 
            height: 100vh !important; 
        }

        /* 2. Rende il contenitore dello scroll invisibile ma funzionale */
        #profile-scroll { 
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            display: flex;
            flex-direction: column;
            align-items: center; /* Centra orizzontalmente le card */
        }

        #profile-scroll::-webkit-scrollbar { display: none !important; }

        /* 3. Il contenitore delle card eredita la larghezza originale */
        .profile-container {
            width: 100%;
            max-width: 800px; /* Si adatta al tuo header */
            padding: 20px 20px 150px 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        /* 4. Reset per le glass-card: tornano a essere come le hai definite tu */
        .profile-container .glass-card {
            width: 100% !important;
            max-width: 500px !important; /* Mantiene la tua dimensione standard */
            flex-shrink: 0; /* Impedisce che si schiaccino */
        }
    </style>
`;

    let progHtml = '';
    const totalQuestionsPerLevel = 15; 
    
    // Variabile per contare i "Non studiati" totali per la barra superiore
    let totalMarkedNotStudied = 0;

    totalLevels.forEach(lang => {
        progHtml += `<div style="margin-bottom:15px"><h4>${lang}</h4>`;
        for (let i = 1; i <= 5; i++) {
            let correct = 0, wrong = 0, markedNotStudied = 0;
            
            if (u.history && u.history[lang]) {
                u.history[lang].forEach(h => {
                    if (Number(h.lvl || h.level) == i) { 
                        if (h.isNotStudied) {
                            markedNotStudied++;
                            totalMarkedNotStudied++; // Accumulo per la card generale
                        }
                        else if (h.ok) correct++;
                        else wrong++;
                    }
                });
            }

            const wGreen = (correct / totalQuestionsPerLevel) * 100;
            const wRed   = (wrong / totalQuestionsPerLevel) * 100;
            const wBlue  = (markedNotStudied / totalQuestionsPerLevel) * 100;
            const percent = Math.round((correct / totalQuestionsPerLevel) * 100);

            progHtml += `
            <div style="margin-bottom:10px">
                <div style="font-size:13px">Livello ${i}</div>
                <div style="height:10px; border-radius:6px; overflow:hidden; display:flex; background:${appleGray}; width:100%">
                    ${wGreen > 0 ? `<div style="width:${wGreen}%; background:#34c759; height:100%"></div>` : ''}
                    ${wRed > 0 ? `<div style="width:${wRed}%; background:#ff3b30; height:100%"></div>` : ''}
                    ${wBlue > 0 ? `<div style="width:${wBlue}%; background:#0a84ff; height:100%"></div>` : ''}
                </div>
                <div style="font-size:11px; text-align:right; margin-top:2px; opacity:0.8">${percent}% corrette</div>
            </div>`;
        }
        progHtml += `</div>`;
    });

    // Calcolo del potenziale totale (es. 15 domande * 5 livelli * numero lingue)
    const totalPotential = totalLevels.length * 5 * 15;

    document.getElementById('content-area').innerHTML = noScrollStyle + `
<div id="profile-scroll">
    <div class="profile-container">
        <div class="glass-card">
            <div><strong>Nome:</strong> ${u.name}</div>
            <div><strong>ID Utente:</strong> ${u.userId}</div>
        </div>

        <div class="glass-card">
            <strong>Statistiche</strong>
            <div style="margin-top:15px; display:flex; gap:20px; align-items:center">
                <div style="position:relative; width:80px; height:80px">
                    <svg width="80" height="80" style="transform:rotate(-90deg)">
                        <circle cx="40" cy="40" r="${radius}" stroke="${appleGray}" stroke-width="6" fill="none"/>
                        <circle cx="40" cy="40" r="${radius}" stroke="#34c759" stroke-width="6" fill="none"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">${percentTotal}%</div>
                </div>
                <div style="flex:1; display:flex; flex-direction:column; gap:8px">
                    <div>
                        <div style="font-size:12px">Corrette: ${stats.correct}</div>
                        <div style="height:8px; background:${appleGray}; border-radius:6px">
                            <div style="width:${(stats.correct / totalPotential) * 100}%; height:100%; background:#34c759; border-radius:6px"></div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:12px">Non studiate: ${totalMarkedNotStudied}</div>
                        <div style="height:8px; background:${appleGray}; border-radius:6px">
                            <div style="width:${(totalMarkedNotStudied / totalPotential) * 100}%; height:100%; background:#0a84ff; border-radius:6px"></div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:12px">Sbagliate: ${stats.wrong}</div>
                        <div style="height:8px; background:${appleGray}; border-radius:6px">
                            <div style="width:${(stats.wrong / totalPotential) * 100}%; height:100%; background:#ff3b30; border-radius:6px"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="glass-card" id="card-prog" onclick="toggleGeneralProgress(this)" style="cursor:pointer">
            <div style="font-weight:600">Progressi generali</div>
            <div id="detailed-progress" style="display:none; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">${progHtml}</div>
        </div>

        <div class="glass-card" id="card-sec" onclick="toggleGeneralContent('security-content', this)" style="cursor:pointer">
            <strong>Sicurezza</strong>
            <div id="security-content" style="display:none; flex-direction:column; gap:8px; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">
                <button class="btn-apple" onclick="userChangePin()">Cambia PIN</button>
                <button class="btn-apple" onclick="resetStats()">Azzera statistiche</button>
                <button class="btn-apple btn-destruct" onclick="userDeleteAccount()">Elimina account</button>
            </div>
        </div>

        <div class="glass-card" id="card-hist" onclick="toggleGeneralContent('history-content', this)" style="cursor:pointer">
            <strong>Storico</strong>
            <div id="history-content" style="display:none; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">${generateHistoryHTML(u)}</div>
        </div>
    </div>
</div>`;
}


// FINESTRE DI APERTURA (Versioni Window)
window.toggleGeneralProgress = function(card) {
    const detailed = document.getElementById('detailed-progress');
    const isHidden = detailed.style.display === 'none';
    detailed.style.display = isHidden ? 'block' : 'none';
    if (isHidden) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.toggleGeneralContent = function(id, card) {
    const content = document.getElementById(id);
    const isHidden = content.style.display === 'none';
    document.querySelectorAll('#security-content, #history-content').forEach(c => c.style.display = 'none');
    content.style.display = isHidden ? 'flex' : 'none';
    if (isHidden && card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
   
function toggleHistory(el) {
    const content = el.nextElementSibling;
    if(content.style.display === "none") {
        content.style.display = "block";
        el.querySelector(".chevron").innerText = "˅";
    } else {
        content.style.display = "none";
        el.querySelector(".chevron").innerText = "›";
    }
}

function generateHistoryHTML(u) {
    let html = "";
    Object.keys(u.history || {}).forEach(lang => {
        html += `<div style="margin-bottom:10px"><strong>${lang}</strong></div>`;
        u.history[lang].forEach((h, idx) => {
            const status = h.ok ? "✅" : "❌";
            html += `<div style="font-size:12px; margin-bottom:6px">
                        ${status} Q${idx + 1}: ${h.question}<br>
                        <em style="opacity:0.6">Risposta corretta: ${h.correctAnswer}</em>
                     </div>`;
        });
    });
    return html || "<div style='font-size:12px; opacity:0.6'>Nessuna domanda fatta</div>";
}

// Toggle per linguaggio
function toggleLangDetails(el){
    const content = el.nextElementSibling;
    if(content) content.style.display = content.style.display==='none'?'block':'none';
    const chevron = el.querySelector('.chevron');
    if(chevron) chevron.style.transform = content.style.display==='block'?'rotate(90deg)':'rotate(0deg)';
}

function toggleCard(el) {
    // Cerca il contenuto della card cliccata
    const content = el.querySelector('.card-content, .security-content, #detailed-progress, #ripasso-content');
    if (!content) return;

    // Chiudi tutte le altre card dello stesso tipo
    document.querySelectorAll('.card-content, .security-content, #detailed-progress, #ripasso-content').forEach(c => {
        if (c !== content) c.style.display = 'none';
    });

    // Mostra/nascondi contenuto della card cliccata
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'flex' : 'none';

    // Scroll verso la card se si apre
    if (isHidden) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - 20, behavior: 'smooth' });
    }
}

function renderRipasso() {
    if (state.mode !== 'user') return;
    const u = dbUsers[state.currentPin];
    if (!u) return;

    // Integrazione Navigazione Standard del sito
    updateNav(true, 'showHome()');
    document.getElementById('app-title').innerText = "RIPASSO";

    const ripasso = u.ripasso || { wrong: [], notStudied: [] };
    const container = document.getElementById('content-area');

    if (ripasso.wrong.length === 0 && ripasso.notStudied.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; opacity:0.5">
                <div style="font-size:40px">🎉</div>
                <p>Niente da ripassare!</p>
            </div>`;
        return;
    }

    // Funzione interna per generare le card con sfumatura laterale
    const createCard = (d, type) => {
        const borderColor = type === 'wrong' ? '#FF3B30' : '#007AFF';
        const bgColor = type === 'wrong' ? 'rgba(255, 59, 48, 0.05)' : 'rgba(0, 122, 255, 0.05)';
        
        return `
        <div style="background: var(--bg-card, rgba(255,255,255,0.05)); 
                    border-left: 6px solid ${borderColor}; 
                    border-radius: 10px; padding: 15px; margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <div style="font-size: 11px; font-weight: 800; color: ${borderColor}; margin-bottom: 5px; text-transform: uppercase;">
                ${type === 'wrong' ? 'Risposta Errata' : 'Da Studiare'}
            </div>
            
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: var(--text-color);">${d.q}</div>
            
            <div style="margin-bottom: 12px;">
                ${d.options.map((opt, i) => {
                    let style = "padding: 8px; border-radius: 6px; margin-bottom: 4px; font-size: 13px; border: 1px solid rgba(120,120,120,0.2);";
                    if (i === d.correct) {
                        style += "background: rgba(52, 199, 89, 0.2); border-color: #34C759; font-weight: bold;";
                    }
                    return `<div style="${style}">${opt} ${i === d.correct ? '✅' : ''}</div>`;
                }).join('')}
            </div>

            ${d.exp ? `
                <div style="background: ${bgColor}; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; color: var(--text-secondary);">
                    <strong>Spiegazione:</strong> ${d.exp}
                </div>` : ''}
        </div>`;
    };

    let html = `<div style="padding-bottom: 20px;">`;

    if (ripasso.wrong.length) {
        html += `<h3 style="font-size:14px; opacity:0.6; margin: 10px 0;">SBAGLIATE DI RECENTE</h3>`;
        html += ripasso.wrong.map(d => createCard(d, 'wrong')).join('');
    }

    if (ripasso.notStudied.length) {
        html += `<h3 style="font-size:14px; opacity:0.6; margin: 25px 0 10px 0;">DOMANDE "NON STUDIATE"</h3>`;
        html += ripasso.notStudied.map(d => createCard(d, 'notStudied')).join('');
    }

    html += `</div>`;
    container.innerHTML = html;
}
function resetStats() {
    openModal(
        "Azzera statistiche",
        "Perderai progressi e storico. Operazione irreversibile.",
        () => {
            state.progress = {};
            state.history = {};
            dbUsers[state.currentPin].activeProgress = {};
            dbUsers[state.currentPin].savedQuizzes = {};
            saveMasterDB();
            renderProfile();
        }
    );
}

function deleteAccount() {
    openModal(
        "Elimina account",
        "Il tuo profilo verrà rimosso. L'admin manterrà i dati.",
        () => {
            dbUsers[state.currentPin].deleted = true;
            saveMasterDB();
            logout();
        }
    );
}

function openModal(title, desc, onConfirm) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-desc").innerText = desc;
    const btn = document.getElementById("modal-confirm-btn");
    btn.onclick = () => { closeModal(); onConfirm(); };
    document.getElementById("universal-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("universal-modal").style.display = "none";
}
/* =========================
   LOGICA GUEST (DEMO)
   ========================= */

const GUEST_LIMITS = {
    1: 3,
    2: 2,
    3: 1
};

function guestLimitReached(lvl, idx) {
    return GUEST_LIMITS[lvl] !== undefined && idx >= GUEST_LIMITS[lvl];
}

// Override soft di startStep
const _startStep = startStep;
startStep = function (lang, lvl) {

    if (state.mode === 'guest') {

        if(lvl>=4) {
    showGuestLocked();
    return;
}

        const key = "L" + lvl;
        const all = domandaRepo[lang][key];
        const maxQ = GUEST_LIMITS[lvl];

        const selezione = [...all]
            .sort(() => 0.5 - Math.random())
            .slice(0, maxQ)
            .map(r => {
                const p = r.split("|");
                return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
            });

        session = { lang, lvl, q: selezione, idx: 0 };
        renderQ();
        return;
    }

    _startStep(lang, lvl);
};

// Override soft di renderQ
const _renderQ = renderQ;
renderQ = function () {

    if (state.mode === 'guest') {

        if (guestLimitReached(session.lvl, session.idx)) {
            showGuestEndModal();
            return;
        }

        updateNav(true, `showLevels('${session.lang}')`);
        const data = session.q[session.idx];

        document.getElementById('content-area').innerHTML = `
            <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
            <div id="opts">
                ${data.options.map((o,i)=>`
                    <button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>
                `).join("")}
            </div>
            <div style="font-size:12px; opacity:0.5; margin-top:10px">
                Demo: ${session.idx + 1}/${session.q.length}
            </div>
            <div id="fb"></div>
        `;
        return;
    }

    _renderQ();
};

// Override soft di next
const _next = next;
next = function () {

    if (state.mode === 'guest') {
        session.idx++;
        renderQ();
        return;
    }

    _next();
};

function showGuestEndModal() {
    openModal(
        "Demo terminata",
        "Registrati per sbloccare tutti i livelli, salvare i progressi e vedere le statistiche.",
        () => {
            closeModal();
            renderLogin();
        }
    );
}

function showGuestLocked() {
    openModal(
        "Accesso bloccato",
        "Registrati per accedere ai livelli avanzati.",
        () => {
            closeModal();
            renderLogin();
        }
    );
}

/* =========================
   PANNELLO ADMIN
   ========================= */

function renderAdminPanel() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "ADMIN";

    const users = Object.entries(dbUsers)
        .filter(([_, u]) => u.userId)
        .map(([pin, u]) => ({
            pin,
            id: u.userId,
            name: u.name,
            stats: calcUserStats(u),
            deleted: u.deleted
        }))
        .sort((a, b) => b.stats.perc - a.stats.perc);

    let html = `<div style="width:100%">`;

    if (users.length === 0) {
        html += `<div style="text-align:center; padding:20px; color:#666">Nessun utente registrato</div>`;
    } else {
        users.forEach(u => {
            const statsText = u.stats.total ? `${u.stats.correct}/${u.stats.total} corrette · ${u.stats.perc}%` : "Nessun progresso";
            html += `
                <div class="review-card ${u.deleted ? 'is-err' : 'is-ok'}">
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <div>
                            <strong>${u.name}</strong>
                            <div style="font-size:12px; opacity:0.6">ID ${u.id}</div>
                        </div>
                        <div style="display:flex; gap:10px">
                            <span style="cursor:pointer" onclick="showUserHistory(${u.id})">⏳</span>
                            <span style="cursor:pointer" onclick="recalcUser(${u.id})">🔄</span>
                            <span style="cursor:pointer; color:#ff3b30" onclick="adminDeleteUser(${u.id})">🗑</span>
                            <span style="cursor:pointer" onclick="adminResetAll()">🗑️🆕</span>
                        </div>
                    </div>
                    <div style="margin-top:8px; font-size:13px">
                        ${statsText}
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function renderAdminUsers() {
    updateNav(true, "showHome()");
    const appTitle = document.getElementById('app-title');
    if (appTitle) appTitle.innerText = "PANNELLO ADMIN";

    const container = document.getElementById('content-area');
    if (!container) return;

    // DEBUG: Controlliamo cosa vede l'admin nella console
    console.log("Database attuale in Admin:", dbUsers);
    
    const pinList = Object.keys(dbUsers || {});

    if (pinList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; opacity:0.6;">
                <div style="font-size:30px; margin-bottom:10px;">👤🚫</div>
                <p>Nessun utente registrato nel database 'quiz_master_db'.</p>
            </div>`;
        return;
    }

    let users = pinList.map((pin, idx) => {
        const u = dbUsers[pin];
        let score = 0;
        
        // Calcolo sicuro del punteggio
        if (u && u.history) {
            Object.values(u.history).forEach(hist => {
                if (Array.isArray(hist)) {
                    hist.forEach(h => { if (h && h.ok) score++; });
                }
            });
        }
        return { 
            id: idx + 1, 
            name: u.name || "Senza Nome", 
            pin: pin, 
            score: score 
        };
    });

    // Ordina per punteggio
    users.sort((a, b) => b.score - a.score);

    let html = `<div class="glass-card" style="background:transparent; border:none; box-shadow:none; padding:10px;">`;
    
    users.forEach(u => {
        html += `
        <div style="margin-bottom:12px; padding:15px; border:1px solid var(--border); border-radius:14px; display:flex; justify-content:space-between; align-items:center; background:var(--bg-card, rgba(255,255,255,0.05));">
            <div style="color:var(--text-color);">
                <div style="font-weight:700; font-size:15px;">${u.name}</div>
                <div style="font-size:11px; opacity:0.5;">PIN: ${u.pin} • Punti: ${u.score}</div>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="modal-btn btn-primary" onclick="showUserHistory('${u.pin}')" style="padding:8px 12px; border-radius:8px;">⏳</button>
                <button class="modal-btn btn-destruct" onclick="adminDeleteUser('${u.pin}')" style="padding:8px 12px; border-radius:8px;">❌</button>
            </div>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function calcUserStats(user) {
    let tot = 0;
    let ok = 0;
    Object.values(user.history || {}).forEach(arr => {
        arr.forEach(h => {
            tot++;
            if (h.ok) ok++;
        });
    });
    return {
        total: tot,
        correct: ok,
        perc: tot ? Math.round((ok / tot) * 100) : 0
    };
}

function recalcUser(userId) {
    const u = findUserById(userId);
    if (!u) return;
    openModal(
        "Ricalcola statistiche",
        "Aggiorna le statistiche di questo utente.",
        () => {
            // stats sono sempre live, qui forziamo solo refresh UI
            renderAdminPanel();
        }
    );
}

function adminDeleteUser(userId) {
    const u = findUserById(userId);
if (!u) return;

openModal(
    "Elimina utente",
    "L’utente verrà eliminato. Lo storico rimarrà visibile all’admin.",
    () => {
        // salva solo lo storico
        const { history, name, userId } = u; // conservi questi
        dbUsers[u.currentPin] = { history, name, userId }; // cancella tutto il resto
        saveMasterDB();
        renderAdminPanel();
    }
);
}

// Mostra i dettagli completi di un utente per l'admin
function showUserDetails(pin) {
    const u = dbUsers[pin];
    if (!u) return;

    const stats = calcUserStats(u);

    // Progressi dettagliati per ogni linguaggio
    const totalLevels = Object.keys(domandaRepo);
    let progHtml = '';
    totalLevels.forEach(lang => {
        const comp = u.progress[lang] || 0;
        progHtml += `<div style="margin-bottom:10px; cursor:pointer" onclick="toggleLangDetails(this)">
                        <strong>${lang}</strong> <span class="chevron">›</span>
                        <div style="display:none; margin-top:5px">`;
        for (let i = 1; i <= 5; i++) {
            let correct = 0, wrong = 0, total = 15;
            if (u.history[lang]) {
                u.history[lang].forEach(h => { if(i <= comp) { if(h.ok) correct++; else wrong++; } });
            }
            const notStudied = total - correct - wrong;
            const percent = total ? Math.round((correct/total)*100) : 0;
            progHtml += `<div style="margin-bottom:6px; font-size:12px">
                            Livello ${i}:
                            <div class="progress-container" style="position:relative; height:8px; border-radius:6px; background:#e0e0e0; overflow:hidden">
                                <div class="progress-bar-fill" style="width:${(correct/total)*100}%; background:#34c759; height:100%"></div>
                                <div class="progress-bar-fill" style="width:${(wrong/total)*100}%; background:#ff3b30; position:absolute; left:${(correct/total)*100}%; height:100%"></div>
                                <div class="progress-bar-fill" style="width:${(notStudied/total)*100}%; background:#ffd60a; position:absolute; left:${(correct+wrong)/total*100}%; height:100%"></div>
                            </div>
                            <div style="text-align:right; font-size:11px">${percent}% corrette</div>
                         </div>`;
        }
        progHtml += `</div></div>`;
    });

    // Storico
    let historyHtml = '';
    Object.entries(u.history || {}).forEach(([lang, arr]) => {
        historyHtml += `<div style="margin-top:10px"><strong>${lang}</strong></div>`;
        arr.forEach((h, idx) => {
            const status = h.ok ? "✅" : h.notStudied ? "🟡" : "❌";
            historyHtml += `<div style="font-size:12px; margin-bottom:2px">
                                ${status} Q${idx+1}: ${h.q}
                                <br><em style="opacity:0.6">Risposta corretta: ${h.correctAns || '—'}</em>
                            </div>`;
        });
    });

    document.getElementById('content-area').innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; gap:15px">
            <div class="glass-card">
                <div><strong>Nome:</strong> ${u.name}</div>
                <div><strong>ID Utente:</strong> ${u.userId}</div>
            </div>

            <div class="glass-card">
                <div><strong>Statistiche generali</strong></div>
                <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px">
                    <div>Corrette: ${stats.correct}</div>
                    <div>Sbagliate: ${stats.total - stats.correct}</div>
                    <div>Non studiate: ${0}</div>
                </div>
            </div>

            <div class="glass-card">
                <strong>Progressi dettagliati</strong>
                <div style="margin-top:10px">${progHtml}</div>
            </div>

            <div class="glass-card">
                <strong>Storico risposte</strong>
                <div style="margin-top:10px; max-height:300px; overflow-y:auto">${historyHtml || "<em>Nessuna domanda fatta</em>"}</div>
            </div>

            <div class="glass-card" style="text-align:right">
                <button class="btn-apple btn-light" onclick="renderAdminPanel()">Indietro</button>
            </div>
        </div>
    `;
}

function findUserById(id) {
    return Object.values(dbUsers).find(u => u.userId === id);
}

function adminResetAll() {
    openModal(
        "Azzeramento totale",
        "Tutte le statistiche, utenti e progressi saranno eliminati. Operazione irreversibile.",
        () => {
            dbUsers = {};              // cancella tutti gli utenti
            state.currentPin = null;   
            state.currentUser = null;  
            state.progress = {};       
            state.history = {};        
            saveMasterDB();           
            renderAdminPanel();        // refresh interfaccia admin
        }
    );
}

/* Cambia PIN */
function userChangePin() {
    openModal("Cambia PIN", `
        Inserisci il nuovo PIN a 4 cifre:
        <input type="password" id="new-pin-field" maxlength="4" inputmode="numeric" style="margin-top:10px; text-align:center; width:80%; padding:8px; border-radius:8px; border:1px solid #ccc">
    `, () => {
        const newPin = document.getElementById('new-pin-field').value;
        if(newPin.length !== 4) { alert("Il PIN deve essere di 4 cifre"); return; }
        if(dbUsers[newPin]) { alert("PIN già in uso"); return; }

        dbUsers[newPin] = dbUsers[state.currentPin];
        delete dbUsers[state.currentPin];
        state.currentPin = newPin;
        saveMasterDB();
        renderProfile();
    });
}

/* Azzera statistiche */
function userResetStats() {
    openModal("Azzera statistiche", "Vuoi azzerare tutte le tue statistiche?", () => {
        const u = dbUsers[state.currentPin];
        u.progress = {};
        u.history = {};
        u.activeProgress = {};
        saveMasterDB();
        renderProfile();
    });
}

/* Elimina account */
function userDeleteAccount() {
    openModal("Elimina Account", "Attenzione: l'account verrà rimosso permanentemente. Vuoi procedere?", () => {
        const pinToDelete = state.currentPin;
        
        if (dbUsers[pinToDelete]) {
            // Elimina definitivamente la chiave dal database
            delete dbUsers[pinToDelete]; 
            
            // Salva il database vuoto
            localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
            
            // Reset dello stato e ritorno al login
            state.mode = 'guest';
            state.currentPin = null;
            state.currentUser = null;
            
            console.log("Account eliminato con successo.");
            renderLogin();
        }
    });
}

/* MODALE GENERICO */
function openModal(title, content, onConfirm) {
    let overlay = document.getElementById('modal-overlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <h3 id="modal-title"></h3>
                <div id="modal-body"></div>
                <button class="modal-btn btn-primary" id="modal-confirm">Conferma</button>
                <button class="modal-btn btn-cancel" id="modal-cancel">Annulla</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = content;

    overlay.style.display = 'flex';

    document.getElementById('modal-confirm').onclick = () => { onConfirm(); overlay.style.display='none'; };
    document.getElementById('modal-cancel').onclick = () => { overlay.style.display='none'; };
}
// Inserisci qui le tue funzioni renderProfile, adminReset, adminDelete, userChangePin che hai nel file
// (Mantenile come sono, sono corrette nel tuo originale)
