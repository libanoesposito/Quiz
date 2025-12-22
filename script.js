// Database globale degli utenti (caricato da memoria locale)
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};

const challenges5 = {
    "HTML": { 
        task: "Crea un link (tag 'a') che punta a 'https://google.com' con il testo 'Cerca'.", 
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
            const clean = code.replace(/\s/g, '');
            return clean.includes('x=10') && clean.includes('print(x)');
        }
    }
};

let state = { mode: null, currentPin: null, currentUser: null, progress: {}, history: {} };
let session = null;
const ADMIN_PIN = "3473";

window.onload = () => { initTheme(); renderLogin(); };

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
    state.mode = null; updateNav(false);
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
    let nameField = type === 'register' ? `<input type="text" id="name-field" class="btn-apple" placeholder="Nome" style="text-align:center; margin-bottom:10px">` : '';
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <h3 style="margin-bottom:20px">${title}</h3>
            <div id="pin-error" class="error-inline" style="display:none; margin-bottom:10px"></div>
            ${nameField}
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric" placeholder="PIN">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const errorEl = document.getElementById('pin-error');
    if(pin.length !== 4) { errorEl.innerText = "PIN di 4 cifre"; errorEl.style.display = "block"; return; }
    if (pin === ADMIN_PIN) { state.mode = 'admin'; state.currentUser = "Creatore"; showHome(); return; }
    if (type === 'register') {
        const name = document.getElementById('name-field').value.trim();
        if(!name) { errorEl.innerText = "Inserisci nome"; errorEl.style.display = "block"; return; }
        if (dbUsers[pin]) { errorEl.innerText = "PIN occupato"; errorEl.style.display = "block"; return; }
        dbUsers[pin] = { name: name, progress: {}, history: {}, activeProgress: {}, savedQuizzes: {} };
    } else {
        if (!dbUsers[pin]) { errorEl.innerText = "PIN errato"; errorEl.style.display = "block"; return; }
    }
    state.currentPin = pin; state.currentUser = dbUsers[pin].name; state.mode = 'user';
    state.progress = dbUsers[pin].progress || {}; state.history = dbUsers[pin].history || {};
    saveMasterDB(); showHome();
}

function setGuest() { state.mode = 'guest'; state.progress = {}; state.history = {}; showHome(); }

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
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">${state.mode==='admin'?'PANNELLO ADMIN':'IL MIO PROFILO'}</div></div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; const comp = state.progress[lang] || 0;
    for(let i=1; i<=5; i++) {
        let label = (i === 5) ? "ESAME FINALE" : "Livello " + i;
        let isLocked = (state.mode === 'user' && (i === 4 || i === 5) && comp < 3) || (state.mode === 'guest' && i > 3);
        let currentIdx = (state.mode !== 'guest' && dbUsers[state.currentPin]?.activeProgress?.[`${lang}_${i}`]) || 0;
        if (comp >= i) currentIdx = 15;
        const percentage = (currentIdx / 15) * 100;
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>${label} ${isLocked ? '🔒' : ''}</span>
                ${!isLocked ? `<span style="font-size:12px; opacity:0.6">${currentIdx}/15</span>` : ''}
            </div>
            ${!isLocked ? `<div class="progress-container"><div class="progress-bar-fill" style="width:${percentage}%"></div></div>` : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) { renderL5(lang); return; }
    const key = "L" + lvl;
    const stringhe = domandaRepo[lang][key];
    const storageKey = `${lang}_${lvl}`;
    const limite = (state.mode === 'guest') ? 3 : 15;
    let selezione = (state.mode !== 'guest' && dbUsers[state.currentPin]?.savedQuizzes?.[storageKey]) || 
        [...stringhe].sort(() => 0.5 - Math.random()).slice(0, limite).map(r => {
            const p = r.split("|");
            return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
        });
    if (state.mode !== 'guest') {
        if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};
        dbUsers[state.currentPin].savedQuizzes[storageKey] = selezione;
    }
    session = { lang: lang, lvl: lvl, q: selezione, idx: (state.mode !== 'guest' ? (dbUsers[state.currentPin].activeProgress?.[storageKey] || 0) : 0) };
    renderQ();
}

