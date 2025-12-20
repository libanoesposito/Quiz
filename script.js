let questions = [];
let currentIndex = 0;

const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const explanation = document.getElementById('explanation');

fetch('questions.json')
    .then(res => res.json())
    .then(data => {
        questions = data;
        showQuestion();
    });

function showQuestion() {
    explanation.textContent = '';
    const q = questions[currentIndex];
    questionText.textContent = q.question;
    answersDiv.innerHTML = '';
    q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.textContent = ans;
        btn.className = 'answer-btn';
        btn.onclick = () => checkAnswer(idx);
        answersDiv.appendChild(btn);
    });
    const dontKnowBtn = document.createElement('button');
    dontKnowBtn.textContent = "Non lo ho studiato";
    dontKnowBtn.className = 'answer-btn';
    dontKnowBtn.onclick = () => showExplanation();
    answersDiv.appendChild(dontKnowBtn);
}

function checkAnswer(idx) {
    const q = questions[currentIndex];
    if (idx === q.correct) {
        explanation.textContent = "✔ Risposta corretta!\n" + q.explanation;
    } else {
        explanation.textContent = "✖ Risposta sbagliata.\n" + q.explanation;
    }
}

function showExplanation() {
    const q = questions[currentIndex];
    explanation.textContent = "ℹ Spiegazione:\n" + q.explanation;
}

nextBtn.onclick = () => {
    currentIndex++;
    if (currentIndex >= questions.length) {
        currentIndex = 0;
        alert("Hai completato il quiz, ricomincia!");
    }
    showQuestion();
}
