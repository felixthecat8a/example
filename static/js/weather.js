/*
navigator.geolocation.getCurrentPosition(displayWeather)

async function displayWeather(position) {
    //const pointsURL = 'https://api.weather.gov/points/26.3085,-98.1031'
    const point0 = position.coords.longitude;
    const point1 = position.coords.latitude;
    const pointsURL = `https://api.weather.gov/points/${point1},${point0}`;
    try {
        const locationData = await (await fetch(`${pointsURL}`)).json();
        const endpoint = locationData.properties.forecast;
        const location = getLocation(locationData);
        console.log(`${location}: ${endpoint}`);

        const response = await fetch(`${endpoint}`);
        const data = await response.json();

        createWeatherDisplay(data,location);
    } catch (error) {console.log("Failed to get weather data")}
}

function getLocation(locationData) {
    const city = locationData.properties.relativeLocation.properties.city;
    const state = locationData.properties.relativeLocation.properties.state;
    const location = `${city}, ${state}`;
    return location
}
*/
async function displayWeather() {
    try {
        const endpoint = 'https://api.weather.gov/gridpoints/BRO/54,24/forecast'
        const location = "JEHS"
        console.log(`${location}: ${endpoint}`)

        const response = await fetch(`${endpoint}`)
        const data = await response.json()
    
        const weatherData = getWeatherData(data,location)
        console.log(weatherData)
    
        const weatherApp = document.getElementById("weatherApp")
        weatherApp.innerHTML = (`${weatherData}`)

        createForecast(data)

    } catch (error) {console.log("Failed to get weather data")}
}
displayWeather()

function getWeatherData(data,location) {
    const index = 0
    const name = data.properties.periods[index].name;
    const temperature = data.properties.periods[index].temperature
    const windSpeed = data.properties.periods[index].windSpeed
    const windDirection = data.properties.periods[index].windDirection
    const shortForecast = data.properties.periods[index].shortForecast
    const detailedForecast = data.properties.periods[index].detailedForecast
    const humidity = data.properties.periods[index].relativeHumidity.value
    const icon = data.properties.periods[index].icon
    const rain = () => {
        let chanceOfRain = data.properties.periods[index].probabilityOfPrecipitation.value
        if (chanceOfRain == null) {
            return "0"
        } else {
            return chanceOfRain
        }
    }

    const temperatureDisplay = `Temperature: ${temperature}&degF`
    const windDisplay = `Wind: ${windSpeed} ${windDirection}`
    const humidityDisplay = `Humidity: ${humidity}%`
    const rainDisplay = `Chance of Rain: ${rain()}%`

    const weatherData = 
    (`
    <div id="weatherDiv">
        <div id='weatherTitle'>
            <h4>${location}<br>${name}</h4>
            <img src="${icon}" alt="icon" height="50px" width="auto" title="${detailedForecast}">
        </div>
        <div id='weatherContent'>
            <h4>${temperatureDisplay}<br>${windDisplay}<br>${humidityDisplay}<br>${rainDisplay}</h4>
            <h5>${shortForecast}</h5>
        </div>
    </div>
    <div id='forecastDIV'></div>
    `)
    return weatherData
}

/****************************************************************************************************/
function createForecast(data) {
    const forecastDIV = document.getElementById("forecastDIV");

    for (let index = 1; index < 13; index++) {
        const name = data.properties.periods[index].name;
        const temperatureHigh = data.properties.periods[index].temperature;
        const temperatureLow = data.properties.periods[index+1].temperature;
        const detailedForecast = data.properties.periods[index].detailedForecast;
        const icon = data.properties.periods[index].icon;
        const rain = () => {
            let chanceOfRain = data.properties.periods[index].probabilityOfPrecipitation.value;
            if (chanceOfRain == null) {
                return "0"
            } else {
                return chanceOfRain
            }
        }
        
        const forecastDisplay = `
        <h5 style="color:lightgreen">${name.substring(0,3)}</h5>
        <h6>
            <span style="color:lightblue">${temperatureHigh}&degF</span><br>
            <span style="color:lightcoral">${temperatureLow}&degF</span><br>
            <span title="Chance of Rain">${rain()}%</span>
        </h6>
        <img src="${icon}" alt="icon" height="auto" width="90%" title="${detailedForecast}">
        `;

        const dayTime = data.properties.periods[index].isDaytime;
        if (!dayTime) {
            continue
        } else {
            const forecastDays = document.createElement('div');
            forecastDays.setAttribute('id',"dayForecast");
            forecastDays.innerHTML = forecastDisplay;
            forecastDIV.appendChild(forecastDays);
        }
    }
}
