/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/css/weather.css"
/*!*****************************!*\
  !*** ./src/css/weather.css ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/js/libs/forecastLib.js"
/*!************************************!*\
  !*** ./src/js/libs/forecastLib.js ***!
  \************************************/
(module, __unused_webpack_exports, __webpack_require__) {

const LinkUtility = __webpack_require__(/*! ../utils/link */ "./src/js/utils/link.js")
const { GeoLocationUtility, WeatherUtility, createLine, createIcon } = __webpack_require__(/*! ./weather */ "./src/js/libs/weather.js")

class NationalWeatherServiceAPI {
  LINK = {
    title: 'National Weather Service',
    target: 'https://www.weather.gov',
  }
  API_URL = 'https://api.weather.gov'
  endpoints
  locationName
  point
  constructor() {
    this.endpoints = { forecastHourly: '', forecast: '' }
    this.locationName = ''
    this.point = ''
  }
  async getCoords() {
    const coords = await GeoLocationUtility.getCoordinates()
    return { latitude: coords.latitude, longitude: coords.longitude }
  }
  async fetchData(url) {
    const data = await WeatherUtility.fetchData(url)
    return data
  }
  async fetchPoints(lat, long, log) {
    const data = await this.fetchData(`${this.API_URL}/points/${lat},${long}`)
    if (log) {
      console.log('Points: ', data.id)
    }
    const props = data.properties
    this.endpoints = { forecastHourly: props.forecastHourly, forecast: props.forecast }
    const locationData = props.relativeLocation.properties
    this.locationName = `${locationData.city}, ${locationData.state}`
    const coordinates = props.relativeLocation.geometry.coordinates
    this.point = `${coordinates[1].toFixed(4)},${coordinates[0].toFixed(4)}`
  }
  async fetchCurrentWeather() {
    const data = await this.fetchData(this.endpoints.forecastHourly)
    const current = data.properties.periods[0]
    const chart = data.properties.periods.slice(1, 25)
    const temperature = chart.map(p => p.temperature)
    return {
      location: this.locationName,
      date: WeatherUtility.formatDate(current.startTime),
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
        rain: chart.map(p => p.probabilityOfPrecipitation.value),
        time: chart.map(p => WeatherUtility.formatTime(p.endTime)),
        hum: chart.map(p => p.relativeHumidity.value | 0),
      },
    }
  }
  async fetchForecastWeather() {
    const data = await this.fetchData(this.endpoints.forecast)
    const forecast = data.properties.periods
    return {
      location: this.locationName,
      isDaytime: forecast.map(p => p.isDaytime),
      name: forecast.map(p => p.name),
      temperature: forecast.map(p => p.temperature),
      wind: forecast.map(p => `${p.windSpeed} ${p.windDirection}`),
      forecast: forecast.map(p => p.detailedForecast),
      rain: forecast.map(p => p.probabilityOfPrecipitation.value | 0),
      icon: forecast.map(p => p.icon),
      chart: setsevenDayChartData(forecast),
    }
    function setsevenDayChartData(forecast) {
      const Daytime = forecast.filter(p => p.isDaytime)
      const Nighttime = forecast.filter(p => !p.isDaytime)
      const high = Daytime.map(p => p.temperature)
      const max = Math.max(...high) + 5
      const low = Nighttime.map(p => p.temperature)
      const min = Math.min(...low, 72) - 5
      const room = Array(high.length).fill(72)
      const temp = { high, low, room, max, min }
      const rain = Daytime.map(p => p.probabilityOfPrecipitation.value ?? 0)
      const days = Daytime.map(p => p.name)
      return { temp, rain, days }
    }
  }
  async fetchAlerts() {
    const alertsURI = `${this.API_URL}/alerts/active?point=${this.point}`
    const alerts = await this.fetchData(alertsURI)
    return alerts.features
  }
}

class WeatherChartJS {
  txt = '#ccc'
  bgColor = '#333'
  gridColor = '#555'
  lineColor = {
    Blue: '#36A2EB',
    Red: '#FF6384',
    Orange: '#FF9F40',
    Yellow: '#FFCD56',
    Green: '#4BC0C0',
    Purple: '#9966FF',
    Grey: '#C9CBCE',
  }
  chartDIV
  ctx
  constructor(chartID) {
    this.chartDIV = document.getElementById(chartID)
    const canvasID = `${chartID}CTX`
    this.chartDIV.innerHTML = `<div><canvas id='${canvasID}'></canvas></div>`
    this.ctx = document.getElementById(canvasID)
  }
  displayChart(data, options) {
    const { Chart } = window
    Chart.defaults.color = this.txt
    this.ctx.style.backgroundColor = this.bgColor
    const config = { type: 'line', data, options }
    const temperatureChart = new Chart(this.ctx, config)
    this.setChartWidth(temperatureChart)
    window.addEventListener('resize', () => {
      this.setChartWidth(temperatureChart)
    })
  }
  setChartWidth(weatherChart) {
    const chartStyle = weatherChart.canvas.parentNode.style
    chartStyle.margin = 'auto'
    const screenWidth = window.innerWidth
    weatherChart.resize(screenWidth, 'auto')
    chartStyle.width = '100%'
  }
  set7DayChart(chartData, locationName) {
    const data = this.set7DayData(chartData)
    const options = this.set7DayOptions(locationName)
    this.displayChart(data, options)
  }
  set7DayData(chartData) {
    const highDataSet = {
      type: 'line',
      label: 'Highs',
      borderColor: this.lineColor.Red,
      pointRadius: 3,
      data: chartData.temp.high,
    }
    const lowDataSet = {
      type: 'line',
      label: 'Lows',
      borderColor: this.lineColor.Blue,
      pointRadius: 3,
      data: chartData.temp.low,
    }
    const roomDataSet = {
      type: 'line',
      label: '72\u00B0F',
      borderColor: this.lineColor.Green,
      pointRadius: 0,
      data: Array(chartData.temp.high.length).fill(72),
      borderDash: [5, 5],
    }
    const rainDataSet = {
      type: 'bar',
      label: 'Rain',
      backgroundColor: this.lineColor.Purple,
      barThickness: 15,
      data: chartData.rain,
      yAxisID: 'y2',
    }
    const datasets = [highDataSet, lowDataSet, roomDataSet, rainDataSet]
    return { labels: chartData.days, datasets }
  }
  set7DayOptions(location) {
    const name = 'Weather Forecast'
    const title = { display: true, text: name, color: this.txt, font: { size: 18 } }
    const subtitle = { display: true, text: location, color: this.txt, font: { size: 16 } }
    const plugins = { title, subtitle }
    const grid = { display: true, color: this.gridColor }
    const scaleX = { title: { display: true, text: 'Day of the Week' }, grid }
    const scaleY = {
      title: { display: true, text: 'Temperature (\u00B0F)' },
      grid,
      position: 'left',
    }
    const scaleY2 = {
      title: { display: true, text: 'Percent (%)' },
      grid,
      position: 'right',
      beginAtZero: true,
      suggestedMax: 100,
    }
    const options = { plugins, scales: { x: scaleX, y: scaleY, y2: scaleY2 } }
    return options
  }
  set24HrChart(chartData) {
    const data = this.set24HrData(chartData)
    const options = this.get24HrOptions()
    this.displayChart(data, options)
  }
  get24HrOptions() {
    const name = '24 Hour Forecast'
    const title = { display: true, text: name, color: this.txt, font: { size: 16 } }
    const grid = { display: true, color: this.gridColor }
    const titleX = { display: true, text: 'Time' }
    const scaleX = { title: titleX, grid }
    const titleY = { display: true, text: 'Temperature (\u00B0F)' }
    const scaleY = { title: titleY, grid, position: 'left' }
    const titleY2 = { display: true, text: 'Percent (%)' }
    const scaleY2 = {
      title: titleY2,
      grid,
      position: 'right',
      beginAtZero: true,
      max: 100,
    }
    return { plugins: { title }, scales: { x: scaleX, y: scaleY, y2: scaleY2 } }
  }
  set24HrData(data) {
    const temp = {
      label: 'Temperature',
      data: data.temp,
      borderColor: this.lineColor.Orange,
      pointRadius: 3,
    }
    const room = {
      label: '72°F',
      data: data.room,
      borderColor: this.lineColor.Green,
      pointRadius: 0,
      borderDash: [5, 5],
    }
    const rain = {
      label: 'Rain',
      data: data.rain,
      borderColor: this.lineColor.Blue,
      pointRadius: 3,
      yAxisID: 'y2',
    }
    const hum = {
      label: 'Humidity',
      data: data.hum,
      borderColor: this.lineColor.Purple,
      pointRadius: 3,
    }
    return { labels: data.time, datasets: [temp, room, rain, hum] }
  }
}

