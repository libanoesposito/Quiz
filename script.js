let state = {
    mode: localStorage.getItem('devUserMode') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    resume: JSON.parse(localStorage.getItem('devResume')) || {}
};

window.onload = () => { renderApp(); };

function renderApp() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "DevMaster";
    document.getElementById('content-area').innerHTML = `
        <div class="auth-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%">
            <h2 style="margin-bottom:30px">Accesso</h2>
            <button class="btn-apple btn-primary" onclick="uiPin()">Utente Registrato</button>
            <button class="btn-apple" onclick="setGuest()">Modalità Guest</button>
        </div>`;
}

function setGuest() { 
    state.mode = 'guest'; 
    showHome(); 
}

function uiPin() {
    updateNav(true, "renderApp()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center; padding-top:20px">
            <h3>PIN 4 Cifre</h3>
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px" maxlength="4">
            <button class="btn-apple btn-primary" onclick="confirmPin()">Entra</button>
        </div>`;
}

function confirmPin() {
    if(document.getElementById('pin-field').value.length === 4) {
        state.mode = 'user';
        localStorage.setItem('devUserMode', 'user');
        showHome();
    }
}

function showHome() {
    // TASTO INDIETRO PER GUEST E USER: torna al login
    updateNav(true, "renderApp()");
    document.getElementById('app-title').innerText = "Percorsi";
    
    // Generazione dinamica card - Qui appaiono Java e MySQL se presenti in quizDB
    let html = `<div class="lang-grid">`;
    Object.keys(quizDB).forEach(lang => {
        const icon = (lang === 'HTML') ? 'html5' : lang.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${lang}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" 
                 width="35" 
                 onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:600; font-size:14px;">${lang}</div>
        </div>`;
    });
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function showLevels(lang) {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;
    const completed = state.progress[lang] || 0;
    let html = "";
    for(let i=1; i<=5; i++) {
        const isLocked = (state.mode === 'user' && i === 5 && completed < 4);
        const resIdx = state.resume[`${lang}_${i}`];
        const label = (i === 5) ? "Livello 5: Coding" : (resIdx != null ? `Livello ${i} (Continua)` : `Livello ${i}`);
        html += `<button class="btn-apple" ${isLocked ? 'disabled' : ''} onclick="startStep('${lang}', ${i})">
            ${label} ${isLocked ? '🔒' : ''}
        </button>`;
    }
    document.getElementById('content-area').innerHTML = html;
}

// ... restanti funzioni (startStep, renderQ, check, run) rimangono le stesse della versione precedente ...
// ASSICURATI DI COPIARE ANCHE QUELLE DAL MESSAGGIO PRECEDENTE PER FAR FUNZIONARE IL GIOCO

function updateNav(show, target) {
    document.getElementById('back-nav').innerHTML = show ? `<div class="back-link" onclick="${target}">〈 Indietro</div>` : "";
}

document.getElementById('theme-slider').onchange = (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
};
