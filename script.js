let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: {},
    history: {}
};
let session = null;

/* ====== LOCALSTORAGE PER PIN ====== */
function pKey(){ return 'devProgress_' + state.userId; }
function hKey(){ return 'devHistory_' + state.userId; }

function loadUserData(){
    state.progress = JSON.parse(localStorage.getItem(pKey())) || {};
    state.history  = JSON.parse(localStorage.getItem(hKey())) || {};
}
function saveAll(){
    localStorage.setItem(pKey(), JSON.stringify(state.progress));
    localStorage.setItem(hKey(), JSON.stringify(state.history));
}

/* ====== FUNZIONE PER 15 DOMANDE RANDOM ====== */
function pickRandom(arr, n) {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

/* ====== TEMA ====== */
const themeIconLuna = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
const themeIconSole = '<circle cx="12" cy="12" r="5"></circle>';

function initTheme(){
    const t = localStorage.getItem('theme');
    setTheme(t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'));
}
function setTheme(m){
    document.documentElement.setAttribute('data-theme', m);
    document.getElementById('theme-icon').innerHTML = m==='dark'?themeIconSole:themeIconLuna;
    localStorage.setItem('theme', m);
}
window.onload = ()=>{ initTheme(); renderLogin(); };

/* ====== LOGIN ====== */
function renderLogin(){
    state.mode=null; updateNav(false);
    document.getElementById('app-title').innerText="QUIZ";
    document.getElementById('content-area').innerHTML=`
    <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi</button>
    <button class="btn-apple" onclick="uiPin('register')">Nuovo utente</button>
    <button class="btn-apple" onclick="setGuest()">Guest</button>`;
}

function uiPin(type){
    updateNav(true,"renderLogin()");
    document.getElementById('content-area').innerHTML=`
    <input id="pin-field" maxlength="4" class="btn-apple" inputmode="numeric">
    <button class="btn-apple btn-primary" onclick="validatePin('${type}')">OK</button>`;
}

function validatePin(type){
    const pin=document.getElementById('pin-field').value;
    if(pin.length!==4) return alert("PIN non valido");
    state.userId=pin;
    localStorage.setItem('devUserId',pin);
    loadUserData();
    state.mode='user';
    showHome();
}
function setGuest(){ state.mode='guest'; showHome(); }

/* ====== HOME ====== */
function showHome(){
    updateNav(true,"renderLogin()");
    document.getElementById('app-title').innerText="PERCORSI";
    let h=`<div class="lang-grid">`;
    Object.keys(quizDB).forEach(l=>{
        h+=`<div class="lang-item" onclick="showLevels('${l}')">${l}</div>`;
    });
    if(state.mode==='user')
        h+=`<div class="lang-item" onclick="renderProfile()">PROFILO</div>`;
    h+=`</div>`;
    document.getElementById('content-area').innerHTML=h;
}

/* ====== PROFILO ====== */
function renderProfile(){
    updateNav(true,"showHome()");
    document.getElementById('app-title').innerText="PROFILO";

    let html=`
    <button class="btn-apple" onclick="resetProfile()">Reset progressi</button>
    <button class="btn-apple" onclick="changePin()">Cambia PIN</button>
    <button class="btn-apple" onclick="exportData()">Esporta</button>
    <input type="file" onchange="importData(event)" class="btn-apple">
    <hr>`;

    Object.keys(state.history).forEach(l=>{
        html+=`<h4>${l}</h4>`;
        state.history[l].forEach(i=>{
            html+=`<div>${i.q}</div>`;
        });
    });
    document.getElementById('content-area').innerHTML=html;
}

/* ====== RESET ====== */
function resetProfile(){
    if(!confirm("Cancellare tutto?")) return;
    state.progress={}; state.history={};
    localStorage.removeItem(pKey());
    localStorage.removeItem(hKey());
    alert("Reset fatto");
    showHome();
}

/* ====== CAMBIO PIN ====== */
function changePin(){
    const np=prompt("Nuovo PIN (4 cifre)");
    if(!np || np.length!==4) return;

    localStorage.setItem('devProgress_'+np, JSON.stringify(state.progress));
    localStorage.setItem('devHistory_'+np, JSON.stringify(state.history));
    localStorage.removeItem(pKey());
    localStorage.removeItem(hKey());

    state.userId=np;
    localStorage.setItem('devUserId',np);
    alert("PIN cambiato");
}

/* ====== EXPORT / IMPORT ====== */
function exportData(){
    const data={progress:state.progress, history:state.history};
    const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download="quiz_backup.json";
    a.click();
}

function importData(e){
    const f=e.target.files[0];
    if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
        const d=JSON.parse(r.result);
        state.progress=d.progress||{};
        state.history=d.history||{};
        saveAll();
        alert("Dati importati");
        showHome();
    };
    r.readAsText(f);
}

/* ====== QUIZ ====== */
function showLevels(lang){
    updateNav(true,"showHome()");
    let h="";
    for(let i=1;i<=5;i++)
        h+=`<button class="btn-apple" onclick="startStep('${lang}',${i})">Livello ${i}</button>`;
    document.getElementById('content-area').innerHTML=h;
}

function startStep(l,v){
    const key = 'L' + v;
    const allQuestions = quizDB[l][key] || [];
    if(allQuestions.length === 0) return alert("Livello non disponibile");
    
    // prende 15 domande random dal livello
    session = {
        lang: l,
        lvl: v,
        q: pickRandom(allQuestions, 15),
        idx: 0
    };
    renderQ();
}

function renderQ(){
    const d=session.q[session.idx];
    document.getElementById('content-area').innerHTML=
    `<h3>${d.q}</h3>`+
    d.options.map((o,i)=>`<button class="btn-apple" onclick="check(${i===d.correct})">${o}</button>`).join('');
}

function check(ok){
    if(state.mode==='user'){
        state.history[session.lang]=state.history[session.lang]||[];
        state.history[session.lang].push({q:session.q[session.idx].q,ok});
        saveAll();
    }
    next();
}

function next(){
    session.idx++;
    if(session.idx<session.q.length) renderQ();
    else{
        state.progress[session.lang]=Math.max(state.progress[session.lang]||0,session.lvl);
        saveAll();
        showLevels(session.lang);
    }
}

/* ====== NAV ====== */
function updateNav(s,t){
    document.getElementById('back-nav').innerHTML = s?`<div onclick="${t}">〈 Indietro</div>`:"";
}
