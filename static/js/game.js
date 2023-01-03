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
    <h2 style='color:lightseagreen'>Guess the number between 1 and 100.</h2>
    <input type="number" id="guess"><button id="check" type="button" >Check</button>
    <h3 id="result">Guess the number.</h3>
    <div id="attempt"></div>
    <div id="reset"></div>
    `)
  
    const check = document.getElementById("check")
    const guess = document.getElementById("guess")
    const result = document.getElementById("result")
    const attempt = document.getElementById("attempt")
    //const reset = document.getElementById("reset")
    let randomNumber = (Math.floor(Math.random() * 100) + 1)
    console.log(randomNumber)
    let attempts = 0

    check.addEventListener("click", guessNumber)

    function guessNumber() {
        attempts++
        if (guess.value < randomNumber) {
            result.innerHTML = "<div style='color:cornflowerblue'>Your number is too low. Try again.</div>"
            attempt.innerHTML = `<h3>Attempt number ${attempts}.</h3>`
        } else if (guess.value > randomNumber) {
            result.innerHTML = "<div style='color:palevioletred'>Your number is too high. Try again.</div>"
            attempt.innerHTML = `<h3>Attempt number ${attempts}.</h3>`
        } else {
            result.innerHTML = "<div style='color:gold'>You guessed it right!</div>"
            attempt.innerHTML = `<h3>It only took you ${attempts} tries.</h3>`
            //reset.innerHTML = "<h3><a href=''> Click to play again.</a></h3>"
            //reset.innerHTML = "<button onclick='resetGame()'>Play Again?</button>"
            game.innerText = "Play Again?"
        }
    }

    /*function resetGame() {
        result.innerText = "Guess the number."
        attempt.innerText = ""
        reset.innerText = ""
        randomNumber = (Math.floor(Math.random() * 100) + 1)
        console.log(randomNumber)
        attempts = 0
        guess.value = ""
    }*/
    
}
