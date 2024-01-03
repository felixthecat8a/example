class WeatherDataUtil {
    static async fetchPointsData(latitude, longitude) {
        try {
            const url = new URL(`https://api.weather.gov/points/${latitude},${longitude}`);
            const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
            const request = new Request(url, { headers: headers });
            const response = await fetch(request);
            const pointsData = await response.json();
            return pointsData;
        }
        catch (error) {
            throw new Error('Failed to Fetch Points Data');
        }
    }
    static getPointsForecastEndpoint(pointsData) {
        return new URL(pointsData.properties.forecast);
    }
    static getPointsLocationName(pointsData) {
        const locationData = pointsData.properties.relativeLocation.properties;
        return (`${locationData.city}, ${locationData.state}`);
    }
    static async setCurrentWeather(divId, pointsData) {
        const currentWeather = document.getElementById(divId);
        try {
            const url = new URL(pointsData.properties.forecastHourly);
            const request = new Request(url);
            const response = await fetch(request);
            const data = await response.json();
            const wd = data.properties.periods[0];
            const weatherDataHTML = (`
            <div style="font-size:1rem;">${this.formatDateTime(wd.startTime)}</div>
            <div style="font-size:1.5rem;">${this.getPointsLocationName(pointsData)}</div>
            <div style="font-size:2.5rem;">${wd.temperature}&deg;F</div>
            <div style="font-size:1rem;">${wd.windSpeed} ${wd.windDirection}</div>
            <div style="font-size:1.1rem;">${wd.shortForecast}</div>
            `);
            currentWeather.innerHTML = weatherDataHTML;
        }
        catch (error) {
            console.error(error);;
        }
    }
    static formatDateTime(dateTimeData) {
        const dateTime = new Date(dateTimeData);
        const options = { dateStyle: 'full' };
        return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
    }
}
/***************************************************************************************************/
class StatusUtil {
    statusDIV;
    constructor(statusDivElement) {
        this.statusDIV = document.getElementById(statusDivElement);
    }
    setStatus(message) {
        this.statusDIV.textContent = message;
    }
}
const statusDiv = new StatusUtil('statusDiv');
/***************************************************************************************************/
class FutureForecast {
    futureForecastDiv;
    nearForecastDiv;
    constructor(futureForcastName, nearForecastName) {
        this.futureForecastDiv = document.getElementById(futureForcastName);
        this.nearForecastDiv = document.getElementById(nearForecastName);
    }
    async setForecastData(pointsData) {
        const locationName = WeatherDataUtil.getPointsLocationName(pointsData);
        const endpoint = new Request(WeatherDataUtil.getPointsForecastEndpoint(pointsData));
        console.log(`Displaying weather for ${locationName}: ${endpoint.url}!`);
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            this.setFutureForecast(data);
            const index = 0;
            const fd = data.properties.periods[index];
            const chanceOfRain = fd.probabilityOfPrecipitation.value;
            const rainChance = chanceOfRain == null ? "0" : chanceOfRain;
            this.nearForecastDiv.innerHTML = (`
            <div style="font-size:1rem;">${fd.name}</div>
            <img src="${fd.icon}" alt="icon" title="${fd.name}: ${fd.detailedForecast}">
            <div style="font-size:0.75rem;">Temperature: ${fd.temperature}&deg;F</div>
            <div style="font-size:0.75rem;">Wind: ${fd.windSpeed} ${fd.windDirection}</div>
            <div style="font-size:0.75rem;">Chance of Rain: ${rainChance}%</div>
            `);
        }
        catch (error) {
            this.nearForecastDiv.innerHTML = '<h3>Unavailable</h3>';
        }
    }
    setFutureForecast(forecastData) {
        const fd = forecastData.properties.periods;
        for (let i = 1; i < 13; i++) {
            const title = `${fd[i].name}: ${fd[i].detailedForecast}`;
            const rain = fd[i].probabilityOfPrecipitation?.value || "0";
            const dayHTML = (`
            <span style="color:lightgreen">${fd[i].name.substring(0, 3)}:</span> ${rain}%<br>
            <span style="color:lightcoral">${fd[i].temperature}&deg;F</span><br>
            <span style="color:lightblue">${fd[i + 1].temperature}&deg;F</span><br>
            <img src="${fd[i].icon}" alt="icon" height="auto" width="70%" loading="lazy">
            `);
            const isDaytime = fd[i].isDaytime;
            if (!isDaytime) {
                continue;
            }
            else {
                const forecastDays = document.createElement("div");
                forecastDays.classList.add("forecastDay");
                forecastDays.setAttribute("title", title);
                forecastDays.innerHTML = dayHTML;
                this.futureForecastDiv.appendChild(forecastDays);
            }
        }
    }
}
/***************************************************************************************************/
async function displayForecast(latitude, longitude) {
    console.log(`URL: https://api.weather.gov/points/${latitude},${longitude}`);
    const forecastDisplayDiv = document.getElementById("displayDiv");
    forecastDisplayDiv.innerHTML = (`
    <div id="forecastDiv">
        <section id='forecastLeftSection'></section>
        <section id='forecastRightSection'></section>
    </div>
    <div id="futureForecastDiv"></div>
    `);
    const nearForecastId = 'forecastLeftSection';
    const currentWeatherId = 'forecastRightSection';
    const futureForcastId = 'futureForecastDiv';
    const forecast = new FutureForecast(futureForcastId, nearForecastId);
    try {
        const pointsData = await WeatherDataUtil.fetchPointsData(latitude, longitude);
        await WeatherDataUtil.setCurrentWeather(currentWeatherId, pointsData);
        forecast.setForecastData(pointsData);
        statusDiv.setStatus(null);
    }
    catch (error) {
        statusDiv.setStatus(error);
    }
}
/***************************************************************************************************/
const JEHS = { latitude: '26.3086', longitude: '-98.103' };
document.addEventListener('DOMContentLoaded', () => { displayForecast(JEHS.latitude, JEHS.longitude); });
/***************************************************************************************************/
const locationSelectorDiv = document.getElementById('selectLocation');
locationSelectorDiv.addEventListener("change", (event) => {
    const weatherLocation = event.target.value;
    switch (weatherLocation) {
        case 'geolocation':
            setHeadingLink('National Weather Service API', 'https://www.weather.gov');
            useGeoLocation();
            break;
        case 'fixedlocation':
            setHeadingLink('National Weather Service API', 'https://www.weather.gov');
            displayForecast(JEHS.latitude, JEHS.longitude);
            break;
        case 'showCat':
            setHeadingLink('The Cat API', 'https://www.thecatapi.com');
            displayCat();
            break;
        default:
            break;
    }
});
/***************************************************************************************************/
function setHeadingLink(linkTitle, linkTarget) {
    const nwsLink = document.getElementById('nwsLink');
    nwsLink.textContent = linkTitle;
    nwsLink.setAttribute('href', linkTarget);
}
/***************************************************************************************************/
function useGeoLocation() {
    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        displayForecast(latitude, longitude);
    };
    const error = (error) => { statusDiv.setStatus(error.message); };
    if (!navigator.geolocation) {
        statusDiv.setStatus('Geolocation is not supported by the browser.');
    }
    else {
        statusDiv.setStatus('Locating...');
        const options = { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
}
/***************************************************************************************************/
async function displayCat() {
    const API_KEY = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const CAT_URL = 'https://api.thecatapi.com/v1/images/search?limit=1';
    try {
        const response = await fetch(CAT_URL, { headers: { 'x-api-key': API_KEY } });
        const data = await response.json();
        const catDisplay = document.getElementById("displayDiv");
        catDisplay.innerHTML = (`
        <img src="${data[0].url}" alt="cat" height="300" width="auto"><br>
        <button type="button" onclick="displayCat()">New Cat</button><br>
        `);
        statusDiv.setStatus(null);
    }
    catch (error) {statusDiv.setStatus("There was a problem fetching a cat.")}
}
