const domandaRepo = {
    Python: {
        L1: [
            "Come stampi Ciao?|print('Ciao')|echo 'Ciao'|console.log('Ciao')|0|In Python si usa print().",
            "Come assegni il valore 5 alla variabile x?|x == 5|x = 5|5 -> x|1|In Python si usa = per assegnare valori.",
            "Quale tipo di dato è 3.14?|int|str|float|2|3.14 è un numero decimale, quindi float.",
            "Come fai un commento in Python?|# Questo è un commento|// Commento|/* Commento */|0|I commenti iniziano con #.",
            "Come controlli se x è uguale a 10?|x = 10|x == 10|x === 10|1|Per confrontare valori si usa ==.",
            "Come sommi due numeri x e y?|x + y|x add y|x & y|0|In Python l'operatore + somma i numeri.",
            "Come sottrai y da x?|x - y|x sub y|x * y|0|L'operatore - sottrae i valori.",
            "Come moltiplichi x e y?|x * y|x x y|x . y|0|L'operatore * moltiplica i valori.",
            "Come dividi x per y?|x / y|x // y|x % y|0|L'operatore / esegue la divisione.",
            "Come fai il resto della divisione di x per y?|x % y|x / y|x // y|0|L'operatore % calcola il modulo.",
            "Qual è il risultato di 3 ** 2?|6|9|8|1|** è l'operatore di potenza, 3²=9.",
            "Come scrivi una condizione if?|if x > 0:|if(x > 0)|if x > 0 then|0|Python usa if seguito da due punti.",
            "Come scrivi un else?|else:|otherwise|else if|0|Si usa else seguito da :.",
            "Come scrivi un elif?|elif x == 0:|elseif x == 0|else if x == 0|0|elif è elif, non elseif.",
            "Come fai un ciclo for per x in lista?|for x in lista:|for x = lista|for each x in lista|0|Sintassi corretta: for x in lista:",
            "Come fai un ciclo while?|while x < 5:|while(x < 5)|do while x < 5|0|while usa i due punti per iniziare il blocco.",
            "Come interrompi un ciclo?|break|stop|exit|0|break esce dal ciclo immediatamente.",
            "Come salti un’iterazione di un ciclo?|continue|skip|pass|0|continue salta l'iterazione corrente.",
            "Come fai nulla in Python?|pass|null|none|0|pass è un'istruzione nulla.",
            "Qual è il valore booleano vero?|True|TRUE|1|0|In Python True è booleano vero.",
            "Qual è il valore booleano falso?|False|0|Falsey|0|False rappresenta il booleano falso.",
            "Come unisci due stringhe 'Ciao' e 'Mondo'?|'Ciao' + 'Mondo'|'Ciao'.concat('Mondo')|'Ciao'.append('Mondo')|0|L’operatore + concatena le stringhe.",
            "Come ripeti una stringa 3 volte?|'Ciao' * 3|'Ciao'.repeat(3)|'Ciao'.times(3)|0|'Ciao' * 3 = 'CiaoCiaoCiao'.",
            "Come trasformi '123' in numero?|int('123')|str('123')|float('123')|0|int() converte la stringa in intero.",
            "Come trasformi 123 in stringa?|str(123)|int(123)|format(123)|0|str() converte un numero in stringa.",

            // +5 nuove L1
            "Come ottieni il tipo di una variabile?|type(x)|typeof x|x.type|0|type() restituisce il tipo.",
            "Come ottieni input da tastiera?|input()|read()|scan()|0|input() legge da input.",
            "Come converti input in intero?|int(input())|input(int)|readInt()|0|Serve int().",
            "Come controlli lunghezza stringa?|len(s)|s.length|count(s)|0|len() restituisce la lunghezza.",
            "Come arrotondi un numero?|round(x)|floor(x)|int(x)|0|round() arrotonda."
        ],

        L2: [
            "Come aggiungi un elemento a una lista chiamata lista?|lista.append(5)|lista.add(5)|lista.push(5)|0|append() aggiunge elementi.",
            "Come ottieni la lunghezza di una lista?|len(lista)|lista.length|lista.size|0|len() restituisce il numero di elementi.",
            "Come gestisci un errore in Python?|try/except|catch|error handling|0|try/except cattura eccezioni.",
            "Come estrai il primo elemento di una lista?|lista[0]|lista.first|lista.get(0)|0|Gli indici partono da 0.",
            "Come definisci una funzione chiamata saluta?|def saluta():|function saluta()|saluta =>|0|def definisce funzioni.",
            "Come ritorni un valore da una funzione?|return x|yield x|output x|0|return restituisce il valore.",
            "Come fai una copia superficiale di una lista?|lista.copy()|list(lista)|lista.shallow()|0|copy() crea una copia.",
            "Come concatenare due liste?|lista1 + lista2|lista1.concat(lista2)|lista1.append(lista2)|0|+ unisce liste.",
            "Come ordini una lista in ordine crescente?|lista.sort()|sorted(lista)|lista.order()|0|sort() ordina la lista.",
            "Come ordini una lista senza modificarla?|sorted(lista)|lista.sort()|lista.order()|0|sorted() restituisce una nuova lista.",

            // +5 nuove L2
            "Come inverti una lista?|lista.reverse()|reverse(lista)|lista.invert()|0|reverse() inverte la lista.",
            "Come rimuovi ultimo elemento?|lista.pop()|lista.remove()|del lista|0|pop() rimuove ultimo.",
            "Come conti occorrenze?|lista.count(x)|count(lista)|x.count()|0|count() conta valori.",
            "Come copi una lista con slicing?|lista[:] |copy(lista)|slice(lista)|0|[:] crea copia.",
            "Come fai enumerate?|enumerate(lista)|list.enumerate()|for index|0|enumerate() fornisce indice."
        ],

        L3: [
            "Come definisci una classe chiamata Persona?|class Persona:|def Persona():|Persona class|0|class definisce classi.",
            "Come erediti da una classe Animal?|class Dog(Animal):|class Dog < Animal:|class Dog inherits Animal|0|Sintassi corretta.",
            "Come definisci il costruttore?|def __init__(self):|def init():|def constructor():|0|__init__ è il costruttore.",
            "Come accedi a un attributo?|oggetto.attributo|oggetto->attributo|oggetto[attributo]|0|Si usa il punto.",
            "Come sovrascrivi __str__?|def __str__(self):|def str(self):|def __repr__(self):|0|__str__ definisce stringa.",

            // +5 nuove L3
            "Come controlli il tipo?|isinstance(x, Classe)|type(x)==Classe|x is Classe|0|isinstance è corretto.",
            "Come usi super?|super().__init__()|super()|Base.init()|0|super() chiama la base.",
            "Come crei una lambda?|lambda x: x*2|def lambda()|x => x*2|0|lambda crea funzioni anonime.",
            "Come usi map?|map(f, lista)|lista.map(f)|apply(f)|0|map applica funzione.",
            "Come usi filter?|filter(f, lista)|lista.filter()|select(f)|0|filter filtra valori."
        ],

        L4: [
            "Come fai coroutine?|async def f(): await g()|def f(): yield g()|async f()|0|async/await crea coroutine.",
            "Come lanci un task async?|asyncio.create_task(f())|asyncio.run(f)|task(f)|0|create_task avvia task.",
            "Come definisci context manager?|__enter__ / __exit__|with only|context()|0|Serve enter/exit.",
            "Come fai weak reference?|weakref.ref(obj)|ref(obj)|weak(obj)|0|weakref crea ref debole.",
            "Come serializzi oggetti?|pickle.dump(obj,f)|json.dump(obj)|save(obj)|0|pickle serializza oggetti.",

            // +5 nuove L4
            "Come usi yield from?|yield from gen()|yield gen()|for yield|0|yield from delega.",
            "Come crei iteratori?|__iter__ e __next__|for loop|range|0|Definisce iteratore.",
            "Come usi lru_cache?|@lru_cache()|@cache|cache(f)|0|Memorizza risultati.",
            "Come definisci __slots__?|__slots__=['x']|slots()|@slots|0|Riduce memoria.",
            "Come usi typing?|from typing import List|type(list)|hint()|0|typing fornisce hint."
        ]
    }
};


