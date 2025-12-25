const firebaseConfig = {
  apiKey: "AIzaSyDw0pvrsSoMYjs3mQOp5rfpehMe-b5VgcU",
  authDomain: "quizmaster-d9834.firebaseapp.com",
  projectId: "quizmaster-d9834",
  storageBucket: "quizmaster-d9834.firebasestorage.app",
  messagingSenderId: "69039384064",
  appId: "1:69039384064:web:deb448021ef5ac66031ae5"
};

// Inizializzazione Firebase (Assicurati di aver caricato gli script SDK nell'HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Database globale degli utenti (caricato da memoria locale)
let dbUsers = JSON.parse(localStorage.getItem('quiz_master-db')) || {};
   
   /* ============================================================
   TRUE APPLE ALERT SYSTEM (Glassmorphism Edition)
   ============================================================ */
window.alert = function(message) {
    const existing = document.getElementById('apple-alert-overlay');
    if (existing) existing.remove();

            const overlay = document.createElement('div');
        overlay.id = 'apple-alert-overlay';
        overlay.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.3); 
            backdrop-filter: blur(8px); 
            -webkit-backdrop-filter: blur(8px); /* Forza la sfocatura su iOS e Browser Mobile */
            display: flex; align-items: center; justify-content: center; z-index: 1000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica;
        `;


    // Rileviamo se siamo in Dark Mode per adattare il popup
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)';
    const textColor = isDark ? '#ffffff' : '#000000';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    overlay.innerHTML = `
        <div style="background: ${bgColor}; width: 270px; border-radius: 18px; 
                    box-shadow: 0 15px 35px rgba(0,0,0,0.3); overflow: hidden; 
                    border: 1px solid ${borderColor}; animation: appleBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="padding: 24px 20px; text-align: center;">
                <div style="font-size: 17px; font-weight: 600; color: ${textColor}; line-height: 1.3;">
                    ${message}
                </div>
            </div>
            <button onclick="document.getElementById('apple-alert-overlay').remove()" 
                    style="width: 100%; padding: 14px; border: none; background: transparent;
                           border-top: 1px solid ${borderColor}; color: #007aff; 
                           font-size: 17px; font-weight: 600; cursor: pointer;
                           -webkit-tap-highlight-color: transparent;">
                OK
            </button>
        </div>
        <style>
            @keyframes appleBounce {
                0% { opacity: 0; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }
        </style>
    `;
    document.body.appendChild(overlay);
};



let state = {
    mode: null,      
    currentPin: null, 
    currentUser: null, 
    progress: {},    
    history: {},
    ripasso: { wrong: [], notStudied: [] }, // Aggiungi questa
    activeProgress: {}                      // Aggiungi questa
};


let session = null;
let globalClassifica = []; // Conterrà i dati presi da Firebase

const ADMIN_PIN = "3473";
const TESTER_PIN = "1111"; 

// Definiamo l'oggetto tester COMPLETO (così non crasha il profilo)
const testerUser = {
    name: "Tester Pro",
    progress: {},      // Vuoto per testare da zero
    history: {},       // Necessario per il profilo
    activeProgress: {}, // Necessario per il profilo
    ripasso: {         // Necessario per la pagina Ripasso
        wrong: [], 
        notStudied: [] 
    },
    isTester: true     // Il nostro "marchio" per sbloccare i livelli
};

// Ora lo iniettiamo nel database se non esiste
if (!dbUsers[TESTER_PIN]) {
    dbUsers[TESTER_PIN] = testerUser;
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}


window.onload = async () => {
    initTheme();
    const savedPin = localStorage.getItem('sessionPin');
    
    // Se non c'è un PIN salvato, vai subito al login
    if (!savedPin) {
        renderLogin();
        return;
    }

    try {
        // 1. CHIAMATA AL CLOUD: Cerchiamo l'utente su Firebase
        const doc = await db.collection("utenti").doc(savedPin).get();

        if (doc.exists) {
            const cloudUser = doc.data();

            // Se l'account è segnato come eliminato nel cloud, fermati
            if (cloudUser.deleted) {
                localStorage.removeItem('sessionPin');
                renderLogin();
                return;
            }

            // 2. SINCRONIZZAZIONE: Aggiorniamo dbUsers locale con i dati freschi dal cloud
            dbUsers[savedPin] = cloudUser;
            
            state.currentPin = savedPin;
            state.currentUser = cloudUser.name;
            
            if (savedPin === ADMIN_PIN) {
                state.mode = 'admin';
            } else {
                state.mode = 'user';
                state.progress = cloudUser.progress || {};
                state.history = cloudUser.history || {};
                state.ripasso = cloudUser.ripasso || { wrong: [], notStudied: [] };
                state.activeProgress = cloudUser.activeProgress || {};
            }
            
            // 3. RIPRISTINO POSIZIONE (tua logica originale)
            const lastSection = localStorage.getItem('currentSection');
            const lastLang = localStorage.getItem('currentLang');

            if (lastSection === 'profile') {
                renderProfile();
            } else if (lastSection === 'ripasso') {
                renderRipasso();
            } else if (lastSection === 'levels' && lastLang) {
                showLevels(lastLang);
            } else if (lastSection === 'admin') {
                renderAdminPanel();
            } else if (lastSection === 'classifica') {
                renderGlobalClassifica();
            } else {
                showHome();
            }
        } else {
            // Se il PIN è nel localStorage ma non esiste su Firebase (es. database resettato)
            localStorage.removeItem('sessionPin');
            renderLogin();
        }
    } catch (error) {
        console.error("Errore critico durante il caricamento cloud:", error);
        // In caso di errore di rete, proviamo comunque a caricare dai dati locali come backup
        if (dbUsers[savedPin]) {
            state.currentPin = savedPin;
            showHome();
        } else {
            renderLogin();
        }
    }
};


function initTheme() {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const icon = document.getElementById('theme-icon');
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    
    // Cambia l'attributo per il CSS
    document.documentElement.setAttribute('data-theme', target);
    // Salva la preferenza
    localStorage.setItem('theme', target);

    // Cambia l'icona visivamente
    if (target === 'light') {
        // Icona SOLE
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
    } else {
        // Icona LUNA (quella che avevi nel file HTML)
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
}

function updateNav(showBack, backTarget) {
    const b = document.getElementById('back-nav');
    const r = document.getElementById('right-nav');
    b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">\u2039 Indietro</span>` : "";
    r.innerHTML = state.mode ? `<span class="logout-link" onclick="logout()">Esci</span>` : "";
}

