class WeatherDisplay {
    constructor() {
        this.weatherDisplayDIV = document.getElementById("weatherDisplay")
    }
    async create(latitude, longitude) {
        const pointsURL = (`https://api.weather.gov/points/${latitude},${longitude}`);
        this.weatherDisplayDIV.innerHTML = (`<div id='weatherContainer'>
            <div id="weatherDiv">
                <section id='weatherTitle'>
                    <div id='nearForecastDiv'></div>
                </section>
                <section id='weatherContent'>
                    <div id="currentWeather"></div>
                </section>
            </div>
            <div id="futureForecastDiv"></div>
        </div>`);
        try {
            const headers = {'User-Agent': 'https://github.com/felixthecat8a'}
            const data = await (await fetch(pointsURL, {headers:headers})).json();
            await this.displayNearForecast(data.properties.forecast)
            await this.displayFutureForecast(data.properties.forecast)
            await this.displayCurrentWeather(data)
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get weather API data";
            console.log("Failed to get weather API data");
        }
    }
    async displayNearForecast(endpoint) {
        const nearForecastDiv = document.getElementById("nearForecastDiv");
        try {
            const response = await fetch(endpoint)
            const data = await response.json()
            let index = 0;
            const forecastData = data.properties.periods[index]
            const chanceOfRain = forecastData.probabilityOfPrecipitation.value;
            const rain = chanceOfRain == null ? "0" : chanceOfRain;
            nearForecastDiv.innerHTML = (`
            <div style="font-size:large;">${forecastData.name}:</div>
            <div style="font-size:medium;">${forecastData.temperature}&degF</div>
            <img src="${forecastData.icon}" alt="icon" title="${forecastData.detailedForecast}">
            <div style="font-size:small;">Chance of Rain: ${rain}%</div>
            `);
            
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get forecast data";
            console.log("Failed to get forecast data");
        }
    }
    async displayFutureForecast(endpoint) {
        const forecastDiv = document.getElementById("futureForecastDiv");
        const response = await fetch(endpoint);
        const data = await response.json();
        for (let index = 1; index < 13; index++) {
            const forecastData = data.properties.periods;
            const name = forecastData[index].name;
            const temperatureHigh = forecastData[index].temperature;
            const temperatureLow = forecastData[index + 1].temperature;
            const detailedForecast = forecastData[index].detailedForecast;
            const chanceOfRain = forecastData[index].probabilityOfPrecipitation.value;
            const rain = chanceOfRain == null ? "0" : chanceOfRain;
            const icon = forecastData[index].icon;
            const forecastHTML = (`
            <div title="${name}: ${detailedForecast}">
                <span style="color:lightgreen">${name.substring(0, 3)}:</span> ${rain}%<br>
                <span style="color:lightcoral">${temperatureHigh}&degF</span><br>
                <span style="color:lightblue">${temperatureLow}&degF</span><br>
                <img src="${icon}" alt="icon" height="auto" width="75%" >
            </div>
            `);
            const dayTime = forecastData[index].isDaytime;
            if (!dayTime) {
                continue;
            }
            else {
                const forecastDays = document.createElement("div");
                forecastDays.setAttribute("id", "forecastDay");
                forecastDays.innerHTML = forecastHTML;
                forecastDiv.appendChild(forecastDays);
            }
        }
    }
    async displayCurrentWeather(data) {
        const endpoint = data.properties.forecastHourly
        const locationData = data.properties.relativeLocation.properties
        const location = (`${locationData.city}, ${locationData.state}`)
        console.log(`${location}: ${endpoint}`)
        try {
            const response = await fetch(endpoint)
            const data = await response.json()
            let index = 0;
            const weatherData = data.properties.periods[index];
            const dateTime = new Date(weatherData.startTime);
            const options = {
                weekday: 'long',
                month: "long",
                day: "numeric",
                year: "numeric",
            };
            const today = dateTime.toLocaleDateString('en-US', options);
            const temperature = weatherData.temperature;
            const windSpeed = weatherData.windSpeed;
            const windDirection = weatherData.windDirection;
            const wind = `${windSpeed} ${windDirection}`;
            const shortForecast = weatherData.shortForecast;
            const humidity = weatherData.relativeHumidity.value;
            const currentWeatherHTML = (`
            <div style="font-size:medium;">${today}</div>
            <div style="font-size:x-large;">${location}</div>
            <div style="font-size:xx-large;">${temperature}&degF</div>
            <div style="font-size:large;">Wind: ${wind}</div>
            <div style="font-size:small;">Humidity: ${humidity}%</div>
            <div style="font-size:medium;">Now: ${shortForecast}</div>
            `);
            const currentWeatherDIV = document.getElementById('currentWeather')
            currentWeatherDIV.innerHTML = currentWeatherHTML
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get current weather data"
            console.log("Failed to get current weather data")
        }
    }
}
const weatherDisplay = new WeatherDisplay();
/********************************************************************************************/
const jehsPoints = ({
    location: "JEHS",
    latitude: '26.3086',
    longitude: '-98.103',
    endpoint: "https://api.weather.gov/gridpoints/BRO/54,24/forecast",
});
weatherDisplay.create(jehsPoints.latitude, jehsPoints.longitude);
/********************************************************************************************/
const nwsLink = document.getElementById('nwsLink');
const selectLocationSELECT = document.getElementById('selectLocation');
const weatherStatusDIV = document.getElementById('weatherStatus');
selectLocationSELECT.addEventListener("change", function (event) {
    const weatherLocation = event.target.value;
    switch (weatherLocation) {
        case 'geolocation':
            nwsLink.textContent = "National Weather Service API";
            nwsLink.setAttribute('href','https://www.weather.gov');
            useGeoLocation();
            break;
        case 'jehs':
            nwsLink.textContent = "National Weather Service API";
            nwsLink.setAttribute('href','https://www.weather.gov');
            weatherStatusDIV.innerText = "";
            weatherDisplay.create(jehsPoints.latitude, jehsPoints.longitude);
            break;
        case 'showCat':
            nwsLink.textContent = "The Cat API";
            nwsLink.setAttribute('href','https://www.thecatapi.com');
            weatherStatusDIV.innerText = "";
            displayCat();
            break;
        default:
            break;
    }
});
/********************************************************************************************/
function useGeoLocation() {
    const success = (position) => {
        weatherStatusDIV.innerText = "";
        const geoLongitude = position.coords.longitude;
        const geoLatitude = position.coords.latitude;
        weatherDisplay.create(geoLatitude, geoLongitude);
    };
    const error = () => {
        weatherStatusDIV.innerText = "Unable to retrieve your location";
    };
    if (!navigator.geolocation) {
        weatherStatusDIV.innerText = "Geolocation is not supported by your browser";
    }
    else {
        weatherStatusDIV.innerText = "Locating...";
        navigator.geolocation.getCurrentPosition(success, error);
    }
}
/********************************************************************************************/
async function displayCat() {
    const api_key = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const url = `https://api.thecatapi.com/v1/images/search?limit=1&${api_key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const catImage = data[0].url;
        const catDisplay = document.getElementById("weatherDisplay");
        catDisplay.innerHTML = (`
        <img src="${catImage}" alt="cat" height="270" width="auto"><br>
        <button onclick="displayCat()">New Cat</button><br>
        `);
    }
    catch (error) {
        weatherStatusDIV.innerText = "There was a problem fetching a cat.";
        console.log("There was a problem fetching a cat.");
    }
}
