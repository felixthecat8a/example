require('../scss/style.scss')

const gameDIV = document.getElementById('numberGuessingGame')
const gameButton = '<button type="button" id="startGame" class="button-info">Click to Play</button>'

function setGame(limit) {
  gameDIV.innerHTML = gameButton

  document.getElementById('startGame').addEventListener('click', () => playGame(limit))
}

document.addEventListener('DOMContentLoaded', () => {
  setGame(5)
})

function playGame(limit) {
  window.animatelo.jackInTheBox('#numberGuessingGameContainer')
  gameDIV.innerHTML = `
  <input type="number" id="guess" min="1" max="100" placeholder="Guess">
  <button type="button" id="check" class="button-success">Check</button><br>
  <h4 id="heading">Guess the number from 1 to 100<br>in ${limit} tries or less.</h4>
  <meter value="0" min="0" high="5" max="${limit}" id="meter"></meter><br>
  <button type="button" id="playAgain" class="button-primary">Play Again?</button>
  <button type="button" id="close" class="button-danger">Close</button>
  `
  const heading = document.getElementById('heading')
  heading.style.color = 'mediumaquamarine'
  const guessInput = document.getElementById('guess')
  const checkButton = document.getElementById('check')
  const attemptMeter = document.getElementById('meter')
  const playAgainButton = document.getElementById('playAgain')
  const close = document.getElementById('close')
  const answer = Math.floor(Math.random() * 100) + 1
  console.log(answer)
  let attempts = 0
  attemptMeter.value = 0
  guessInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      checkButton.click()
    }
  })
  checkButton.addEventListener('click', () => {
    if (guessInput.value) {
      checkNumber(Number(guessInput.value))
    }
  })
  function checkNumber(guessNumber) {
    attempts++
    attemptMeter.value = attempts
    if (guessNumber === answer) {
      window.animatelo.rubberBand('#heading')
      const tries = attempts === 1 ? 'try' : 'tries'
      updateHeading(`${answer} is correct\nin only ${attempts} ${tries}!`, 'gold')
      disableCheckButton()
      return
    }
    if (attempts < limit) {
      window.animatelo.shake('#heading')
      if (guessNumber < answer) {
        updateHeading(`Too low. Try again.\nAttempts Left: ${limit - attempts}`, 'cornflowerblue')
      } else {
        updateHeading(`Too high. Try again.\nAttempts Left: ${limit - attempts}`, 'palevioletred')
      }
    } else {
      window.animatelo.flash('#heading')
      updateHeading(`You've reached the limit.\nThe number was ${answer}.`, 'orchid')
      disableCheckButton()
    }
  }
  function updateHeading(text, color) {
    heading.innerText = text
    heading.style.color = color
  }
  function disableCheckButton() {
    checkButton.disabled = true
    checkButton.style.opacity = '0.5'
  }
  playAgainButton.onclick = () => playGame(limit)
  close.addEventListener('click', function () {
    window.animatelo.flip('#numberGuessingGame')
    setGame(limit)
  })
}
