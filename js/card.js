document.addEventListener('DOMContentLoaded', function () {
    playMemoryCardGame();
});
function playMemoryCardGame() {
    const cards = [
        '&#x1F34E;', '&#x1F350;', '&#x1F347;', '&#x1F349;',
        '&#x1F34E;', '&#x1F350;', '&#x1F347;', '&#x1F349;',
        '&#x1F34C;', '&#x1F352;', '&#x1F34B;', '&#x1F34A;',
        '&#x1F34C;', '&#x1F352;', '&#x1F34B;', '&#x1F34A;'
    ];
    const cardDecal = '&#x2754;&#x1F408;';
    let selectedCards = [];
    let matchedCards = 0;
    function initializeGame() {
        cards.sort(() => Math.random() - 0.5);
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        cards.forEach((symbol, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index.toString();
            cardElement.innerHTML = cardDecal;
            cardElement.addEventListener('click', flipCard);
            gameBoard.appendChild(cardElement);
        });
    }
    function flipCard() {
        const cardIndex = parseInt(this.dataset.index || '0', 10);
        if (selectedCards.length < 2 && !selectedCards.includes(cardIndex)) {
            this.innerHTML = cards[cardIndex];
            selectedCards.push(cardIndex);
            if (selectedCards.length === 2) {
                setTimeout(checkMatch, 1000);
            }
        }
    }
    function checkMatch() {
        const [card1, card2] = selectedCards;
        if (cards[card1] === cards[card2]) {
            matchedCards += 2;
            if (matchedCards === cards.length) {
                alert('Congratulations! You have matched all cards.');
                resetGame();
            }
        }
        else {
            const cardElements = document.querySelectorAll('.card');
            cardElements[card1].innerHTML = cardDecal;
            cardElements[card2].innerHTML = cardDecal;
        }
        selectedCards = [];
    }
    function resetGame() {
        matchedCards = 0;
        selectedCards = [];
        initializeGame();
    }
    const resetGameButton = document.getElementById('resetGameButton');
    if (resetGameButton) {
        resetGameButton.addEventListener('click', resetGame);
    }
    initializeGame();
}