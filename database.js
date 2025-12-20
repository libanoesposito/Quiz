const quizDB = {
    Python: [
        { q: "Cosa stampa print(type([]))?", options: ["list", "tuple", "dict"], correct: 0, exp: "Le parentesi quadre definiscono una lista.", code: "print(type([])) # Output: <class 'list'>" }
    ],
    JavaScript: [
        { q: "Quale metodo unisce array?", options: ["concat()", "join()", "merge()"], correct: 0, exp: "concat() crea un nuovo array unendo gli esistenti.", code: "arr1.concat(arr2);" }
    ],
    Java: [
        { q: "Tipo per un carattere singolo?", options: ["char", "String", "byte"], correct: 0, exp: "char memorizza un singolo carattere Unicode.", code: "char grade = 'A';" }
    ],
    MySQL: [
        { q: "Comando per ordinare i risultati?", options: ["ORDER BY", "SORT BY", "GROUP BY"], correct: 0, exp: "ORDER BY ordina in modo ASC o DESC.", code: "SELECT * FROM users ORDER BY name;" }
    ],
    HTML: [
        { q: "Tag per lista numerata?", options: ["<ol>", "<ul>", "<li>"], correct: 0, exp: "<ol> sta per Ordered List.", code: "<ol>\n <li>Uno</li>\n</ol>" }
    ]
};

const challenges5 = {
    Python: { task: "Stampa 'Hello'", target: "print('Hello')", color: "#4B8BBE" },
    JavaScript: { task: "Usa console.log('Ciao')", target: "console.log('Ciao')", color: "#F7DF1E" },
    Java: { task: "Dichiara int x = 5;", target: "int x = 5;", color: "#f89820" },
    MySQL: { task: "Seleziona tutto da 'tab'", target: "SELECT * FROM tab", color: "#00758f" },
    HTML: { task: "Crea tag <a></a>", target: "<a></a>", color: "#E34C26" }
};
