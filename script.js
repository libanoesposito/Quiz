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
    ripasso: { wrong: [], notStudied: [] }, 
    activeProgress: {},                      
    isPerfectGold: false
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

    // Usa la variabile che hai appena impostato in calcStats
    if (state.isPerfect) {
        document.documentElement.setAttribute('data-theme-gold', 'true');
    } else {
        document.documentElement.removeAttribute('data-theme-gold');
    }
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
            await updateGlobalLeaderboard();
        } catch (error) {
            console.error("Errore durante il salvataggio Cloud:", error);
        }
    }
    
    // 2. Salvataggio locale (Backup immediato sul dispositivo)
    localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
}

// Funzione di supporto per la classifica (da aggiungere in fondo allo script)
async function updateGlobalLeaderboard() {
    if (state.mode !== 'user' || !state.currentPin || state.currentPin === "1111") return;
    if (state.mode !== 'user' || !state.currentPin) return;
    
    const u = dbUsers[state.currentPin];
    let pts = 0;
    let perfects = 0;

    Object.entries(u.progress || {}).forEach(([levelId, correctCount]) => {
    pts += (correctCount * 10);
    
    // Recuperiamo il totale delle domande esistenti per quel livello specifico
    const totalQuestionsInLevel = dbQuiz[levelId]?.length || 40; 
    
    // È PERFETTO solo se le risposte corrette coincidono con il totale delle domande
    if (correctCount >= totalQuestionsInLevel) perfects++;
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
    Object.entries(userData.history || {}).forEach(([levelId, historyArray]) => {
    const correctInLevel = historyArray.filter(h => h.ok).length;
    pts += (correctInLevel * 10);
    const totalQuestionsInLevel = dbQuiz[levelId]?.length || 40;
    // Se ha indovinato TUTTE le domande disponibili nel database per quel livello
    if (correctInLevel >= totalQuestionsInLevel) perfetti++;
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
    `<input type="text" id="reg-name" class="btn-apple" placeholder="Il tuo Nome" 
    style="text-align:center; width:100%; box-sizing:border-box; border:none; outline:none; display:block;">` : '';

    // Decidiamo quale funzione chiamare al clic
    let action = type === 'register' ? 'registerUser()' : "validatePin('login')";

    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%">
            <h3 style="margin-bottom:20px">${title}</h3>
            <div id="pin-error" style="color:#ff3b30; font-size:13px; margin-bottom:10px; display:none; padding:0 20px"></div>
            
            ${nameField}
            
            <input type="password" id="reg-pin" class="btn-apple" 
    style="text-align:center; font-size:24px; letter-spacing:8px; width:100%; box-sizing:border-box; border:none; outline:none; display:block;" 
    maxlength="4" inputmode="numeric" placeholder="PIN">
            
            <button class="btn-apple btn-primary" style="margin-top:20px" onclick="${action}">
                Conferma
            </button>
        </div>`;
      // Focus automatico: se c'è il campo nome punta lì, altrimenti sul PIN
    const focusTarget = document.getElementById('reg-name') || document.getElementById('reg-pin');
    if(focusTarget) setTimeout(() => focusTarget.focus(), 100);

    // Gestione tasto Enter
    const inputs = [document.getElementById('reg-name'), document.getElementById('reg-pin')];
    inputs.forEach(input => {
        if(input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    // Esegue la stessa funzione del bottone Conferma
                    type === 'register' ? registerUser() : validatePin('login');
                }
            });
        }
    });
}


function isWeakPin(pin) {
    // Convertiamo in stringa per sicurezza
    const sPin = String(pin);

    // 1. ECCEZIONE: Se è il PIN Admin o Tester, NON è debole
    if (sPin === "3473" || sPin === "1111") return false;

    // 2. TUTTI UGUALI (es: 0000, 1111...)
    if (/^(\d)\1{3}$/.test(sPin)) return true;

    // 3. SEQUENZA CRESCENTE (es: 1234, 4567...)
    const asc = "0123456789";
    if (asc.includes(sPin) && sPin.length === 4) return true;

    // 4. SEQUENZA DECRESCENTE (es: 4321, 9876...)
    const desc = "9876543210";
    if (desc.includes(sPin) && sPin.length === 4) return true;

    return false;
}


async function registerUser() {
    const nameEl = document.getElementById('reg-name');
    const pinEl = document.getElementById('reg-pin');
    const errorMsgEl = document.getElementById('reg-error-msg'); 
    
    const name = nameEl.value.trim();
    const pin = pinEl.value.trim();

    if (errorMsgEl) errorMsgEl.textContent = "";

    if (name.length < 2 || pin.length < 4) {
        if (errorMsgEl) errorMsgEl.textContent = "Inserisci un nome di almeno 2 lettere e un PIN di 4 cifre.";
        return;
    }

    if (isWeakPin(pin)) {
        if (errorMsgEl) errorMsgEl.textContent = "PIN troppo semplice! Non usare sequenze o numeri ripetuti.";
        return;
    }

    try {
        // 1. CONTROLLO PIN: Ora basta verificare se esiste il documento.
        // Se non esiste, il PIN è libero (o perché mai usato o perché archiviato)
        const check = await db.collection("utenti").doc(pin).get();
        
        if (check.exists) {
            if (errorMsgEl) errorMsgEl.textContent = "Questo PIN è già occupato.";
            return;
        }

        // 2. GENERAZIONE ID SEQUENZIALE
        // Calcoliamo l'ID basandoci su quanti utenti totali (attivi + archiviati) sono passati nel sistema
        const snapAttivi = await db.collection("utenti").get();
        const snapEliminati = await db.collection("eliminati").get();
        const countAttivi = snapAttivi ? snapAttivi.size : 0;
        const countEliminati = snapEliminati ? snapEliminati.size : 0;
        const nextId = countAttivi + countEliminati + 1; 

        const newUser = {
            userId: nextId,
            name: name,
            pin: pin,
            progress: {},
            history: {},
            activeProgress: {},
            ripasso: { wrong: [], notStudied: [] },
            created: new Date().toISOString()
        };

        // 3. SALVATAGGIO
        await db.collection("utenti").doc(pin).set(newUser);
        
        dbUsers[pin] = newUser;
        localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));

        // --- FIX PER NON IMPALLARE IL SITO ---
        currentUser = newUser;
        state.mode = 'user';           // Imposta il modo su user per sbloccare i tasti
        state.currentPin = pin;        // Associa il pin allo stato globale
        state.progress = {};           // Reset progressi locale per nuovo utente
        
        localStorage.setItem('currentUserPin', pin);

        await db.collection("classifica").doc(pin).set({ 
            name: name, 
            score: 0, 
            userId: nextId 
        });

        closeModal();
        updateNav(true, "showHome()"); 
        showHome();                    

    } catch (error) {
        console.error("Errore registrazione:", error);
        if (errorMsgEl) errorMsgEl.textContent = "Errore di connessione al database.";
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
        
        <div class="lang-item profile-slot" onclick="renderGlobalClassifica()" style="background: rgba(255, 149, 0, 0.15) !important; border: 1px solid #ff9500 !important; color: #ff9500 !important; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <img src="https://cdn-icons-png.flaticon.com/512/2817/2817958.png" width="22" style="filter: invert(58%) sepia(91%) saturate(2375%) hue-rotate(1deg) brightness(105%) contrast(105%);">
          <div style="font-weight:700; font-size:13px">CLASSIFICA</div>
        </div>

        <div class="lang-item profile-slot" onclick="renderProfile()" style="background: #0a84ff; color: white;">
            <div style="font-weight:700; font-size:13px">IL MIO PROFILO</div>
        </div>`;
    }

    // 3. Sezione Admin
    if(state.mode === 'admin') {
        html += `
        <div class="lang-item profile-slot" onclick="renderAdminPanel()" style="background: #0a84ff; color: white;">
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
            ${data.options.map((o, i) => {
                // Puliamo il testo da eventuali apici per non rompere l'onclick
                const safeOption = o.replace(/'/g, "\\'");
                return `<button class="btn-apple" onclick="check(${i === data.correct}, '${safeOption}')">${o}</button>`;
            }).join('')}
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
        correctAnswer: data.options[data.correct],
        isNotStudied: true, // Questo attiva il blu nel renderProfile
        level: session.lvl,  // Indica a quale barra aggiungere il blu
        lvl: session.lvl,     // Doppia sicurezza
        exp: data.exp
    });

    // 3. NUOVO: Avanza l'indice del progresso attivo
    if (!user.activeProgress) user.activeProgress = {};
    user.activeProgress[`${session.lang}_${session.lvl}`] = session.idx + 1;

    // 4. Salva tutto nel DB
    if (typeof saveMasterDB === 'function') saveMasterDB();
    
    // 5. NUOVO: Passa subito alla prossima domanda
    next();
}

function check(isOk, userAnsText) {
    const data = session.q[session.idx];
    if(state.mode === 'user') {
        if(!state.history[session.lang]) state.history[session.lang] = [];
        state.history[session.lang].push({
            question: data.q,
            userAnswer: userAnsText || (isOk ? data.options[data.correct] : 'Sbagliata'),
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
    const stats = {
        total: tot,
        correct: ok,
        wrong: tot - ok,
        perc: tot ? Math.round((ok / tot) * 100) : 0
    };
    // Se l'utente ha fatto tutto giusto e ha risposto ad almeno una domanda
    state.isPerfect = stats.total > 0 && stats.perc === 100;
    return stats;
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
                        <div style="font-size:12px; margin-bottom:6px">
                            ${status} Q: ${h.question}<br>
                            ${h.userAnswer ? `<span style="opacity:0.7">Tua: ${h.userAnswer}</span><br>` : ''}
                        <em style="opacity:0.6; color:#34c759">Corretta: ${h.correctAnswer || '—'}</em>
                        </div>
                     </div>`;
        });
    });
    return html || "<div style='font-size:12px; opacity:0.6'>Nessuno Storico</div>";
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
       const snapAttivi = await db.collection("utenti").get();
        // 1. Scarica gli utenti ATTIVI
       snapAttivi.forEach(doc => {
          dbUsers[doc.id] = doc.data(); 
    });
   
    const attivi = snapAttivi.docs.map(doc => ({
        ...doc.data(),
        id: doc.data().userId // assicura la corrispondenza con ${u.id}
    }));

    // 2. Scarica gli utenti ELIMINATI dall'archivio
    const snapEliminati = await db.collection("eliminati").get();
    const eliminati = snapEliminati.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id, // ID del documento utile per il ripristino
        id: doc.data().userId
    }));

      window.currentAttivi = attivi;
      window.currentEliminati = eliminati;

        let html = `<div style="width:100%">`;

        // BLOCCO MANUTENZIONE
      html += `
    <div style="margin-bottom:32px; padding: 0 4px; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(120,120,128,0.12); padding-bottom: 24px;">
        <div>
            <strong style="color:#ff3b30; font-size:16px; letter-spacing:-0.01em; display:block">Manutenzione Database</strong>
            <span style="font-size:12px; color:currentColor; opacity:0.5">Azioni distruttive globali</span>
        </div>

        <div style="display:flex; gap:28px; color:currentColor">
            <div style="text-align:center; cursor:pointer" onclick="adminResetAll('STATS')" title="Azzera punti a tutti gli utenti">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
                <div style="font-size:9px; font-weight:800; margin-top:5px; opacity:0.6; letter-spacing:0.5px">RESET PUNTI</div>
            </div>

            <div style="text-align:center; cursor:pointer" onclick="adminResetAll('FULL')" title="Elimina tutto il database">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                <div style="font-size:9px; font-weight:800; color:#ff3b30; margin-top:5px; letter-spacing:0.5px">TABULA RASA</div>
            </div>
        </div>
    </div>`;

        // --- 1. RENDERING UTENTI ATTIVI ---
