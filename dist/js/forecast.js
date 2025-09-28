"use strict";
class WeatherChartJS {
    line = {
        Blue: '#36A2EB',
        Red: '#FF6384',
        Orange: '#FF9F40',
        Yellow: '#FFCD56',
        Green: '#4BC0C0',
        Purple: '#9966FF',
        Grey: '#C9CBCE',
    };
    chartDIV;
    ctx;
    constructor(chartID, canvasID) {
        this.chartDIV = document.getElementById(chartID);
        this.chartDIV.innerHTML = `<div><canvas id='${canvasID}'></canvas></div>`;
        this.ctx = document.getElementById(canvasID);
    }
    set7DayChart(forecastData, locationName) {
        const { Chart } = window;
        Chart.defaults.color = '#ccc';
        this.ctx.style.backgroundColor = '#333';
        const data = this.set7DayData(forecastData);
        const options = this.set7DayOptions(locationName);
        const config = { type: 'line', data: data, options: options };
        const temperatureChart = new Chart(this.ctx, config);
        this.setChartWidth(temperatureChart);
        window.addEventListener('resize', () => {
            this.setChartWidth(temperatureChart);
        });
    }
    set7DayData(forecastData) {
        const Daytime = forecastData.filter(pd => pd.isDaytime);
        const NightTime = forecastData.filter(pd => !pd.isDaytime);
        const highDataSet = {
            type: 'line',
            label: 'Highs',
            borderColor: this.line.Red,
            pointRadius: 3,
            data: Daytime.map(period => period.temperature),
        };
        const lowDataSet = {
            type: 'line',
            label: 'Lows',
            borderColor: this.line.Blue,
            pointRadius: 3,
            data: NightTime.map(period => period.temperature),
        };
        const roomDataSet = {
            type: 'line',
            label: '72\u00B0F',
            borderColor: this.line.Green,
            pointRadius: 0,
            data: Array(Daytime.length).fill(72),
            borderDash: [5, 5],
        };
        const rainDataSet = {
            type: 'bar',
            label: 'Rain',
            backgroundColor: this.line.Purple,
            barThickness: 15,
            data: Daytime.map(period => period.probabilityOfPrecipitation.value),
            yAxisID: 'y2',
        };
        const datasets = [highDataSet, lowDataSet, roomDataSet, rainDataSet];
        return { labels: Daytime.map(period => period.name), datasets: datasets };
    }
    set7DayOptions(location) {
        const name = 'Weather Forecast';
        const title = { display: true, text: name, color: '#aaa', font: { size: 18 } };
        const subtitle = { display: true, text: location, color: '#aaa', font: { size: 16 } };
        const plugins = { title: title, subtitle: subtitle };
        const grid = { display: true, color: '#333' };
        const scaleX = { title: { display: true, text: 'Day of the Week' }, grid: grid };
        const scaleY = {
            title: { display: true, text: 'Temperature (\u00B0F)' },
            grid: grid,
            position: 'left',
        };
        const scaleY2 = {
            title: { display: true, text: 'Percent (%)' },
            grid: grid,
            position: 'right',
            beginAtZero: true,
            suggestedMax: 100,
        };
        const options = { plugins: plugins, scales: { x: scaleX, y: scaleY, y2: scaleY2 } };
        return options;
    }
    setChartWidth(weatherChart) {
        const chartStyle = weatherChart.canvas.parentNode.style;
        chartStyle.margin = 'auto';
        const screenWidth = window.innerWidth;
        weatherChart.resize(screenWidth, 'auto');
        chartStyle.width = '100%';
    }
    set24HrChart(data) {
        const { Chart } = window;
        Chart.defaults.color = '#ccc';
        if (this.ctx) {
            this.ctx.style.backgroundColor = '#333';
        }
        const chartData = this.set24HrData(data);
        const name = '24 Hour Forecast';
        const title = { display: true, text: name, color: '#aaa', font: { size: 16 } };
        const grid = { display: true, color: '#333' };
        const titleX = { display: true, text: 'Time' };
        const scaleX = { title: titleX, grid: grid };
        const titleY = { display: true, text: 'Temperature (\u00B0F)' };
        const scaleY = { title: titleY, grid: grid, position: 'left' };
        const titleY2 = { display: true, text: 'Percent (%)' };
        const scaleY2 = {
            title: titleY2,
            grid: grid,
            position: 'right',
            beginAtZero: true,
            max: 100,
        };
        const options = { plugins: { title: title }, scales: { x: scaleX, y: scaleY, y2: scaleY2 } };
        const config = { type: 'line', data: chartData, options: options };
        const weatherForecastChart = new Chart(this.ctx, config);
        this.setChartWidth(weatherForecastChart);
        window.addEventListener('resize', () => {
            this.setChartWidth(weatherForecastChart);
        });
    }
    set24HrData(data) {
        const temp = {
            label: 'Temperature',
            data: data.temp,
            borderColor: this.line.Orange,
            pointRadius: 3,
        };
        const room = {
            label: '72°F',
            data: data.room,
            borderColor: this.line.Green,
            pointRadius: 0,
            borderDash: [5, 5],
        };
        const rain = {
            label: 'Rain',
            data: data.rain,
            borderColor: this.line.Blue,
            pointRadius: 3,
            yAxisID: 'y2',
        };
        const hum = {
            label: 'Humidity',
            data: data.hum,
            borderColor: this.line.Purple,
            pointRadius: 3,
        };
        return { labels: data.time, datasets: [temp, room, rain, hum] };
    }
}
const NWS = new NationalWeatherServiceAPI();
class LinkUtility {
    linkElement;
    constructor(linkID) {
        const element = document.getElementById(linkID);
        if (!element) {
            throw new Error('Link Element Not Found');
        }
        if (element.tagName !== 'A') {
            throw new Error(`Not A Link Element`);
        }
        this.linkElement = element;
    }
    setLink(title, href) {
        this.linkElement.href = href;
        this.linkElement.rel = 'noopener noreferrer';
        this.linkElement.textContent = title;
    }
}
class NationalWeatherServiceDataDisplay extends LinkUtility {
    displayDIV;
    currentWeather;
    nextForecast;
    weatherAlerts;
    weekForecast;
    forecastChart;
    twentyfourhourChart;
    constructor(displayId, linkId) {
        super(linkId);
        super.setLink(NWS.LINK.title, NWS.LINK.target);
        this.displayDIV = document.getElementById(displayId);
        const TEMPLATE = `
        <div id="currentDiv"><div id='currentId'></div><div id='nextId'></div></div>
        <div id="alertsId"></div>\n<div id="weekId">\n</div><div id="chartId"></div>
        <div id="hourId"></div>
        `;
        this.displayDIV.innerHTML = TEMPLATE;
        this.currentWeather = document.getElementById('currentId');
        this.nextForecast = document.getElementById('nextId');
        this.weatherAlerts = document.getElementById('alertsId');
        this.weekForecast = document.getElementById('weekId');
        this.forecastChart = new WeatherChartJS('chartId', 'chartCTX');
        this.twentyfourhourChart = new WeatherChartJS('hourId', 'hourCTX');
    }
    async setDisplay(useGeoLocation) {
        let coords = { latitude: 26.3085, longitude: -98.1016 };
        if (useGeoLocation) {
            coords = (await NWS.getCoords()) || coords;
        }
        const pointsData = (await NWS.fetchPoints(coords.latitude, coords.longitude));
        console.log(`Displaying ${pointsData.location}: ${pointsData.endpoints.forecast}!`);
        await this.setCurrentWeather(pointsData.endpoints.current, pointsData.location);
        await this.setForecastAndChart(pointsData.endpoints.forecast, pointsData.location);
        await this.setActiveAlerts(pointsData.point, true);
    }
    async setCurrentWeather(endpoint, locationName) {
        const current = (await NWS.fetchCurrentWeather(endpoint));
        const fragment = new DocumentFragment();
        fragment.appendChild(createLine(current.date, 1.1));
        fragment.appendChild(createLine(locationName, 1.4));
        fragment.appendChild(createLine(current.temperature, 3.2));
        fragment.appendChild(createLine(current.wind, 1.3));
        fragment.appendChild(createLine(current.forecast, 1));
        fragment.appendChild(createLine(current.humidity, 1));
        this.currentWeather.appendChild(fragment);
        this.twentyfourhourChart.set24HrChart(current.chart);
        function createLine(content, size) {
            const div = document.createElement('div');
            div.style.fontSize = `${size}rem`;
            div.innerHTML = content;
            return div;
        }
    }
    async setForecastAndChart(endpoint, locationName) {
        const data = (await NWS.fetchForecastWeather(endpoint));
        this.nextForecast.innerHTML = `
        <div style="font-size:1.2rem;">${data.name[0]}</div>
        <img src="${data.icon[0]}" alt="icon" title="${data.forecast[0]}">
        <div style="font-size:0.8rem;">Temperature: ${data.temperature[0]}&deg;F</div>
        <div style="font-size:0.8rem;">Wind: ${data.wind[0]}</div>
        <div style="font-size:0.8rem;">${data.rain[0]}% Chance Rain</div>
        `;
        const fragment = document.createDocumentFragment();
        for (let i = 1; i < data.name.length - 1; i++) {
            const isDaytime = data.isDaytime[i];
            if (!isDaytime) {
                continue;
            }
            else {
                const forecastDay = document.createElement('div');
                forecastDay.classList.add('dayId');
                forecastDay.setAttribute('title', `${data.name[i]}: ${data.forecast[i]}`);
                forecastDay.innerHTML = `
                    <span class="day">${data.name[i].substring(0, 3)}:</span> ${data.rain[i]}%<br>
                    <span class="hi">${data.temperature[i]}&deg;F</span><br>
                    <span class="lo">${data.temperature[i + 1]}&deg;F</span><br>
                    <img src="${data.icon[i]}" alt="icon" height="auto" width="75%">
                `;
                fragment.appendChild(forecastDay);
            }
        }
        this.weekForecast.appendChild(fragment);
        this.forecastChart.set7DayChart(data.chart, locationName);
    }
    async setActiveAlerts(point, logAlerts) {
        const alertData = (await NWS.fetchAlerts(point));
        if (alertData.features.length === 0) {
            console.log(`No active alerts found.`);
        }
        for (const feature of alertData.features) {
            const alertProps = feature.properties;
            const alertTitle = `${alertProps.messageType}: ${alertProps.event} - ${alertProps.severity}`;
            const information = `${alertProps.description}\n${alertProps.instruction || ''}`;
            const alertMessage = `${alertProps.headline}\n${information}`;
            if (alertProps.status === 'Actual') {
                const weatherAlert = document.createElement('div');
                weatherAlert.setAttribute('title', alertProps.headline);
                weatherAlert.style.padding = '5px';
                weatherAlert.innerHTML = alertTitle;
                weatherAlert.onclick = () => {
                    alert(alertMessage);
                };
                this.weatherAlerts.appendChild(weatherAlert);
            }
            if (logAlerts) {
                console.group(alertTitle);
                console.log(`Status: ${alertProps.status}`);
                console.groupCollapsed(alertProps.headline);
                console.info(information);
                console.log(`Urgency: ${alertProps.urgency} / Certainty: ${alertProps.certainty}`);
                console.groupEnd();
                console.groupEnd();
            }
        }
    }
}
class StatusUtility {
    statusDIV;
    constructor(statusDivElement) {
        const element = document.getElementById(statusDivElement);
        if (!element) {
            throw new Error(`Status Div Element Not Found`);
        }
        this.statusDIV = element;
    }
    setStatus(status) {
        this.statusDIV.textContent = status;
    }
    clearStatus() {
        this.setStatus(null);
    }
    setError(message) {
        this.statusDIV.innerHTML = `<span style="color:palevioletred">${message}</span>`;
    }
    setLoading(message) {
        this.statusDIV.innerHTML = `${message}...<span class="spinner"></span>`;
    }
    setCloudLoading(message) {
        this.statusDIV.innerHTML = `${message}...<span class="cloudLoader"></span>`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    displayWeather();
});
const apiSELECT = document.getElementById('apiSelect');
apiSELECT.addEventListener('change', async (event) => {
    const statusDIV = new StatusUtility('statusDiv');
    const weatherLocation = event.target.value;
    try {
        switch (weatherLocation) {
            case 'showDefault':
                statusDIV.setCloudLoading('Locating');
                await displayWeather(false);
                statusDIV.clearStatus();
                break;
            case 'showForecast':
                statusDIV.setCloudLoading('Locating');
                await displayWeather(true);
                statusDIV.clearStatus();
                break;
            case 'showCat':
                statusDIV.setLoading('Meowing');
                await displayCat();
                statusDIV.clearStatus();
                break;
            case 'showCatSlider':
                statusDIV.setLoading('Meowing');
                await displayCatSlider();
                statusDIV.clearStatus();
                break;
            default:
                break;
        }
    }
    catch (error) {
        await displayWeather(false);
        statusDIV.setError(error);
    }
});
async function displayWeather(useGeoLocation) {
    const forecast = new NationalWeatherServiceDataDisplay('displayDiv', 'apiLink');
    await forecast.setDisplay(useGeoLocation);
}
const CAT = new TheCatAPI();
class CatDisplay extends LinkUtility {
    displayDIV;
    constructor(displayId, linkId) {
        super(linkId);
        super.setLink(CAT.LINK.title, CAT.LINK.target);
        this.displayDIV = document.getElementById(displayId);
    }
    async displayCat() {
        const image = await CAT.getCatImageData(1);
        this.displayDIV.innerHTML = `<img src="${image[0].url}" height="auto" width="100%">`;
        const button = document.createElement('button');
        button.textContent = 'New Cat';
        button.setAttribute("class", "button-warning");
        button.onclick = async () => {
            await this.displayCat();
        };
        this.displayDIV.appendChild(button);
    }
    async displayCatSlider() {
        const image = await CAT.getCatImageData(5);
        this.displayDIV.innerHTML = `
      <style>.catImg {height: 350px; width= auto;}</style>
      <div class="glide">
        <div class="glide__track" data-glide-el="track">
          <ul class="glide__slides">
            <li class="glide__slide"><img src="${image[0].url}" class="catImg"></li>
            <li class="glide__slide"><img src="${image[1].url}" class="catImg"></li>
            <li class="glide__slide"><img src="${image[2].url}" class="catImg"></li>
            <li class="glide__slide"><img src="${image[3].url}" class="catImg"></li>
            <li class="glide__slide"><img src="${image[4].url}" class="catImg"></li>
          </ul>
        </div>
        <div class="glide__arrows" data-glide-el="controls">
          <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
          <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
        </div>
      </div>
      `;
        const options = { autoplay: 3000, hoverpause: false };
        const { Glide } = window;
        new Glide('.glide', options).mount();
    }
}
async function displayCat() {
    const catDisplay = new CatDisplay('displayDiv', 'apiLink');
    await catDisplay.displayCat();
}
async function displayCatSlider() {
    const catDisplay = new CatDisplay('displayDiv', 'apiLink');
    await catDisplay.displayCatSlider();
}
