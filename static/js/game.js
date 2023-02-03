/* In the HTML file:
<div id="play"></div>
<button id="game" type="button">JavaScript Number Guessing Game</button>
<script src="./js/game.js"></script>
*/

const game = document.getElementById("game")
const play = document.getElementById("play")

game.addEventListener("click", playGame)

function playGame() {
    play.innerHTML = (`
    <form>
        <h2 style='color:lightseagreen'>Guess the number between 1 and 100 in ten tries or less.</h2>
        <div id="final">
            <input type="number" id="guess"><button id="check" type="button" >Check</button>
        </div>
        <h3 id="result">Guess the number.</h3>
        <div id="attempt"></div>
    </form>
    `)
  
    const check = document.getElementById("check")
    const guess = document.getElementById("guess")
    const result = document.getElementById("result")
    const attempt = document.getElementById("attempt")
    
    let randomNumber = (Math.floor(Math.random() * 100) + 1)
    console.log(randomNumber)
    let attempts = 0

    guess.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault()
            check.click()
        }
    });
    
    check.addEventListener("click", guessNumber)
    function guessNumber() {
        attempts++
        if (guess.value < randomNumber && attempts != 10) {
            result.innerHTML = "<div style='color:cornflowerblue'>Your number is too low. Try again.</div>"
            attempt.innerHTML = `<h3>Attempts: ${attempts}</h3>`
        } else if (guess.value > randomNumber && attempts != 10) {
            result.innerHTML = "<div style='color:palevioletred'>Your number is too high. Try again.</div>"
            attempt.innerHTML = `<h3>Attempts: ${attempts}</h3>`
        } else if (guess.value != randomNumber && attempts >= 10) {
	    document.getElementById("final").innerHTML = `<h3>The number was ${randomNumber}.</h3>`
	    result.innerHTML = "<div style='color:violet'>Sorry, you've reached the attempt limit.</div>"
            attempt.innerHTML = `<h3>Attempts: ${attempts}</h3>`
        } else {
            document.getElementById("final").innerHTML = `<h3>The number is ${guess.value}!</h3>`
            result.innerHTML = "<div style='color:gold'>You guessed it right!</div>"
            attempt.innerHTML = `<h3>It only took ${attempts} ${tries()}.</h3>`
        }
    }
    
    function tries() {
        if (attempts === 1) {
            return "try"
        } else {
            return "tries"
        }
    }
}