if (attivi.length === 0) {
    html += `<div style="text-align:center; padding:20px; color:#666">Nessun utente nel cloud</div>`;
} else {
    attivi.forEach(u => {
    // 1. Calcolo dati reali dallo storico
    let cor = 0, wr = 0, ns = 0;
    if (u.history) {
        Object.values(u.history).forEach(langArr => {
            langArr.forEach(h => {
                if (h.ok) cor++;
                else if (h.notStudied) ns++;
                else wr++;
            });
        });
    }

    const totalPotential = cor + wr + ns;
    let statsHTML = `<div style="margin-top:12px; font-size:12px; opacity:0.5">Nessun progresso</div>`;

    if (totalPotential > 0) {
        // Funzione per le 3 barre separate
        const getBar = (label, value, color) => `
            <div style="margin-top:8px">
                <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; margin-bottom:3px; opacity:0.6">
                    <span>${label.toUpperCase()}</span>
                    <span>${value}</span>
                </div>
                <div style="height:6px; background:rgba(120,120,128,0.1); border-radius:4px; overflow:hidden">
                    <div style="width:${(value / totalPotential) * 100}%; height:100%; background:${color}; border-radius:4px"></div>
                </div>
            </div>`;

        statsHTML = `
    <div id="stats-container-${u.id}" style="display:none; margin-top:15px; padding-top:10px; border-top: 1px solid rgba(120,120,128,0.08)">
        ${getBar('Corrette', cor, '#34c759')}
        ${getBar('Sbagliate', wr, '#ff3b30')}
        ${getBar('Non Studiate', ns, '#0a84ff')}
    </div>
    `;
    }

    const isTemp = u.needsPinChange ? `<span style="color:#ff9500; font-size:10px; font-weight:bold; margin-left:5px">⚠️ TEMP</span>` : '';

    html += `<div class="review-card is-ok" style="margin-bottom:16px; cursor:pointer" onclick="const s=document.getElementById('stats-container-${u.id}'); if(!event.target.closest('span')){ s.style.display=s.style.display==='none'?'block':'none'; }">
        <div style="display:flex; justify-content:space-between; align-items:flex-start">
            <div>
                <strong style="color:currentColor; font-size:15px">${u.name}</strong> ${isTemp}
                <div style="font-size:12px; color:currentColor; opacity:0.6; display:flex; align-items:center; gap:8px; margin-top:4px">
                    ID ${u.id} • PIN: 
                    <span id="pin-text-${u.id}" style="font-family:monospace; filter:blur(4px); transition: filter 0.2s ease">${u.pin}</span>
                    <span style="cursor:pointer; opacity:0.8; display:flex; padding:4px" onclick="event.stopPropagation(); togglePinVisibility('${u.id}')">
                        <svg id="pin-icon-${u.id}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                    </span>
                </div>
            </div>
            
            <div style="display:flex; gap:14px; align-items:center; color:currentColor">
                <span style="cursor:pointer" title="Storico" onclick="event.stopPropagation(); showUserHistory(${u.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </span>
                <span style="cursor:pointer; color:#ff3b30" title="Elimina" onclick="event.stopPropagation(); adminDeleteUser(${u.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </span>
            </div>
        </div>
        ${statsHTML}
    </div>`;
});
}