const domandaRepo = {
    ...domandaRepo,
    JavaScript: {
        L1: [
            "Come stampi Ciao?|console.log('Ciao')|print('Ciao')|echo 'Ciao'|0|console.log stampa in console.",
            "Come dichiari una variabile?|let x = 5|var: x = 5|int x = 5|0|let dichiara variabili.",
            "Che tipo è 'ciao'?|string|String|text|0|'ciao' è una stringa.",
            "Come fai un commento?|// commento|# commento|<!-- -->|0|// è il commento JS.",
            "Come confronti due valori uguali?|==|=|=>|0|== confronta valori.",

            // +5 nuove L1
            "Come confronti tipo e valore?|===|==|=|0|=== è confronto stretto.",
            "Come sommi 2 numeri?|a + b|a plus b|add(a,b)|0|+ somma.",
            "Come sottrai?|a - b|a minus b|sub(a,b)|0|- sottrae.",
            "Come moltiplichi?|a * b|a x b|mul(a,b)|0|* moltiplica.",
            "Come dividi?|a / b|a : b|div(a,b)|0|/ divide."
        ],

        L2: [
            "Come crei una funzione?|function f(){}|def f()|fun f()|0|function definisce funzioni.",
            "Come ritorni un valore?|return x|yield x|output x|0|return restituisce valore.",
            "Come crei un array?|[1,2,3]|array(1,2,3)|{1,2,3}|0|[] crea array.",
            "Come accedi al primo elemento?|arr[0]|arr.first|arr.get(0)|0|Indice 0.",
            "Come aggiungi elemento a array?|arr.push(5)|arr.add(5)|push(arr,5)|0|push aggiunge.",

            // +5 nuove L2
            "Come rimuovi ultimo elemento?|arr.pop()|arr.remove()|pop(arr)|0|pop rimuove ultimo.",
            "Come ottieni lunghezza?|arr.length|len(arr)|size(arr)|0|length è proprietà.",
            "Come unisci array?|a.concat(b)|a + b|merge(a,b)|0|concat unisce.",
            "Come iteri array?|forEach()|loop()|iterate()|0|forEach itera.",
            "Come mappi array?|map()|foreach()|loop()|0|map trasforma."
        ],

        L3: [
            "Come definisci una classe?|class A {}|function A(){}|new Class()|0|class definisce classi.",
            "Come crei un oggetto?|new A()|A()|object A|0|new istanzia.",
            "Come erediti?|class B extends A{}|class B:A|inherit A|0|extends eredita.",
            "Come definisci costruttore?|constructor(){}|init(){}|new(){}|0|constructor è speciale.",
            "Come accedi a proprietà?|obj.prop|obj->prop|obj[prop()]|0|Si usa il punto.",

            // +5 nuove L3
            "Come fai metodo statico?|static f(){}|function static f|class static|0|static crea metodo.",
            "Come esporti modulo?|export default x|module x|public x|0|export esporta.",
            "Come importi modulo?|import x from 'x'|include x|require x|0|import carica.",
            "Come usi this?|this.x|self.x|me.x|0|this è contesto.",
            "Come controlli array?|Array.isArray(x)|typeof x|x is array|0|isArray verifica."
        ],

        L4: [
            "Come definisci funzione async?|async function f(){}|function async f|async f()|0|async abilita await.",
            "Come attendi promessa?|await p|wait p|then p|0|await aspetta.",
            "Come crei Promise?|new Promise()|Promise()|promise{}|0|Promise costruttore.",
            "Come gestisci errori?|try/catch|if error|onerror|0|try/catch gestisce.",
            "Come fai fetch?|fetch(url)|get(url)|request(url)|0|fetch fa richieste.",

            // +5 nuove L4
            "Come cloni oggetto?|{...obj}|clone(obj)|copy(obj)|0|spread clona.",
            "Come destrutturi?|const {a}=obj|get a|obj[a]|0|destructuring estrae.",
            "Come usa optional chaining?|obj?.a|obj.a?|if obj|0|?. evita errori.",
            "Come usa nullish?|a ?? b|a || b|null(a,b)|0|?? gestisce null.",
            "Come congeli oggetto?|Object.freeze(o)|freeze(o)|lock(o)|0|freeze blocca."
        ]
    }
};