const NWS = new NationalWeatherServiceAPI()

class WeatherForecastDataDisplay extends LinkUtility {
  displayDIV
  weatherDivLeft
  weatherDivRight
  weatherAlerts
  weekForecast
  sevenDayChart
  twentyfourhourChart
  FixedCoords = { latitude: 26.3085, longitude: -98.1016 }
  constructor(displayId, linkId) {
    super(linkId)
    super.setLink(NWS.LINK.title, NWS.LINK.target, true)
    this.displayDIV = document.getElementById(displayId)
    const TEMPLATE = `
      <div id="weatherContainer">
          <div id='weatherDivLeft'></div><div id='weatherDivRight'></div>
      </div>
      <div id="alertsId"></div>\n<div id="forecastDiv">\n</div>
      <div id="chartOneDiv"></div><div id="chartTwoDiv"></div>
      `
    this.displayDIV.innerHTML = TEMPLATE
    this.weatherDivLeft = document.getElementById('weatherDivLeft')
    this.weatherDivRight = document.getElementById('weatherDivRight')
    this.weatherAlerts = document.getElementById('alertsId')
    this.weekForecast = document.getElementById('forecastDiv')
    this.sevenDayChart = new WeatherChartJS('chartOneDiv')
    this.twentyfourhourChart = new WeatherChartJS('chartTwoDiv')
  }
  async setDisplay(useGeoLocation) {
    let coords = this.FixedCoords
    if (useGeoLocation) {
      coords = (await NWS.getCoords()) || coords
    }
    await NWS.fetchPoints(coords.latitude, coords.longitude)
    console.log(`Displaying ${NWS.locationName}: ${NWS.endpoints.forecast}!`)
    await this.setCurrentWeather()
    await this.setForecastAndChart()
    await this.setActiveAlerts()
  }
  async setCurrentWeather() {
    const current = await NWS.fetchCurrentWeather()
    const fragment = new DocumentFragment()
    fragment.appendChild(createLine(current.date, 1.1))
    fragment.appendChild(createLine(current.location, 1.4))
    fragment.appendChild(createLine(current.temperature, 3))
    fragment.appendChild(createLine(current.wind, 1.5))
    fragment.appendChild(createLine(current.forecast, 1))
    fragment.appendChild(createLine(current.humidity, 1))
    this.weatherDivLeft.appendChild(fragment)
    this.twentyfourhourChart.set24HrChart(current.chart)
  }
  async setForecastAndChart() {
    const data = await NWS.fetchForecastWeather()
    const fragment = new DocumentFragment()
    fragment.appendChild(createLine(data.name[0], 1.2))
    fragment.appendChild(createIcon(data.icon[0], data.forecast[0]))
    fragment.appendChild(createLine(`${data.temperature[0]}&deg;F`, 0.8))
    fragment.appendChild(createLine(data.wind[0], 0.8))
    fragment.appendChild(createLine(`${data.rain[0]}% Chance Rain`, 0.8))
    this.weatherDivRight.appendChild(fragment)

    const forecastFragment = document.createDocumentFragment()

    for (let i = 1; i < data.name.length; i++) {

    //   const isDaytime = data.isDaytime[i]
    //   if (!isDaytime) {
    //     continue
    //   } else {
    //     const forecastDay = document.createElement('div')
    //     forecastDay.classList.add('day-card')
    //     forecastDay.setAttribute('title', `${data.name[i]}: ${data.forecast[i]}`)
    //     forecastDay.innerHTML = `
    //       <span class="day">${data.name[i].substring(0, 3)}</span>
    //       <span class="rain">${data.rain[i]}%</span>
    //       <img src="${data.icon[i]}" alt="icon" height="auto" width="75%">
    //       <span class="hi">${data.temperature[i]}&deg;F</span>
    //       <span class="lo">${data.temperature[i + 1]}&degF</span>
    //     `

      if (!data.isDaytime[i]) continue
      if (i + 1 >= data.temperature.length) break
      const forecastDay = document.createElement('div')
      forecastDay.classList.add('forecast-day-card')
      forecastDay.setAttribute('title', `${data.name[i]}: ${data.forecast[i]}`)
      forecastDay.innerHTML = `
        <span class="day">${data.name[i].substring(0, 3)}</span>
        <span class="rain">${data.rain[i]}%</span>
        <img src="${data.icon[i]}" alt="icon" width="75%">
        <span class="hi">${data.temperature[i]}&deg;F</span>
        <span class="lo">${data.temperature[i + 1] ?? '--'}&deg;F</span>
      `

      forecastFragment.appendChild(forecastDay)
    }
    this.weekForecast.innerHTML = ''
    this.weekForecast.appendChild(forecastFragment)
    this.sevenDayChart.set7DayChart(data.chart, data.location)
  }
  async setActiveAlerts() {
    const alertData = await NWS.fetchAlerts()
    if (alertData.length === 0) {
      console.log(`No active alerts found.`)
    }
    for (const feature of alertData) {
      const alertTitle = `${feature.messageType}: ${feature.event} / ${feature.severity}`
      const information = `${feature.description}\n${feature.instruction || ''}`
      const alertMessage = `${feature.headline}\n${information}`
      if (feature.status === 'Actual') {
        const weatherAlert = document.createElement('div')
        weatherAlert.setAttribute('title', feature.headline)
        weatherAlert.style.padding = '5px'
        weatherAlert.innerHTML = alertTitle
        weatherAlert.onclick = () => {
          alert(alertMessage)
        }
        this.weatherAlerts.appendChild(weatherAlert)
      }
      this.logActiveAlerts(feature, alertTitle, information)
    }
  }
  logActiveAlerts(feature, alertTitle, information) {
    console.group(alertTitle)
    console.log(`Status: ${feature.status}`)
    console.groupCollapsed(feature.headline)
    console.info(information)
    console.log(`Urgency: ${feature.urgency} / Certainty: ${feature.certainty}`)
    console.groupEnd()
    console.groupEnd()
  }
}

module.exports = WeatherForecastDataDisplay


/***/ },

/***/ "./src/js/libs/weather.js"
/*!********************************!*\
  !*** ./src/js/libs/weather.js ***!
  \********************************/
(module) {

class GeoLocationUtility {
  static async getCoordinates() {
    const options = { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    return new Promise((resolve, reject) => {
      const success = position => {
        resolve(position.coords)
      }
      const error = error => {
        reject(new Error(error.message))
      }
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by the browser.'))
      } else {
        navigator.geolocation.getCurrentPosition(success, error, options)
      }
    })
  }
  static getLocales() {
    if (!navigator.languages) {
      return 'en-US'
    }
    return navigator.languages
  }
}

class WeatherUtility {
  static async fetchData(endpoint) {
    const url = new URL(endpoint)
    const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' })
    const request = new Request(url, { headers })
    const response = await fetch(request)
    if (!response.ok) throw new Error(`${response.status} Data Not Found: ${response.url}`)
    const data = await response.json()
    return data
  }
  static formatDate(dateTime) {
    const date = new Date(dateTime)
    const options = { dateStyle: 'full' }
    return new Intl.DateTimeFormat(GeoLocationUtility.getLocales(), options).format(date)
  }
  static formatTime(dateTime) {
    const date = new Date(dateTime)
    const options = { timeStyle: 'short' }
    return new Intl.DateTimeFormat(GeoLocationUtility.getLocales(), options).format(date)
  }
}

function createLine(content, size) {
  const div = document.createElement('div')
  div.style.fontSize = `${size}rem`
  div.innerHTML = content
  return div
}

function createIcon(src, title) {
  const img = document.createElement('img')
  img.setAttribute('src', src)
  img.setAttribute('title', title)
  img.setAttribute('alt', 'icon')
  return img
}

module.exports = { GeoLocationUtility, WeatherUtility, createLine, createIcon }


/***/ },

