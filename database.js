const quizDB = {
    Python: [
        { q: "Cosa stampa print(type([]))?", options: ["list", "tuple", "dict"], correct: 0, exp: "Le parentesi quadre definiscono una lista.", code: "print(type([]))" }
    ],
    JavaScript: [
        { q: "Uguaglianza stretta?", options: ["===", "==", "="], correct: 0, exp: "=== controlla valore e tipo.", code: "5 === '5' // false" }
    ],
    Java: [
        { q: "Tipo per numeri interi?", options: ["int", "float", "String"], correct: 0, exp: "int è il tipo standard per gli interi.", code: "int x = 10;" }
    ],
    MySQL: [
        { q: "Comando per leggere dati?", options: ["SELECT", "GET", "READ"], correct: 0, exp: "SELECT recupera righe dal database.", code: "SELECT * FROM users;" }
    ],
    HTML: [
        { q: "Tag per i link?", options: ["<a>", "<link>", "<href>"], correct: 0, exp: "Il tag 'a' definisce un hyperlink.", code: "<a href='...'>Link</a>" }
    ]
};

const challenges5 = {
    Python: { task: "Stampa 'Ciao'", target: "print('Ciao')", color: "#4B8BBE" },
    JavaScript: { task: "Usa console.log('Hi')", target: "console.log('Hi')", color: "#F7DF1E" },
    Java: { task: "Dichiara int x = 5;", target: "int x = 5;", color: "#f89820" },
    MySQL: { task: "Seleziona tutto da users", target: "SELECT * FROM users", color: "#00758f" },
    HTML: { task: "Crea un tag <a></a>", target: "<a></a>", color: "#E34C26" }
};
