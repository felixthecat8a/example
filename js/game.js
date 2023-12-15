const gameDIV = document.getElementById("numberGuessingGame");
const gameButton = '<button type="button" onclick="playGame(true)">Click to Play</button>';
document.addEventListener('DOMContentLoaded', () => { gameDIV.innerHTML = gameButton; });
function playGame(debugGame) {
    window.animatelo.jackInTheBox('#numberGuessingGameContainer')
    const MAX_ATTEMPTS = 7;
    gameDIV.innerHTML = (`
    <h3 id="heading">Guess the number from 1 to 100<br>in ${MAX_ATTEMPTS} tries or less.</h3>
    <input type="number" id="guess" min="1" max="100" placeholder="Guess">
    <button type="button" id="check">Check</button><br>
    <br><label for="meter" id="attempt">Attempts Left: ${MAX_ATTEMPTS}</label><br>
    <meter value="0" min="0" high="5" max="${MAX_ATTEMPTS}" id="meter"></meter><br>
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
    if (debugGame) {
        console.log(answer);
    }
    let attempts = 0;
    guessInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkButton.click();
        }
    });
    checkButton.addEventListener("click", () => {
        if (guessInput.value) {
            attempts++;
            attemptMeter.value = attempts;
            checkNumber(Number(guessInput.value));
        }
    });
    function checkNumber(guessNumber) {
        if (attempts < MAX_ATTEMPTS || guessNumber == answer) {
            if (guessNumber < answer) {
                window.animatelo.shake('#heading');
                updateHeading('Your number is too low.\nTry again.', 'cornflowerblue');
            }
            else if (guessNumber > answer) {
                window.animatelo.shake('#heading');
                updateHeading('Your number is too high.\nTry again.', 'palevioletred');
            }
            else {
                window.animatelo.rubberBand('#heading');
                updateHeading(`You guessed it right!\nThe number is ${answer}!`, 'gold', true);
                disableCheckButton();
            }
        }
        else {
            window.animatelo.flash('#heading');
            updateHeading(`You've reached the limit.\nThe number was ${answer}.`, 'orchid', false);
            disableCheckButton();
        }
    }
    function updateHeading(text, textColor, success) {
        heading.innerText = text;
        heading.style.color = textColor;
        if (!success) {
            attemptLabel.innerText = `Attempts Left: ${MAX_ATTEMPTS - attempts}`;
        }
        else {
            const tries = (attempts === 1) ? 'try' : 'tries';
            attemptLabel.innerText = `It only took ${attempts} ${tries}.`;
        }
    }
    function disableCheckButton() {
        checkButton.disabled = true;
        checkButton.style.opacity = '0.5';
    }
    playAgainButton.onclick = function () {
        attemptMeter.value = 0;
        attempts = 0;
        playGame(true);
    };
    close.addEventListener("click", function () {
        window.animatelo.flip('#numberGuessingGame');
        attemptMeter.setAttribute('value', '0');
        attempts = 0;
        gameDIV.innerHTML = gameButton;
    });
}