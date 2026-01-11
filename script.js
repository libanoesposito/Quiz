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

// Funzione di hashing per sicurezza PIN (SHA-256)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Database globale degli utenti (caricato da memoria locale)
// Nota: standardizziamo la chiave su 'quiz_master_db' usata altrove
let dbUsers = JSON.parse(localStorage.getItem('quiz_master_db')) || {};

// Risolutore domanda breve -> testo completo usando `domandaRepo`
function resolveQuestionFromRepo(h, base, lvl) {
    if (!h) return '';
    if (h.question && String(h.question).trim()) return String(h.question);
    const qRaw = String(h.q || h.question || '').trim();
    // Se è del tipo Q<number> cerchiamo per indice nel repo (1-based)
    const m = qRaw.match(/^Q(\d+)$/i);
    if (m && base && lvl) {
        const idx = parseInt(m[1], 10) - 1;
        try {
            const arr = (domandaRepo && domandaRepo[base] && domandaRepo[base][`L${lvl}`]) ? domandaRepo[base][`L${lvl}`] : null;
            if (Array.isArray(arr) && arr[idx]) {
                const parts = String(arr[idx]).split('|');
                return parts[0] || qRaw;
            }
        } catch (e) { /* ignore */ }
    }
    // Se qRaw corrisponde esattamente al campo parts[0] di qualche domanda, restituisci quel testo
    if (domandaRepo) {
        for (const lang of Object.keys(domandaRepo)) {
            for (const livKey of Object.keys(domandaRepo[lang] || {})) {
                const list = domandaRepo[lang][livKey] || [];
                for (let i = 0; i < list.length; i++) {
                    const parts = String(list[i]).split('|');
                    if (parts[0] && parts[0] === qRaw) return parts[0];
                }
            }
        }
    }
    // fallback: ritorna qRaw
    return qRaw;
}

// Migrazione in memoria: arricchisce le voci storiche già presenti con `question` e `userAnswer` leggibili
function migrateHistoryInMemory() {
    if (!dbUsers || typeof domandaRepo === 'undefined') return;
    Object.keys(dbUsers).forEach(pin => {
        const u = dbUsers[pin];
        if (!u || !u.history) return;
        Object.keys(u.history).forEach(key => {
            // key può essere lingua (e.g. CODING) o perLevel (e.g. CODING_1)
            const arr = u.history[key];
            if (!Array.isArray(arr)) return;
            // infer base and lvl from key when possibile
            let base = null, lvl = null;
            const lvlMatch = key.match(/^(.*)_(\d+)$/);
            if (lvlMatch) { base = lvlMatch[1]; lvl = Number(lvlMatch[2]); }
            for (let i = 0; i < arr.length; i++) {
                const h = arr[i] || {};
                try {
                    if (!h.question || String(h.question).trim().length < 3) {
                        const resolved = resolveQuestionFromRepo(h, base, lvl);
                        if (resolved && resolved !== h.question) h.question = resolved;
                    }
                    // se manca userAnswer ma esiste una shorthand `a` o `ans`, proviamo a usarla
                    if ((!h.userAnswer || String(h.userAnswer).trim() === '') && (h.a || h.ans)) {
                        h.userAnswer = String(h.a || h.ans || '');
                    }
                    // assicuriamoci ci siano campi coerenti
                    if (!h.correctAnswer && h.correct) h.correctAnswer = h.correct;
                    if (h.lvl === undefined && h.level !== undefined) h.lvl = h.level;
                    arr[i] = h;
                } catch (e) { /* ignore per sicurezza */ }
            }
        });
    });
    // risalviamo localmente la versione arricchita
    try { localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers)); } catch(e){}
}

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

// SISTEMA SUONI (Precaricamento Globale)
const audioCache = {
    level: new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav"),
    gold: new Audio("https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a")
};
// Impostazioni iniziali per garantire il caricamento
Object.values(audioCache).forEach(a => { a.volume = 0.5; a.preload = 'auto'; });

function playSound(type) {
    const sound = audioCache[type];
    if (sound) {
        sound.currentTime = 0; // Riavvia il suono se già in riproduzione
        sound.play().catch(e => console.warn("Audio play blocked", e));
    }
}

// ANIMAZIONE TRANSIZIONE GOLD
function triggerGoldTransition() {
    playSound('gold');

    const overlay = document.createElement('div');
    overlay.className = 'gold-transition-overlay';
    overlay.innerHTML = `
        <div class="gold-explosion-bg"></div>
        <div class="perfect-text-anim">PERFECT</div>
    `;
    // Icona semplice ed elegante (Trofeo) che appare nella nebbia dorata
    overlay.innerHTML = `<div class="gold-icon-anim">🏆</div>`;
    document.body.appendChild(overlay);

    // Cambia il tema a metà dell'esplosione (quando lo schermo è coperto)
    // Cambia il tema quando lo schermo è completamente sfocato (circa 1s)
    setTimeout(() => { initTheme(); }, 1000); 

    // Rimuovi overlay alla fine
    setTimeout(() => { overlay.remove(); }, 3100);
}


let state = {
    mode: null,      
    currentPin: null, 
    currentUser: null, 
    progress: {},    
    history: {},
    ripasso: { wrong: [], notStudied: [] }, 
    activeProgress: {},                      
    isTester: false, // Flag per identificare il tester senza esporre il PIN
    // isPerfectGold rimossa: usiamo `state.isPerfect` nel codice
};