const domandaRepo = {
    ...domandaRepo,
    Java: {
        L1: [
            "Come stampi Ciao?|System.out.println(\"Ciao\");|print(\"Ciao\")|echo Ciao|0|println stampa testo.",
            "Come dichiari una variabile int?|int x = 5;|x = 5;|var x = 5;|0|int dichiara interi.",
            "Che tipo è 3.14?|double|int|float|0|3.14 è double.",
            "Come fai un commento?|// commento|# commento|<!-- -->|0|// commento singola linea.",
            "Come confronti due numeri?|==|=|equals|0|== confronta primitivi.",

            // +5 nuove L1
            "Come sommi due int?|a + b|a plus b|add(a,b)|0|+ somma.",
            "Come sottrai?|a - b|a minus b|sub(a,b)|0|- sottrae.",
            "Come moltiplichi?|a * b|a x b|mul(a,b)|0|* moltiplica.",
            "Come dividi?|a / b|a : b|div(a,b)|0|/ divide.",
            "Come fai modulo?|a % b|a mod b|mod(a,b)|0|% resto."
        ],

        L2: [
            "Come crei un array?|int[] a = {1,2,3};|array a = (1,2,3)|int a = []|0|Array con {}.",
            "Come accedi primo elemento?|a[0]|a.first()|a.get(0)|0|Indice parte da 0.",
            "Come ottieni lunghezza array?|a.length|len(a)|a.size()|0|length è proprietà.",
            "Come fai ciclo for?|for(int i=0;i<5;i++)|for i in range(5)|foreach i|0|Sintassi for.",
            "Come definisci metodo?|static void f(){}|def f()|function f()|0|Metodo Java.",

            // +5 nuove L2
            "Come fai foreach?|for(int x : a)|foreach x in a|for a|0|Enhanced for.",
            "Come ritorni valore?|return x;|yield x|output x|0|return restituisce.",
            "Come converti String a int?|Integer.parseInt(s)|int(s)|parse(s)|0|parseInt converte.",
            "Come confronti String?|s.equals(t)|s==t|compare(s,t)|0|equals confronta.",
            "Come aggiungi a ArrayList?|list.add(x)|list.push(x)|add(list,x)|0|add inserisce."
        ],

        L3: [
            "Come definisci una classe?|class A {}|def A()|A = class|0|class definisce.",
            "Come crei oggetto?|new A()|A()|create A|0|new istanzia.",
            "Come erediti?|class B extends A|class B:A|inherit A|0|extends eredita.",
            "Come definisci costruttore?|A(){}|constructor(){}|init(){}|0|Costruttore = nome classe.",
            "Come accedi a campo?|obj.x|obj->x|obj[x]|0|Si usa il punto.",

            // +5 nuove L3
            "Come fai override?|@Override|override|@extend|0|Annotazione override.",
            "Come definisci metodo statico?|static void f()|void static f()|function f()|0|static su metodo.",
            "Come rendi campo privato?|private int x;|int x private|hide x|0|private nasconde.",
            "Come usi super?|super()|base()|parent()|0|super chiama padre.",
            "Come implementi interfaccia?|implements I|extends I|uses I|0|implements interfaccia."
        ],

        L4: [
            "Come gestisci eccezioni?|try/catch|if error|onerror|0|try/catch.",
            "Come lanci eccezione?|throw new Exception()|raise Exception()|error()|0|throw lancia.",
            "Come usi generics?|List<String>|List(str)|Array<String>|0|Generics tipizzano.",
            "Come crei thread?|new Thread()|thread()|Thread.create()|0|Thread Java.",
            "Come sincronizzi metodo?|synchronized|lock|mutex|0|synchronized protegge.",

            // +5 nuove L4
            "Come usi lambda?|x -> x+1|lambda x|function(x)|0|Lambda Java.",
            "Come usi stream?|list.stream()|list.flow()|stream(list)|0|Stream API.",
            "Come filtri stream?|filter(x->x>0)|where(x)|select(x)|0|filter filtra.",
            "Come mappi stream?|map(x->x*2)|transform(x)|each(x)|0|map trasforma.",
            "Come raccogli?|collect()|gather()|toList()|0|collect raccoglie."
        ]
    }
};


