const quizDB = {
    Python: {
        L1: [{ q: "Come stampi 'Ciao'?", options: ["print('Ciao')", "echo 'Ciao'"], correct: 0, exp: "In Python si usa la funzione print().", code: "print('Ciao')" }],
        L2: [], L3: [], L4: []
    },
    JavaScript: { L1: [], L2: [], L3: [], L4: [] },
    Java: { L1: [], L2: [], L3: [], L4: [] },
    MySQL: { L1: [], L2: [], L3: [], L4: [] },
    HTML: { L1: [], L2: [], L3: [], L4: [] }
};

const challenges5 = {
    Python: { task: "Stampa i numeri da 1 a 3 con un ciclo for", logic: "range(1, 4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Crea un ciclo for", logic: "for", output: "OK", color: "#F7DF1E" },
    Java: { task: "Dichiara int x", logic: "int x", output: "OK", color: "#f89820" },
    MySQL: { task: "SELECT", logic: "SELECT", output: "OK", color: "#00758f" },
    HTML: { task: "Tag div", logic: "<div>", output: "OK", color: "#E34C26" }
};