// Escapa stringhe per prevenire XSS quando inseriamo valori in innerHTML
function escapeHtml(input) {
    if (input === undefined || input === null) return '';
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Aggiorna la classifica globale basandosi sullo storico locale dell'utente
async function updateGlobalLeaderboard() {
    if (!state.currentPin) return;
    const u = dbUsers[state.currentPin];
    if (!u) return;

    let pts = 0;
    let perfects = 0;

    Object.keys(domandaRepo).forEach(lang => {
        for (let lvl = 1; lvl <= 5; lvl++) {
            // Salta il livello 5 se non esistono sfide per questo linguaggio
            if (lvl === 5 && (!challenges5 || !challenges5[lang])) continue;

            const key = `${lang}_${lvl}`;
            const historyLevel = (u.history && (u.history[key] || u.history[lang])) ? (u.history[key] || (Array.isArray(u.history[lang]) ? u.history[lang].filter(h => Number(h.lvl||h.level) === lvl) : [])) : [];
            const uniqueCorrect = new Set(historyLevel.filter(h => h.ok).map(h => h.q));
            
            const count = uniqueCorrect.size;
            
            // NUOVA LOGICA PUNTI:
            // Prime 10 domande (Base) = 1 punto
            // Successive 5 domande (Gold) = 2 punti
            const basePoints = Math.min(count, 10) * 1;
            const goldPoints = Math.max(0, Math.min(count - 10, 5)) * 2;
            
            pts += (basePoints + goldPoints);
            
            // Perfetto se ha completato almeno 15 domande (10 base + 5 gold)
            if (count >= 15) perfects++;
        }
    });

    try {
        await db.collection("classifica").doc(state.currentPin).set({
            name: u.name,
            points: pts,
            perfect: perfects,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error('Errore aggiornamento classifica:', e);
    }
}


let session = null;
let globalClassifica = []; // Conterrà i dati presi da Firebase
// Interaction logging (per debug): registra azioni utente in dbUsers[PIN].debugLogs e opzionalmente su Firestore
let interactionLogging = false;
let _interactionListener = null;

function trackAction(action, details) {
    // debug tracing removed — no-op in production
    return;
}

// Registra uno snapshot più completo dello stato corrente (utile per debug di refresh/visualizzazione)
function trackSnapshot(name, extra) {
    // snapshot debug removed — no-op
    return;
}

// Removed debug unload/visibility listeners

function enableInteractionLogging() { return; }
function disableInteractionLogging() { return; }

function viewDebugLogs() { return; }

function renderDebugWidget() { return; }

// Hash SHA-256 dei PIN speciali (Admin: 3473, Tester: 1111)
const ADMIN_HASH = "18c6b6f84040725098b1bf26e6269ff898b9ab4ab5e7f64c2c7446ea563c3cd7";
const TESTER_HASH = "0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c";
const TESTER_PIN = "1111";


window.onload = async () => {
    const savedPinRaw = localStorage.getItem('sessionPin');
    
    // Pulizia estrema del valore recuperato
    const savedPin = (savedPinRaw && typeof savedPinRaw === 'string') ? savedPinRaw.trim() : "";

    // 0. FIX RACE CONDITION TEMA: Controlla stato locale prima della rete
    if (savedPin && dbUsers[savedPin]) {
        const localUser = dbUsers[savedPin];
        // Imposta provvisoriamente lo stato gold dai dati locali
        state.isPerfect = localUser.goldMode || localUser.testerGold || false;
    }
    
    initTheme(); // Applica il tema subito (evita flash bianco/standard)
    migrateHistoryInMemory(); // Esegui migrazione ora che siamo sicuri che tutto è caricato

    // Se il PIN è nullo, vuoto o solo spazi, abortiamo subito verso il login
    if (!savedPin || savedPin === "" || savedPin === "null" || savedPin === "undefined") {
        // Input salvato non valido: reindirizza al login (silenzioso)
        localStorage.removeItem('sessionPin');
        renderLogin();
        return;
    }


    try {
        // 🔒 ULTIMA GUARDIA DI SICUREZZA
        if (savedPin.length === 0) {
        renderLogin();
        return;
        }
        
        const hashedSaved = await sha256(savedPin);

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
            
            if (hashedSaved === ADMIN_HASH) {
                state.mode = 'admin';
                state.currentUser = "Creatore";
            } else {
                state.mode = 'user';
                state.progress = cloudUser.progress || {};
                state.history = cloudUser.history || {};
                state.ripasso = cloudUser.ripasso || { wrong: [], notStudied: [] };
                state.activeProgress = cloudUser.activeProgress || {};

                                // --- GESTIONE TEMA (Logica Unificata) ---
                const stats = calcStats(); 
                state.isPerfect = stats.isPerfect; 

                // gestione tema rimandata: verrà inizializzata dopo il caricamento dello stato gold
            }

            // 3. CARICA STATO GOLD DA FIREBASE
            const goldModeCloud = cloudUser.goldMode || cloudUser.testerGold || false;

            // Salva negli state globali
            state.isPerfect = goldModeCloud || state.isPerfect;
            if (hashedSaved === TESTER_HASH) {
                state.isTester = true;
                localStorage.setItem('testerGold', (cloudUser.testerGold || cloudUser.goldMode) ? 'true' : 'false');
            }

            // 4. RIPRISTINO POSIZIONE
            const lastSection = localStorage.getItem('currentSection');
            const lastLang = localStorage.getItem('currentLang');

            if (lastSection === 'profile') { renderProfile(); return; }
            if (lastSection === 'ripasso') { renderRipasso(); return; }
            if (lastSection === 'levels' && lastLang) { showLevels(lastLang); return; }
            if (lastSection === 'admin') { renderAdminPanel(); return; }
            if (lastSection === 'classifica') { renderGlobalClassifica(); return; }

            // Solo se NON esiste nulla da ripristinare
            showHome();

            // Mostra/nascondi il toggle tester (fulmine) se necessario
            try { renderTesterToggle(); } catch(e) {}

            // debug instrumentation removed

        } else {
            // PIN nel localStorage ma non esiste su Firebase
            localStorage.removeItem('sessionPin');
            renderLogin();
        }
    } catch (error) {
        console.error("Errore critico durante il caricamento cloud:", error);
        // In caso di errore di rete, proviamo comunque a caricare dai dati locali
        if (dbUsers[savedPin]) {
            state.currentPin = savedPin;
            showHome();
        } else {
            renderLogin();
        }
    }
};

// Ripristina toggleDebugPerfect per il tester (PIN 1111)
async function toggleDebugPerfect() {
    if (!state.isTester) return;

    const docRef = db.collection("classifica").doc(state.currentPin);
    let doc;
    try { doc = await docRef.get(); } catch(e){ console.error('Errore lettura classifica:', e); doc = { exists: false }; }

    const isAlreadyPerfect = doc.exists && (doc.data().perfect || doc.data().perfect === 20);

    try {
        if (isAlreadyPerfect) {
            // Disattiva modalità gold per il tester
            state.isPerfect = false;
            localStorage.setItem('testerGold', 'false');

            // Pulisce history/progress locali del tester per simulazione off
            state.history = {};
            state.progress = {};
            state.activeProgress = {};
            state.ripasso = { wrong: [], notStudied: [] };
            if (dbUsers[state.currentPin]) {
                dbUsers[state.currentPin].progress = {};
                dbUsers[state.currentPin].history = {};
                dbUsers[state.currentPin].testerGold = false;
            }

            await docRef.set({ perfect: 0, points: 0, lastUpdate: Date.now() }, { merge: true });
            await db.collection('utenti').doc(state.currentPin).set({ testerGold: false, goldMode: false, history: {} }, { merge: true });

        } else {
            // Attiva modalità gold: impostiamo immediatamente lo stato GOLD per aggiornare l'UI
            // prima di costruire lo storico completo (operazione più lenta).
            state.isPerfect = true;
            localStorage.setItem('testerGold', 'true');
            triggerGoldTransition(); // ANIMAZIONE TESTER
            try { renderTesterToggle(); } catch(e) {}
            try { showHome(); } catch(e) {}

            // Costruzione dello storico perfetto (continua normalmente)
            state.history = {};

            Object.keys(domandaRepo).forEach(lang => {
                state.history[lang] = [];
                // prepara struttura per dbUsers.history
                if (!dbUsers[state.currentPin]) dbUsers[state.currentPin] = {};
                if (!dbUsers[state.currentPin].history) dbUsers[state.currentPin].history = {};
                if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
                if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};

                Object.keys(domandaRepo[lang]).forEach(liv => {
                    const arr = domandaRepo[lang][liv] || [];
                    const lvlNum = Number((liv+'').replace(/[^0-9]/g, '')) || 0;
                    // crea array per livello
                    const perLevelKey = `${lang}_${lvlNum}`;
                    dbUsers[state.currentPin].history[perLevelKey] = [];

                    arr.forEach((entry, idx) => {
                        const parts = String(entry).split('|');
                        const q = parts[0] || (`Q_${lang}_${liv}_${idx}`);

                        // Determina l'indice dell'opzione corretta (campo 4 nella stringa)
                        let correctAnswer = '';
                        try {
                            const rawIndex = parts[4];
                            const optionIndex = (rawIndex !== undefined && rawIndex !== '') ? parseInt(rawIndex, 10) : 0;
                            const optionPos = 1 + (isNaN(optionIndex) ? 0 : optionIndex);
                            correctAnswer = parts[optionPos] || parts[1] || '';
                        } catch (e) {
                            correctAnswer = parts[1] || '';
                        }

                        const histEntry = {
                            id: `${lang}_${lvlNum}_${idx}`,
                            q: q,
                            question: q,
                            userAnswer: correctAnswer,
                            correctAnswer: correctAnswer,
                            ok: true,
                            level: lvlNum,
                            lvl: lvlNum,
                            timestamp: Date.now()
                        };

                        state.history[lang].push(histEntry);
                        dbUsers[state.currentPin].history[perLevelKey].push(histEntry);
                    });

                    // imposta activeProgress a 0 (completato) e rimuove savedQuiz per questo livello
                    dbUsers[state.currentPin].activeProgress[perLevelKey] = 0;
                    if (dbUsers[state.currentPin].savedQuizzes && dbUsers[state.currentPin].savedQuizzes[perLevelKey]) delete dbUsers[state.currentPin].savedQuizzes[perLevelKey];
                });

                // Aggiungi livello 5 (L5) se sono presenti challenges5 per la lingua
                if (typeof challenges5 !== 'undefined' && challenges5[lang] && Array.isArray(challenges5[lang])) {
                    const perLevelKey5 = `${lang}_5`;
                    dbUsers[state.currentPin].history[perLevelKey5] = [];
                    challenges5[lang].forEach((c, idx) => {
                        const q = c.task || (`L5_${lang}_${idx}`);
                        const correctAnswer = c.output || '';
                        const histEntry = {
                            id: `${lang}_5_${idx}`,
                            q: q,
                            question: q,
                            userAnswer: correctAnswer,
                            correctAnswer: correctAnswer,
                            ok: true,
                            level: 5,
                            lvl: 5,
                            timestamp: Date.now()
                        };
                        state.history[lang].push(histEntry);
                        dbUsers[state.currentPin].history[perLevelKey5].push(histEntry);
                    });
                    // mark activeProgress for L5 as completed (0)
                    dbUsers[state.currentPin].activeProgress[perLevelKey5] = 0;
                    if (dbUsers[state.currentPin].savedQuizzes && dbUsers[state.currentPin].savedQuizzes[perLevelKey5]) delete dbUsers[state.currentPin].savedQuizzes[perLevelKey5];
                }

                // duplica anche la history per lingua (array completo)
                dbUsers[state.currentPin].history[lang] = state.history[lang].slice();

                // Imposta progress come completato (5) per la lingua
                if (!dbUsers[state.currentPin].progress) dbUsers[state.currentPin].progress = {};
                dbUsers[state.currentPin].progress[lang] = 5;
            });

            state.isPerfect = true;
            localStorage.setItem('testerGold', 'true');

            // Garantisce presenza profilo tester in locale
            if (!dbUsers[state.currentPin]) dbUsers[state.currentPin] = { name: 'Tester', progress: {}, history: {}, activeProgress: {}, ripasso: { wrong: [], notStudied: [] } };

            // Imposta progress come "completato" per ogni lingua (5 livelli)
            Object.keys(domandaRepo).forEach(lang => {
                dbUsers[state.currentPin].progress[lang] = 5;
            });

            // Merge per-lingua `state.history` con eventuali chiavi per-livello già presenti
            const pinKey = state.currentPin;
            if (!dbUsers[pinKey].history) dbUsers[pinKey].history = {};
            Object.keys(state.history || {}).forEach(lang => {
                dbUsers[pinKey].history[lang] = Array.isArray(state.history[lang]) ? state.history[lang].slice() : [];
            });

            // Aggiorna anche lo state in memoria per mantenere UI coerente
            state.history = dbUsers[pinKey].history;
            state.progress = dbUsers[pinKey].progress || {};

            await docRef.set({ perfect: 20, points: 5000, lastUpdate: new Date().getTime() }, { merge: true });
            await db.collection('utenti').doc(pinKey).set({ testerGold: true, goldMode: true, history: dbUsers[pinKey].history, progress: dbUsers[pinKey].progress }, { merge: true });
        }

        // Persistiamo anche in locale e aggiorniamo la classifica
        try { await saveMasterDB(); } catch(e) { console.warn('saveMasterDB after tester gold failed', e); }

        // Aggiorna UI e tema
        calcStats();
        initTheme();

        // Ridisegna la sezione corrente
        if (localStorage.getItem('currentSection') === 'classifica') renderGlobalClassifica();
        else showHome();

    } catch (e) {
        console.error("Errore Debug:", e);
    }
}


function initTheme() {
    // 1. Gestione Light/Dark standard
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
    
    // 2. Gestione Gold: leggi da state.isPerfect (caricato in window.onload da Firebase)
    // Per tester: localStorage sincronizzato con Firebase in window.onload
    // Per utenti normali: state.isPerfect è il flag di goldMode da Firebase
    const userGold = !!state.isPerfect;
    // È gold se: l'utente è nel goldMode
    let isGold = userGold;

    if (isGold) {
        document.body.classList.add('gold-theme');
        document.documentElement.setAttribute('data-theme-gold', 'true');
    } else {
        document.body.classList.remove('gold-theme');
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
    // Se l'utente è il tester, salva lo stato gold in locale
    if (state.isTester) {
    const isGoldActive = document.body.classList.contains('gold-theme');
    state.theme = isGoldActive ? 'gold' : 'normal'; // aggiorna memoria
    localStorage.setItem('testerGold', isGoldActive); // salva stato
    
    // Salva anche su Firebase
    db.collection('utenti').doc(state.currentPin).set({ testerGold: isGoldActive }, { merge: true });
    state.testerGoldChanged = true; // blocca initTheme dal sovrascrivere il gold
}
}

function updateNav(showBack, backTarget) {
    const b = document.getElementById('back-nav');
    const r = document.getElementById('right-nav');
    b.innerHTML = showBack ? `<span class="back-link" onclick="${backTarget}">\u2039 Indietro</span>` : "";
    r.innerHTML = state.mode ? `<span class="logout-link" onclick="logout()">Esci</span>` : "";

    // Mantieni il tester toggle flottante aggiornato
    try { renderTesterToggle(); } catch(e) {}
}

let _saveDebounce = null;
async function saveMasterDB() {
    // 1. Prepariamo l'oggetto utente con i dati più recenti
    if (state.mode === 'user' && state.currentPin && dbUsers[state.currentPin]) {
        dbUsers[state.currentPin].progress = state.progress || {};
        dbUsers[state.currentPin].history = state.history || {};
        dbUsers[state.currentPin].ripasso = state.ripasso || { wrong: [], notStudied: [] };
        dbUsers[state.currentPin].activeProgress = state.activeProgress || {};
        
        // 🏆 SALVA STATO GOLD PER UTENTI NORMALI
        dbUsers[state.currentPin].goldMode = state.isPerfect || false;
        
        // Persistiamo sempre anche la copia locale per resilienza offline (IMMEDIATO)
        try { localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers)); } catch(e) { console.warn('local persistence failed', e); }

        // --- SALVATAGGIO SU GOOGLE (CLOUDFLARE) ---
        if (_saveDebounce) clearTimeout(_saveDebounce);
        _saveDebounce = setTimeout(async () => {
            try {
                // Usiamo 'set' con 'merge: true' per non sovrascrivere accidentalmente tutto il profilo
                await db.collection("utenti").doc(state.currentPin).set(dbUsers[state.currentPin], { merge: true });
                if (interactionLogging) console.log("Sincronizzazione Cloud completata per:", state.currentPin);
                
                // Sincronizzazione esplicita stato Gold per classifica
                const stats = calcStats();
                await db.collection("classifica").doc(state.currentPin).set({
                    perfect: stats.isPerfect ? 1 : 0,
                    points: stats.correct,
                    name: dbUsers[state.currentPin].name
                }, { merge: true });

                // Aggiorniamo anche la classifica globale ogni volta che salviamo i progressi
                await updateGlobalLeaderboard();
            } catch (error) {
                console.error("Errore durante il salvataggio Cloud:", error);
            }
        }, 1000);
    }
}

