class StatusUtil {
    statusDIV;
    constructor(statusDivElement) {
        this.statusDIV = document.getElementById(statusDivElement);
    }
    setStatus(message) {
        this.statusDIV.textContent = message;
    }
    clearStatus() {
        this.statusDIV.textContent = null;
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
        const Daytime = forecastData.properties.periods.filter((pd) => pd.isDaytime);
        const lowData = forecastData.properties.periods.filter((pd) => !pd.isDaytime);
        const highTemp = Daytime.map((period) => period.temperature);
        const lowTemp = lowData.map((period) => period.temperature);
        const roomTemp = Array(highTemp.length).fill(72);
        const rainData = Daytime.map((period) => period.probabilityOfPrecipitation.value);



        //const highDataSet = { label: "Highs", data: highTemp, borderColor: "red", pointRadius: 3 };
        //const lowDataSet = { label: "Lows", data: lowTemp, borderColor: "blue", pointRadius: 3 };
        //const roomDataSet = { label: "72\u00B0F", data: roomTemp, borderColor: "green", pointRadius: 0 };
        

        
        const highDataSet = { type: 'line', label: 'Highs', data: highTemp, borderColor: '#e36e85', pointRadius: 3 };
        const lowDataSet = { type: 'line', label: 'Lows', data: lowTemp, borderColor: '#67a0e3', pointRadius: 3 };
        const roomDataSet = { type: 'line', label: '72\u00B0F', data: roomTemp, borderColor: '#7abebf', pointRadius: 0, borderDash: [5, 5] };
        const rainDataSet = { type: 'bar', label: 'Rain', data: rainData, backgroundColor: '#9966FF77', barThickness: 15, yAxisID: 'y2' };





        const labels = Daytime.map((period) => period.name);
        const datasets = [highDataSet, lowDataSet, roomDataSet, rainDataSet];
        const data = { labels: labels, datasets: datasets };
        return data;
    }
    setOptions(location) {
        const name = 'Weather Forecast';
        const title = { display: true, text: name, color: 'gray', font: { size: 18 } };
        const subtitle = { display: true, text: location, color: 'gray', font: { size: 16 } };
        const plugins = { title: title, subtitle: subtitle };
        const grid = { display: true, color: '#333' };
        const scaleX = { title: { display: true, text: 'Day of the Week' }, grid: grid };
        const scaleY = { title: { display: true, text: 'Temperature (\u00B0F)' }, grid: grid, position: 'left' };
        const scaleY2 = { title: { display: true, text: 'Precipitation (%)' }, grid: grid, position: 'right', beginAtZero: true, suggestedMax: 100 };
        const options = { plugins: plugins, scales: { x: scaleX, y: scaleY, y2: scaleY2 } };
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
    async fetchPointData(latitude, longitude) {
        const url = new URL(`https://api.weather.gov/points/${latitude},${longitude}`);
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
        const request = new Request(url, { headers: headers });
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status}: Weather Data Not Found`);
        }
        return await response.json();
    }
    async displayForecast(latitude, longitude) {
        console.log(`Points URL: https://api.weather.gov/points/${latitude},${longitude}`);
        const pointData = await this.fetchPointData(latitude, longitude);
        const locationData = pointData.properties.relativeLocation.properties;
        const locationName = (`${locationData.city}, ${locationData.state}`);
        await this.setCurrentWeather(pointData, locationName)
        await this.setWeatherAlerts(pointData, locationName);
        await this.setForecastDataAndChart(pointData, locationName);
    }
    setDate(dateTime) {
        const date = new Date(dateTime);
        const options = { dateStyle: 'full' };
        return date.toLocaleDateString(navigator.language,options);
    }
    async setCurrentWeather(pointData, locationName) {
        const url = new URL(pointData.properties.forecastHourly);
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
        const request = new Request(url, { headers: headers });
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status}: Weather Data Not Found`);
        }
        const data = await response.json();
        const wd = data.properties.periods[0];
        this.currentWeatherDiv.innerHTML =  (`
        <div style="font-size:1rem;">${this.setDate(wd.startTime)}</div>
        <div style="font-size:1.5rem;">${locationName}</div>
        <div style="font-size:2.5rem;">${wd.temperature}&deg;F</div>
        <div style="font-size:1rem;">${wd.windSpeed} ${wd.windDirection}</div>
        <div style="font-size:1rem;">${wd.shortForecast}</div>
        `);
    }
    async setWeatherAlerts(pointData, locationName) {
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
            console.log(`There are currently no active alerts for ${locationName}.`);
        }
        for (let index = 0; index < features.length; index++) {
            const alrt = features[index].properties
            if (alrt.status == "Actual") {
                const weatherAlerts = document.createElement("div")
                const alertMessage = (`${alrt.headline}\n\n${alrt.description}\n${alrt.instruction}`)
                weatherAlerts.setAttribute("title", `${alrt.headline}`)
                weatherAlerts.style.padding = "5px"
                weatherAlerts.innerHTML = (`<div>${alrt.event}: ${alrt.severity}</div>`)
                weatherAlerts.onclick = () => {alert(alertMessage)}
                this.alertDiv.appendChild(weatherAlerts)
            }
        }
    }
    async setForecastDataAndChart(pointData, locationName) {
        const endpoint = new Request(new URL(pointData.properties.forecast));
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
}
/***************************************************************************************************/
document.addEventListener('DOMContentLoaded', () => {displayForecast()});
/***************************************************************************************************/
const locationSelector = document.getElementById('selectLocation');
locationSelector.addEventListener("change", (event) => {
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
    const forecastDisplayDiv = document.getElementById("displayDiv");
    forecastDisplayDiv.innerHTML = (`
        <div id="forecastDiv">
            <section id='nearId'></section>
            <section id='currentId'></section>
        </div>
        <div id="alertDiv"></div>
        <div id="futureDiv"></div>
        <div><canvas id="canvasId"></canvas></div>
    `);
    const forecast = new WeatherForecast('nearId', 'currentId', 'alertDiv', 'futureDiv', 'canvasId');
    try {
        statusDiv.setStatus('Locating...');
        if (useGeoLocation) {
            const success = async (position) => {
                await forecast.displayForecast(position.coords.latitude, position.coords.longitude);
                statusDiv.clearStatus();
            }
            const error = (error) => { statusDiv.setStatus(error.message); };
            if (!navigator.geolocation) {
                statusDiv.setStatus('Geolocation is not supported by the browser.');
            }
            else {
                navigator.geolocation.getCurrentPosition(success, error);
            }
        }
        else {
            const JEHS = { latitude: '26.3086', longitude: '-98.103' };
            await forecast.displayForecast(JEHS.latitude, JEHS.longitude);
            statusDiv.clearStatus();
        }
    } catch (error) {statusDiv.setStatus(error)}
}
/***************************************************************************************************/
async function displayCat() {
    const CAT = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const CAT_URL = 'https://api.thecatapi.com/v1/images/search?limit=1';
    try {
        statusDiv.setStatus('Loading...');
        const response = await fetch(CAT_URL, { headers: { 'x-api-key': CAT } });
        if (!response.ok) {
            throw new Error(`${response.status} Cat Image Not Found.`);
        }
        const data = await response.json();
        const catDisplay = document.getElementById("displayDiv");
        catDisplay.innerHTML = (`
        <img src="${data[0].url}" alt="cat" height="300" width="auto"><br>
        <button type="button" onclick="displayCat()">New Cat</button><br>
        `);
        statusDiv.clearStatus();
    } catch (error) {statusDiv.setStatus(error)}
}