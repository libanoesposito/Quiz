let state = {
    mode: null,
    userId: localStorage.getItem('devUserId') || null,
    progress: JSON.parse(localStorage.getItem('devProgress')) || {},
    history: JSON.parse(localStorage.getItem('devHistory')) || {}
};
let session = null;

// GESTIONE TEMA AUTOMATICO E MANUALE
const themeIconLuna = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
const themeIconSole = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(systemDark ? 'dark' : 'light');
    }
}

function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    document.getElementById('theme-icon').innerHTML = mode === 'dark' ? themeIconSole : themeIconLuna;
    localStorage.setItem('theme', mode);
}

function toggleThemeManual() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
}

window.onload = () => {
    initTheme();
    renderLogin();
};

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

function renderLogin() {
    state.mode = null; updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:10px">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent); text-align:center" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center">
            <h3 style="margin-bottom:20px">${type === 'login' ? 'Bentornato' : 'Crea il tuo PIN'}</h3>
            <input type="password" id="pin-field" class="btn-apple" style="text-align:center; font-size:24px; letter-spacing:8px" maxlength="4" inputmode="numeric">
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="validatePin('${type}')">Conferma</button>
        </div>`;
}

function validatePin(type) {
    const pin = document.getElementById('pin-field').value;
    const easy = ['1111','2222','3333','1234','4567','6789'];
    if(pin.length !== 4) return alert("Inserisci 4 cifre");
    if(easy.includes(pin)) return alert("PIN troppo semplice!");
    
    if(pin === "3473") { // CEO PIN
        grantCeoAccess();
        return;
    }

    if(type === 'register') { 
        if(pin === "3473") return alert("PIN non disponibile per nuovi utenti");
        localStorage.setItem('devUserId', pin); 
        state.userId = pin; 
    } else { 
        if(pin !== state.userId) return alert("PIN Errato"); 
    }
    state.mode = 'user'; showHome();
}

function setGuest() { state.mode = 'guest'; showHome(); }

function showHome() {
    updateNav(true, "renderLogin()");
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;
    Object.keys(quizDB).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `
        <div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });
    if(state.mode === 'user') {
        html += `<div class="lang-item profile-slot" onclick="renderProfile()"><div style="font-weight:700">IL MIO PROFILO & RIPASSO</div></div>`;
    }
    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

// ----- PROFILO -----
function renderProfile() {
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "PROFILO";
    let html = `<h3>Storico Ripasso</h3>`;
    const langs = Object.keys(state.history);
    if(langs.length === 0) html += `<p>Completa dei livelli per vedere qui il tuo riepilogo.</p>`;
    langs.forEach(lang => {
        html += `<h4 style="margin-top:20px; color:var(--accent)">${lang}</h4>`;
        state.history[lang].forEach(item => {
            html += `
            <div class="review-card ${item.ok ? 'is-ok' : 'is-err'}">
                <div style="font-weight:bold; margin-bottom:5px"><span class="dot" style="background:${item.ok?'#34c759':'#ff3b30'}"></span>${item.q}</div>
                <div style="font-size:12px; opacity:0.8; margin-bottom:8px">${item.exp}</div>
                <pre style="font-size:10px">${item.code}</pre>
            </div>`;
        });
    });

    html += `
        <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap">
            <button class="btn-apple btn-primary" onclick="resetProfile()">Reset Profilo</button>
            <button class="btn-apple" onclick="promptChangePin()">Cambia PIN</button>
            <button class="btn-apple" onclick="exportProfile()">Esporta Profilo</button>
            <input type="file" id="importProfileFile" style="display:none" onchange="importProfile(this.files[0])">
            <button class="btn-apple" onclick="document.getElementById('importProfileFile').click()">Importa Profilo</button>
        </div>`;

    document.getElementById('content-area').innerHTML = html;
}

// FUNZIONI PROFILO
function resetProfile() {
    if(confirm("Sei sicuro di resettare il profilo?")) {
        localStorage.removeItem('devUserId');
        localStorage.removeItem('devProgress');
        localStorage.removeItem('devHistory');
        state.userId = null;
        state.progress = {};
        state.history = {};
        alert("Profilo resettato!");
        renderLogin();
    }
}

function promptChangePin() {
    let newPin = prompt("Inserisci il nuovo PIN (4 cifre, non 3473)");
    if(newPin && newPin.length===4 && newPin !== "3473") {
        state.userId = newPin;
        localStorage.setItem('devUserId', newPin);
        alert("PIN aggiornato!");
    } else if(newPin === "3473") alert("Non puoi usare il PIN CEO");
    else alert("PIN non valido");
}

function exportProfile() {
    const userData = {
        userId: state.userId,
        progress: state.progress,
        history: state.history
    };
    const blob = new Blob([JSON.stringify(userData)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profilo_${state.userId}.json`;
    a.click();
}

function importProfile(file) {
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        state.userId = data.userId;
        state.progress = data.progress || {};
        state.history = data.history || {};
        localStorage.setItem('devUserId', state.userId);
        localStorage.setItem('devProgress', JSON.stringify(state.progress));
        localStorage.setItem('devHistory', JSON.stringify(state.history));
        alert("Profilo importato!");
        renderProfile();
    };
    reader.readAsText(file);
}

// ----- PIN CEO -----
function grantCeoAccess() {
    state.mode = 'ceo';
    alert("Accesso CEO attivato! Visualizzi tutti i profili.");
    // qui puoi aggiungere funzionalità per mostrare dati di tutti gli utenti
}

// ------------------
// Le funzioni esistenti showLevels, startStep, renderQ, check, next, renderL5, runL5 rimangono invariate
// ------------------

function updateNav(s,t){ document.getElementById('back-nav').innerHTML = s?`<div class="back-link" onclick="${t}">〈 Indietro</div>`:""; }
