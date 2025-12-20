let domande = [];
let indice = 0;
let nonStudiati = [];

fetch("domande.json")
  .then(r => r.json())
  .then(d => {
    domande = d;
    mostra();
  });

function mostra() {
  const q = domande[indice];
  document.getElementById("question").innerText = q.domanda;

  const box = document.getElementById("answers");
  box.innerHTML = "";

  q.risposte.forEach(r => {
    const b = document.createElement("button");
    b.className = "answer";
    b.innerText = r.testo;
    b.onclick = () => {
      document.getElementById("feedback").innerText =
        r.corretta ? "Giusto" : "Sbagliato. " + q.spiegazione;
    };
    box.appendChild(b);
  });
}

document.getElementById("next").onclick = () => {
  indice++;
  if (indice < domande.length) mostra();
  else alert("Quiz finito");
};

document.getElementById("skip").onclick = () => {
  nonStudiati.push(domande[indice].argomento);
  indice++;
  if (indice < domande.length) mostra();
};