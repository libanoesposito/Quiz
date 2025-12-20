let state = {
    mode: null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    errors: JSON.parse(localStorage.getItem('devErrors')) || {} // Memorizza i fallimenti
};
let session = null;

window.onload = () => { renderLogin(); };

function renderLogin() {
    state.mode = null; updateNav(false);
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center; padding-top:50px">
            <button class="btn-apple btn-primary" onclick="state.mode='user'; showHome()">Utente Registrato</button>
            <button class="btn-apple" onclick="state.mode='guest'; showHome()">Modalità Guest</button>
        </div>`;
}

function showHome() {
    updateNav(true, "renderLogin()");
    let html = `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:600;">${l}</div>
        </div>`}).join('') + `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    let html = "";
    for(let i=1; i<=5; i++) {
        let dotColor = "#1d1d1f"; // Nero (default/studiato)
        if(state.mode === 'user' && state.errors[lang] && state.errors[lang].includes(i)) dotColor = "#ff3b30"; // Rosso (errore)
        
        const dotHtml = `<span class="dot" style="color:${dotColor}">●</span>`;
        html += `<button class="btn-apple" onclick="startStep('${lang}',${i})">
            Livello ${i} ${dotHtml}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const key = "L"+lvl;
        session = { lang, lvl, q: quizDB[lang][key], idx: 0 };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    document.getElementById('content-area').innerHTML = `
        <small>LIV ${session.lvl} • ${session.idx+1}/${session.q.length}</small>
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
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}">
            <strong>${isOk?'Ottimo!':'Riprova'}</strong><p style="font-size:14px">${data.exp}</p><pre>${data.code}</pre>
            <button class="btn-apple btn-primary" onclick="next()">Continua</button>
        </div>`;
}

function next() {
    session.idx++; if(session.idx < session.q.length) renderQ(); else showLevels(session.lang);
}

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>Livello 5</h3><p style="font-size:14px">${c.task}</p>
        <div id="err" class="error-msg">Errore: Logica errata, riprova!</div>
        <textarea id="ed" class="code-editor" style="border-left:5px solid ${c.color}"></textarea>
        <div id="con" class="console-terminal" style="display:none"></div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="runL5('${lang}')">Verifica</button>`;
}

function runL5(l) {
    const v = document.getElementById('ed').value.trim();
    const c = challenges5[l];
    const con = document.getElementById('con');
    const err = document.getElementById('err');
    
    if(v.includes(c.logic)) {
        err.style.display="none"; con.style.display="block";
        con.innerHTML = `> Esecuzione...\n${c.output}`;
        setTimeout(()=>showHome(), 2500);
    } else {
        err.style.display="block"; con.style.display="none";
    }
}

function updateNav(s,t){ document.getElementById('back-nav').innerHTML = s?`<div class="back-link" onclick="${t}">〈 Indietro</div>`:""; }
