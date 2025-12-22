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

    if (!name) {
        errorEl.innerText = "Inserisci il tuo nome";
        errorEl.style.display = "block";
        return;
    }

    if (dbUsers[pin]) {
        errorEl.innerText = "PIN non disponibile";
        errorEl.style.display = "block";
        return;
    }

    if (isWeakPin(pin)) {
        errorEl.innerText = "PIN troppo semplice";
        errorEl.style.display = "block";
        return;
    }

    dbUsers[pin] = {
        name,
        progress: {},
        history: {},
        activeProgress: {},
        savedQuizzes: {}
    };
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
    updateNav(false);
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });
    if(state.mode === 'admin') {
    html += `<div class="lang-item profile-slot" onclick="renderAdminPanel()"><div style="font-weight:700">PANNELLO ADMIN</div></div>`;
} else if(state.mode !== 'guest') {
    html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">IL MIO PROFILO</div></div>`;
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
        <div id="opts" style="width:100%">
            ${data.options.map((o,i) => `<button class="btn-apple" onclick="checkAnswer(${i})">${o}</button>`).join('')}
        </div>
        <div id="fb" style="margin-top:10px"></div>`;

    // Funzione interna per gestire la risposta
    window.checkAnswer = function(selectedIdx) {
        const correct = selectedIdx === data.correct;
        const fbEl = document.getElementById('fb');
        fbEl.innerHTML = `<div style="margin-top:10px; font-size:13px">${data.exp}</div>`;

        if (!correct) {
            // Mostra il pulsante "Non l'ho studiato"
            const optsEl = document.getElementById('opts');
            if (!document.getElementById('not-studied-btn')) {
                const btn = document.createElement('button');
                btn.id = 'not-studied-btn';
                btn.className = 'btn-apple';
                btn.style.marginTop = '10px';
                btn.innerText = "Non l'ho studiato";
                btn.onclick = () => {
                    const pin = state.currentPin;
                    if (!dbUsers[pin].ripasso) dbUsers[pin].ripasso = {};
                    if (!dbUsers[pin].ripasso[session.lang]) dbUsers[pin].ripasso[session.lang] = [];
                    dbUsers[pin].ripasso[session.lang].push({
                        q: data.q,
                        options: data.options,
                        correct: data.correct,
                        exp: data.exp
                    });
                    saveMasterDB();
                    btn.disabled = true;
                    btn.innerText = "Aggiunto al ripasso";
                };
                optsEl.appendChild(btn);
            }
        }

        // Salvataggio automatico dei progressi utente (già esistente)
        if (state.mode === 'user') {
            const key = `${session.lang}_L${session.lvl}`;
            if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
            dbUsers[state.currentPin].activeProgress[key] = session.idx + 1;
            saveMasterDB();
        }
    };
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
    if (state.mode !== 'user') return;
    const u = dbUsers[state.currentPin];
    if (!u.userId) {
        const ids = Object.values(dbUsers)
            .map(x => x.userId)
            .filter(x => typeof x === 'number');
        u.userId = ids.length ? Math.max(...ids) + 1 : 1;
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

function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "IL MIO PROFILO";

    const u = dbUsers[state.currentPin];
    const stats = calcStats();
    const totalLevels = Object.keys(domandaRepo);

    let html = `<div style="width:100%">`;

    // CARD INFORMAZIONI GENERALI
    html += `
        <div class="review-card">
            <div><strong>Nome:</strong> ${u.name}</div>
            <div><strong>ID Utente:</strong> ${u.userId}</div>
        </div>

        <div class="review-card">
            <div><strong>Risposte corrette:</strong> ${stats.correct}</div>
            <div><strong>Risposte sbagliate:</strong> ${stats.wrong}</div>
            <div><strong>Argomenti non studiati:</strong> ${stats.total - (stats.correct + stats.wrong)}</div>
        </div>
    `;

    // CARD PROGRESSI PER ARGOMENTO (accordion)
    html += `<div class="review-card"><strong>Progressi</strong>`;

    totalLevels.forEach(lang => {
        const comp = state.progress[lang] || 0;

        // Header cliccabile per espansione
        html += `
            <div class="accordion">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
                    ${lang} <span class="chevron">›</span>
                </div>
                <div class="accordion-content">
        `;

        // Barre di progresso per livelli
        for (let i = 1; i <= 5; i++) {
            let correct = 0, wrong = 0, total = 15;
            if(u.history[lang]){
                u.history[lang].forEach(h => {
                    if(i <= comp){ if(h.ok) correct++; else wrong++; }
                });
            }
            const notStudied = total - correct - wrong;
            const percent = total ? Math.round((correct/total)*100) : 0;

            html += `
                <div style="margin-bottom:8px">
                    <div style="font-size:13px">Livello ${i}</div>
                    <div class="progress-container">
                        <div class="progress-bar-fill" style="width:${(correct/total)*100}%; background:#34c759"></div>
                        <div class="progress-bar-fill" style="width:${(wrong/total)*100}%; background:#ff3b30; position:absolute; left:${(correct/total)*100}%"></div>
                        <div class="progress-bar-fill" style="width:${(notStudied/total)*100}%; background:#aaa; position:absolute; left:${((correct+wrong)/total)*100}%"></div>
                    </div>
                    <div style="font-size:11px; text-align:right">${percent}% corrette</div>
                </div>
            `;
        }

        html += `</div></div>`; // chiusura accordion-content e accordion
    });

    html += `</div>`; // chiusura card progressi

    // CARD SICUREZZA
    html += `
        <div class="security-box">
            <div class="security-header" onclick="toggleSecurity(this)">
                Sicurezza
                <span class="chevron">›</span>
            </div>
            <div class="security-content">
                <button class="btn-apple" onclick="userChangePin()">Cambia PIN</button>
                <button class="btn-apple" onclick="resetStats()">Azzera statistiche</button>
                <button class="btn-apple btn-destruct" onclick="deleteAccount()">Elimina account</button>
            </div>
        </div>
    `;

    document.getElementById('content-area').innerHTML = html;
}

function toggleSecurity(el) {
    el.parentElement.classList.toggle("open");
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
    document.getElementById('app-title').innerText = "PANNELLO ADMIN";

    let users = Object.keys(dbUsers).map((pin, idx) => {
        const user = dbUsers[pin];
        let score = 0;
        Object.values(user.history).forEach(hist=>{
            hist.forEach(h=>{ if(h.ok) score++; });
        });
        return { id: idx+1, name: user.name, pin, score, history: user.history };
    });

    // Ordina per punteggio decrescente
    users.sort((a,b)=>b.score - a.score);

    let html = `<div class="glass-card">`;
    users.forEach(u=>{
        html += `<div style="margin-bottom:15px; padding:10px; border:1px solid var(--border); border-radius:12px; display:flex; justify-content:space-between; align-items:center">
            <div>
                <strong>${u.id}</strong> - ${u.name} (Punteggio: ${u.score})
            </div>
            <div style="display:flex; gap:10px">
                <button class="modal-btn btn-primary" onclick="showUserHistory('${u.pin}')">⏳</button>
                <button class="modal-btn btn-cancel" onclick="adminUpdateStats('${u.pin}')">🔄</button>
                <button class="modal-btn btn-destruct" onclick="adminDeleteUser('${u.pin}')">❌</button>
                <button class="modal-btn btn-destruct" onclick="adminResetUserStats('${u.pin}')">♻️</button>
            </div>
        </div>`;
    });
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
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
        "L’utente verrà marcato come eliminato.",
        () => {
            u.deleted = true;
            saveMasterDB();
            renderAdminPanel();
        }
    );
}

function showUserHistory(userId) {
    const u = findUserById(userId);
    if (!u) return;

    let html = `<div style="width:100%">`;

    Object.entries(u.history || {}).forEach(([lang, arr]) => {
        html += `<h4 style="margin-top:15px">${lang}</h4>`;
        arr.slice(-10).forEach(h => {
            html += `
                <div class="review-card ${h.ok ? 'is-ok' : 'is-err'}">
                    <div style="font-size:13px">${h.q}</div>
                </div>
            `;
        });
    });

    html += `</div>`;

    updateNav(true, "renderAdminPanel()");
    document.getElementById('app-title').innerText = "STORICO";
    document.getElementById('content-area').innerHTML = html;
}

function findUserById(id) {
    return Object.values(dbUsers).find(u => u.userId === id);
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
    openModal("Elimina account", "Vuoi eliminare il tuo account? I dati resteranno visibili all'admin.", () => {
        const u = dbUsers[state.currentPin];
        u.deleted = true;
        saveMasterDB();
        state.mode = 'guest';
        state.currentPin = null;
        session = null;
        renderLogin();
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
