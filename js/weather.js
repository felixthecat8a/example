class WeatherDisplay {
    constructor() {
        this.weatherDisplay = document.getElementById("weatherDisplay");
    }
    async create(latitude, longitude) {
        const pointsURL = (`https://api.weather.gov/points/${latitude},${longitude}`);
        try {
            const data = await (await fetch(pointsURL)).json();
            const endpoint = data.properties.forecastHourly
            const location = this.getLocation(data)
            await this.displayWeather(endpoint, location)
            await this.displayForecast(data.properties.forecast)
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get location data";
            console.log("Failed to get location data");
        }
    }
    getLocation(data) {
        const locationData = data.properties.relativeLocation.properties
        return (`${locationData.city}, ${locationData.state}`);
    }
    async displayWeather(endpoint, location) {
        console.log(`${location}: ${endpoint}`)
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const weatherHTML = this.getWeatherData(data, location);
            this.weatherDisplay.innerHTML = weatherHTML;
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get weather data";
            console.log("Failed to get weather data");
        }
    }
    getWeatherData(data, location) {
        let index = 0;
        const weatherData = data.properties.periods[index]
        const temperature = weatherData.temperature;
        const windSpeed = weatherData.windSpeed;
        const windDirection = weatherData.windDirection;
        const wind = `${windSpeed} ${windDirection}`;
        const shortForecast = weatherData.shortForecast;
        const humidity = weatherData.relativeHumidity.value;
        const chanceOfRain = weatherData.probabilityOfPrecipitation.value;
        const rain = chanceOfRain == null ? "0" : chanceOfRain;
        const weatherHTML = (`<div id='weatherContainer'>
            <div id="weatherDiv">
                <section id='weatherTitle'>
                    <div id='forecastContent'></div>
                </section>
                <section id='weatherContent'>
                    <div style="font-size:large;">${location}</div>
                    <div style="font-size:xx-large;">${temperature}&degF</div>
                    <div style="font-size:x-large;">Wind: ${wind}</div>
                    <div style="font-size:medium;">Rain: ${rain}% Humidity: ${humidity}%</div>
                    <div style="font-size:small;">${shortForecast}</div>
                </section>
            </div>
            <div id="forecastDiv"></div>
        </div>`);
        return weatherHTML;
    }
    async displayForecast(forecastEndpoint) {
        const forecastDiv = document.getElementById("forecastDiv");
        const response = await fetch(forecastEndpoint);
        const data = await response.json();
        this.currentForecast(data);
        for (let index = 1; index < 13; index++) {
            const forecastData = data.properties.periods;
            const name = forecastData[index].name;
            const temperatureHigh = forecastData[index].temperature;
            const temperatureLow = forecastData[index + 1].temperature;
            const detailedForecast = forecastData[index].detailedForecast;
            const chanceOfRain = forecastData[index].probabilityOfPrecipitation.value;
            const rain = chanceOfRain == null ? "0" : chanceOfRain;
            const icon = forecastData[index].icon;
            const forecastHTML = (`<div title="${name}: ${detailedForecast}"
                <span style="color:lightgreen">${name.substring(0, 3)}:</span> ${rain}%<br>
                <span style="color:lightcoral">${temperatureHigh}&degF</span><br>
                <span style="color:lightblue">${temperatureLow}&degF</span><br>
                <img src="${icon}" alt="icon" height="auto" width="75%" >
            </div>`);
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
    currentForecast(data){
        let index = 0;
        const forecastData = data.properties.periods[index]
        const forecastContentData = (`
            <div style="font-size:large;">${forecastData.name}:</div>
            <div style="font-size:medium;">${forecastData.temperature}&degF</div>
            <img src="${forecastData.icon}" alt="icon" title="${forecastData.detailedForecast}">
        `);
        const forecastContent = document.getElementById('forecastContent');
        forecastContent.innerHTML = forecastContentData;

    }
    async createWithEndpoint(endpoint, location) {
        const parsedUrl = new URL(endpoint);
        const path = parsedUrl.pathname.split("/").slice(2, 4).join("/");
        const locationFromEndpoint = location == null ? path : location;
        await this.displayWeather(`${endpoint}/hourly`,`Office/Grid: ${locationFromEndpoint}`);
        await this.displayForecast(endpoint);
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
weatherDisplay.createWithEndpoint(jehsPoints.endpoint,jehsPoints.location);
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
        catDisplay.innerHTML = (`<img src="${catImage}" alt="cat" height="200" width="auto">`);
    }
    catch (error) {
        weatherStatusDIV.innerText = "There was a problem fetching a cat.";
        console.log("There was a problem fetching a cat.");
    }
}