/***/ "./src/js/utils/status.js"
/*!********************************!*\
  !*** ./src/js/utils/status.js ***!
  \********************************/
(module) {

class StatusUtility {
  statusDIV
  constructor(statusDivElementId) {
    const element = document.getElementById(statusDivElementId)
    if (!element || !(element instanceof HTMLDivElement)) {
      throw new Error(`Status Div Element Not Found or Not a DIV`)
    }
    this.statusDIV = element
  }
  setStatus(status) {
    this.statusDIV.textContent = status ?? ''
  }
  clearStatus() {
    this.statusDIV.textContent = ''
  }
  setError(message) {
    this.clearStatus()
    const span = document.createElement('span')
    span.textContent = message
    span.style.color = 'palevioletred'
    this.statusDIV.appendChild(span)
  }
  setLoading(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'spinner'
    this.statusDIV.appendChild(textNode)
    this.statusDIV.appendChild(spinner)
  }
  loadWeather(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'cloudLoader'
    this.statusDIV.appendChild(textNode)
    this.statusDIV.appendChild(spinner)
  }
}

module.exports = StatusUtility


/***/ },

/***/ "./src/js/weather.js"
/*!***************************!*\
  !*** ./src/js/weather.js ***!
  \***************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! ../scss/style.scss */ "./src/scss/style.scss")
__webpack_require__(/*! ../css/weather.css */ "./src/css/weather.css")
const StatusUtility = __webpack_require__(/*! ./utils/status */ "./src/js/utils/status.js")

document.addEventListener('DOMContentLoaded', () => {
  displayWeatherForecast(false)
})

const apiSELECT = document.getElementById('apiSelect')
apiSELECT.addEventListener('change', async event => {
  const statusDiv = new StatusUtility('statusDiv')
  const weatherLocation = event.target.value
  try {
    switch (weatherLocation) {
      case 'showDefault':
        statusDiv.loadWeather('Locating')
        await displayWeatherForecast(false)
        break
      case 'showForecast':
        statusDiv.loadWeather('Locating')
        await displayWeatherForecast(true)
        break
      case 'showCat':
        statusDiv.setLoading('Meowing')
        await displayCat()
        break
      case 'showCatSlider':
        statusDiv.setLoading('Meowing')
        await displayCatSlider()
        break
      default:
        break
    }
    statusDiv.clearStatus()
  } catch (error) {
    await displayWeatherForecast(false)
    statusDiv.setError(error)
  }
})

const WeatherForecastDataDisplay = __webpack_require__(/*! ./libs/forecastLib */ "./src/js/libs/forecastLib.js")
async function displayWeatherForecast(useGeoLocation) {
  const forecast = new WeatherForecastDataDisplay('displayDiv', 'apiLink')
  await forecast.setDisplay(useGeoLocation)
}