const domandaRepo = {
    ...domandaRepo,
    MySQL: {
        L1: [
            "Come selezioni tutti i dati da una tabella?|SELECT * FROM tabella;|GET * FROM tabella;|FETCH tabella;|0|SELECT * legge tutti i dati.",
            "Come inserisci un record?|INSERT INTO tabella VALUES();|ADD RECORD tabella;|PUT tabella;|0|INSERT aggiunge dati.",
            "Come aggiorni dati?|UPDATE tabella SET col=1;|MODIFY tabella;|CHANGE tabella;|0|UPDATE modifica dati.",
            "Come cancelli dati?|DELETE FROM tabella;|REMOVE tabella;|DROP tabella;|0|DELETE cancella righe.",
            "Come filtri risultati?|WHERE|FILTER|IF|0|WHERE filtra righe.",

            // +5 nuove L1
            "Come ordini risultati?|ORDER BY col|SORT col|GROUP col|0|ORDER BY ordina.",
            "Come limiti risultati?|LIMIT 5|TOP 5|MAX 5|0|LIMIT limita.",
            "Come eviti duplicati?|DISTINCT|UNIQUE|NODUP|0|DISTINCT elimina duplicati.",
            "Come conti righe?|COUNT(*)|SUM(*)|TOTAL|0|COUNT conta.",
            "Come rinomini colonna?|AS|RENAME|ALIAS|0|AS crea alias."
        ],

        L2: [
            "Come unisci tabelle?|JOIN|MERGE|UNION|0|JOIN unisce tabelle.",
            "Come fai LEFT JOIN?|LEFT JOIN|LEFT MERGE|OUTER LEFT|0|LEFT JOIN include null.",
            "Come raggruppi?|GROUP BY|ORDER BY|COLLECT|0|GROUP BY raggruppa.",
            "Come filtri gruppi?|HAVING|WHERE|FILTER|0|HAVING filtra gruppi.",
            "Come crei indice?|CREATE INDEX|ADD INDEX|MAKE INDEX|0|INDEX velocizza.",

            // +5 nuove L2
            "Come unisci senza duplicati?|UNION|JOIN|MERGE|0|UNION elimina duplicati.",
            "Come unisci con duplicati?|UNION ALL|UNION|JOIN|0|UNION ALL mantiene.",
            "Come vedi struttura tabella?|DESCRIBE tabella|SHOW tabella|INFO tabella|0|DESCRIBE mostra schema.",
            "Come rinomini tabella?|RENAME TABLE a TO b|ALTER a NAME b|MOVE a b|0|RENAME cambia nome.",
            "Come elimini indice?|DROP INDEX|REMOVE INDEX|DELETE INDEX|0|DROP INDEX rimuove."
        ],

        L3: [
            "Come crei tabella?|CREATE TABLE|MAKE TABLE|NEW TABLE|0|CREATE TABLE crea.",
            "Come definisci chiave primaria?|PRIMARY KEY|MAIN KEY|ID KEY|0|PRIMARY KEY identifica.",
            "Come definisci chiave esterna?|FOREIGN KEY|LINK KEY|OUT KEY|0|FOREIGN collega.",
            "Come modifichi colonna?|ALTER TABLE|CHANGE TABLE|EDIT TABLE|0|ALTER modifica.",
            "Come aggiungi colonna?|ADD COLUMN|NEW COLUMN|INSERT COLUMN|0|ADD COLUMN aggiunge.",

            // +5 nuove L3
            "Come imposti NOT NULL?|NOT NULL|NO NULL|REQUIRED|0|NOT NULL obbliga.",
            "Come imposti default?|DEFAULT 0|SET 0|AUTO 0|0|DEFAULT valore.",
            "Come auto increment?|AUTO_INCREMENT|AUTO|INCREMENT|0|AUTO_INCREMENT aumenta.",
            "Come vincolo unico?|UNIQUE|DISTINCT|ONLY|0|UNIQUE vincolo.",
            "Come elimina tabella?|DROP TABLE|DELETE TABLE|REMOVE TABLE|0|DROP elimina."
        ],

        L4: [
            "Come inizi transazione?|START TRANSACTION|BEGIN|OPEN TRANS|0|Avvia transazione.",
            "Come confermi?|COMMIT|SAVE|END|0|COMMIT salva.",
            "Come annulli?|ROLLBACK|UNDO|CANCEL|0|ROLLBACK annulla.",
            "Come crei vista?|CREATE VIEW|MAKE VIEW|NEW VIEW|0|VIEW salva query.",
            "Come fai trigger?|CREATE TRIGGER|NEW TRIGGER|ADD TRIGGER|0|TRIGGER evento.",

            // +5 nuove L4
            "Come fai stored procedure?|CREATE PROCEDURE|MAKE PROC|NEW PROC|0|Procedure SQL.",
            "Come chiami procedure?|CALL proc()|RUN proc()|EXEC proc()|0|CALL esegue.",
            "Come usi IF?|IF(cond, a, b)|CASE|WHEN|0|IF condizionale.",
            "Come usi CASE?|CASE WHEN THEN END|IF ELSE|SWITCH|0|CASE multiplo.",
            "Come blocchi tabella?|LOCK TABLES|FREEZE|MUTEX|0|LOCK blocca."
        ]
    }
};


