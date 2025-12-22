// 1. DATABASE E STATO
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};
let state = { mode: null, currentPin: null, currentUser: null, progress: {}, history: [] };
let session = null;
const ADMIN_PIN = "3473";

// Sfide Livello 5
const challenges5 = {
    "HTML": { task: "Crea un link (tag 'a') a 'https://google.com' con testo 'Cerca'.", check: (c) => /<a\s+href=["']https:\/\/google\.com["']\s*>Cerca<\/a>/i.test(c.trim()) },
    "CSS": { task: "Cambia il colore di tutti i tag h1 in rosso (red).", check: (c) => { const s = c.replace(/\s/g, '').toLowerCase(); return s.includes('h1{color:red') || s.includes('h1{color:#ff0000'); } },
    "JS": { task: "Scrivi una funzione 'saluta' che restituisce 'ciao'.", check: (c) => { const s = c.replace(/\s/g, ''); return (s.includes('functionsaluta()') || s.includes('constsaluta=()=>')) && (s.includes('return"ciao"') || s.includes("return'ciao'")); } },
    "PYTHON": { task: "Crea una variabile 'x' = 10 e stampala.", check: (c) => { const s = c.replace(/\s/g, ''); return s.includes('x=10') && s.includes('print(x)'); } }
};

// 2. FUNZIONI DI AVVIO OBBLIGATORIE
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

// 3. GESTIONE NAVIGAZIONE E MODALI (Sincronizzati con il tuo HTML)
function updateNav(showBack, backTarget) {
    const b = document.getElementById('back-nav');
    const r = document.getElementById('right-nav');
    if(b) b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">‹ Indietro</span>` : "";
    if(r) r.innerHTML = state.mode ? `<span class="logout-link" onclick="openLogoutModal()">Esci</span>` : "";
}

// Queste funzioni servono a far funzionare i bottoni nel tuo HTML
function openLogoutModal() { 
    const modal = document.getElementById('logout-modal');
    if(modal) modal.style.display = 'flex'; 
}

function closeLogoutModal() { 
    const modal = document.getElementById('logout-modal');
    if(modal) modal.style.display = 'none'; 
}

function confirmLogout() {
    closeLogoutModal();
    logout();
}

function logout() {
    state.mode = null;
    state.currentPin = null;
    renderLogin();
}

// 4. LOGICA DI LOGIN
function renderLogin() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; width:100%; align-items:center">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent)" onclick="setGuest()">Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    let nameInput = type === 'register' ? `<input type="text" id="name-field" class="btn-apple" placeholder="Nome" style="text-align:center; margin-bottom:10px">` : '';
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <div id="pin-error" class="error-inline" style="display:none; color:red; margin-bottom:10px"></div>
            ${nameInput}
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric" placeholder="PIN">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const err = document.getElementById('pin-error');
    
    if(pin.length !== 4) { err.innerText = "PIN di 4 cifre"; err.style.display = "block"; return; }
    
    if (pin === ADMIN_PIN) { state.mode = 'admin'; showHome(); return; }

    if (type === 'register') {
        const name = document.getElementById('name-field')?.value.trim();
        if(!name) { err.innerText = "Inserisci nome"; err.style.display = "block"; return; }
        dbUsers[pin] = { name: name, progress: {}, history: [] };
    } else {
        if (!dbUsers[pin]) { err.innerText = "PIN errato"; err.style.display = "block"; return; }
    }

    state.currentPin = pin;
    state.mode = 'user';
    state.progress = dbUsers[pin].progress || {};
    state.history = dbUsers[pin].history || [];
    saveDB();
    showHome();
}

function setGuest() { state.mode = 'guest'; showHome(); }

function saveDB() {
    if(state.currentPin && state.mode === 'user') {
        dbUsers[state.currentPin].progress = state.progress;
        dbUsers[state.currentPin].history = state.history;
    }
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// 5. HOME E PERCORSI
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    if (window.domandaRepo) {
        Object.keys(domandaRepo).forEach(l => {
            html += `<div class="lang-item" onclick="showLevels('${l}')">
                <div style="font-weight:700">${l}</div>
            </div>`;
        });
    }
    if(state.mode !== 'guest') html += `<div class="lang-item profile-slot" onclick="renderProfile()">PROFILO</div>`;
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; const comp = state.progress[lang] || 0;
    for(let i=1; i<=5; i++) {
        let isLocked = (state.mode === 'user' && i > 3 && comp < 3) || (state.mode === 'guest' && i > 3);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">
            Livello ${i} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. LOGICA QUIZ
function startStep(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    const quiz = domandaRepo[lang]["L"+lvl].slice(0,15).map(s => {
        const p = s.split("|");
        return { q: p[0], opts: [p[1], p[2], p[3]], cor: parseInt(p[4]), exp: p[5] };
    });
    session = { lang, lvl, q: quiz, idx: 0 };
    renderQ();
}

function renderQ() {
    const d = session.q[session.idx];
    document.getElementById('content-area').innerHTML = `
        <small>Domanda ${session.idx+1}/${session.q.length}</small><h3>${d.q}</h3>
        <div id="opts" style="display:flex; flex-direction:column; gap:10px">
            ${d.opts.map((o,i)=>`<button class="btn-apple" onclick="check(${i===d.cor})">${o}</button>`).join('')}
        </div><div id="fb"></div>`;
}

function check(isOk) {
    const d = session.q[session.idx];
    if(state.mode === 'user') state.history.push({ ok: isOk });
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}">
            <p>${d.exp}</p>
            <button class="btn-apple btn-primary" onclick="next()">Continua</button>
        </div>`;
}

function next() {
    session.idx++;
    if(session.idx < session.q.length) renderQ();
    else {
        if(state.mode === 'user') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl);
            saveDB();
        }
        showLevels(session.lang);
    }
}

// 7. PROFILO E LIVELLO 5
function renderProfile() {
    updateNav(true, "showHome()");
    let t = state.history.length, ok = state.history.filter(x=>x.ok).length;
    let media = t > 0 ? ((ok/t)*10).toFixed(1) : "0";
    document.getElementById('content-area').innerHTML = `
        <div class="review-card" style="text-align:center"><h3>Media: ${media}/10</h3></div>
        <button class="btn-apple" style="color:red; text-align:center" onclick="openLogoutModal()">Esci dal Profilo</button>`;
}

function renderL5(lang) {
    document.getElementById('content-area').innerHTML = `
        <h3>ESAME ${lang}</h3><p>${challenges5[lang].task}</p>
        <div class="editor-wrapper">
            <pre class="code-highlight"><code id="highlighting-content"></code></pre>
            <textarea id="ed" class="code-input" oninput="updateEditor(this.value)"></textarea>
        </div>
        <button class="btn-apple btn-primary" onclick="runL5('${lang}')">Verifica Codice</button>`;
}

function updateEditor(val) {
    const el = document.getElementById("highlighting-content");
    if(el) {
        el.innerText = val;
        if(window.Prism) Prism.highlightElement(el);
    }
}

function runL5(lang) {
    const code = document.getElementById('ed').value;
    if(challenges5[lang].check(code)) { 
        state.progress[lang] = 5; saveDB(); showLevels(lang); 
    } else alert("Codice non corretto");
}

// Funzione placeholder per il modale universale per evitare crash
function closeModal() { 
    const modal = document.getElementById('universal-modal');
    if(modal) modal.style.display = 'none'; 
}
