const langs = [
    { id: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { id: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { id: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { id: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { id: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }
];

let currentUser = localStorage.getItem('devUser') || null;

function init() {
    if (!currentUser) {
        showAuth();
    } else {
        showHome();
    }
}

function showAuth() {
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <h2 style="text-align:center; margin-bottom:20px;">Benvenuto</h2>
        <button class="btn-apple btn-primary" onclick="setAuth('user')">Accedi come Utente</button>
        <button class="btn-apple" onclick="setAuth('guest')">Continua come Guest</button>
    `;
}

function setAuth(mode) {
    currentUser = mode;
    if(mode === 'user') localStorage.setItem('devUser', 'user');
    showHome();
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
    gridHtml += `</div>`;
    area.innerHTML = gridHtml;
}

function showLevels(langId) {
    document.getElementById('app-title').innerText = langId;
    const area = document.getElementById('content-area');
    area.innerHTML = `
        <button class="btn-apple" onclick="showHome()" style="background:none; color:var(--accent); font-weight:600;">← Indietro</button>
        ${[1,2,3,4,5].map(n => `<button class="btn-apple" onclick="alert('Avvio Livello ${n}')">Livello ${n}</button>`).join('')}
    `;
}

// Dark Mode
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

window.onload = init;
