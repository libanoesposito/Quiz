const quizDB = {
    Python: {
        L1: [{ q: "Come stampi 'Ciao'?", options: ["print('Ciao')", "echo 'Ciao'", "log('Ciao')"], correct: 0, exp: "print() è la funzione di output standard.", code: "print('Ciao')" }],
        L2: [{ q: "Commento riga singola?", options: ["#", "//", "/*"], correct: 0, exp: "Il cancelletto si usa per i commenti.", code: "# commento" }], 
        L3: [], L4: []
    },
    JavaScript: {
        L1: [{ q: "Dichiarazione moderna?", options: ["let", "var", "const"], correct: 0, exp: "let è lo standard moderno.", code: "let x = 10;" }],
        L2: [], L3: [], L4: []
    },
    Java: {
        L1: [{ q: "Punto di ingresso?", options: ["main()", "start()"], correct: 0, exp: "Le app Java iniziano dal main.", code: "main()" }],
        L2: [], L3: [], L4: []
    },
    MySQL: {
        L1: [{ q: "Comando lettura?", options: ["SELECT", "READ"], correct: 0, exp: "SELECT recupera i dati.", code: "SELECT * FROM tab;" }],
        L2: [], L3: [], L4: []
    },
    HTML: {
        L1: [{ q: "Tag Titolo?", options: ["<h1>", "<title>"], correct: 0, exp: "h1 è il titolo principale.", code: "<h1></h1>" }],
        L2: [], L3: [], L4: []
    }
};

const challenges5 = {
    Python: { task: "Stampa i numeri da 1 a 3 con un ciclo for", logic: "range(1, 4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Stampa i numeri da 1 a 3 con un ciclo for", logic: "i<=3", output: "1\n2\n3", color: "#F7DF1E" },
    Java: { task: "Dichiara int x = 10", logic: "int x = 10", output: "Compilato", color: "#f89820" },
    MySQL: { task: "Seleziona tutto", logic: "SELECT *", output: "Query OK", color: "#00758f" },
    HTML: { task: "Crea un div", logic: "<div>", output: "Elemento creato", color: "#E34C26" }
};
