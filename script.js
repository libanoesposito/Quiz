// DATABASE ESEMPIO (Espandibile fino a 50 per categoria)
const database = {
    Python: {
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        levels: {
            1: [
                { q: "Quale simbolo si usa per i commenti?", options: ["//", "#", "/*", "--"], correct: 1, exp: "In Python si usa il cancelletto." },
                // ... aggiungi altre 49 domande qui
            ],
            2: [{ q: "Come si crea una lista?", options: ["[]", "{}", "()", "<>"], correct: 0, exp: "Le liste usano le parentesi quadre." }],
            5: { challenge: "Scrivi un ciclo che stampa i numeri da 0 a 4", target: "for i in range(5):" }
        }
    },
    JavaScript: {
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
        levels: {
            1: [{ q: "Come dichiari una variabile?", options: ["var", "let", "const", "Tutte"], correct: 3, exp: "Tutte e tre sono valide." }],
            5: { challenge: "Dichiara una costante chiamata 'pi' con valore 3.14", target: "const pi = 3.14;" }
        }
    }
    // Aggiungi MySQL, Java, HTML seguendo lo stesso schema
};

let state = {
    currentLang: null,
    currentLevel: null,
    questions: [],
    index: 0,
    score: 0
};

function init() {
    renderHome();
    document.getElementById('theme-slider').onchange = (e) => 
        document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
}

function renderHome() {
    const menu = document.getElementById('lang-menu');
    menu.innerHTML = Object.keys(database).map(lang => `
        <div class="lang-card" onclick="selectLang('${lang}')">
            <img src="${database[lang].icon}">
            <h3>${lang}</h3>
        </div>
    `).join('');
    showScreen('home-screen');
}

function selectLang(lang) {
    state.currentLang = lang;
    const menu = document.getElementById('level-menu');
    menu.innerHTML = [1,2,3,4,5].map(lvl => `
        <div class="option-btn" onclick="startLevel(${lvl})">
            Livello ${lvl} ${lvl === 5 ? '(Expert)' : ''}
        </div>
    `).join('');
    document.getElementById('current-lang-icon').innerHTML = `<img src="${database[lang].icon}" width="30">`;
    showScreen('level-screen');
}

function startLevel(lvl) {
    state.currentLevel = lvl;
    state.index = 0;
    if(lvl < 5) {
        // Prende 10 domande casuali da un pool (es. di 50)
        let pool = database[state.currentLang].levels[lvl] || [];
        state.questions = pool.sort(() => 0.5 - Math.random()).slice(0, 10);
        showQuestion();
    } else {
        startCodingChallenge();
    }
}

function showQuestion() {
    const q = state.questions[state.index];
    document.getElementById('question-text').innerText = q.q;
    const container = document.getElementById('options-container');
    container.innerHTML = q.options.map((opt, i) => `
        <button class="option-btn" onclick="checkAnswer(${i})">${opt}</button>
    `).join('');
    showScreen('quiz-screen');
}

// LIVELLO 5: CODING CHALLENGE
function startCodingChallenge() {
    const chall = database[state.currentLang].levels[5];
    document.getElementById('challenge-text').innerText = chall.challenge;
    showScreen('coding-screen');
}

function highlightCode() {
    const input = document.getElementById('code-input').value;
    const output = document.getElementById('code-output').querySelector('code');
    // Semplice regex per colorazione
    let html = input
        .replace(/\b(const|let|var|def|for|in|return|function)\b/g, '<span class="token-keyword">$1</span>')
        .replace(/(\".*?\"|\'.*?\')/g, '<span class="token-string">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
    output.innerHTML = html;
}

function checkCodingChallenge() {
    const input = document.getElementById('code-input').value.trim();
    const target = database[state.currentLang].levels[5].target;
    if(input === target) {
        alert("Perfetto! Codice corretto.");
        showHome();
    } else {
        alert("Il codice non corrisponde alla richiesta. Riprova.");
    }
}

function showScreen(id) {
    document.querySelectorAll('.app-container').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function showHome() { renderHome(); }

window.onload = init;
