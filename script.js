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
    
    let html = `<div class="lang-grid">`;
    Object.keys(database).forEach(lang => {
        const perc = progress[lang] || 0;
        html += `
            <div class="lang-card" onclick="selectLang('${lang}')">
                <img src="${database[lang].icon}" alt="${lang}">
                <p style="margin: 5px 0 0; font-weight:600;">${lang}</p>
                <div style="font-size:10px; opacity:0.6;">${perc}%</div>
            </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function selectLang(lang) {
    document.getElementById('view-title').innerText = lang;
    const container = document.getElementById('dynamic-content');
    
    let html = `
        <button class="btn-apple-secondary" style="width:100%; margin-bottom:20px;" onclick="renderLangs()">← Torna Indietro</button>
        <div class="level-list">
            ${[1,2,3,4,5].map(lvl => `
                <button class="option-btn" onclick="startLevel('${lang}', ${lvl})">Livello ${lvl} ${lvl === 5 ? '🚀' : ''}</button>
            `).join('')}
        </div>`;
    container.innerHTML = html;
}

function startLevel(lang, lvl) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div class="quiz-container">
            <span style="color:var(--accent); font-size:12px; font-weight:700;">LIVELLO ${lvl}</span>
            <h2 style="margin:10px 0 20px;">Domanda di esempio per ${lang}?</h2>
            <button class="option-btn" onclick="showFeedback(true, '${lang}')">Risposta Corretta</button>
            <button class="option-btn" onclick="showFeedback(false, '${lang}')">Risposta Errata</button>
        </div>
    `;
}

function showFeedback(isCorrect, lang) {
    if(isCorrect && userMode === 'user') {
        progress[lang] = Math.min((progress[lang] || 0) + 10, 100);
        localStorage.setItem('devQuizProgress', JSON.stringify(progress));
    }
    
    const container = document.getElementById('dynamic-content');
    container.innerHTML = `
        <div style="text-align:center; padding: 20px 0;">
            <h1 style="color:${isCorrect ? '#34c759' : '#ff3b30'}">${isCorrect ? 'Corretto!' : 'Sbagliato'}</h1>
            <p style="margin-bottom:30px;">Ottimo progresso nel percorso ${lang}.</p>
            <button class="btn-apple-primary" style="width:100%" onclick="selectLang('${lang}')">Continua</button>
        </div>
    `;
}

// Gestione Tema
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});
