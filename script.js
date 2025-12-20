const database = {
    Python: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    JavaScript: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    MySQL: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    Java: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    HTML: { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }
};

let userMode = 'guest';
let progress = JSON.parse(localStorage.getItem('devQuizProgress')) || {};

function startApp(mode) {
    userMode = mode;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    renderLangs();
}

function renderLangs() {
    document.getElementById('view-title').innerText = "Percorsi";
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `<div class="lang-grid">${Object.keys(database).map(lang => `
        <div class="lang-card" onclick="selectLang('${lang}')">
            <img src="${database[lang].icon}">
            <p style="font-weight:600; margin:0; font-size:14px;">${lang}</p>
            <small style="opacity:0.6">${progress[lang] || 0}% completato</small>
        </div>
    `).join('')}</div>`;
}

function selectLang(lang) {
    document.getElementById('view-title').innerText = lang;
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <button class="btn-apple-secondary" style="margin-bottom:20px" onclick="renderLangs()">← Torna ai percorsi</button>
        <div class="level-list">
            ${[1, 2, 3, 4, 5].map(lvl => `
                <button class="option-btn" onclick="startLevel('${lang}', ${lvl})">
                    Livello ${lvl} ${lvl === 5 ? '🚀' : ''}
                </button>
            `).join('')}
        </div>
    `;
}

function startLevel(lang, lvl) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="quiz-view">
            <span class="badge-apple" style="color:var(--accent); font-weight:700; font-size:11px;">LIVELLO ${lvl}</span>
            <h2 style="margin: 15px 0 25px; font-size:22px;">Qual è il comando per... ?</h2>
            <div class="options-stack">
                <button class="option-btn" onclick="showFeedback(true, '${lang}')">Opzione Corretta</button>
                <button class="option-btn" onclick="showFeedback(false, '${lang}')">Opzione Errata</button>
            </div>
        </div>
    `;
}

function showFeedback(isCorrect, lang) {
    if(isCorrect && userMode === 'user') {
        saveProgress(lang);
    }
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div style="text-align:center">
            <h1 style="color:${isCorrect ? '#34c759' : '#ff3b30'}">${isCorrect ? 'Ottimo!' : 'Riprova'}</h1>
            <p>La spiegazione del linguaggio apparirà qui.</p>
            <button class="btn-apple-primary" style="width:100%" onclick="selectLang('${lang}')">Continua</button>
        </div>
    `;
}

function saveProgress(lang) {
    if(!progress[lang]) progress[lang] = 0;
    progress[lang] = Math.min(progress[lang] + 5, 100);
    localStorage.setItem('devQuizProgress', JSON.stringify(progress));
    
    const indicator = document.getElementById('save-indicator');
    indicator.classList.remove('hidden');
    setTimeout(() => indicator.classList.add('hidden'), 2000);
}

// Tema
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});
