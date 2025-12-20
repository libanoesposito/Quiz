const quizData = {
    Python: [
        { q: "Quale simbolo si usa per i commenti?", options: ["//", "/*", "#"], correct: 2, exp: "Python usa il cancelletto.", code: "# Questo è un commento" },
        { q: "Come si crea una lista?", options: ["(1,2)", "{1,2}", "[1,2]"], correct: 2, exp: "Le liste usano parentesi quadre.", code: "mia_lista = [1, 2, 3]" }
    ],
    JavaScript: [{ q: "Come dichiari una costante?", options: ["let", "const", "var"], correct: 1, exp: "const impedisce la riassegnazione.", code: "const x = 10;" }],
    MySQL: [{ q: "Comando per eliminare dati?", options: ["REMOVE", "DELETE", "DROP"], correct: 1, exp: "DELETE rimuove righe da una tabella.", code: "DELETE FROM tabella WHERE id=1;" }],
    Java: [{ q: "Metodo principale?", options: ["start()", "main()", "init()"], correct: 1, exp: "Java parte dal metodo main.", code: "public static void main(String[] args)" }],
    HTML: [{ q: "Tag per un link?", options: ["<link>", "<a>", "<href>"], correct: 1, exp: "Il tag 'a' definisce un hyperlink.", code: "<a href='url'>Link</a>" }]
};

let user = { id: localStorage.getItem('devUserId'), mode: localStorage.getItem('devUserMode'), progress: JSON.parse(localStorage.getItem('devProgress')) || {}, toStudy: JSON.parse(localStorage.getItem('devToStudy')) || [] };
let currentQuiz = { lang: "", lvl: 0, questions: [], idx: 0 };

function init() {
    updateReviewIcon();
    if (!user.mode) showAuth(); else showHome();
}

function showAuth() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <h2 style="text-align:center;">Benvenuto</h2>
        <button class="btn-apple btn-primary" onclick="setupUser()">Accedi come Utente</button>
        <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
    `;
}

function setupUser() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <h3>Crea il tuo PIN</h3>
        <p style="font-size:13px; opacity:0.7;">Inserisci 4 cifre per salvare i progressi.</p>
        <input type="password" id="pin" class="pin-input" maxlength="4" placeholder="0000">
        <button class="btn-apple btn-primary" onclick="validatePin()">Salva e Accedi</button>
        <button class="btn-apple" onclick="showAuth()" style="background:none; text-align:center;">Annulla</button>
    `;
}

function validatePin() {
    const pin = document.getElementById('pin').value;
    const forbidden = ["1234","4567","7890","1111","2222","3333","4444","5555","6666","7777","8888","9999","0000"];
    if(pin.length < 4 || forbidden.includes(pin)) {
        alert("PIN non valido o troppo semplice!");
        return;
    }
    user.id = pin; user.mode = 'user';
    localStorage.setItem('devUserId', pin);
    localStorage.setItem('devUserMode', 'user');
    showHome();
}

function setGuest() {
    user.mode = 'guest';
    localStorage.setItem('devUserMode', 'guest');
    showHome();
}

function showHome() {
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let html = `<div class="lang-grid">` + Object.keys(quizData).map(l => `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${l.toLowerCase()}/${l.toLowerCase()}-original.svg" width="40">
            <div style="font-weight:600; margin-top:5px;">${l}</div>
        </div>`).join('') + `</div>
        <button class="btn-apple" onclick="logout()" style="margin-top:30px; background:none; text-align:center; color:var(--accent);">Esci (${user.mode === 'user' ? 'ID:'+user.id : 'Guest'})</button>`;
    area.innerHTML = html;
}

function showLevels(lang) {
    currentQuiz.lang = lang;
    document.getElementById('app-title').innerText = lang;
    const completed = user.progress[lang] || 0;
    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent);">← Indietro</button>`;
    for(let i=1; i<=5; i++) {
        const locked = i === 5 && completed < 4;
        html += `<button class="btn-apple" ${locked ? 'disabled' : ''} onclick="startQuiz('${lang}', ${i})">Livello ${i} ${locked ? '🔒' : (i <= completed ? '✅' : '🚀')}</button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

function startQuiz(lang, lvl) {
    currentQuiz = { lang, lvl, idx: 0, questions: [...quizData[lang]].sort(() => 0.5 - Math.random()).slice(0, 10) };
    renderQuestion();
}

function renderQuestion() {
    const q = currentQuiz.questions[currentQuiz.idx];
    document.getElementById('content-area').innerHTML = `
        <p style="font-size:12px; color:var(--accent); font-weight:700;">LIVELLO ${currentQuiz.lvl}</p>
        <h2 style="margin-bottom:25px;">${q.q}</h2>
        ${q.options.map((opt, i) => `<button class="btn-apple" onclick="checkAnswer(${i})">${opt}</button>`).join('')}
        <button class="btn-danger" onclick="saveToStudy()">Non l'ho studiato</button>
    `;
}

function checkAnswer(i) {
    const q = currentQuiz.questions[currentQuiz.idx];
    const win = i === q.correct;
    if(!win) saveToStudy(false);
    document.getElementById('content-area').innerHTML = `
        <h2 style="color:${win ? '#34c759' : '#ff3b30'}">${win ? 'Corretto!' : 'Sbagliato'}</h2>
        <div style="background:rgba(120,120,128,0.1); padding:15px; border-radius:15px; margin:20px 0;">
            <strong>Spiegazione:</strong><br>${q.exp}
            <div class="code-block">${q.code}</div>
        </div>
        <button class="btn-apple btn-primary" onclick="next()">Continua</button>
    `;
}

function saveToStudy(moveNext = true) {
    const q = currentQuiz.questions[currentQuiz.idx];
    if(!user.toStudy.some(x => x.q === q.q)) {
        user.toStudy.push(q);
        localStorage.setItem('devToStudy', JSON.stringify(user.toStudy));
        updateReviewIcon();
    }
    if(moveNext) next();
}

function next() {
    currentQuiz.idx++;
    if(currentQuiz.idx < currentQuiz.questions.length) renderQuestion();
    else finish();
}

function finish() {
    if(user.mode === 'user' && currentQuiz.lvl < 5) {
        user.progress[currentQuiz.lang] = Math.max(user.progress[currentQuiz.lang] || 0, currentQuiz.lvl);
        localStorage.setItem('devProgress', JSON.stringify(user.progress));
    }
    showLevels(currentQuiz.lang);
}

function showReviewSession() {
    document.getElementById('app-title').innerText = "Area Studio";
    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent);">← Chiudi</button>`;
    user.toStudy.forEach((q, i) => {
        html += `<div style="border-bottom:1px solid var(--border); padding:15px 0;">
            <strong>${q.q}</strong><p style="font-size:14px; opacity:0.8;">${q.exp}</p>
            <div class="code-block">${q.code}</div>
            <button onclick="removeStudy(${i})" style="color:#ff3b30; background:none; border:none; cursor:pointer;">L'ho imparato ✓</button>
        </div>`;
    });
    document.getElementById('content-area').innerHTML = html || "<p>Nulla da studiare!</p>";
}

function removeStudy(i) { user.toStudy.splice(i, 1); localStorage.setItem('devToStudy', JSON.stringify(user.toStudy)); showReviewSession(); updateReviewIcon(); }
function updateReviewIcon() { document.getElementById('btn-review').classList.toggle('hidden', user.toStudy.length === 0); }
function logout() { localStorage.clear(); location.reload(); }
document.getElementById('theme-slider').onchange = (e) => document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
window.onload = init;
