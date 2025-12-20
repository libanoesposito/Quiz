let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    errors: JSON.parse(localStorage.getItem('devErrors')) || {}
};
let session = null;

window.onload = () => renderLogin();

function renderLogin() {
    state.mode = null; updateNav(false);
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent)" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center; padding-top:20px">
            <h3>${type === 'login' ? 'Inserisci PIN' : 'Crea PIN Sicuro'}</h3>
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" onclick="validatePin('${type}')">Conferma</button>
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
    let html = (state.mode === 'guest') ? `<div class="feedback-box" style="margin-bottom:20px; background:rgba(0,113,227,0.1); border:1px solid var(--accent)"><strong>Report Sessione:</strong> Livelli completati: ${Object.values(state.progress).reduce((a,b)=>a+b,0)}</div>` : "";
    html += `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:600;">${l}</div>
        </div>`}).join('') + `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    let html = ""; const comp = state.progress[lang] || 0;
    for(let i=1; i<=5; i++) {
        let isLocked = (state.mode === 'user' && i === 5 && comp < 4);
        let dotColor = (state.errors[lang] && state.errors[lang].includes(i)) ? "#ff3b30" : "#1d1d1f";
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">
            Livello ${i} ${isLocked ? '🔒' : `<span class="dot" style="color:${dotColor}">●</span>`}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const key = "L"+lvl;
        if(!quizDB[lang][key] || quizDB[lang][key].length === 0) return alert("Contenuto mancante");
        session = { lang, lvl, q: [...quizDB[lang][key]].sort(()=>0.5-Math.random()), idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    document.getElementById('content-area').innerHTML = `
        <small>LIVELLO ${session.lvl}</small>
        <h2 style="margin:20px 0">${data.q}</h2>
        <div id="opts">${data.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>`).join('')}</div>
        <div id="fb"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    if(!isOk && state.mode === 'user') {
        if(!state.errors[session.lang]) state.errors[session.lang] = [];
        if(!state.errors[session.lang].includes(session.lvl)) state.errors[session.lang].push(session.lvl);
        localStorage.setItem('devErrors', JSON.stringify(state.errors));
    }
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `<div class="feedback-box ${isOk?'correct':'wrong'}">
        <strong>${isOk?'Bravo!':'Sbagliato'}</strong><p>${data.exp}</p><pre>${data.code}</pre>
        <button class="btn-apple btn-primary" onclick="next()">Continua</button>
        ${!isOk ? `<button class="btn-apple" style="background:none; border:1px solid var(--accent); color:var(--accent)" onclick="retryQ()">Riprova</button>` : ''}
    </div>`;
}

function retryQ() { document.getElementById('opts').style.pointerEvents = "auto"; document.getElementById('fb').innerHTML = ""; }

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
        <h3>Livello 5 Expert</h3><p style="font-size:14px; margin-bottom:10px">${c.task}</p>
        <div id="err-l5" class="feedback-box wrong" style="display:none; margin-bottom:10px">Logica errata. Controlla il codice!</div>
        <textarea id="ed" class="code-editor" spellcheck="false" style="border-left:5px solid ${c.color}"></textarea>
        <div id="con" class="console-terminal" style="display:none"></div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="runL5('${lang}')">Verifica</button>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value.trim(); const c = challenges5[l];
    if(v.includes(c.logic)) {
        document.getElementById('err-l5').style.display="none"; const con = document.getElementById('con');
        con.style.display="block"; con.innerHTML = `> In esecuzione...\n${c.output}`;
        setTimeout(()=>showHome(), 2500);
    } else { document.getElementById('err-l5').style.display="block"; }
}

function toggleTheme() {
    const html = document.documentElement; const btn = document.getElementById('theme-btn');
    if(html.getAttribute('data-theme') === 'dark') { html.setAttribute('data-theme', 'light'); btn.innerText = "🌙"; } 
    else { html.setAttribute('data-theme', 'dark'); btn.innerText = "☀️"; }
}

function updateNav(s,t){ document.getElementById('back-nav').innerHTML = s?`<div class="back-link" onclick="${t}">〈 Indietro</div>`:""; }
