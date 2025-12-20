let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let wrong = [];
let skipped = [];

fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        document.getElementById('total').textContent = questions.length;
        loadQuestion();
    })
    .catch(err => {
        document.getElementById('question').textContent = 'Errore nel caricamento delle domande. Controlla il file questions.json.';
        console.error(err);
    });

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        showSummary();
        return;
    }

    const q = questions[currentQuestion];
    document.getElementById('current').textContent = currentQuestion + 1;
    document.getElementById('question').textContent = q.question;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((opt, i) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = i;
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + opt));
        optionsDiv.appendChild(label);
        optionsDiv.appendChild(document.createElement('br'));
    });

    document.getElementById('feedback').innerHTML = '';
    document.getElementById('submit').style.display = 'inline-block';
    document.getElementById('skip').style.display = 'inline-block';
    document.getElementById('next').style.display = 'none';
}

document.getElementById('submit').onclick = () => {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
        alert('Seleziona una risposta prima di continuare!');
        return;
    }

    const answer = parseInt(selected.value);
    const q = questions[currentQuestion];

    document.getElementById('submit').style.display = 'none';
    document.getElementById('skip').style.display = 'none';
    document.getElementById('next').style.display = 'inline-block';

    if (answer === q.correct) {
        correctCount++;
        document.getElementById('feedback').innerHTML = `
            <p style="color:green; font-weight:bold;">Corretto! ✅</p>
            <p><strong>Spiegazione:</strong> ${q.explanation}</p>
        `;
    } else {
        wrong.push({
            question: q.question,
            chosen: q.options[answer],
            correct: q.options[q.correct],
            explanation: q.explanation
        });
        document.getElementById('feedback').innerHTML = `
            <p style="color:red; font-weight:bold;">Sbagliato ❌</p>
            <p><strong>Risposta corretta:</strong> ${q.options[q.correct]}</p>
            <p><strong>Spiegazione:</strong> ${q.explanation}</p>
        `;
    }
};

document.getElementById('skip').onclick = () => {
    const q = questions[currentQuestion];
    skipped.push({
        question: q.question,
        explanation: q.explanation
    });

    document.getElementById('feedback').innerHTML = '<p style="color:orange;">Hai saltato questa domanda. La troverai nel riassunto finale con la spiegazione per studiarla.</p>';
    document.getElementById('submit').style.display = 'none';
    document.getElementById('skip').style.display = 'none';
    document.getElementById('next').style.display = 'inline-block';
};

document.getElementById('next').onclick = () => {
    currentQuestion++;
    loadQuestion();
};

function showSummary() {
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('summary').style.display = 'block';

    const attempted = questions.length - skipped.length;
    document.getElementById('score').textContent = 
        `Hai risposto correttamente a ${correctCount} domande su ${attempted} tentate (saltate: ${skipped.length}).`;

    const wrongDiv = document.getElementById('wrong');
    if (wrong.length === 0) wrongDiv.innerHTML = '<p>Bravo! Nessuna sbagliata 🎉</p>';
    wrong.forEach(w => {
        const p = document.createElement('p');
        p.innerHTML = `
            <strong>Domanda:</strong> ${w.question}<br>
            <strong>Hai risposto:</strong> ${w.chosen}<br>
            <strong>Risposta corretta:</strong> ${w.correct}<br>
            <strong>Spiegazione:</strong> ${w.explanation}
        `;
        wrongDiv.appendChild(p);
    });

    const skippedDiv = document.getElementById('skipped');
    if (skipped.length === 0) skippedDiv.innerHTML = '<p>Nessuna saltata!</p>';
    skipped.forEach(s => {
        const p = document.createElement('p');
        p.innerHTML = `
            <strong>Domanda:</strong> ${s.question}<br>
            <strong>Spiegazione (per studiare):</strong> ${s.explanation}
        `;
        skippedDiv.appendChild(p);
    });
}
