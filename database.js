const quizDB = {
    Python: {
        L1: [{ q: "Come stampi 'Ciao'?", options: ["print('Ciao')", "echo 'Ciao'", "log('Ciao')"], correct: 0, exp: "print() è la funzione di output standard.", code: "print('Ciao')" }],
        L2: [], L3: [], L4: []
    },
    JavaScript: {
        L1: [{ q: "Dichiarazione variabile moderna?", options: ["let", "var", "const"], correct: 0, exp: "let è lo standard moderno per variabili riassegnabili.", code: "let x = 10;" }],
        L2: [], L3: [], L4: []
    },
    Java: {
        L1: [{ q: "Tipo per un intero?", options: ["int", "String", "boolean"], correct: 0, exp: "int è il tipo primitivo per i numeri interi.", code: "int numero = 100;" }],
        L2: [], L3: [], L4: []
    },
    MySQL: {
        L1: [{ q: "Comando per estrarre dati?", options: ["SELECT", "EXTRACT", "GET"], correct: 0, exp: "SELECT è fondamentale per interrogare il DB.", code: "SELECT * FROM utenti;" }],
        L2: [], L3: [], L4: []
    },
    HTML: {
        L1: [{ q: "Tag per il titolo principale?", options: ["<h1>", "<title>", "<header>"], correct: 0, exp: "h1 definisce l'intestazione di livello più alto.", code: "<h1>Benvenuto</h1>" }],
        L2: [], L3: [], L4: []
    }
};

const challenges5 = {
    Python: { task: "Scrivi un ciclo for che stampi i numeri da 1 a 3", logic: "range(1, 4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Crea un ciclo for che conti da 1 a 3", logic: "i<=3", output: "1\n2\n3", color: "#F7DF1E" },
    Java: { task: "Dichiara un intero x = 10 e stampalo", logic: "System.out.println", output: "10", color: "#f89820" },
    MySQL: { task: "Seleziona tutto dalla tabella 'clienti'", logic: "SELECT * FROM clienti", output: "Tabella Selezionata", color: "#00758f" },
    HTML: { task: "Crea un link vuoto", logic: "<a></a>", output: "Link creato", color: "#E34C26" }
};