const { RandomCatImageDisplay, RandomCatImageSlider } = __webpack_require__(/*! ./libs/catLib */ "./src/js/libs/catLib.js")
async function displayCat() {
  const cat = new RandomCatImageDisplay('displayDiv', 'apiLink')
  await cat.displayCat()
}
async function displayCatSlider() {
  const slider = new RandomCatImageSlider('displayDiv', 'apiLink')
  await slider.display()
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"weather": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkexample"] = self["webpackChunkexample"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["src_scss_style_scss","src_js_libs_catLib_js"], () => (__webpack_require__("./src/js/weather.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQSw0Rzs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4YW1wbGUvLi9zcmMvY3NzL3dlYXRoZXIuY3NzP2E2OWIiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9saWJzL2ZvcmVjYXN0TGliLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvbGlicy93ZWF0aGVyLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvdXRpbHMvc3RhdHVzLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvd2VhdGhlci5qcyIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsImNvbnN0IExpbmtVdGlsaXR5ID0gcmVxdWlyZSgnLi4vdXRpbHMvbGluaycpXG5jb25zdCB7IEdlb0xvY2F0aW9uVXRpbGl0eSwgV2VhdGhlclV0aWxpdHksIGNyZWF0ZUxpbmUsIGNyZWF0ZUljb24gfSA9IHJlcXVpcmUoJy4vd2VhdGhlcicpXG5cbmNsYXNzIE5hdGlvbmFsV2VhdGhlclNlcnZpY2VBUEkge1xuICBMSU5LID0ge1xuICAgIHRpdGxlOiAnTmF0aW9uYWwgV2VhdGhlciBTZXJ2aWNlJyxcbiAgICB0YXJnZXQ6ICdodHRwczovL3d3dy53ZWF0aGVyLmdvdicsXG4gIH1cbiAgQVBJX1VSTCA9ICdodHRwczovL2FwaS53ZWF0aGVyLmdvdidcbiAgZW5kcG9pbnRzXG4gIGxvY2F0aW9uTmFtZVxuICBwb2ludFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVuZHBvaW50cyA9IHsgZm9yZWNhc3RIb3VybHk6ICcnLCBmb3JlY2FzdDogJycgfVxuICAgIHRoaXMubG9jYXRpb25OYW1lID0gJydcbiAgICB0aGlzLnBvaW50ID0gJydcbiAgfVxuICBhc3luYyBnZXRDb29yZHMoKSB7XG4gICAgY29uc3QgY29vcmRzID0gYXdhaXQgR2VvTG9jYXRpb25VdGlsaXR5LmdldENvb3JkaW5hdGVzKClcbiAgICByZXR1cm4geyBsYXRpdHVkZTogY29vcmRzLmxhdGl0dWRlLCBsb25naXR1ZGU6IGNvb3Jkcy5sb25naXR1ZGUgfVxuICB9XG4gIGFzeW5jIGZldGNoRGF0YSh1cmwpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgV2VhdGhlclV0aWxpdHkuZmV0Y2hEYXRhKHVybClcbiAgICByZXR1cm4gZGF0YVxuICB9XG4gIGFzeW5jIGZldGNoUG9pbnRzKGxhdCwgbG9uZywgbG9nKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKGAke3RoaXMuQVBJX1VSTH0vcG9pbnRzLyR7bGF0fSwke2xvbmd9YClcbiAgICBpZiAobG9nKSB7XG4gICAgICBjb25zb2xlLmxvZygnUG9pbnRzOiAnLCBkYXRhLmlkKVxuICAgIH1cbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcGVydGllc1xuICAgIHRoaXMuZW5kcG9pbnRzID0geyBmb3JlY2FzdEhvdXJseTogcHJvcHMuZm9yZWNhc3RIb3VybHksIGZvcmVjYXN0OiBwcm9wcy5mb3JlY2FzdCB9XG4gICAgY29uc3QgbG9jYXRpb25EYXRhID0gcHJvcHMucmVsYXRpdmVMb2NhdGlvbi5wcm9wZXJ0aWVzXG4gICAgdGhpcy5sb2NhdGlvbk5hbWUgPSBgJHtsb2NhdGlvbkRhdGEuY2l0eX0sICR7bG9jYXRpb25EYXRhLnN0YXRlfWBcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IHByb3BzLnJlbGF0aXZlTG9jYXRpb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcbiAgICB0aGlzLnBvaW50ID0gYCR7Y29vcmRpbmF0ZXNbMV0udG9GaXhlZCg0KX0sJHtjb29yZGluYXRlc1swXS50b0ZpeGVkKDQpfWBcbiAgfVxuICBhc3luYyBmZXRjaEN1cnJlbnRXZWF0aGVyKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoRGF0YSh0aGlzLmVuZHBvaW50cy5mb3JlY2FzdEhvdXJseSlcbiAgICBjb25zdCBjdXJyZW50ID0gZGF0YS5wcm9wZXJ0aWVzLnBlcmlvZHNbMF1cbiAgICBjb25zdCBjaGFydCA9IGRhdGEucHJvcGVydGllcy5wZXJpb2RzLnNsaWNlKDEsIDI1KVxuICAgIGNvbnN0IHRlbXBlcmF0dXJlID0gY2hhcnQubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSlcbiAgICByZXR1cm4ge1xuICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25OYW1lLFxuICAgICAgZGF0ZTogV2VhdGhlclV0aWxpdHkuZm9ybWF0RGF0ZShjdXJyZW50LnN0YXJ0VGltZSksXG4gICAgICB0ZW1wZXJhdHVyZTogYCR7Y3VycmVudC50ZW1wZXJhdHVyZX3CsCR7Y3VycmVudC50ZW1wZXJhdHVyZVVuaXR9YCxcbiAgICAgIHdpbmQ6IGAke2N1cnJlbnQud2luZFNwZWVkfSAke2N1cnJlbnQud2luZERpcmVjdGlvbn1gLFxuICAgICAgZm9yZWNhc3Q6IGN1cnJlbnQuc2hvcnRGb3JlY2FzdCxcbiAgICAgIGh1bWlkaXR5OiBgJHtjdXJyZW50LnJlbGF0aXZlSHVtaWRpdHkudmFsdWV9JSBSSGAsXG4gICAgICBpY29uOiBjdXJyZW50Lmljb24sXG4gICAgICBjaGFydDoge1xuICAgICAgICB0ZW1wOiB0ZW1wZXJhdHVyZSxcbiAgICAgICAgcm9vbTogQXJyYXkodGVtcGVyYXR1cmUubGVuZ3RoKS5maWxsKDcyKSxcbiAgICAgICAgbWluOiBNYXRoLm1pbiguLi50ZW1wZXJhdHVyZSwgNzIpIC0gNSxcbiAgICAgICAgbWF4OiBNYXRoLm1heCguLi50ZW1wZXJhdHVyZSwgNzIpICsgNSxcbiAgICAgICAgcmFpbjogY2hhcnQubWFwKHAgPT4gcC5wcm9iYWJpbGl0eU9mUHJlY2lwaXRhdGlvbi52YWx1ZSksXG4gICAgICAgIHRpbWU6IGNoYXJ0Lm1hcChwID0+IFdlYXRoZXJVdGlsaXR5LmZvcm1hdFRpbWUocC5lbmRUaW1lKSksXG4gICAgICAgIGh1bTogY2hhcnQubWFwKHAgPT4gcC5yZWxhdGl2ZUh1bWlkaXR5LnZhbHVlIHwgMCksXG4gICAgICB9LFxuICAgIH1cbiAgfVxuICBhc3luYyBmZXRjaEZvcmVjYXN0V2VhdGhlcigpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaERhdGEodGhpcy5lbmRwb2ludHMuZm9yZWNhc3QpXG4gICAgY29uc3QgZm9yZWNhc3QgPSBkYXRhLnByb3BlcnRpZXMucGVyaW9kc1xuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbjogdGhpcy5sb2NhdGlvbk5hbWUsXG4gICAgICBpc0RheXRpbWU6IGZvcmVjYXN0Lm1hcChwID0+IHAuaXNEYXl0aW1lKSxcbiAgICAgIG5hbWU6IGZvcmVjYXN0Lm1hcChwID0+IHAubmFtZSksXG4gICAgICB0ZW1wZXJhdHVyZTogZm9yZWNhc3QubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSksXG4gICAgICB3aW5kOiBmb3JlY2FzdC5tYXAocCA9PiBgJHtwLndpbmRTcGVlZH0gJHtwLndpbmREaXJlY3Rpb259YCksXG4gICAgICBmb3JlY2FzdDogZm9yZWNhc3QubWFwKHAgPT4gcC5kZXRhaWxlZEZvcmVjYXN0KSxcbiAgICAgIHJhaW46IGZvcmVjYXN0Lm1hcChwID0+IHAucHJvYmFiaWxpdHlPZlByZWNpcGl0YXRpb24udmFsdWUgfCAwKSxcbiAgICAgIGljb246IGZvcmVjYXN0Lm1hcChwID0+IHAuaWNvbiksXG4gICAgICBjaGFydDogc2V0c2V2ZW5EYXlDaGFydERhdGEoZm9yZWNhc3QpLFxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRzZXZlbkRheUNoYXJ0RGF0YShmb3JlY2FzdCkge1xuICAgICAgY29uc3QgRGF5dGltZSA9IGZvcmVjYXN0LmZpbHRlcihwID0+IHAuaXNEYXl0aW1lKVxuICAgICAgY29uc3QgTmlnaHR0aW1lID0gZm9yZWNhc3QuZmlsdGVyKHAgPT4gIXAuaXNEYXl0aW1lKVxuICAgICAgY29uc3QgaGlnaCA9IERheXRpbWUubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSlcbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLmhpZ2gpICsgNVxuICAgICAgY29uc3QgbG93ID0gTmlnaHR0aW1lLm1hcChwID0+IHAudGVtcGVyYXR1cmUpXG4gICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi5sb3csIDcyKSAtIDVcbiAgICAgIGNvbnN0IHJvb20gPSBBcnJheShoaWdoLmxlbmd0aCkuZmlsbCg3MilcbiAgICAgIGNvbnN0IHRlbXAgPSB7IGhpZ2gsIGxvdywgcm9vbSwgbWF4LCBtaW4gfVxuICAgICAgY29uc3QgcmFpbiA9IERheXRpbWUubWFwKHAgPT4gcC5wcm9iYWJpbGl0eU9mUHJlY2lwaXRhdGlvbi52YWx1ZSA/PyAwKVxuICAgICAgY29uc3QgZGF5cyA9IERheXRpbWUubWFwKHAgPT4gcC5uYW1lKVxuICAgICAgcmV0dXJuIHsgdGVtcCwgcmFpbiwgZGF5cyB9XG4gICAgfVxuICB9XG4gIGFzeW5jIGZldGNoQWxlcnRzKCkge1xuICAgIGNvbnN0IGFsZXJ0c1VSSSA9IGAke3RoaXMuQVBJX1VSTH0vYWxlcnRzL2FjdGl2ZT9wb2ludD0ke3RoaXMucG9pbnR9YFxuICAgIGNvbnN0IGFsZXJ0cyA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKGFsZXJ0c1VSSSlcbiAgICByZXR1cm4gYWxlcnRzLmZlYXR1cmVzXG4gIH1cbn1cblxuY2xhc3MgV2VhdGhlckNoYXJ0SlMge1xuICB0eHQgPSAnI2NjYydcbiAgYmdDb2xvciA9ICcjMzMzJ1xuICBncmlkQ29sb3IgPSAnIzU1NSdcbiAgbGluZUNvbG9yID0ge1xuICAgIEJsdWU6ICcjMzZBMkVCJyxcbiAgICBSZWQ6ICcjRkY2Mzg0JyxcbiAgICBPcmFuZ2U6ICcjRkY5RjQwJyxcbiAgICBZZWxsb3c6ICcjRkZDRDU2JyxcbiAgICBHcmVlbjogJyM0QkMwQzAnLFxuICAgIFB1cnBsZTogJyM5OTY2RkYnLFxuICAgIEdyZXk6ICcjQzlDQkNFJyxcbiAgfVxuICBjaGFydERJVlxuICBjdHhcbiAgY29uc3RydWN0b3IoY2hhcnRJRCkge1xuICAgIHRoaXMuY2hhcnRESVYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElEKVxuICAgIGNvbnN0IGNhbnZhc0lEID0gYCR7Y2hhcnRJRH1DVFhgXG4gICAgdGhpcy5jaGFydERJVi5pbm5lckhUTUwgPSBgPGRpdj48Y2FudmFzIGlkPScke2NhbnZhc0lEfSc+PC9jYW52YXM+PC9kaXY+YFxuICAgIHRoaXMuY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzSUQpXG4gIH1cbiAgZGlzcGxheUNoYXJ0KGRhdGEsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IENoYXJ0IH0gPSB3aW5kb3dcbiAgICBDaGFydC5kZWZhdWx0cy5jb2xvciA9IHRoaXMudHh0XG4gICAgdGhpcy5jdHguc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iZ0NvbG9yXG4gICAgY29uc3QgY29uZmlnID0geyB0eXBlOiAnbGluZScsIGRhdGEsIG9wdGlvbnMgfVxuICAgIGNvbnN0IHRlbXBlcmF0dXJlQ2hhcnQgPSBuZXcgQ2hhcnQodGhpcy5jdHgsIGNvbmZpZylcbiAgICB0aGlzLnNldENoYXJ0V2lkdGgodGVtcGVyYXR1cmVDaGFydClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDaGFydFdpZHRoKHRlbXBlcmF0dXJlQ2hhcnQpXG4gICAgfSlcbiAgfVxuICBzZXRDaGFydFdpZHRoKHdlYXRoZXJDaGFydCkge1xuICAgIGNvbnN0IGNoYXJ0U3R5bGUgPSB3ZWF0aGVyQ2hhcnQuY2FudmFzLnBhcmVudE5vZGUuc3R5bGVcbiAgICBjaGFydFN0eWxlLm1hcmdpbiA9ICdhdXRvJ1xuICAgIGNvbnN0IHNjcmVlbldpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB3ZWF0aGVyQ2hhcnQucmVzaXplKHNjcmVlbldpZHRoLCAnYXV0bycpXG4gICAgY2hhcnRTdHlsZS53aWR0aCA9ICcxMDAlJ1xuICB9XG4gIHNldDdEYXlDaGFydChjaGFydERhdGEsIGxvY2F0aW9uTmFtZSkge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnNldDdEYXlEYXRhKGNoYXJ0RGF0YSlcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5zZXQ3RGF5T3B0aW9ucyhsb2NhdGlvbk5hbWUpXG4gICAgdGhpcy5kaXNwbGF5Q2hhcnQoZGF0YSwgb3B0aW9ucylcbiAgfVxuICBzZXQ3RGF5RGF0YShjaGFydERhdGEpIHtcbiAgICBjb25zdCBoaWdoRGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGxhYmVsOiAnSGlnaHMnLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLlJlZCxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgICAgZGF0YTogY2hhcnREYXRhLnRlbXAuaGlnaCxcbiAgICB9XG4gICAgY29uc3QgbG93RGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGxhYmVsOiAnTG93cycsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuQmx1ZSxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgICAgZGF0YTogY2hhcnREYXRhLnRlbXAubG93LFxuICAgIH1cbiAgICBjb25zdCByb29tRGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGxhYmVsOiAnNzJcXHUwMEIwRicsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuR3JlZW4sXG4gICAgICBwb2ludFJhZGl1czogMCxcbiAgICAgIGRhdGE6IEFycmF5KGNoYXJ0RGF0YS50ZW1wLmhpZ2gubGVuZ3RoKS5maWxsKDcyKSxcbiAgICAgIGJvcmRlckRhc2g6IFs1LCA1XSxcbiAgICB9XG4gICAgY29uc3QgcmFpbkRhdGFTZXQgPSB7XG4gICAgICB0eXBlOiAnYmFyJyxcbiAgICAgIGxhYmVsOiAnUmFpbicsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMubGluZUNvbG9yLlB1cnBsZSxcbiAgICAgIGJhclRoaWNrbmVzczogMTUsXG4gICAgICBkYXRhOiBjaGFydERhdGEucmFpbixcbiAgICAgIHlBeGlzSUQ6ICd5MicsXG4gICAgfVxuICAgIGNvbnN0IGRhdGFzZXRzID0gW2hpZ2hEYXRhU2V0LCBsb3dEYXRhU2V0LCByb29tRGF0YVNldCwgcmFpbkRhdGFTZXRdXG4gICAgcmV0dXJuIHsgbGFiZWxzOiBjaGFydERhdGEuZGF5cywgZGF0YXNldHMgfVxuICB9XG4gIHNldDdEYXlPcHRpb25zKGxvY2F0aW9uKSB7XG4gICAgY29uc3QgbmFtZSA9ICdXZWF0aGVyIEZvcmVjYXN0J1xuICAgIGNvbnN0IHRpdGxlID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiBuYW1lLCBjb2xvcjogdGhpcy50eHQsIGZvbnQ6IHsgc2l6ZTogMTggfSB9XG4gICAgY29uc3Qgc3VidGl0bGUgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6IGxvY2F0aW9uLCBjb2xvcjogdGhpcy50eHQsIGZvbnQ6IHsgc2l6ZTogMTYgfSB9XG4gICAgY29uc3QgcGx1Z2lucyA9IHsgdGl0bGUsIHN1YnRpdGxlIH1cbiAgICBjb25zdCBncmlkID0geyBkaXNwbGF5OiB0cnVlLCBjb2xvcjogdGhpcy5ncmlkQ29sb3IgfVxuICAgIGNvbnN0IHNjYWxlWCA9IHsgdGl0bGU6IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ0RheSBvZiB0aGUgV2VlaycgfSwgZ3JpZCB9XG4gICAgY29uc3Qgc2NhbGVZID0ge1xuICAgICAgdGl0bGU6IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1RlbXBlcmF0dXJlIChcXHUwMEIwRiknIH0sXG4gICAgICBncmlkLFxuICAgICAgcG9zaXRpb246ICdsZWZ0JyxcbiAgICB9XG4gICAgY29uc3Qgc2NhbGVZMiA9IHtcbiAgICAgIHRpdGxlOiB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdQZXJjZW50ICglKScgfSxcbiAgICAgIGdyaWQsXG4gICAgICBwb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgfVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IHBsdWdpbnMsIHNjYWxlczogeyB4OiBzY2FsZVgsIHk6IHNjYWxlWSwgeTI6IHNjYWxlWTIgfSB9XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuICBzZXQyNEhyQ2hhcnQoY2hhcnREYXRhKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2V0MjRIckRhdGEoY2hhcnREYXRhKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmdldDI0SHJPcHRpb25zKClcbiAgICB0aGlzLmRpc3BsYXlDaGFydChkYXRhLCBvcHRpb25zKVxuICB9XG4gIGdldDI0SHJPcHRpb25zKCkge1xuICAgIGNvbnN0IG5hbWUgPSAnMjQgSG91ciBGb3JlY2FzdCdcbiAgICBjb25zdCB0aXRsZSA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogbmFtZSwgY29sb3I6IHRoaXMudHh0LCBmb250OiB7IHNpemU6IDE2IH0gfVxuICAgIGNvbnN0IGdyaWQgPSB7IGRpc3BsYXk6IHRydWUsIGNvbG9yOiB0aGlzLmdyaWRDb2xvciB9XG4gICAgY29uc3QgdGl0bGVYID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnVGltZScgfVxuICAgIGNvbnN0IHNjYWxlWCA9IHsgdGl0bGU6IHRpdGxlWCwgZ3JpZCB9XG4gICAgY29uc3QgdGl0bGVZID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnVGVtcGVyYXR1cmUgKFxcdTAwQjBGKScgfVxuICAgIGNvbnN0IHNjYWxlWSA9IHsgdGl0bGU6IHRpdGxlWSwgZ3JpZCwgcG9zaXRpb246ICdsZWZ0JyB9XG4gICAgY29uc3QgdGl0bGVZMiA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1BlcmNlbnQgKCUpJyB9XG4gICAgY29uc3Qgc2NhbGVZMiA9IHtcbiAgICAgIHRpdGxlOiB0aXRsZVkyLFxuICAgICAgZ3JpZCxcbiAgICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICBtYXg6IDEwMCxcbiAgICB9XG4gICAgcmV0dXJuIHsgcGx1Z2luczogeyB0aXRsZSB9LCBzY2FsZXM6IHsgeDogc2NhbGVYLCB5OiBzY2FsZVksIHkyOiBzY2FsZVkyIH0gfVxuICB9XG4gIHNldDI0SHJEYXRhKGRhdGEpIHtcbiAgICBjb25zdCB0ZW1wID0ge1xuICAgICAgbGFiZWw6ICdUZW1wZXJhdHVyZScsXG4gICAgICBkYXRhOiBkYXRhLnRlbXAsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuT3JhbmdlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSB7XG4gICAgICBsYWJlbDogJzcywrBGJyxcbiAgICAgIGRhdGE6IGRhdGEucm9vbSxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5HcmVlbixcbiAgICAgIHBvaW50UmFkaXVzOiAwLFxuICAgICAgYm9yZGVyRGFzaDogWzUsIDVdLFxuICAgIH1cbiAgICBjb25zdCByYWluID0ge1xuICAgICAgbGFiZWw6ICdSYWluJyxcbiAgICAgIGRhdGE6IGRhdGEucmFpbixcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5CbHVlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgICB5QXhpc0lEOiAneTInLFxuICAgIH1cbiAgICBjb25zdCBodW0gPSB7XG4gICAgICBsYWJlbDogJ0h1bWlkaXR5JyxcbiAgICAgIGRhdGE6IGRhdGEuaHVtLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLlB1cnBsZSxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgIH1cbiAgICByZXR1cm4geyBsYWJlbHM6IGRhdGEudGltZSwgZGF0YXNldHM6IFt0ZW1wLCByb29tLCByYWluLCBodW1dIH1cbiAgfVxufVxuXG5jb25zdCBOV1MgPSBuZXcgTmF0aW9uYWxXZWF0aGVyU2VydmljZUFQSSgpXG5cbmNsYXNzIFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5IGV4dGVuZHMgTGlua1V0aWxpdHkge1xuICBkaXNwbGF5RElWXG4gIHdlYXRoZXJEaXZMZWZ0XG4gIHdlYXRoZXJEaXZSaWdodFxuICB3ZWF0aGVyQWxlcnRzXG4gIHdlZWtGb3JlY2FzdFxuICBzZXZlbkRheUNoYXJ0XG4gIHR3ZW50eWZvdXJob3VyQ2hhcnRcbiAgRml4ZWRDb29yZHMgPSB7IGxhdGl0dWRlOiAyNi4zMDg1LCBsb25naXR1ZGU6IC05OC4xMDE2IH1cbiAgY29uc3RydWN0b3IoZGlzcGxheUlkLCBsaW5rSWQpIHtcbiAgICBzdXBlcihsaW5rSWQpXG4gICAgc3VwZXIuc2V0TGluayhOV1MuTElOSy50aXRsZSwgTldTLkxJTksudGFyZ2V0LCB0cnVlKVxuICAgIHRoaXMuZGlzcGxheURJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpc3BsYXlJZClcbiAgICBjb25zdCBURU1QTEFURSA9IGBcbiAgICAgIDxkaXYgaWQ9XCJ3ZWF0aGVyQ29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBpZD0nd2VhdGhlckRpdkxlZnQnPjwvZGl2PjxkaXYgaWQ9J3dlYXRoZXJEaXZSaWdodCc+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJhbGVydHNJZFwiPjwvZGl2PlxcbjxkaXYgaWQ9XCJmb3JlY2FzdERpdlwiPlxcbjwvZGl2PlxuICAgICAgPGRpdiBpZD1cImNoYXJ0T25lRGl2XCI+PC9kaXY+PGRpdiBpZD1cImNoYXJ0VHdvRGl2XCI+PC9kaXY+XG4gICAgICBgXG4gICAgdGhpcy5kaXNwbGF5RElWLmlubmVySFRNTCA9IFRFTVBMQVRFXG4gICAgdGhpcy53ZWF0aGVyRGl2TGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWF0aGVyRGl2TGVmdCcpXG4gICAgdGhpcy53ZWF0aGVyRGl2UmlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2VhdGhlckRpdlJpZ2h0JylcbiAgICB0aGlzLndlYXRoZXJBbGVydHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxlcnRzSWQnKVxuICAgIHRoaXMud2Vla0ZvcmVjYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvcmVjYXN0RGl2JylcbiAgICB0aGlzLnNldmVuRGF5Q2hhcnQgPSBuZXcgV2VhdGhlckNoYXJ0SlMoJ2NoYXJ0T25lRGl2JylcbiAgICB0aGlzLnR3ZW50eWZvdXJob3VyQ2hhcnQgPSBuZXcgV2VhdGhlckNoYXJ0SlMoJ2NoYXJ0VHdvRGl2JylcbiAgfVxuICBhc3luYyBzZXREaXNwbGF5KHVzZUdlb0xvY2F0aW9uKSB7XG4gICAgbGV0IGNvb3JkcyA9IHRoaXMuRml4ZWRDb29yZHNcbiAgICBpZiAodXNlR2VvTG9jYXRpb24pIHtcbiAgICAgIGNvb3JkcyA9IChhd2FpdCBOV1MuZ2V0Q29vcmRzKCkpIHx8IGNvb3Jkc1xuICAgIH1cbiAgICBhd2FpdCBOV1MuZmV0Y2hQb2ludHMoY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlKVxuICAgIGNvbnNvbGUubG9nKGBEaXNwbGF5aW5nICR7TldTLmxvY2F0aW9uTmFtZX06ICR7TldTLmVuZHBvaW50cy5mb3JlY2FzdH0hYClcbiAgICBhd2FpdCB0aGlzLnNldEN1cnJlbnRXZWF0aGVyKClcbiAgICBhd2FpdCB0aGlzLnNldEZvcmVjYXN0QW5kQ2hhcnQoKVxuICAgIGF3YWl0IHRoaXMuc2V0QWN0aXZlQWxlcnRzKClcbiAgfVxuICBhc3luYyBzZXRDdXJyZW50V2VhdGhlcigpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgTldTLmZldGNoQ3VycmVudFdlYXRoZXIoKVxuICAgIGNvbnN0IGZyYWdtZW50ID0gbmV3IERvY3VtZW50RnJhZ21lbnQoKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC5kYXRlLCAxLjEpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC5sb2NhdGlvbiwgMS40KSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQudGVtcGVyYXR1cmUsIDMpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC53aW5kLCAxLjUpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC5mb3JlY2FzdCwgMSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50Lmh1bWlkaXR5LCAxKSlcbiAgICB0aGlzLndlYXRoZXJEaXZMZWZ0LmFwcGVuZENoaWxkKGZyYWdtZW50KVxuICAgIHRoaXMudHdlbnR5Zm91cmhvdXJDaGFydC5zZXQyNEhyQ2hhcnQoY3VycmVudC5jaGFydClcbiAgfVxuICBhc3luYyBzZXRGb3JlY2FzdEFuZENoYXJ0KCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBOV1MuZmV0Y2hGb3JlY2FzdFdlYXRoZXIoKVxuICAgIGNvbnN0IGZyYWdtZW50ID0gbmV3IERvY3VtZW50RnJhZ21lbnQoKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoZGF0YS5uYW1lWzBdLCAxLjIpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUljb24oZGF0YS5pY29uWzBdLCBkYXRhLmZvcmVjYXN0WzBdKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGAke2RhdGEudGVtcGVyYXR1cmVbMF19JmRlZztGYCwgMC44KSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGRhdGEud2luZFswXSwgMC44KSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGAke2RhdGEucmFpblswXX0lIENoYW5jZSBSYWluYCwgMC44KSlcbiAgICB0aGlzLndlYXRoZXJEaXZSaWdodC5hcHBlbmRDaGlsZChmcmFnbWVudClcblxuICAgIGNvbnN0IGZvcmVjYXN0RnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcblxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgZGF0YS5uYW1lLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAvLyAgIGNvbnN0IGlzRGF5dGltZSA9IGRhdGEuaXNEYXl0aW1lW2ldXG4gICAgLy8gICBpZiAoIWlzRGF5dGltZSkge1xuICAgIC8vICAgICBjb250aW51ZVxuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgY29uc3QgZm9yZWNhc3REYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIC8vICAgICBmb3JlY2FzdERheS5jbGFzc0xpc3QuYWRkKCdkYXktY2FyZCcpXG4gICAgLy8gICAgIGZvcmVjYXN0RGF5LnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgJHtkYXRhLm5hbWVbaV19OiAke2RhdGEuZm9yZWNhc3RbaV19YClcbiAgICAvLyAgICAgZm9yZWNhc3REYXkuaW5uZXJIVE1MID0gYFxuICAgIC8vICAgICAgIDxzcGFuIGNsYXNzPVwiZGF5XCI+JHtkYXRhLm5hbWVbaV0uc3Vic3RyaW5nKDAsIDMpfTwvc3Bhbj5cbiAgICAvLyAgICAgICA8c3BhbiBjbGFzcz1cInJhaW5cIj4ke2RhdGEucmFpbltpXX0lPC9zcGFuPlxuICAgIC8vICAgICAgIDxpbWcgc3JjPVwiJHtkYXRhLmljb25baV19XCIgYWx0PVwiaWNvblwiIGhlaWdodD1cImF1dG9cIiB3aWR0aD1cIjc1JVwiPlxuICAgIC8vICAgICAgIDxzcGFuIGNsYXNzPVwiaGlcIj4ke2RhdGEudGVtcGVyYXR1cmVbaV19JmRlZztGPC9zcGFuPlxuICAgIC8vICAgICAgIDxzcGFuIGNsYXNzPVwibG9cIj4ke2RhdGEudGVtcGVyYXR1cmVbaSArIDFdfSZkZWdGPC9zcGFuPlxuICAgIC8vICAgICBgXG5cbiAgICAgIGlmICghZGF0YS5pc0RheXRpbWVbaV0pIGNvbnRpbnVlXG4gICAgICBpZiAoaSArIDEgPj0gZGF0YS50ZW1wZXJhdHVyZS5sZW5ndGgpIGJyZWFrXG4gICAgICBjb25zdCBmb3JlY2FzdERheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBmb3JlY2FzdERheS5jbGFzc0xpc3QuYWRkKCdmb3JlY2FzdC1kYXktY2FyZCcpXG4gICAgICBmb3JlY2FzdERheS5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYCR7ZGF0YS5uYW1lW2ldfTogJHtkYXRhLmZvcmVjYXN0W2ldfWApXG4gICAgICBmb3JlY2FzdERheS5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzcGFuIGNsYXNzPVwiZGF5XCI+JHtkYXRhLm5hbWVbaV0uc3Vic3RyaW5nKDAsIDMpfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJyYWluXCI+JHtkYXRhLnJhaW5baV19JTwvc3Bhbj5cbiAgICAgICAgPGltZyBzcmM9XCIke2RhdGEuaWNvbltpXX1cIiBhbHQ9XCJpY29uXCIgd2lkdGg9XCI3NSVcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJoaVwiPiR7ZGF0YS50ZW1wZXJhdHVyZVtpXX0mZGVnO0Y8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibG9cIj4ke2RhdGEudGVtcGVyYXR1cmVbaSArIDFdID8/ICctLSd9JmRlZztGPC9zcGFuPlxuICAgICAgYFxuXG4gICAgICBmb3JlY2FzdEZyYWdtZW50LmFwcGVuZENoaWxkKGZvcmVjYXN0RGF5KVxuICAgIH1cbiAgICB0aGlzLndlZWtGb3JlY2FzdC5pbm5lckhUTUwgPSAnJ1xuICAgIHRoaXMud2Vla0ZvcmVjYXN0LmFwcGVuZENoaWxkKGZvcmVjYXN0RnJhZ21lbnQpXG4gICAgdGhpcy5zZXZlbkRheUNoYXJ0LnNldDdEYXlDaGFydChkYXRhLmNoYXJ0LCBkYXRhLmxvY2F0aW9uKVxuICB9XG4gIGFzeW5jIHNldEFjdGl2ZUFsZXJ0cygpIHtcbiAgICBjb25zdCBhbGVydERhdGEgPSBhd2FpdCBOV1MuZmV0Y2hBbGVydHMoKVxuICAgIGlmIChhbGVydERhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhgTm8gYWN0aXZlIGFsZXJ0cyBmb3VuZC5gKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGZlYXR1cmUgb2YgYWxlcnREYXRhKSB7XG4gICAgICBjb25zdCBhbGVydFRpdGxlID0gYCR7ZmVhdHVyZS5tZXNzYWdlVHlwZX06ICR7ZmVhdHVyZS5ldmVudH0gLyAke2ZlYXR1cmUuc2V2ZXJpdHl9YFxuICAgICAgY29uc3QgaW5mb3JtYXRpb24gPSBgJHtmZWF0dXJlLmRlc2NyaXB0aW9ufVxcbiR7ZmVhdHVyZS5pbnN0cnVjdGlvbiB8fCAnJ31gXG4gICAgICBjb25zdCBhbGVydE1lc3NhZ2UgPSBgJHtmZWF0dXJlLmhlYWRsaW5lfVxcbiR7aW5mb3JtYXRpb259YFxuICAgICAgaWYgKGZlYXR1cmUuc3RhdHVzID09PSAnQWN0dWFsJykge1xuICAgICAgICBjb25zdCB3ZWF0aGVyQWxlcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICB3ZWF0aGVyQWxlcnQuc2V0QXR0cmlidXRlKCd0aXRsZScsIGZlYXR1cmUuaGVhZGxpbmUpXG4gICAgICAgIHdlYXRoZXJBbGVydC5zdHlsZS5wYWRkaW5nID0gJzVweCdcbiAgICAgICAgd2VhdGhlckFsZXJ0LmlubmVySFRNTCA9IGFsZXJ0VGl0bGVcbiAgICAgICAgd2VhdGhlckFsZXJ0Lm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoYWxlcnRNZXNzYWdlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMud2VhdGhlckFsZXJ0cy5hcHBlbmRDaGlsZCh3ZWF0aGVyQWxlcnQpXG4gICAgICB9XG4gICAgICB0aGlzLmxvZ0FjdGl2ZUFsZXJ0cyhmZWF0dXJlLCBhbGVydFRpdGxlLCBpbmZvcm1hdGlvbilcbiAgICB9XG4gIH1cbiAgbG9nQWN0aXZlQWxlcnRzKGZlYXR1cmUsIGFsZXJ0VGl0bGUsIGluZm9ybWF0aW9uKSB7XG4gICAgY29uc29sZS5ncm91cChhbGVydFRpdGxlKVxuICAgIGNvbnNvbGUubG9nKGBTdGF0dXM6ICR7ZmVhdHVyZS5zdGF0dXN9YClcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGZlYXR1cmUuaGVhZGxpbmUpXG4gICAgY29uc29sZS5pbmZvKGluZm9ybWF0aW9uKVxuICAgIGNvbnNvbGUubG9nKGBVcmdlbmN5OiAke2ZlYXR1cmUudXJnZW5jeX0gLyBDZXJ0YWludHk6ICR7ZmVhdHVyZS5jZXJ0YWludHl9YClcbiAgICBjb25zb2xlLmdyb3VwRW5kKClcbiAgICBjb25zb2xlLmdyb3VwRW5kKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5XG4iLCJjbGFzcyBHZW9Mb2NhdGlvblV0aWxpdHkge1xuICBzdGF0aWMgYXN5bmMgZ2V0Q29vcmRpbmF0ZXMoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgZW5hYmxlSGlnaEFjY3VyYWN5OiBmYWxzZSwgdGltZW91dDogNTAwMCwgbWF4aW11bUFnZTogMCB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBwb3NpdGlvbiA9PiB7XG4gICAgICAgIHJlc29sdmUocG9zaXRpb24uY29vcmRzKVxuICAgICAgfVxuICAgICAgY29uc3QgZXJyb3IgPSBlcnJvciA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpXG4gICAgICB9XG4gICAgICBpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdHZW9sb2NhdGlvbiBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBicm93c2VyLicpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihzdWNjZXNzLCBlcnJvciwgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHN0YXRpYyBnZXRMb2NhbGVzKCkge1xuICAgIGlmICghbmF2aWdhdG9yLmxhbmd1YWdlcykge1xuICAgICAgcmV0dXJuICdlbi1VUydcbiAgICB9XG4gICAgcmV0dXJuIG5hdmlnYXRvci5sYW5ndWFnZXNcbiAgfVxufVxuXG5jbGFzcyBXZWF0aGVyVXRpbGl0eSB7XG4gIHN0YXRpYyBhc3luYyBmZXRjaERhdGEoZW5kcG9pbnQpIHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGVuZHBvaW50KVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyh7ICdVc2VyLUFnZW50JzogJ2h0dHBzOi8vZ2l0aHViLmNvbS9mZWxpeHRoZWNhdDhhJyB9KVxuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh1cmwsIHsgaGVhZGVycyB9KVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2gocmVxdWVzdClcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYCR7cmVzcG9uc2Uuc3RhdHVzfSBEYXRhIE5vdCBGb3VuZDogJHtyZXNwb25zZS51cmx9YClcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuICBzdGF0aWMgZm9ybWF0RGF0ZShkYXRlVGltZSkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShkYXRlVGltZSlcbiAgICBjb25zdCBvcHRpb25zID0geyBkYXRlU3R5bGU6ICdmdWxsJyB9XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KEdlb0xvY2F0aW9uVXRpbGl0eS5nZXRMb2NhbGVzKCksIG9wdGlvbnMpLmZvcm1hdChkYXRlKVxuICB9XG4gIHN0YXRpYyBmb3JtYXRUaW1lKGRhdGVUaW1lKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVUaW1lKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IHRpbWVTdHlsZTogJ3Nob3J0JyB9XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KEdlb0xvY2F0aW9uVXRpbGl0eS5nZXRMb2NhbGVzKCksIG9wdGlvbnMpLmZvcm1hdChkYXRlKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmUoY29udGVudCwgc2l6ZSkge1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkaXYuc3R5bGUuZm9udFNpemUgPSBgJHtzaXplfXJlbWBcbiAgZGl2LmlubmVySFRNTCA9IGNvbnRlbnRcbiAgcmV0dXJuIGRpdlxufVxuXG5mdW5jdGlvbiBjcmVhdGVJY29uKHNyYywgdGl0bGUpIHtcbiAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcbiAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgc3JjKVxuICBpbWcuc2V0QXR0cmlidXRlKCd0aXRsZScsIHRpdGxlKVxuICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCAnaWNvbicpXG4gIHJldHVybiBpbWdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IEdlb0xvY2F0aW9uVXRpbGl0eSwgV2VhdGhlclV0aWxpdHksIGNyZWF0ZUxpbmUsIGNyZWF0ZUljb24gfVxuIiwiY2xhc3MgU3RhdHVzVXRpbGl0eSB7XG4gIHN0YXR1c0RJVlxuICBjb25zdHJ1Y3RvcihzdGF0dXNEaXZFbGVtZW50SWQpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3RhdHVzRGl2RWxlbWVudElkKVxuICAgIGlmICghZWxlbWVudCB8fCAhKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdHVzIERpdiBFbGVtZW50IE5vdCBGb3VuZCBvciBOb3QgYSBESVZgKVxuICAgIH1cbiAgICB0aGlzLnN0YXR1c0RJViA9IGVsZW1lbnRcbiAgfVxuICBzZXRTdGF0dXMoc3RhdHVzKSB7XG4gICAgdGhpcy5zdGF0dXNESVYudGV4dENvbnRlbnQgPSBzdGF0dXMgPz8gJydcbiAgfVxuICBjbGVhclN0YXR1cygpIHtcbiAgICB0aGlzLnN0YXR1c0RJVi50ZXh0Q29udGVudCA9ICcnXG4gIH1cbiAgc2V0RXJyb3IobWVzc2FnZSkge1xuICAgIHRoaXMuY2xlYXJTdGF0dXMoKVxuICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGFuLnRleHRDb250ZW50ID0gbWVzc2FnZVxuICAgIHNwYW4uc3R5bGUuY29sb3IgPSAncGFsZXZpb2xldHJlZCdcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZChzcGFuKVxuICB9XG4gIHNldExvYWRpbmcobWVzc2FnZSkge1xuICAgIHRoaXMuY2xlYXJTdGF0dXMoKVxuICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSlcbiAgICBjb25zdCBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bpbm5lci5jbGFzc05hbWUgPSAnc3Bpbm5lcidcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSlcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZChzcGlubmVyKVxuICB9XG4gIGxvYWRXZWF0aGVyKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmNsZWFyU3RhdHVzKClcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpXG4gICAgY29uc3Qgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gJ2Nsb3VkTG9hZGVyJ1xuICAgIHRoaXMuc3RhdHVzRElWLmFwcGVuZENoaWxkKHRleHROb2RlKVxuICAgIHRoaXMuc3RhdHVzRElWLmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0dXNVdGlsaXR5XG4iLCJyZXF1aXJlKCcuLi9zY3NzL3N0eWxlLnNjc3MnKVxucmVxdWlyZSgnLi4vY3NzL3dlYXRoZXIuY3NzJylcbmNvbnN0IFN0YXR1c1V0aWxpdHkgPSByZXF1aXJlKCcuL3V0aWxzL3N0YXR1cycpXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QoZmFsc2UpXG59KVxuXG5jb25zdCBhcGlTRUxFQ1QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBpU2VsZWN0JylcbmFwaVNFTEVDVC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyBldmVudCA9PiB7XG4gIGNvbnN0IHN0YXR1c0RpdiA9IG5ldyBTdGF0dXNVdGlsaXR5KCdzdGF0dXNEaXYnKVxuICBjb25zdCB3ZWF0aGVyTG9jYXRpb24gPSBldmVudC50YXJnZXQudmFsdWVcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKHdlYXRoZXJMb2NhdGlvbikge1xuICAgICAgY2FzZSAnc2hvd0RlZmF1bHQnOlxuICAgICAgICBzdGF0dXNEaXYubG9hZFdlYXRoZXIoJ0xvY2F0aW5nJylcbiAgICAgICAgYXdhaXQgZGlzcGxheVdlYXRoZXJGb3JlY2FzdChmYWxzZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Nob3dGb3JlY2FzdCc6XG4gICAgICAgIHN0YXR1c0Rpdi5sb2FkV2VhdGhlcignTG9jYXRpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KHRydWUpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaG93Q2F0JzpcbiAgICAgICAgc3RhdHVzRGl2LnNldExvYWRpbmcoJ01lb3dpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5Q2F0KClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Nob3dDYXRTbGlkZXInOlxuICAgICAgICBzdGF0dXNEaXYuc2V0TG9hZGluZygnTWVvd2luZycpXG4gICAgICAgIGF3YWl0IGRpc3BsYXlDYXRTbGlkZXIoKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgc3RhdHVzRGl2LmNsZWFyU3RhdHVzKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhd2FpdCBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KGZhbHNlKVxuICAgIHN0YXR1c0Rpdi5zZXRFcnJvcihlcnJvcilcbiAgfVxufSlcblxuY29uc3QgV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXkgPSByZXF1aXJlKCcuL2xpYnMvZm9yZWNhc3RMaWInKVxuYXN5bmMgZnVuY3Rpb24gZGlzcGxheVdlYXRoZXJGb3JlY2FzdCh1c2VHZW9Mb2NhdGlvbikge1xuICBjb25zdCBmb3JlY2FzdCA9IG5ldyBXZWF0aGVyRm9yZWNhc3REYXRhRGlzcGxheSgnZGlzcGxheURpdicsICdhcGlMaW5rJylcbiAgYXdhaXQgZm9yZWNhc3Quc2V0RGlzcGxheSh1c2VHZW9Mb2NhdGlvbilcbn1cblxuY29uc3QgeyBSYW5kb21DYXRJbWFnZURpc3BsYXksIFJhbmRvbUNhdEltYWdlU2xpZGVyIH0gPSByZXF1aXJlKCcuL2xpYnMvY2F0TGliJylcbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlDYXQoKSB7XG4gIGNvbnN0IGNhdCA9IG5ldyBSYW5kb21DYXRJbWFnZURpc3BsYXkoJ2Rpc3BsYXlEaXYnLCAnYXBpTGluaycpXG4gIGF3YWl0IGNhdC5kaXNwbGF5Q2F0KClcbn1cbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlDYXRTbGlkZXIoKSB7XG4gIGNvbnN0IHNsaWRlciA9IG5ldyBSYW5kb21DYXRJbWFnZVNsaWRlcignZGlzcGxheURpdicsICdhcGlMaW5rJylcbiAgYXdhaXQgc2xpZGVyLmRpc3BsYXkoKVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJ3ZWF0aGVyXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua2V4YW1wbGVcIl0gPSBzZWxmW1wid2VicGFja0NodW5rZXhhbXBsZVwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1wic3JjX3Njc3Nfc3R5bGVfc2Nzc1wiLFwic3JjX2pzX2xpYnNfY2F0TGliX2pzXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2pzL3dlYXRoZXIuanNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==