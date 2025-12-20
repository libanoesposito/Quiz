let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: {},
    history: {}
};
let session = null;

/* ====== HELPERS LOCALSTORAGE PER PIN ====== */
function progressKey() {
    return 'devProgress_' + state.userId;
}
function historyKey() {
    return 'devHistory_' + state.userId;
}
function loadUserData() {
    state.progress = JSON.parse(localStorage.getItem(progressKey())) || {};
    state.history = JSON.parse(localStorage.getItem(historyKey())) || {};
}
function saveProgress() {
    localStorage.setItem(progressKey(), JSON.stringify(state.progress));
}
function saveHistory() {
    localStorage.setItem(historyKey(), JSON.stringify(state.history));
}

/* ====== TEMA ====== */
const themeIconLuna = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
const themeIconSole = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (systemDark ? 'dark' : 'light'));
}

function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    document.getElementById('theme-icon').innerHTML = mode === 'dark' ? themeIconSole : themeIconLuna;
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

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

/* ====== LOGIN ====== */
function renderLogin() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:10px">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent)" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center">
            <h3>${type === 'login' ? 'Bentornato' : 'Crea il tuo PIN'}</h3>
            <input type="password" id="pin-field" class="btn-apple"
                style="text-align:center; font-size:24px; letter-spacing:8px"
                maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px"
                onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const easy = ['1111','2222','3333','1234','4567','6789'];
    if(pin.length !== 4) return alert("Inserisci 4 cifre");
    if(easy.includes(pin)) return alert("PIN troppo semplice");

    state.userId = pin;
    localStorage.setItem('devUserId', pin);
    loadUserData();

    state.mode = 'user';
    showHome();
}

function setGuest() {
    state.mode = 'guest';
    showHome();
}

/* ====== HOME ====== */
function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    Object.keys(quizDB).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });
    if(state.mode === 'user') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()">IL MIO PROFILO & RIPASSO</div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

/* ====== PROFILO ====== */
function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "PROFILO";
    let html = `<h3>Storico Ripasso</h3>`;
    const langs = Object.keys(state.history);
    if(langs.length === 0) html += `<p>Nessun dato.</p>`;
    langs.forEach(lang => {
        html += `<h4 style="margin-top:20px">${lang}</h4>`;
        state.history[lang].forEach(item => {
            html += `
            <div class="review-card ${item.ok ? 'is-ok' : 'is-err'}">
                <strong>${item.q}</strong>
                <div>${item.exp}</div>
                <pre>${item.code}</pre>
            </div>`;
        });
    });
    document.getElementById('content-area').innerHTML = html;
}

/* ====== QUIZ ====== */
function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    let html = "";
    const comp = state.progress[lang] || 0;
    for(let i=1;i<=5;i++) {
        let lock = (state.mode === 'user' && i === 5 && comp < 4);
        html += `<button class="btn-apple" ${lock?'disabled':''}
            onclick="startStep('${lang}',${i})">Livello ${i} ${lock?'🔒':''}</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang,lvl){
    if(lvl===5) return renderL5(lang);
    session={lang,lvl,q:[...quizDB[lang]['L'+lvl]],idx:0};
    renderQ();
}

function renderQ(){
    const d=session.q[session.idx];
    document.getElementById('content-area').innerHTML=`
        <h3>${d.q}</h3>
        ${d.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===d.correct})">${o}</button>`).join('')}
        <div id="fb"></div>`;
}

function check(ok){
    const d=session.q[session.idx];
    if(state.mode==='user'){
        state.history[session.lang]=state.history[session.lang]||[];
        if(!state.history[session.lang].some(h=>h.q===d.q)){
            state.history[session.lang].push({q:d.q,ok,exp:d.exp,code:d.code});
            saveHistory();
        }
    }
    document.getElementById('fb').innerHTML=`<button class="btn-apple btn-primary" onclick="next()">Continua</button>`;
}

function next(){
    session.idx++;
    if(session.idx<session.q.length) renderQ();
    else{
        state.progress[session.lang]=Math.max(state.progress[session.lang]||0,session.lvl);
        saveProgress();
        showLevels(session.lang);
    }
}

/* ====== NAV ====== */
function updateNav(s,t){
    document.getElementById('back-nav').innerHTML = s ? `<div onclick="${t}">〈 Indietro</div>` : "";
}
