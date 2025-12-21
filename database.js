const quizDB = {
    const quizDB = {
    Python: {
        L1: [ // Fondamentali: Variabili e Output
            { q: "Qual è la funzione per visualizzare un messaggio a schermo?", options: ["print()", "console.log()", "echo()"], correct: 0, exp: "In Python, print() è la funzione integrata per l'output.", code: "print('Ciao!')" },
            { q: "Come si dichiara una variabile numerica x con valore 5?", options: ["x = 5", "int x = 5", "var x = 5"], correct: 0, exp: "Python è a tipizzazione dinamica: basta assegnare il valore.", code: "x = 5" },
            { q: "Quale di questi è un commento corretto?", options: ["# Commento", "// Commento", "/* Commento */"], correct: 0, exp: "Il simbolo cancelletto (#) identifica i commenti a riga singola.", code: "# Questo è un commento" },
            { q: "Qual è l'operatore per la divisione intera?", options: ["//", "/", "%"], correct: 0, exp: "L'operatore // restituisce il quoziente senza la parte decimale.", code: "risultato = 10 // 3  # output: 3" },
            { q: "Qual è il risultato di 2 ** 3?", options: ["8", "6", "9"], correct: 0, exp: "L'operatore ** viene utilizzato per l'elevamento a potenza.", code: "2 ** 3  # 2x2x2 = 8" }
        ],
        L2: [ // Tipi di dati e Liste
            { q: "Come si crea una lista in Python?", options: ["x = [1, 2, 3]", "x = {1, 2, 3}", "x = (1, 2, 3)"], correct: 0, exp: "Le liste si definiscono usando le parentesi quadre.", code: "mia_lista = [10, 20]" },
            { q: "Come aggiungi un elemento in fondo a una lista?", options: ["append()", "add()", "push()"], correct: 0, exp: "Il metodo append() aggiunge un oggetto alla fine della lista.", code: "lista.append('nuovo')" },
            { q: "Qual è l'indice del primo elemento di una lista?", options: ["0", "1", "-1"], correct: 0, exp: "In Python, come in molti linguaggi, gli indici partono da zero.", code: "primo = lista[0]" },
            { q: "Come si ottiene la lunghezza di una stringa o lista?", options: ["len()", "length()", "size()"], correct: 0, exp: "La funzione len() restituisce il numero di elementi.", code: "len('Python')  # output: 6" },
            { q: "Quale metodo trasforma una stringa in minuscolo?", options: ["lower()", "min()", "toLowerCase()"], correct: 0, exp: "Il metodo lower() converte tutti i caratteri in minuscolo.", code: "'CIAO'.lower()" }
        ],
        L3: [ // Condizioni e Cicli
            { q: "Qual è la sintassi corretta per un 'if'?", options: ["if x > 5:", "if (x > 5)", "if x > 5 then"], correct: 0, exp: "In Python l'istruzione if termina con i due punti e richiede l'indentazione.", code: "if x > 0:\n    print('Positivo')" },
            { q: "Come si scrive 'diverso da' in un confronto?", options: ["!=", "<>", "not =="], correct: 0, exp: "L'operatore != verifica che due valori non siano uguali.", code: "if x != 10:" },
            { q: "Quale parola chiave si usa per condizioni multiple?", options: ["elif", "else if", "switch"], correct: 0, exp: "elif è l'abbreviazione di 'else if' in Python.", code: "if x > 0:\n    ...\nelif x < 0:" },
            { q: "Come si itera su una sequenza di numeri da 0 a 4?", options: ["for i in range(5):", "for (i=0; i<5; i++)", "foreach i in 5:"], correct: 0, exp: "range(5) genera numeri da 0 a 4 (il limite superiore è escluso).", code: "for i in range(5):" },
            { q: "Cosa interrompe un ciclo for o while?", options: ["break", "stop", "exit"], correct: 0, exp: "L'istruzione break termina immediatamente il ciclo corrente.", code: "while True:\n    break" }
        ],
        L4: [ // Funzioni e Logica Avanzata
            { q: "Come si definisce una funzione?", options: ["def nome():", "function nome()", "void nome()"], correct: 0, exp: "Si usa la parola chiave def seguita dal nome della funzione.", code: "def saluta():" },
            { q: "Come restituisci un valore da una funzione?", options: ["return", "yield", "send"], correct: 0, exp: "return termina la funzione e invia il valore al chiamante.", code: "def somma(a,b):\n    return a + b" },
            { q: "Cos'è un dizionario in Python?", options: ["Coppie chiave-valore", "Una lista ordinata", "Un set di numeri"], correct: 0, exp: "I dizionari memorizzano dati associando chiavi a valori.", code: "d = {'nome': 'Mario'}" },
            { q: "Quale modulo si usa per generare numeri casuali?", options: ["random", "math", "os"], correct: 0, exp: "Il modulo random fornisce funzioni per la casualità.", code: "import random" },
            { q: "Come si gestisce un errore per evitare il crash?", options: ["try/except", "if/error", "catch"], correct: 0, exp: "Il blocco try/except intercetta le eccezioni durante l'esecuzione.", code: "try:\n    x = 1/0\nexcept:\n    print('Errore')" }
        ]
    },
    // ... mantieni gli altri linguaggi vuoti o come prima
    // ... Python rimane come sopra ...
    JavaScript: {
        L1: [ // Fondamentali e Variabili
            { q: "Quale parola chiave dichiara una variabile che può essere riassegnata?", options: ["let", "const", "static"], correct: 0, exp: "let permette di creare variabili il cui valore può cambiare nel tempo.", code: "let punteggio = 10;" },
            { q: "Come si scrive un commento su una singola riga?", options: ["// commento", "/* commento */", "# commento"], correct: 0, exp: "In JS, la doppia barra // si usa per i commenti brevi.", code: "// Questo è un commento" },
            { q: "Quale operatore si usa per l'uguaglianza stretta (valore e tipo)?", options: ["===", "==", "="], correct: 0, exp: "L'operatore === controlla che sia il valore che il tipo di dato siano identici.", code: "5 === '5' // false" },
            { q: "Come si visualizza un messaggio nella console del browser?", options: ["console.log()", "print()", "alert()"], correct: 0, exp: "console.log() è lo strumento principale per il debugging in JS.", code: "console.log('Test');" },
            { q: "Qual è il tipo di dato di '5' (tra virgolette)?", options: ["String", "Number", "Boolean"], correct: 0, exp: "Tutto ciò che è racchiuso tra virgolette è considerato una stringa.", code: "typeof '5' // 'string'" }
        ],
        L2: [ // Array e Oggetti
            { q: "Come si accede al secondo elemento di un array 'colori'?", options: ["colori[1]", "colori[2]", "colori.1"], correct: 0, exp: "Gli array partono da indice 0, quindi il secondo elemento è 1.", code: "let x = colori[1];" },
            { q: "Quale metodo aggiunge un elemento alla FINE di un array?", options: ["push()", "pop()", "shift()"], correct: 0, exp: "push() aggiunge uno o più elementi alla fine dell'array.", code: "array.push('nuovo');" },
            { q: "Come si definisce un oggetto in JavaScript?", options: ["{ }", "[ ]", "( )"], correct: 0, exp: "Gli oggetti usano le parentesi graffe per contenere coppie chiave-valore.", code: "let user = { id: 1 };" },
            { q: "Quale proprietà restituisce il numero di elementi in un array?", options: ["length", "size", "count"], correct: 0, exp: "La proprietà .length indica la dimensione dell'array.", code: "console.log(arr.length);" },
            { q: "Come si trasforma una stringa in un numero intero?", options: ["parseInt()", "toNumber()", "Number.cast()"], correct: 0, exp: "parseInt() analizza una stringa e restituisce un intero.", code: "parseInt('10')" }
        ],
        L3: [ // DOM e Eventi
            { q: "Come selezioni un elemento HTML tramite il suo ID?", options: ["document.getElementById()", "document.queryID()", "getElement()"], correct: 0, exp: "È il metodo standard per recuperare un singolo elemento univoco.", code: "const el = document.getElementById('app');" },
            { q: "Quale evento scatta quando si clicca su un pulsante?", options: ["onclick", "onhover", "onchange"], correct: 0, exp: "L'evento click (o onclick) gestisce l'interazione del mouse.", code: "btn.onclick = () => { };" },
            { q: "Come si cambia il contenuto testuale di un elemento?", options: ["innerText", "setContent", "value"], correct: 0, exp: "innerText (o textContent) modifica il testo visibile dentro un tag.", code: "el.innerText = 'Ciao';" },
            { q: "Come si aggiunge una classe CSS a un elemento via JS?", options: ["classList.add()", "setClass()", "className =+"], correct: 0, exp: "classList.add() permette di aggiungere classi senza sovrascrivere quelle esistenti.", code: "el.classList.add('active');" },
            { q: "Cosa permette di eseguire codice dopo un certo tempo?", options: ["setTimeout()", "wait()", "sleep()"], correct: 0, exp: "setTimeout() esegue una funzione dopo un ritardo in millisecondi.", code: "setTimeout(saluta, 1000);" }
        ],
        L4: [ // Funzioni e Logica Moderna
            { q: "Come si scrive una Arrow Function?", options: ["() => { }", "function => { }", "arrow() { }"], correct: 0, exp: "Le arrow functions sono una sintassi abbreviata introdotta in ES6.", code: "const sum = (a, b) => a + b;" },
            { q: "Quale metodo crea un nuovo array trasformando ogni elemento?", options: ["map()", "forEach()", "filter()"], correct: 0, exp: "map() itera sull'array e restituisce un nuovo array modificato.", code: "arr.map(x => x * 2);" },
            { q: "Cosa restituisce '5' == 5?", options: ["true", "false", "null"], correct: 0, exp: "L'operatore == esegue la conversione automatica del tipo (coercizione).", code: "5 == '5' // true" },
            { q: "Come si gestiscono le operazioni asincrone in modo moderno?", options: ["async / await", "wait for", "defer"], correct: 0, exp: "Async/Await rende il codice asincrono leggibile come se fosse sincrono.", code: "async function getData() { ... }" },
            { q: "Quale parola chiave impedisce la riassegnazione di una variabile?", options: ["const", "let", "fixed"], correct: 0, exp: "const crea un riferimento costante che non può essere cambiato.", code: "const PI = 3.14;" }
        ]

      },    
          MySQL: {
        L1: [
            { q: "Quale comando recupera dati da una tabella?", options: ["SELECT", "GET", "FETCH"], correct: 0, exp: "SELECT è l'istruzione base per interrogare i dati.", code: "SELECT * FROM utenti;" },
            { q: "Come si filtrano i risultati?", options: ["WHERE", "FILTER", "SEARCH"], correct: 0, exp: "WHERE specifica la condizione di ricerca.", code: "SELECT * FROM t WHERE id = 1;" },
            { q: "Comando per aggiungere nuovi dati?", options: ["INSERT INTO", "ADD ROW", "NEW RECORD"], correct: 0, exp: "INSERT INTO aggiunge righe a una tabella.", code: "INSERT INTO utenti (nome) VALUES ('Alex');" },
            { q: "Cosa significa SQL?", options: ["Structured Query Language", "Standard Query Logic", "Simple Query List"], correct: 0, exp: "È il linguaggio standard per i database relazionali.", code: "SQL" },
            { q: "Quale comando elimina una tabella?", options: ["DROP TABLE", "DELETE TABLE", "REMOVE"], correct: 0, exp: "DROP elimina l'intera struttura.", code: "DROP TABLE test;" }
        ],
        L2: [
            { q: "Come ordini i risultati in modo decrescente?", options: ["ORDER BY DESC", "SORT DESC", "ARRANGE BY"], correct: 0, exp: "DESC inverte l'ordine dei risultati.", code: "SELECT * FROM t ORDER BY id DESC;" },
            { q: "Come si aggiornano record esistenti?", options: ["UPDATE", "SET", "MODIFY"], correct: 0, exp: "UPDATE modifica i dati già presenti.", code: "UPDATE utenti SET eta=20 WHERE id=1;" },
            { q: "Quale funzione conta il numero di righe?", options: ["COUNT()", "SUM()", "TOTAL()"], correct: 0, exp: "COUNT(*) conta tutti i record trovati.", code: "SELECT COUNT(*) FROM utenti;" },
            { q: "Come si evitano valori duplicati?", options: ["DISTINCT", "UNIQUE", "DIFFERENT"], correct: 0, exp: "DISTINCT restituisce solo valori univoci.", code: "SELECT DISTINCT citta FROM utenti;" },
            { q: "Come cerchi nomi che iniziano con 'A'?", options: ["LIKE 'A%'", "MATCH 'A'", "FIND 'A'"], correct: 0, exp: "Il simbolo % è un carattere jolly.", code: "WHERE nome LIKE 'A%';" }
        ],
        L3: [
            { q: "Quale comando rimuove solo i dati, non la tabella?", options: ["DELETE", "DROP", "CLEAR"], correct: 0, exp: "DELETE rimuove le righe ma mantiene la tabella.", code: "DELETE FROM utenti;" },
            { q: "Come unisci i dati di due tabelle?", options: ["JOIN", "MERGE", "CONNECT"], correct: 0, exp: "JOIN permette di combinare righe di tabelle diverse.", code: "SELECT * FROM t1 JOIN t2 ON t1.id = t2.id;" },
            { q: "Quale operatore verifica se un valore è in una lista?", options: ["IN", "BETWEEN", "EXISTS"], correct: 0, exp: "IN permette di specificare più valori possibili.", code: "WHERE id IN (1, 2, 3);" },
            { q: "A cosa serve l'istruzione GROUP BY?", options: ["Raggruppare record", "Ordinare record", "Filtrare record"], correct: 0, exp: "GROUP BY aggrega i dati in base a una colonna.", code: "SELECT count(id), citta GROUP BY citta;" },
            { q: "Come filtri i risultati di un'aggregazione?", options: ["HAVING", "WHERE", "FILTER"], correct: 0, exp: "HAVING si usa per filtrare i gruppi creati da GROUP BY.", code: "GROUP BY citta HAVING count(*) > 5;" }
        ],
        L4: [
            { q: "Cos'è una Chiave Esterna (Foreign Key)?", options: ["Un legame tra tabelle", "La chiave principale", "Un indice di ricerca"], correct: 0, exp: "La Foreign Key crea una relazione tra due tabelle.", code: "FOREIGN KEY (user_id) REFERENCES utenti(id)" },
            { q: "Quale istruzione crea una nuova tabella?", options: ["CREATE TABLE", "MAKE TABLE", "NEW TABLE"], correct: 0, exp: "CREATE TABLE definisce nome e colonne di una tabella.", code: "CREATE TABLE prod (id INT, nome TEXT);" },
            { q: "Cos'è un Indice (INDEX)?", options: ["Velocizza le query", "Un numero di riga", "Una tabella speciale"], correct: 0, exp: "Gli indici migliorano drasticamente la velocità di ricerca.", code: "CREATE INDEX idx_nome ON utenti(nome);" },
            { q: "Quale operatore seleziona un intervallo?", options: ["BETWEEN", "RANGE", "FROM...TO"], correct: 0, exp: "BETWEEN seleziona valori inclusi in un intervallo.", code: "WHERE prezzo BETWEEN 10 AND 50;" },
            { q: "A cosa serve il comando ALIAS (AS)?", options: ["Rinominare colonne", "Criptare dati", "Cancellare dati"], correct: 0, exp: "AS dà un nome temporaneo a una colonna o tabella.", code: "SELECT nome AS 'Username' FROM utenti;" }
        ]

    },

        Java: {
        L1: [
            { q: "Punto di ingresso di ogni app Java?", options: ["main()", "start()", "init()"], correct: 0, exp: "Il metodo main è il punto di partenza dell'esecuzione.", code: "public static void main(String[] args)" },
            { q: "Quale comando stampa in console?", options: ["System.out.println()", "print()", "console.log()"], correct: 0, exp: "System.out.println è il metodo standard di output.", code: "System.out.println('Ciao');" },
            { q: "Come si definisce una stringa?", options: ["String", "string", "str"], correct: 0, exp: "In Java, String è una classe (S maiuscola).", code: "String nome = 'Alex';" },
            { q: "Commento a riga singola?", options: ["//", "#", "/*"], correct: 0, exp: "La doppia barra è usata per i commenti brevi.", code: "// commento" },
            { q: "Estensione dei file sorgente?", options: [".java", ".class", ".jar"], correct: 0, exp: "Il codice sorgente si salva in .java.", code: "Main.java" }
        ],
        L2: [
            { q: "Come si istanzia un oggetto?", options: ["new", "create", "make"], correct: 0, exp: "new alloca la memoria per l'oggetto.", code: "Auto miaAuto = new Auto();" },
            { q: "Tipo di dato per numeri decimali?", options: ["double", "int", "long"], correct: 0, exp: "double è lo standard per i decimali.", code: "double pi = 3.14;" },
            { q: "Cos'è una Classe?", options: ["Un modello per oggetti", "Una variabile", "Un database"], correct: 0, exp: "La classe è il progetto/modello di un oggetto.", code: "public class Persona { }" },
            { q: "Come si eredita una classe?", options: ["extends", "implements", "inherits"], correct: 0, exp: "extends crea una relazione di ereditarietà.", code: "class Cane extends Animale { }" },
            { q: "Lunghezza di un array?", options: ["arr.length", "arr.size()", "arr.len"], correct: 0, exp: "Per gli array si usa la proprietà .length.", code: "int x = arr.length;" }
        ],
        L3: [
            { q: "Quale parola chiave indica un metodo che non restituisce nulla?", options: ["void", "null", "empty"], correct: 0, exp: "void specifica che il metodo non ha valore di ritorno.", code: "public void saluta() { }" },
            { q: "Come si importa una libreria esterna?", options: ["import", "include", "using"], correct: 0, exp: "import permette di usare classi di altri pacchetti.", code: "import java.util.Scanner;" },
            { q: "Quale parola chiave definisce una costante?", options: ["final", "static", "const"], correct: 0, exp: "final impedisce che il valore venga riassegnato.", code: "final int X = 10;" },
            { q: "Cos'è un Costruttore?", options: ["Un metodo speciale", "Una variabile", "Un ciclo"], correct: 0, exp: "Il costruttore inizializza l'oggetto alla creazione.", code: "public Persona() { }" },
            { q: "Come si gestiscono le eccezioni (errori)?", options: ["try-catch", "if-else", "error-handle"], correct: 0, exp: "Try-catch cattura gli errori a runtime.", code: "try { ... } catch (Exception e) { }" }
        ],
        L4: [
            { q: "Quale parola chiave rende un metodo accessibile senza creare l'oggetto?", options: ["static", "public", "final"], correct: 0, exp: "static appartiene alla classe, non alla singola istanza.", code: "public static void x() { }" },
            { q: "Come implementi un'interfaccia?", options: ["implements", "extends", "using"], correct: 0, exp: "implements obbliga la classe a usare certi metodi.", code: "class A implements InterfacciaB { }" },
            { q: "Cos'è l'ArrayList?", options: ["Un array dinamico", "Un array fisso", "Un file di testo"], correct: 0, exp: "ArrayList può cambiare dimensione a runtime.", code: "ArrayList<String> lista = new ArrayList<>();" },
            { q: "Cosa fa 'super()'?", options: ["Chiama il costruttore padre", "Chiama il metodo main", "Chiude l'app"], correct: 0, exp: "super() serve a richiamare la logica della superclasse.", code: "super.metodoPadre();" },
            { q: "A cosa serve l'operatore 'instanceof'?", options: ["Verificare il tipo", "Creare un oggetto", "Cancellare dati"], correct: 0, exp: "Controlla se un oggetto è istanza di una certa classe.", code: "if (obj instanceof String)" }
        ]
    },

        HTML: {
        L1: [
            { q: "Qual è il tag per un titolo principale?", options: ["<h1>", "<title>", "<head>"], correct: 0, exp: "h1 è il titolo più importante gerarchicamente.", code: "<h1>Benvenuti</h1>" },
            { q: "Tag per inserire un'immagine?", options: ["<img>", "<src>", "<pic>"], correct: 0, exp: "img usa l'attributo src per il percorso del file.", code: "<img src='img.jpg'>" },
            { q: "Come si crea un link?", options: ["<a href='...'>", "<link url='...'>", "<a>"], correct: 0, exp: "a (anchor) crea collegamenti ipertestuali.", code: "<a href='...'>Clicca</a>" },
            { q: "Tag per lista puntata?", options: ["<ul>", "<ol>", "<li>"], correct: 0, exp: "ul sta per Unordered List.", code: "<ul><li>Item</li></ul>" },
            { q: "Tag per paragrafo?", options: ["<p>", "<span>", "<div>"], correct: 0, exp: "p definisce un blocco di testo separato.", code: "<p>Testo</p>" }
        ],
        L2: [
            { q: "Tag per una riga di tabella?", options: ["<tr>", "<td>", "<th>"], correct: 0, exp: "tr sta per Table Row.", code: "<table><tr>...</tr></table>" },
            { q: "Attributo per aprire link in nuova scheda?", options: ["target='_blank'", "rel='new'", "open='new'"], correct: 0, exp: "target='_blank' indica una nuova tab.", code: "<a target='_blank'>" },
            { q: "Tag per campo input testo?", options: ["<input type='text'>", "<textfield>", "<input-text>"], correct: 0, exp: "Il tipo text è l'input standard per le scritte.", code: "<input type='text'>" },
            { q: "Commento in HTML?", options: ["", "// ...", "/* ... */"], correct: 0, exp: "Questa è la sintassi specifica per i commenti HTML.", code: "" },
            { q: "A cosa serve l'attributo 'alt'?", options: ["Testo alternativo", "Altezza", "Allineamento"], correct: 0, exp: "Mostra un testo se l'immagine non carica.", code: "<img alt='foto'>" }
        ],
        L3: [
            { q: "Tag per raccogliere dati utente?", options: ["<form>", "<input>", "<submit>"], correct: 0, exp: "form raggruppa tutti i controlli di input.", code: "<form action='/invia'></form>" },
            { q: "Tag per menù a discesa?", options: ["<select>", "<dropdown>", "<option>"], correct: 0, exp: "select crea la lista, option le singole voci.", code: "<select><option>...</option></select>" },
            { q: "Cosa definisce il tag <thead>?", options: ["Intestazione tabella", "Titolo pagina", "Parte alta sito"], correct: 0, exp: "Raggruppa le celle di intestazione di una tabella.", code: "<thead><tr>...</tr></thead>" },
            { q: "Tag per testo in grassetto (semantico)?", options: ["<strong>", "<b>", "<i>"], correct: 0, exp: "strong indica importanza, non solo stile estetico.", code: "<strong>Importante</strong>" },
            { q: "Quale tag è usato per l'area di testo multi-riga?", options: ["<textarea>", "<input type='area'>", "<text>"], correct: 0, exp: "textarea permette all'utente di scrivere lunghi messaggi.", code: "<textarea rows='4'></textarea>" }
        ],
        L4: [
            { q: "Cosa significa HTML5?", options: ["L'ultima versione HTML", "Un nuovo linguaggio", "Un plugin"], correct: 0, exp: "È lo standard attuale che include video, audio e canvas.", code: "<!DOCTYPE html>" },
            { q: "Tag per inserire video?", options: ["<video>", "<movie>", "<media>"], correct: 0, exp: "HTML5 permette video nativi senza flash.", code: "<video src='film.mp4'></video>" },
            { q: "A cosa serve il tag <canvas>?", options: ["Grafica e disegni", "Sfondo pagina", "Titoli dinamici"], correct: 0, exp: "Canvas è usato per disegnare via JavaScript (giochi, grafici).", code: "<canvas id='gioco'></canvas>" },
            { q: "Cosa sono i tag semantici (nav, footer, section)?", options: ["Aiutano i motori di ricerca", "Cambiano i colori", "Fanno animazioni"], correct: 0, exp: "Danno significato alla struttura del sito per Google/Siri.", code: "<nav>Menu</nav>" },
            { q: "Come includi un foglio di stile CSS esterno?", options: ["<link rel='stylesheet'>", "<style src='...'>", "<css>"], correct: 0, exp: "Il tag link nell'head collega il file .css.", code: "<link rel='stylesheet' href='style.css'>" }
        ]
    }
};

const challenges5 = {
    Python: { task: "Scrivi un ciclo for che stampi i numeri da 1 a 3", logic: "range(1, 4)", output: "1\n2\n3", color: "#4B8BBE" },
    JavaScript: { task: "Crea un ciclo for da 1 a 3", logic: "i<=3", output: "1\n2\n3", color: "#F7DF1E" },
    Java: { task: "Stampa 'Java'", logic: "System.out.print", output: "Java", color: "#f89820" },
    MySQL: { task: "SELECT *", logic: "SELECT *", output: "Success", color: "#00758f" },
    HTML: { task: "Crea un <div>", logic: "<div>", output: "Success", color: "#E34C26" }
};