const domandaRepo = {
    ...domandaRepo,
    HTML: {
        L1: [
            "Cos'è HTML?|Un linguaggio di markup|Un linguaggio di programmazione|Un database|0|HTML struttura pagine.",
            "Quale tag crea un titolo?|<h1>|<p>|<title>|0|h1 è titolo.",
            "Quale tag crea paragrafo?|<p>|<div>|<span>|0|p è paragrafo.",
            "Come crei link?|<a href='url'>|<link>|<url>|0|a crea link.",
            "Come inserisci immagine?|<img src='img'>|<image>|<pic>|0|img mostra immagini.",

            // +5 nuove L1
            "Quale tag lista non ordinata?|<ul>|<ol>|<li>|0|ul lista puntata.",
            "Quale tag lista ordinata?|<ol>|<ul>|<li>|0|ol numerata.",
            "Quale tag elemento lista?|<li>|<ul>|<ol>|0|li elemento.",
            "Quale tag va a capo?|<br>|<hr>|<lb>|0|br va a capo.",
            "Quale tag linea orizzontale?|<hr>|<br>|<line>|0|hr linea."
        ],

        L2: [
            "Cos'è un attributo?|Info extra tag|Tag speciale|Valore CSS|0|Attributo estende tag.",
            "Come aggiungi classe?|class='x'|id='x'|style='x'|0|class assegna classe.",
            "Come aggiungi id?|id='x'|class='x'|name='x'|0|id identifica.",
            "Come commenti HTML?|<!-- -->|//|#|0|Commento HTML.",
            "Come includi CSS?|<link>|<style>|<css>|0|link collega CSS.",

            // +5 nuove L2
            "Come includi JS?|<script>|<js>|<code>|0|script carica JS.",
            "Come input testo?|<input type='text'>|<text>|<input>|0|input testo.",
            "Come checkbox?|<input type='checkbox'>|<check>|<box>|0|checkbox.",
            "Come bottone?|<button>|<btn>|<click>|0|button cliccabile.",
            "Come form?|<form>|<input>|<data>|0|form invia dati."
        ],

        L3: [
            "Cos'è un div?|Contenitore|Testo|Immagine|0|div è contenitore.",
            "Cos'è span?|Inline|Blocco|Lista|0|span inline.",
            "Cos'è semantico?|Tag con significato|Solo stile|Solo JS|0|Semantica aiuta.",
            "Quale è header?|<header>|<top>|<head>|0|header semantico.",
            "Quale è footer?|<footer>|<bottom>|<end>|0|footer semantico.",

            // +5 nuove L3
            "Quale è nav?|<nav>|<menu>|<link>|0|nav navigazione.",
            "Quale è section?|<section>|<div>|<part>|0|section sezione.",
            "Quale è article?|<article>|<post>|<blog>|0|article contenuto.",
            "Quale è main?|<main>|<body>|<content>|0|main principale.",
            "Quale è aside?|<aside>|<side>|<extra>|0|aside laterale."
        ],

        L4: [
            "Cos'è DOCTYPE?|Dichiara HTML|Tag visivo|Script|0|DOCTYPE standard.",
            "Cos'è accessibilità?|Usabile per tutti|Solo disabili|Solo SEO|0|Accessibilità inclusiva.",
            "Cos'è SEO?|Ottimizzazione motori|Grafica|JS|0|SEO migliora ranking.",
            "Cos'è responsive?|Adattabile|Veloce|Statico|0|Responsive si adatta.",
            "Cos'è meta viewport?|Controllo layout|Titolo|Script|0|Viewport gestisce scala.",

            // +5 nuove L4
            "Cos'è ARIA?|Attributi accessibilità|CSS|JS|0|ARIA aiuta screen reader.",
            "Cos'è lazy loading?|Carica dopo|Carica tutto|Cache|0|Lazy carica tardi.",
            "Cos'è semantic HTML?|Tag significativi|Solo div|CSS|0|Semantica chiara.",
            "Cos'è web standard?|Regole W3C|Framework|Browser|0|Standard comuni.",
            "Cos'è validazione HTML?|Controllo errori|Design|SEO|0|Validazione verifica."
        ]
    }
};

