// Game state
let currentGame = null;
let scores = JSON.parse(localStorage.getItem('valentineScores')) || {
    memory: [],
    trivia: [],
    arrow: [],
    scramble: []
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLeaderboard();
});

// Navigation
function startGame(gameName) {
    currentGame = gameName;
    document.getElementById('game-menu').style.display = 'none';
    
    switch(gameName) {
        case 'memory':
            document.getElementById('memory-game').style.display = 'block';
            initMemoryGame();
            break;
        case 'trivia':
            document.getElementById('trivia-game').style.display = 'block';
            initTriviaGame();
            break;
        case 'arrow':
            document.getElementById('arrow-game').style.display = 'block';
            initArrowGame();
            break;
        case 'scramble':
            document.getElementById('scramble-game').style.display = 'block';
            initScrambleGame();
            break;
    }
}

function backToMenu() {
    document.querySelectorAll('.game-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('game-menu').style.display = 'block';
    currentGame = null;
}

// Leaderboard
function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    
    const games = [
        { name: 'memory', icon: '🃏', label: 'Memory Match' },
        { name: 'trivia', icon: '❤️', label: 'Love Trivia' },
        { name: 'arrow', icon: '🏹', label: 'Cupid\'s Arrow' },
        { name: 'scramble', icon: '💌', label: 'Word Scramble' }
    ];
    
    games.forEach(game => {
        const topScore = scores[game.name].length > 0 
            ? Math.max(...scores[game.name]) 
            : 0;
        
        const entry = document.createElement('div');
        entry.className = 'leaderboard-entry';
        entry.innerHTML = `
            <span>${game.icon} ${game.label}</span>
            <strong>${topScore} pts</strong>
        `;
        leaderboard.appendChild(entry);
    });
}

function saveScore(gameName, score) {
    scores[gameName].push(score);
    localStorage.setItem('valentineScores', JSON.stringify(scores));
    updateLeaderboard();
    showConfetti();
}

