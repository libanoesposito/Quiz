const langs = [
    { id: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { id: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { id: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { id: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { id: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }
];

// Stato globale dell'app
let state = {
    userMode: localStorage.getItem('devUserMode'),
    progress: JSON.parse(localStorage.getItem('devProgress')) || {}
};

function init() {
    if (!state.userMode) showAuth();
    else showHome();
}

function showAuth() {
    document.getElementById('app-title').innerText = "DevMaster";
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div style="text-align:center; padding: 20px 0;">
            <p style="opacity:0.6; margin-bottom:30px;">Scegli come vuoi studiare oggi</p>
            <button class="btn-apple btn-primary" onclick="setAuth('user')">Accedi con Progressi</button>
            <button class="btn-apple" onclick="setAuth('guest')" style="margin-top:10px;">Modalità Guest (Sola lettura)</button>
        </div>
    `;
}

function setAuth(mode) {
    state.userMode = mode;
    localStorage.setItem('devUserMode', mode);
    showHome();
}

function logout() {
    localStorage.removeItem('devUserMode');
    state.userMode = null;
    showAuth();
}

function showHome() {
    document.getElementById('app-title').innerText = "Percorsi";
    const area = document.getElementById('content-area');
    let html = `<div class="lang-grid">`;
    langs.forEach(l => {
        const completed = state.progress[l.id] || 0;
        html += `
            <div class="lang-item" onclick="showLevels('${l.id}')">
                <img src="${l.icon}">
                <div style="font-weight:600; font-size:14px;">${l.id}</div>
                <div style="font-size:10px; opacity:0.5;">Lvl ${completed}/4</div>
            </div>`;
    });
    html += `</div>
    <button class="btn-apple" onclick="logout()" style="margin-top:40px; background:none; color:var(--accent); text-align:center;">Cambia Account / Logout</button>`;
    area.innerHTML = html;
}

function showLevels(langId) {
    document.getElementById('app-title').innerText = langId;
    const area = document.getElementById('content-area');
    const completed = state.progress[langId] || 0;

    let html = `<button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent); padding-left:0;">← Torna ai Percorsi</button>`;
    
    for(let i=1; i<=5; i++) {
        // Il livello 5 si sblocca solo se i primi 4 sono fatti
        const isLocked = i === 5 && completed < 4;
        const statusIcon = isLocked ? '🔒' : (i <= completed ? '✅' : '🚀');
        
        html += `
            <button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startQuiz('${langId}', ${i})">
                Livello ${i} <span style="float:right">${statusIcon}</span>
            </button>`;
    }

    html += `<button class="btn-danger" onclick="resetLang('${langId}')">Resetta progressi ${langId}</button>`;
    area.innerHTML = html;
}

function startQuiz(langId, lvl) {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <div style="padding: 10px 0;">
            <p style="color:var(--accent); font-weight:700; font-size:12px;">STUDIO: ${langId}</p>
            <h2 style="margin:15px 0 30px;">Stai affrontando il Livello ${lvl}.</h2>
            <button class="btn-apple btn-primary" onclick="completeLevel('${langId}', ${lvl})">Simula Completamento</button>
            <button class="btn-apple" onclick="showLevels('${langId}')" style="background:none; text-align:center; color:var(--text); opacity:0.5;">Annulla</button>
        </div>
    `;
}

function completeLevel(langId, lvl) {
    // Salviamo il progresso solo se siamo in User Mode e se è un livello nuovo (1-4)
    if(state.userMode === 'user' && lvl < 5) {
        if(!state.progress[langId] || lvl > state.progress[langId]) {
            state.progress[langId] = lvl;
            localStorage.setItem('devProgress', JSON.stringify(state.progress));
        }
    }
    showLevels(langId);
}

function resetLang(langId) {
    if(confirm(`Resettare tutti i progressi di ${langId}?`)) {
        state.progress[langId] = 0;
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
        showLevels(langId);
    }
}

// Dark Mode corretta
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

window.onload = init;
