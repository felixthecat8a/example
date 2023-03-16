//https://api.weather.gov/points/26.3085,-98.1031
const office = 'BRO';
const grid_X = '53';
const grid_Y = '23';
const endpoint = `https://api.weather.gov/gridpoints/${office}/${grid_X},${grid_Y}/forecast/hourly`;

async function displayWeather() {
    try {
        const response = await fetch(`${endpoint}`);
        const data = await response.json();

        const index = 0;
        const forecastData = getForecastData(data,index)

        const weatherApp = document.getElementById("weatherApp")
        weatherApp.innerHTML = (`${forecastData}`)

        const nwsTitle = document.createElement('h3')
        nwsTitle.setAttribute('id','nwsTitle')
        const nwsText = document.createTextNode('National Weather Service API')
        nwsTitle.appendChild(nwsText)
        weatherApp.insertAdjacentElement('beforebegin',nwsTitle)
        
    } catch (error) {console.log("Failed to get weather data")}
}
displayWeather()

function getForecastData(data,index) {
    const temperature = data.properties.periods[index].temperature;
    const windSpeed = data.properties.periods[index].windSpeed;
    const windDirection = data.properties.periods[index].windDirection;
    const shortForecast = data.properties.periods[index].shortForecast;
    const rain = () => {
        let chanceOfRain = data.properties.periods[index].probabilityOfPrecipitation.value;
        if (chanceOfRain == null) {
            return "0"
        } else {
            return chanceOfRain
        }
    }
    const humidity = data.properties.periods[index].relativeHumidity.value;

    const location = "Edinburg, TX"
    const temperatureDisplay = `Temperature: ${temperature}&degF`;
    const windDisplay = `Wind: ${windSpeed} ${windDirection}`;
    const humidityDisplay = `Humidity: ${humidity}%`
    const rainDisplay = `Chance of Rain: ${rain()}%`

    const forecastData = 
    `
    <div id='weatherTitle'>
        <h3>${location}:<br>JEHS<br>${shortForecast}</h3>
    </div>
    <div id='weatherContent'>
        <h4>${temperatureDisplay}<br>${windDisplay}<br>${humidityDisplay}<br>${rainDisplay}</h4>
    </div>
    `
    return forecastData
}
