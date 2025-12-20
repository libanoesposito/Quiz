const quizDB = {
    Python: {
        L1: [{ q: "Come stampi 'Ciao'?", options: ["print('Ciao')", "echo 'Ciao'", "log('Ciao')"], correct: 0, exp: "print() è la funzione di output standard.", code: "print('Ciao')" }],
        L2: [{ q: "Definisci una lista", options: ["x = []", "x = {}", "x = ()"], correct: 0, exp: "Le parentesi quadre creano liste.", code: "my_list = [1, 2]" }],
        L3: [{ q: "Cosa fa len()?", options: ["Lunghezza", "Somma", "Tipo"], correct: 0, exp: "len() restituisce il numero di elementi.", code: "len([1, 2]) # 2" }],
        L4: [{ q: "Metodo per chiavi dict?", options: ["keys()", "get()", "items()"], correct: 0, exp: "keys() restituisce le chiavi del dizionario.", code: "d.keys()" }]
    },
    Java: {
        L1: [{ q: "Tipo per interi?", options: ["int", "String", "bool"], correct: 0, exp: "int memorizza interi a 32 bit.", code: "int x = 5;" }],
        L2: [], L3: [], L4: []
    },
    MySQL: {
        L1: [{ q: "Comando per dati?", options: ["SELECT", "TAKE", "READ"], correct: 0, exp: "SELECT recupera record.", code: "SELECT * FROM tab;" }],
        L2: [], L3: [], L4: []
    }
};

const challenges5 = {
    Python: { task: "Scrivi un ciclo for che stampi i numeri da 1 a 3", target: "for i in range(1, 4):\n    print(i)", logic: "range(1,4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Scrivi un ciclo for che stampi da 1 a 3", target: "for(let i=1; i<=3; i++){\n  console.log(i)\n}", logic: "i<=3", output: "1\n2\n3", color: "#F7DF1E" }
};
