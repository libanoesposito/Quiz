// Questo è il tuo magazzino domande (scrivine quante ne vuoi per livello)
const domandaRepo = {
    Python: {
        L1: [
            "Come stampi Ciao?|print('Ciao')|echo 'Ciao'|console.log('Ciao')|0|In Python si usa print().",
            "Dichiarazione variabile x?|x = 5|int x = 5|var x = 5|0|Python è a tipizzazione dinamica.",
            "Domanda 3|Opzione 0|Opzione 1|Opzione 2|0|Spiegazione qui"
            // Aggiungi qui le altre 97 domande seguendo lo schema
        ],
        L2: ["Domanda L2|A|B|C|1|Spiegazione"],
        L3: [], L4: []
    },
    JavaScript: {
        L1: ["Esempio JS|Opz 0|Opz 1|Opz 2|0|Spiegazione"],
        L2: [], L3: [], L4: []
    },
    Java: { L1: [], L2: [], L3: [], L4: [] },
    MySQL: { L1: [], L2: [], L3: [], L4: [] },
    HTML: { L1: [], L2: [], L3: [], L4: [] }
};

const challenges5 = {
    Python: { task: "Usa range(1, 4)", logic: "range(1, 4)", output: "1\n2\n3" },
    JavaScript: { task: "Ciclo for", logic: "for", output: "OK" },
    Java: { task: "Main", logic: "main", output: "OK" },
    MySQL: { task: "Select", logic: "SELECT", output: "OK" },
    HTML: { task: "Div", logic: "<div>", output: "OK" }
};
