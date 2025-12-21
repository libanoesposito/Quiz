let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    history: JSON.parse(localStorage.getItem('devHistory')) || {}
};
let session = null;

const themeIconLuna = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
const themeIconSole = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

// Inizializzazione Tema
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) setTheme(savedTheme);
    else setTheme(systemDark ? 'dark' : 'light');
}

function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    const icon = document.getElementById('theme-icon');
    if(icon) icon.innerHTML = mode === 'dark' ? themeIconSole : themeIconLuna;
    localStorage.setItem('theme', mode);
}

function toggleThemeManual() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

window.onload = () => {
    initTheme();
    renderLogin();
};

// Navigazione e Login
function renderLogin() {
    state.mode = null; 
    updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:10px">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent); text-align:center" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center">
            <h3 style="margin-bottom:20px">${type === 'login' ? 'Bentornato' : 'Crea il tuo PIN'}</h3>
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    if(pin.length !== 4) return alert("Inserisci 4 cifre");

    if(type === 'register') {
        localStorage.setItem('devUserId', pin);
        state.userId = pin;
        state.progress = {};
        state.history = {};
        localStorage.setItem('devProgress', JSON.stringify({}));
        localStorage.setItem('devHistory', JSON.stringify({}));
        alert("Profilo creato!");
    } else {
        if(pin !== state.userId) return alert("PIN Errato o profilo inesistente");
    }
    
    state.mode = 'user'; 
    showHome();
}

function setGuest() { 
    state.mode = 'guest'; 
    state.progress = {}; // Reset temporaneo per guest
    state.history = {};
    showHome(); 
}

function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    
    // Genera slot per ogni linguaggio in database.js
    Object.keys(quizDB).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });

    if(state.mode === 'user') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">IL MIO PROFILO & RIPASSO</div></div>`;
    }
    
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "PROFILO";
    let html = `<h3>Storico Ripasso</h3>`;
    
    const hasHistory = Object.keys(state.history).length > 0;
    if(!hasHistory) {
        html += `<p style="opacity:0.6; margin-top:20px">Non hai ancora risposto a nessuna domanda. Inizia un percorso!</p>`;
    } else {
        Object.keys(state.history).forEach(lang => {
            html += `<h4 style="margin-top:25px; color:var(--accent); border-bottom:1px solid var(--border); padding-bottom:5px">${lang}</h4>`;
            state.history[lang].forEach(item => {
                html += `
                <div class="review-card ${item.ok ? 'is-ok' : 'is-err'}">
                    <div style="font-weight:bold; margin-bottom:5px">
                        <span class="dot" style="background:${item.ok?'#34c759':'#ff3b30'}"></span>${item.q}
                    </div>
                    <div style="font-size:12px; opacity:0.8; margin-bottom:8px">${item.exp}</div>
                    <pre style="font-size:10px; background:rgba(0,0,0,0.1); padding:5px; border-radius:5px">${item.code}</pre>
                </div>`;
            });
        });
    }
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; 
    const comp = state.progress[lang] || 0;
    
    for(let i=1; i<=5; i++) {
        let isLocked = (state.mode === 'user' && i === 5 && comp < 4);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">
            Livello ${i} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const key = "L"+lvl;
        if(!quizDB[lang] || !quizDB[lang][key] || quizDB[lang][key].length === 0) return alert("Livello non disponibile.");
        session = { lang, lvl, q: [...quizDB[lang][key]], idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    const progressPerc = (session.idx / session.q.length) * 100;
    
    document.getElementById('content-area').innerHTML = `
        <div style="margin-bottom:15px">
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; opacity:0.5; margin-bottom:5px">
                <span>LIVELLO ${session.lvl}</span>
                <span>${session.idx + 1} / ${session.q.length}</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px">
                <div style="width:${progressPerc}%; height:100%; background:var(--accent); transition:0.3s; border-radius:10px"></div>
            </div>
        </div>
        <h2 style="margin-bottom:20px; font-size:18px">${data.q}</h2>
        <div id="opts">${data.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        if(!state.history[session.lang].some(h => h.q === data.q)) {
            state.history[session.lang].push({ q: data.q, ok: isOk, exp: data.exp, code: data.code });
            localStorage.setItem('devHistory', JSON.stringify(state.history));
        }
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}">
            <strong>${isOk?'Ottimo!':'Riprova'}</strong>
            <p style="margin:8px 0">${data.exp}</p>
            <pre style="background:rgba(0,0,0,0.1); padding:8px; border-radius:8px">${data.code}</pre>
            <button class="btn-apple btn-primary" style="margin-top:12px; margin-bottom:0" onclick="next()">Continua</button>
        </div>`;
}

function next() {
    session.idx++; 
    if(session.idx < session.q.length) renderQ(); 
    else { 
        state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
        showLevels(session.lang); 
    }
}

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>Livello 5 Expert</h3>
        <p style="font-size:14px; margin-bottom:15px; opacity:0.8">${c.task}</p>
        <div id="inline-error" class="error-inline">Errore di logica. Controlla il codice!</div>
        <textarea id="ed" class="code-editor" spellcheck="false" placeholder="Scrivi il codice qui..." oninput="document.getElementById('inline-error').style.display='none'"></textarea>
        <div id="con" class="console-terminal" style="display:none"></div>
        <button id="verify-btn" class="btn-apple btn-primary" style="margin-top:15px" onclick="runL5('${lang}')">Verifica Codice</button>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value.trim();
    const c = challenges5[l];
    if(v.includes(c.logic)) {
        document.getElementById('inline-error').style.display = 'none';
        const con = document.getElementById('con'); con.style.display = "block";
        con.innerHTML = `> Analisi completata...\n> Output:\n${c.output}`;
        document.getElementById('verify-btn').disabled = true;
        setTimeout(() => { 
            state.progress[l] = 5; 
            localStorage.setItem('devProgress', JSON.stringify(state.progress)); 
            showHome(); 
        }, 2500);
    } else { 
        document.getElementById('inline-error').style.display = 'block'; 
    }
}

function updateNav(s,t){ 
    document.getElementById('back-nav').innerHTML = s?`<div class="back-link" onclick="${t}">〈 Indietro</div>`:""; 
}