// --- 2. RENDERING ELIMINATI ---
if (eliminati.length > 0) {
    html += `
        <div class="glass-card" style="
            margin-top:30px; 
            width:100%; 
            padding:15px; 
            border-radius:15px; 
            border:1px solid rgba(255,59,48,0.3);
            box-sizing: border-box;
        ">
            <div onclick="const el = document.getElementById('deleted-list'); el.style.display = el.style.display === 'none' ? 'block' : 'none'" 
                 style="cursor:pointer; display:flex; justify-content:center; align-items:center">
                <strong style="color:#ff3b30; font-size:12px; letter-spacing:1px">UTENTI ELIMINATI (${eliminati.length})</strong>
            </div>
            
            <div id="deleted-list" style="display:none; margin-top:15px">
                <div style="text-align:right; margin-bottom:12px">
                    <span style="color:#ff3b30; font-size:10px; font-weight:700; cursor:pointer; text-decoration:underline; opacity:0.8" onclick="adminClearTrash()">SVUOTA TUTTO</span>
                </div>`;

    eliminati.forEach(u => {
        html += `
            <div style="padding:12px 0; border-bottom:1px solid rgba(120,120,128,0.1); display:flex; justify-content:space-between; align-items:center; color:currentColor">
                <div>
                    <span style="font-weight:600; color:currentColor">${u.name}</span>
                    <div style="font-size:11px; opacity:0.5">ID ${u.id}</div>
                </div>
                
                <div style="display:flex; gap:18px; align-items:center">
                    <span style="cursor:pointer; color:#34c759" title="Ripristina" onclick="adminRestoreUser(${u.id}, '${u.docId}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                    </span>

                    <span style="cursor:pointer; opacity:0.7" title="Storico" onclick="showUserHistory(${u.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </span>

                    <span style="cursor:pointer; color:#ff3b30" title="Elimina definitivo" onclick="adminPermanentDelete('${u.docId}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </span>
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

// L'occhio in admin
function togglePinVisibility(userId) {
    const text = document.getElementById(`pin-text-${userId}`);
    const icon = document.getElementById(`pin-icon-${userId}`);
    
    if (!text || !icon) return;

    // Controlliamo lo stato attuale (se è blurrato o no)
    const isBlurred = text.style.filter === 'blur(4px)' || text.style.filter === '';

    if (isBlurred) {
        // MOSTRA PIN
        text.style.filter = 'none';
        // Icona occhio sbarrato (SVG Lucide)
        icon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        // NASCONDI PIN (Censura)
        text.style.filter = 'blur(4px)';
        // Icona occhio normale
        icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}


function showUserHistory(userId) {
    const u = Object.values(dbUsers).find(user => user.userId == userId) || 
    (window.currentEliminati ? window.currentEliminati.find(user => user.userId == userId) : null);

    if (!u) {
        console.error("Utente non trovato in dbUsers né negli eliminati");
        return;
    }

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
    
    // Creiamo la riga della risposta solo se NON è "non studiato"
    let rispostaUtenteHtml = "";
    if (!h.isNotStudied) {
        rispostaUtenteHtml = `<br><span style="color:${h.ok ? '#34c759' : '#ff3b30'}">Tua: ${h.userAnswer || '—'}</span>`;
    }

    html += `<div style="font-size:12px; margin-bottom:6px">
                ${status} Q${idx + 1}: ${h.question}
                ${rispostaUtenteHtml}
                ${!h.ok ? `<br><em style="opacity:0.6">Corretta: ${h.correctAnswer || '—'}</em>` : ''}
             </div>`;
});
        }
    });
    return html || "<div style='font-size:12px; opacity:0.6'>Nessun Storico</div>";
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

async function adminRestoreUser(userId, docId) {
    let pinDaUsare = docId.split('_')[0];
    
    openModal("Ripristina Utente", "Riattivare l'utente? Se il PIN è occupato, ne verrà generato uno temporaneo.", async () => {
        try {
            // 1. Controlla se il PIN è occupato
            const check = await db.collection("utenti").doc(pinDaUsare).get();
            let isTemporary = false;

            if (check.exists) {
                // PIN occupato! Generiamo un PIN casuale di 4 cifre che non esiste
                isTemporary = true;
                pinDaUsare = Math.floor(1000 + Math.random() * 9000).toString();
                alert(`Il PIN originale era occupato. L'utente è stato ripristinato con il PIN TEMPORANEO: ${pinDaUsare}`);
            }

            const snap = await db.collection("eliminati").doc(docId).get();
            const data = snap.data();

            // 2. Prepariamo i dati aggiornati
            const restoredData = { 
                ...data, 
                deleted: false, 
                userId: userId, 
                pin: pinDaUsare, // Aggiorniamo il PIN nel documento
                needsPinChange: isTemporary // Flag per l'utente (opzionale)
            };

            // 3. Ripristina su Firebase e cancella dal cestino
            await db.collection("utenti").doc(pinDaUsare).set(restoredData);
            await db.collection("eliminati").doc(docId).delete();

            // 4. Aggiorna locale
            dbUsers[pinDaUsare] = restoredData;
            
            saveMasterDB();
            renderAdminPanel(); 
        } catch (e) {
            console.error(e);
            alert("Errore durante il ripristino premium.");
        }
    });
}

