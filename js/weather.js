displayWeather()

let selectLocation = document.getElementById('selectLocation')
selectLocation.addEventListener("change", function(event) {
    let status = document.getElementById('status')
    const weatherLocation = event.target.value;
    switch (weatherLocation) {
        case 'geolocation':
            success = (position) => {
                status.innerText = "";
                displayGeoWeather(position)
              }
            error = () => {
                status.innerText = "Unable to retrieve your location";
            }
            if (!navigator.geolocation) {
                status.innerText = "Geolocation is not supported by your browser";
            } else {
                status.innerText = "Locating…";
                navigator.geolocation.getCurrentPosition(success, error);
            }
            break
        case 'showCat':
            displayCat();
            break;
        default:
            displayWeather()
            break
    }
})
/****************************************************************************************************/
async function displayGeoWeather(position) {
    const geoLat = position.coords.latitude;
    const geoLong = position.coords.longitude;
    const pointsURL = `https://api.weather.gov/points/${geoLat},${geoLong}`;
    try {
        const locationData = await (await fetch(`${pointsURL}`)).json();
        const endpoint = locationData.properties.forecast;
        const location = getLocation(locationData);
        console.log(`${location}: ${endpoint}`);

        createWeatherDisplay(endpoint,location);
    } catch (error) {console.log("Failed to get weather data")}
}

function getLocation(locationData) {
    const city = locationData.properties.relativeLocation.properties.city;
    const state = locationData.properties.relativeLocation.properties.state;
    const location = `${city}, ${state}`;
    return location
}
/****************************************************************************************************/
function displayWeather() {
    try {
        const endpoint = 'https://api.weather.gov/gridpoints/BRO/54,24/forecast'
        const location = "JEHS"
        console.log(`${location}: ${endpoint}`)

        createWeatherDisplay(endpoint,location);

    } catch (error) {console.log("Failed to get weather data")}
}

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
    <h3 id='nwsTitle'>${location}</h3>
    <div id="weatherDiv">
        <div id='weatherTitle'>
            <h4>${name}</h4>
            <img src="${icon}" alt="icon" height="75px" width="auto" title="${detailedForecast}">
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

async function createWeatherDisplay(endpoint,location) {
    const response = await fetch(`${endpoint}`)
    const data = await response.json()

    const weatherData = getWeatherData(data,location)

    const weatherApp = document.getElementById("weatherApp")
    weatherApp.innerHTML = (`${weatherData}`)

    createForecast(data)
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
        
        const forecastDisplay = (`
        <span style="color:lightgreen">${name.substring(0,3)}: </span><span title="Chance of Rain">${rain()}%</span><br>
        <span style="color:lightblue">High: ${temperatureHigh}&degF</span><br>
        <span style="color:lightcoral">Low: ${temperatureLow}&degF</span><br>
        <img src="${icon}" alt="icon"  width="90%" height="auto" title="${detailedForecast}">
        `);

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
/****************************************************************************************************/
async function displayCat() {
    const kitty = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const cat = `https://api.thecatapi.com/v1/images/search?limit=9&${kitty}`;
    try {
        const response = await (await fetch(cat))
        const data = await response.json()
        const catImage = data[0].url;
        const weatherData = `<img src="${catImage}" alt="cat" height="auto" width="350">`;
        const weatherDisplay = document.getElementById("weatherApp");
        weatherDisplay.innerHTML = (`${weatherData}`);
    } catch (error) {console.log("There was a problem fetching a cat.")}
}
