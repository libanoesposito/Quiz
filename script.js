let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    history: JSON.parse(localStorage.getItem('devHistory')) || {} 
};
let session = null;

window.onload = () => renderLogin();

function renderLogin() {
    state.mode = null; updateNav(false);
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
    const easy = ['1111','2222','3333','1234','4567','6789'];
    if(pin.length !== 4) return alert("Inserisci 4 cifre");
    if(easy.includes(pin)) return alert("PIN troppo semplice!");
    if(type === 'register') { localStorage.setItem('devUserId', pin); state.userId = pin; } 
    else { if(pin !== state.userId) return alert("PIN Errato"); }
    state.mode = 'user'; showHome();
}

function setGuest() { state.mode = 'guest'; showHome(); }

function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    
    // Slot Argomenti
    Object.keys(quizDB).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });

    // NUOVO SLOT: IL MIO PROFILO (Solo per utenti loggati)
    if(state.mode === 'user') {
        html += `
        <div class="lang-item profile-slot" onclick="renderProfile()">
            <div style="font-weight:700">IL MIO PROFILO & RIPASSO</div>
        </div>`;
    }
    
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "PROFILO";
    let html = `<h3>Il tuo riepilogo</h3>`;
    
    const langs = Object.keys(state.history);
    if(langs.length === 0) html += `<p>Inizia un percorso per vedere qui i tuoi progressi.</p>`;
    
    langs.forEach(lang => {
        html += `<h4 style="margin-top:20px; color:var(--accent)">${lang}</h4>`;
        state.history[lang].forEach(item => {
            html += `
            <div class="review-card ${item.ok ? 'is-ok' : 'is-err'}">
                <div style="font-weight:bold; margin-bottom:5px">
                    <span class="dot" style="background:${item.ok?'#34c759':'#ff3b30'}"></span>${item.q}
                </div>
                <div style="font-size:12px; opacity:0.8; margin-bottom:8px">${item.exp}</div>
                <pre style="font-size:10px">${item.code}</pre>
            </div>`;
        });
    });
    
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = ""; const comp = state.progress[lang] || 0;
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
        if(!quizDB[lang][key] || quizDB[lang][key].length === 0) return alert("Livello in arrivo!");
        session = { lang, lvl, q: [...quizDB[lang][key]], idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    document.getElementById('content-area').innerHTML = `
        <div style="margin-bottom:10px; font-weight:bold; opacity:0.5">LIVELLO ${session.lvl}</div>
        <h2 style="margin-bottom:20px; font-size:18px">${data.q}</h2>
        <div id="opts">${data.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        // Evita duplicati nello storico per non intasare il profilo
        if(!state.history[session.lang].some(h => h.q === data.q)) {
            state.history[session.lang].push({ q: data.q, ok: isOk, exp: data.exp, code: data.code });
            localStorage.setItem('devHistory', JSON.stringify(state.history));
        }
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `<div class="feedback-box ${isOk?'correct':'wrong'}">
        <strong>${isOk?'Eccellente!':'Riguarda bene'}</strong><p>${data.exp}</p><pre>${data.code}</pre>
        <button class="btn-apple btn-primary" style="margin-top:10px" onclick="next()">Continua</button>
    </div>`;
}

function next() {
    session.idx++; if(session.idx < session.q.length) renderQ(); 
    else { 
        state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
        showLevels(session.lang); 
    }
}

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>Livello Finale</h3>
        <p style="font-size:14px; margin-bottom:15px">${c.task}</p>
        <div id="inline-error" class="error-inline">Sintassi o logica errata. Riprova!</div>
        <textarea id="ed" class="code-editor" spellcheck="false" oninput="hideError()"></textarea>
        <div id="con" class="console-terminal" style="display:none"></div>
        <button id="verify-btn" class="btn-apple btn-primary" style="margin-top:15px" onclick="runL5('${lang}')">Verifica Codice</button>`;
}

function hideError() { document.getElementById('inline-error').style.display = "none"; }

function runL5(l) {
    const v = document.getElementById('ed').value.trim();
    const c = challenges5[l];
    const err = document.getElementById('inline-error');
    const con = document.getElementById('con');

    if(v.includes(c.logic)) {
        err.style.display = "none";
        con.style.display = "block";
        con.innerHTML = `> Test superati.\n> Output:\n${c.output}`;
        document.getElementById('verify-btn').disabled = true;
        setTimeout(() => {
            state.progress[l] = 5;
            localStorage.setItem('devProgress', JSON.stringify(state.progress));
            showHome();
        }, 2500);
    } else {
        err.style.display = "block";
        // Vibrazione feedback se supportata (stile Apple)
        if(window.navigator.vibrate) window.navigator.vibrate(50);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('theme-icon').innerHTML = isDark 
        ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' 
        : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
}

function updateNav(s,t){ document.getElementById('back-nav').innerHTML = s?`<div class="back-link" onclick="${t}">〈 Indietro</div>`:""; }