async function adminDeleteUser(userId) {
    const pin = Object.keys(dbUsers).find(key => dbUsers[key].userId == userId);
    if (!pin) {
        alert("Utente non trovato nel database locale.");
        return;
    }

    const u = dbUsers[pin];

    openModal(
        "Elimina utente",
        `L'utente ${u.name} verrà spostato nell'archivio. Il suo PIN sarà libero per nuove registrazioni, ma potrai ancora consultare il suo storico.`,
        async () => {
            try {
                const archiveId = `${pin}_${Date.now()}`;

                // 1. SPOSTAMENTO SUL CLOUD (ARCHIVIO)
                await db.collection("eliminati").doc(archiveId).set({
                    ...u,
                    archiveId: archiveId,
                    deletedAt: new Date().toISOString()
                });

                // 2. RIMOZIONE DA ATTIVI E CLASSIFICA
                await db.collection("utenti").doc(pin).delete();
                await db.collection("classifica").doc(pin).delete();

                // 3. AGGIORNAMENTO LOCALE
                delete dbUsers[pin];
                saveMasterDB();

                // 4. REFRESH UI
                renderAdminPanel();
                console.log(`Utente ${u.name} archiviato correttamente.`);

            } catch (error) {
                console.error("Errore durante l'archiviazione:", error);
                alert("Errore durante la comunicazione con Firebase.");
            }
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
                    ${status} Q${idx+1}: ${h.question || h.q}
                    <br><span style="color:${h.ok ? '#34c759' : '#ff3b30'}">Tua: ${h.userAnswer || '—'}</span>
                    ${!h.ok ? `<br><em style="opacity:0.6">Corretta: ${h.correctAnswer || h.correctAns || '—'}</em>` : ''}
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
        ? "Tutti gli utenti verranno spostati nella lista 'ELIMINATI'. I loro dati rimarranno consultabili dall'admin, ma non potranno più accedere." 
        : "I PIN rimarranno validi, ma tutti i progressi verranno azzerati.";

    openModal(title, msg, async () => {
        try {
            const utentiSnapshot = await db.collection("utenti").get();
            const batch = db.batch();

            utentiSnapshot.docs.forEach(doc => {
    if (mode === 'FULL') {
        const userData = doc.data();
        const pin = doc.id;
        const archiveId = `${pin}_${Date.now()}`;

        // 1. Crea la copia nel cestino (così renderAdminPanel lo vede)
        const deletedRef = db.collection("eliminati").doc(archiveId);
        batch.set(deletedRef, {
            ...userData,
            docId: archiveId, // Fondamentale per il ripristino
            deletedAt: new Date().toISOString(),
            deletedBy: "admin_full_reset"
        });

        // 2. Cancella l'originale da utenti e classifica
        batch.delete(doc.ref);
        batch.delete(db.collection("classifica").doc(pin));
        
        // 3. Pulisce la memoria locale
        delete dbUsers[pin];
                } else {
                    // Solo reset punti
                    batch.update(doc.ref, {
                        progress: {},
                        history: {},
                        activeProgress: {},
                        ripasso: { wrong: [], notStudied: [] }
                    });
                }
            });

            // La classifica viene sempre svuotata
            const classifSnapshot = await db.collection("classifica").get();
            classifSnapshot.docs.forEach(doc => batch.delete(doc.ref));

            await batch.commit();
            saveMasterDB(); 
            renderAdminPanel(); 

        } catch (e) {
            console.error("Errore Reset:", e);
            alert("Errore durante la comunicazione con Firebase.");
        }
    });
}

// CANCELLAZIONE DEFINITIVA SINGOLA (Dal cestino)
async function adminPermanentDelete(docId) {
    openModal(
        "Eliminazione Definitiva", 
        "Questa azione rimuoverà l'utente dal Cloud per sempre. Non potrai più recuperare lo storico. Procedere?", 
        async () => {
            try {
                // Rimuove direttamente il documento dalla collezione 'eliminati'
                await db.collection("eliminati").doc(docId).delete();
                
                // Refresh immediato del pannello
                renderAdminPanel();
            } catch (e) {
                console.error("Errore eliminazione:", e);
                alert("Errore durante l'eliminazione definitiva.");
            }
        }
    );
}


// SVUOTA TUTTO IL CESTINO
async function adminClearTrash() {
    if (!confirm("Vuoi eliminare DEFINITIVAMENTE tutti gli utenti nella lista eliminati?")) return;
    
    try {
        const snapshot = await db.collection("eliminati").get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        // Aggiorna locale
        Object.keys(dbUsers).forEach(pin => {
            if (dbUsers[pin].deleted) delete dbUsers[pin];
        });
        
        saveMasterDB();
        renderAdminPanel();
    } catch (e) {
        alert("Errore durante la pulizia del cestino.");
    }
}

/* Cambia PIN */
async function userChangePin() {
    openModal("Cambia PIN", `
        Inserisci il nuovo PIN a 4 cifre:
        <input type="password" id="new-pin-field" maxlength="4" inputmode="numeric" 
        style="margin-top:10px; text-align:center; width:80%; padding:8px; border-radius:8px; border:1px solid #ccc">
    `, async () => {
        const newPin = document.getElementById('new-pin-field').value;
        const oldPin = state.currentPin;

        if (newPin.length !== 4) { alert("Il PIN deve essere di 4 cifre"); return; }
        
        // 1. Controllo se il PIN esiste già su Firebase
        const check = await db.collection("utenti").doc(newPin).get();
        if (check.exists) { alert("PIN già in uso"); return; }

        try {
            // 2. Recupera i dati dal vecchio PIN (quello TEMP)
            const userData = dbUsers[oldPin];
            
            // Aggiorna i dati: togliamo il flag TEMP e mettiamo il nuovo PIN
            const updatedData = { 
                ...userData, 
                pin: newPin, 
                needsPinChange: false 
            };

            // 3. OPERAZIONE SUL CLOUD: Crea il nuovo e cancella il vecchio
            await db.collection("utenti").doc(newPin).set(updatedData);
            await db.collection("utenti").doc(oldPin).delete();

            // 4. AGGIORNA LA LOCALE (Memoria browser)
            dbUsers[newPin] = updatedData;
            delete dbUsers[oldPin];
            state.currentPin = newPin;
            
            saveMasterDB();
            closeModal(); // Chiude il popup
            renderProfile(); // Aggiorna la vista
            
            alert("PIN aggiornato correttamente!");

        } catch (error) {
            console.error(error);
            alert("Errore durante il salvataggio nel Cloud.");
        }
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
async function userDeleteAccount() {
    openModal("Elimina Account", "Attenzione: il tuo account verrà rimosso. Potrai registrarti nuovamente con lo stesso PIN, ma i tuoi progressi attuali verranno archiviati.", async () => {
        const pinToDelete = state.currentPin;
        const u = dbUsers[pinToDelete];

        if (!u) return;

        try {
            // 1. CREIAMO L'ID PER L'ARCHIVIO
            const archiveId = `${pinToDelete}_${Date.now()}`;

            // 2. SPOSTAMENTO SUL CLOUD (ARCHIVIAZIONE)
            // Copiamo i dati nella collezione "eliminati" prima di cancellarli
            await db.collection("eliminati").doc(archiveId).set({
                ...u,
                archiveId: archiveId,
                deletedBy: "user", // Segniamo che è stato l'utente a eliminarsi
                deletedAt: new Date().toISOString()
            });

            // 3. RIMOZIONE DALLA COLLEZIONE ATTIVA E CLASSIFICA
            await db.collection("utenti").doc(pinToDelete).delete();
            await db.collection("classifica").doc(pinToDelete).delete();

            // 4. PULIZIA LOCALE
            delete dbUsers[pinToDelete];
            localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));

            // 5. RESET DELLO STATO
            state.mode = 'guest';
            state.currentPin = null;
            state.currentUser = null;

            console.log("Account archiviato e rimosso con successo.");
            
            // Ritorno al login (renderLogin o ricarica pagina)
            window.location.reload(); 

        } catch (error) {
            console.error("Errore durante l'auto-eliminazione:", error);
            alert("Impossibile eliminare l'account. Controlla la connessione.");
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

    const newConfirm = document.getElementById('modal-confirm');
    const clonedConfirm = newConfirm.cloneNode(true);
    newConfirm.parentNode.replaceChild(clonedConfirm, newConfirm);

    clonedConfirm.onclick = () => { onConfirm(); overlay.style.display='none'; };
    document.getElementById('modal-cancel').onclick = () => { overlay.style.display='none'; };
}

async function renderGlobalClassifica() {
    localStorage.setItem('currentSection', 'classifica');
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "TOP PLAYERS";
    
    // 1. DEFINIAMO IL CONTAINER
    const container = document.getElementById('content-area');
    container.innerHTML = `<div style="text-align:center; padding:20px">Caricamento classifica...</div>`;

    // 2. GESTIONE ICONA TESTER (Solo se PIN è 1111)
    if (state.currentPin === "1111") {
        const oldIcon = document.getElementById('tester-debug-icon');
        if (oldIcon) oldIcon.remove();

        const debugIcon = document.createElement('div');
        debugIcon.id = 'tester-debug-icon';
        
        // Funzione click corretta (Async)
        debugIcon.onclick = async () => { 
            await toggleDebugPerfect(); 
        };
        
        debugIcon.innerHTML = "⚡";
        debugIcon.style.cssText = `
            position: fixed; 
            left: 15px; 
            top: 15px; 
            z-index: 9999; 
            cursor: pointer; 
            font-size: 24px; 
            background: rgba(255, 149, 0, 0.2);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 2px solid #ff9500;
            backdrop-filter: blur(5px);
            box-shadow: 0 0 10px rgba(255, 149, 0, 0.3);
        `;
        document.body.appendChild(debugIcon);
    }

    try {
        const snapshot = await db.collection("classifica").orderBy("points", "desc").limit(20).get();
        
        let html = `<div style="width:100%; display:flex; flex-direction:column; gap:10px">`;
        
        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
    
    if (doc.id === "1111" && state.currentPin !== "1111") return;

    const isUtentePerfetto = data.perfect > 0; 
    const isMe = doc.id === state.currentPin;
    const isMeAndPerfect = isMe && isUtentePerfetto;

    // Definiamo le classi e i colori in base allo stato
    let cardClass = "review-card";
    let textClass = "";
    let inlineStyle = ""; 
    let crown = isUtentePerfetto ? "🏆" : "";
    
    // ASSEGNAZIONE TEMA ORO E NERO
    if (isMeAndPerfect) {
        cardClass += " is-perfect-gold";
        textClass = "gold-glow-text";
    } else {
        // Stili standard per il podio se non sei "Perfect"
        if (rank === 1) inlineStyle = `background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700;`;
        else if (rank === 2) inlineStyle = `background: rgba(192, 192, 192, 0.15); border: 1px solid #c0c0c0;`;
        else if (rank === 3) inlineStyle = `background: rgba(205, 127, 50, 0.15); border: 1px solid #cd7f32;`;
        else inlineStyle = `background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);`;
    }

    let medal = "";
    if (rank === 1) medal = "🥇";
    else if (rank === 2) medal = "🥈";
    else if (rank === 3) medal = "🥉";
    else medal = `<span style="opacity:0.5; font-size:14px; width:20px; text-align:center; display:inline-block">${rank}</span>`;

    html += `
    <div class="${cardClass}" style="${inlineStyle} transition: all 0.3s ease; margin-bottom: 8px; display:flex; justify-content:space-between; align-items:center; padding: 15px; border-radius: 16px;">
        <div style="display:flex; align-items:center; gap:12px; position:relative; z-index:2">
            <span style="font-size:18px; min-width:25px; font-weight:800">${medal}</span>
            <div>
                <div class="${textClass}" style="font-size:16px; color:${isMeAndPerfect ? '' : '#fff'}; display:flex; align-items:center; gap:5px">
                    ${data.name} ${crown}
                </div>
                <div style="display:inline-block; margin-top:4px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 20px; font-size:10px; font-weight:700; text-transform:uppercase; color:${isMeAndPerfect ? '#bf953f' : 'rgba(255,255,255,0.6)'}">
                    ${data.perfect || 0} PERFETTI
                </div>
            </div>
        </div>
        <div style="text-align:right; position:relative; z-index:2">
            <div class="${textClass}" style="font-weight:900; color:${isMeAndPerfect ? '' : 'var(--accent)'}; font-size:19px">${data.points || 0}</div>
            <div style="font-size:9px; opacity:0.7; font-weight:800; color:${isMeAndPerfect ? '#bf953f' : '#fff'}">PUNTI</div>
        </div>
    </div>`;
    rank++;
});

        html += `</div>`;
        container.innerHTML = html;

    } catch (e) {
        console.error("Errore classifica:", e);
        container.innerHTML = `<div style="color:red; text-align:center; padding:20px">Errore nel caricamento.</div>`;
    }
}

async function toggleDebugPerfect() {
    if (state.currentPin !== "1111") return;

    const docRef = db.collection("classifica").doc("1111");
    const doc = await docRef.get();
    const isAlreadyPerfect = doc.exists && doc.data().perfect >= 10;

    try {
        if (isAlreadyPerfect) {
            // Disattiva: torna a valori normali
            await docRef.set({
                perfect: 0,
                points: 10,
                lastUpdate: new Date().getTime()
            }, { merge: true });
            alert("Modalità Perfetta DISATTIVATA");
        } else {
            // Attiva: diventa perfetto
            await docRef.set({
                perfect: 20, // Valore alto per la corona
                points: 5000,
                lastUpdate: new Date().getTime()
            }, { merge: true });
            alert("Modalità Perfetta ATTIVATA");
        }
        // Ricarica la classifica per vedere le modifiche
        renderGlobalClassifica();
    } catch (e) {
        console.error("Errore Debug:", e);
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
