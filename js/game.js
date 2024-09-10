const gameDIV = document.getElementById("numberGuessingGame");
const gameButton = '<button type="button" onclick="playGame(true)">Click to Play</button>';
document.addEventListener('DOMContentLoaded', () => { gameDIV.innerHTML = gameButton; });
function playGame(debugGame) {
    window.animatelo.jackInTheBox('#numberGuessingGameContainer');
    const limit = 7;
    gameDIV.innerHTML = (`
    <h3 id="heading">Guess the number from 1 to 100<br>in ${limit} tries or less.</h3>
    <input type="number" id="guess" min="1" max="100" placeholder="Guess">
    <button type="button" id="check">Check</button><br>
    <br><h3 id="attempt">Attempts Left: ${limit}</h3>
    <meter value="0" min="0" high="5" max="${limit}" id="meter"></meter><br>
    <button type="button" id="playAgain">Play Again?</button>
    <button type="button" id="close">Close</button>
    `);
    const heading = document.getElementById("heading");
    heading.style.color = 'mediumaquamarine';
    const guessInput = document.getElementById("guess");
    const checkButton = document.getElementById("check");
    const attemptLabel = document.getElementById("attempt");
    const attemptMeter = document.getElementById("meter");
    const playAgainButton = document.getElementById("playAgain");
    const close = document.getElementById("close");
    const answer = (Math.floor(Math.random() * 100) + 1);
    if (debugGame) { console.log(answer) };
    let attempts = 0;
    attemptMeter.value = 0;
    guessInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkButton.click();
        };
    });
    checkButton.addEventListener("click", () => {
        if (guessInput.value) {
            attempts++;
            attemptMeter.value = attempts;
            checkNumber(Number(guessInput.value));
        };
    });
    function checkNumber(guessNumber) {
        if (attempts < limit || guessNumber == answer) {
            if (guessNumber < answer) {
                window.animatelo.shake('#heading');
                heading.innerText = 'Your number is too low.\nTry again.';
                heading.style.color = 'cornflowerblue';
                attemptLabel.innerText = `Attempts Left: ${limit - attempts}`;
            } else if (guessNumber > answer) {
                window.animatelo.shake('#heading');
                heading.innerText = 'Your number is too high.\nTry again.';
                heading.style.color = 'palevioletred';
                attemptLabel.innerText = `Attempts Left: ${limit - attempts}`;
            } else {
                window.animatelo.rubberBand('#heading');
                heading.innerText = `You guessed it right!\nThe number is ${answer}!`;
                heading.style.color = 'gold';
                const tries = (attempts === 1) ? 'try' : 'tries';
                attemptLabel.innerText = `It only took ${attempts} ${tries}.`;
                disableCheckButton();
            };
        } else {
            window.animatelo.flash('#heading');
            heading.innerText = `You've reached the limit.\nThe number was ${answer}.`;
            heading.style.color = 'orchid';
            attemptLabel.innerText = `Attempts Left: ${limit - attempts}`;
            disableCheckButton();
        };
    };
    function disableCheckButton() {
        checkButton.disabled = true;
        checkButton.style.opacity = '0.5';
    };
    playAgainButton.onclick = function () {
        playGame(true);
    };
    close.addEventListener("click", function () {
        window.animatelo.flip('#numberGuessingGame');
        gameDIV.innerHTML = gameButton;
    });
};