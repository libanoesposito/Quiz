const langs = [
    { id: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { id: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { id: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { id: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { id: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }
];

// Caricamento progressi
let userMode = localStorage.getItem('devUserMode') || null;
let userProgress = JSON.parse(localStorage.getItem('devProgress')) || {};

function init() {
    if (!userMode) showAuth();
    else showHome();
}

function showAuth() {
    document.getElementById('app-title').innerText = "DevMaster";
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <h2 style="text-align:center; margin-bottom:24px;">Benvenuto</h2>
        <button class="btn-apple btn-primary" onclick="setAuth('user')">Accedi come Utente</button>
        <button class="btn-apple" onclick="setAuth('guest')">Continua come Guest</button>
    `;
}

function setAuth(mode) {
    userMode = mode;
    localStorage.setItem('devUserMode', mode);
    showHome();
}

function logout() {
    localStorage.removeItem('devUserMode');
    userMode = null;
    showAuth();
}

function showHome() {
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let gridHtml = `<div class="lang-grid">`;
    langs.forEach(l => {
        gridHtml += `
            <div class="lang-item" onclick="showLevels('${l.id}')">
                <img src="${l.icon}">
                <div style="font-weight:600; font-size:14px;">${l.id}</div>
            </div>`;
    });
    gridHtml += `</div>
    <button class="btn-apple" onclick="logout()" style="margin-top:30px; background:none; color:var(--accent); text-align:center;">Cambia modalità (Logout)</button>`;
    area.innerHTML = gridHtml;
}

function showLevels(langId) {
    document.getElementById('app-title').innerText = langId;
    const area = document.getElementById('content-area');
    
    // Controlla quanti livelli sono stati completati per questo linguaggio
    const completed = userProgress[langId] || 0; // numero da 0 a 4

    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent); font-weight:600;">← Indietro</button>`;
    
    for(let i=1; i<=5; i++) {
        const isLocked = i === 5 && completed < 4;
        const isDone = i <= completed;
        html += `
            <button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startQuiz('${langId}', ${i})">
                Livello ${i} ${isLocked ? '🔒' : (isDone ? '✅' : '🚀')}
            </button>`;
    }

    html += `<button class="btn-apple btn-danger" onclick="resetLang('${langId}')">Reset progressi ${langId}</button>`;
    area.innerHTML = html;
}

function resetLang(langId) {
    if(confirm(`Vuoi davvero resettare i progressi di ${langId}?`)) {
        userProgress[langId] = 0;
        localStorage.setItem('devProgress', JSON.stringify(userProgress));
        showLevels(langId);
    }
}

function startQuiz(langId, lvl) {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div style="text-align:center;">
            <span style="color:var(--accent); font-weight:700;">${langId} • LIVELLO ${lvl}</span>
            <h2 style="margin:20px 0;">Domanda simulata?</h2>
            <button class="btn-apple" onclick="completeLevel('${langId}', ${lvl})">Risposta Corretta (Simula fine)</button>
            <button class="btn-apple" onclick="showLevels('${langId}')">Annulla</button>
        </div>
    `;
}

function completeLevel(langId, lvl) {
    // Aggiorna progresso se il livello completato è l'ultimo sbloccato
    if(!userProgress[langId]) userProgress[langId] = 0;
    if(lvl > userProgress[langId] && lvl < 5) {
        userProgress[langId] = lvl;
        localStorage.setItem('devProgress', JSON.stringify(userProgress));
    }
    
    alert(`Livello ${lvl} completato!`);
    showLevels(langId);
}

// Dark Mode
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

window.onload = init;
