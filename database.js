const quizDB = {
    Python: {
        L1: [{ q: "Qual è la funzione per stampare?", options: ["print()", "echo()", "log()"], correct: 0, exp: "In Python si usa print() per l'output.", code: "print('Hello World')" }],
        L2: [], L3: [], L4: []
    },
    JavaScript: { L1: [], L2: [], L3: [], L4: [] },
    Java: { L1: [], L2: [], L3: [], L4: [] },
    MySQL: { L1: [], L2: [], L3: [], L4: [] },
    HTML: { L1: [], L2: [], L3: [], L4: [] }
};

const challenges5 = {
    Python: { task: "Scrivi un ciclo for che stampi i numeri da 1 a 3", logic: "range(1, 4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Crea un ciclo for da 1 a 3", logic: "i<=3", output: "1\n2\n3", color: "#F7DF1E" },
    Java: { task: "Stampa 'Java'", logic: "System.out.print", output: "Java", color: "#f89820" },
    MySQL: { task: "SELECT *", logic: "SELECT *", output: "Success", color: "#00758f" },
    HTML: { task: "Crea un <div>", logic: "<div>", output: "Success", color: "#E34C26" }
};