async function saveMasterDB() {
    // 1. Prepariamo l'oggetto utente con i dati più recenti
    if (state.mode === 'user' && state.currentPin && dbUsers[state.currentPin]) {
        dbUsers[state.currentPin].progress = state.progress || {};
        dbUsers[state.currentPin].history = state.history || {};
        dbUsers[state.currentPin].ripasso = state.ripasso || { wrong: [], notStudied: [] };
        dbUsers[state.currentPin].activeProgress = state.activeProgress || {};
        
        // --- SALVATAGGIO SU GOOGLE (CLOUDFLARE) ---
        try {
            // Usiamo 'set' con 'merge: true' per non sovrascrivere accidentalmente tutto il profilo
            await db.collection("utenti").doc(state.currentPin).set(dbUsers[state.currentPin], { merge: true });
            console.log("Sincronizzazione Cloud completata per:", state.currentPin);
            
            // Aggiorniamo anche la classifica globale ogni volta che salviamo i progressi
            await updateGlobalClassificaData();
        } catch (error) {
            console.error("Errore durante il salvataggio Cloud:", error);
        }
    }
    
    // 2. Salvataggio locale (Backup immediato sul dispositivo)
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// Funzione di supporto per la classifica (da aggiungere in fondo allo script)
async function updateGlobalLeaderboard() {
    if (state.mode !== 'user' || !state.currentPin) return;
    
    const u = dbUsers[state.currentPin];
    let pts = 0;
    let perfects = 0;

    // Calcolo punti dai progressi salvati
    Object.values(u.progress || {}).forEach(levelReached => {
        pts += (levelReached * 100); // Esempio: 100 punti per ogni livello completato
    });

    try {
        await db.collection("classifica").doc(state.currentPin).set({
            name: u.name,
            points: pts,
            perfect: perfects,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Errore aggiornamento classifica:", e);
    }
}


// Nuova funzione di supporto (da mettere in fondo al file)
async function syncToFirebase(pin, userData) {
    if (!db || pin === "1111") return; // Non sincronizzare il tester
    
    // Calcoliamo i punti per la classifica
    let pts = 0;
    let perfetti = 0;
    Object.values(userData.history || {}).forEach(lang => {
        const correctInLang = lang.filter(h => h.ok).length;
        pts += (correctInLang * 10);
        // Se un livello ha 15 corrette, è perfetto
        if (correctInLang % 15 === 0 && correctInLang > 0) perfetti++;
    });

    try {
        await db.collection("classifica").doc(pin).set({
            name: userData.name,
            points: pts,
            perfect: perfetti,
            lastUpdate: new Date().getTime()
        }, { merge: true });
    } catch (e) { console.error("Errore cloud:", e); }
}


function renderLogin() {
    state.mode = null;
    updateNav(false);
    document.getElementById('app-title').innerText = "QUIZ";
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:10px; width:100%; align-items:center">
            <button class="btn-apple btn-primary" onclick="uiPin('login')">Accedi con PIN</button>
            <button class="btn-apple" onclick="uiPin('register')">Nuovo Utente</button>
            <button class="btn-apple" style="background:none; color:var(--accent); text-align:center" onclick="setGuest()">Entra come Guest</button>
        </div>`;
}

function uiPin(type) {
    updateNav(true, "renderLogin()");
    let title = type === 'login' ? 'Bentornato' : 'Crea Profilo';
    
    // Campo nome: lo mostriamo solo se stiamo registrando
    // NOTA: ID cambiato in "reg-name" per farlo leggere a registerUser()
    let nameField = type === 'register' ? 
        `<input type="text" id="reg-name" class="btn-apple" placeholder="Il tuo Nome" style="text-align:center; margin-bottom:10px">` : '';

    // Decidiamo quale funzione chiamare al clic
    let action = type === 'register' ? 'registerUser()' : "validatePin('login')";

    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <h3 style="margin-bottom:20px">${title}</h3>
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin-bottom:10px; display:none; padding:0 20px"></div>
            
            ${nameField}
            
            <input type="password" id="reg-pin" class="btn-apple" 
                   style="text-align:center; font-size:24px; letter-spacing:8px" 
                   maxlength="4" inputmode="numeric" placeholder="PIN">
            
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="${action}">
                Conferma
            </button>
        </div>`;
}


function isWeakPin(pin) {
    // tutti uguali
    if (/^(\d)\1{3}$/.test(pin)) return true;

    // sequenza crescente
    const asc = "0123456789";
    if (asc.includes(pin)) return true;

    // sequenza decrescente
    const desc = "9876543210";
    if (desc.includes(pin)) return true;

    return false;
}

async function registerUser() {
    const nameEl = document.getElementById('reg-name');
    const pinEl = document.getElementById('reg-pin');
    const name = nameEl.value.trim();
    const pin = pinEl.value.trim();

    if (name.length < 2 || pin.length < 4) {
        alert("Inserisci un nome di almeno 2 lettere e un PIN di 4 cifre.");
        return;
    }

    try {
        // Controllo se il PIN esiste già su Firebase prima di procedere
        const check = await db.collection("utenti").doc(pin).get();
        if (check.exists) {
            alert("Questo PIN è già registrato da un altro utente.");
            return;
        }

        const newUser = {
            userId: Date.now(),
            name: name,
            pin: pin,
            progress: {},
            history: {},
            activeProgress: {},
            ripasso: { wrong: [], notStudied: [] },
            created: new Date().toISOString()
        };

        // Salva su Cloud
        await db.collection("utenti").doc(pin).set(newUser);
        
        // Aggiorna database locale
        dbUsers[pin] = newUser;
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));

        alert("Registrazione completata! Ora effettua l'accesso.");
        closeModal();
        
        // Inserisce automaticamente il pin per comodità
        // Verso la fine di registerUser
        const finalPinInput = document.getElementById('pin-input');
        if (finalPinInput) finalPinInput.value = pin;


    } catch (error) {
        console.error("Errore registrazione:", error);
        alert("Impossibile connettersi al database. Assicurati di aver pubblicato le 'Rules' su Firebase.");
    }
}

async function validatePin(type) {
    // Usiamo l'ID corretto che hai definito in uiPin
    const pinField = document.getElementById('reg-pin'); 
    const pin = pinField ? pinField.value.trim() : "";
    const errorEl = document.getElementById('pin-error');
    
    // ... resto della funzione uguale

    
    if (errorEl) errorEl.style.display = "none";

    if (pin.length !== 4) {
        if (errorEl) { errorEl.innerText = "Il PIN deve essere di 4 cifre"; errorEl.style.display = "block"; }
        return;
    }

    // 1. ACCESSO ADMIN (Locale + Cloud Sync)
    if (pin === ADMIN_PIN) {
        state.mode = 'admin';
        state.currentUser = "Creatore";
        state.currentPin = pin; 
        localStorage.setItem('sessionPin', pin);
        // Proviamo a recuperare dati admin dal cloud se esistono
        const adminDoc = await db.collection("utenti").doc(pin).get();
        if (adminDoc.exists) dbUsers[pin] = adminDoc.data();
        showHome();
        return;
    }

    // 2. ACCESSO TESTER
    if (pin === TESTER_PIN) {
        state.currentPin = pin;
        state.currentUser = testerUser.name;
        state.mode = 'user';
        state.progress = testerUser.progress;
        state.history = testerUser.history;
        localStorage.setItem('sessionPin', pin);
        showHome();
        return;
    }

    // --- CONTROLLO CLOUD PRIMA DI PROCEDERE ---
    // Verifichiamo subito se questo PIN esiste già su Google
    const userDoc = await db.collection("utenti").doc(pin).get();
    const cloudUser = userDoc.exists ? userDoc.data() : null;

    if (type === 'register') {
        const nameInput = document.getElementById('name-field');
        const name = nameInput ? nameInput.value.trim() : "";

        if (!name) {
            errorEl.innerText = "Inserisci il tuo nome";
            errorEl.style.display = "block";
            return;
        }

        // Se il PIN esiste su Google (anche se non è su questo telefono)
        if (cloudUser) {
            errorEl.innerText = "PIN non disponibile (già in uso)";
            errorEl.style.display = "block";
            return;
        }

        if (isWeakPin(pin)) {
            errorEl.innerText = "PIN troppo semplice";
            errorEl.style.display = "block";
            return;
        }

        // Creazione nuovo oggetto utente
        dbUsers[pin] = {
            name: name,
            userId: Date.now().toString().slice(-4), // ID univoco basato sul tempo
            progress: {},
            history: {},
            activeProgress: {},
            savedQuizzes: {},
            ripasso: { wrong: [], notStudied: [] },
            createdAt: new Date().toISOString()
        };

    } else {
        // --- LOGIN ---
        if (!cloudUser) {
            errorEl.innerText = "PIN errato o utente inesistente";
            errorEl.style.display = "block";
            return;
        }

        if (cloudUser.deleted) {
            errorEl.innerText = "Questo account è stato disattivato";
            errorEl.style.display = "block";
            return;
        }

        // Sincronizziamo il database locale con quello che abbiamo appena scaricato
        dbUsers[pin] = cloudUser;
    }

    // Configurazione Stato Finale
    state.currentPin = pin;
    state.currentUser = dbUsers[pin].name;
    state.mode = 'user';
    state.progress = dbUsers[pin].progress || {};
    state.history = dbUsers[pin].history || {};
    state.ripasso = dbUsers[pin].ripasso || { wrong: [], notStudied: [] };
    state.activeProgress = dbUsers[pin].activeProgress || {};

    localStorage.setItem('sessionPin', pin);

    // Salvataggio immediato (ora saveMasterDB manderà tutto al Cloud)
    await saveMasterDB();
    showHome();
}




function setGuest() { 
    state.mode = 'guest'; state.progress = {}; state.history = {}; showHome(); 
}

function showHome() {
    localStorage.setItem('currentSection', 'home');
    updateNav(false);
    document.getElementById('app-title').innerText = "PERCORSI";
    let html = `<div class="lang-grid">`;

    // 1. Linguaggi standard
    Object.keys(domandaRepo).forEach(l => {
        const icon = (l === 'HTML') ? 'html5' : l.toLowerCase();
        html += `<div class="lang-item" onclick="showLevels('${l}')">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg" width="35" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1005/1005141.png'">
            <div style="margin-top:10px; font-weight:700; font-size:13px">${l}</div>
        </div>`;
    });

    // 2. Sezione Utente (Profilo, Ripasso e Classifica)
    if(state.mode === 'user') {
        html += `
        <div class="lang-item" onclick="renderRipasso()">
            <img src="https://cdn-icons-png.flaticon.com/512/3389/3389081.png" width="35">
            <div style="margin-top:10px; font-weight:700; font-size:13px">RIPASSO</div>
        </div>
        
        <div class="lang-item" onclick="renderGlobalClassifica()" style="background: #ff9500; color: white;">
            <img src="https://cdn-icons-png.flaticon.com/512/2817/2817958.png" width="35" style="filter: brightness(0) invert(1)">
            <div style="margin-top:10px; font-weight:700; font-size:13px">CLASSIFICA</div>
        </div>

        <div class="lang-item profile-slot" onclick="renderProfile()" style="background: #0a84ff; color: white;">
            <div style="font-weight:700; font-size:13px">IL MIO PROFILO</div>
        </div>`;
    }

    // 3. Sezione Admin
    if(state.mode === 'admin') {
        html += `
        <div class="lang-item profile-slot" onclick="renderAdminPanel()" style="background: #32d74b; color: white;">
            <div style="font-weight:700; font-size:13px">PANNELLO ADMIN</div>
        </div>`;
    }

    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}


function showLevels(lang) {
    localStorage.setItem('currentSection', 'levels');
    localStorage.setItem('currentLang', lang);

    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = lang;

    let html = "";
    const comp = state.progress[lang] || 0;

    for (let i = 1; i <= 5; i++) {

        let label = (i === 5) ? "TEST OPERATIVO" : "Livello " + i;
        let isLocked = false;

        // LOGICA UTENTE
        if (state.mode === 'user') {
            // Se è l'utente normale E il livello è >= 4 E non ha finito il 3 -> Blocca
            // MA se il PIN è 1111, non entrare mai in questo IF (quindi resta isLocked = false)
            if (i >= 4 && comp < 3 && state.currentPin !== "1111") {
                isLocked = true;
            }
        }

        // ADMIN e GUEST sempre sbloccati
        if (state.mode === 'admin' || state.mode === 'guest') {
            isLocked = false;
        }

        let currentIdx = 0;
        if (state.mode === 'user' && dbUsers[state.currentPin]?.activeProgress) {
            currentIdx = dbUsers[state.currentPin].activeProgress[`${lang}_${i}`] || 0;
        }

        if (comp >= i) currentIdx = 15;
        const percentage = (currentIdx / 15) * 100;

        html += `
            <button class="btn-apple"
                ${isLocked ? 'disabled' : ''}
                onclick="startStep('${lang}', ${i})"
                style="display:block; text-align:left; padding:15px">

                <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                    <span>${label} ${isLocked ? '🔒' : ''}</span>
                    ${(state.mode === 'user' && !isLocked)
                        ? `<span style="font-size:12px; opacity:0.6">${currentIdx}/15</span>`
                        : ''}
                </div>

                ${(state.mode === 'user' && !isLocked)
                    ? `<div class="progress-container">
                           <div class="progress-bar-fill" style="width:${percentage}%"></div>
                       </div>`
                    : ''}
            </button>`;
    }

    document.getElementById('content-area').innerHTML = html;
}

function startStep(lang, lvl) {
    // Mostra sempre tasto esci
    updateNav(true, "showLevels('" + lang + "')");

    // Controllo livello 5 utente
    if(lvl === 5 && state.mode === 'user' && (state.progress[lang] || 0) < 3 && state.currentPin !== "1111") return;
    if(lvl === 5) { renderL5(lang); return; }
    
    const key = "L" + lvl;
    const stringhe = domandaRepo[lang][key];
    const storageKey = `${lang}_${lvl}`;

    let selezione;
    if (state.mode === 'user' && dbUsers[state.currentPin].savedQuizzes?.[storageKey]) {
        selezione = dbUsers[state.currentPin].savedQuizzes[storageKey];
    } else {
        const rimescolate = [...stringhe].sort(() => 0.5 - Math.random());
        selezione = rimescolate.slice(0, 15).map(r => {
            const p = r.split("|");
            return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
        });
        if (state.mode === 'user') {
            if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};
            dbUsers[state.currentPin].savedQuizzes[storageKey] = selezione;
        }
    }

    let savedIdx = 0;
    if (state.mode === 'user') {
        savedIdx = dbUsers[state.currentPin].activeProgress?.[storageKey] || 0;
    }

    session = { lang: lang, lvl: lvl, q: selezione, idx: savedIdx };
    saveMasterDB();
    renderQ();
}