// La funzione `syncToFirebase` rimossa: non veniva usata.


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

            <form id="pin-form" onsubmit="event.preventDefault(); ${action}" style="width:100%; display:flex; flex-direction:column; gap:10px; align-items:center">
                ${nameField}

                <input type="password" id="reg-pin" class="btn-apple" 
                    style="text-align:center; font-size:24px; letter-spacing:8px; width:100%; box-sizing:border-box; border:none; outline:none; display:block;" 
                    maxlength="4" inputmode="numeric" placeholder="PIN" autocomplete="one-time-code">

                <button type="submit" class="btn-apple btn-primary" style="margin-top:6px; width:100%;">
                    Conferma
                </button>
            </form>
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
    const errorMsgEl = document.getElementById('pin-error'); 
    
    const name = nameEl.value.trim();
    const pin = pinEl.value.trim();

    if (errorMsgEl) {
        errorMsgEl.textContent = "";
        errorMsgEl.style.display = "none";
    }

    if (name.length < 2 || pin.length < 4) {
        if (errorMsgEl) {
            errorMsgEl.textContent = "Inserisci un nome di almeno 2 lettere e un PIN di 4 cifre.";
            errorMsgEl.style.display = "block";
        }
        return;
    }

    if (isWeakPin(pin)) {
        if (errorMsgEl) {
            errorMsgEl.textContent = "PIN troppo semplice! Non usare sequenze o numeri ripetuti.";
            errorMsgEl.style.display = "block";
        }
        return;
    }

    try {
        // 1. CONTROLLO PIN: Ora basta verificare se esiste il documento.
        // Se non esiste, il PIN è libero (o perché mai usato o perché archiviato)
        const check = await db.collection("utenti").doc(pin).get();
        
        if (check.exists) {
            if (errorMsgEl) {
                errorMsgEl.textContent = "Questo PIN è già occupato.";
                errorMsgEl.style.display = "block";
            }
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
        
        // Imposta il PIN di sessione in modo coerente con il caricamento (usato in window.onload)
        localStorage.setItem('sessionPin', pin);

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

    const hashedInput = await sha256(pin);

    // 1. ACCESSO ADMIN (Locale + Cloud Sync)
    if (hashedInput === ADMIN_HASH) {
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

    // ACCESSO TESTER (non distruttivo)
    if (hashedInput === TESTER_HASH) {
        state.currentPin = pin;
        state.currentUser = 'Tester';
        state.mode = 'user';
        state.isTester = true;
        // assicurati che esista un profilo locale minimo
        if (!dbUsers[pin]) {
            dbUsers[pin] = { name: 'Tester', progress: {}, history: {}, activeProgress: {}, ripasso: { wrong: [], notStudied: [] } };
            localStorage.setItem('quiz_master_db', JSON.stringify(dbUsers));
        }
        // tenta di leggere lo stato gold dal cloud se presente
        try {
            const doc = await db.collection('utenti').doc(pin).get();
            if (doc.exists) {
                const cloudUser = doc.data();
                // non sovrascrivere history/progress locale: unisci campi non distruttivi
                dbUsers[pin] = Object.assign({}, dbUsers[pin], cloudUser);
                state.progress = dbUsers[pin].progress || {};
                state.history = dbUsers[pin].history || {};
                state.ripasso = dbUsers[pin].ripasso || { wrong: [], notStudied: [] };
                state.activeProgress = dbUsers[pin].activeProgress || {};
                state.isPerfect = !!(cloudUser.goldMode || cloudUser.testerGold);
            }
        } catch (e) { console.warn('tester cloud read failed', e); }

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
    // --- LOGIN ---
    // Nota: La registrazione è gestita da registerUser(), quindi qui gestiamo solo il login.
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

    // FIX: Carica lo stato Gold dal profilo utente O dalle statistiche (come in window.onload)
    const stats = calcStats();
    state.isPerfect = !!(dbUsers[pin].goldMode || dbUsers[pin].testerGold || stats.isPerfect);

    localStorage.setItem('sessionPin', pin);

    // Salvataggio immediato (ora saveMasterDB manderà tutto al Cloud)
    await saveMasterDB();
    showHome();
}




function setGuest() { 
    state.mode = 'guest'; state.progress = {}; state.history = {}; showHome(); 
}

async function showHome() {
    localStorage.setItem('currentSection', 'home');
    history.pushState({ view: 'home' }, '', window.location.href);
    calcStats(); // Aggiorna state.isPerfect basandosi sulla history attuale
    // mostra icona tester se sei il tester
    try { renderTesterDebug(); } catch(e) {}
    initTheme();
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
        <div class="lang-item profile-slot" onclick="renderGlobalClassifica()" style="background: rgba(255, 149, 0, 0.15) !important; border: 1px solid #ff9500 !important; color: #ff9500 !important; display: flex; align-items: center; justify-content: center; gap: 10px;">
          <img src="https://cdn-icons-png.flaticon.com/512/2817/2817958.png" width="22" style="filter: invert(58%) sepia(91%) saturate(2375%) hue-rotate(1deg) brightness(105%) contrast(105%);">
          <div style="font-weight:700; font-size:13px">CLASSIFICA</div>
        </div>

        <div class="lang-item profile-slot" onclick="renderAdminPanel()" style="background: #0a84ff; color: white;">
            <div style="font-weight:700; font-size:13px">PANNELLO ADMIN</div>
        </div>`;
    }

    html += `</div>`;
    document.getElementById('content-area').innerHTML = html;
}

function handleBackButtonSPA() {
  history.replaceState({ view: localStorage.getItem('currentSection') || 'home' }, '', window.location.href);

  window.addEventListener('popstate', (event) => {
    const lastView = event.state?.view || 'home';

    switch (lastView) {
      case 'home':
        showHome();
        break;
      case 'levels':
        const lang = localStorage.getItem('currentLang') || null;
        showLevels(lang);
        break;
      case 'quiz':
        const lvl = localStorage.getItem('quizLevel') || null;
        const index = localStorage.getItem('quizIndex') || null;
        startStep(localStorage.getItem('quizLang'), lvl);
        if (index !== null) state.qIndex = index;
        break;
      case 'profile':
        renderProfile();
        break;
      case 'ripasso':
        renderRipasso();
        break;
      case 'admin':
        renderAdminPanel();
        break;
      case 'classifica':
        renderGlobalClassifica();
        break;
      default:
        showHome();
    }
  });
}

// Chiamala subito dopo averla definita
handleBackButtonSPA();

function showLevels(lang) {
    localStorage.setItem('currentSection', 'levels');
    history.pushState({ view: 'levels' }, '', `#levels-${lang}`);
    localStorage.setItem('currentLang', lang);

    updateNav(true, "showHome()");
    try {
        // snapshot pre-render per debugging: calcola i segmenti attuali per il livello
        const segs = [];
        for (let s = 1; s <= 5; s++) segs.push(computeProgressSegments(lang, s));
        trackSnapshot('enter_levels', { lang, segs });
    } catch (e) { console.warn('enter_levels snapshot failed', e); }
    document.getElementById('app-title').innerText = lang;

    let html = "";
    // Fonte di verità: `state.progress` (evitiamo l'oggetto `state.user` non necessario)
    const comp = state.progress[lang] || 0;

    for (let i = 1; i <= 5; i++) {
        let label = (i === 5) ? "TEST OPERATIVO" : "Livello " + i;
        let isLocked = false;

        // 1. LOGICA BLOCCO
        if (state.mode === 'user') {
            if (i >= 4 && comp < 3 && !state.isTester) isLocked = true;
        }
        if (state.mode === 'admin' || state.mode === 'guest') isLocked = false;

        // 2. RECUPERO PROGRESSI
        let currentIdx = 0;
        if (state.mode === 'user' && dbUsers[state.currentPin]?.activeProgress) {
            currentIdx = dbUsers[state.currentPin].activeProgress[`${lang}_${i}`] || 0;
        }

        let totalExist = 0;
        let userCorrectUniques = 0;
        let userAttemptsUniques = 0;

        // FIX: Gestione unificata L1-L4 (domandaRepo) e L5 (challenges5) per calcolo barra
        let sourceArr = (domandaRepo[lang] && domandaRepo[lang]["L" + i]) ? domandaRepo[lang]["L" + i] : null;
        if (i === 5 && typeof challenges5 !== 'undefined' && challenges5[lang]) {
            sourceArr = challenges5[lang];
        }

        if (sourceArr) {
            totalExist = sourceArr.length;
            const key = `${lang}_${i}`;

            const u = dbUsers[state.currentPin];
            // Aggrega storico sia dalle chiavi per-livello che dallo storico per lingua (utile per L5)
            let historyAgg = [];
            if (u && u.history) {
                if (Array.isArray(u.history[key])) historyAgg = historyAgg.concat(u.history[key]);
                if (Array.isArray(u.history[lang])) historyAgg = historyAgg.concat(u.history[lang].filter(h => Number(h.lvl || h.level || 0) === i));
            }
            // MODIFICA: Contiamo i tentativi unici (risposte date) per la barra, e le corrette per il Gold
            const uniqueAttempts = new Set(historyAgg.map(h => h.q));
            const uniqueCorrect = new Set(historyAgg.filter(h => h && h.ok).map(h => h.q));
            
            userCorrectUniques = uniqueCorrect.size;
            userAttemptsUniques = uniqueAttempts.size;
        }

        // 3. LOGICA ORO: Si attiva SOLO se hai 10 corrette o sei Perfect.
        let isGoldPhase = (userCorrectUniques >= 10) || !!state.isPerfect;

        const seg = computeProgressSegments(lang, i);
        seg.isGoldPhase = isGoldPhase; // Sincronizza visualizzazione

        let displayTotal = isGoldPhase ? totalExist : 10;
        // MODIFICA: La barra mostra sempre i tentativi (avanzamento), a meno che non siamo in sessione attiva
        let displayCurrent = isGoldPhase ? userAttemptsUniques : (currentIdx > 0 ? currentIdx : Math.min(userAttemptsUniques, 10));

        seg.displayCurrent = displayCurrent;
        seg.displayTotal = displayTotal;

        // Calcolo percentuali per i segmenti (verde / oro)
        // Nota: seg è già calcolato sopra, ma displayCurrent in seg era basato sullo storico.
        // Lo abbiamo appena sovrascritto per la visualizzazione.

        // 4. HTML
        html += `
            <button class="btn-apple"
                ${isLocked ? 'disabled' : ''}
                onclick="startStep('${lang}', ${i})"
                style="display:block; text-align:left; padding:15px">

                <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                    <span>${label} ${isLocked ? '🔒' : ''}</span>
                    ${(state.mode === 'user' && !isLocked)
                        ? `<span style="font-size:12px; ${seg.isGoldPhase ? 'color:#d4af37; font-weight:bold;' : 'opacity:0.6;'}">${seg.displayCurrent}/${seg.displayTotal}</span>`
                        : ''}
                </div>

                ${(state.mode === 'user' && !isLocked)
                                ? (seg.isGoldPhase
                                    ? (() => {
                                        const g = (typeof seg.greenPct === 'number' && isFinite(seg.greenPct)) ? Math.max(0, Math.min(100, seg.greenPct)) : 0;
                                        const o = (typeof seg.goldPct === 'number' && isFinite(seg.goldPct)) ? Math.max(0, Math.min(100, seg.goldPct)) : 0;
                                        return `<div class="progress-split" aria-hidden="true" style="height:6px;">
                                                   <div class="progress-seg-green" style="width:${g}%; border-radius:6px 0 0 6px"></div>
                                                   ${(() => {
                                                       const goldActive = (typeof seg.goldCount === 'number' && seg.goldCount > 0) && (seg.greenCount >= 15 || state.isPerfect);
                                                       const goldClass = 'progress-seg-gold ' + (goldActive ? 'glow active' : 'inactive');
                                                       return `<div class="${goldClass}" style="width:${o}%; border-radius:0 6px 6px 0"></div>`;
                                                   })()}
                                               </div>`
                                      })()
                                    : (() => {
                                        const denom = (seg.displayTotal && seg.displayTotal > 0) ? seg.displayTotal : 10;
                                        const pct = (seg.displayCurrent && denom) ? Math.round((seg.displayCurrent / denom) * 100) : 0;
                                        return `<div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px; overflow:hidden">
                                                   <div style="width:${pct}%; height:100%; background:var(--accent); border-radius:10px; transition:width 0.3s"></div>
                                               </div>`
                                      })())
                    : ''}
            </button>`;
    }

    document.getElementById('content-area').innerHTML = html;
}


/* Rimosso: versione vecchia/commentata di showLevels() per pulizia; la funzione attiva è mantenuta sopra. */

function startStep(lang, lvl) {
    localStorage.setItem('currentSection', 'quiz');
    history.pushState({ view: 'quiz' }, '', `#quiz-${lang}-${lvl}`);
    // Mostra sempre tasto esci
    updateNav(true, "showLevels('" + lang + "')");

    // Controllo livello 5 utente
    if(lvl === 5 && state.mode === 'user' && (state.progress[lang] || 0) < 3 && !state.isTester) return;
    if(lvl === 5) { renderL5(lang); return; }
    
    const key = "L" + lvl;
    const stringhe = domandaRepo[lang][key];
    const storageKey = `${lang}_${lvl}`;
    let isGoldRound = false;

    let selezione;
    if (state.mode === 'user' && dbUsers[state.currentPin].savedQuizzes?.[storageKey] && Array.isArray(dbUsers[state.currentPin].savedQuizzes[storageKey]) && dbUsers[state.currentPin].savedQuizzes[storageKey].length > 0) {
        selezione = dbUsers[state.currentPin].savedQuizzes[storageKey];
        // FIX PERSISTENZA: Se carichiamo un quiz salvato, dobbiamo capire se era un round Gold
        // Se il livello è già segnato come completato (>= lvl), allora stiamo facendo la fase Gold/Ripasso
        const comp = state.progress[lang] || 0;
        if (comp >= lvl) {
             // Se stiamo riprendendo un livello già fatto, è un Gold Round
             isGoldRound = true;
        }
    } else {
        // 1. Identifichiamo le domande già indovinate per non ripeterle nella fase Oro
        const historyLang = state.history ? state.history[lang] || [] : [];
        const historyLivello = historyLang.filter(h => Number(h.lvl || h.level || 0) === lvl);
        const giaIndovinate = new Set(historyLivello.filter(h => h.ok).map(h => h.q));

        // 2. Filtriamo il database: se il livello è già superato, prendiamo solo le "nuove"
        const comp = state.progress[lang] || 0;
        let sorgente = [...stringhe];
        // FIX ENDGAME: Avvia fase Gold solo se il livello è finito E siamo in Endgame (tutti i linguaggi finiti)
        if (comp >= lvl && isEndgameReached()) {
            const rimanenti = stringhe.filter(s => !giaIndovinate.has(s.split("|")[0]));
            if (rimanenti.length > 0) {
                sorgente = rimanenti;
                // Se stiamo caricando domande rimanenti e il totale supera 15, siamo nel round Gold
                if (stringhe.length > 10) isGoldRound = true;
            }
        }

        // 3. Mescoliamo e creiamo la selezione (massimo 10 per base)
        const rimescolate = sorgente.sort(() => 0.5 - Math.random());
        selezione = rimescolate.slice(0, 10).map(r => {
            const p = r.split("|");
            
            // Mescolamento opzioni (già risolto)
            let opts = [{ t: p[1], id: 0 }, { t: p[2], id: 1 }, { t: p[3], id: 2 }];
            opts.sort(() => 0.5 - Math.random());
            
            return { 
                q: p[0], 
                options: opts.map(o => o.t), 
                correct: opts.findIndex(o => o.id === 0), 
                exp: p[5] 
            };
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

    session = { lang: lang, lvl: lvl, q: selezione, idx: savedIdx, correctCount: 0, isGoldRound: isGoldRound };
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

    // SAFETY CHECK: Se non esistono sfide per questa lingua
    if (!sfide || sfide.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="text-align:center; padding:40px;">
                <h2 style="color:#ff3b30">Nessuna sfida disponibile</h2>
                <p>Le sfide per ${lang} sono in arrivo.</p>
                <button class="btn-apple" onclick="showLevels('${lang}')" style="margin-top:20px">Torna indietro</button>
            </div>`;
        return;
    }

    // Se è il tester e perfetto, impostiamo l'indice in base allo storico
// tester-specific L5 handling removed

    // CAP LIMIT: 15 domande totali (10 Base + 5 Gold)
    const CAP_LIMIT = 15;

    // STOP 1: Se abbiamo finito le domande disponibili o raggiunto il limite di 15
    if (!sfide || index >= sfide.length || index >= CAP_LIMIT) {
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
    
    // --- LOGICA BARRA E CONTATORE ---
    // Determiniamo se siamo in fase Gold (oltre la 10 o utente perfetto)
    const isGoldPhase = (index >= 10) || state.isPerfect;
    
    // Totale visualizzato: 10 se base, 15 se gold
    const displayTotal = isGoldPhase ? CAP_LIMIT : 10;
    const displayIndex = index + 1;
    
    // Stile contatore
    let counterStyle = "opacity:0.7";
    if (isGoldPhase && index >= 10) {
        counterStyle = "color:#d4af37; font-weight:bold; text-shadow:0 0 10px rgba(212,175,55,0.3)";
    }

    let htmlBar = '';
    const barTotal = 15; 
    const baseline = 10;

    if (isGoldPhase) {
        const extra = barTotal - baseline; // 5
        const greenSegWidth = (baseline / barTotal) * 100; // 66.6%
        const goldSegWidth = (extra / barTotal) * 100; // 33.3%
        
        let greenFill = 100;
        let goldFill = 0;
        
        if (index >= baseline) {
            goldFill = ((index - baseline) / extra) * 100;
        }
        
        htmlBar = `
        <div class="progress-split" style="height:8px; margin-bottom:20px; background:rgba(120,120,128,0.1); border-radius:8px; overflow:hidden;">
            <div style="width:${greenSegWidth}%; height:100%; display:flex; border-right:1px solid rgba(255,255,255,0.2)">
                 <div style="width:${greenFill}%; background:var(--apple-green); height:100%; transition:width 0.3s;"></div>
            </div>
            <div style="width:${goldSegWidth}%; height:100%; display:flex;">
                 <div class="progress-seg-gold ${goldFill>0?'glow active':''}" style="width:${goldFill}%; height:100%; transition:width 0.3s;"></div>
            </div>
        </div>`;
    } else {
        // Fase Verde (0-9)
        let percentL5 = (index / 10) * 100;
        const barColor = 'var(--apple-green)'; 
        
        htmlBar = `
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:10px; margin-bottom:20px; overflow:hidden">
            <div style="width:${percentL5}%; height:100%; background:${barColor}; transition:width 0.3s ease"></div>
        </div>`;
    }

    container.innerHTML = `
        <div class="glass-card" style="padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
    <h2 style="font-size:18px; margin:0">ESAME ${lang.toUpperCase()}</h2>
    <span style="font-size:12px; ${counterStyle}">${displayIndex}/${displayTotal}</span>
</div>

${htmlBar}

            
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
        consoleRes.innerText = sfida.output;
        consoleRes.style.color = "#34c759";
        fb.innerHTML = `<b style="color:#34c759">✓ Esatto!</b>`;
        // AGGIUNGI QUESTO BLOCCO PER IL SALVATAGGIO PARZIALE
        if (state.mode === 'user') {
            const storageKey = `${lang}_5`;
            if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
            // Salviamo che l'utente deve riprendere dalla sfida successiva
            dbUsers[state.currentPin].activeProgress[storageKey] = index + 1;

            // Se è l'ultima sfida, allora abbiamo completato il livello 5: persistiamo sia in state che in dbUsers
            // FIX: Completamento anche al raggiungimento della decima domanda (index 9)
            if (index === 9 || index === challenges5[lang].length - 1) {
                state.progress[lang] = 5;
                if (!dbUsers[state.currentPin].progress) dbUsers[state.currentPin].progress = {};
                dbUsers[state.currentPin].progress[lang] = 5;
                
                // Se abbiamo finito tutto (ultima domanda), azzeriamo activeProgress
                if (index === challenges5[lang].length - 1) {
                    dbUsers[state.currentPin].activeProgress[storageKey] = 0;
                    if (dbUsers[state.currentPin].savedQuizzes) delete dbUsers[state.currentPin].savedQuizzes[storageKey];
                }
            }

            // CONTROLLO SUONI (Livello o Gold)
            if (index === 9) playSound('level');
            if (index === 14 && !state.isPerfect) {
                playSound('gold');
            }

            // STORICO
            const u = dbUsers[state.currentPin];
            if (u) {
                if (!u.history) u.history = {};
                if (!u.history[lang]) u.history[lang] = [];
                if (!u.history[`${lang}_5`]) u.history[`${lang}_5`] = [];

                const histEntry = {
                    id: `${lang}_5_${index}`,
                    q: sfida.task,
                    question: sfida.task,
                    userAnswer: sfida.output || null,
                    correctAnswer: sfida.output || null,
                    ok: true,
                    level: 5,
                    lvl: 5,
                    timestamp: Date.now()
                };

                // evita duplicati identici (stesso q e userAnswer)
                if (!u.history[lang].some(h => h.q === histEntry.q && h.userAnswer === histEntry.userAnswer)) u.history[lang].push(histEntry);
                if (!u.history[`${lang}_5`].some(h => h.q === histEntry.q && h.userAnswer === histEntry.userAnswer)) u.history[`${lang}_5`].push(histEntry);

                // CONTROLLO GOLD PER L5
                if (!state.isPerfect) {
                    const stats = calcStats();
                    if (stats.isPerfect) {
                        state.isPerfect = true;
                        const now = new Date().toISOString();
                        db.collection("utenti").doc(state.currentPin).set({ goldMode: true, goldDate: now }, { merge: true });
                        if(dbUsers[state.currentPin]) dbUsers[state.currentPin].goldDate = now;
                        triggerGoldTransition(); // ANIMAZIONE L5
                    }
                }
            }
            saveMasterDB();
        }

        // Tasto per andare avanti
        const nextIndex = index + 1;
        // Calcolo label bottone coerente con il render
        const isGoldPhase = (nextIndex >= 10) || state.isPerfect;
        const displayTotal = isGoldPhase ? 15 : 10;

        btnContainer.innerHTML = `
            <button class="btn-apple" onclick="renderL5('${lang}', ${index + 1})" style="background:#34c759; color:white; width:100%; font-weight:bold">
                Prossima Sfida (${nextIndex + 1}/${displayTotal}) →
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
    
    // Calcolo Totale Domande Esistenti per questo livello
    let totalExist = 15; // Target per il perfetto (10 Basic + 5 Gold)
    if (domandaRepo[session.lang] && domandaRepo[session.lang][`L${session.lvl}`]) {
        // totalExist = domandaRepo[session.lang][`L${session.lvl}`].length; // Vecchia logica DB completo
    }

    let htmlBar = '';

    // Se ci sono domande extra (Gold) E (siamo nella fase Gold o Tester), usiamo la barra segmentata
    if (session.isGoldRound || (state.isTester && state.isPerfect)) {
        const baseline = 10;
        const extra = totalExist - baseline;
        
        // Percentuali di larghezza dei due contenitori (Verde vs Oro)
        const greenSegWidth = (baseline / totalExist) * 100;
        const goldSegWidth = (extra / totalExist) * 100;
        
        // Percentuali di riempimento interno
        let greenFill = 0;
        let goldFill = 0;

        // Fase Oro: Verde pieno, Oro avanza
        greenFill = 100;
        goldFill = state.isPerfect ? 100 : (session.idx / session.q.length) * 100; 

        htmlBar = `
        <div class="progress-split" style="height:8px; margin-bottom:15px; background:rgba(120,120,128,0.1); border-radius:8px; overflow:hidden;">
            <div style="width:${greenSegWidth}%; height:100%; display:flex; border-right:1px solid rgba(255,255,255,0.2)">
                 <div style="width:${greenFill}%; background:var(--apple-green); height:100%; transition:width 0.3s;"></div>
            </div>
            <div style="width:${goldSegWidth}%; height:100%; display:flex;">
                 <div class="progress-seg-gold ${goldFill>0?'glow active':''}" style="width:${goldFill}%; height:100%; transition:width 0.3s;"></div>
            </div>
        </div>`;
    } else {
        // Barra classica per livelli standard o fase normale di livelli Gold
        let progress = (session.idx / session.q.length) * 100;
        
        // FIX: Se il livello è già completato, la barra resta piena (100%)
        if ((state.progress[session.lang] || 0) >= session.lvl) {
            progress = 100;
        }

        // Se è un livello Gold in fase normale, usiamo il verde per coerenza
        const barColor = (totalExist > 10) ? 'var(--apple-green)' : 'var(--accent)';
        htmlBar = `
        <div style="width:100%; height:4px; background:rgba(120,120,128,0.1); border-radius:10px; margin-bottom:15px">
            <div style="width:${progress}%; height:100%; background:${barColor}; border-radius:10px; transition:0.3s"></div>
        </div>`;
    }

    const container = document.getElementById('content-area');
    if (!container) return;

    // GESTIONE LIVELLO COMPLETATO (Barra Piena)
    if (session.idx >= session.q.length) {
        container.innerHTML = `
            <div class="glass-card" style="text-align:center; padding:30px;">
                <h2 style="color:var(--apple-green); margin-bottom:10px">Livello Completato!</h2>
                <div style="width:100%; height:6px; background:rgba(120,120,128,0.1); border-radius:10px; margin:20px 0; overflow:hidden">
                    <div style="width:100%; height:100%; background:var(--apple-green); border-radius:10px"></div>
                </div>
                <p style="opacity:0.8; font-size:14px">Hai risposto a tutte le domande di questa sessione.</p>
                <div style="display:flex; gap:10px; margin-top:25px; justify-content:center">
                    <button class="btn-apple" onclick="restartLevel()">Ricomincia</button>
                    <button class="btn-apple btn-primary" onclick="showLevels('${session.lang}')">Torna ai livelli</button>
                </div>
            </div>`;
        return;
    }

     // Calcolo testo contatore dinamico
    let textCurrent = session.idx + 1;
    let textTotal = 10; // Base
    let counterStyle = "opacity:0.5"; // Stile standard

    if (session.isGoldRound) {
        // Fase Gold: siamo oltre le 10, quindi sommiamo la base (10) all'indice corrente
        textCurrent = 10 + session.idx + 1;
        textTotal = 15; // Target Gold
        counterStyle = "color:#d4af37; font-weight:bold; text-shadow:0 0 10px rgba(212,175,55,0.3)";
    } else if (session.isRetry) {
        textCurrent = (session.baseOffset || 0) + session.idx + 1;
        textTotal = 15;
        counterStyle = "color:#d4af37; font-weight:bold;";
    }

    // FIX: Se l'utente è già Perfect (Gold), forziamo il contatore al massimo per evitare "16/15"
    if (state.isPerfect) {
        textCurrent = 15;
        textTotal = 15;
        counterStyle = "color:#d4af37; font-weight:bold; text-shadow:0 0 10px rgba(212,175,55,0.3)";
    } else if (textCurrent > textTotal) {
        // Safety cap
        textCurrent = textTotal;
    }

    // Intestazione Livello
    const headerHtml = `<div style="text-align:center; font-size:13px; font-weight:700; opacity:0.6; margin-bottom:4px; text-transform:uppercase; letter-spacing:1px">Livello ${session.lvl}</div>`;

    container.innerHTML = `
        <div style="width:100%; margin-bottom:15px">
            ${headerHtml}
            <div style="display:flex; justify-content:center; font-size:12px; ${counterStyle}; margin-bottom:8px">
                <span>DOMANDA ${textCurrent}/${textTotal}</span>
            </div>
            ${htmlBar}
        </div>
        <h2 style="font-size:18px; margin-bottom:20px">${data.q}</h2>
        <div id="opts" style="width:100%">
            ${data.options.map((o, i) => {
                // Fix: escape anche backslash e newline per evitare SyntaxError
                const safeOption = o.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n').replace(/\r/g, '');
                return `<button id="btn-opt-${i}" class="btn-apple" onclick="check(${i === data.correct}, '${safeOption}')">${o}</button>`;
            }).join('')}
        </div>
        <div id="fb"></div>
        <div style="margin-top:10px; text-align:right">
            <button class="btn-apple btn-info" onclick="markNotStudied(${session.idx})">Non l'ho studiato</button>
        </div>`;
}

// Funzione per ricominciare il livello da zero
function restartLevel() {
    session.idx = 0;
    session.correctCount = 0;
    saveMasterDB();
    renderQ();
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
        q: data.q,
        question: data.q,
        userAnswer: null,
        correctAnswer: data.options[data.correct],
        ok: false,
        isNotStudied: true, // Questo attiva il blu nel renderProfile
        level: session.lvl,  // Indica a quale barra aggiungere il blu
        lvl: session.lvl,     // Doppia sicurezza
        exp: data.exp,
        timestamp: Date.now()
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
        const historyEntry = {
            q: data.q,
            question: data.q,
            userAnswer: userAnsText || (isOk ? data.options[data.correct] : 'Sbagliata'),
            correctAnswer: data.options[data.correct],
            ok: isOk,
            exp: data.exp,
            level: session.lvl,
            lvl: session.lvl,
            isNotStudied: false
        };
        state.history[session.lang].push(historyEntry);
        // aggiorna contatore sessione per capire se l'utente ha fatto 15/15
        if (session && typeof session.correctCount === 'number') {
            if (isOk) session.correctCount = (session.correctCount || 0) + 1;
        }
        
        // --- LOGICA GOLD ---
        // Se l'utente non è ancora gold, controlla se lo diventa
        if (!state.isPerfect) {
            const stats = calcStats(); 
            if (stats.isPerfect) {
                state.isPerfect = true;
                triggerGoldTransition(); // ANIMAZIONE QUIZ NORMALE
                const now = new Date().toISOString();
                // 🏆 SALVA STATO GOLD SU FIREBASE IMMEDIATAMENTE (PERMANENTE)
                db.collection("utenti").doc(state.currentPin).set({
                    goldMode: true,
                    goldDate: now
                }, { merge: true }).catch(e => console.error("Errore salvataggio goldMode:", e));
                if(dbUsers[state.currentPin]) dbUsers[state.currentPin].goldDate = now;
            }
        }
        // Se è già gold, non fare nulla (rimane gold per sempre)
        // ---------------------------
        // Aggiorna progresso attivo (salva indice successivo) così la barra resta nello stato corretto
        try {
            const storageKey = `${session.lang}_${session.lvl}`;
            if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
            dbUsers[state.currentPin].activeProgress[storageKey] = session.idx + 1;
        } catch (e) { /* ignore */ }

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
    
    // EVIDENZIA RISPOSTA GIUSTA SE SBAGLIATO
    if (!isOk) {
        const correctBtn = document.getElementById(`btn-opt-${data.correct}`);
        if (correctBtn) correctBtn.classList.add('correct-highlight');
    }

    // Fix: check for elements existence to prevent crash during rapid navigation
    const optsEl = document.getElementById('opts');
    if (optsEl) optsEl.style.pointerEvents = "none";
    
    const fbEl = document.getElementById('fb');
    if (fbEl) {
        fbEl.innerHTML = `
        <div class="feedback-box ${isOk?'correct':'wrong'}" style="width:100%; margin: 15px 0; padding: 15px; box-sizing: border-box; border-radius: 14px;">
            <strong style="display: block; margin-bottom: 8px;">${isOk?'Giusto!':'Sbagliato'}</strong>
            <p style="margin-bottom: 15px; font-size: 14px; line-height: 1.4;">${data.exp}</p>
            <button class="btn-apple btn-primary" style="width:100%; margin:0;" onclick="next()">Continua</button>
        </div>`;
    }
}


function next() {
    session.idx++; 
    if(session.idx < session.q.length) {
        renderQ(); 
    } else { 
        if (state.mode === 'user') {
            const lang = session.lang;
            const lvl = session.lvl;
            const sk = `${lang}_${lvl}`;

            // Calcola quante risposte corrette uniche abbiamo per questo livello
            const u = dbUsers[state.currentPin];
            // Aggrega storico per livello: voci sia sotto la chiave per-livello sia nello storico per lingua
            let historyAgg = [];
            if (u && u.history) {
                if (Array.isArray(u.history[sk])) historyAgg = historyAgg.concat(u.history[sk]);
                if (Array.isArray(u.history[lang])) historyAgg = historyAgg.concat(u.history[lang].filter(h => Number(h.lvl || h.level || 0) === Number(lvl)));
            }
            const uniqueCorrect = new Set(historyAgg.filter(h => h && h.ok).map(h => h.q));
            // numero totale esistente per il livello
            let totalExist = 15;
            if (domandaRepo[lang] && domandaRepo[lang][`L${lvl}`]) totalExist = domandaRepo[lang][`L${lvl}`].length; 

            const baseline = 10; // Base completamento
            // Green Complete: sessione baseline finita con successo
            const wasBaseline = session.q && session.q.length === baseline;
            const greenComplete = wasBaseline && session.correctCount === session.q.length;

            // 1. COMPLETAMENTO VERDE (Sblocco Livello + Suono Level)
            // MODIFICA: Il livello si completa SEMPRE se il quiz è finito (session.idx >= length),
            // indipendentemente dalle risposte corrette.
            if (true) { 
                // Aggiorna progresso se non già fatto
                if ((state.progress[lang] || 0) < lvl) {
                    state.progress[lang] = lvl;
                    if (!dbUsers[state.currentPin].progress) dbUsers[state.currentPin].progress = {};
                    dbUsers[state.currentPin].progress[lang] = state.progress[lang];
                    saveMasterDB();
                }
                // Suona 'level' (tranne se eravamo già in gold round)
                if (!session.isGoldRound) playSound('level');
            }

            // 2. TRANSIZIONE ORO (Attiva dopo le 10 base)
            // FIX ENDGAME: Passa a Gold solo se Endgame raggiunto
            // FIX 15: Si ferma se abbiamo già raggiunto 15 domande (10+5)
            if (greenComplete && uniqueCorrect.size < 15 && uniqueCorrect.size < totalExist) {
                const allStrings = domandaRepo[lang][`L${lvl}`] || [];
                const remaining = allStrings.filter(s => !uniqueCorrect.has(s.split('|')[0]));
                const rimescolate = remaining.sort(() => 0.5 - Math.random());
                const selezioneRestante = rimescolate.slice(0, 5).map(r => { // GOLD: 5 Domande
                    const p = r.split('|');
                    let opts = [{ t: p[1], id: 0 }, { t: p[2], id: 1 }, { t: p[3], id: 2 }];
                    opts.sort(() => 0.5 - Math.random());
                    return { q: p[0], options: opts.map(o => o.t), correct: opts.findIndex(o => o.id === 0), exp: p[5] };
                });

                if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};
                dbUsers[state.currentPin].savedQuizzes[sk] = selezioneRestante;
                session.q = selezioneRestante;
                session.idx = 0;
                session.correctCount = 0;
                session.isGoldRound = true;
                saveMasterDB();
                renderQ();
                return;
            }

            // 3. COMPLETAMENTO ORO (Suono Gold)
            // Se abbiamo finito tutto il DB e siamo in fase Gold
            if (uniqueCorrect.size >= 15 && session.isGoldRound) {
                playSound('gold');
            }

            // 4. CONCORRI PER IL GOLD (Endgame + Lacune)
            // Se siamo in Endgame, non siamo perfetti e ci sono ancora domande da fare
            if (isEndgameReached() && uniqueCorrect.size < totalExist && !state.isPerfect) {
                offerGoldRetry(lang, lvl);
                return; // Esce per non cancellare i progressi
            }

            // Ripristina stato di activeProgress e savedQuizzes per questo livello
            if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
            // MODIFICA: Non azzeriamo activeProgress qui. Rimane al massimo (es. 10) per mostrare la barra piena.
            // Verrà resettato solo entrando in una nuova sessione in startStep.
            if (dbUsers[state.currentPin].savedQuizzes) delete dbUsers[state.currentPin].savedQuizzes[sk];
            // Salva lo stato aggiornato (progress, history, activeProgress)
            saveMasterDB();
        }
        renderQ(); 
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
    
    // Reset completo dello stato per pulire residui (es. Gold Mode del Tester)
    state.isPerfect = false;
    state.isTester = false;
    state.history = {};
    state.progress = {};
    state.ripasso = { wrong: [], notStudied: [] };
    state.activeProgress = {};
    initTheme(); // Rimuove subito il tema Gold se attivo

    session = null; 
    
    // 3. Torna alla schermata di login
    renderLogin();

    // Rimuovi il toggle tester se presente
    try { renderTesterToggle(); } catch(e) {}
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
    let answeredUnique = 0; // Nuovo contatore per percentuale avanzamento
    Object.values(state.history || {}).forEach(arr => {
        arr.forEach(h => {
            tot++;
            if (h.ok) ok++;
        });
    });
    // Calcoliamo quante domande esistono in TUTTO il database
    // NUOVA LOGICA: 15 domande per livello per essere perfetto
    let totalLevelsCount = 0;
    let perfectLevelsCount = 0;
    
    const u = dbUsers[state.currentPin];
    
    Object.keys(domandaRepo).forEach(lang => {
        // Livelli 1-4
        for(let i=1; i<=4; i++) {
            totalLevelsCount++;
            if(u) {
                const seg = computeProgressSegments(lang, i);
                // Sommiamo i segmenti (che ora rappresentano risposte date)
                answeredUnique += (seg.greenCount + seg.goldCount);
                
                // Target fisso a 15 (10 Base + 5 Gold) come richiesto
                const target = Math.min(15, seg.totalExist || 15);
                if((seg.greenCount + seg.goldCount) >= target) perfectLevelsCount++;
            }
        }
        // Livello 5
        if(typeof challenges5 !== 'undefined' && challenges5[lang]) {
            totalLevelsCount++;
            if(u) {
                const seg = computeProgressSegments(lang, 5);
                // Per L5 usiamo 15 o la lunghezza reale se inferiore (safety check)
                const target = Math.min(15, challenges5[lang].length);
                if((seg.greenCount + seg.goldCount) >= target) perfectLevelsCount++;
            }
        }
    });
    
    const totalDomandeDatabase = totalLevelsCount * 15; // Approssimazione per la barra circolare

    const stats = {
        total: tot,
        correct: ok,
        wrong: tot - ok,
        // MODIFICA: La percentuale è basata su (Domande Fatte / Totale Database)
        perc: totalDomandeDatabase ? Math.round((answeredUnique / totalDomandeDatabase) * 100) : 0
    };

    // 🏆 UNA VOLTA RAGGIUNTO IL GOLD, NON SI PERDE PIÙ
    // Se l'utente è già in goldMode (salvato su Firebase), rimane gold
    // Il gold è permanente e non si può perdere
    if (state.isPerfect) {
        // Rimane gold: non ricalcolare come false
        stats.isPerfect = true;
    } else {
        // Non è ancora gold: controlla se ora lo raggiunge (100% di tutte le domande)
        stats.isPerfect = (totalLevelsCount > 0 && perfectLevelsCount >= totalLevelsCount);
    }
  
    stats.greenCorrect = Math.min(ok, totalDomandeDatabase);  // verde: fino al massimo normale
    stats.goldCorrect  = Math.max(ok - totalDomandeDatabase, 0);  // oro: extra perfetto
   
    return stats;
}

// Helper per verificare se tutti i linguaggi sono completati (Endgame)
function isEndgameReached() {
    if (!state.progress) return false;
    const langs = Object.keys(domandaRepo);
    return langs.every(l => (state.progress[l] || 0) >= 5);
}

// Restituisce le percentuali per i segmenti della barra (verde = baseline, oro = extra)
function computeProgressSegments(lang, level) {
    const key = `${lang}_${level}`;
    // Leggi da dbUsers per data persistence, non da state.history (sessione temporanea)
    const u = dbUsers[state.currentPin];
    // Aggrega le voci dallo storico sia per-key livello (es. CODING_5) sia dallo storico per lingua (es. CODING)
    let historyLevel = [];
    if (u && u.history) {
        if (Array.isArray(u.history[key])) historyLevel = historyLevel.concat(u.history[key]);
        if (Array.isArray(u.history[lang])) {
            historyLevel = historyLevel.concat(u.history[lang].filter(h => Number(h.lvl || h.level || 0) === Number(level)));
        }
    }
    const uniqueCorrect = new Set(historyLevel.filter(h => h && h.ok).map(h => h.q));
    const userCorrect = uniqueCorrect.size;

    let totalExist = 15; // Target standard
    if (level === 5) {
        if (challenges5 && challenges5[lang] && Array.isArray(challenges5[lang])) {
            totalExist = challenges5[lang].length;
        } else if (domandaRepo[lang] && domandaRepo[lang][`L${level}`]) {
            totalExist = domandaRepo[lang][`L${level}`].length;
        }
    } else {
        if (domandaRepo[lang] && domandaRepo[lang][`L${level}`]) totalExist = domandaRepo[lang][`L${level}`].length;
    }
    const baseline = 10;

    // comp indica quanti livelli completati per la lingua
    const comp = state.progress[lang] || 0;
    // FASE ORO: Attiva SOLO se Endgame raggiunto (tutti i linguaggi finiti) o utente perfetto
    const isGoldPhase = isEndgameReached() || !!state.isPerfect || (userCorrect >= baseline);

    if (!isGoldPhase) {
        const greenCount = Math.min(userCorrect, baseline);
        const greenPct = greenCount / baseline * 100;
        return { isGoldPhase: false, greenPct: greenPct, goldPct: 0, displayCurrent: userCorrect, displayTotal: baseline, greenCount: greenCount, goldCount: 0, totalExist: totalExist };
    }

    // Gold phase: container represents `totalExist` questions
    // In modalità gold consideriamo come "verde" fino al baseline e "oro" l'eccedenza;
    // ma se il totale esistente è minore del baseline (es. L5 con poche sfide) adattiamo il calcolo
    // Calcolo robusto dei conteggi: verde è al massimo il baseline o il totale esistente,
    // l'oro è l'eccedenza rispetto al baseline (se presente).
    // Per la visualizzazione barra, limitiamo il totale a 15 (10+5) come da logica punti
    // FIX: Se totalExist > 15, cappiamo comunque a 15 per la visualizzazione "Perfetto"
    const displayTotalCap = 15;
    const greenCount = Math.min(userCorrect, baseline);
    const goldCount = Math.min(Math.max(userCorrect - baseline, 0), 5);

    const greenPct = (greenCount / 15) * 100;
    const goldPct = (goldCount / 15) * 100;

    return { isGoldPhase: true, greenPct: greenPct, goldPct: goldPct, displayCurrent: userCorrect, displayTotal: displayTotalCap, greenCount: greenCount, goldCount: goldCount, totalExist: totalExist };
}

function toggleSecurity(el) {
    const content = el.nextElementSibling; // il div .security-content
    if (!content) return;
    content.style.display = content.style.display === 'none' ? 'flex' : 'none';
}

function renderProfile() {
    localStorage.setItem('currentSection', 'profile');
    history.pushState({ view: 'profile' }, '', window.location.href);
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

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const appleGray = isDark ? '#2c2c2e' : '#e5e5ea';

    // --- PULSANTE GOLD CARD (Se l'utente è Gold) ---
    let goldCardBtn = '';
    if (state.isPerfect) {
        goldCardBtn = `
        <div class="glass-card is-perfect-gold" onclick="openGoldCardModal()" style="cursor:pointer; text-align:center; padding:15px; margin-bottom:15px;">
            <div style="font-size:24px; margin-bottom:5px">🏆</div>
            <div class="gold-glow-text" style="font-weight:800; font-size:16px">VISUALIZZA LA TUA GOLD CARD 3D</div>
            <div style="font-size:11px; opacity:0.8; margin-top:4px">Tocca per ruotare e scaricare</div>
        </div>`;
    }

    // Calcolo aggregato per profilo: sommiamo green/gold su tutti i livelli/lingue
    let aggGreen = 0, aggGold = 0, aggTotal = 0;
    totalLevels.forEach(lang => {
        for (let i = 1; i <= 5; i++) {
            const seg = computeProgressSegments(lang, i) || {};
            aggGreen += seg.greenCount || 0;
            aggGold += seg.goldCount || 0;
            aggTotal += seg.displayTotal || 0; // FIX: Usa il target (15) invece del totale DB
        }
    });
    const aggPercent = aggTotal ? Math.round(((aggGreen + aggGold) / aggTotal) * 100) : 0;
    const greenLen = aggTotal ? (circumference * (aggGreen / aggTotal)) : 0;
    const goldLen = aggTotal ? (circumference * (aggGold / aggTotal)) : 0;
    // small separator length (in px) to create a visible gap between green and gold arcs
    const sep = Math.max(2, Math.round(circumference * 0.02));
    const goldLenAdj = Math.max(0, goldLen - sep);

    // No animated marker: we only render a simple static separator between green and gold.
    // (Previously there was a pulsing ring and burst here; removed per user request.)

    try { trackSnapshot('render_profile', { aggGreen, aggGold, aggTotal, aggPercent }); } catch(e) { console.warn('profile snapshot failed', e); }


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
    /* Scrollbar a pillola mini-invasiva */
    scrollbar-width: thin;
    scrollbar-color: rgba(120, 120, 128, 0.3) transparent;
    padding-right: 0;
}
/* Webkit (Chrome, Safari) */
.scrollable-content::-webkit-scrollbar { width: 4px; }
.scrollable-content::-webkit-scrollbar-track { background: transparent; }
.scrollable-content::-webkit-scrollbar-thumb { background-color: rgba(120, 120, 128, 0.3); border-radius: 10px; }
.scrollable-content::-webkit-scrollbar-button { display: none; }

/* Stile Pillola Flottante "Vai a..." */
.history-jump-pill {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px; font-weight: 700;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    opacity: 0; pointer-events: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 20; white-space: nowrap;
}
.history-jump-pill.visible {
    opacity: 1; pointer-events: auto;
    transform: translateX(-50%) scale(1);
}

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
    const totalQuestionsPerLevel = 15; // 10 Base + 5 Gold
    
    // Variabile per contare i "Non studiati" totali per la barra superiore
    let totalMarkedNotStudied = 0;

    totalLevels.forEach(lang => {
        progHtml += `<div style="margin-bottom:15px"><h4>${lang}</h4>`;
        for (let i = 1; i <= 5; i++) {
            // Calcolo statistiche uniche per la barra sovrapposta
            const historyLevel = (u.history && u.history[lang]) ? u.history[lang].filter(h => Number(h.lvl || h.level) === i) : [];
            
            const uniqueCorrect = new Set();
            const uniqueNotStudied = new Set();
            const uniqueWrong = new Set();

            // 1. Prima passata: Identifica le corrette (vincono su tutto)
            historyLevel.forEach(h => { if (h.ok) uniqueCorrect.add(h.q); });

            // 2. Seconda passata: Identifica Non Studiate (se non sono già corrette)
            historyLevel.forEach(h => { 
                if (!h.ok && h.isNotStudied && !uniqueCorrect.has(h.q)) uniqueNotStudied.add(h.q);
            });

            // 3. Terza passata: Identifica Sbagliate (se non sono corrette né non studiate)
            historyLevel.forEach(h => {
                if (!h.ok && !h.isNotStudied && !uniqueCorrect.has(h.q) && !uniqueNotStudied.has(h.q)) uniqueWrong.add(h.q);
            });

            const countCorrectTotal = uniqueCorrect.size;
            // FIX: Separiamo le corrette in Base (Verde) e Extra (Oro)
            const countGreen = Math.min(countCorrectTotal, 10);
            const countGold = Math.max(0, countCorrectTotal - 10);

            const countBlue = uniqueNotStudied.size;
            const countRed = uniqueWrong.size;
            
            // Aggiorna il contatore globale per la barra superiore (sommario)
            totalMarkedNotStudied += countBlue;

            // LOGICA 100% FISSO PER LIVELLI COMPLETATI
            // Se il livello è completato nel progresso utente, la barra deve essere piena (target = somma elementi)
            const isLevelDone = (u.progress[lang] || 0) >= i;
            const totalCount = countGreen + countGold + countBlue + countRed;
            let target = 15; // Target standard

            if (isLevelDone) {
                // Se completato, il target diventa esattamente quello che abbiamo, così la somma fa 100%
                target = totalCount > 0 ? totalCount : 1;
            }
            
            const pctGreen = (countGreen / target) * 100;
            const pctGold = (countGold / target) * 100;
            const pctBlue = (countBlue / target) * 100;
            const pctRed = (countRed / target) * 100;
            
            // Percentuale totale visualizzata nel testo (se completato forza 100%)
            const totalPercent = isLevelDone ? 100 : Math.min(Math.round(((countGreen + countGold + countBlue + countRed) / target) * 100), 100);

            // Posizioni cumulative per le etichette (fine di ogni barra)
            const posGreen = pctGreen;
            const posGold = pctGreen + pctGold;
            const posBlue = posGold + pctBlue;
            const posRed = posBlue + pctRed;

            progHtml += `
            <div style="margin-bottom:10px">
                <div style="font-size:13px; display:flex; justify-content:space-between">
                    <span>Livello ${i}</span>
                    <span style="opacity:0.7">${totalPercent}%</span>
                </div>
                
                <!-- Etichette percentuali sopra la barra (tranne l'ultima se arriva al 100%) -->
                <div style="position:relative; width:100%; height:14px; font-size:9px; font-weight:700; margin-bottom:0px">
                    ${(pctGreen > 0 && (pctGold > 0 || pctBlue > 0 || pctRed > 0)) ? `<div style="position:absolute; left:${posGreen}%; transform:translateX(${posGreen > 85 ? '-100%' : '-50%'}); color:var(--apple-green); bottom:0;">${Math.round(posGreen)}%</div>` : ''}
                    ${(pctGold > 0 && (pctBlue > 0 || pctRed > 0)) ? `<div style="position:absolute; left:${posGold}%; transform:translateX(${posGold > 85 ? '-100%' : '-50%'}); color:#d4af37; bottom:0;">${Math.round(posGold)}%</div>` : ''}
                    ${(pctBlue > 0 && pctRed > 0) ? `<div style="position:absolute; left:${posBlue}%; transform:translateX(${posBlue > 85 ? '-100%' : '-50%'}); color:#0a84ff; bottom:0;">${Math.round(posBlue)}%</div>` : ''}
                </div>

                <div style="width:100%; height:8px; background:rgba(120,120,128,0.1); border-radius:6px; overflow:hidden; display:flex; margin-top:4px">
                    <div style="width:${pctGreen}%; height:100%; background:var(--apple-green)"></div>
                    ${pctGold > 0 ? `<div class="progress-seg-gold active" style="width:${pctGold}%; height:100%"></div>` : ''}
                    <div style="width:${pctBlue}%; height:100%; background:#0a84ff"></div>
                    <div style="width:${pctRed}%; height:100%; background:#ff3b30"></div>
                </div>
            </div>`;
        }
        progHtml += `</div>`;
    });

    // Calcolo del potenziale totale (es. 15 domande * 5 livelli * numero lingue)
    const totalPotential = totalLevels.length * 5 * 15;

    document.getElementById('content-area').innerHTML = noScrollStyle + `
<div id="profile-scroll">
        <div class="profile-container" style="width:100%">
            <div class="glass-card" style="padding:15px; margin-bottom:10px; flex-direction:row; justify-content:space-between; align-items:center;">
                <div style="font-weight:700; font-size:16px">${escapeHtml(u.name)}</div>
                <div style="font-size:12px; opacity:0.6; font-family:monospace">ID: ${escapeHtml(u.userId)}</div>
            </div>
        </div>

        <!-- INSERIMENTO BOTTONE GOLD CARD -->
        ${goldCardBtn}

        <div class="glass-card">
            <strong>Statistiche</strong>
            <div style="margin-top:15px; display:flex; gap:20px; align-items:center">
                <div style="position:relative; width:80px; height:80px">
                    <svg width="80" height="80" style="transform:rotate(-90deg); color:var(--apple-green)">
                        <defs>
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <!-- Gradiente oro: parte scura per profondità, poi dorato brillante -->
                                <stop offset="0%" style="stop-color:#7a5310;stop-opacity:1" />
                                <stop offset="45%" style="stop-color:#d4af37;stop-opacity:1" />
                                <stop offset="75%" style="stop-color:#ffd966;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#fff5d0;stop-opacity:1" />
                            </linearGradient>
                            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <!-- background ring -->
                        <circle cx="40" cy="40" r="${radius}" stroke="${appleGray}" stroke-width="6" fill="none" opacity="0.14" />
                        <!-- green arc (uso currentColor che è impostato su --apple-green) -->
                        ${greenLen > 0 ? `<circle cx="40" cy="40" r="${radius}" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${greenLen} ${circumference - greenLen}" stroke-dashoffset="0" filter="none" style="filter:none;" stroke-opacity="1" />` : ''}
                        <!-- gold arc starting after green (with small gap): uso gradient dorato compatto + glow -->
                        ${goldLen > 0 ? `<circle cx="40" cy="40" r="${radius}" stroke="url(#goldGrad)" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${goldLenAdj} ${circumference - goldLenAdj}" stroke-dashoffset="${circumference - greenLen - sep}" />` : ''}
                        <!-- highlight sottile SOLO sopra l'oro (mix-blend normale, blur ridotto) -->
                        ${goldLen > 0 ? `<circle cx="40" cy="40" r="${radius}" stroke="rgba(255,255,255,0.12)" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-dasharray="${goldLenAdj} ${circumference - goldLenAdj}" stroke-dashoffset="${circumference - greenLen - sep}" style="filter: blur(1px); mix-blend-mode: normal;" />` : ''}
                        <!-- viscous sheen overlay (mirrors .progress-seg-gold::after) -->
                        ${goldLen > 0 ? `<circle class="arc-gold-sheen" cx="40" cy="40" r="${radius}" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${goldLenAdj} ${circumference - goldLenAdj}" stroke-dashoffset="${circumference - greenLen - sep}" />` : ''}
                        <!-- small separator between green and gold (static, rendered on top so it's visible) -->
                        ${ (greenLen > 0 && goldLen > 0) ? `<circle class="arc-separator" cx="40" cy="40" r="${radius}" stroke="${appleGray}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="${sep} ${circumference - sep}" stroke-dashoffset="${circumference - greenLen - (sep/2)}" stroke-opacity="0.9" />` : ''}
                        ${ (greenLen > 0 && goldLen > 0) ? `<circle class="arc-sep-highlight" cx="40" cy="40" r="${radius}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${sep} ${circumference - sep}" stroke-dashoffset="${circumference - greenLen - (sep/2)}" />` : ''}
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">${aggPercent}%</div>
                </div>
                <div style="flex:1; display:flex; flex-direction:column; gap:8px">
                    <div>
                        <div style="font-size:12px">Corrette: ${stats.correct}</div>
        <div style="height:8px; background:${appleGray}; border-radius:6px; display:flex; overflow:hidden;">
        <div style="width:${Math.min((stats.correct / totalPotential) * 100, 100)}%; height:100%; background:var(--apple-green); border-radius:6px 0 0 6px"></div>
        ${(() => {
            const goldActiveMain = (stats.goldCorrect && stats.goldCorrect > 0) || stats.isPerfect;
            const mainClass = 'progress-seg-gold ' + (goldActiveMain ? 'glow active' : 'inactive');
            const w = goldActiveMain ? (stats.isPerfect ? 100 : Math.min((stats.goldCorrect / totalPotential) * 100, 100)) : 0;
            return `<div class="${mainClass}" style="width:${w}%; height:100%; transition:0.5s"></div>`;
        })()}
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

        ${(isEndgameReached() && !state.isPerfect) ? (() => {
            const candidate = getNextGoldCandidate();
            if (!candidate) return '';
            return `
            <div class="glass-card" style="border:1px solid var(--gold-border); background:rgba(212,175,55,0.1); cursor:pointer" 
                onclick="offerGoldRetry('${candidate.lang}', ${candidate.lvl})">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <div>
                        <strong class="gold-glow-text">Concorri per il Gold</strong>
                        <div style="font-size:11px; opacity:0.8">Completa ${candidate.lang} L${candidate.lvl}</div>
                    </div>
                    <div class="btn-apple" style="width:auto; margin:0; padding:8px 16px; font-size:13px; background:var(--gold-gradient); color:#000; font-weight:700">Vai →</div>
                </div>
            </div>`;
        })() : ''}

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
    <div id="history-content" style="display:none; flex-direction:column; width:100%; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px; position:relative; min-height:150px">
        <div class="scrollable-content" style="width:100%" onscroll="handleHistoryScroll(this)">
            ${generateHistoryHTML(u)}
        </div>
        <div id="history-jump-pill" class="history-jump-pill" onclick="event.stopPropagation()"></div>
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

let historyScrollTimer;
window.handleHistoryScroll = function(el) {
    const pill = document.getElementById('history-jump-pill');
    if(!pill) return;
    
    // Nascondi mentre scorri (meno invasivo)
    pill.classList.remove('visible');
    
    clearTimeout(historyScrollTimer);
    historyScrollTimer = setTimeout(() => {
        updateHistoryPill(el, pill);
    }, 150); // Appare dopo che ti sei fermato
};

window.updateHistoryPill = function(container, pill) {
    // Trova tutti i possibili punti di ancoraggio (Lingue e Livelli)
    const targets = Array.from(container.querySelectorAll('[id^="hist-"]'));
    if(targets.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    // Cerchiamo il primo elemento che inizia "sotto" la metà della vista attuale
    const threshold = containerRect.top + (containerRect.height / 2); 
    
    const nextTarget = targets.find(t => t.getBoundingClientRect().top > threshold);

    if (nextTarget) {
        let label = "";
        if (nextTarget.id.startsWith('hist-head-')) {
            label = nextTarget.innerText; // Es: "Python"
        } else {
            const titleEl = nextTarget.querySelector('.history-level-title');
            label = titleEl ? titleEl.innerText : "Livello Successivo";
        }
        
        pill.innerHTML = `⬇ Vai a ${label}`;
        pill.onclick = (e) => { e.stopPropagation(); nextTarget.scrollIntoView({behavior: 'smooth', block: 'start'}); pill.classList.remove('visible'); };
        pill.classList.add('visible');
    }
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

function generateHistoryHTML(data) {
    let html = "";
    // Se passiamo l'intero oggetto utente prendiamo .history, altrimenti usiamo data
    const historyData = data.history ? data.history : data;

    // Recuperiamo le lingue disponibili (usiamo domandaRepo per l'ordine corretto se esiste)
    const repoLangs = typeof domandaRepo !== 'undefined' ? Object.keys(domandaRepo) : [];
    const historyLangs = Object.keys(historyData || {});
    // Uniamo le lingue: prima quelle del repo (ordinate), poi eventuali altre
    // FILTRO AGGIUNTO: Escludiamo le chiavi che finiscono con _numero (es. HTML_5, MySQL_4)
    const allLangs = [...new Set([...repoLangs, ...historyLangs])]
        .filter(l => historyData[l] && historyData[l].length > 0 && !/_\d+$/.test(l));

    allLangs.forEach(lang => {
        const langEntries = historyData[lang];
        
        // Header Lingua
        html += `<div class="history-topic" style="margin-bottom: 20px;">
                    <h4 id="hist-head-${lang}" style="margin: 0 0 10px 0; border-bottom: 1px solid rgba(120,120,128,0.2); padding-bottom: 5px; color: var(--accent); font-size: 16px;">${lang}</h4>`;

        // Iteriamo i livelli da 1 a 5
        for (let lvl = 1; lvl <= 5; lvl++) {
            const levelEntries = langEntries.filter(h => Number(h.lvl || h.level || 0) === lvl);
            
            if (levelEntries.length > 0) {
                // Rimuoviamo il box contenitore (background/border) per far espandere le card al 100% della larghezza
                // Aggiunto ID per lo scroll e scroll-margin-top per non finire sotto la barra sticky
                html += `<div id="hist-${lang}-${lvl}" class="history-level" style="background:transparent; border:none; padding:0; margin-bottom: 20px; scroll-margin-top: 50px;">
                            <div class="history-level-title" style="font-size: 13px; font-weight: 700; margin-bottom: 10px; opacity: 0.7; padding-left:4px; border-left: 3px solid var(--accent); line-height:1.2">Livello ${lvl}</div>`;
                
                // Renderizziamo le domande
                levelEntries.forEach((h, idx) => {
                    const status = h.ok ? "✅" : (h.isNotStudied ? "🟦" : "❌");
                    
                    let rispostaUtenteHtml = "";
                    if (!h.isNotStudied) {
                        let ansDisplay = h.userAnswer || '—';
                        // Se la risposta è il generico "OK" (tipico di HTML/MySQL L5), mostriamo un testo più elegante
                        if (ansDisplay === "OK") ansDisplay = "Eseguito con successo";
                        // Modifica colore: "Tua:" usa il colore del tema (tramite opacity), solo la risposta è colorata
                        rispostaUtenteHtml = `<div style="margin-top:2px; opacity:0.8">Tua: <span style="color:${h.ok ? '#34c759' : '#ff3b30'}; font-weight:600">${escapeHtml(ansDisplay)}</span></div>`;
                    }

                    html += `<div class="history-entry" style="margin-bottom: 10px; padding: 12px; background: rgba(120,120,128,0.06); border-radius: 12px; font-size: 13px; width:100%; box-sizing:border-box;">
                                <div style="font-weight: 600; margin-bottom: 4px;">${status} ${escapeHtml(h.question || h.q)}</div>
                                ${rispostaUtenteHtml}
                                ${!h.ok ? `<div style="opacity:0.6; margin-top:2px;">Corretta: ${escapeHtml(h.correctAnswer || '—')}</div>` : ''}
                             </div>`;
                });

                html += `</div>`; // Chiude livello
            }
        }

        html += `</div>`; // Chiude lingua
    });
    
    return html || "<div style='font-size:12px; opacity:0.6'>Nessun Storico</div>";
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
    history.pushState({ view: 'ripasso' }, '', window.location.href);
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
            
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 12px; color: var(--text-color);">${escapeHtml(d.q)}</div>
            
            <div style="margin-bottom: 12px;">
                ${d.options.map((opt, i) => {
                    let style = "padding: 8px; border-radius: 6px; margin-bottom: 4px; font-size: 13px; border: 1px solid rgba(120,120,120,0.2);";
                    if (i === d.correct) {
                        style += "background: rgba(52, 199, 89, 0.2); border-color: #34C759; font-weight: bold;";
                    }
                    return `<div style="${style}">${escapeHtml(opt)} ${i === d.correct ? '✅' : ''}</div>`;
                }).join('')}
            </div>

            ${d.exp ? `
                <div style="background: ${bgColor}; padding: 10px; border-radius: 8px; font-size: 12px; line-height: 1.4; color: var(--text-secondary);">
                    <strong>Spiegazione:</strong> ${escapeHtml(d.exp)}
                </div>` : ''}
        </div>`;
    };

    let html = `<div style="padding-bottom: 20px; width:100%">`;

    if (ripasso.wrong.length) {
        html += `
        <div class="glass-card" onclick="toggleCard(this)" style="cursor:pointer">
            <div style="font-weight:600; display:flex; justify-content:space-between; align-items:center">
                <span>SBAGLIATE DI RECENTE</span>
                <span style="font-size:12px; opacity:0.6; background:rgba(255,59,48,0.1); color:#ff3b30; padding:2px 8px; border-radius:10px">${ripasso.wrong.length}</span>
            </div>
            <div class="card-content" style="display:none; flex-direction:column; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">
                ${ripasso.wrong.map(d => createCard(d, 'wrong')).join('')}
            </div>
        </div>`;
    }

    if (ripasso.notStudied.length) {
        html += `
        <div class="glass-card" onclick="toggleCard(this)" style="cursor:pointer">
            <div style="font-weight:600; display:flex; justify-content:space-between; align-items:center">
                <span>DOMANDE "NON STUDIATE"</span>
                <span style="font-size:12px; opacity:0.6; background:rgba(10,132,255,0.1); color:#0a84ff; padding:2px 8px; border-radius:10px">${ripasso.notStudied.length}</span>
            </div>
            <div class="card-content" style="display:none; flex-direction:column; margin-top:15px; border-top:1px solid rgba(120,120,120,0.2); padding-top:15px;">
                ${ripasso.notStudied.map(d => createCard(d, 'notStudied')).join('')}
            </div>
        </div>`;
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
    history.pushState({ view: 'admin' }, '', window.location.href);
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

    html += `<div class="review-card is-ok" style="margin-bottom:16px; cursor:pointer" onclick="const s=document.getElementById('stats-container-${u.id}'); if(s && !event.target.closest('span')){ s.style.display=s.style.display==='none'?'block':'none'; }">
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
            <span style="cursor:pointer; color:${u.pinkMode ? '#ff69b4' : 'currentColor'}" title="Pink Mode (Ragazza)" onclick="event.stopPropagation(); adminTogglePinkMode(${u.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${u.pinkMode ? '#ff69b4' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </span>
            <span style="cursor:pointer; color:#ff9500" title="Reset progressi" onclick="event.stopPropagation(); adminResetSingleUser(${u.id})">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
               </span>
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
    Object.values(state.history || user.history || {}).forEach(arr => {
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

async function adminTogglePinkMode(userId) {
    const pin = Object.keys(dbUsers).find(key => dbUsers[key].userId == userId);
    if (!pin) return;
    
    const u = dbUsers[pin];
    const newVal = !u.pinkMode;
    
    try {
        await db.collection("utenti").doc(pin).update({ pinkMode: newVal });
        u.pinkMode = newVal;
        saveMasterDB();
        renderAdminPanel();
    } catch(e) {
        console.error(e);
        alert("Errore aggiornamento Pink Mode");
    }
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
                    ${status} Q${idx+1}: ${escapeHtml(h.question || h.q)}
                    <br><span style="color:${h.ok ? '#34c759' : '#ff3b30'}">Tua: ${escapeHtml(h.userAnswer || '—')}</span>
                    ${!h.ok ? `<br><em style="opacity:0.6">Corretta: ${escapeHtml(h.correctAnswer || h.correctAns || '—')}</em>` : ''}
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
                        ripasso: { wrong: [], notStudied: [] },
                        savedQuizzes: {} // FIX: Reset quiz salvati per tutti
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
    openModal(
        "Svuota Cestino",
        "Vuoi eliminare DEFINITIVAMENTE tutti gli utenti nella lista eliminati? Questa azione è irreversibile.",
        async () => {
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
    );
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
    openModal("Azzera statistiche", "Perderai tutte le statistiche, progressi E il tuo status GOLD. Questa azione è irreversibile.", async () => {
        // 1. Pulizia dati nello stato attuale
        state.progress = {};
        state.history = {};
        state.activeProgress = {};
        state.ripasso = { wrong: [], notStudied: [] };
        state.isPerfect = false;  // 🏆 TORNA UTENTE NORMALE

        // 2. Pulizia nell'oggetto database locale
        const u = dbUsers[state.currentPin];
        if (u) {
            u.progress = {};
            u.history = {};
            u.activeProgress = {};
            u.ripasso = { wrong: [], notStudied: [] };
            u.goldMode = false;  // 🏆 SALVA RESET GOLD
            u.savedQuizzes = {}; // FIX: Reset completo quiz salvati
        }

        // 3. Sincronizzazione con Google (Firebase)
        // Usiamo await per essere sicuri che i dati siano cancellati sul server
        // reset gold su Firebase
        if (!state.isTester) {
           await db.collection("utenti").doc(state.currentPin).set(
            { goldMode: false },
            { merge: true }
            );
        }
        await saveMasterDB(); 
        
        // 4. Rimuovi l'utente dalla classifica globale (opzionale, ma consigliato)
        try {
            await db.collection("classifica").doc(state.currentPin).delete();
        } catch(e) { console.log("Errore pulizia classifica"); }

        // 5. Aggiorna il tema (torna a normale)
        initTheme();
        
        // 6. Ricarica la pagina del profilo aggiornata
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
    // FIX: Usa l'ID corretto definito in index.html ('universal-modal')
    let overlay = document.getElementById('universal-modal');
    
    if(!overlay) {
        // Fallback creazione dinamica se manca nell'HTML
        overlay = document.createElement('div');
        overlay.id = 'universal-modal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" onclick="event.stopPropagation()">
                <h3 id="modal-title"></h3>
                <div id="modal-desc"></div>
                <button class="modal-btn btn-primary" id="modal-confirm-btn">Conferma</button>
                <button class="modal-btn btn-cancel">Annulla</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    const titleEl = document.getElementById('modal-title');
    // Supporta sia 'modal-desc' (HTML) che 'modal-body' (Legacy)
    const descEl = document.getElementById('modal-desc') || document.getElementById('modal-body');
    
    if(titleEl) titleEl.innerText = title;
    if(descEl) descEl.innerHTML = content;
    
    // Gestione bottoni: supporta ID HTML 'modal-confirm-btn' o legacy 'modal-confirm'
    let btnConfirm = document.getElementById('modal-confirm-btn') || document.getElementById('modal-confirm');
    // Cerca il tasto annulla dentro il modale corrente
    const btnCancel = overlay.querySelector('.btn-cancel') || document.getElementById('modal-cancel');
    
    overlay.style.display = 'flex';

    if (btnConfirm) {
        btnConfirm.innerText = "Conferma";
        // Clona il bottone per rimuovere vecchi event listener
        const newConfirm = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newConfirm, btnConfirm);
        
        newConfirm.onclick = () => { 
            if(onConfirm) onConfirm(); 
            overlay.style.display='none'; 
        };
    }

    if (btnCancel) {
        btnCancel.style.display = "inline-block";
        btnCancel.onclick = () => { overlay.style.display='none'; };
    }
}

async function renderGlobalClassifica() {
    localStorage.setItem('currentSection', 'classifica');
    history.pushState({ view: 'classifica' }, '', window.location.href);
    localStorage.setItem('currentSection', 'classifica');
    updateNav(true, "showHome()");
    document.getElementById('app-title').innerText = "TOP PLAYERS";
    
    // 1. DEFINIAMO IL CONTAINER
    const container = document.getElementById('content-area');
    container.innerHTML = `<div style="text-align:center; padding:20px">Caricamento classifica...</div>`;

    try {
        const snapshot = await db.collection("classifica").orderBy("points", "desc").limit(20).get();
        
        let html = `<div style="width:100%; display:flex; flex-direction:column; gap:10px">`;
        
        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
    
    if (doc.id === TESTER_PIN && !state.isTester) return;

    const isUtentePerfetto = data.perfect > 0; 
    const isMe = doc.id === state.currentPin;
    const isMeAndPerfect = isMe && isUtentePerfetto;
    if (isMe) {
    state.isPerfect = isUtentePerfetto; 
    initTheme(); 
    }

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
                <div class="${textClass}" style="font-size:16px; color: var(--text); display:flex; align-items:center; gap:5px">
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

// renderTesterDebug removed


      
async function adminResetSingleUser(userId) {
    const pin = Object.keys(dbUsers).find(key => dbUsers[key].userId == userId);
    const u = dbUsers[pin];
    if (!u) return;

    openModal(
        "Reset Singolo Utente",
        `Azzererai tutti i progressi di ${u.name} (compreso lo status GOLD se lo aveva). Il PIN rimarrà lo stesso, ma tornerà al livello 1.`,
        async () => {
            try {
                const updateData = {
                progress: {},
                history: {},
                activeProgress: {},
                ripasso: { wrong: [], notStudied: [] },
                goldMode: false,
                savedQuizzes: {} // FIX: Cancella anche i quiz salvati per evitare che riparta dal vecchio stato
                };
                
                // Aggiorna Firebase
                await db.collection("utenti").doc(pin).update(updateData);
                // Aggiorna Locale
                dbUsers[pin] = { ...dbUsers[pin], ...updateData };
                
                // 🏆 Se questo reset riguarda l'utente ATTUALMENTE LOGGATO, aggiorna state
                if (state.currentPin === pin) {
                    state.isPerfect = false;
                    initTheme();  // Aggiorna il tema subito
                }
                
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

// Renderizza il toggle tester (fulmine) come elemento flottante a sinistra, simile al toggle tema
function renderTesterToggle() {
    const existing = document.getElementById('tester-toggle');
    // Se non sei il tester rimuovi e esci
    if (!state.isTester) {
        if (existing) existing.remove();
        return;
    }

    if (existing) return; // già presente

    const t = document.createElement('div');
    t.id = 'tester-toggle';
    t.className = 'tester-toggle';
    t.title = 'Toggle Gold (tester)';
    t.onclick = () => { toggleDebugPerfect(); };
    t.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z"></path></svg>`;
    document.body.appendChild(t);
}

/* =========================
   GESTIONE GOLD CARD 3D
   ========================= */
function openGoldCardModal() {
    // Crea il modale se non esiste
    let modal = document.getElementById('gold-card-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'gold-card-modal';
        // Struttura HTML uniforme ai modali del sito (modal-content, modal-btn)
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; width: 90%; background: rgba(30,30,30,0.95); border: 1px solid rgba(255,215,0,0.3);">
                <h3 class="gold-glow-text" style="margin-bottom: 10px; font-size: 20px;">LA TUA CARTA ORO</h3>
                <p style="font-size: 12px; opacity: 0.7; margin-bottom: 20px; color: #fff;">Ruota per ammirare i dettagli</p>
                
                <div id="gold-card-container" style="width:100%; height:350px; position:relative; margin-bottom: 20px;"></div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom: 10px;">
                    <button class="modal-btn btn-primary" onclick="GoldCardManager.recordVideo(this)" style="margin:0; font-size:13px; background: #fff; color: #000;">🎥 Video 360°</button>
                    <button class="modal-btn btn-primary" onclick="GoldCardManager.downloadSmart(this)" style="margin:0; font-size:13px; background: #fff; color: #000;">📦 Scarica 3D</button>
                </div>
                <!-- Tasto Chiudi uniforme agli altri modali -->
                <button class="modal-btn btn-cancel" onclick="closeGoldCardModal()">Chiudi</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';

    // Prepara i dati utente
    const u = dbUsers[state.currentPin];
    const stats = calcStats();
    // Calcolo punti approssimativo basato sulle corrette (o usa u.points se salvato)
    const currentPoints = stats.correct * 10; 

    const fmtDate = (d) => {
        try { return new Date(d).toLocaleDateString('it-IT', { month: '2-digit', year: '2-digit' }); }
        catch(e) { return '01/24'; }
    };
    const memberSince = fmtDate(u.created || u.createdAt || new Date());
    const goldSince = fmtDate(u.goldDate || u.created || u.createdAt || new Date());

    const userData = {
        name: u.name,
        id: u.userId,
        memberSince: memberSince,
        goldSince: goldSince,
        points: currentPoints,
        pinkMode: u.pinkMode || false
    };

    // Inizializza Three.js in modo asincrono per non bloccare l'apertura del modale
    // Risolve: [Violation] 'click' handler took X ms
    requestAnimationFrame(() => {
        setTimeout(() => {
            GoldCardManager.init(document.getElementById('gold-card-container'), userData);
        }, 50);
    });
}

function closeGoldCardModal() {
    const modal = document.getElementById('gold-card-modal');
    if (modal) modal.style.display = 'none';
    GoldCardManager.dispose(); // Pulisce la memoria WebGL
}

function getNextGoldCandidate() {
    const langs = Object.keys(domandaRepo);
    for (const lang of langs) {
        for (let i = 1; i <= 5; i++) {
            if (i === 5) continue; // Skip L5 (linear)
            const seg = computeProgressSegments(lang, i);
            if ((state.progress[lang] || 0) >= i && (seg.greenCount + seg.goldCount) < seg.totalExist) {
                return { lang: lang, lvl: i };
            }
        }
    }
    return null;
}

function offerGoldRetry(lang, lvl) {
    openModal(
        "Concorri per il Gold",
        `<div style="text-align:left">
            <p>Hai completato il livello, ma non hai ottenuto il punteggio massimo.</p>
            <p><strong>Vuoi riprovare subito solo le domande mancanti?</strong></p>
            <ul style="font-size:13px; opacity:0.8; padding-left:20px">
                <li>Il livello riparte dal numero di risposte corrette attuali.</li>
                <li>Non perdi i progressi acquisiti.</li>
                <li>Colma le lacune per ottenere il Gold.</li>
            </ul>
        </div>`,
        () => { startGoldRetry(lang, lvl); }
    );
    setTimeout(() => {
        const btnCancel = document.querySelector('#universal-modal .btn-cancel');
        if(btnCancel) btnCancel.innerText = "Prova più tardi";
    }, 50);
}

function startGoldRetry(lang, lvl) {
    const key = "L" + lvl;
    const allQuestions = domandaRepo[lang][key];
    if (!allQuestions) return;

    const u = dbUsers[state.currentPin];
    let historyAgg = [];
    const keyLvl = `${lang}_${lvl}`;
    if (u.history[keyLvl]) historyAgg = historyAgg.concat(u.history[keyLvl]);
    if (u.history[lang]) historyAgg = historyAgg.concat(u.history[lang].filter(h => Number(h.lvl||h.level) === lvl));
    
    const uniqueCorrect = new Set(historyAgg.filter(h => h.ok).map(h => h.q));
    const missing = allQuestions.filter(raw => !uniqueCorrect.has(raw.split('|')[0]));
    
    if (missing.length === 0) { showLevels(lang); return; }
    
    const selection = missing.map(r => {
        const p = r.split("|");
        let opts = [{ t: p[1], id: 0 }, { t: p[2], id: 1 }, { t: p[3], id: 2 }];
        opts.sort(() => 0.5 - Math.random());
        return { q: p[0], options: opts.map(o => o.t), correct: opts.findIndex(o => o.id === 0), exp: p[5] };
    });
    
    const storageKey = `${lang}_${lvl}`;
    if (!dbUsers[state.currentPin].savedQuizzes) dbUsers[state.currentPin].savedQuizzes = {};
    dbUsers[state.currentPin].savedQuizzes[storageKey] = selection;
    if (!dbUsers[state.currentPin].activeProgress) dbUsers[state.currentPin].activeProgress = {};
    dbUsers[state.currentPin].activeProgress[storageKey] = 0;
    
    saveMasterDB();
    
    session = { lang: lang, lvl: lvl, q: selection, idx: 0, correctCount: 0, isGoldRound: false, isRetry: true, baseOffset: uniqueCorrect.size, totalExist: allQuestions.length };
    renderQ();
}
