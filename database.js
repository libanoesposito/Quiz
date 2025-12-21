const quizDB = {
  "Python": {
    "L1": [
      {"q":"Come si dichiara una variabile in Python?","options":["var x = 5","x = 5","int x = 5","let x = 5"],"correct":1,"exp":"In Python basta assegnare un valore a un nome.","code":"x = 5"},
      {"q":"Come stampi 'Ciao' su console?","options":["print('Ciao')","echo('Ciao')","console.log('Ciao')","System.out.println('Ciao')"],"correct":0,"exp":"In Python si usa print().","code":"print('Ciao')"},
      {"q":"Come si ottiene input dall'utente?","options":["input('Inserisci: ')","readline()","scan()","gets()"],"correct":0,"exp":"La funzione input() legge una riga da stdin.","code":"nome = input('Nome: ')"},
      {"q":"Qual è il tipo per i numeri decimali?","options":["float","double","decimal","real"],"correct":0,"exp":"In Python i numeri in virgola mobile sono di tipo float.","code":"x = 3.14"},
      {"q":"Come si fa un commento su una linea?","options":["# commento","// commento","<!-- commento -->","/* commento */"],"correct":0,"exp":"Il simbolo # inizia un commento.","code":"# Questo è un commento"},
      {"q":"Come si concatena due stringhe?","options":["'a' + 'b'","'a'. 'b'","strcat('a','b')","'a' .. 'b'"],"correct":0,"exp":"L'operatore + concatena stringhe.","code":"'Ciao' + ' mondo'"},
      {"q":"Come si converte una stringa in intero?","options":["int('5')","parseInt('5')","Integer.parseInt('5')","to_int('5')"],"correct":0,"exp":"La funzione int() converte una stringa in intero.","code":"numero = int('10')"},
      {"q":"Qual è il valore booleano per vero?","options":["True","true","TRUE","1"],"correct":0,"exp":"In Python il valore vero è True (maiuscolo).","code":"verita = True"},
      {"q":"Come si crea una lista vuota?","options":["[]","list()","{}","new List()"],"correct":0,"exp":"Le parentesi quadre creano una lista vuota.","code":"lista = []"},
      {"q":"Come si ottiene la lunghezza di una stringa?","options":["len('ciao')","'ciao'.length","strlen('ciao')","size('ciao')"],"correct":0,"exp":"La funzione len() restituisce la lunghezza.","code":"len('Python')"},
      {"q":"Come si accede al primo elemento di una lista?","options":["lista[0]","lista[1]","lista.first","lista.get(0)"],"correct":0,"exp":"Gli indici in Python partono da 0.","code":"primo = lista[0]"},
      {"q":"Come si aggiunge un elemento a una lista?","options":["lista.append(5)","lista.add(5)","lista.push(5)","lista << 5"],"correct":0,"exp":"Il metodo append() aggiunge in fondo.","code":"lista.append('nuovo')"}
    ],
    "L2": [
      {"q":"Come si scrive un ciclo for che stampa da 1 a 5?","options":["for i in range(1,6): print(i)","for i in 1..5: print(i)","while i<=5: print(i)","for i=1;i<=5;i++: print(i)"],"correct":0,"exp":"range(1,6) genera i numeri 1-5","code":"for i in range(1,6): print(i)"},
      {"q":"Come si definisce una funzione?","options":["def funzione(): pass","function funzione(){}","fun funzione(): pass","func funzione(){}"],"correct":0,"exp":"In Python si usa 'def' per definire una funzione.","code":"def funzione(): pass"},
      {"q":"Come si scrive una condizione if?","options":["if condizione: pass","if (condizione) { }","if condizione then","when condizione:"],"correct":0,"exp":"I due punti : e l'indentazione definiscono il blocco.","code":"if x > 0:\n    print('positivo')"},
      {"q":"Come si scrive un ciclo while?","options":["while condizione: pass","while (condizione) { }","do while condizione:","repeat until condizione"],"correct":0,"exp":"while seguito da condizione e blocco indentato.","code":"while x < 10:\n    x += 1"},
      {"q":"Come si usa elif?","options":["if ... elif ... else ...","if ... else if ...","if ... else: if ...","switch caso"],"correct":0,"exp":"elif è l'equivalente di else if.","code":"if x > 0:\n    print('pos')\nelif x < 0:\n    print('neg')"},
      {"q":"Come si itera su una lista?","options":["for elem in lista: print(elem)","for elem of lista:","foreach elem in lista:","lista.forEach()"],"correct":0,"exp":"for ... in itera direttamente sugli elementi.","code":"for frutto in ['mela','pera']:\n    print(frutto)"},
      {"q":"Come si definisce una funzione con parametri?","options":["def somma(a, b): return a+b","function somma(a,b){return a+b}","def somma(a,b) -> a+b","fun somma(a,b) = a+b"],"correct":0,"exp":"I parametri vanno tra parentesi dopo il nome.","code":"def somma(a, b):\n    return a + b"},
      {"q":"Come si usa un valore di default per un parametro?","options":["def f(x=10): pass","def f(x): x=10","function f(x=10)","def f(x default 10)"],"correct":0,"exp":"Si assegna il valore default nella definizione.","code":"def saluta(nome='mondo'):\n    print(f'Ciao {nome}')"},
      {"q":"Come si restituisce un valore da una funzione?","options":["return valore","yield valore","echo valore","print valore"],"correct":0,"exp":"return termina la funzione e restituisce il valore.","code":"def quadrato(x):\n    return x**2"},
      {"q":"Come si crea un dizionario?","options":["{'chiave': 'valore'}","{chiave: valore}","new Map()","dict(chiave=valore)"],"correct":0,"exp":"Le parentesi graffe con chiave:valore.","code":"persona = {'nome': 'Mario', 'eta': 30}"}
    ],
    "L3": [
      {"q":"Come si apre un file in lettura?","options":["open('file.txt','r')","File('file.txt','r')","read('file.txt')","fopen('file.txt')"],"correct":0,"exp":"La funzione open() apre un file.","code":"f = open('file.txt','r')"},
      {"q":"Come si gestisce un'eccezione?","options":["try: ... except: ...","catch: ...","handle: ...","except: ... try: ..."],"correct":0,"exp":"Python usa try/except per gestire errori.","code":"try:\n    pass\nexcept:\n    pass"},
      {"q":"Come si legge tutto il contenuto di un file?","options":["f.read()","f.readlines()","f.content","f.getAll()"],"correct":0,"exp":"read() legge l'intero file come stringa.","code":"with open('file.txt') as f:\n    contenuto = f.read()"},
      {"q":"Come si scrive su un file?","options":["f.write('testo')","f.print('testo')","f << 'testo'","echo > file"],"correct":0,"exp":"write() scrive una stringa nel file.","code":"with open('file.txt','w') as f:\n    f.write('Ciao')"},
      {"q":"Come si usa with per i file?","options":["with open(...) as f: ...","using (open(...))","try: open... finally: close","auto close open"],"correct":0,"exp":"with chiude automaticamente il file.","code":"with open('file.txt') as f:\n    print(f.read())"},
      {"q":"Come si cattura un'eccezione specifica?","options":["except ValueError:","catch (ValueError)","on ValueError:","except: ValueError"],"correct":0,"exp":"Si specifica il tipo dopo except.","code":"try:\n    int('abc')\nexcept ValueError:\n    print('Errore')"},
      {"q":"Come si usa finally?","options":["try: ... except: ... finally: ...","try: ... finally: ...","cleanup: ...","always: ..."],"correct":0,"exp":"finally si esegue sempre.","code":"try:\n    risky()\nfinally:\n    cleanup()"},
      {"q":"Come si solleva un'eccezione?","options":["raise ValueError('msg')","throw new Error()","error('msg')","assert false"],"correct":0,"exp":"raise solleva un'eccezione.","code":"if x < 0:\n    raise ValueError('x negativo')"},
      {"q":"Come si importa un modulo?","options":["import math","require('math')","#include <math>","from math import *"],"correct":0,"exp":"import carica un modulo.","code":"import random\nprint(random.randint(1,10))"},
      {"q":"Come si crea una classe?","options":["class Nome: pass","class Nome {}","type Nome = class","def class Nome:"],"correct":0,"exp":"class definisce una classe.","code":"class Persona:\n    def __init__(self, nome):\n        self.nome = nome"}
    ],
    "L4": [
      {"q":"Come si crea una lista di quadrati da 1 a 10 con list comprehension?","options":["[x**2 for x in range(1,11)]","list(x**2 for x in 1..10)","[x^2 for x in range(1,11)]","list(map(x**2, range(1,11)))"],"correct":0,"exp":"List comprehension è il modo Pythonico per creare liste.","code":"[x**2 for x in range(1,11)]"},
      {"q":"Come si filtra una list comprehension?","options":["[x for x in range(10) if x%2==0]","[x for x in range(10) where x even]","filter even range(10)","[x | x even for x in range(10)]"],"correct":0,"exp":"Si aggiunge if alla fine.","code":"pari = [x for x in range(10) if x%2==0]"},
      {"q":"Come si usa un decoratore?","options":["@decoratore\ndef funzione(): pass","@decoratore function funzione()","decorator funzione","function.apply(decoratore)"],"correct":0,"exp":"Il simbolo @ applica un decoratore.","code":"@staticmethod\ndef metodo(): pass"},
      {"q":"Come si crea un generatore?","options":["def gen(): yield 1","function* gen(){ yield 1 }","generator gen = yield","(x for x in range(10))"],"correct":0,"exp":"yield crea un generatore.","code":"def count():\n    i=0\n    while True:\n        yield i\n        i+=1"},
      {"q":"Come si usa lambda?","options":["lambda x: x*2","x => x*2","function(x) x*2","fn x -> x*2"],"correct":0,"exp":"lambda crea funzioni anonime.","code":"quadrato = lambda x: x**2"},
      {"q":"Come si usa map?","options":["list(map(fun, iterable))","iterable.map(fun)","for x in iterable: fun(x)","[fun(x) for x in iterable]"],"correct":0,"exp":"map applica una funzione a ogni elemento.","code":"list(map(str, [1,2,3]))"},
      {"q":"Come si usa filter?","options":["list(filter(pred, iterable))","iterable.filter(pred)","[x for x in iterable if pred(x)]","select where"],"correct":0,"exp":"filter seleziona elementi che soddisfano un predicato.","code":"pari = list(filter(lambda x: x%2==0, range(10)))"},
      {"q":"Come si usa reduce?","options":["from functools import reduce\nreduce(fun, iterable)","iterable.reduce(fun)","fold fun iterable","accumulate"],"correct":0,"exp":"reduce applica cumulativamente una funzione.","code":"from functools import reduce\nreduce(lambda a,b: a+b, [1,2,3,4])"},
      {"q":"Come si definisce un property?","options":["@property\ndef nome(self): return self._nome","@nome.getter","property nome","def nome = property()"],"correct":0,"exp":"@property crea un getter.","code":"class C:\n    @property\n    def x(self):\n        return self._x"},
      {"q":"Come si usa dataclass?","options":["from dataclasses import dataclass\n@dataclass\nclass Punto: x:int y:int","class Punto(x,y)","record Punto(int x, int y)","struct Punto"],"correct":0,"exp":"dataclass genera automaticamente metodi comuni.","code":"@dataclass\nclass Persona:\n    nome: str\n    eta: int"}
    ]
  },
  "JavaScript": {
    "L1": [
      {"q":"Come dichiari una variabile?","options":["let x = 5;","x = 5;","var x == 5;","int x = 5;"],"correct":0,"exp":"Si usa 'let' o 'var' in JS (let è preferito per scope blocco)","code":"let x = 5;"},
      {"q":"Come stampi in console?","options":["console.log('Ciao');","print('Ciao');","echo('Ciao');","System.out.println('Ciao');"],"correct":0,"exp":"console.log stampa su console","code":"console.log('Ciao');"},
      {"q":"Come dichiari una costante?","options":["const PI = 3.14;","let PI = 3.14;","var PI = 3.14;","final PI = 3.14;"],"correct":0,"exp":"const dichiara una costante (non riassegnabile)","code":"const ETA = 30;"},
      {"q":"Qual è il tipo per stringhe?","options":["string","String","str","text"],"correct":0,"exp":"Il tipo primitivo è string (ma c'è anche l'oggetto String)","code":"let nome = 'Mario';"},
      {"q":"Come si concatena stringhe?","options":["'a' + 'b'","`a${b}`","'a'.concat('b')","tutte le precedenti"],"correct":3,"exp":"+ è il modo più semplice, ma template literals sono moderni","code":"let saluto = 'Ciao ' + 'mondo';"},
      {"q":"Come si crea un array?","options":["[1,2,3]","new Array(1,2,3)","array(1,2,3)","{1,2,3}"],"correct":0,"exp":"Le parentesi quadre creano un array","code":"let numeri = [10,20,30];"},
      {"q":"Come si accede a un elemento di un array?","options":["arr[0]","arr.get(0)","arr.first","arr(0)"],"correct":0,"exp":"Indici partono da 0","code":"let primo = arr[0];"},
      {"q":"Come si aggiunge un elemento in fondo a un array?","options":["arr.push(5)","arr.add(5)","arr << 5","arr.append(5)"],"correct":0,"exp":"push aggiunge in coda","code":"numeri.push(40);"},
      {"q":"Come si ottiene la lunghezza di un array?","options":["arr.length","arr.size","len(arr)","arr.count"],"correct":0,"exp":"La proprietà length","code":"console.log(arr.length);"},
      {"q":"Come si crea un oggetto?","options":["{chiave: valore}","new Object()","obj = {}","Map()"],"correct":0,"exp":"Letterale oggetto con graffe","code":"let persona = {nome: 'Luca', eta: 25};"}
    ],
    "L2": [
      {"q":"Come si scrive un ciclo for da 1 a 5?","options":["for(let i=1;i<=5;i++){console.log(i);}","for i in 1..5: console.log(i);","while(i<=5){console.log(i);}","for i in range(1,6){console.log(i);}"],"correct":0,"exp":"Sintassi classica del ciclo for","code":"for(let i=1;i<=5;i++){console.log(i);}"},
      {"q":"Come si definisce una funzione?","options":["function f(){ }","func f(){ }","def f(): pass","f = function(): pass"],"correct":0,"exp":"In JS si usa 'function'","code":"function f(){ }"},
      {"q":"Come si definisce una arrow function?","options":["const f = () => {}","function f() => {}","f => {}","arrow f()"],"correct":0,"exp":"Arrow function con =>","code":"const somma = (a,b) => a+b;"},
      {"q":"Come si scrive un if?","options":["if (cond) { }","if cond { }","when cond:","if cond then"],"correct":0,"exp":"Parentesi obbligatorie intorno alla condizione","code":"if (x > 0) {\n    console.log('positivo');\n}"},
      {"q":"Come si usa ternary operator?","options":["cond ? vero : falso","cond ? vero : else falso","if cond then vero else falso","cond ? vero"],"correct":0,"exp":"Operatore condizionale ternario","code":"let msg = eta >= 18 ? 'maggiorenne' : 'minorenne';"},
      {"q":"Come si itera su un array con forEach?","options":["arr.forEach(elem => console.log(elem))","for elem of arr","for elem in arr","arr.map()"],"correct":0,"exp":"forEach esegue una funzione per ogni elemento","code":"numeri.forEach(n => console.log(n));"},
      {"q":"Come si usa for...of?","options":["for (let elem of arr) {}","for (let elem in arr)","foreach elem of arr","arr.for()"],"correct":0,"exp":"for...of itera sui valori","code":"for (let frutto of frutti) console.log(frutto);"},
      {"q":"Come si definisce una funzione con parametri default?","options":["function f(x=10){}","function f(x){ x=10 }","def f(x=10):","function f(x default 10)"],"correct":0,"exp":"Valore default direttamente nel parametro","code":"function saluta(nome='mondo'){\n    console.log('Ciao '+nome);\n}"},
      {"q":"Come si usa spread operator?","options":["[...arr]","arr.copy()","Object.assign()","arr.slice()"],"correct":0,"exp":"... espande un iterable","code":"let nuovo = [...vecchio, 4,5];"},
      {"q":"Come si destruttura un oggetto?","options":["let {nome, eta} = persona;","let [nome, eta] = persona;","persona.nome, persona.eta","extract persona"],"correct":0,"exp":"Destructuring estrae proprietà","code":"let {nome, eta} = {nome:'Anna', eta:28};"}
    ],
    "L3": [
      {"q":"Come si crea una Promise?","options":["new Promise((resolve,reject)=>{})","Promise()","promise()","async()"],"correct":0,"exp":"Si usa 'new Promise' per creare una Promise","code":"new Promise((resolve,reject)=>{})"},
      {"q":"Come si usa async/await?","options":["async function f(){ await something(); }","function f(){ await something(); }","async(){ something(); }","await async function f(){}"],"correct":0,"exp":"Async/await permette di scrivere codice asincrono in modo sincrono","code":"async function f(){ await something(); }"},
      {"q":"Come si gestisce un errore con try/catch?","options":["try { } catch (err) { }","try { } finally { }","onError { }","except err:"],"correct":0,"exp":"try/catch per errori sincroni e asincroni","code":"try {\n    risky();\n} catch (e) {\n    console.error(e);\n}"},
      {"q":"Come si usa fetch per una GET?","options":["fetch(url).then(res => res.json())","xmlhttp.request()","axios.get(url)","request(url)"],"correct":0,"exp":"fetch è l'API moderna per richieste HTTP","code":"fetch('api/dati').then(r => r.json()).then(d => console.log(d));"},
      {"q":"Come si usa await con fetch?","options":["const res = await fetch(url); const data = await res.json();","fetch(url).await()","await fetch(url).json()","fetch.await(url)"],"correct":0,"exp":"Con async/await il codice è più leggibile","code":"async function get(){\n    let res = await fetch(url);\n    return await res.json();\n}"},
      {"q":"Come si crea un timeout?","options":["setTimeout(fn, 1000)","sleep(1000)","wait(1000)","timer(1000)"],"correct":0,"exp":"setTimeout esegue dopo un delay","code":"setTimeout(() => console.log('dopo 2s'), 2000);"},
      {"q":"Come si crea un interval?","options":["setInterval(fn, 1000)","repeat(fn, 1000)","every(1000, fn)","timer.repeat()"],"correct":0,"exp":"setInterval esegue ripetutamente","code":"let id = setInterval(() => console.log('ogni secondo'), 1000);"},
      {"q":"Come si aggiunge un event listener?","options":["elem.addEventListener('click', fn)","elem.onClick = fn","elem.onclick(fn)","bind(elem, 'click', fn)"],"correct":0,"exp":"addEventListener è il modo moderno","code":"btn.addEventListener('click', () => alert('cliccato'));"},
      {"q":"Come si manipola il DOM?","options":["document.querySelector('#id')","getElementById('id')","$ ('#id')","find('#id')"],"correct":0,"exp":"querySelector è flessibile (supporta CSS selector)","code":"let el = document.querySelector('.classe');"},
      {"q":"Come si crea un elemento DOM?","options":["document.createElement('div')","new Element('div')","<div></div>","create('div')"],"correct":0,"exp":"createElement crea un nuovo nodo","code":"let div = document.createElement('div');\ndiv.textContent = 'Ciao';"}
    ],
    "L4": [
      {"q":"Come si clonano oggetti profondamente?","options":["structuredClone(obj)","obj.clone()","JSON.parse(JSON.stringify(obj))","Object.assign({}, obj)"],"correct":0,"exp":"structuredClone clona oggetti profondamente (anche date, map, ecc.)","code":"let copy = structuredClone(obj);"},
      {"q":"Come si usa optional chaining?","options":["obj?.prop?.method()","obj.prop.method if obj","obj && obj.prop","safe(obj.prop)"],"correct":0,"exp":"?. evita errori se valore intermedio è null/undefined","code":"let nome = utente?.profilo?.nome;"},
      {"q":"Come si usa nullish coalescing?","options":["val ?? default","val || default","val ?: default","val or default"],"correct":0,"exp":"?? restituisce default solo se val è null o undefined","code":"let nome = input ?? 'anonimo';"},
      {"q":"Come si definisce una classe?","options":["class Persona { constructor(nome){this.nome=nome} }","function Persona(nome){this.nome=nome}","type Persona = class","class Persona:"],"correct":0,"exp":"Sintassi class ES6","code":"class Rettangolo {\n    constructor(l,h){ this.l=l; this.h=h; }\n    area(){ return this.l*this.h; }\n}"},
      {"q":"Come si usa private fields?","options":["#campoPrivato","private campo","_campo","campo private"],"correct":0,"exp":"# definisce campi veramente privati","code":"class C {\n    #segreto = 42;\n    getSegreto(){ return this.#segreto; }\n}"},
      {"q":"Come si usa Map?","options":["new Map()","{}","new Object()","new Dictionary()"],"correct":0,"exp":"Map conserva l'ordine di inserimento e permette chiavi non-string","code":"let m = new Map();\nm.set('chiave', 'valore');"},
      {"q":"Come si usa Set?","options":["new Set([1,2,2])","new Array().unique()","[1,2,2].uniq","unique([1,2,2])"],"correct":0,"exp":"Set contiene valori unici","code":"let unici = new Set([1,2,2,3]); // {1,2,3}"},
      {"q":"Come si usa Proxy?","options":["new Proxy(target, handler)","Object.observe()","watch(target)","proxy(target)"],"correct":0,"exp":"Proxy intercetta operazioni su oggetto","code":"let p = new Proxy({}, { get(t,k){ console.log('get',k); return t[k]; } });"},
      {"q":"Come si usa Reflect?","options":["Reflect.get(obj, 'prop')","obj.prop","Object.get(obj,'prop')","getattr(obj,'prop')"],"correct":0,"exp":"Reflect fornisce metodi per operazioni meta","code":"Reflect.set(obj, 'prop', valore);"},
      {"q":"Come si usa BigInt?","options":["123n","BigInt(123)","new BigNumber(123)","123.toBig()"],"correct":0,"exp":"BigInt per interi arbitrariamente grandi","code":"let big = 9007199254740992n;"}
    ]
  },
  "Java": {
    "L1": [
      {"q":"Come dichiari una variabile intera?","options":["int x = 5;","x = 5;","let x = 5;","var x = 5;"],"correct":0,"exp":"Java usa il tipo davanti alla variabile","code":"int x = 5;"},
      {"q":"Come stampi su console?","options":["System.out.println('Ciao');","print('Ciao');","console.log('Ciao');","echo('Ciao');"],"correct":0,"exp":"System.out.println stampa in Java","code":"System.out.println('Ciao');"},
      {"q":"Come dichiari una stringa?","options":["String s = \"testo\";","str s = \"testo\";","string s = \"testo\";","char[] s"],"correct":0,"exp":"String è una classe, ma si usa come tipo","code":"String nome = \"Mario\";"},
      {"q":"Come dichiari una costante?","options":["final int ETA = 30;","const int ETA = 30;","static int ETA = 30;","#define ETA 30"],"correct":0,"exp":"final rende la variabile non modificabile","code":"final double PI = 3.14;"},
      {"q":"Qual è il tipo per numeri decimali precisi?","options":["double","float","BigDecimal","decimal"],"correct":2,"exp":"double è comune, ma BigDecimal per precisione monetaria","code":"double x = 3.14;"},
      {"q":"Come si concatena stringhe?","options":["s1 + s2","s1.concat(s2)","String.join(s1,s2)","tutte le precedenti"],"correct":3,"exp":"+ è l'operatore più usato","code":"String saluto = \"Ciao \" + \"mondo\";"},
      {"q":"Come si crea un array di interi?","options":["int[] arr = new int[5];","int arr[] = new int[5];","array<int> arr;","int arr[5];"],"correct":0,"exp":"Sintassi Java per array","code":"int[] numeri = {1,2,3};"},
      {"q":"Come si accede a un elemento di un array?","options":["arr[0]","arr.get(0)","arr(0)","arr.first"],"correct":0,"exp":"Indici da 0","code":"int primo = arr[0];"},
      {"q":"Come si ottiene la lunghezza di un array?","options":["arr.length","arr.length()","len(arr)","arr.size()"],"correct":0,"exp":"length è una proprietà (non metodo)","code":"System.out.println(arr.length);"},
      {"q":"Come dichiari un metodo main?","options":["public static void main(String[] args)","main()","public void main()","static main()"],"correct":0,"exp":"Firma esatta per l'entry point","code":"public static void main(String[] args) {\n    // codice\n}"}
    ],
    "L2": [
      {"q":"Come si scrive un ciclo for da 1 a 5?","options":["for(int i=1;i<=5;i++){System.out.println(i);}","while(i<=5){System.out.println(i);}","for i in 1..5: System.out.println(i);","for i=1;i<=5;i++ System.out.println(i);"],"correct":0,"exp":"Sintassi standard for Java","code":"for(int i=1;i<=5;i++){System.out.println(i);}"},
      {"q":"Come si definisce un metodo?","options":["public void f(){ }","func f(){ }","def f(): pass","function f(){ }"],"correct":0,"exp":"Java usa 'modificatore tipoRitorno nome(parametri)'","code":"public void f(){ }"},
      {"q":"Come si scrive un if?","options":["if (cond) { }","if cond { }","if (cond):","when cond"],"correct":0,"exp":"Parentesi obbligatorie, graffe per blocco","code":"if (x > 0) {\n    System.out.println(\"positivo\");\n}"},
      {"q":"Come si usa switch?","options":["switch (val) { case 1: ... break; }","case val of","match val","if val==1 then"],"correct":0,"exp":"switch con break per evitare fall-through","code":"switch (giorno) {\n    case 1: System.out.println(\"Lunedì\"); break;\n}"},
      {"q":"Come si usa enhanced for?","options":["for (int n : numeri) { }","for (n in numeri)","foreach n in numeri","numeri.forEach()"],"correct":0,"exp":"for-each loop per collezioni/array","code":"for (String s : lista) {\n    System.out.println(s);\n}"},
      {"q":"Come si definisce un metodo con parametri?","options":["public int somma(int a, int b){ return a+b; }","int somma(a,b) return a+b;","def somma(int a, int b): return a+b","function somma(int a, int b)"],"correct":0,"exp":"Tipi espliciti per parametri","code":"public static int massimo(int x, int y) {\n    return x > y ? x : y;\n}"},
      {"q":"Come si usa return?","options":["return valore;","yield valore;","echo valore;","System.out.println(valore)"],"correct":0,"exp":"return restituisce un valore e termina il metodo","code":"return risultato;"},
      {"q":"Come si dichiara un metodo static?","options":["static void f(){}","public static void f(){}","void f() static","static f()"],"correct":1,"exp":"static appartiene alla classe","code":"public static void main(String[] args) {}"},
      {"q":"Come si usa this?","options":["this.campo","self.campo","me.campo","campo"],"correct":0,"exp":"this riferisce all'istanza corrente","code":"this.nome = nome;"},
      {"q":"Come si crea un oggetto?","options":["new Classe()","Classe()","Classe.new()","new Classe"],"correct":0,"exp":"new alloca e chiama il costruttore","code":"Persona p = new Persona(\"Mario\");"}
    ],
    "L3": [
      {"q":"Come si gestisce un'eccezione?","options":["try{ } catch(Exception e){ }","try catch{}","except: ...","handle()"],"correct":0,"exp":"Java usa try/catch/finally","code":"try{ } catch(Exception e){ }"},
      {"q":"Come si crea un array?","options":["int[] arr = new int[5];","arr = [5];","array(5);","int arr[5];"],"correct":0,"exp":"Sintassi array in Java","code":"int[] arr = new int[5];"},
      {"q":"Come si usa ArrayList?","options":["ArrayList<String> list = new ArrayList<>();","List<String> list = new List<>();","vector<String>","arraylist<String>"],"correct":0,"exp":"ArrayList è una lista dinamica","code":"ArrayList<Integer> nums = new ArrayList<>();\nnums.add(5);"},
      {"q":"Come si itera su una List con iterator?","options":["Iterator<String> it = list.iterator(); while(it.hasNext()) { String s = it.next(); }","for (String s : list)","list.forEach()","list.each"],"correct":0,"exp":"Iterator permette rimozione durante iterazione","code":"Iterator<String> it = list.iterator();\nwhile(it.hasNext()) System.out.println(it.next());"},
      {"q":"Come si usa try-with-resources?","options":["try (Scanner sc = new Scanner(file)) { }","using (Scanner sc = ...)","with open ...","auto close"],"correct":0,"exp":"Chiude automaticamente risorse","code":"try (BufferedReader br = new BufferedReader(new FileReader(\"file.txt\"))) {\n    String line = br.readLine();\n}"},
      {"q":"Come si lancia un'eccezione?","options":["throw new Exception(\"msg\");","raise Exception","error(\"msg\")","throw Exception"],"correct":0,"exp":"throw lancia un'eccezione","code":"if (x < 0) throw new IllegalArgumentException(\"negativo\");"},
      {"q":"Come si dichiara un'eccezione checked?","options":["public void f() throws IOException { }","throws IOException in firma","def f() raises IOException","function f() throw IOException"],"correct":0,"exp":"throws nella firma del metodo","code":"public void read() throws IOException {\n    // codice che può lanciare IOException\n}"},
      {"q":"Come si usa StringBuilder?","options":["StringBuilder sb = new StringBuilder(); sb.append(\"testo\");","String +=\"testo\"","Buffer sb = new Buffer()","sb = \"\""],"correct":0,"exp":"StringBuilder per concatenazioni efficienti","code":"StringBuilder sb = new StringBuilder();\nsb.append(\"Ciao\").append(\" mondo\");\nString result = sb.toString();"},
      {"q":"Come si formatta una stringa?","options":["String.format(\"%s ha %d anni\", nome, eta)","nome + \" ha \" + eta + \" anni\"","f\"{nome} ha {eta} anni\"","sprintf"],"correct":0,"exp":"String.format simile a printf","code":"String msg = String.format(\"Valore: %.2f\", 3.14159);"},
      {"q":"Come si usa Math?","options":["Math.pow(2,10)","pow(2,10)","2**10","Math.power(2,10)"],"correct":0,"exp":"Classe Math con metodi statici","code":"double radice = Math.sqrt(16);"}
    ],
    "L4": [
      {"q":"Come si usa generics?","options":["List<String> list = new ArrayList<>();","List list = new List<String>();","Array<String> list = [];","var list = List<String>();"],"correct":0,"exp":"Java usa <> per i generics","code":"List<String> list = new ArrayList<>();"},
      {"q":"Come si definisce una classe generica?","options":["class Box<T> { T valore; }","class Box<T> { private T valore; }","generic class Box<T>","template <T> class Box"],"correct":1,"exp":"Tipo parametro tra <> dopo il nome classe","code":"public class Pair<K,V> {\n    private K key;\n    private V value;\n}"},
      {"q":"Come si usa Stream?","options":["list.stream().filter(s->s.length()>3).collect(Collectors.toList())","list.filter().map()","stream(list)","list.stream"],"correct":0,"exp":"Stream per operazioni funzionali su collezioni","code":"long count = numeri.stream().filter(n -> n%2==0).count();"},
      {"q":"Come si usa lambda?","options":["(x) -> x*2","x => x*2","x -> x*2","function(x) x*2"],"correct":0,"exp":"Lambda expression con ->","code":"list.sort((a,b) -> a.compareTo(b));"},
      {"q":"Come si definisce un'interfaccia funzionale?","options":["@FunctionalInterface interface Runnable { void run(); }","@Functional interface","functional interface","lambda interface"],"correct":0,"exp":"@FunctionalInterface per interfacce con un solo metodo astratto","code":"@FunctionalInterface\ninterface Predicate<T> {\n    boolean test(T t);\n}"},
      {"q":"Come si usa Optional?","options":["Optional<String> opt = Optional.ofNullable(val);","Maybe<String>","null or String","Option<String>"],"correct":0,"exp":"Optional evita NullPointerException","code":"String s = opt.orElse(\"default\");"},
      {"q":"Come si eredita da una classe?","options":["class Figlia extends Padre { }","class Figlia : Padre","class Figlia inherit Padre","class Figlia subclass Padre"],"correct":0,"exp":"extends per ereditarietà","code":"class Cane extends Animale {\n    void abbaia() { }\n}"},
      {"q":"Come si implementa un'interfaccia?","options":["class Classe implements Interfaccia { }","class Classe : Interfaccia","interface Classe implement Interfaccia","class Classe implement Interfaccia"],"correct":0,"exp":"implements per interfacce","code":"class MioThread implements Runnable {\n    public void run() { }\n}"},
      {"q":"Come si usa enum?","options":["enum Giorni { LUNEDI, MARTEDI }","const Giorni = {LUNEDI, MARTEDI}","type Giorni = LUNEDI | MARTEDI","enum class Giorni"],"correct":0,"exp":"enum definisce tipi enumerati","code":"enum Colore { ROSSO, VERDE, BLU }\nColore c = Colore.ROSSO;"},
      {"q":"Come si usa record (Java 14+)?","options":["record Punto(int x, int y) { }","data class Punto(int x, int y)","class Punto(x,y)","struct Punto"],"correct":0,"exp":"record per classi immutable con boilerplate automatico","code":"record Persona(String nome, int eta) {}"}
    ]
  },
  "MySQL": {
    "L1": [
      {"q":"Come selezioni tutte le righe di una tabella?","options":["SELECT * FROM tabella;","GET ALL tabella;","SHOW tabella;","FETCH * FROM tabella;"],"correct":0,"exp":"SELECT * FROM restituisce tutte le righe","code":"SELECT * FROM utenti;"},
      {"q":"Come selezioni solo alcune colonne?","options":["SELECT col1,col2 FROM tabella;","SELECT * FROM tabella WHERE col1;","GET col1,col2;","SHOW col1,col2;"],"correct":0,"exp":"Si elencano le colonne nel SELECT","code":"SELECT nome, eta FROM utenti;"},
      {"q":"Come limiti il numero di risultati?","options":["SELECT * FROM tabella LIMIT 10;","SELECT TOP 10 * FROM tabella;","SELECT * FROM tabella WHERE ROWNUM <=10;","LIMIT tabella 10"],"correct":0,"exp":"LIMIT limita il numero di righe restituite","code":"SELECT * FROM prodotti LIMIT 5;"},
      {"q":"Come selezioni righe distinte?","options":["SELECT DISTINCT colonna FROM tabella;","SELECT UNIQUE colonna;","DISTINCT SELECT colonna;","SELECT colonna UNIQUE;"],"correct":0,"exp":"DISTINCT elimina duplicati","code":"SELECT DISTINCT citta FROM clienti;"},
      {"q":"Come si usa AS per alias?","options":["SELECT nome AS n FROM utenti;","SELECT nome n FROM utenti;","ALIAS nome AS n","SELECT nome -> n"],"correct":0,"exp":"AS assegna un alias a colonna o tabella","code":"SELECT COUNT(*) AS totale FROM ordini;"},
      {"q":"Come si conta il numero di righe?","options":["SELECT COUNT(*) FROM tabella;","COUNT(tabella)","SELECT ROW_COUNT()","LEN(tabella)"],"correct":0,"exp":"COUNT(*) conta tutte le righe","code":"SELECT COUNT(*) AS num_utenti FROM utenti;"},
      {"q":"Come si ottiene il valore massimo?","options":["SELECT MAX(colonna) FROM tabella;","MAX(colonna)","SELECT TOP colonna;","HIGHEST(colonna)"],"correct":0,"exp":"Funzione di aggregazione MAX","code":"SELECT MAX(prezzo) FROM prodotti;"},
      {"q":"Come si ottiene la somma?","options":["SELECT SUM(colonna) FROM tabella;","SUM(colonna)","TOTAL(colonna)","ADD(colonna)"],"correct":0,"exp":"SUM somma i valori","code":"SELECT SUM(quantita) FROM ordini;"},
      {"q":"Come si usa GROUP BY?","options":["SELECT categoria, COUNT(*) FROM prodotti GROUP BY categoria;","GROUP prodotti BY categoria","SELECT categoria COUNT(*)","AGGREGATE categoria"],"correct":0,"exp":"GROUP BY raggruppa per valore","code":"SELECT paese, COUNT(*) AS num FROM clienti GROUP BY paese;"},
      {"q":"Come si filtra dopo GROUP BY?","options":["HAVING COUNT(*) > 5","WHERE COUNT(*) > 5","FILTER COUNT(*) > 5","AFTER GROUP"],"correct":0,"exp":"HAVING filtra gruppi","code":"SELECT categoria, COUNT(*) FROM prodotti GROUP BY categoria HAVING COUNT(*) > 10;"}
    ],
    "L2": [
      {"q":"Come si fa un filtro su una colonna?","options":["SELECT * FROM tabella WHERE col1=5;","SELECT col1 FROM tabella;","GET WHERE col1=5;","FILTER col1=5;"],"correct":0,"exp":"WHERE filtra le righe","code":"SELECT * FROM utenti WHERE eta > 18;"},
      {"q":"Come si ordina il risultato?","options":["SELECT * FROM tabella ORDER BY col1 ASC;","SORT tabella;","SELECT * ORDER BY col1;","ORDER tabella BY col1;"],"correct":0,"exp":"ORDER BY ordina i risultati","code":"SELECT * FROM prodotti ORDER BY prezzo DESC;"},
      {"q":"Come si usa AND/OR?","options":["WHERE cond1 AND cond2","WHERE cond1 && cond2","WHERE cond1 OR cond2","tutte le precedenti per OR"],"correct":0,"exp":"AND e OR combinano condizioni","code":"SELECT * FROM utenti WHERE eta > 18 AND citta = 'Roma';"},
      {"q":"Come si usa LIKE per ricerca testuale?","options":["WHERE nome LIKE '%ario%'","WHERE nome CONTAINS 'ario'","WHERE nome ~ 'ario'","SEARCH nome 'ario'"],"correct":0,"exp":"LIKE con % wildcard","code":"SELECT * FROM clienti WHERE cognome LIKE 'Rossi%';"},
      {"q":"Come si usa IN?","options":["WHERE id IN (1,2,3)","WHERE id = 1 OR id = 2 OR id = 3","WHERE id BETWEEN 1 AND 3","IN id (1,2,3)"],"correct":0,"exp":"IN verifica appartenenza a lista","code":"SELECT * FROM prodotti WHERE categoria IN ('elettronica','abbigliamento');"},
      {"q":"Come si usa BETWEEN?","options":["WHERE eta BETWEEN 18 AND 65","WHERE eta >=18 AND eta <=65","BETWEEN eta 18 65","WHERE eta FROM 18 TO 65"],"correct":0,"exp":"BETWEEN è inclusivo","code":"SELECT * FROM ordini WHERE data BETWEEN '2023-01-01' AND '2023-12-31';"},
      {"q":"Come si usa IS NULL?","options":["WHERE colonna IS NULL","WHERE colonna = NULL","WHERE colonna == NULL","NULL(colonna)"],"correct":0,"exp":"Non si usa = NULL, ma IS NULL","code":"SELECT * FROM utenti WHERE email IS NULL;"},
      {"q":"Come si ordina per più colonne?","options":["ORDER BY col1 ASC, col2 DESC","ORDER BY col1, col2","SORT col1 THEN col2","ORDER col1 ASC col2 DESC"],"correct":0,"exp":"Virgola separa le colonne","code":"SELECT * FROM persone ORDER BY cognome ASC, nome ASC;"},
      {"q":"Come si usa OFFSET con LIMIT?","options":["LIMIT 10 OFFSET 20","LIMIT 20,10","OFFSET 20 LIMIT 10","SKIP 20 TAKE 10"],"correct":0,"exp":"Per paginazione","code":"SELECT * FROM post LIMIT 10 OFFSET 20;"},
      {"q":"Come si usa CASE?","options":["SELECT CASE WHEN cond THEN 'val' ELSE 'altro' END","IF cond THEN 'val' ELSE 'altro'","SWITCH cond","CASE cond OF"],"correct":0,"exp":"CASE per logica condizionale","code":"SELECT nome, CASE WHEN eta < 18 THEN 'minorenne' ELSE 'adulto' END AS stato FROM utenti;"}
    ],
    "L3": [
      {"q":"Come si fa un JOIN tra due tabelle?","options":["SELECT * FROM a JOIN b ON a.id=b.id;","JOIN a,b;","MERGE a,b;","SELECT * FROM a,B;"],"correct":0,"exp":"JOIN unisce tabelle","code":"SELECT * FROM ordini JOIN clienti ON ordini.cliente_id = clienti.id;"},
      {"q":"Come si crea un indice?","options":["CREATE INDEX idx_name ON tabella(col1);","INDEX tabella(col1);","CREATE INDEX idx ON tabella;","MAKE INDEX idx ON tabella;"],"correct":0,"exp":"CREATE INDEX crea un indice","code":"CREATE INDEX idx_cognome ON utenti(cognome);"},
      {"q":"Come si fa LEFT JOIN?","options":["FROM a LEFT JOIN b ON ...","LEFT OUTER JOIN","FROM a LEFT OUTER JOIN b","LEFT JOIN a b"],"correct":0,"exp":"LEFT JOIN mantiene tutte le righe di a","code":"SELECT * FROM clienti LEFT JOIN ordini ON clienti.id = ordini.cliente_id;"},
      {"q":"Come si fa INNER JOIN?","options":["FROM a INNER JOIN b ON ...","JOIN è INNER di default","FROM a JOIN b ON ... (INNER implicito)","tutte le precedenti"],"correct":3,"exp":"JOIN semplice è INNER JOIN","code":"SELECT * FROM a INNER JOIN b ON a.id = b.a_id;"},
      {"q":"Come si usa UNION?","options":["SELECT col FROM a UNION SELECT col FROM b;","a + b","MERGE SELECT","COMBINE a b"],"correct":0,"exp":"UNION combina risultati eliminando duplicati","code":"SELECT nome FROM admin UNION SELECT nome FROM utenti;"},
      {"q":"Come si usa UNION ALL?","options":["UNION ALL","UNION DISTINCT","UNION +","MERGE ALL"],"correct":0,"exp":"UNION ALL mantiene duplicati","code":"SELECT col FROM a UNION ALL SELECT col FROM b;"},
      {"q":"Come si crea una view?","options":["CREATE VIEW vista AS SELECT ...","VIEW vista = SELECT ...","CREATE VIRTUAL TABLE vista","DEFINE VIEW vista"],"correct":0,"exp":"CREATE VIEW crea una vista","code":"CREATE VIEW clienti_attivi AS SELECT * FROM clienti WHERE attivo = 1;"},
      {"q":"Come si aggiorna una vista?","options":["CREATE OR REPLACE VIEW ...","ALTER VIEW","UPDATE VIEW","REPLACE VIEW"],"correct":0,"exp":"CREATE OR REPLACE per aggiornare","code":"CREATE OR REPLACE VIEW vista AS SELECT nuova_query;"},
      {"q":"Come si elimina un indice?","options":["DROP INDEX idx_name ON tabella;","DELETE INDEX idx_name;","REMOVE INDEX idx_name;","INDEX DROP idx_name"],"correct":0,"exp":"DROP INDEX rimuove l'indice","code":"DROP INDEX idx_eta ON utenti;"},
      {"q":"Come si usa EXPLAIN?","options":["EXPLAIN SELECT * FROM tabella;","SHOW PLAN SELECT ...","ANALYZE SELECT ...","QUERY PLAN"],"correct":0,"exp":"EXPLAIN mostra il piano di esecuzione","code":"EXPLAIN ANALYZE SELECT * FROM utenti WHERE id = 5;"}
    ],
    "L4": [
      {"q":"Come si usa una subquery?","options":["SELECT * FROM a WHERE col1 IN (SELECT col1 FROM b);","SUBQUERY SELECT ...","SELECT * FROM a, (SELECT ...)","SELECT col1 FROM a, b WHERE ..."],"correct":0,"exp":"Si usa una SELECT dentro un'altra SELECT","code":"SELECT * FROM prodotti WHERE fornitore_id IN (SELECT id FROM fornitori WHERE paese='Italia');"},
      {"q":"Come si usa EXISTS?","options":["WHERE EXISTS (SELECT 1 FROM b WHERE ...)","IF EXISTS SELECT","EXISTS SELECT","WHERE b.id IS NOT NULL"],"correct":0,"exp":"EXISTS verifica esistenza risultati","code":"SELECT * FROM clienti WHERE EXISTS (SELECT 1 FROM ordini WHERE ordini.cliente_id = clienti.id);"},
      {"q":"Come si crea una stored procedure?","options":["CREATE PROCEDURE nome() BEGIN ... END","CREATE PROC nome AS","DEF PROCEDURE nome","FUNCTION nome()"],"correct":0,"exp":"CREATE PROCEDURE definisce una procedura","code":"DELIMITER //\nCREATE PROCEDURE GetClienti()\nBEGIN\n    SELECT * FROM clienti;\nEND //\nDELIMITER ;"},
      {"q":"Come si chiama una stored procedure?","options":["CALL nome();","EXEC nome();","nome();","RUN PROCEDURE nome"],"correct":0,"exp":"CALL esegue la procedura","code":"CALL GetUtentiAttivi();"},
      {"q":"Come si crea un trigger?","options":["CREATE TRIGGER trig_name BEFORE INSERT ON tabella FOR EACH ROW BEGIN ... END","TRIGGER trig_name ON tabella","ON INSERT tabella DO","CREATE EVENT trig_name"],"correct":0,"exp":"CREATE TRIGGER definisce un trigger","code":"CREATE TRIGGER check_eta BEFORE INSERT ON utenti FOR EACH ROW IF NEW.eta < 0 THEN SIGNAL SQLSTATE '45000'; END IF;"},
      {"q":"Come si usa una transaction?","options":["START TRANSACTION; ... COMMIT;","BEGIN TRANSACTION;","TRANSACTION BEGIN","START TRANS"],"correct":0,"exp":"START TRANSACTION inizia una transazione","code":"START TRANSACTION;\nUPDATE conto SET saldo = saldo - 100 WHERE id=1;\nUPDATE conto SET saldo = saldo + 100 WHERE id=2;\nCOMMIT;"},
      {"q":"Come si fa ROLLBACK?","options":["ROLLBACK;","UNDO;","CANCEL TRANSACTION;","REVERT;"],"correct":0,"exp":"ROLLBACK annulla le modifiche","code":"START TRANSACTION;\n-- operazioni\nROLLBACK;"},
      {"q":"Come si usa WINDOW function?","options":["ROW_NUMBER() OVER (PARTITION BY col ORDER BY col2)","ROWNUM()","RANK() OVER()","WINDOW ROW_NUMBER"],"correct":0,"exp":"Funzioni finestra per ranking ecc.","code":"SELECT nome, ROW_NUMBER() OVER (PARTITION BY dipartimento ORDER BY stipendio DESC) AS rank FROM dipendenti;"},
      {"q":"Come si usa CTE (Common Table Expression)?","options":["WITH temp AS (SELECT ...) SELECT * FROM temp;","CTE temp = SELECT ...","WITH RECURSIVE","TEMP TABLE temp AS SELECT"],"correct":0,"exp":"WITH definisce una CTE","code":"WITH vendite_2023 AS (SELECT * FROM vendite WHERE anno=2023) SELECT SUM(totale) FROM vendite_2023;"},
      {"q":"Come si usa JSON functions?","options":["JSON_EXTRACT(col, '$.chiave')","col->'chiave'","JSON_GET(col, 'chiave')","col['chiave']"],"correct":0,"exp":"Funzioni per manipolare JSON","code":"SELECT JSON_EXTRACT(dati, '$.nome') FROM tabella_json;"}
    ]
  },
  "HTML": {
    "L1": [
      {"q":"Come si crea un paragrafo?","options":["<p>Testo</p>","<par>Testo</par>","<paragraph>Testo</paragraph>","<p></p>"],"correct":0,"exp":"Si usa <p> per i paragrafi","code":"<p>Testo</p>"},
      {"q":"Come si crea un titolo di livello 1?","options":["<h1>Titolo</h1>","<title>Titolo</title>","<header>Titolo</header>","<h>Titolo</h>"],"correct":0,"exp":"<h1> è il titolo principale","code":"<h1>Benvenuto</h1>"},
      {"q":"Come si crea una lista non ordinata?","options":["<ul><li>Elemento</li></ul>","<ol><li>Elemento</li></ol>","<list><item>Elemento</item></list>","<ul>Elemento</ul>"],"correct":0,"exp":"<ul> per bullet points","code":"<ul>\n    <li>Primo</li>\n    <li>Secondo</li>\n</ul>"},
      {"q":"Come si crea una lista ordinata?","options":["<ol><li>1</li><li>2</li></ol>","<ul type=\"1\">","<orderedlist>","<ol>1 2</ol>"],"correct":0,"exp":"<ol> per liste numerate","code":"<ol>\n    <li>Passo uno</li>\n    <li>Passo due</li>\n</ol>"},
      {"q":"Come si fa grassetto?","options":["<b>Testo</b> o <strong>Testo</strong>","<bold>Testo","<fat>Testo","<g>Testo</g>"],"correct":0,"exp":"<strong> è semantico, <b> stilistico","code":"<strong>Importante</strong>"},
      {"q":"Come si fa corsivo?","options":["<i>Testo</i> o <em>Testo</em>","<italic>Testo","<c>Testo</c>","<em>"],"correct":0,"exp":"<em> per enfasi","code":"<em>enfatizzato</em>"},
      {"q":"Come si crea una linea orizzontale?","options":["<hr>","<line>","-----","<br type=\"hr\">"],"correct":0,"exp":"<hr> è self-closing","code":"<hr>"},
      {"q":"Come si va a capo?","options":["<br>","<newline>","\\n","<p></p>"],"correct":0,"exp":"<br> forza interruzione linea","code":"Testo<br>nuova linea"},
      {"q":"Come si crea un commento?","options":["<!-- commento -->","// commento","/* commento */","# commento"],"correct":0,"exp":"Commenti HTML con <!-- -->","code":"<!-- Questo non si vede -->"},
      {"q":"Come si definisce la struttura base di una pagina HTML5?","options":["<!DOCTYPE html><html><head><title></title></head><body></body></html>","<html5><head><body>","<document><header><content>","<page>"],"correct":0,"exp":"Doctype e struttura standard","code":"<!DOCTYPE html>\n<html lang=\"it\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Titolo</title>\n</head>\n<body>\n    Contenuto\n</body>\n</html>"}
    ],
    "L2": [
      {"q":"Come si crea un link?","options":["<a href=\"https://example.com\">Testo</a>","<link url=\"...\">","<href>Testo</href>","<url>Testo</url>"],"correct":0,"exp":"Si usa <a> per link","code":"<a href=\"#\">Link</a>"},
      {"q":"Come si crea un link che apre in nuova scheda?","options":["<a href=\"url\" target=\"_blank\">Link</a>","<a href=\"url\" new>","<a href=\"url\" open=new>","<a href=\"url\" tab=\"new\">"],"correct":0,"exp":"target=\"_blank\" apre nuova tab","code":"<a href=\"https://x.ai\" target=\"_blank\">Visita xAI</a>"},
      {"q":"Come si crea un link interno (ancora)?","options":["<a href=\"#sezione\">Vai a sezione</a>","<a name=\"sezione\"></a>","<anchor id=\"sezione\">","<goto #sezione>"],"correct":0,"exp":"href=\"#id\" punta a elemento con id","code":"<a href=\"#top\">Torna su</a>\n... <div id=\"top\"></div>"},
      {"q":"Come si definisce un id?","options":["id=\"valore\"","name=\"valore\"","class=\"valore\"","data-id=\"valore\""],"correct":0,"exp":"id è unico nella pagina","code":"<p id=\"paragrafo1\">Testo</p>"},
      {"q":"Come si definisce una classe?","options":["class=\"nomeclasse\"","type=\"nomeclasse\"","style=\"nomeclasse\"","group=\"nomeclasse\""],"correct":0,"exp":"class per più elementi","code":"<p class=\"evidenziato\">Testo</p>"},
      {"q":"Come si usa l'attributo title?","options":["title=\"testo tooltip\"","alt=\"tooltip\"","hover=\"testo\"","description=\"testo\""],"correct":0,"exp":"title mostra tooltip al hover","code":"<a href=\"url\" title=\"Visita il sito\">Link</a>"},
      {"q":"Come si crea un link email?","options":["<a href=\"mailto:info@example.com\">Invia email</a>","<email>info@example.com</email>","<a href=\"email:info\">","mailto info@example.com"],"correct":0,"exp":"href=\"mailto:\" apre client email","code":"<a href=\"mailto:support@x.ai\">Contatta</a>"},
      {"q":"Come si crea un link telefonico?","options":["<a href=\"tel:+391234567890\">Chiama</a>","<phone>+391234567890</phone>","<call>numero</call>","tel:numero"],"correct":0,"exp":"href=\"tel:\" per dispositivi mobili","code":"<a href=\"tel:+39111222333\">Chiama ora</a>"},
      {"q":"Come si usa rel=\"nofollow\"?","options":["<a href=\"url\" rel=\"nofollow\">Link</a>","<a nofollow>","<a follow=\"false\">","<link rel=\"no\">"],"correct":0,"exp":"rel=\"nofollow\" dice ai motori di non seguire","code":"<a href=\"login\" rel=\"nofollow\">Login</a>"},
      {"q":"Come si crea un link per download?","options":["<a href=\"file.pdf\" download>Scarica</a>","<a href=\"file.pdf\" type=\"download\">","<download href=\"file.pdf\">","<a href=\"file.pdf\" save>"],"correct":0,"exp":"download forza il download invece di navigare","code":"<a href=\"cv.pdf\" download=\"curriculum.pdf\">Scarica CV</a>"}
    ],
    "L3": [
      {"q":"Come si inserisce un'immagine?","options":["<img src=\"img.png\" alt=\"descrizione\">","<image src=\"img.png\">","<img href=\"img.png\">","<pic src=\"img.png\">"],"correct":0,"exp":"Tag <img> per immagini (self-closing)","code":"<img src=\"img.png\" alt=\"Logo\"/>"},
      {"q":"Come si specifica alt text?","options":["alt=\"testo alternativo\"","title=\"testo\"","description=\"testo\"","caption=\"testo\""],"correct":0,"exp":"alt è importante per accessibilità","code":"<img src=\"gatto.jpg\" alt=\"Un gatto che dorme\">"},
      {"q":"Come si rende un'immagine responsive?","options":["width=\"100%\" o class=\"img-fluid\" (Bootstrap)","<img responsive>","style=\"max-width:100%\"","<img size=\"full\">"],"correct":0,"exp":"Tipicamente con CSS","code":"<img src=\"foto.jpg\" alt=\"Paesaggio\" style=\"max-width:100%;height:auto;\">"},
      {"q":"Come si crea una figura con caption?","options":["<figure><img ...><figcaption>Testo</figcaption></figure>","<img><caption>Testo</caption>","<div class=\"figure\">","<picture><fig>Testo</fig></picture>"],"correct":0,"exp":"<figure> e <figcaption> semantici","code":"<figure>\n    <img src=\"diagramma.png\" alt=\"Diagramma\">\n    <figcaption>Descrizione diagramma</figcaption>\n</figure>"},
      {"q":"Come si usa srcset per immagini responsive?","options":["srcset=\"img-320w.jpg 320w, img-640w.jpg 640w\"","<img src=\"img.jpg\" responsive>","multiple src","<source>"],"correct":0,"exp":"srcset permette versioni diverse","code":"<img src=\"fallback.jpg\" srcset=\"hd.jpg 2x\" alt=\"HD\">"},
      {"q":"Come si usa <picture> per art direction?","options":["<picture><source media=\"(min-width:600px)\" srcset=\"grande.jpg\"><img src=\"piccola.jpg\"></picture>","<img sources=\"...\">","<multiimg>","<responsive>"],"correct":0,"exp":"<picture> per diverse immagini in base a media query","code":"<picture>\n    <source media=\"(max-width: 799px)\" srcset=\"mobile.jpg\">\n    <img src=\"desktop.jpg\" alt=\"Vista\">\n</picture>"},
      {"q":"Come si inserisce un'immagine di background con CSS inline?","options":["style=\"background-image:url('bg.jpg')\"","<div bg=\"bg.jpg\">","background=\"bg.jpg\"","<bg src=\"bg.jpg\">"],"correct":0,"exp":"Tipicamente con CSS","code":"<div style=\"background-image:url('sfondo.jpg'); background-size:cover;\"></div>"},
      {"q":"Come si usa lazy loading?","options":["loading=\"lazy\"","<img lazy>","defer=\"img\"","load=\"delayed\""],"correct":0,"exp":"loading=\"lazy\" ritarda caricamento","code":"<img src=\"img.jpg\" alt=\"...\" loading=\"lazy\">"},
      {"q":"Come si specifica width e height?","options":["width=\"400\" height=\"300\"","size=\"400x300\"","style=\"width:400px;height:300px\"","dimension=\"400 300\""],"correct":0,"exp":"Aiuta a prevenire layout shift","code":"<img src=\"img.jpg\" width=\"600\" height=\"400\" alt=\"...\">"},
      {"q":"Come si crea un favicon?","options":["<link rel=\"icon\" href=\"favicon.ico\">","<favicon src=\"favicon.ico\">","<meta favicon=\"favicon.ico\">","<icon href=\"favicon.ico\">"],"correct":0,"exp":"Nel <head>","code":"<link rel=\"icon\" type=\"image/png\" href=\"favicon.png\">"}
    ],
    "L4": [
      {"q":"Come si crea una tabella?","options":["<table><tr><td>1</td></tr></table>","<table>1</table>","<tab>1</tab>","<table><row><cell>1</cell></row></table>"],"correct":0,"exp":"Si usa <table> con <tr> e <td>","code":"<table><tr><td>1</td></tr></table>"},
      {"q":"Come si crea l'intestazione di tabella?","options":["<thead><tr><th>Colonna</th></tr></thead>","<header><th>Colonna</th></header>","<top><th></th></top>","<caption>"],"correct":0,"exp":"<thead> per header","code":"<table>\n    <thead>\n        <tr><th>Nome</th><th>Età</th></tr>\n    </thead>\n    <tbody>...</tbody>\n</table>"},
      {"q":"Come si usa <tbody>?","options":["<tbody><tr><td>...</td></tr></tbody>","<bodytable>","<rows>","<content>"],"correct":0,"exp":"<tbody> raggruppa il corpo","code":"<tbody>\n    <tr><td>Mario</td><td>30</td></tr>\n</tbody>"},
      {"q":"Come si usa colspan?","options":["colspan=\"3\"","span=\"3\"","width=\"3\"","merge=\"3\""],"correct":0,"exp":"colspan unisce colonne","code":"<td colspan=\"2\">Cell unita</td>"},
      {"q":"Come si usa rowspan?","options":["rowspan=\"3\"","height=\"3\"","spanrow=\"3\"","merge-row=\"3\""],"correct":0,"exp":"rowspan unisce righe","code":"<td rowspan=\"2\">Cell verticale</td>"},
      {"q":"Come si aggiunge una caption?","options":["<caption>Titolo tabella</caption>","<title>Titolo</title>","<h2>Titolo</h2>","<header>Titolo</header>"],"correct":0,"exp":"<caption> per titolo tabella","code":"<table>\n    <caption>Dati vendite 2023</caption>\n    ...\n</table>"},
      {"q":"Come si crea una tabella responsive?","options":["<div class=\"table-responsive\"><table>...</table></div>","<table responsive>","style=\"overflow-x:auto\"","<responsive-table>"],"correct":0,"exp":"Wrapper con overflow (o framework)","code":"<div style=\"overflow-x:auto;\">\n    <table>...</table>\n</div>"},
      {"q":"Come si usa scope per accessibilità?","options":["<th scope=\"col\">Colonna</th>","scope=\"row\" per righe","entrambi","access=\"col\""],"correct":2,"exp":"scope aiuta screen reader","code":"<th scope=\"col\">Prodotto</th>\n<th scope=\"col\">Prezzo</th>"},
      {"q":"Come si usa border in tabella?","options":["border=\"1\" (obsoleto) o CSS border","style=\"border:1px solid black\"","<table bordered>","border-style=\"solid\""],"correct":1,"exp":"Meglio con CSS","code":"<table style=\"border-collapse:collapse;\">\n    <tr><td style=\"border:1px solid black\">Cell</td></tr>\n</table>"},
      {"q":"Come si usa data attributes in tabella?","options":["data-id=\"123\"","custom-data=\"123\"","info=\"123\"","value=\"123\""],"correct":0,"exp":"data-* per dati custom","code":"<tr data-user-id=\"456\"><td>Mario</td></tr>"}
    ]
  }
  // ===== FUNZIONI PROFILO AGGIUNTIVE =====

// Salva utente (per import/export o cambio PIN)
function saveUser(user) {
    localStorage.setItem('devUserId', user.userId);
    localStorage.setItem('devProgress', JSON.stringify(user.progress || {}));
    localStorage.setItem('devHistory', JSON.stringify(user.history || {}));
}

// Recupera utente corrente
function getUser(id) {
    if(!id) return null;
    return {
        userId: localStorage.getItem('devUserId'),
        progress: JSON.parse(localStorage.getItem('devProgress')) || {},
        history: JSON.parse(localStorage.getItem('devHistory')) || {}
    };
}

// Reset completo del profilo
function resetCurrentUser() {
    localStorage.removeItem('devUserId');
    localStorage.removeItem('devProgress');
    localStorage.removeItem('devHistory');
    state.userId = null;
    state.progress = {};
    state.history = {};
}
}
