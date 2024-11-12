const imageBasePath = 'images/';
const soundBasePath = 'sounds/';
const cardData = [
    { image: 'cow.png', word: 'Cow', sound: 'cow.mp3' },
    { image: 'elephant.png', word: 'Elephant', sound: 'elephant.mp3' },
    { image: 'panda.png', word: 'Panda', sound: 'panda.mp3' },
    { image: 'rabbit.png', word: 'Rabbit', sound: 'rabbit.mp3' },
    { image: 'tiger.png', word: 'Tiger', sound: 'tiger.mp3' },
    { image: 'dog.png', word: 'Dog', sound: 'dog.mp3' }
];

let gameBoard = document.getElementById('game-board');
let fullscreenTimer = document.getElementById('fullscreen-timer');
let startButton = document.getElementById('start');
let restartButton = document.getElementById('restart');
let gridSizeSelect = document.getElementById('grid-size');
let countdownTimeSelect = document.getElementById('countdown-time');
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;

function createBoard() {
    gameBoard.innerHTML = '';
    const gridSize = parseInt(gridSizeSelect.value);
    const rows = 2;
    totalPairs = (rows * gridSize) / 2;

    const selectedData = cardData.slice(0, totalPairs);
    let cards = selectedData.flatMap(data => [
        { type: 'image', value: data.word.toLowerCase(), sound: data.sound, display: data.image },
        { type: 'word', value: data.word.toLowerCase(), sound: data.sound, display: data.word }
    ]);
    cards.sort(() => Math.random() - 0.5);

    const boardHeight = gameBoard.offsetHeight;
    const cardHeight = boardHeight / rows - 20;
    const cardWidth = Math.min(cardHeight * 0.75, window.innerWidth / gridSize - 20);

    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, ${cardWidth}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, ${cardHeight}px)`;

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.style.width = `${cardWidth}px`;
        cardElement.style.height = `${cardHeight}px`;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner'); // 卡片的內層容器

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front'); // 空白面

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back'); // 圖片或單字

        if (card.type === 'image') {
            cardBack.innerHTML = `<img src="${imageBasePath}${card.display}" alt="Card Image">`;
        } else {
            cardBack.innerHTML = `<span>${card.display}</span>`;
        }

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardElement.appendChild(cardInner);
        cardElement.dataset.sound = card.sound;
        cardElement.dataset.value = card.value;

        gameBoard.appendChild(cardElement);
    });
}



function startGame() {
    startButton.style.display = 'none';
    restartButton.style.display = 'none';

    matchedPairs = 0;
    createBoard();

    const countdown = parseInt(countdownTimeSelect.value);
    fullscreenTimer.textContent = countdown;
    fullscreenTimer.classList.add('show');

    const allCards = document.querySelectorAll('.card');

    // Initialize: All cards are flipped to show images or words
    allCards.forEach(card => card.classList.add('flipped'));

    const countdownInterval = setInterval(() => {
        const currentCount = parseInt(fullscreenTimer.textContent);
        fullscreenTimer.textContent = currentCount - 1;

        if (currentCount <= 1) {
            clearInterval(countdownInterval);
            fullscreenTimer.classList.add('fade-out');

            // After countdown, flip cards back to the blank side
            allCards.forEach(card => card.classList.remove('flipped'));

            // Enable card flip functionality
            allCards.forEach(card => card.addEventListener('click', flipCard));

            setTimeout(() => {
                fullscreenTimer.classList.remove('show', 'fade-out');
            }, 1000);
        }
    }, 1000);
}







function flipCard() {
    if (lockBoard) return;
    if (this.classList.contains('flipped')) return; // 已翻開的卡片不可再翻

    this.classList.add('flipped');
    playSound(this.dataset.sound);

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
    matchedPairs++;

    if (matchedPairs === totalPairs) {
        setTimeout(gameOver, 500);
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function playSound(soundFile) {
    const audio = new Audio(`${soundBasePath}${soundFile}`);
    audio.play();
}

function gameOver() {
    Swal.fire({
        title: '恭喜完成遊戲！',
        text: `你成功配對了所有的卡片！`,
        icon: 'success',
        confirmButtonText: '重新開始'
    }).then(() => {
        restartButton.style.display = 'block';
    });
}

restartButton.addEventListener('click', () => {
    startGame();
});

startButton.addEventListener('click', () => {
    startGame();
});