function renderQ() {
    const data = session.q[session.idx];
    updateNav(true, `showLevels('${session.lang}')`);
    document.getElementById('content-area').innerHTML = `
        <div style="margin-bottom:20px"><small>Domanda ${session.idx + 1}/${session.q.length}</small><h3>${data.q}</h3></div>
        <div id="opts" style="display:flex; flex-direction:column; gap:10px">
            ${data.options.map((opt, i) => `<button class="btn-apple" onclick="check(${i === data.correct})">${opt}</button>`).join('')}
        </div><div id="fb"></div>`;
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
    document.getElementById('fb').innerHTML = `<div class="feedback-box ${isOk?'correct':'wrong'}">
        <strong>${isOk?'Giusto!':'Sbagliato'}</strong><p>${data.exp}</p>
        <button class="btn-apple btn-primary" onclick="next()">Continua</button></div>`;
}

function next() {
    session.idx++;
    if(session.idx < session.q.length) { renderQ(); } 
    else {
        if (state.mode !== 'guest') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl);
            const sk = `${session.lang}_${session.lvl}`;
            dbUsers[state.currentPin].activeProgress[sk] = 0;
            delete dbUsers[state.currentPin].savedQuizzes[sk];
            saveMasterDB();
        }
        showLevels(session.lang);
    }
}

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3 style="text-align:center">ESAME: ${lang}</h3><p style="text-align:center">${c.task}</p>
        <div class="editor-wrapper">
            <pre class="code-highlight" id="pre-highlight"><code id="highlighting-content" class="language-javascript"></code></pre>
            <textarea id="ed" class="code-input" spellcheck="false" oninput="updateEditor(this.value)" onscroll="syncScroll(this)" onkeydown="handleTab(event, this)"></textarea>
        </div>
        <button class="btn-apple btn-primary" onclick="runL5('${lang}')">Verifica</button>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-top:10px; text-align:center">Logica non corretta.</div>`;
}

function updateEditor(text) {
    let el = document.getElementById("highlighting-content");
    el.innerHTML = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    Prism.highlightElement(el);
}
function syncScroll(el) { const pre = document.getElementById('pre-highlight'); pre.scrollTop = el.scrollTop; pre.scrollLeft = el.scrollLeft; }
function handleTab(e, el) { if (e.key === 'Tab') { e.preventDefault(); let s = el.selectionStart; el.value = el.value.substring(0, s) + "    " + el.value.substring(el.selectionEnd); el.selectionStart = el.selectionEnd = s + 4; updateEditor(el.value); } }

function runL5(lang) {
    const code = document.getElementById('ed').value;
    if (challenges5[lang].check(code)) {
        state.progress[lang] = 5; saveMasterDB(); alert("Esame Superato!"); showLevels(lang);
    } else { document.getElementById('l5-err').style.display = "block"; }
}

function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = state.mode === 'admin' ? "ADMIN" : "PROFILO";
    let content = "";
    if (state.mode === 'admin') {
        content = `<h3>Gestione Utenti</h3><div style="display:flex; flex-direction:column; gap:10px">`;
        Object.keys(dbUsers).forEach(pin => {
            content += `<div class="review-card"><strong>${dbUsers[pin].name}</strong> (PIN: ${pin})
                <button class="btn-apple" onclick="deleteUser('${pin}')" style="color:red; margin-top:5px; padding:5px">Elimina</button></div>`;
        });
        content += `</div>`;
    } else {
        const history = state.history || {};
        let total = 0, correct = 0;
        Object.values(history).flat().forEach(h => { total++; if(h.ok) correct++; });
        const media = total > 0 ? ((correct / total) * 10).toFixed(1) : "0";
        content = `<h3>Ciao, ${state.currentUser}</h3>
            <div class="review-card"><strong>Media Voti:</strong> ${media}/10</div>
            <h4>Storico Recente:</h4>`;
        Object.keys(history).forEach(lang => {
            history[lang].slice(-3).forEach(h => {
                content += `<div class="review-card ${h.ok?'is-ok':'is-err'}">${lang}: ${h.q.substring(0,30)}...</div>`;
            });
        });
        content += `<button class="btn-apple" onclick="logout()" style="color:red">Logout</button>`;
    }
    document.getElementById('content-area').innerHTML = content;
}

function deleteUser(pin) { if(confirm("Eliminare?")) { delete dbUsers[pin]; saveMasterDB(); renderProfile(); } }
function logout() { state.mode = null; state.currentPin = null; session = null; renderLogin(); }
