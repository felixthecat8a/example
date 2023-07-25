class WeatherDisplay {
    async create(latitude, longitude) {
        const pointsURL = (`https://api.weather.gov/points/${latitude},${longitude}`);
        try {
            const locationData = await (await fetch(pointsURL)).json();
            const hourlyEndpoint = locationData.properties.forecastHourly
            const forecastEndpoint = locationData.properties.forecast
            const location = this.getLocation(locationData)
            await this.displayWeather(hourlyEndpoint, location)
            await this.displayForecast(forecastEndpoint)
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get location data";
            console.log("Failed to get location data");
        }
    }
    getLocation(locationData) {
        const city = locationData.properties.relativeLocation.properties.city;
        const state = locationData.properties.relativeLocation.properties.state;
        const location = (`${city}, ${state}`);
        return location;
    }
    async displayWeather(endpoint, location) {
        console.log(`${location}: ${endpoint}`)
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const weatherData = this.getWeatherData(data, location);
            const weatherDisplay = document.getElementById("weatherDisplay");
            weatherDisplay.innerHTML = weatherData;
        }
        catch (error) {
            weatherStatusDIV.innerText = "Failed to get weather data";
            console.log("Failed to get weather data");
        }
    }
    getWeatherData(data, location) {
        let index = 0;
        const startTime = data.properties.periods[index].startTime
        const dateTime = new Date(startTime)
        const dayOptions = { weekday: 'long' };
        const day = dateTime.toLocaleDateString(undefined, dayOptions);
        const date = dateTime.toLocaleDateString();
        const temperature = data.properties.periods[index].temperature;
        const windSpeed = data.properties.periods[index].windSpeed;
        const windDirection = data.properties.periods[index].windDirection;
        const wind = `${windSpeed} ${windDirection}`;
        const shortForecast = data.properties.periods[index].shortForecast;
        const humidity = `${data.properties.periods[index].relativeHumidity.value}%`;
        const chanceOfRain = data.properties.periods[index].probabilityOfPrecipitation.value;
        const rain = chanceOfRain == null ? "0%" : `${chanceOfRain}%`;
        const icon = data.properties.periods[index].icon;
        const weatherData = (`<div id='weatherContainer'>
            <div id="weatherDiv">
                <section id='weatherTitle'>
                    <div style="font-size:large;">${day}</div>
                    <div style="font-size:large;">${date}</div>
                    <img src="${icon}" alt="icon" title="${shortForecast}">
                </section>
                <section id='weatherContent'>
                    <div style="font-size:large;">${location}</div>
                    <div style="font-size:xx-large;">${temperature}&degF</div>
                    <div style="font-size:x-large;">Wind: ${wind}</div>
                    <div style="font-size:medium;">Rain: ${rain} Humidity: ${humidity}</div>
                    <div style="font-size:small;">${shortForecast}</div>
                </section>
            </div>
            <div id="forecastDiv"></div>
        </div>`);
        return weatherData;
    }
    async displayForecast(forecastEndpoint) {
        const forecastDiv = document.getElementById("forecastDiv");
        const response = await fetch(forecastEndpoint)
        const data = await response.json()
        for (let index = 1; index < 13; index++) {
            const name = data.properties.periods[index].name;
            const temperatureHigh = data.properties.periods[index].temperature;
            const temperatureLow = data.properties.periods[index + 1].temperature;
            const detailedForecast = data.properties.periods[index].detailedForecast;
            const chanceOfRain = data.properties.periods[index].probabilityOfPrecipitation.value;
            const rain = chanceOfRain == null ? "0" : chanceOfRain;
            const icon = data.properties.periods[index].icon;
            const forecastHTML = (`<div title="${name}: ${detailedForecast}"
                <span style="color:lightgreen">${name.substring(0, 3)}:</span> ${rain}%<br>
                <span style="color:lightcoral">${temperatureHigh}&degF</span><br>
                <span style="color:lightblue">${temperatureLow}&degF</span><br>
                <img src="${icon}" alt="icon" height="auto" width="75%" >
            </div>`);
            const dayTime = data.properties.periods[index].isDaytime;
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
    async createWithEndpoint(endpoint, location) {
        const parsedUrl = new URL(endpoint);
        const path = parsedUrl.pathname.split("/").slice(2, 4).join("/");
        const locationFromEndpoint = location == null ? path : location;
        await this.displayWeather(`${endpoint}/hourly`,`Office/Grid: ${locationFromEndpoint}`);
        await this.displayForecast(endpoint);
    }
}
const weatherDisplay = new WeatherDisplay();
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
/**********************************************************************************/
const jehsPoints = ({
    location: "JEHS",
    latitude: '26.3086',
    longitude: '-98.103',
    endpoint: "https://api.weather.gov/gridpoints/BRO/54,24/forecast",
});
weatherDisplay.createWithEndpoint(jehsPoints.endpoint);
/**********************************************************************************/
const nwsHeading = document.getElementById('nwsHeading');
const nwsLink = '<a href="https://www.weather.gov" target="_blank">National Weather Service API</a>';
const catLink = '<a href="https://www.thecatapi.com" target="_blank">The Cat API</a>';
const selectLocationSELECT = document.getElementById('selectLocation');
const weatherStatusDIV = document.getElementById('weatherStatus');
selectLocationSELECT.addEventListener("change", function (event) {
    const weatherLocation = event.target.value;
    switch (weatherLocation) {
        case 'geolocation':
            nwsHeading.innerHTML = nwsLink;
            useGeoLocation();
            break;
        case 'jehs':
            nwsHeading.innerHTML = nwsLink;
            weatherStatusDIV.innerText = "";
            weatherDisplay.create(jehsPoints.latitude, jehsPoints.longitude);
            break;
        case 'showCat':
            nwsHeading.innerHTML = catLink;
            weatherStatusDIV.innerText = "";
            displayCat();
            break;
        default:
            break;
    }
});
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
