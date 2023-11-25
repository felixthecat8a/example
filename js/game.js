const game = document.getElementById("game");
const gameButton = '<button type="button" onclick="playGame()">Click to Play</button>';
game.innerHTML = gameButton;
function playGame() {
    const gameHTML = (`<form id="gameApp">
        <h3 id="gameHeading">Guess the number from 1 to 100<br> in 7 tries or less.</h3>
        <div id="reveal"><input type="number" id="guess"><button type="button" id="check">Check</button></div>
        <h4 id="result">Guess the number.</h4>
        <label id="attempt" for="attemptMeter">Attempts: 0 </label><br>
        <meter id="attemptMeter" value="0" min="0" high="5" max="7"></meter><br>
        <button id="play" type="button" >Play Again?</button><button id="close" type="button" >Close</button>
    </form>`);
    game.innerHTML = gameHTML;
    const gameHeading = document.getElementById('gameHeading');
    gameHeading.style.color = 'mediumaquamarine'
    const check = document.getElementById("check");
    const guess = document.getElementById("guess");
    const reveal = document.getElementById("reveal");
    const result = document.getElementById("result");
    const attempt = document.getElementById("attempt");
    const attemptMeter = document.getElementById("attemptMeter");
    const play = document.getElementById("play");
    const close = document.getElementById("close");
    const randomNumber = (Math.floor(Math.random() * 100) + 1);
    console.log(`Answer:${randomNumber}`);
    let attempts = 0;

    play.onclick = function () {
        attemptMeter.setAttribute('value', '0');
        attempts = 0;
        playGame();
    };
    guess.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            check.click();
        }
    });
    check.addEventListener("click", function () {
        let currentNumber = guess.value;
        const maxAttempts = 7;
        attempts++;
        attemptMeter.setAttribute('value', `${attempts}`);
        if (attempts < maxAttempts || currentNumber == randomNumber) {
            if (currentNumber < randomNumber) {
                result.innerText = "Your number is too low. Try again."
                result.style.color = 'cornflowerblue'
                attempt.innerText = `Attempts: ${attempts}`
            }
            else if (currentNumber > randomNumber) {
                result.innerText = "Your number is too high. Try again."
                result.style.color = 'palevioletred'
                attempt.innerText = `Attempts: ${attempts}`
            }
            else {
                reveal.innerHTML = `<h4>The number is ${randomNumber}!</h4>`
                reveal.style.color = 'orange'
                result.innerText = "You guessed it right!"
                result.style.color = 'gold'
                const tries = (attempts === 1) ? "try" : "tries"
                attempt.innerText = `It only took ${attempts} ${tries}.`
            }
        } else {
            reveal.innerHTML = `<h4>The number was ${randomNumber}.</h4>`
            reveal.style.color = 'violet'
            result.innerText = "Sorry, you've reached the limit."
            result.style.color = 'orchid'
            attempt.innerText = `Attempts: ${attempts}`
        }
    });
    close.addEventListener("click", function () {
        attemptMeter.setAttribute('value', '0');
        attempts = 0;
        game.innerHTML = gameButton;
    });
}