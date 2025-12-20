let domande = [];
let indice = 0;
let nonStudiati = [];
let corrette = 0;

fetch("domande.json")
  .then(r => r.json())
  .then(d => {
    domande = d;
    mostra();
  })
  .catch(err => alert("Errore nel caricamento delle domande"));

function mostra() {
  if(indice >= domande.length){
    fineQuiz();
    return;
  }

  const q = domande[indice];
  document.getElementById("question").innerText = q.domanda;

  const box = document.getElementById("answers");
  box.innerHTML = "";

  q.risposte.forEach(r => {
    const b = document.createElement("button");
    b.className = "answer";
    b.innerText = r.testo;
    b.onclick = () => {
      if (r.corretta) corrette++;
      document.getElementById("feedback").innerText =
        r.corretta ? "Giusto" : "Sbagliato. " + q.spiegazione;
      Array.from(box.children).forEach(btn => btn.disabled = true);
    };
    box.appendChild(b);
  });

  document.getElementById("feedback").innerText = "";
}

document.getElementById("next").onclick = () => {
  indice++;
  mostra();
};

document.getElementById("skip").onclick = () => {
  nonStudiati.push(domande[indice].argomento);
  indice++;
  mostra();
};

function fineQuiz() {
  let messaggio = Quiz finito!\nCorrette: ${corrette} su ${domande.length};
  if (nonStudiati.length > 0) {
    messaggio += \nNon studiati: ${nonStudiati.join(", ")};
    document.getElementById("download").style.display = "block";
  }
  alert(messaggio);

  indice = 0;
  corrette = 0;
  mostra();
}

// Bottone download non studiati
document.getElementById("download").onclick = () => {
  const blob = new Blob([nonStudiati.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "non_studiati.txt";
  link.click();
  document.getElementById("download").style.display = "none";
};
