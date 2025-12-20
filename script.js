let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    history: JSON.parse(localStorage.getItem('devHistory')) || {} // { "Python": [{q: "...", correct: true}] }
};
let session = null;

window.onload = () => renderLogin();

function renderLogin() {
    state.mode = null; updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:15px; padding-top:20px">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent); text-align:center" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center">
            <h3 style="margin-bottom:20px">${type === 'login' ? 'Inserisci PIN' : 'Crea PIN (4 cifre)'}</h3>
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:10px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const easy = ['1111','2222','3333','4444','5555','6666','7777','8888','9999','0000','1234','2345','3456','4567','5678','6789'];
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
    let html = (state.mode === 'guest') ? `<div class="history-item" style="background:rgba(0,113,227,0.05); border:none; border-radius:10px; margin-bottom:20px"><span>Progresso Guest: <b>${Object.values(state.progress).reduce((a,b)=>a+b,0)} livelli</b></span></div>` : "";
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="40" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:15px; font-weight:700; font-size:14px">${l}</div>
        </div>`}).join('') + `</div>`;
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
        if(!quizDB[lang][key] || quizDB[lang][key].length === 0) return alert("Livello vuoto");
        session = { lang, lvl, q: [...quizDB[lang][key]].sort(()=>0.5-Math.random()), idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    document.getElementById('content-area').innerHTML = `
        <div style="margin-bottom:15px; font-weight:bold; opacity:0.6">LIVELLO ${session.lvl}</div>
        <h2 style="margin-bottom:25px; font-size:20px">${data.q}</h2>
        <div id="opts">${data.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({ q: data.q, ok: isOk });
        localStorage.setItem('devHistory', JSON.stringify(state.history));
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `<div class="feedback-box ${isOk?'correct':'wrong'}">
        <strong>${isOk?'Ottimo!':'Riprova'}</strong><p style="font-size:14px; margin:10px 0">${data.exp}</p><pre>${data.code}</pre>
        <button class="btn-apple btn-primary" onclick="next()">Continua</button>
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
    const history = state.history[lang] || [];
    let historyHtml = history.map(h => `
        <div class="history-item">
            <div class="dot ${h.ok ? 'dot-green' : 'dot-red'}"></div>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${h.q}</span>
        </div>`).join('');

    document.getElementById('content-area').innerHTML = `
        <h3 style="margin-bottom:10px">Riepilogo e Sfida</h3>
        <div style="max-height:150px; overflow-y:auto; margin-bottom:20px; border:1px solid var(--border); border-radius:12px; padding:10px">
            ${historyHtml || '<small>Nessun dato registrato</small>'}
        </div>
        <p style="font-size:14px; color:var(--accent); font-weight:600">${c.task}</p>
        <textarea id="ed" class="code-editor" spellcheck="false" placeholder="Digita il codice..."></textarea>
        <div id="con" class="console-terminal" style="display:none"></div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="runL5('${lang}')">Verifica Codice</button>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value.trim(); const c = challenges5[l];
    const con = document.getElementById('con');
    if(v.includes(c.logic)) {
        con.style.display="block"; con.innerHTML = `> Analisi logica superata...\n> Output:\n${c.output}`;
        setTimeout(()=>showHome(), 3000);
    } else { alert("Logica errata nel codice. Riprova!"); }
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