function updateEditor(text) {
    let resultElement = document.getElementById("highlighting-content");
    // Protezione per i caratteri HTML e aggiunta spazio finale per il cursore a fine riga
    resultElement.textContent = text + (text.endsWith("\n") ? " " : "");
    // Chiamata alla libreria Prism per colorare il testo
    Prism.highlightElement(resultElement);
}

function syncScroll(el) {
    let resultElement = document.getElementById("highlighting");
    resultElement.scrollTop = el.scrollTop;
    resultElement.scrollLeft = el.scrollLeft;
}

function handleTab(e, el) {
    if (e.key === "Tab") {
        e.preventDefault();
        let start = el.selectionStart;
        let end = el.selectionEnd;
        // Inserisce 4 spazi invece di cambiare focus
        el.value = el.value.substring(0, start) + "    " + el.value.substring(end);
        el.selectionStart = el.selectionEnd = start + 4;
        updateEditor(el.value);
    }
}

function renderL5(lang, index = null) {
    // Se non specifichiamo l'indice, proviamo a caricarlo dal DB
    if (index === null && state.mode === 'user') {
        const storageKey = `${lang}_5`;
        index = dbUsers[state.currentPin]?.activeProgress?.[storageKey] || 0;
    } else if (index === null) {
        index = 0; // Per Guest/Admin se non c'è indice parte da 0
    }
    
    updateNav(true, `showLevels('${lang}')`);
    const container = document.getElementById('content-area');
    const sfide = challenges5[lang];

    if (!sfide || index >= sfide.length) {
        // Se finisce le sfide, mostra schermata finale
        container.innerHTML = `
            <div class="glass-card" style="text-align:center; padding:40px;">
                <h2 style="color:#34c759">🏆 Esame Completato!</h2>
                <p>Hai superato tutte le sfide di programmazione per ${lang}.</p>
                <button class="btn-apple" onclick="showLevels('${lang}')" style="margin-top:20px">Torna ai Livelli</button>
            </div>`;
        return;
    }

    const sfida = sfide[index];
    const percentL5 = (index / sfide.length) * 100;

    container.innerHTML = `
        <div class="glass-card" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
    <h2 style="font-size:18px; margin:0">ESAME ${lang.toUpperCase()}</h2>
    <span style="font-size:12px; opacity:0.7">${index}/${sfide.length}</span>
</div>

<div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:10px; margin-bottom:20px; overflow:hidden">
    <div style="width:${percentL5}%; height:100%; background:#34c759; transition:width 0.3s ease"></div>
</div>

            
            <p style="font-size:15px; margin-bottom:20px; color:#fff;"><b>Sfida:</b> ${sfida.task}</p>
            
            <div style="background:#1e1e1e; border-radius:12px; border:1px solid #333; padding:10px;">
                <textarea id="editing" spellcheck="false" 
                    onkeydown="if(event.key==='Tab'){event.preventDefault();this.setRangeText('    ',this.selectionStart,this.selectionEnd,'end')}"
                    style="width:100%; height:150px; background:transparent; color:#d4d4d4; border:none; font-family:monospace; outline:none; resize:none;"></textarea>
            </div>

            <div id="btn-container" style="margin-top:15px">
                <button id="verify-btn" class="btn-apple" onclick="checkL5('${lang}', ${index})" style="background:var(--accent); color:white; width:100%">Esegui e Verifica</button>
            </div>
            
            <div id="terminal-output" style="display:none; margin-top:20px; background:#000; border-radius:10px; padding:15px; border:1px solid #444;">
                <pre id="code-dest" style="display:none"></pre>
                <pre id="console-res" style="color:#fff; margin:0; font-size:13px; font-family:monospace; white-space:pre-wrap;"></pre>
            </div>
            <div id="fb" style="margin-top:15px; text-align:center"></div>
        </div>
    `;
}



function checkL5(lang, index) {
    const input = document.getElementById('editing');
    const userCode = input.value.trim();
    const terminal = document.getElementById('terminal-output');
    const consoleRes = document.getElementById('console-res');
    const fb = document.getElementById('fb');
    const btnContainer = document.getElementById('btn-container');

    if (!userCode) return;

    const sfida = challenges5[lang][index];
    terminal.style.display = "block";

    // Pulizia per il confronto
    const cleanUser = userCode.replace(/\s+/g, '');
    const cleanLogic = sfida.logic.replace(/\s+/g, '');

    if (cleanUser.includes(cleanLogic)) {
        // --- CASO SUCCESSO ---
        consoleRes.innerText = sfida.output + "\n\n>> Processo terminato con successo (0)";
        consoleRes.style.color = "#34c759";
        fb.innerHTML = `<b style="color:#34c759">✓ Esatto!</b>`;
        // AGGIUNGI QUESTO BLOCCO PER IL SALVATAGGIO PARZIALE
        if (state.mode === 'user') {
            const storageKey = `${lang}_5`;
            if (!dbUsers[state.currentPin].activeProgress) {
                dbUsers[state.currentPin].activeProgress = {};
            }
            // Salviamo che l'utente deve riprendere dalla sfida successiva
            dbUsers[state.currentPin].activeProgress[storageKey] = index + 1;
            
            // Se è l'ultima sfida, allora abbiamo completato il livello 5
            if (index === challenges5[lang].length - 1) {
                state.progress[lang] = 5;
            }
            
            saveMasterDB(); 
        }
        // ... resto del codice (tasto per andare avanti) ...
        // Aggiorna statistiche e progressi
        if (state.mode === 'user') {
            if (index === challenges5[lang].length - 1) {
                state.progress[lang] = 5;
            }
            const u = dbUsers[state.currentPin];
            if (u && u.history) {
                if (!u.history[lang]) u.history[lang] = [];
                u.history[lang].push({ 
                    lvl: 5, 
                    task: sfida.task, 
                    ok: true, 
                    date: new Date().toLocaleDateString() 
                });
            }
            saveMasterDB();
        }

        // Tasto per andare avanti
        btnContainer.innerHTML = `
            <button class="btn-apple" onclick="renderL5('${lang}', ${index + 1})" style="background:#34c759; color:white; width:100%; font-weight:bold">
                Prossima Sfida (${index + 2}/${challenges5[lang].length}) →
            </button>`;

    } else {
        // --- CASO ERRORE (Specifico per linguaggio) ---
        let errorMsg = "";
        const codeSnippet = userCode.substring(0, 15) + "...";

        switch(lang.toLowerCase()) {
            case 'python':
                errorMsg = `Traceback (most recent call last):\n  File "script.py", line 1\n    ${userCode}\nSyntaxError: logic mismatch or missing '${sfida.logic}'`;
                break;
            case 'javascript':
                errorMsg = `Uncaught SyntaxError: Unexpected logic structure\n    at eval (native)\n    at checkL5 (challenge.js:58:12)\n    Dato atteso: ${sfida.logic}`;
                break;
            case 'java':
                errorMsg = `Exception in thread "main" java.lang.RuntimeException: Compilation Error\n    at compiler.JavaCompiler.check(Native Method)\n    at Exam.main(Exam.java:2)`;
                break;
            case 'mysql':
                errorMsg = `ERROR 1064 (42000): You have an error in your SQL syntax;\ncheck the manual for the right syntax near '${codeSnippet}'`;
                break;
            case 'html':
                errorMsg = `[HTML Validator]: Warning - Tag structure mismatch.\nExpected element: <${sfida.logic}>\nStatus: Element not found or improperly closed.`;
                break;
            default:
                errorMsg = "Error: Logic mismatch. The code does not satisfy the requirements.";
        }

        consoleRes.innerText = errorMsg;
        consoleRes.style.color = "#ff3b30";
        fb.innerHTML = `<span style="color:#ff3b30; font-weight:bold">✗ Errore nel codice. Controlla il terminale.</span>`;
    }
}