const challenges5 = {
    Python: [
        { task: "Conta da 1 a 3", logic: "for i in range(1, 4)", output: "1\n2\n3", userStatus: null },
        { task: "Stampa numeri pari fino a 6", logic: "for i in range(2,7,2)", output: "2\n4\n6", userStatus: null },
        { task: "Somma numeri da 1 a 5", logic: "sum(range(1,6))", output: "15", userStatus: null },
        { task: "Crea una lista di quadrati 1-5", logic: "[i*i for i in range(1,6)]", output: "[1, 4, 9, 16, 25]", userStatus: null },
        { task: "Stampa 'Ciao' 3 volte usando ciclo", logic: "for i in range(3): print('Ciao')", output: "Ciao\nCiao\nCiao", userStatus: null },
        // Nuove 5
        { task: "Stampa numeri da 5 a 1", logic: "for i in range(5,0,-1)", output: "5\n4\n3\n2\n1", userStatus: null },
        { task: "Crea lista con valori doppi di 1-5", logic: "[i*2 for i in range(1,6)]", output: "[2, 4, 6, 8, 10]", userStatus: null },
        { task: "Conta caratteri in 'Python'", logic: "len('Python')", output: "6", userStatus: null },
        { task: "Somma elementi lista [1,2,3,4]", logic: "sum([1,2,3,4])", output: "10", userStatus: null },
        { task: "Crea dizionario da lista [1,2,3]", logic: "{i:i*i for i in [1,2,3]}", output: "{1: 1, 2: 4, 3: 9}", userStatus: null }
    ],
    JavaScript: [
        { task: "Conta da 1 a 5", logic: "for(let i=1;i<=5;i++)", output: "1\n2\n3\n4\n5", userStatus: null },
        { task: "Ciclo su array [1,2,3]", logic: "for(let x of [1,2,3])", output: "1\n2\n3", userStatus: null },
        { task: "Somma numeri da 1 a 5", logic: "let sum=0;for(let i=1;i<=5;i++)", output: "15", userStatus: null },
        { task: "Stampa solo numeri pari 1-10", logic: "if(i%2===0)", output: "2\n4\n6\n8\n10", userStatus: null },
        { task: "Crea array di quadrati 1-5", logic: "[1,2,3,4,5].map(x=>x*x)", output: "[1,4,9,16,25]", userStatus: null },
        // Nuove 5
        { task: "Conta da 10 a 1", logic: "for(let i=10;i>=1;i--)", output: "10\n9\n8\n7\n6\n5\n4\n3\n2\n1", userStatus: null },
        { task: "Somma elementi array [5,10,15]", logic: "[5,10,15].reduce((a,b)=>a+b,0)", output: "30", userStatus: null },
        { task: "Stampa 'JS' 4 volte", logic: "for(let i=0;i<4;i++) console.log('JS')", output: "JS\nJS\nJS\nJS", userStatus: null },
        { task: "Crea array con valori doppi [1,2,3]", logic: "[1,2,3].map(x=>x*2)", output: "[2,4,6]", userStatus: null },
        { task: "Filtra numeri pari da [1,2,3,4,5]", logic: "[1,2,3,4,5].filter(x=>x%2===0)", output: "[2,4]", userStatus: null }
    ],
    Java: [
        { task: "Main che stampa 'Ciao'", logic: "System.out.println(\"Ciao\")", output: "Ciao", userStatus: null },
        { task: "Conta da 1 a 3", logic: "for(int i=1;i<=3;i++)", output: "1\n2\n3", userStatus: null },
        { task: "Somma numeri 1-5", logic: "int sum=0;for(int i=1;i<=5;i++)", output: "15", userStatus: null },
        { task: "Stampa numeri pari 1-6", logic: "if(i%2==0)", output: "2\n4\n6", userStatus: null },
        // Nuove 5
        { task: "Conta da 5 a 1", logic: "for(int i=5;i>=1;i--)", output: "5\n4\n3\n2\n1", userStatus: null },
        { task: "Crea array di quadrati [1-5]", logic: "int[] squares = {1,4,9,16,25};", output: "[1,4,9,16,25]", userStatus: null },
        { task: "Somma array [1,2,3,4]", logic: "int sum=0;for(int i: new int[]{1,2,3,4}) sum+=i;", output: "10", userStatus: null },
        { task: "Stampa 'Hello' 3 volte", logic: "for(int i=0;i<3;i++) System.out.println(\"Hello\");", output: "Hello\nHello\nHello", userStatus: null },
        { task: "Conta numeri dispari 1-5", logic: "if(i%2!=0)", output: "1\n3\n5", userStatus: null }
    ],
    MySQL: [
        { task: "Seleziona tutti da tabella utenti", logic: "SELECT * FROM utenti", output: "OK", userStatus: null },
        { task: "Conta record tabella prodotti", logic: "SELECT COUNT(*) FROM prodotti", output: "OK", userStatus: null },
        { task: "Seleziona nome e prezzo da prodotti", logic: "SELECT nome, prezzo FROM prodotti", output: "OK", userStatus: null },
        { task: "Seleziona prodotti con prezzo > 100", logic: "SELECT * FROM prodotti WHERE prezzo>100", output: "OK", userStatus: null },
        // Nuove 5
        { task: "Seleziona utenti con età > 18", logic: "SELECT * FROM utenti WHERE eta>18", output: "OK", userStatus: null },
        { task: "Seleziona nomi distinct", logic: "SELECT DISTINCT nome FROM utenti", output: "OK", userStatus: null },
        { task: "Ordina utenti per nome", logic: "SELECT * FROM utenti ORDER BY nome", output: "OK", userStatus: null },
        { task: "Seleziona primi 3 prodotti", logic: "SELECT * FROM prodotti LIMIT 3", output: "OK", userStatus: null },
        { task: "Seleziona prodotti prezzo tra 50 e 100", logic: "SELECT * FROM prodotti WHERE prezzo BETWEEN 50 AND 100", output: "OK", userStatus: null }
    ],
    HTML: [
        { task: "Crea un div", logic: "<div>", output: "OK", userStatus: null },
        { task: "Crea un paragrafo", logic: "<p>", output: "OK", userStatus: null },
        { task: "Crea un link", logic: "<a href=''>", output: "OK", userStatus: null },
        { task: "Crea un'immagine", logic: "<img src=''>", output: "OK", userStatus: null },
        // Nuove 5
        { task: "Crea una lista non ordinata", logic: "<ul>", output: "OK", userStatus: null },
        { task: "Crea lista ordinata", logic: "<ol>", output: "OK", userStatus: null },
        { task: "Crea un header h1", logic: "<h1>", output: "OK", userStatus: null },
        { task: "Crea un bottone", logic: "<button>", output: "OK", userStatus: null },
        { task: "Crea un input text", logic: "<input type='text'>", output: "OK", userStatus: null }
    ]
};