// Confetti effect
function showConfetti() {
    const colors = ['#FF6B9D', '#FFB3BA', '#FFDFBA', '#FF4081', '#FFC0CB'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// ============ MEMORY MATCH GAME ============
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;

function initMemoryGame() {
    const symbols = ['💕', '💖', '💗', '💘', '💝', '💞'];
    memoryCards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    
    document.getElementById('memory-moves').textContent = '0';
    document.getElementById('memory-matches').textContent = '0';
    
    const board = document.getElementById('memory-board');
    board.innerHTML = '';
    
    memoryCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
}

function flipCard(e) {
    const card = e.target;
    
    if (flippedCards.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    card.textContent = card.dataset.symbol;
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('memory-moves').textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        document.getElementById('memory-matches').textContent = matchedPairs;
        flippedCards = [];
        
        if (matchedPairs === 6) {
            setTimeout(() => {
                const score = Math.max(100 - moves * 5, 0);
                alert(`🎉 You won! Score: ${score} points!`);
                saveScore('memory', score);
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.textContent = '';
            card2.textContent = '';
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

// ============ LOVE TRIVIA GAME ============
const triviaQuestions = [
    {
        question: "What symbol is most commonly associated with Valentine's Day?",
        options: ["Star", "Heart", "Diamond", "Circle"],
        correct: 1
    },
    {
        question: "In Roman mythology, who is the god of love?",
        options: ["Mars", "Jupiter", "Cupid", "Apollo"],
        correct: 2
    },
    {
        question: "What flower is traditionally given on Valentine's Day?",
        options: ["Tulip", "Daisy", "Rose", "Lily"],
        correct: 2
    },
    {
        question: "What does 'XOXO' represent?",
        options: ["Hugs and kisses", "Love forever", "True love", "Sweet dreams"],
        correct: 0
    },
    {
        question: "Which country celebrates 'White Day' one month after Valentine's Day?",
        options: ["France", "Japan", "Italy", "Spain"],
        correct: 1
    }
];

let currentQuestion = 0;
let triviaScore = 0;

function initTriviaGame() {
    currentQuestion = 0;
    triviaScore = 0;
    document.getElementById('trivia-score').textContent = '0';
    document.getElementById('trivia-current').textContent = '1';
    showTriviaQuestion();
}

function showTriviaQuestion() {
    const content = document.getElementById('trivia-content');
    const q = triviaQuestions[currentQuestion];
    
    content.innerHTML = `
        <div class="trivia-question">${q.question}</div>
        <div class="trivia-options">
            ${q.options.map((option, i) => `
                <div class="trivia-option" onclick="answerTrivia(${i})">${option}</div>
            `).join('')}
        </div>
    `;
}

function answerTrivia(selected) {
    const q = triviaQuestions[currentQuestion];
    const options = document.querySelectorAll('.trivia-option');
    
    options.forEach((option, i) => {
        option.style.pointerEvents = 'none';
        if (i === q.correct) {
            option.classList.add('correct');
        } else if (i === selected) {
            option.classList.add('wrong');
        }
    });
    
    if (selected === q.correct) {
        triviaScore += 20;
        document.getElementById('trivia-score').textContent = triviaScore;
    }
    
    setTimeout(() => {
        currentQuestion++;
        document.getElementById('trivia-current').textContent = currentQuestion + 1;
        
        if (currentQuestion < triviaQuestions.length) {
            showTriviaQuestion();
        } else {
            document.getElementById('trivia-content').innerHTML = `
                <div class="trivia-question">
                    🎉 Quiz Complete! 🎉<br>
                    Final Score: ${triviaScore}/100
                </div>
            `;
            saveScore('trivia', triviaScore);
        }
    }, 1500);
}

// ============ CUPID'S ARROW GAME ============
let arrowScore = 0;
let arrowTime = 30;
let arrowInterval;
let heartInterval;

function initArrowGame() {
    arrowScore = 0;
    arrowTime = 30;
    document.getElementById('arrow-score').textContent = '0';
    document.getElementById('arrow-time').textContent = '30';
    
    const board = document.getElementById('arrow-board');
    board.innerHTML = '';
    
    // Start timer
    arrowInterval = setInterval(() => {
        arrowTime--;
        document.getElementById('arrow-time').textContent = arrowTime;
        
        if (arrowTime <= 0) {
            endArrowGame();
        }
    }, 1000);
    
    // Spawn hearts
    heartInterval = setInterval(spawnHeart, 800);
}

function spawnHeart() {
    const board = document.getElementById('arrow-board');
    const heart = document.createElement('div');
    heart.className = 'heart-target';
    heart.textContent = ['💕', '💖', '💗', '💘'][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 85 + '%';
    heart.style.top = Math.random() * 85 + '%';
    
    heart.addEventListener('click', () => {
        arrowScore += 10;
        document.getElementById('arrow-score').textContent = arrowScore;
        heart.remove();
    });
    
    board.appendChild(heart);
    
    setTimeout(() => heart.remove(), 2000);
}

function endArrowGame() {
    clearInterval(arrowInterval);
    clearInterval(heartInterval);
    document.getElementById('arrow-board').innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 2em; color: #FF6B9D;">
            🎯 Game Over!<br>Final Score: ${arrowScore}
        </div>
    `;
    saveScore('arrow', arrowScore);
}

// ============ WORD SCRAMBLE GAME ============
const scrambleWords = [
    { word: 'LOVE', scrambled: 'EVOL' },
    { word: 'HEART', scrambled: 'THARE' },
    { word: 'ROMANCE', scrambled: 'MNOCERA' },
    { word: 'CHOCOLATE', scrambled: 'TALCOCHOE' },
    { word: 'CUPID', scrambled: 'DICUP' }
];

let currentWordIndex = 0;
let scrambleScore = 0;

function initScrambleGame() {
    currentWordIndex = 0;
    scrambleScore = 0;
    document.getElementById('scramble-score').textContent = '0';
    document.getElementById('scramble-current').textContent = '1';
    showScrambledWord();
}

function showScrambledWord() {
    const word = scrambleWords[currentWordIndex];
    document.getElementById('scrambled-display').textContent = word.scrambled;
    document.getElementById('scramble-input').value = '';
    document.getElementById('scramble-feedback').textContent = '';
}

function checkScramble() {
    const input = document.getElementById('scramble-input').value.toUpperCase().trim();
    const correctWord = scrambleWords[currentWordIndex].word;
    const feedback = document.getElementById('scramble-feedback');
    
    if (input === correctWord) {
        scrambleScore += 20;
        document.getElementById('scramble-score').textContent = scrambleScore;
        feedback.textContent = '✨ Correct! ✨';
        feedback.style.color = '#4CAF50';
        
        setTimeout(() => {
            currentWordIndex++;
            document.getElementById('scramble-current').textContent = currentWordIndex + 1;
            
            if (currentWordIndex < scrambleWords.length) {
                showScrambledWord();
            } else {
                document.getElementById('scramble-content').innerHTML = `
                    <div style="font-size: 2em; color: #FF6B9D;">
                        🎉 All Words Unscrambled! 🎉<br>
                        Final Score: ${scrambleScore}/100
                    </div>
                `;
                saveScore('scramble', scrambleScore);
            }
        }, 1000);
    } else {
        feedback.textContent = '❌ Try again!';
        feedback.style.color = '#F44336';
    }
}

// Allow Enter key to submit
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentGame === 'scramble') {
        checkScramble();
    }
});