function handleInput(el, lang) {
    // Salviamo la posizione del cursore (Selection)
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const offset = range.startOffset;

    // Applichiamo Prism al testo
    Prism.highlightElement(el);

    // Ripristiniamo il cursore (Logica per riposizionamento preciso)
    // Nota: contenteditable perde il focus se non resettiamo correttamente il range
    const newRange = document.createRange();
    newRange.setStart(el.childNodes[0] || el, offset);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
}

function handleSpecialKeys(e) {
    if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertText", false, "    ");
    }
}


function renderQ() {
    updateNav(true, `showLevels('${session.lang}')`);
    const data = session.q[session.idx];
    const progress = (session.idx / session.q.length) * 100;

    const container = document.getElementById('content-area');
    if (!container) return;

    container.innerHTML = `
        <div style="width:100%; margin-bottom:15px">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.5; margin-bottom:5px">
                <span>DOMANDA ${session.idx + 1}/${session.q.length}</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px">
                <div style="width:${progress}%; height:100%; background:var(--accent); border-radius:10px; transition:0.3s"></div>
            </div>
        </div>
        <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
        <div id="opts" style="width:100%">
            ${data.options.map((o, i) => `<button class="btn-apple" onclick="check(${i === data.correct})">${o}</button>`).join('')}
        </div>
        <div id="fb"></div>
        <div style="margin-top:10px; text-align:right">
            <button class="btn-apple btn-info" onclick="markNotStudied(${session.idx})">Non l'ho studiato</button>
        </div>`;
}

function markNotStudied(idx) {
    if (!state.currentPin || !dbUsers[state.currentPin]) return;
    
    const data = session.q[idx];
    const user = dbUsers[state.currentPin];

    // 1. Logica esistente per la sezione Ripasso
    if (!user.ripasso) {
        user.ripasso = { wrong: [], notStudied: [] };
    }
    const giaPresente = user.ripasso.notStudied.some(d => d.q === data.q);
    if (!giaPresente) {
        user.ripasso.notStudied.push({
            q: data.q,
            options: data.options,
            correct: data.correct,
            exp: data.exp
        });
    }

    // 2. NUOVO: Salva nello storico (per colorare la barra di BLU nel profilo)
    if (!state.history[session.lang]) state.history[session.lang] = [];
    state.history[session.lang].push({
        question: data.q,
        isNotStudied: true, // Questo attiva il blu nel renderProfile
        level: session.lvl,  // Indica a quale barra aggiungere il blu
        lvl: session.lvl     // Doppia sicurezza
    });

    // 3. NUOVO: Avanza l'indice del progresso attivo
    if (!user.activeProgress) user.activeProgress = {};
    user.activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;

    // 4. Salva tutto nel DB
    if (typeof saveMasterDB === 'function') saveMasterDB();
    
    // 5. NUOVO: Passa subito alla prossima domanda
    next();
}

function check(isOk) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({
            question: data.q,
            correctAnswer: data.options[data.correct],
            ok: isOk,
            exp: data.exp,
            level: session.lvl // <--- AGGIUNGI QUESTA RIGA
        });
        
        if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
        dbUsers[state.currentPin].activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;
        saveMasterDB();
    }
    if (!isOk && state.mode === 'user') {
    if (!dbUsers[state.currentPin].ripasso) dbUsers[state.currentPin].ripasso = { wrong: [], notStudied: [] };
    if (!dbUsers[state.currentPin].ripasso.wrong.some(d => d.q === data.q)) {
        dbUsers[state.currentPin].ripasso.wrong.push({
            q: data.q,
            options: data.options,
            correct: data.correct,
            exp: data.exp
        });
    }
}
        document.getElementById('opts').style.pointerEvents = "none";
    document.getElementById('fb').innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}" style="width:100%; margin: 15px 0; padding: 15px; box-sizing: border-box; border-radius: 14px;">
            <strong style="display: block; margin-bottom: 8px;">${isOk?'Giusto!':'Sbagliato'}</strong>
            <p style="margin-bottom: 15px; font-size: 14px; line-height: 1.4;">${data.exp}</p>
            <button class="btn-apple btn-primary" style="width:100%; margin:0;" onclick="next()">Continua</button>
        </div>`;
}


function next() {
    session.idx++; 
    if(session.idx < session.q.length) {
        renderQ(); 
    } else { 
        if (state.mode === 'user') {
            state.progress[session.lang] = Math.max(state.progress[session.lang]||0, session.lvl); 
            const sk = `${session.lang}_${session.lvl}`;
            dbUsers[state.currentPin].activeProgress[sk] = 0;
            delete dbUsers[state.currentPin].savedQuizzes[sk];
            saveMasterDB();
        }
        showLevels(session.lang); 
    }
}

function logout() {
    localStorage.removeItem('currentSection'); 
    localStorage.removeItem('currentLang');
    // 1. Rimuove il PIN dalla memoria per evitare il login automatico al refresh
    localStorage.removeItem('sessionPin');
    
    // 2. Reset totale dello stato dell'app
    state.mode = null; 
    state.currentPin = null; 
    state.currentUser = null; // Aggiungi questa riga
    session = null; 
    
    // 3. Torna alla schermata di login
    renderLogin();
}

/* =========================
   PROFILO UTENTE
   ========================= */

function ensureUserId() {
    if (state.mode !== 'user' || !state.currentPin) return;
    const u = dbUsers[state.currentPin];
    if (!u) return;

    if (!u.userId) {
        // Estraiamo tutti gli ID esistenti in modo sicuro
        const allUsers = Object.values(dbUsers);
        const ids = allUsers
            .map(x => x.userId)
            .filter(id => id !== undefined && id !== null);
        
        // Se non ci sono ID, partiamo da 1000 (più professionale), altrimenti Max + 1
        u.userId = ids.length ? Math.max(...ids) + 1 : 1000;
        
        console.log(`Assegnato nuovo ID: ${u.userId} all'utente ${u.name}`);
        saveMasterDB();
    }
}

function calcStats() {
    let tot = 0;
    let ok = 0;
    Object.values(state.history || {}).forEach(arr => {
        arr.forEach(h => {
            tot++;
            if (h.ok) ok++;
        });
    });
    return {
        total: tot,
        correct: ok,
        wrong: tot - ok,
        perc: tot ? Math.round((ok / tot) * 100) : 0
    };
}

function toggleSecurity(el) {
    const content = el.nextElementSibling; // il div .security-content
    if (!content) return;
    content.style.display = content.style.display === 'none' ? 'flex' : 'none';
}

function renderProfile() {
    localStorage.setItem('currentSection', 'profile');
    if (!state.currentPin || !dbUsers[state.currentPin]) return;

    ensureUserId();
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "IL MIO PROFILO";

    const u = dbUsers[state.currentPin];
    const stats = calcStats();
    const totalLevels = Object.keys(domandaRepo);

    const percentTotal = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentTotal / 100) * circumference;

    const isDark = document.body.classList.contains('dark-mode');
    const appleGray = isDark ? '#2c2c2e' : '#e5e5ea';


