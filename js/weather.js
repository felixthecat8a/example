class WeatherDataUtil {
    static async fetchPointData(latitude, longitude) {
        const url = new URL(`https://api.weather.gov/points/${latitude},${longitude}`);
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
        const request = new Request(url, { headers: headers });
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status}: Weather Data Not Found`);
        }
        return await response.json();
    }
    static getForecastEndpoint(pointData) {
        return new URL(pointData.properties.forecast);
    }
    static getLocationName(pointData) {
        const locationData = pointData.properties.relativeLocation.properties;
        return (`${locationData.city}, ${locationData.state}`);
    }
    static async setCurrentWeather(pointData) {
        const url = new URL(pointData.properties.forecastHourly);
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
        const request = new Request(url, { headers: headers });
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status}: Weather Data Not Found`);
        }
        const data = await response.json();
        const wd = data.properties.periods[0];
        return (`
        <div style="font-size:1rem;">${this.formatDateTime(wd.startTime)}</div>
        <div style="font-size:1.5rem;">${this.getLocationName(pointData)}</div>
        <div style="font-size:2.5rem;">${wd.temperature}&deg;F</div>
        <div style="font-size:1rem;">${wd.windSpeed} ${wd.windDirection}</div>
        <div style="font-size:1rem;">${wd.shortForecast}</div>
        `);
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
class ForecastChart {
    ctx;
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId);
    }
    createChart(forecastData, locationName) {
        const { Chart } = window;
        Chart.defaults.color = 'darkgray';
        this.ctx.style.backgroundColor = '#1e1e1e';
        const data = this.setData(forecastData);
        const options = this.setOptions(locationName);
        const config = { type: "line", data: data, options: options };
        const temperatureChart = new Chart(this.ctx, config);
        this.setChartWidth(temperatureChart);
        window.addEventListener('resize', () => { this.setChartWidth(temperatureChart); });
    }
    setData(forecastData) {
        const highData = forecastData.properties.periods.filter((pd) => pd.isDaytime);
        const lowData = forecastData.properties.periods.filter((pd) => !pd.isDaytime);
        const highTemp = highData.map((period) => period.temperature);
        const lowTemp = lowData.map((period) => period.temperature);
        const hiDataSet = { label: "Highs", data: highTemp, borderColor: "red", pointRadius: 3 };
        const loDataSet = { label: "Lows", data: lowTemp, borderColor: "blue", pointRadius: 3 };
        const roomTemperature = 72;
        const rt = Array(highTemp.length).fill(roomTemperature);
        const rtDataSet = { label: "72\u00B0F", data: rt, borderColor: "green", pointRadius: 0 };
        const dp = lowData.map((period) => (period.dewpoint.value * 9 / 5) + 32);
        const dpDataSet = { label: "Dewpoint", data: dp, borderColor: "purple", pointRadius: 3 };
        const labels = highData.map((period) => period.name);
        const datasets = [hiDataSet, loDataSet, rtDataSet, dpDataSet];
        const data = { labels: labels, datasets: datasets };
        return data;
    }
    setOptions(location) {
        const name = 'Temperature Forecast';
        const title = { display: true, text: name, color: 'gray', font: { size: 18 } };
        const subtitle = { display: true, text: location, color: 'gray', font: { size: 16 } };
        const plugins = { title: title, subtitle: subtitle };
        const grid = { display: true, color: '#333' };
        const scaleX = { title: { display: true, text: 'Temperature (\u00B0F)' }, grid: grid };
        const scaleY = { title: { display: true, text: 'Day of the Week' }, grid: grid };
        const options = { plugins: plugins, scales: { y: scaleX, x: scaleY } };
        return options;
    }
    setChartWidth(forecastTemperatureChart) {
        const chartStyle = forecastTemperatureChart.canvas.parentNode.style;
        chartStyle.border = 'solid thin darkseagreen';
        const screenWidth = window.innerWidth;
        chartStyle.margin = 'auto';
        if (screenWidth <= 550) {
            forecastTemperatureChart.resize(screenWidth, 'auto');
            chartStyle.width = '100%';
        }
        else {
            forecastTemperatureChart.resize(550, 'auto');
            chartStyle.width = '550px';
        }
    }
}
class WeatherForecast extends ForecastChart {
    nearForecastDiv;
    currentWeatherDiv;
    alertDiv;
    futureForecastDiv;
    constructor(nearId, currentId, alertId, futureId, canvasId) {
        super(canvasId);
        this.nearForecastDiv = document.getElementById(nearId);
        this.currentWeatherDiv = document.getElementById(currentId);
        this.alertDiv = document.getElementById(alertId);
        this.futureForecastDiv = document.getElementById(futureId);
    }
    async displayForecast(latitude, longitude) {
        console.log(`Points URL: https://api.weather.gov/points/${latitude},${longitude}`);
        const pointData = await WeatherDataUtil.fetchPointData(latitude, longitude);
        this.currentWeatherDiv.innerHTML = await WeatherDataUtil.setCurrentWeather(pointData);
        await this.setWeatherAlerts(pointData);
        await this.setForecastDataAndChart(pointData);
    }
    async setForecastDataAndChart(pointData) {
        const locationName = WeatherDataUtil.getLocationName(pointData);
        const endpoint = new Request(WeatherDataUtil.getForecastEndpoint(pointData));
        console.log(`Displaying weather for ${locationName}: ${endpoint.url}!`);
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`${response.status}: Forecast Data Not Found`);
        }
        const data = await response.json();
        const index = 0;
        const fd = data.properties.periods[index];
        const rain = fd.probabilityOfPrecipitation.value;
        this.nearForecastDiv.innerHTML = (`
        <div style="font-size:1rem;">${fd.name}</div>
        <img src="${fd.icon}" alt="icon" title="${fd.name}: ${fd.detailedForecast}">
        <div style="font-size:0.75rem;">Temperature: ${fd.temperature}&deg;F</div>
        <div style="font-size:0.75rem;">Wind: ${fd.windSpeed} ${fd.windDirection}</div>
        <div style="font-size:0.75rem;">Chance of Rain: ${rain == null ? "0" : rain}%</div>
        `);
        this.setFutureForecast(data);
        super.createChart(data, locationName);
    }
    setFutureForecast(forecastData) {
        const fd = forecastData.properties.periods;
        for (let i = 1; i < fd.length - 1; i++) {
            const isDaytime = fd[i].isDaytime;
            if (!isDaytime) {
                continue;
            }
            else {
                const forecastDays = document.createElement("div");
                forecastDays.classList.add("forecastDay");
                forecastDays.setAttribute("title", `${fd[i].name}: ${fd[i].detailedForecast}`);
                const rain = fd[i].probabilityOfPrecipitation?.value || "0";
                forecastDays.innerHTML = (`
                <span style="color:lightgreen">${fd[i].name.substring(0, 3)}:</span> ${rain}%<br>
                <span style="color:lightcoral">${fd[i].temperature}&deg;F</span><br>
                <span style="color:lightblue">${fd[i + 1].temperature}&deg;F</span><br>
                <img src="${fd[i].icon}" alt="icon" height="auto" width="70%" loading="lazy">
                `);
                this.futureForecastDiv.appendChild(forecastDays);
            }
        }
    }
    async setWeatherAlerts(pointData) {
        const alertsCoords = pointData.properties.relativeLocation.geometry.coordinates;
        const point = `${alertsCoords[1].toFixed(4)},${alertsCoords[0].toFixed(4)}`;
        const url = new URL(`https://api.weather.gov/alerts/active?point=${point}`);
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
        const request = new Request(url, { headers: headers });
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status}: Alert Data Not Found`);
        }
        const alerts = await response.json();
        const features = alerts.features;
        if (features.length == 0) {
            console.log("There are currently no active alerts for this location.");
        }
        else {
            for (let index = 0; index < features.length; index++) {
                const weatherAlerts = document.createElement("div")
                const alrt = features[index].properties
                weatherAlerts.setAttribute("title", `${alrt.description}\n${alrt.instruction}`)
                weatherAlerts.innerHTML = (`
                <div>${alrt.event}:${alrt.headline}</div>
                `)
                this.alertDiv.appendChild(weatherAlerts)
                console.group(alrt.event);
                console.groupCollapsed(alrt.headline);
                console.dir(alrt.description);
                console.dir(alrt.instruction);
                console.groupEnd();
                console.groupEnd();
            }
        }
    }
}
/***************************************************************************************************/
document.addEventListener('DOMContentLoaded', () => {displayForecast()});
/***************************************************************************************************/
const locationSelectorDiv = document.getElementById('selectLocation');
locationSelectorDiv.addEventListener("change", (event) => {
    const weatherLocation = event.target.value;
    switch (weatherLocation) {
        case 'geolocation':
            setHeadingLink('National Weather Service API', 'https://www.weather.gov');
            displayForecast(true);
            break;
        case 'fixedlocation':
            setHeadingLink('National Weather Service API', 'https://www.weather.gov');
            displayForecast(false);
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
async function displayForecast(useGeoLocation) {
    if (useGeoLocation) {
        const success = async (position) => {
            const coords = position.coords;
            await setForecast(coords.latitude, coords.longitude);
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
    else {
        const JEHS = { latitude: '26.3086', longitude: '-98.103' };
        await setForecast(JEHS.latitude, JEHS.longitude);
    }
}
async function setForecast(latitude, longitude) {
    const forecastDisplayDiv = document.getElementById("displayDiv");
    forecastDisplayDiv.innerHTML = (`
    <div id="forecastDiv">
        <section id='forecastLeftSection'></section>
        <section id='forecastRightSection'></section>
    </div>
    <div id="alertDiv"></div>
    <div id="futureForecastDiv"></div>
    <div><canvas id="forecastChart"></canvas></div>
    `);
    const nearId = 'forecastLeftSection';
    const currentId = 'forecastRightSection';
    const alertId = 'alertDiv'
    const futureId = 'futureForecastDiv';
    const canvasId = 'forecastChart';
    const forecast = new WeatherForecast(nearId, currentId, alertId, futureId, canvasId);
    try {
        await forecast.displayForecast(latitude, longitude);
        statusDiv.setStatus(null);
    }
    catch (error) {
        statusDiv.setStatus(error);
    }
}
/***************************************************************************************************/
async function displayCat() {
    const API_KEY = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const CAT_URL = 'https://api.thecatapi.com/v1/images/search?limit=1';
    try {
        const response = await fetch(CAT_URL, { headers: { 'x-api-key': API_KEY } });
        if (!response.ok) {
            throw new Error(`${response.status} Cat Image Not Found.`);
        }
        const data = await response.json();
        const catDisplay = document.getElementById("displayDiv");
        catDisplay.innerHTML = (`
        <img src="${data[0].url}" alt="cat" height="300" width="auto"><br>
        <button type="button" onclick="displayCat()">New Cat</button><br>
        `);
        statusDiv.setStatus(null);
    }
    catch (error) {statusDiv.setStatus(error)}
}