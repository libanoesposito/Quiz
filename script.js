const questionsData = [
    { cat: "Python", q: "Come dichiari una funzione?", options: ["def funzione():", "function funzione()", "void funzione()", "func funzione()"], correct: 0, exp: "Si usa la parola chiave 'def'.", code: "def mia_funzione():\n  print('Ciao')", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { cat: "JavaScript", q: "Quale keyword definisce una costante?", options: ["let", "var", "const", "fix"], correct: 2, exp: "Const impedisce la riassegnazione.", code: "const x = 5;", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { cat: "MySQL", q: "Quale comando estrae dati?", options: ["GET", "SELECT", "FETCH", "EXTRACT"], correct: 1, exp: "SELECT è il comando standard SQL.", code: "SELECT * FROM users;", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg" },
    { cat: "Java", q: "Qual è la classe base di tutte le classi?", options: ["Main", "System", "Object", "Class"], correct: 2, exp: "In Java ogni classe eredita da Object.", code: "public class Test extends Object { }", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { cat: "HTML", q: "Quale tag definisce il corpo della pagina?", options: ["<head>", "<body>", "<html>", "<main>"], correct: 1, exp: "Il body contiene il contenuto visibile.", code: "<body>\n  <h1>Titolo</h1>\n</body>", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" }
];

let currentQuestions = [];
let currentIndex = 0;
let studyLaterList = [];
let currentQObj = null;

function initQuiz() {
    const order = ["Python", "JavaScript", "MySQL", "Java", "HTML"];
    currentQuestions = [];
    
    // Logica: Segue l'ordine degli argomenti, ma randomizza le domande dentro l'argomento
    order.forEach(cat => {
        let catGroup = questionsData.filter(q => q.cat === cat);
        catGroup.sort(() => Math.random() - 0.5);
        currentQuestions.push(...catGroup);
    });
    
    showQuestion();
}

function updateIcon(url) {
    const container = document.getElementById('language-icon-container');
    container.innerHTML = `<img src="${url}" alt="lang">`;
}

function showQuestion() {
    if (currentIndex >= currentQuestions.length) return showResults();
    
    currentQObj = currentQuestions[currentIndex];
    updateIcon(currentQObj.icon);
    
    document.getElementById('feedback-stage').classList.add('hidden');
    document.getElementById('quiz-content').classList.remove('hidden');
    
    document.getElementById('category-label').innerText = currentQObj.cat;
    document.getElementById('question-text').innerText = currentQObj.q;
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    currentQObj.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i);
        container.appendChild(btn);
    });
}

function checkAnswer(selected) {
    const isCorrect = selected === currentQObj.correct;
    document.getElementById('quiz-content').classList.add('hidden');
    document.getElementById('feedback-stage').classList.remove('hidden');
    
    const status = document.getElementById('status-indicator');
    const addBtn = document.getElementById('add-end-btn');
    
    if (isCorrect) {
        status.innerHTML = `<h2 style="color:#34c759; font-size: 28px; margin-bottom:10px;">Corretto</h2>`;
        addBtn.classList.add('hidden');
    } else {
        status.innerHTML = `<h2 style="color:#ff3b30; font-size: 28px; margin-bottom:10px;">Riprova</h2><p style="margin-bottom:10px; opacity:0.7;">La risposta esatta era: ${currentQObj.options[currentQObj.correct]}</p>`;
        addBtn.classList.remove('hidden');
    }
    
    document.getElementById('explanation-text').innerText = currentQObj.exp;
    document.getElementById('code-display').innerText = currentQObj.code;
}

function handleStudyLater() {
    studyLaterList.push(currentQObj);
    nextQuestion();
}

function addToEnd() {
    currentQuestions.push(currentQObj);
    nextQuestion();
}

function nextQuestion() {
    currentIndex++;
    showQuestion();
}

function showResults() {
    document.getElementById('main-stage').classList.add('hidden');
    document.getElementById('results-stage').classList.remove('hidden');
    const list = document.getElementById('review-scroll-area');
    list.innerHTML = "";
    
    if(studyLaterList.length === 0) {
        list.innerHTML = "<p>Nessun argomento aggiunto al ripasso.</p>";
    } else {
        studyLaterList.forEach(item => {
            list.innerHTML += `<div class="apple-glass-inner" style="margin-bottom:15px">
                <span class="caps-label">${item.cat}</span>
                <p style="margin-top:10px">${item.exp}</p>
            </div>`;
        });
    }
}

// Tema
document.getElementById('theme-slider').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

window.onload = initQuiz;