const noScrollStyle = `
<style>
#profile-scroll {
    height: 100%;
    width: 100%;
    overflow: hidden; 
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
}
.profile-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 100vh;
    align-items: center;
    padding: 10px 0;
}
.scrollable-content {
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.scrollable-content::-webkit-scrollbar { display: none; }

#profile-scroll .glass-card {
    /* Cambiato da var(--card-bg) a quello dei percorsi */
    background: rgba(120, 120, 128, 0.08) !important; 
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    
    /* Tolto l'ombra */
    box-shadow: none !important; 
    
    /* Bordi uguali ai percorsi */
    border: 1px solid var(--border) !important;
    border-radius: 20px; 
    
    padding: 25px;
    width: 100%; 
    max-width: none; 
    margin: 8px 0; 
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    flex-shrink: 0;
}

input, select, textarea { font-size: 16px !important; }
</style>
`;

    
    let progHtml = '';
    const totalQuestionsPerLevel = 15; 
    
    // Variabile per contare i "Non studiati" totali per la barra superiore
    let totalMarkedNotStudied = 0;

    totalLevels.forEach(lang => {
        progHtml += `<div style="margin-bottom:15px"><h4>${lang}</h4>`;
        for (let i = 1; i <= 5; i++) {
            let correct = 0, wrong = 0, markedNotStudied = 0;
            
            if (u.history && u.history[lang]) {
                u.history[lang].forEach(h => {
                    if (Number(h.lvl || h.level) == i) { 
                        if (h.isNotStudied) {
                            markedNotStudied++;
                            totalMarkedNotStudied++; // Accumulo per la card generale
                        }
                        else if (h.ok) correct++;
                        else wrong++;
                    }
                });
            }

            const wGreen = (correct / totalQuestionsPerLevel) * 100;
            const wRed   = (wrong / totalQuestionsPerLevel) * 100;
            const wBlue  = (markedNotStudied / totalQuestionsPerLevel) * 100;
            const percent = Math.round((correct / totalQuestionsPerLevel) * 100);

            progHtml += `
            <div style="margin-bottom:10px">
                <div style="font-size:13px">Livello ${i}</div>
                <div style="height:10px; border-radius:6px; overflow:hidden; display:flex; background:${appleGray}; width:100%">
                    ${wGreen > 0 ? `<div style="width:${wGreen}%; background:#34c759; height:100%"></div>` : ''}
                    ${wRed > 0 ? `<div style="width:${wRed}%; background:#ff3b30; height:100%"></div>` : ''}
                    ${wBlue > 0 ? `<div style="width:${wBlue}%; background:#0a84ff; height:100%"></div>` : ''}
                </div>
                <div style="font-size:11px; text-align:right; margin-top:2px; opacity:0.8">${percent}% progresso</div>
            </div>`;
        }
        progHtml += `</div>`;
    });

    // Calcolo del potenziale totale (es. 15 domande * 5 livelli * numero lingue)
    const totalPotential = totalLevels.length * 5 * 15;

    document.getElementById('content-area').innerHTML = noScrollStyle + `
<div id="profile-scroll">
    <div class="profile-container">
        <div class="glass-card">
            <div><strong>Nome:</strong> ${u.name}</div>
            <div><strong>ID Utente:</strong> ${u.userId}</div>
        </div>

        <div class="glass-card">
            <strong>Statistiche</strong>
            <div style="margin-top:15px; display:flex; gap:20px; align-items:center">
                <div style="position:relative; width:80px; height:80px">
                    <svg width="80" height="80" style="transform:rotate(-90deg)">
                        <circle cx="40" cy="40" r="${radius}" stroke="${appleGray}" stroke-width="6" fill="none"/>
                        <circle cx="40" cy="40" r="${radius}" stroke="#34c759" stroke-width="6" fill="none"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">${percentTotal}%</div>
                </div>
                <div style="flex:1; display:flex; flex-direction:column; gap:8px">
                    <div>
                        <div style="font-size:12px">Corrette: ${stats.correct}</div>
                        <div style="height:8px; background:${appleGray}; border-radius:6px">
                            <div style="width:${(stats.correct / totalPotential) * 100}%; height:100%; background:#34c759; border-radius:6px"></div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:12px">Non studiate: ${totalMarkedNotStudied}</div>
                        <div style="height:8px; background:${appleGray}; border-radius:6px">
                            <div style="width:${(totalMarkedNotStudied / totalPotential) * 100}%; height:100%; background:#0a84ff; border-radius:6px"></div>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:12px">Sbagliate: ${stats.wrong}</div>
                        <div style="height:8px; background:${appleGray}; border-radius:6px">
                            <div style="width:${(stats.wrong / totalPotential) * 100}%; height:100%; background:#ff3b30; border-radius:6px"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      <div class="glass-card" id="card-prog" onclick="toggleGeneralProgress(this)" style="cursor:pointer">
    <div style="font-weight:600">Progressi generali</div>
    <div id="detailed-progress" style="display:none; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">
        <div class="scrollable-content">
            ${progHtml}
        </div>
    </div>
</div>


        <div class="glass-card" id="card-sec" onclick="toggleGeneralContent('security-content', this)" style="cursor:pointer">
            <strong>Sicurezza</strong>
            <div id="security-content" style="display:none; flex-direction:column; gap:8px; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">
                <button class="btn-apple" onclick="userChangePin()">Cambia PIN</button>
                <button class="btn-apple" onclick="resetStats()">Azzera statistiche</button>
                <button class="btn-apple btn-destruct" onclick="userDeleteAccount()">Elimina account</button>
            </div>
        </div>

        <div class="glass-card" id="card-hist" onclick="toggleGeneralContent('history-content', this)" style="cursor:pointer">
    <strong>Storico</strong>
    <div id="history-content" style="display:none; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">
        <div class="scrollable-content">
            ${generateHistoryHTML(u)}
        </div>
    </div>
</div>`;
}


// FINESTRE DI APERTURA (Versioni Window)
window.toggleGeneralProgress = function(card) {
    const detailed = document.getElementById('detailed-progress');
    const isHidden = detailed.style.display === 'none';
    detailed.style.display = isHidden ? 'block' : 'none';
    if (isHidden) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.toggleGeneralContent = function(id, card) {
    const content = document.getElementById(id);
    const isHidden = content.style.display === 'none';
    document.querySelectorAll('#security-content, #history-content').forEach(c => c.style.display = 'none');
    content.style.display = isHidden ? 'flex' : 'none';
    if (isHidden && card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

   
function toggleHistory(el) {
    const content = el.nextElementSibling;
    if(content.style.display === "none") {
        content.style.display = "block";
        el.querySelector(".chevron").innerText = "˅";
    } else {
        content.style.display = "none";
        el.querySelector(".chevron").innerText = "›";
    }
}

function generateHistoryHTML(u) {
    let html = "";
    Object.keys(u.history || {}).forEach(lang => {
        html += `<div style="margin-bottom:10px"><strong>${lang}</strong></div>`;
        u.history[lang].forEach((h, idx) => {
            const status = h.ok ? "✅" : "❌";
            html += `<div style="font-size:12px; margin-bottom:6px">
                        ${status} Q${idx + 1}: ${h.question}<br>
                        <em style="opacity:0.6">Risposta corretta: ${h.correctAnswer}</em>
                     </div>`;
        });
    });
    return html || "<div style='font-size:12px; opacity:0.6'>Nessuna domanda fatta</div>";
}

// Toggle per linguaggio
function toggleLangDetails(el){
    const content = el.nextElementSibling;
    if(content) content.style.display = content.style.display==='none'?'block':'none';
    const chevron = el.querySelector('.chevron');
    if(chevron) chevron.style.transform = content.style.display==='block'?'rotate(90deg)':'rotate(0deg)';
}

function toggleCard(el) {
    // Cerca il contenuto della card cliccata
    const content = el.querySelector('.card-content, .security-content, #detailed-progress, #ripasso-content');
    if (!content) return;

    // Chiudi tutte le altre card dello stesso tipo
    document.querySelectorAll('.card-content, .security-content, #detailed-progress, #ripasso-content').forEach(c => {
        if (c !== content) c.style.display = 'none';
    });

    // Mostra/nascondi contenuto della card cliccata
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'flex' : 'none';

    // Scroll verso la card se si apre
    if (isHidden) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - 20, behavior: 'smooth' });
    }
}

