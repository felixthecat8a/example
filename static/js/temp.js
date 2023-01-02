var celciusVal = (document.getElementById("celciusVal"))
var fahrenheitVal = (document.getElementById('fahrenheitVal'))

celciusVal.addEventListener("input", toFahrenheit)
function toFahrenheit() {
    if (celciusVal.value) {
        var fahrenheitOutput = convertCtoF(celciusVal)
        fahrenheitVal.value = fahrenheitOutput.toFixed(2)
    } else {fahrenheitVal.value = ''}
}
fahrenheitVal.addEventListener("input", toCelcius)
function toCelcius() {
    if (fahrenheitVal.value) {
        var celciusOutput = convertFtoC(fahrenheitVal)
        celciusVal.value = celciusOutput.toFixed(2)
    } else {celciusVal.value = ''}
}

function convertCtoF(x) {
    return (parseFloat(x.value) * 1.8 + 32)
}

function convertFtoC(y) {
    return ((parseFloat(y.value) - 32) / 1.8)
}
