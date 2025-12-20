const quizDB = {
    Python: {
        L1: [{ q: "Come stampi 'Ciao'?", options: ["print('Ciao')", "echo 'Ciao'", "log('Ciao')"], correct: 0, exp: "print() è la funzione di output standard.", code: "print('Ciao')" }],
        L2: [], L3: [], L4: []
    },
    JavaScript: {
        L1: [{ q: "Dichiarazione moderna?", options: ["let", "var", "const"], correct: 0, exp: "let è lo standard moderno.", code: "let x = 10;" }],
        L2: [], L3: [], L4: []
    },
    Java: {
        L1: [{ q: "Punto di ingresso Java?", options: ["main()", "init()", "start()"], correct: 0, exp: "Ogni app Java parte dal metodo main.", code: "public static void main" }],
        L2: [], L3: [], L4: []
    },
    MySQL: {
        L1: [{ q: "Seleziona tutto da 'users'?", options: ["SELECT * FROM users", "GET * FROM users", "READ users"], correct: 0, exp: "L'asterisco indica tutte le colonne.", code: "SELECT * FROM users;" }],
        L2: [], L3: [], L4: []
    },
    HTML: {
        L1: [{ q: "Tag per titolo H1?", options: ["<h1>", "<title>", "<head>"], correct: 0, exp: "h1 è il titolo più importante.", code: "<h1>Titolo</h1>" }],
        L2: [], L3: [], L4: []
    }
};

const challenges5 = {
    Python: { task: "Scrivi un ciclo for che stampi da 1 a 3", logic: "range(1, 4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Crea un ciclo for che conti da 1 a 3", logic: "i<=3", output: "1\n2\n3", color: "#F7DF1E" },
    Java: { task: "Stampa la stringa 'Java'", logic: "System.out.print", output: "Java", color: "#f89820" },
    MySQL: { task: "Ordina per ID", logic: "ORDER BY id", output: "Ordinato", color: "#00758f" },
    HTML: { task: "Crea tag immagine", logic: "<img", output: "Immagine creata", color: "#E34C26" }
};
