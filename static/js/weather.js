//https://api.weather.gov/points/26.3085,-98.1031
const office = 'BRO';
const grid_X = '53';
const grid_Y = '23';
const endpoint = `https://api.weather.gov/gridpoints/${office}/${grid_X},${grid_Y}/forecast`;

async function displayWeather() {
    try {
        const response = await fetch(`${endpoint}`);
        const data = await response.json();

        const index = 0;
        const temperature = data.properties.periods[index].temperature;
        const windSpeed = data.properties.periods[index].windSpeed;
        const windDirection = data.properties.periods[index].windDirection;
        const shortForecast = data.properties.periods[index].shortForecast;
        const detailedForecast = data.properties.periods[index].detailedForecast;
    
        const weatherApp = document.getElementById("weatherApp")
        weatherApp.innerHTML = (`
        <h2 style='color:darkseagreen;' title='${detailedForecast}'>
            Edinburg, Tx: ${shortForecast}<br>Temperature: ${temperature}&degF<br>Wind: ${windSpeed} ${windDirection}
        </h2>
        `)
    } catch (error) {console.log("Failed to get weather data")}
}
displayWeather()
