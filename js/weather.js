"use strict";
class Weather {
    static async getCoordinates() {
        const options = { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 };
        return new Promise((resolve, reject) => {
            const success = (position) => {
                resolve(position.coords);
            };
            const error = (error) => {
                reject(new Error(error.message));
            };
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by the browser.'));
            }
            else {
                navigator.geolocation.getCurrentPosition(success, error, options);
            }
        });
    }
    static async fetchData(endpoint) {
        const url = new URL(endpoint);
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' });
        const request = new Request(url, { headers: headers });
        const response = await fetch(request);
        if (!response.ok)
            throw new Error(`${response.status} Data Not Found: ${response.url}`);
        return response.json();
    }
    static formatDate(dateTime) {
        const date = new Date(dateTime);
        const locales = navigator.language;
        const options = { dateStyle: 'full' };
        return new Intl.DateTimeFormat(locales, options).format(date);
    }
    static formatTime(dateTime) {
        const date = new Date(dateTime);
        const locales = navigator.language;
        const options = { timeStyle: 'short' };
        return new Intl.DateTimeFormat(locales, options).format(date);
    }
}
class NationalWeatherServiceAPI {
    LINK = {
        title: 'National Weather Service API',
        target: 'https://www.weather.gov',
    };
    BASE_URL = 'https://api.weather.gov';
    constructor() { }
    async getCoords() {
        const coords = await Weather.getCoordinates();
        return { latitude: coords.latitude, longitude: coords.longitude };
    }
    async fetchData(url) {
        return await Weather.fetchData(url);
    }
    async fetchPoints(lat, long, log) {
        const data = (await this.fetchData(`${this.BASE_URL}/points/${lat},${long}`));
        if (log) {
            console.log('Points: ', data.id);
        }
        const props = data.properties;
        const endpoints = { current: props.forecastHourly, forecast: props.forecast };
        const locationData = props.relativeLocation.properties;
        const name = `${locationData.city}, ${locationData.state}`;
        const coordinates = props.relativeLocation.geometry.coordinates;
        const point = `${coordinates[1].toFixed(4)},${coordinates[0].toFixed(4)}`;
        return { endpoints: endpoints, location: name, point: point };
    }
    async fetchCurrentWeather(endpoint) {
        const data = (await this.fetchData(endpoint));
        const current = data.properties.periods[0];
        const chart = data.properties.periods.slice(1, 25);
        const temperature = chart.map((period) => period.temperature);
        return {
            date: Weather.formatDate(current.startTime),
            temperature: `${current.temperature}°${current.temperatureUnit}`,
            wind: `${current.windSpeed} ${current.windDirection}`,
            forecast: current.shortForecast,
            humidity: `${current.relativeHumidity.value}% RH`,
            icon: current.icon,
            chart: {
                temp: temperature,
                room: Array(temperature.length).fill(72),
                min: Math.min(...temperature, 72) - 5,
                max: Math.max(...temperature, 72) + 5,
                rain: chart.map((period) => period.probabilityOfPrecipitation.value),
                time: chart.map((period) => Weather.formatTime(period.endTime)),
                hum: chart.map((period) => period.relativeHumidity.value | 0),
            },
        };
    }
    async fetchForecastWeather(endpoint) {
        const data = (await this.fetchData(endpoint));
        const forecast = data.properties.periods;
        return {
            isDaytime: forecast.map((period) => period.isDaytime),
            name: forecast.map((period) => period.name),
            temperature: forecast.map((period) => period.temperature),
            wind: forecast.map((period) => `${period.windSpeed} ${period.windDirection}`),
            forecast: forecast.map((period) => period.detailedForecast),
            rain: forecast.map((period) => period.probabilityOfPrecipitation.value | 0),
            icon: forecast.map((period) => period.icon),
            chart: forecast,
        };
    }
    async fetchAlerts(point) {
        return this.fetchData(`${this.BASE_URL}/alerts/active?point=${point}`);
    }
}
class StatusUtility {
    statusDIV;
    constructor(statusDivElement) {
        const element = document.getElementById(statusDivElement);
        if (!element)
            throw new Error(`Status Div Element Not Found`);
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
}
class WeatherApexCharts {
    line = {
        Blue: '#008FFB',
        Green: '#00E396',
        Orange: '#FEB019',
        Red: '#FF4560',
        Purple: '#775DD0',
    };
    chartDIV;
    constructor(chartID) {
        this.chartDIV = document.getElementById(chartID);
    }
    set7DayChart(forecastData, locationName) {
        const options = this.set7DayOptions(forecastData, locationName);
        const { ApexCharts } = window;
        const chart = new ApexCharts(this.chartDIV, options);
        chart.render();
    }
    set7DayOptions(data, locationName) {
        const Daytime = data.filter((data) => data.isDaytime);
        const Nighttime = data.filter((data) => !data.isDaytime);
        const highTemp = Daytime.map((data) => data.temperature);
        const lowTemp = Nighttime.map((data) => data.temperature);
        const roomTemp = Array(highTemp.length).fill(72);
        const rain = Daytime.map((data) => data.probabilityOfPrecipitation.value);
        const days = Daytime.map((data) => data.name);
        const highSeries = { name: 'Highs', type: 'line', data: highTemp };
        const lowSeries = { name: 'Lows', type: 'line', data: lowTemp };
        const roomSeries = { name: 'Room', type: 'line', data: roomTemp };
        const rainSeries = { name: 'Rain', type: 'column', data: rain };
        const maxTemp = Math.max(...highTemp) + 5;
        const minTemp = Math.min(...lowTemp, 72) - 5;
        const yTemp = { title: { text: 'Temperature (\u00B0F)' }, min: minTemp, max: maxTemp };
        const yRain = { opposite: true, title: { text: 'Percent (%)' }, min: 0, max: 100 };
        const toolbar = { show: true, tools: { download: false } };
        const rotate = { rotate: -30, rotateAlways: true };
        return {
            series: [rainSeries, roomSeries, highSeries, lowSeries],
            chart: { height: 290, type: 'line', foreColor: '#ccc', toolbar: toolbar },
            colors: [this.line.Purple, this.line.Green, this.line.Red, this.line.Blue],
            dataLabels: { enabled: true, enabledOnSeries: [2, 3] },
            stroke: { curve: 'smooth' },
            title: { text: `Weather Forecast: ${locationName}`, align: 'left' },
            grid: { borderColor: '#555' },
            legend: { floating: true, inverseOrder: true },
            xaxis: { categories: days, tickPlacement: 'on', labels: rotate },
            yaxis: [yRain, yTemp],
            tooltip: { enabled: false },
        };
    }
    set24HrChart(data) {
        const roomSeries = { name: 'Room', data: data.room };
        const tempSeries = { name: 'Temperature', data: data.temp };
        const rainSeries = { name: 'Rain', data: data.rain };
        const humiditySeries = { name: 'Humidity', data: data.hum };
        const yRoom = { show: false, min: data.min, max: data.max };
        const yTemp = { title: { text: 'Temperature (\u00B0F)' }, min: data.min, max: data.max };
        const yPercent = { opposite: true, title: { text: 'Percent (%)' }, min: 0, max: 100 };
        const toolbar = { show: true, tools: { download: false } };
        const rotate = { rotate: -30, rotateAlways: true };
        const fixed = { enabled: true, position: 'topRight', offsetX: 0, offsetY: 0 };
        const options = {
            series: [roomSeries, tempSeries, rainSeries, humiditySeries],
            colors: [this.line.Green, this.line.Orange, this.line.Blue, this.line.Purple],
            chart: { height: 290, type: 'line', foreColor: '#ccc', toolbar: toolbar },
            title: { text: `24 Hour Forecast`, align: 'left' },
            grid: { borderColor: '#777' },
            tooltip: { enabled: true, fillSeriesColor: true, x: { show: false }, fixed: fixed },
            legend: { floating: true },
            stroke: { curve: 'smooth' },
            xaxis: { categories: data.time, tickPlacement: 'on', labels: rotate },
            yaxis: [yRoom, yTemp, yPercent],
        };
        const { ApexCharts } = window;
        const chart = new ApexCharts(this.chartDIV, options);
        chart.render();
    }
}
class Cat_Display {
    static CAT_API = {
        BASE_URL: 'https://api.thecatapi.com/v1',
        KEY: 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh',
    };
    static async fetchCatBreeds() {
        const request = new Request(`${this.CAT_API.BASE_URL}/breeds`);
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status} Breed Options Not Found!`);
        }
        return await response.json();
    }
    static getCatBreedOptions(breeds) {
        const fragment = new DocumentFragment();
        for (const breed of breeds) {
            const option = document.createElement('option');
            option.value = breed.id;
            option.textContent = breed.name;
            fragment.append(option);
        }
        return fragment;
    }
    static async fetchCatImageData(limit, breedId) {
        const url = new URL(`${this.CAT_API.BASE_URL}/images/search`);
        url.searchParams.set('limit', String(limit));
        if (breedId) {
            url.searchParams.append('breed_id', breedId);
        }
        const response = await fetch(url, { headers: { 'x-api-key': this.CAT_API.KEY } });
        if (!response.ok) {
            throw new Error(`${response.status} Images Not Found`);
        }
        return await response.json();
    }
}
class TheCatAPI_Weather {
    LINK = { title: 'The Cat API', target: 'https://www.thecatapi.com' };
    constructor() { }
    async getCatBreeds() {
        return await Cat_Display.fetchCatBreeds();
    }
    setCatBreedOptions(optGroup, breeds) {
        const options = Cat_Display.getCatBreedOptions(breeds);
        optGroup.appendChild(options);
    }
    async getCatImageData(limit, breedId) {
        return Cat_Display.fetchCatImageData(limit, breedId);
    }
}
//# sourceMappingURL=weather.js.map