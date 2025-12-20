const database = {
    Python: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", levels: { 1: [{q: "Simbolo commento?", options: ["//", "#", "/*"], correct: 1, exp: "Si usa #", code: "# commento"}], 5: { chall: "Crea una lista vuota 'x'", target: "x = []" } } },
    JavaScript: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", levels: { 1: [{q: "Dichiara costante?", options: ["let", "var", "const"], correct: 2, exp: "Si usa const", code: "const x = 1;"}], 5: { chall: "Stampa 'ok' in console", target: "console.log('ok');" } } },
    MySQL: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", levels: { 1: [{q: "Comando per leggere?", options: ["GET", "READ", "SELECT"], correct: 2, exp: "Si usa SELECT", code: "SELECT * FROM t;"}], 5: { chall: "Elimina tabella 'users'", target: "DROP TABLE users;" } } },
    Java: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", levels: { 1: [{q: "Punto di ingresso?", options: ["main", "start", "run"], correct: 0, exp: "Il metodo main.", code: "public static void main..."}], 5: { chall: "Dichiara intero x = 10", target: "int x = 10;" } } },
    HTML: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg", levels: { 1: [{q: "Tag titolo?", options: ["<p>", "<h1>", "<a>"], correct: 1, exp: "h1 è il titolo.", code: "<h1>Ciao</h1>"}], 5: { chall: "Crea un link vuoto", target: "<a href=''></a>" } } }
};

let state = { lang: "", lvl: 0, idx: 0, questions: [], studyLater: [] };

function init() {
    renderHome();
    document.getElementById('theme-slider').addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
    });
}

function renderHome() {
    const menu = document.getElementById('lang-menu');
    menu.innerHTML = Object.keys(database).map(l => `
        <div class="glass-card lang-card" onclick="selectLang('${l}')">
            <img src="${database[l].icon}">
            <p style="font-weight:600; margin:0;">${l}</p>
        </div>
    `).join('');
    showScreen('home-screen');
}

function selectLang(l) {
    state.lang = l;
    document.getElementById('selected-lang-title').innerText = l;
    document.getElementById('current-lang-icon').innerHTML = `<img src="${database[l].icon}" width="30">`;
    const menu = document.getElementById('level-menu');
    menu.innerHTML = [1,2,3,4,5].map(n => `<button class="option-btn" onclick="startLvl(${n})">Livello ${n}</button>`).join('');
    showScreen('level-screen');
}

function startLvl(n) {
    state.lvl = n; state.idx = 0;
    if(n < 5) {
        let pool = database[state.lang].levels[1]; // Qui andranno le tue 50 domande
        state.questions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
        showQ();
    } else {
        const c = database[state.lang].levels[5];
        document.getElementById('challenge-text').innerText = c.chall;
        showScreen('coding-screen');
    }
}

function showQ() {
    const q = state.questions[state.index];
    document.getElementById('quiz-meta').innerText = `${state.lang} • Livello ${state.lvl}`;
    document.getElementById('question-text').innerText = q.q;
    const cont = document.getElementById('options-container');
    cont.innerHTML = q.options.map((o, i) => `<button class="option-btn" onclick="check(${i})">${o}</button>`).join('');
    showScreen('quiz-screen');
}

function check(i) {
    const q = state.questions[state.idx];
    const win = i === q.correct;
    document.getElementById('feedback-explanation').innerText = q.exp;
    document.getElementById('feedback-code').innerText = q.code;
    document.getElementById('status-icon-box').innerHTML = win ? `<h2 style="color:var(--ios-green)">Ottimo!</h2>` : `<h2 style="color:#ff3b30">Sbagliato</h2>`;
    document.getElementById('add-end-btn').classList.toggle('hidden', win);
    showScreen('feedback-screen');
}

function syncCode() {
    const val = document.getElementById('code-input').value;
    document.getElementById('code-highlight').querySelector('code').innerText = val;
}

function checkCode() {
    const val = document.getElementById('code-input').value.trim();
    if(val === database[state.lang].levels[5].target) {
        alert("Completato!"); renderHome();
    } else { alert("Riprova!"); }
}

function proceed() { state.idx++; if(state.idx < 10 && state.idx < state.questions.length) showQ(); else renderHome(); }
function showScreen(id) { document.querySelectorAll('.app-container').forEach(s => s.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }
function showHome() { renderHome(); }
function addToEnd() { state.questions.push(state.questions[state.idx]); proceed(); }
function handleStudyLater() { state.studyLater.push(state.questions[state.idx]); proceed(); }

window.onload = init;
