// 1. DATABASE E STATO
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};
let state = { mode: null, currentPin: null, currentUser: null, progress: {}, history: {} };
let session = null;
const ADMIN_PIN = "3473";

// Sfide Livello 5
const challenges5 = {
    "HTML": { task: "Crea un link (tag 'a') a 'https://google.com' con testo 'Cerca'.", check: (c) => /<a\s+href=["']https:\/\/google\.com["']\s*>Cerca<\/a>/i.test(c.trim()) },
    "CSS": { task: "Cambia il colore di tutti i tag h1 in rosso (red).", check: (c) => { const s = c.replace(/\s/g, '').toLowerCase(); return s.includes('h1{color:red') || s.includes('h1{color:#ff0000'); } },
    "JS": { task: "Scrivi una funzione 'saluta' che restituisce 'ciao'.", check: (c) => { const s = c.replace(/\s/g, ''); return (s.includes('functionsaluta()') || s.includes('constsaluta=()=>')) && (s.includes('return"ciao"') || s.includes("return'ciao'")); } },
    "PYTHON": { task: "Crea una variabile 'x' = 10 e stampala.", check: (c) => { const s = c.replace(/\s/g, ''); return s.includes('x=10') && s.includes('print(x)'); } }
};

// 2. AVVIO
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

// 3. NAVIGAZIONE E MODALI (Sincronizzati con il tuo CSS)
function updateNav(showBack, backTarget) {
    const b = document.getElementById('back-nav');
    const r = document.getElementById('right-nav');
    if(b) b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">\u2039 Indietro</span>` : "";
    // Usiamo openLogoutModal invece di logout diretto
    if(r) r.innerHTML = state.mode ? `<span class="logout-link" onclick="openLogoutModal()">Esci</span>` : "";
}

function openLogoutModal() { 
    // Usiamo lo stile inline per sovrascrivere l'important se necessario
    document.getElementById('logout-modal').style.setProperty('display', 'flex', 'important'); 
}

function closeLogoutModal() { 
    document.getElementById('logout-modal').style.setProperty('display', 'none', 'important'); 
}

function confirmLogout() {
    closeLogoutModal();
    state.mode = null;
    state.currentPin = null;
    renderLogin();
}

// 4. LOGIN
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
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin-bottom:10px; display:none"></div>
            ${nameField}
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric" placeholder="PIN">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const errorEl = document.getElementById('pin-error');
    if(pin.length !== 4) { errorEl.innerText = "PIN di 4 cifre"; errorEl.style.display = "block"; return; }

    if (pin === ADMIN_PIN) {
        state.mode = 'admin'; state.currentUser = "Creatore"; showHome(); return;
    }

    if (type === 'register') {
        const name = document.getElementById('name-field')?.value.trim();
        if(!name) { errorEl.innerText = "Inserisci nome"; errorEl.style.display = "block"; return; }
        if (dbUsers[pin]) { errorEl.innerText = "PIN in uso"; errorEl.style.display = "block"; return; }
        dbUsers[pin] = { name: name, progress: {}, history: {}, activeProgress: {}, savedQuizzes: {} };
    } else {
        if (!dbUsers[pin]) { errorEl.innerText = "PIN errato"; errorEl.style.display = "block"; return; }
    }

    state.currentPin = pin;
    state.currentUser = dbUsers[pin].name;
    state.mode = 'user';
    state.progress = dbUsers[pin].progress || {};
    state.history = dbUsers[pin].history || {};
    saveMasterDB();
    showHome();
}

function setGuest() { state.mode = 'guest'; state.progress = {}; state.history = {}; showHome(); }

function saveMasterDB() {
    if (state.mode === 'user' && state.currentPin) {
        dbUsers[state.currentPin].progress = state.progress;
        dbUsers[state.currentPin].history = state.history;
    }
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// 5. PERCORSI
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    if (typeof domandaRepo !== 'undefined') {
        Object.keys(domandaRepo).forEach(l => {
            const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
            html += `<div class="lang-item" onclick="showLevels('${l}')">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
                <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
            </div>`;
        });
    }
    if(state.mode !== 'guest') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'ADMIN':'PROFILO'}</div></div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; const comp = state.progress[lang] || 0;
    for(let i=1; i<=5; i++) {
        let label = (i === 5) ? "ESAME" : "Livello " + i;
        let isLocked = (state.mode === 'user' && i > 3 && comp < 3) || (state.mode === 'guest' && i > 3);
        let curIdx = (state.mode !== 'guest' && dbUsers[state.currentPin]?.activeProgress?.[`${lang}_${i}`]) || 0;
        if (comp >= i) curIdx = 15;
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})" style="text-align:left; padding:15px; display:block">
            <div style="display:flex; justify-content:space-between"><span>${label} ${isLocked?'🔒':''}</span><span>${!isLocked?curIdx+'/15':''}</span></div>
            ${!isLocked ? `<div class="progress-container"><div class="progress-bar-fill" style="width:${(curIdx/15)*100}%"></div></div>` : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// 6. QUIZ
function startStep(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    const key = "L" + lvl;
    const stringhe = domandaRepo[lang][key];
    const storageKey = `${lang}_${lvl}`;
    const limit = (state.mode === 'guest') ? 3 : 15;
    let quiz = (state.mode !== 'guest' && dbUsers[state.currentPin]?.savedQuizzes?.[storageKey]) || 
               [...stringhe].sort(()=>.5-Math.random()).slice(0,limit).map(s=>{const p=s.split("|"); return {q:p[0],opts:[p[1],p[2],p[3]],cor:parseInt(p[4]),exp:p[5]}});
    
    if(state.mode !== 'guest') {
        if(!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes={};
        dbUsers[state.currentPin].savedQuizzes[storageKey] = quiz;
    }
    session = { lang, lvl, q: quiz, idx: (state.mode !== 'guest' ? (dbUsers[state.currentPin].activeProgress?.[storageKey] || 0) : 0) };
    renderQ();
}

function renderQ() {
    const d = session.q[session.idx];
    updateNav(true, `showLevels('${session.lang}')`);
    document.getElementById('content-area').innerHTML = `
        <small>Domanda ${session.idx+1}/${session.q.length}</small><h3>${d.q}</h3>
        <div id="opts" style="display:flex; flex-direction:column; gap:10px">
            ${d.opts.map((o,i)=>`<button class="btn-apple" onclick="check(${i===d.cor})">${o}</button>`).join('')}
        </div><div id="fb"></div>`;
}

function check(isOk) {
    const d = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({ ok: isOk });
        if(!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress={};
        dbUsers[state.currentPin].activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;
        saveMasterDB();
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `<div class="feedback-box ${isOk?'correct':'wrong'}"><strong>${isOk?'Giusto':'Sbagliato'}</strong><p>${d.exp}</p><button class="btn-apple btn-primary" onclick="next()">Continua</button></div>`;
}

function next() {
    session.idx++;
    if(session.idx < session.q.length) renderQ();
    else {
        if(state.mode !== 'guest') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl);
            dbUsers[state.currentPin].activeProgress[`${session.lang}_${session.lvl}`] = 0;
            saveMasterDB();
        }
        showLevels(session.lang);
    }
}

// 7. PROFILO E ADMIN
function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = state.mode === 'admin' ? "ADMIN" : "PROFILO";
    let html = "";
    if (state.mode === 'admin') {
        html = `<h3>Utenti</h3>`;
        Object.keys(dbUsers).forEach(p => { html += `<div class="review-card" style="display:flex; justify-content:space-between"><span>${dbUsers[p].name} (${p})</span><button onclick="admDel('${p}')" style="color:red; background:none; border:none">Elimina</button></div>`; });
    } else {
        const h = state.history || {}; let t = 0, ok = 0;
        Object.values(h).flat().forEach(x => { t++; if(x.ok) ok++; });
        let media = t > 0 ? ((ok/t)*10).toFixed(1) : "0";
        html = `
            <div class="review-card" style="text-align:center"><small>MEDIA VOTI</small><h1>${media}/10</h1></div>
            <div class="security-box" id="sec-box">
                <div class="security-header" onclick="document.getElementById('sec-box').classList.toggle('open')">
                    Sicurezza <span class="chevron">›</span>
                </div>
                <div class="security-content">
                    <button class="btn-apple" style="margin-top:10px" onclick="alert('Funzione non disponibile')">Cambia PIN</button>
                </div>
            </div>
            <button class="btn-apple" onclick="openLogoutModal()" style="color:red">Esci</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function admDel(p) { if(confirm("Elimina?")) { delete dbUsers[p]; localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers)); renderProfile(); } }

// 8. EDITOR LIVELLO 5
function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `<h3>ESAME: ${lang}</h3><p>${c.task}</p>
        <div class="editor-wrapper">
            <pre class="code-highlight"><code id="highlighting-content" class="language-javascript"></code></pre>
            <textarea id="ed" class="code-input" spellcheck="false" oninput="updateEditor(this.value)" onkeydown="handleTab(event, this)"></textarea>
        </div>
        <button class="btn-apple btn-primary" onclick="runL5('${lang}')">Verifica</button><div id="l5-err" style="color:red; display:none">Errore logico.</div>`;
}

function updateEditor(text) {
    let el = document.getElementById("highlighting-content");
    el.innerHTML = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    if(window.Prism) Prism.highlightElement(el);
}

function handleTab(e, el) { if (e.key === 'Tab') { e.preventDefault(); let s = el.selectionStart; el.value = el.value.substring(0, s) + "    " + el.value.substring(el.selectionEnd); el.selectionStart = el.selectionEnd = s + 4; updateEditor(el.value); } }

function runL5(lang) {
    const code = document.getElementById('ed').value;
    if (challenges5[lang].check(code)) { state.progress[lang] = 5; saveMasterDB(); showLevels(lang); }
    else { document.getElementById('l5-err').style.display = "block"; }
}
