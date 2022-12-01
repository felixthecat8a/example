const celciusInput = document.getElementById("celciusInput")
const fahrenheitDisplay = document.getElementById("fahrenheitDisplay")
const fahrenheitInput = document.getElementById('fahrenheitInput')
const celciusDisplay = document.getElementById("celciusDisplay")

celciusInput.addEventListener("input", displayFunctionC)

function displayFunctionC() {
    if (celciusInput.value) {
        let fahrenheitOutput = convertCtoF(celciusInput)
        fahrenheitDisplay.innerText = "The temperature is " + fahrenheitOutput.toFixed(2) + "\xB0 Fahrenheit."
    } else {
        fahrenheitDisplay.innerText = "The temperature in \xB0F will display here."
    }
}

fahrenheitInput.addEventListener("input", displayFunctionF)

function displayFunctionF() {
    if (fahrenheitInput.value) {
        let celciusOutput = convertFtoC(fahrenheitInput)
        celciusDisplay.innerText = "The temperature is " + celciusOutput.toFixed(2) + "\xB0 Celcius."
    } else {
        celciusDisplay.innerText = "The temperature in \xB0C will display here."
    }
}

function convertCtoF(x) {
    return parseFloat(x.value) * 1.8 + 32
}

function convertFtoC(y) {
    return (parseFloat(y.value) - 32) / 1.8
}
