let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    history: JSON.parse(localStorage.getItem('devHistory')) || {}
};

window.onload = () => {
    initTheme();
    renderLogin();
};

// --- GESTIONE TEMA ---
function initTheme() {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
}

// --- NAVIGAZIONE ---
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
            <h3 style="margin-bottom:20px">${type === 'login' ? 'Bentornato' : 'Crea il tuo PIN (4 cifre)'}</h3>
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin-bottom:10px; display:none"></div>
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const errorEl = document.getElementById('pin-error');
    if(pin.length !== 4) {
        errorEl.innerText = "Inserisci 4 cifre";
        errorEl.style.display = "block";
        return;
    }
    if(type === 'register') {
        localStorage.setItem('devUserId', pin);
        state.userId = pin;
    } else if(pin !== state.userId) {
        errorEl.innerText = "PIN errato!";
        errorEl.style.display = "block";
        return;
    }
    state.mode = 'user';
    showHome();
}

function setGuest() { state.mode = 'guest'; showHome(); }

// QUESTA FUNZIONE ORA USA domandaRepo CORRETTAMENTE
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    
    // Cerchiamo le icone basandoci sulle chiavi di domandaRepo
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });

    if(state.mode === 'user') {
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
    for(let i=1; i<=5; i++) {
        let isLocked = (state.mode === 'user' && i === 5 && comp < 4);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">Livello ${i} ${isLocked ? '🔒' : ''}</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// --- LOGICA QUIZ RANDOM ---
function startStep(lang, lvl) {
    if(lvl === 5) {
        renderL5(lang);
    } else {
        const key = "L" + lvl;
        const stringhe = domandaRepo[lang][key];
        
        if(!stringhe || stringhe.length === 0) {
            document.getElementById('content-area').innerHTML = `<h3>In arrivo</h3><button class="btn-apple" onclick="showLevels('${lang}')">Indietro</button>`;
            return;
        }

        // Mischia e prendi 15
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
        <div style="margin-bottom:15px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:5px">
                <span>DOMANDA ${session.idx + 1}/${session.q.length}</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.3s"></div>
            </div>
        </div>
        <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
        <div id="opts">${data.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({ q: data.q, ok: isOk, exp: data.exp });
        localStorage.setItem('devHistory', JSON.stringify(state.history));
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
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
        showLevels(session.lang); 
    }
}

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>Livello 5 Expert</h3>
        <p style="font-size:14px; margin-bottom:10px">${c.task}</p>
        <div id="l5-err" style="color:#ff3b30; display:none; margin-bottom:10px; font-weight:bold">Riprova!</div>
        <textarea id="ed" class="code-editor"></textarea>
        <button class="btn-apple btn-primary" style="margin-top:10px" onclick="runL5('${lang}')">Verifica</button>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value;
    if(v.includes(challenges5[l].logic)) {
        state.progress[l] = 5;
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
        showHome();
    } else { document.getElementById('l5-err').style.display = "block"; }
}

function updateNav(s,t){ 
    document.getElementById('back-nav').innerHTML = s?`<div class="back-link" onclick="${t}">〈 Indietro</div>`:""; 
}

function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "PROFILO";
    let html = `<h3>Il tuo Ripasso</h3>`;
    const keys = Object.keys(state.history);
    if(keys.length === 0) html += `<p style="opacity:0.5">Nessun dato.</p>`;
    else {
        keys.forEach(lang => {
            html += `<h4 style="color:var(--accent); margin-top:15px">${lang}</h4>`;
            state.history[lang].slice(-5).forEach(item => {
                html += `<div class="review-card ${item.ok?'is-ok':'is-err'}"><div style="font-weight:bold">${item.q}</div><div style="font-size:12px; opacity:0.7">${item.exp}</div></div>`;
            });
        });
    }
    document.getElementById('content-area').innerHTML = html;
}