function renderRipasso() {
    localStorage.setItem('currentSection', 'ripasso');
    if (state.mode !== 'user') return;
    const u = dbUsers[state.currentPin];
    if (!u) return;

    // Integrazione Navigazione Standard del sito
    updateNav(true, 'showHome()');
    document.getElementById('app-title').innerText = "RIPASSO";

    const ripasso = u.ripasso || { wrong: [], notStudied: [] };
    const container = document.getElementById('content-area');

    if (ripasso.wrong.length === 0 && ripasso.notStudied.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; opacity:0.5">
                <div style="font-size:40px">🎉</div>
                <p>Niente da ripassare!</p>
            </div>`;
        return;
    }

    // Funzione interna per generare le card con sfumatura laterale
    const createCard = (d, type) => {
        const borderColor = type === 'wrong' ? '#FF3B30' : '#007AFF';
        const bgColor = type === 'wrong' ? 'rgba(255, 59, 48, 0.05)' : 'rgba(0, 122, 255, 0.05)';
        
        return `
        <div style="background: var(--bg-card, rgba(255,255,255,0.05)); 
                    border-left: 6px solid ${borderColor}; 
                    border-radius: 10px; padding: 15px; margin-bottom: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <div style="font-size: 11px; font-weight: 800; color: ${borderColor}; margin-bottom: 5px; text-transform: uppercase;">
                ${type === 'wrong' ? 'Risposta Errata' : 'Da Studiare'}
            </div>
            
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: var(--text-color);">${d.q}</div>
            
            <div style="margin-bottom: 12px;">
                ${d.options.map((opt, i) => {
                    let style = "padding: 8px; border-radius: 6px; margin-bottom: 4px; font-size: 13px; border: 1px solid rgba(120,120,120,0.2);";
                    if (i === d.correct) {
                        style += "background: rgba(52, 199, 89, 0.2); border-color: #34C759; font-weight: bold;";
                    }
                    return `<div style="${style}">${opt} ${i === d.correct ? '✅' : ''}</div>`;
                }).join('')}
            </div>

            ${d.exp ? `
                <div style="background: ${bgColor}; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; color: var(--text-secondary);">
                    <strong>Spiegazione:</strong> ${d.exp}
                </div>` : ''}
        </div>`;
    };

    let html = `<div style="padding-bottom: 20px;">`;

    if (ripasso.wrong.length) {
        html += `<h3 style="font-size:14px; opacity:0.6; margin: 10px 0;">SBAGLIATE DI RECENTE</h3>`;
        html += ripasso.wrong.map(d => createCard(d, 'wrong')).join('');
    }

    if (ripasso.notStudied.length) {
        html += `<h3 style="font-size:14px; opacity:0.6; margin: 25px 0 10px 0;">DOMANDE "NON STUDIATE"</h3>`;
        html += ripasso.notStudied.map(d => createCard(d, 'notStudied')).join('');
    }

    html += `</div>`;
    container.innerHTML = html;
}
function resetStats() {
    openModal(
        "Azzera statistiche",
        "Perderai progressi e storico. Operazione irreversibile.",
        () => {
            state.progress = {};
            state.history = {};
            dbUsers[state.currentPin].activeProgress = {};
            dbUsers[state.currentPin].savedQuizzes = {};
            saveMasterDB();
            renderProfile();
        }
    );
}

function deleteAccount() {
    openModal(
        "Elimina account",
        "Il tuo profilo verrà rimosso. L'admin manterrà i dati.",
        () => {
            dbUsers[state.currentPin].deleted = true;
            saveMasterDB();
            logout();
        }
    );
}


/* =========================
   LOGICA GUEST (DEMO)
   ========================= */

const GUEST_LIMITS = {
    1: 3,
    2: 2,
    3: 1
};

function guestLimitReached(lvl, idx) {
    return GUEST_LIMITS[lvl] !== undefined && idx >= GUEST_LIMITS[lvl];
}

// Override soft di startStep
const _startStep = startStep;
startStep = function (lang, lvl) {

    if (state.mode === 'guest') {

        if(lvl>=4) {
    showGuestLocked();
    return;
}

        const key = "L" + lvl;
        const all = domandaRepo[lang][key];
        const maxQ = GUEST_LIMITS[lvl];

        const selezione = [...all]
            .sort(() => 0.5 - Math.random())
            .slice(0, maxQ)
            .map(r => {
                const p = r.split("|");
                return { q: p[0], options: [p[1], p[2], p[3]], correct: parseInt(p[4]), exp: p[5] };
            });

        session = { lang, lvl, q: selezione, idx: 0 };
        renderQ();
        return;
    }

    _startStep(lang, lvl);
};

// Override soft di renderQ
const _renderQ = renderQ;
renderQ = function () {

    if (state.mode === 'guest') {

        if (guestLimitReached(session.lvl, session.idx)) {
            showGuestEndModal();
            return;
        }

        updateNav(true, `showLevels('${session.lang}')`);
        const data = session.q[session.idx];

        document.getElementById('content-area').innerHTML = `
            <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
            <div id="opts">
                ${data.options.map((o,i)=>`
                    <button class="btn-apple" onclick="check(${i===data.correct})">${o}</button>
                `).join("")}
            </div>
            <div style="font-size:12px; opacity:0.5; margin-top:10px">
                Demo: ${session.idx + 1}/${session.q.length}
            </div>
            <div id="fb"></div>
        `;
        return;
    }

    _renderQ();
};

// Override soft di next
const _next = next;
next = function () {

    if (state.mode === 'guest') {
        session.idx++;
        renderQ();
        return;
    }

    _next();
};

function showGuestEndModal() {
    openModal(
        "Demo terminata",
        "Registrati per sbloccare tutti i livelli, salvare i progressi e vedere le statistiche.",
        () => {
            closeModal();
            renderLogin();
        }
    );
}

function showGuestLocked() {
    openModal(
        "Accesso bloccato",
        "Registrati per accedere ai livelli avanzati.",
        () => {
            closeModal();
            renderLogin();
        }
    );
}

/* =========================
   PANNELLO ADMIN
   ========================= */

async function renderAdminPanel() {
    localStorage.setItem('currentSection', 'admin');
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "ADMIN";
    
    document.getElementById('content-area').innerHTML = `
        <div style="text-align:center; padding:50px; opacity:0.6">
            <div class="spinner" style="margin-bottom:10px">🔄</div>
            Sincronizzazione database globale...
        </div>`;

    try {
        const snapshot = await db.collection("utenti").get();
        snapshot.forEach(doc => { dbUsers[doc.id] = doc.data(); });

        const users = Object.entries(dbUsers)
            .filter(([_, u]) => u.userId)
            .map(([pin, u]) => ({
                pin,
                id: u.userId,
                name: u.name,
                stats: calcUserStats(u),
                deleted: u.deleted
            }))
            .sort((a, b) => b.stats.perc - a.stats.perc);

        let html = `<div style="width:100%">`;

        // 1. NUOVO BLOCCO MANUTENZIONE A 3 TASTI
        html += `
            <div class="review-card" style="margin-bottom:20px; border-left: 4px solid #ff3b30">
                <strong style="color:#ff3b30; display:block; margin-bottom:10px">Manutenzione Database Cloud</strong>
                <div style="display:flex; justify-content:space-around; align-items:center; background: rgba(0,0,0,0.05); padding:10px; border-radius:8px">
                    
                    <div style="text-align:center; cursor:pointer" onclick="adminResetAll('FULL')" title="Elimina tutto">
                        <div style="font-size:22px">💀</div>
                        <div style="font-size:10px; font-weight:700">TABULA RASA</div>
                    </div>

                    <div style="text-align:center; cursor:pointer" onclick="adminResetAll('STATS')" title="Azzera punti a tutti">
                        <div style="font-size:22px">🧹</div>
                        <div style="font-size:10px; font-weight:700">RESET PUNTI</div>
                    </div>

                    <div style="text-align:center; cursor:pointer" onclick="alert('Usa l icona 🧼 accanto all utente per il reset mirato')">
                        <div style="font-size:22px">🎯</div>
                        <div style="font-size:10px; font-weight:700">MIRATO</div>
                    </div>
                </div>
            </div>`;

        const attivi = users.filter(u => !u.deleted);
        const eliminati = users.filter(u => u.deleted);

        // Rendering Utenti
        if (attivi.length === 0) {
            html += `<div style="text-align:center; padding:20px; color:#666">Nessun utente nel cloud</div>`;
        } else {
            attivi.forEach(u => {
                const statsText = u.stats.total ? `${u.stats.correct}/${u.stats.total} corrette · ${u.stats.perc}%` : "Nessun progresso";
                html += `
                    <div class="review-card is-ok">
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <div>
                                <strong>${u.name}</strong>
                                <div style="font-size:12px; opacity:0.6">ID ${u.id} - PIN ${u.pin}</div>
                            </div>
                            <div style="display:flex; gap:18px; font-size:18px">
                                <span style="cursor:pointer" title="Storico" onclick="showUserHistory(${u.id})">⏳</span>
                                <span style="cursor:pointer" title="Aggiorna" onclick="recalcUser(${u.id})">🔄</span>
                                <span style="cursor:pointer" title="Reset Mirato" onclick="adminResetSingleUser(${u.id})">🧼</span>
                                <span style="cursor:pointer; color:#ff3b30" title="Elimina" onclick="adminDeleteUser(${u.id})">🗑</span>
                            </div>
                        </div>
                        <div style="margin-top:8px; font-size:13px">${statsText}</div>
                    </div>`;
            });
        }

        // Sezione Eliminati (Resto del codice uguale...)
        if (eliminati.length > 0) {
            html += `
                <div class="glass-card" style="margin-top:30px; border:1px solid rgba(255,59,48,0.2)">
                    <div onclick="const el = document.getElementById('deleted-list'); el.style.display = el.style.display === 'none' ? 'block' : 'none'" 
                         style="cursor:pointer; display:flex; justify-content:center; align-items:center">
                        <strong style="color:#ff3b30; font-size:12px; letter-spacing:1px">UTENTI ELIMINATI (${eliminati.length})</strong>
                    </div>
                    <div id="deleted-list" style="display:none; margin-top:15px">`;
            
            eliminati.forEach(u => {
                html += `
                    <div style="padding:12px 0; border-bottom:1px solid rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center">
                        <div>
                            <span style="font-weight:600">${u.name}</span>
                            <div style="font-size:11px; opacity:0.5">ID ${u.id}</div>
                        </div>
                        <div style="cursor:pointer; color:#0a84ff; font-weight:600; font-size:13px" onclick="showUserHistory(${u.id})">
                            VEDI STORICO
                        </div>
                    </div>`;
            });
            html += `</div></div>`;
        }

        html += `</div>`;
        document.getElementById('content-area').innerHTML = html;

    } catch (error) {
        console.error("Errore:", error);
        document.getElementById('content-area').innerHTML = `<div style="color:red; text-align:center">Errore Cloud.</div>`;
    }
}



function showUserHistory(userId) {
    const u = Object.values(dbUsers).find(user => user.userId == userId);
    if (!u) return;

    const htmlStorico = generateHistoryHTML(u);

    openModal(
        `Storico di ${u.name}`,
        `<div style="max-height: 400px; overflow-y: auto; text-align: left; padding: 10px;">${htmlStorico}</div>`,
        () => {} // Non serve un'azione specifica, il modale si chiude al click
    );

    // Trasforma i tasti per la modalità "Sola Lettura"
    const btnConfirm = document.getElementById('modal-confirm');
    const btnCancel = document.getElementById('modal-cancel');
    
    if (btnConfirm) btnConfirm.innerText = "Chiudi";
    if (btnCancel) btnCancel.style.display = "none";
}


function generateHistoryHTML(data) {
    let html = "";
    // Se passiamo l'intero oggetto utente prendiamo .history, altrimenti usiamo data
    const historyData = data.history ? data.history : data;

    Object.keys(historyData || {}).forEach(lang => {
        html += `<div style="margin-bottom:10px; border-bottom:1px solid rgba(120,120,120,0.1); padding-bottom:5px"><strong>${lang}</strong></div>`;
        if (Array.isArray(historyData[lang])) {
            historyData[lang].forEach((h, idx) => {
                const status = h.ok ? "✅" : (h.isNotStudied ? "🟦" : "❌");
                html += `<div style="font-size:12px; margin-bottom:6px">
                            ${status} Q${idx + 1}: ${h.question}<br>
                            <em style="opacity:0.6">Risposta: ${h.correctAnswer || 'N/A'}</em>
                         </div>`;
            });
        }
    });
    return html || "<div style='font-size:12px; opacity:0.6'>Nessuna domanda fatta</div>";
}



function renderAdminUsers() {
    updateNav(true, "showHome()");
    const appTitle = document.getElementById('app-title');
    if (appTitle) appTitle.innerText = "PANNELLO ADMIN";

    const container = document.getElementById('content-area');
    if (!container) return;

    // DEBUG: Controlliamo cosa vede l'admin nella console
    console.log("Database attuale in Admin:", dbUsers);
    
    const pinList = Object.keys(dbUsers || {});

    if (pinList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; opacity:0.6;">
                <div style="font-size:30px; margin-bottom:10px;">👤🚫</div>
                <p>Nessun utente registrato nel database 'quiz_master_db'.</p>
            </div>`;
        return;
    }

    let users = pinList.map((pin, idx) => {
        const u = dbUsers[pin];
        let score = 0;
        
        // Calcolo sicuro del punteggio
        if (u && u.history) {
            Object.values(u.history).forEach(hist => {
                if (Array.isArray(hist)) {
                    hist.forEach(h => { if (h && h.ok) score++; });
                }
            });
        }
        return { 
            id: idx + 1, 
            name: u.name || "Senza Nome", 
            pin: pin, 
            score: score 
        };
    });

    // Ordina per punteggio
    users.sort((a, b) => b.score - a.score);

    let html = `<div class="glass-card" style="background:transparent; border:none; box-shadow:none; padding:10px;">`;
    
    users.forEach(u => {
        html += `
        <div style="margin-bottom:12px; padding:15px; border:1px solid var(--border); border-radius:14px; display:flex; justify-content:space-between; align-items:center; background:var(--bg-card, rgba(255,255,255,0.05));">
            <div style="color:var(--text-color);">
                <div style="font-weight:700; font-size:15px;">${u.name}</div>
                <div style="font-size:11px; opacity:0.5;">PIN: ${u.pin} • Punti: ${u.score}</div>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="modal-btn btn-primary" onclick="showUserHistory('${u.pin}')" style="padding:8px 12px; border-radius:8px;">⏳</button>
                <button class="modal-btn btn-destruct" onclick="adminDeleteUser('${u.pin}')" style="padding:8px 12px; border-radius:8px;">❌</button>
            </div>
        </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function calcUserStats(user) {
    let tot = 0;
    let ok = 0;
    Object.values(user.history || {}).forEach(arr => {
        arr.forEach(h => {
            tot++;
            if (h.ok) ok++;
        });
    });
    return {
        total: tot,
        correct: ok,
        perc: tot ? Math.round((ok / tot) * 100) : 0
    };
}

function recalcUser(userId) {
    const u = findUserById(userId);
    if (!u) return;
    openModal(
        "Ricalcola statistiche",
        "Aggiorna le statistiche di questo utente.",
        () => {
            // stats sono sempre live, qui forziamo solo refresh UI
            renderAdminPanel();
        }
    );
}

async function adminDeleteUser(userId) {
    // Troviamo il PIN corrispondente all'ID
    const pin = Object.keys(dbUsers).find(key => dbUsers[key].userId == userId);
    const u = dbUsers[pin];
    
    if (!u) {
        alert("Utente non trovato");
        return;
    }

    openModal(
        "Elimina utente",
        `L'utente ${u.name} verrà disattivato globalmente. Potrai ancora consultare il suo storico.`,
        async () => {
            // 1. Modifica locale
            dbUsers[pin] = { 
                ...u, // Manteniamo tutti i dati per lo storico
                deleted: true 
            }; 
            
            // 2. MODIFICA SUL CLOUD (Importante!)
            try {
                // Aggiorniamo il documento specifico su Firebase
                await db.collection("utenti").doc(pin).update({
                    deleted: true
                });
                
                // Rimuoviamo l'utente anche dalla classifica globale
                await db.collection("classifica").doc(pin).delete();

                console.log(`Utente ${pin} disattivato sul Cloud.`);
            } catch (error) {
                console.error("Errore durante la disattivazione Cloud:", error);
                alert("Errore di connessione: l'utente è stato eliminato solo localmente.");
            }
            
            // 3. Salvataggio e Refresh
            saveMasterDB();
            renderAdminPanel();
        }
    );
}


// Mostra i dettagli completi di un utente per l'admin
function showUserDetails(pin) {
    const u = dbUsers[pin];
    if (!u) return;

    const stats = calcUserStats(u);

    // Progressi dettagliati per ogni linguaggio
    const totalLevels = Object.keys(domandaRepo);
    let progHtml = '';
    totalLevels.forEach(lang => {
        const comp = u.progress[lang] || 0;
        progHtml += `<div style="margin-bottom:10px; cursor:pointer" onclick="toggleLangDetails(this)">
                        <strong>${lang}</strong> <span class="chevron">›</span>
                        <div style="display:none; margin-top:5px">`;
        for (let i = 1; i <= 5; i++) {
            let correct = 0, wrong = 0, total = 15;
            if (u.history[lang]) {
                u.history[lang].forEach(h => { if(i <= comp) { if(h.ok) correct++; else wrong++; } });
            }
            const notStudied = total - correct - wrong;
            const percent = total ? Math.round((correct/total)*100) : 0;
            progHtml += `<div style="margin-bottom:6px; font-size:12px">
                            Livello ${i}:
                            <div class="progress-container" style="position:relative; height:8px; border-radius:6px; background:#e0e0e0; overflow:hidden">
                                <div class="progress-bar-fill" style="width:${(correct/total)*100}%; background:#34c759; height:100%"></div>
                                <div class="progress-bar-fill" style="width:${(wrong/total)*100}%; background:#ff3b30; position:absolute; left:${(correct/total)*100}%; height:100%"></div>
                                <div class="progress-bar-fill" style="width:${(notStudied/total)*100}%; background:#ffd60a; position:absolute; left:${(correct+wrong)/total*100}%; height:100%"></div>
                            </div>
                            <div style="text-align:right; font-size:11px">${percent}% corrette</div>
                         </div>`;
        }
        progHtml += `</div></div>`;
    });

    // Storico
    let historyHtml = '';
    Object.entries(u.history || {}).forEach(([lang, arr]) => {
        historyHtml += `<div style="margin-top:10px"><strong>${lang}</strong></div>`;
        arr.forEach((h, idx) => {
            const status = h.ok ? "✅" : h.notStudied ? "🟡" : "❌";
            historyHtml += `<div style="font-size:12px; margin-bottom:2px">
                                ${status} Q${idx+1}: ${h.q}
                                <br><em style="opacity:0.6">Risposta corretta: ${h.correctAns || '—'}</em>
                            </div>`;
        });
    });

    document.getElementById('content-area').innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; gap:15px">
            <div class="glass-card">
                <div><strong>Nome:</strong> ${u.name}</div>
                <div><strong>ID Utente:</strong> ${u.userId}</div>
            </div>

            <div class="glass-card">
                <div><strong>Statistiche generali</strong></div>
                <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px">
                    <div>Corrette: ${stats.correct}</div>
                    <div>Sbagliate: ${stats.total - stats.correct}</div>
                    <div>Non studiate: ${0}</div>
                </div>
            </div>

            <div class="glass-card">
                <strong>Progressi dettagliati</strong>
                <div style="margin-top:10px">${progHtml}</div>
            </div>

            <div class="glass-card">
                <strong>Storico risposte</strong>
                <div style="margin-top:10px; max-height:300px; overflow-y:auto">${historyHtml || "<em>Nessuna domanda fatta</em>"}</div>
            </div>

            <div class="glass-card" style="text-align:right">
                <button class="btn-apple btn-light" onclick="renderAdminPanel()">Indietro</button>
            </div>
        </div>
    `;
}

function findUserById(id) {
    // Usiamo == invece di === per evitare problemi se l'id è salvato come stringa o numero
    return Object.values(dbUsers).find(u => u.userId == id);
}


async function adminResetAll(mode) {
    const title = mode === 'FULL' ? "TABULA RASA" : "RESET STATISTICHE";
    const msg = mode === 'FULL' 
        ? "OPERAZIONE NUCLEARE: Eliminerai tutti gli UTENTI, i loro PIN e ogni progresso da Firebase. Dovranno registrarsi di nuovo." 
        : "AZZERAMENTO PUNTI: I PIN rimarranno validi, ma tutti i progressi e la classifica verranno portati a zero.";

    openModal(title, msg, async () => {
        try {
            const utentiSnapshot = await db.collection("utenti").get();
            const batch = db.batch();

            if (mode === 'FULL') {
                // ELIMINAZIONE TOTALE
                utentiSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                const classifSnapshot = await db.collection("classifica").get();
                classifSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                dbUsers = {};
            } else {
                // SOLO STATISTICHE
                utentiSnapshot.docs.forEach(doc => {
                    batch.update(doc.ref, {
                        progress: {},
                        history: {},
                        activeProgress: {},
                        ripasso: { wrong: [], notStudied: [] }
                    });
                });
                const classifSnapshot = await db.collection("classifica").get();
                classifSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                
                // Aggiorna dbUsers locale
                Object.keys(dbUsers).forEach(pin => {
                    dbUsers[pin].progress = {};
                    dbUsers[pin].history = {};
                });
            }

            await batch.commit();
            localStorage.clear(); // Pulizia locale per sicurezza
            window.location.reload(); // Ricarica per riflettere i cambiamenti

        } catch (e) {
            console.error("Errore Reset:", e);
            alert("Errore durante la comunicazione con Firebase.");
        }
    });
}


/* Cambia PIN */
function userChangePin() {
    openModal("Cambia PIN", `
        Inserisci il nuovo PIN a 4 cifre:
        <input type="password" id="new-pin-field" maxlength="4" inputmode="numeric" style="margin-top:10px; text-align:center; width:80%; padding:8px; border-radius:8px; border:1px solid #ccc">
    `, () => {
        const newPin = document.getElementById('new-pin-field').value;
        if(newPin.length !== 4) { alert("Il PIN deve essere di 4 cifre"); return; }
        if(dbUsers[newPin]) { alert("PIN già in uso"); return; }

        dbUsers[newPin] = dbUsers[state.currentPin];
        delete dbUsers[state.currentPin];
        state.currentPin = newPin;
        saveMasterDB();
        renderProfile();
    });
}

/* Azzera statistiche */
async function userResetStats() {
    openModal("Azzera statistiche", "Vuoi azzerare tutte le tue statistiche? Questa azione è irreversibile.", async () => {
        // 1. Pulizia dati nello stato attuale
        state.progress = {};
        state.history = {};
        state.activeProgress = {};
        state.ripasso = { wrong: [], notStudied: [] };

        // 2. Pulizia nell'oggetto database locale
        const u = dbUsers[state.currentPin];
        if (u) {
            u.progress = {};
            u.history = {};
            u.activeProgress = {};
            u.ripasso = { wrong: [], notStudied: [] };
        }

        // 3. Sincronizzazione con Google (Firebase)
        // Usiamo await per essere sicuri che i dati siano cancellati sul server
        await saveMasterDB(); 
        
        // 4. Rimuovi l'utente dalla classifica globale (opzionale, ma consigliato)
        try {
            await db.collection("classifica").doc(state.currentPin).delete();
        } catch(e) { console.log("Errore pulizia classifica"); }

        // 5. Ricarica la pagina del profilo aggiornata
        renderProfile();
    });
}


/* Elimina account */
function userDeleteAccount() {
    openModal("Elimina Account", "Attenzione: l'account verrà rimosso permanentemente. Vuoi procedere?", () => {
        const pinToDelete = state.currentPin;
        
        if (dbUsers[pinToDelete]) {
            // Elimina definitivamente la chiave dal database
            delete dbUsers[pinToDelete]; 
            
            // Salva il database vuoto
            localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
            
            // Reset dello stato e ritorno al login
            state.mode = 'guest';
            state.currentPin = null;
            state.currentUser = null;
            
            console.log("Account eliminato con successo.");
            renderLogin();
        }
    });
}

/* MODALE GENERICO */
function openModal(title, content, onConfirm) {
    let overlay = document.getElementById('modal-overlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <h3 id="modal-title"></h3>
                <div id="modal-body"></div>

                <button class="modal-btn btn-primary" id="modal-confirm">Conferma</button>
                <button class="modal-btn btn-cancel" id="modal-cancel">Annulla</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = content;
    
    const btnConfirm = document.getElementById('modal-confirm');
    const btnCancel = document.getElementById('modal-cancel');
    if (btnConfirm) btnConfirm.innerText = "Conferma";
    if (btnCancel) btnCancel.style.display = "inline-block";
    
    overlay.style.display = 'flex';

    document.getElementById('modal-confirm').onclick = () => { onConfirm(); overlay.style.display='none'; };
    document.getElementById('modal-cancel').onclick = () => { overlay.style.display='none'; };
}

async function renderGlobalClassifica() {
    localStorage.setItem('currentSection', 'classifica');
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "TOP PLAYERS";
    
    const container = document.getElementById('content-area');
    container.innerHTML = `<div style="text-align:center; padding:20px">Caricamento classifica...</div>`;

    try {
        // Recupero dei primi 20 per punteggio
        const snapshot = await db.collection("classifica").orderBy("points", "desc").limit(20).get();
        let html = `<div style="width:100%; display:flex; flex-direction:column; gap:10px">`;
        
        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            const isMe = doc.id === state.currentPin;
            
            // Gestione medaglie e numeri di posizione
            let medal = "";
            if (rank === 1) medal = "🥇";
            else if (rank === 2) medal = "🥈";
            else if (rank === 3) medal = "🥉";
            else medal = `<span style="opacity:0.5; font-size:14px; width:20px; text-align:center; display:inline-block">${rank}</span>`;

            let crown = data.perfect > 0 ? "🏆" : "";
            let specialStyle = isMe ? "border: 2px solid #ff9500;" : "border: 1px solid var(--border);";

            html += `
            <div class="review-card" style="${specialStyle} background: var(--bg-card); display:flex; justify-content:space-between; align-items:center">
                <div style="display:flex; align-items:center; gap:15px">
                    <span style="font-size:20px; min-width:30px; text-align:center">${medal}</span>
                    <div>
                        <div style="font-weight:bold">${data.name} ${crown}</div>
                        <div style="font-size:11px; opacity:0.6">${data.perfect || 0} Livelli Perfetti</div>
                    </div>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:800; color:var(--accent)">${data.points || 0}</div>
                    <div style="font-size:9px; opacity:0.5">PUNTI</div>
                </div>
            </div>`;
            rank++;
        });

        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {
        console.error("Errore classifica:", e);
        container.innerHTML = `<div style="color:red; text-align:center; padding:20px">Errore nel caricamento della classifica globale.</div>`;
    }
}


async function adminResetSingleUser(userId) {
    const pin = Object.keys(dbUsers).find(key => dbUsers[key].userId == userId);
    const u = dbUsers[pin];
    if (!u) return;

    openModal(
        "Reset Singolo Utente",
        `Vuoi azzerare i progressi di ${u.name}? Il PIN rimarrà lo stesso, ma tornerà al livello 1.`,
        async () => {
            try {
                const updateData = {
                    progress: {},
                    history: {},
                    activeProgress: {},
                    ripasso: { wrong: [], notStudied: [] }
                };
                // Aggiorna Firebase
                await db.collection("utenti").doc(pin).update(updateData);
                // Aggiorna Locale
                dbUsers[pin] = { ...dbUsers[pin], ...updateData };
                // Rimuovi da classifica
                await db.collection("classifica").doc(pin).delete();
                
                saveMasterDB();
                renderAdminPanel();
            } catch (e) {
                alert("Errore reset mirato.");
            }
        }
    );
}

function closeModal() {
    const modal = document.getElementById('universal-modal');
    const logoutModal = document.getElementById('logout-modal');
    
    if (modal) modal.style.display = 'none';
    if (logoutModal) logoutModal.style.display = 'none';
}

// Inserisci qui le tue funzioni renderProfile, adminReset, adminDelete, userChangePin che hai nel file
// (Mantenile come sono, sono corrette nel tuo originale)
