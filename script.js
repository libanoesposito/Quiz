let state = {
    mode: null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};
let session = null;

window.onload = () => { renderLogin(); };

function renderLogin() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "DevMaster";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%">
            <h2 style="margin-bottom:40px">Accedi</h2>
            <button class="btn-apple btn-primary" onclick="uiPin()">Utente Registrato</button>
            <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
        </div>`;
}

function setGuest() { state.mode = 'guest'; showHome(); }

function uiPin() {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center; padding-top:40px">
            <h3>PIN 4 Cifre</h3>
            <input type="password" id="pin" class="btn-apple" style="text-align:center; font-size:24px" maxlength="4">
            <button class="btn-apple btn-primary" onclick="savePin()">Entra</button>
        </div>`;
}

function savePin() {
    if(document.getElementById('pin').value.length === 4) { state.mode = 'user'; showHome(); }
}

function showHome() {
    updateNav(true, "renderLogin()"); // Tasto indietro per tornare al login
    document.getElementById('app-title').innerText = "Percorsi";
    let html = `<div class="lang-grid">` + Object.keys(quizDB).map(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        return `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:600; font-size:13px">${l}</div>
        </div>`}).join('') + `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    const comp = state.progress[lang] || 0;
    let html = "";
    for(let i=1; i<=5; i++){
        const isLocked = (state.mode === 'user' && i === 5 && comp < 4);
        const resIdx = state.resume[`${lang}_${i}`];
        const label = (i === 5) ? "Livello 5: Coding" : (resIdx != null ? `Livello ${i} (Q: ${resIdx+1})` : `Livello ${i}`);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}',${i})">${label} ${isLocked ? '🔒' : ''}</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    if(lvl === 5) renderL5(lang);
    else {
        const startIdx = state.resume[`${lang}_${lvl}`] || 0;
        session = { lang, lvl, q: [...quizDB[lang]].sort(()=>0.5-Math.random()).slice(0,15), idx: startIdx };
        renderQ();
    }
}

function renderQ() {
    const data = session.q[session.idx];
    let opts = data.options.map((o,i)=>({t:o, c:i===data.correct})).sort(()=>Math.random()-0.5);
    document.getElementById('content-area').innerHTML = `
        <small>Q ${session.idx+1}/15</small>
        <h2 style="margin:20px 0">${data.q}</h2>
        <div id="opts">${opts.map(o=>`<button class="btn-apple" onclick="check(${o.c})">${o.t}</button>`).join('')}</div>
        <div id="feedback"></div>`;
}

function check(isOk) {
    const data = session.q[session.idx];
    document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('feedback').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}">
            <strong>${isOk?'Bravo!':'Sbagliato'}</strong><p>${data.exp}</p><pre>${data.code}</pre>
            <button class="btn-apple btn-primary" onclick="next()">Continua</button>
            ${!isOk?`<button class="btn-apple" style="background:none; border:1px solid var(--accent)" onclick="retry()">Riprova</button>`:''}
        </div>`;
}

function retry() { document.getElementById('opts').style.pointerEvents="auto"; document.getElementById('feedback').innerHTML=""; }

function next() {
    session.idx++;
    if(session.idx < 15) {
        if(state.mode==='user'){ state.resume[`${session.lang}_${session.lvl}`]=session.idx; localStorage.setItem('devResume', JSON.stringify(state.resume)); }
        renderQ();
    } else { finish(); }
}

function finish() {
    delete state.resume[`${session.lang}_${session.lvl}`]; localStorage.setItem('devResume', JSON.stringify(state.resume));
    state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); localStorage.setItem('devProgress', JSON.stringify(state.progress));
    showLevels(session.lang);
}

function renderL5(lang) {
    const c = challenges5[lang];
    document.getElementById('content-area').innerHTML = `
        <h3>Challenge Expert</h3><p>${c.task}</p>
        <textarea id="ed" class="code-editor" style="border-left:5px solid ${c.color}"></textarea>
        <div id="con" class="console-terminal" style="display:none"></div>
        <button class="btn-apple btn-primary" style="margin-top:15px" onclick="run('${lang}')">Run</button>`;
}

function run(l) {
    const v = document.getElementById('ed').value.trim();
    const t = document.getElementById('con');
    t.style.display="block";
    if(v === challenges5[l].target) {
        t.innerHTML = `> In esecuzione...<br>> SUCCESS`;
        setTimeout(()=>{ state.progress[l]=5; localStorage.setItem('devProgress', JSON.stringify(state.progress)); showHome(); }, 1200);
    } else { t.innerHTML = `<span style="color:#ff3b30">> Errore di sintassi</span>`; }
}

function updateNav(s,t){ document.getElementById('back-nav').innerHTML = s ? `<div class="back-link" onclick="${t}">〈 Indietro</div>` : ""; }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
