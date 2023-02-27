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
        const temperature = data.properties.periods[index].temperature;
        const windSpeed = data.properties.periods[index].windSpeed;
        const windDirection = data.properties.periods[index].windDirection;
        const shortForecast = data.properties.periods[index].shortForecast;
    
        const weatherLocation = "Edinburg, TX"
        const temperatureDisplay = `Temperature: ${temperature}&degF`;
        const windDisplay = `Wind: ${windSpeed} ${windDirection}`;

        const weatherApp = document.getElementById("weatherApp")
        weatherApp.innerHTML = (`
        <div id='weatherTitle'>
            <h3>${weatherLocation}:<br> ${shortForecast}</h3>
        </div>
        <div id='weatherContent'>
            <h4>${temperatureDisplay}</h4>
            <h4>${windDisplay}</h4>
        </div>
        `)
    } catch (error) {console.log("Failed to get weather data")}
}
displayWeather()
