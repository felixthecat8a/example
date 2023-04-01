var celsiusVal = (document.getElementById("celsiusVal"))
var fahrenheitVal = (document.getElementById('fahrenheitVal'))
const convert = (document.getElementById("convert"))

celsiusVal.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault()
      convert.click()
    }
});

fahrenheitVal.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault()
      convert.click()
    }
});

convert.addEventListener("click", toFahrenheit)
function toFahrenheit() {
    if (celsiusVal.value) {
        var fahrenheitOutput = convertCtoF(celsiusVal)
        fahrenheitVal.value = fahrenheitOutput.toFixed(2)
        let kelvin = convertCtoK(celsiusVal)
        console.log('Temperature in Kelvin: ',kelvin.toFixed(2),'K')
    } else {fahrenheitVal.value = ''}
}

fahrenheitVal.addEventListener("input", toCelsius)
function toCelsius() {
    if (fahrenheitVal.value) {
        var celsiusOutput = convertFtoC(fahrenheitVal)
        celsiusVal.value = celsiusOutput.toFixed(2)
    } else {celsiusVal.value = ''}
}

function convertCtoF(x) {
    return (parseFloat(x.value) * 1.8 + 32)
}

function convertFtoC(y) {
    return ((parseFloat(y.value) - 32) / 1.8)
}

function convertCtoK(z) {
    return  (parseFloat(z.value) + 273.15)
}
