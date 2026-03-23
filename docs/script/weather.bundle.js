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
    for (let i = 1; i < data.name.length - 1; i++) {
      const isDaytime = data.isDaytime[i]
      if (!isDaytime) {
        continue
      } else {
        const forecastDay = document.createElement('div')
        forecastDay.classList.add('day-card')
        forecastDay.setAttribute('title', `${data.name[i]}: ${data.forecast[i]}`)
        forecastDay.innerHTML = `
          <span class="day">${data.name[i].substring(0, 3)}</span>
          <span class="rain">${data.rain[i]}%</span>
          <img src="${data.icon[i]}" alt="icon" height="auto" width="75%">
          <span class="hi">${data.temperature[i]}&degF</span>
          <span class="lo">${data.temperature[i + 1]}&degF</span>
        `
        forecastFragment.appendChild(forecastDay)
      }
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9jc3Mvd2VhdGhlci5jc3M/YTY5YiIsIndlYnBhY2s6Ly9leGFtcGxlLy4vc3JjL2pzL2xpYnMvZm9yZWNhc3RMaWIuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9saWJzL3dlYXRoZXIuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy91dGlscy9zdGF0dXMuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy93ZWF0aGVyLmpzIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiY29uc3QgTGlua1V0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlscy9saW5rJylcbmNvbnN0IHsgR2VvTG9jYXRpb25VdGlsaXR5LCBXZWF0aGVyVXRpbGl0eSwgY3JlYXRlTGluZSwgY3JlYXRlSWNvbiB9ID0gcmVxdWlyZSgnLi93ZWF0aGVyJylcblxuY2xhc3MgTmF0aW9uYWxXZWF0aGVyU2VydmljZUFQSSB7XG4gIExJTksgPSB7XG4gICAgdGl0bGU6ICdOYXRpb25hbCBXZWF0aGVyIFNlcnZpY2UnLFxuICAgIHRhcmdldDogJ2h0dHBzOi8vd3d3LndlYXRoZXIuZ292JyxcbiAgfVxuICBBUElfVVJMID0gJ2h0dHBzOi8vYXBpLndlYXRoZXIuZ292J1xuICBlbmRwb2ludHNcbiAgbG9jYXRpb25OYW1lXG4gIHBvaW50XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW5kcG9pbnRzID0geyBmb3JlY2FzdEhvdXJseTogJycsIGZvcmVjYXN0OiAnJyB9XG4gICAgdGhpcy5sb2NhdGlvbk5hbWUgPSAnJ1xuICAgIHRoaXMucG9pbnQgPSAnJ1xuICB9XG4gIGFzeW5jIGdldENvb3JkcygpIHtcbiAgICBjb25zdCBjb29yZHMgPSBhd2FpdCBHZW9Mb2NhdGlvblV0aWxpdHkuZ2V0Q29vcmRpbmF0ZXMoKVxuICAgIHJldHVybiB7IGxhdGl0dWRlOiBjb29yZHMubGF0aXR1ZGUsIGxvbmdpdHVkZTogY29vcmRzLmxvbmdpdHVkZSB9XG4gIH1cbiAgYXN5bmMgZmV0Y2hEYXRhKHVybCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBXZWF0aGVyVXRpbGl0eS5mZXRjaERhdGEodXJsKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbiAgYXN5bmMgZmV0Y2hQb2ludHMobGF0LCBsb25nLCBsb2cpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaERhdGEoYCR7dGhpcy5BUElfVVJMfS9wb2ludHMvJHtsYXR9LCR7bG9uZ31gKVxuICAgIGlmIChsb2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQb2ludHM6ICcsIGRhdGEuaWQpXG4gICAgfVxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wZXJ0aWVzXG4gICAgdGhpcy5lbmRwb2ludHMgPSB7IGZvcmVjYXN0SG91cmx5OiBwcm9wcy5mb3JlY2FzdEhvdXJseSwgZm9yZWNhc3Q6IHByb3BzLmZvcmVjYXN0IH1cbiAgICBjb25zdCBsb2NhdGlvbkRhdGEgPSBwcm9wcy5yZWxhdGl2ZUxvY2F0aW9uLnByb3BlcnRpZXNcbiAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IGAke2xvY2F0aW9uRGF0YS5jaXR5fSwgJHtsb2NhdGlvbkRhdGEuc3RhdGV9YFxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcHJvcHMucmVsYXRpdmVMb2NhdGlvbi5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgIHRoaXMucG9pbnQgPSBgJHtjb29yZGluYXRlc1sxXS50b0ZpeGVkKDQpfSwke2Nvb3JkaW5hdGVzWzBdLnRvRml4ZWQoNCl9YFxuICB9XG4gIGFzeW5jIGZldGNoQ3VycmVudFdlYXRoZXIoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKHRoaXMuZW5kcG9pbnRzLmZvcmVjYXN0SG91cmx5KVxuICAgIGNvbnN0IGN1cnJlbnQgPSBkYXRhLnByb3BlcnRpZXMucGVyaW9kc1swXVxuICAgIGNvbnN0IGNoYXJ0ID0gZGF0YS5wcm9wZXJ0aWVzLnBlcmlvZHMuc2xpY2UoMSwgMjUpXG4gICAgY29uc3QgdGVtcGVyYXR1cmUgPSBjaGFydC5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKVxuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbjogdGhpcy5sb2NhdGlvbk5hbWUsXG4gICAgICBkYXRlOiBXZWF0aGVyVXRpbGl0eS5mb3JtYXREYXRlKGN1cnJlbnQuc3RhcnRUaW1lKSxcbiAgICAgIHRlbXBlcmF0dXJlOiBgJHtjdXJyZW50LnRlbXBlcmF0dXJlfcKwJHtjdXJyZW50LnRlbXBlcmF0dXJlVW5pdH1gLFxuICAgICAgd2luZDogYCR7Y3VycmVudC53aW5kU3BlZWR9ICR7Y3VycmVudC53aW5kRGlyZWN0aW9ufWAsXG4gICAgICBmb3JlY2FzdDogY3VycmVudC5zaG9ydEZvcmVjYXN0LFxuICAgICAgaHVtaWRpdHk6IGAke2N1cnJlbnQucmVsYXRpdmVIdW1pZGl0eS52YWx1ZX0lIFJIYCxcbiAgICAgIGljb246IGN1cnJlbnQuaWNvbixcbiAgICAgIGNoYXJ0OiB7XG4gICAgICAgIHRlbXA6IHRlbXBlcmF0dXJlLFxuICAgICAgICByb29tOiBBcnJheSh0ZW1wZXJhdHVyZS5sZW5ndGgpLmZpbGwoNzIpLFxuICAgICAgICBtaW46IE1hdGgubWluKC4uLnRlbXBlcmF0dXJlLCA3MikgLSA1LFxuICAgICAgICBtYXg6IE1hdGgubWF4KC4uLnRlbXBlcmF0dXJlLCA3MikgKyA1LFxuICAgICAgICByYWluOiBjaGFydC5tYXAocCA9PiBwLnByb2JhYmlsaXR5T2ZQcmVjaXBpdGF0aW9uLnZhbHVlKSxcbiAgICAgICAgdGltZTogY2hhcnQubWFwKHAgPT4gV2VhdGhlclV0aWxpdHkuZm9ybWF0VGltZShwLmVuZFRpbWUpKSxcbiAgICAgICAgaHVtOiBjaGFydC5tYXAocCA9PiBwLnJlbGF0aXZlSHVtaWRpdHkudmFsdWUgfCAwKSxcbiAgICAgIH0sXG4gICAgfVxuICB9XG4gIGFzeW5jIGZldGNoRm9yZWNhc3RXZWF0aGVyKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoRGF0YSh0aGlzLmVuZHBvaW50cy5mb3JlY2FzdClcbiAgICBjb25zdCBmb3JlY2FzdCA9IGRhdGEucHJvcGVydGllcy5wZXJpb2RzXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2F0aW9uOiB0aGlzLmxvY2F0aW9uTmFtZSxcbiAgICAgIGlzRGF5dGltZTogZm9yZWNhc3QubWFwKHAgPT4gcC5pc0RheXRpbWUpLFxuICAgICAgbmFtZTogZm9yZWNhc3QubWFwKHAgPT4gcC5uYW1lKSxcbiAgICAgIHRlbXBlcmF0dXJlOiBmb3JlY2FzdC5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKSxcbiAgICAgIHdpbmQ6IGZvcmVjYXN0Lm1hcChwID0+IGAke3Aud2luZFNwZWVkfSAke3Aud2luZERpcmVjdGlvbn1gKSxcbiAgICAgIGZvcmVjYXN0OiBmb3JlY2FzdC5tYXAocCA9PiBwLmRldGFpbGVkRm9yZWNhc3QpLFxuICAgICAgcmFpbjogZm9yZWNhc3QubWFwKHAgPT4gcC5wcm9iYWJpbGl0eU9mUHJlY2lwaXRhdGlvbi52YWx1ZSB8IDApLFxuICAgICAgaWNvbjogZm9yZWNhc3QubWFwKHAgPT4gcC5pY29uKSxcbiAgICAgIGNoYXJ0OiBzZXRzZXZlbkRheUNoYXJ0RGF0YShmb3JlY2FzdCksXG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldHNldmVuRGF5Q2hhcnREYXRhKGZvcmVjYXN0KSB7XG4gICAgICBjb25zdCBEYXl0aW1lID0gZm9yZWNhc3QuZmlsdGVyKHAgPT4gcC5pc0RheXRpbWUpXG4gICAgICBjb25zdCBOaWdodHRpbWUgPSBmb3JlY2FzdC5maWx0ZXIocCA9PiAhcC5pc0RheXRpbWUpXG4gICAgICBjb25zdCBoaWdoID0gRGF5dGltZS5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKVxuICAgICAgY29uc3QgbWF4ID0gTWF0aC5tYXgoLi4uaGlnaCkgKyA1XG4gICAgICBjb25zdCBsb3cgPSBOaWdodHRpbWUubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSlcbiAgICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKC4uLmxvdywgNzIpIC0gNVxuICAgICAgY29uc3Qgcm9vbSA9IEFycmF5KGhpZ2gubGVuZ3RoKS5maWxsKDcyKVxuICAgICAgY29uc3QgdGVtcCA9IHsgaGlnaCwgbG93LCByb29tLCBtYXgsIG1pbiB9XG4gICAgICBjb25zdCByYWluID0gRGF5dGltZS5tYXAocCA9PiBwLnByb2JhYmlsaXR5T2ZQcmVjaXBpdGF0aW9uLnZhbHVlID8/IDApXG4gICAgICBjb25zdCBkYXlzID0gRGF5dGltZS5tYXAocCA9PiBwLm5hbWUpXG4gICAgICByZXR1cm4geyB0ZW1wLCByYWluLCBkYXlzIH1cbiAgICB9XG4gIH1cbiAgYXN5bmMgZmV0Y2hBbGVydHMoKSB7XG4gICAgY29uc3QgYWxlcnRzVVJJID0gYCR7dGhpcy5BUElfVVJMfS9hbGVydHMvYWN0aXZlP3BvaW50PSR7dGhpcy5wb2ludH1gXG4gICAgY29uc3QgYWxlcnRzID0gYXdhaXQgdGhpcy5mZXRjaERhdGEoYWxlcnRzVVJJKVxuICAgIHJldHVybiBhbGVydHMuZmVhdHVyZXNcbiAgfVxufVxuXG5jbGFzcyBXZWF0aGVyQ2hhcnRKUyB7XG4gIHR4dCA9ICcjY2NjJ1xuICBiZ0NvbG9yID0gJyMzMzMnXG4gIGdyaWRDb2xvciA9ICcjNTU1J1xuICBsaW5lQ29sb3IgPSB7XG4gICAgQmx1ZTogJyMzNkEyRUInLFxuICAgIFJlZDogJyNGRjYzODQnLFxuICAgIE9yYW5nZTogJyNGRjlGNDAnLFxuICAgIFllbGxvdzogJyNGRkNENTYnLFxuICAgIEdyZWVuOiAnIzRCQzBDMCcsXG4gICAgUHVycGxlOiAnIzk5NjZGRicsXG4gICAgR3JleTogJyNDOUNCQ0UnLFxuICB9XG4gIGNoYXJ0RElWXG4gIGN0eFxuICBjb25zdHJ1Y3RvcihjaGFydElEKSB7XG4gICAgdGhpcy5jaGFydERJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYXJ0SUQpXG4gICAgY29uc3QgY2FudmFzSUQgPSBgJHtjaGFydElEfUNUWGBcbiAgICB0aGlzLmNoYXJ0RElWLmlubmVySFRNTCA9IGA8ZGl2PjxjYW52YXMgaWQ9JyR7Y2FudmFzSUR9Jz48L2NhbnZhcz48L2Rpdj5gXG4gICAgdGhpcy5jdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJRClcbiAgfVxuICBkaXNwbGF5Q2hhcnQoZGF0YSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgQ2hhcnQgfSA9IHdpbmRvd1xuICAgIENoYXJ0LmRlZmF1bHRzLmNvbG9yID0gdGhpcy50eHRcbiAgICB0aGlzLmN0eC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJnQ29sb3JcbiAgICBjb25zdCBjb25maWcgPSB7IHR5cGU6ICdsaW5lJywgZGF0YSwgb3B0aW9ucyB9XG4gICAgY29uc3QgdGVtcGVyYXR1cmVDaGFydCA9IG5ldyBDaGFydCh0aGlzLmN0eCwgY29uZmlnKVxuICAgIHRoaXMuc2V0Q2hhcnRXaWR0aCh0ZW1wZXJhdHVyZUNoYXJ0KVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldENoYXJ0V2lkdGgodGVtcGVyYXR1cmVDaGFydClcbiAgICB9KVxuICB9XG4gIHNldENoYXJ0V2lkdGgod2VhdGhlckNoYXJ0KSB7XG4gICAgY29uc3QgY2hhcnRTdHlsZSA9IHdlYXRoZXJDaGFydC5jYW52YXMucGFyZW50Tm9kZS5zdHlsZVxuICAgIGNoYXJ0U3R5bGUubWFyZ2luID0gJ2F1dG8nXG4gICAgY29uc3Qgc2NyZWVuV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHdlYXRoZXJDaGFydC5yZXNpemUoc2NyZWVuV2lkdGgsICdhdXRvJylcbiAgICBjaGFydFN0eWxlLndpZHRoID0gJzEwMCUnXG4gIH1cbiAgc2V0N0RheUNoYXJ0KGNoYXJ0RGF0YSwgbG9jYXRpb25OYW1lKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2V0N0RheURhdGEoY2hhcnREYXRhKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnNldDdEYXlPcHRpb25zKGxvY2F0aW9uTmFtZSlcbiAgICB0aGlzLmRpc3BsYXlDaGFydChkYXRhLCBvcHRpb25zKVxuICB9XG4gIHNldDdEYXlEYXRhKGNoYXJ0RGF0YSkge1xuICAgIGNvbnN0IGhpZ2hEYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgbGFiZWw6ICdIaWdocycsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuUmVkLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgICBkYXRhOiBjaGFydERhdGEudGVtcC5oaWdoLFxuICAgIH1cbiAgICBjb25zdCBsb3dEYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgbGFiZWw6ICdMb3dzJyxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5CbHVlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgICBkYXRhOiBjaGFydERhdGEudGVtcC5sb3csXG4gICAgfVxuICAgIGNvbnN0IHJvb21EYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgbGFiZWw6ICc3MlxcdTAwQjBGJyxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5HcmVlbixcbiAgICAgIHBvaW50UmFkaXVzOiAwLFxuICAgICAgZGF0YTogQXJyYXkoY2hhcnREYXRhLnRlbXAuaGlnaC5sZW5ndGgpLmZpbGwoNzIpLFxuICAgICAgYm9yZGVyRGFzaDogWzUsIDVdLFxuICAgIH1cbiAgICBjb25zdCByYWluRGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgbGFiZWw6ICdSYWluJyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5saW5lQ29sb3IuUHVycGxlLFxuICAgICAgYmFyVGhpY2tuZXNzOiAxNSxcbiAgICAgIGRhdGE6IGNoYXJ0RGF0YS5yYWluLFxuICAgICAgeUF4aXNJRDogJ3kyJyxcbiAgICB9XG4gICAgY29uc3QgZGF0YXNldHMgPSBbaGlnaERhdGFTZXQsIGxvd0RhdGFTZXQsIHJvb21EYXRhU2V0LCByYWluRGF0YVNldF1cbiAgICByZXR1cm4geyBsYWJlbHM6IGNoYXJ0RGF0YS5kYXlzLCBkYXRhc2V0cyB9XG4gIH1cbiAgc2V0N0RheU9wdGlvbnMobG9jYXRpb24pIHtcbiAgICBjb25zdCBuYW1lID0gJ1dlYXRoZXIgRm9yZWNhc3QnXG4gICAgY29uc3QgdGl0bGUgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6IG5hbWUsIGNvbG9yOiB0aGlzLnR4dCwgZm9udDogeyBzaXplOiAxOCB9IH1cbiAgICBjb25zdCBzdWJ0aXRsZSA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogbG9jYXRpb24sIGNvbG9yOiB0aGlzLnR4dCwgZm9udDogeyBzaXplOiAxNiB9IH1cbiAgICBjb25zdCBwbHVnaW5zID0geyB0aXRsZSwgc3VidGl0bGUgfVxuICAgIGNvbnN0IGdyaWQgPSB7IGRpc3BsYXk6IHRydWUsIGNvbG9yOiB0aGlzLmdyaWRDb2xvciB9XG4gICAgY29uc3Qgc2NhbGVYID0geyB0aXRsZTogeyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnRGF5IG9mIHRoZSBXZWVrJyB9LCBncmlkIH1cbiAgICBjb25zdCBzY2FsZVkgPSB7XG4gICAgICB0aXRsZTogeyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnVGVtcGVyYXR1cmUgKFxcdTAwQjBGKScgfSxcbiAgICAgIGdyaWQsXG4gICAgICBwb3NpdGlvbjogJ2xlZnQnLFxuICAgIH1cbiAgICBjb25zdCBzY2FsZVkyID0ge1xuICAgICAgdGl0bGU6IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1BlcmNlbnQgKCUpJyB9LFxuICAgICAgZ3JpZCxcbiAgICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICB9XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgcGx1Z2lucywgc2NhbGVzOiB7IHg6IHNjYWxlWCwgeTogc2NhbGVZLCB5Mjogc2NhbGVZMiB9IH1cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG4gIHNldDI0SHJDaGFydChjaGFydERhdGEpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5zZXQyNEhyRGF0YShjaGFydERhdGEpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZ2V0MjRIck9wdGlvbnMoKVxuICAgIHRoaXMuZGlzcGxheUNoYXJ0KGRhdGEsIG9wdGlvbnMpXG4gIH1cbiAgZ2V0MjRIck9wdGlvbnMoKSB7XG4gICAgY29uc3QgbmFtZSA9ICcyNCBIb3VyIEZvcmVjYXN0J1xuICAgIGNvbnN0IHRpdGxlID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiBuYW1lLCBjb2xvcjogdGhpcy50eHQsIGZvbnQ6IHsgc2l6ZTogMTYgfSB9XG4gICAgY29uc3QgZ3JpZCA9IHsgZGlzcGxheTogdHJ1ZSwgY29sb3I6IHRoaXMuZ3JpZENvbG9yIH1cbiAgICBjb25zdCB0aXRsZVggPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdUaW1lJyB9XG4gICAgY29uc3Qgc2NhbGVYID0geyB0aXRsZTogdGl0bGVYLCBncmlkIH1cbiAgICBjb25zdCB0aXRsZVkgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdUZW1wZXJhdHVyZSAoXFx1MDBCMEYpJyB9XG4gICAgY29uc3Qgc2NhbGVZID0geyB0aXRsZTogdGl0bGVZLCBncmlkLCBwb3NpdGlvbjogJ2xlZnQnIH1cbiAgICBjb25zdCB0aXRsZVkyID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnUGVyY2VudCAoJSknIH1cbiAgICBjb25zdCBzY2FsZVkyID0ge1xuICAgICAgdGl0bGU6IHRpdGxlWTIsXG4gICAgICBncmlkLFxuICAgICAgcG9zaXRpb246ICdyaWdodCcsXG4gICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgIG1heDogMTAwLFxuICAgIH1cbiAgICByZXR1cm4geyBwbHVnaW5zOiB7IHRpdGxlIH0sIHNjYWxlczogeyB4OiBzY2FsZVgsIHk6IHNjYWxlWSwgeTI6IHNjYWxlWTIgfSB9XG4gIH1cbiAgc2V0MjRIckRhdGEoZGF0YSkge1xuICAgIGNvbnN0IHRlbXAgPSB7XG4gICAgICBsYWJlbDogJ1RlbXBlcmF0dXJlJyxcbiAgICAgIGRhdGE6IGRhdGEudGVtcCxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5PcmFuZ2UsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICB9XG4gICAgY29uc3Qgcm9vbSA9IHtcbiAgICAgIGxhYmVsOiAnNzLCsEYnLFxuICAgICAgZGF0YTogZGF0YS5yb29tLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLkdyZWVuLFxuICAgICAgcG9pbnRSYWRpdXM6IDAsXG4gICAgICBib3JkZXJEYXNoOiBbNSwgNV0sXG4gICAgfVxuICAgIGNvbnN0IHJhaW4gPSB7XG4gICAgICBsYWJlbDogJ1JhaW4nLFxuICAgICAgZGF0YTogZGF0YS5yYWluLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLkJsdWUsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICAgIHlBeGlzSUQ6ICd5MicsXG4gICAgfVxuICAgIGNvbnN0IGh1bSA9IHtcbiAgICAgIGxhYmVsOiAnSHVtaWRpdHknLFxuICAgICAgZGF0YTogZGF0YS5odW0sXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuUHVycGxlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgfVxuICAgIHJldHVybiB7IGxhYmVsczogZGF0YS50aW1lLCBkYXRhc2V0czogW3RlbXAsIHJvb20sIHJhaW4sIGh1bV0gfVxuICB9XG59XG5cbmNvbnN0IE5XUyA9IG5ldyBOYXRpb25hbFdlYXRoZXJTZXJ2aWNlQVBJKClcblxuY2xhc3MgV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXkgZXh0ZW5kcyBMaW5rVXRpbGl0eSB7XG4gIGRpc3BsYXlESVZcbiAgd2VhdGhlckRpdkxlZnRcbiAgd2VhdGhlckRpdlJpZ2h0XG4gIHdlYXRoZXJBbGVydHNcbiAgd2Vla0ZvcmVjYXN0XG4gIHNldmVuRGF5Q2hhcnRcbiAgdHdlbnR5Zm91cmhvdXJDaGFydFxuICBGaXhlZENvb3JkcyA9IHsgbGF0aXR1ZGU6IDI2LjMwODUsIGxvbmdpdHVkZTogLTk4LjEwMTYgfVxuICBjb25zdHJ1Y3RvcihkaXNwbGF5SWQsIGxpbmtJZCkge1xuICAgIHN1cGVyKGxpbmtJZClcbiAgICBzdXBlci5zZXRMaW5rKE5XUy5MSU5LLnRpdGxlLCBOV1MuTElOSy50YXJnZXQsIHRydWUpXG4gICAgdGhpcy5kaXNwbGF5RElWID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGlzcGxheUlkKVxuICAgIGNvbnN0IFRFTVBMQVRFID0gYFxuICAgICAgPGRpdiBpZD1cIndlYXRoZXJDb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGlkPSd3ZWF0aGVyRGl2TGVmdCc+PC9kaXY+PGRpdiBpZD0nd2VhdGhlckRpdlJpZ2h0Jz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBpZD1cImFsZXJ0c0lkXCI+PC9kaXY+XFxuPGRpdiBpZD1cImZvcmVjYXN0RGl2XCI+XFxuPC9kaXY+XG4gICAgICA8ZGl2IGlkPVwiY2hhcnRPbmVEaXZcIj48L2Rpdj48ZGl2IGlkPVwiY2hhcnRUd29EaXZcIj48L2Rpdj5cbiAgICAgIGBcbiAgICB0aGlzLmRpc3BsYXlESVYuaW5uZXJIVE1MID0gVEVNUExBVEVcbiAgICB0aGlzLndlYXRoZXJEaXZMZWZ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dlYXRoZXJEaXZMZWZ0JylcbiAgICB0aGlzLndlYXRoZXJEaXZSaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWF0aGVyRGl2UmlnaHQnKVxuICAgIHRoaXMud2VhdGhlckFsZXJ0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGVydHNJZCcpXG4gICAgdGhpcy53ZWVrRm9yZWNhc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9yZWNhc3REaXYnKVxuICAgIHRoaXMuc2V2ZW5EYXlDaGFydCA9IG5ldyBXZWF0aGVyQ2hhcnRKUygnY2hhcnRPbmVEaXYnKVxuICAgIHRoaXMudHdlbnR5Zm91cmhvdXJDaGFydCA9IG5ldyBXZWF0aGVyQ2hhcnRKUygnY2hhcnRUd29EaXYnKVxuICB9XG4gIGFzeW5jIHNldERpc3BsYXkodXNlR2VvTG9jYXRpb24pIHtcbiAgICBsZXQgY29vcmRzID0gdGhpcy5GaXhlZENvb3Jkc1xuICAgIGlmICh1c2VHZW9Mb2NhdGlvbikge1xuICAgICAgY29vcmRzID0gKGF3YWl0IE5XUy5nZXRDb29yZHMoKSkgfHwgY29vcmRzXG4gICAgfVxuICAgIGF3YWl0IE5XUy5mZXRjaFBvaW50cyhjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGUpXG4gICAgY29uc29sZS5sb2coYERpc3BsYXlpbmcgJHtOV1MubG9jYXRpb25OYW1lfTogJHtOV1MuZW5kcG9pbnRzLmZvcmVjYXN0fSFgKVxuICAgIGF3YWl0IHRoaXMuc2V0Q3VycmVudFdlYXRoZXIoKVxuICAgIGF3YWl0IHRoaXMuc2V0Rm9yZWNhc3RBbmRDaGFydCgpXG4gICAgYXdhaXQgdGhpcy5zZXRBY3RpdmVBbGVydHMoKVxuICB9XG4gIGFzeW5jIHNldEN1cnJlbnRXZWF0aGVyKCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBOV1MuZmV0Y2hDdXJyZW50V2VhdGhlcigpXG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmRhdGUsIDEuMSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmxvY2F0aW9uLCAxLjQpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC50ZW1wZXJhdHVyZSwgMykpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LndpbmQsIDEuNSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmZvcmVjYXN0LCAxKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQuaHVtaWRpdHksIDEpKVxuICAgIHRoaXMud2VhdGhlckRpdkxlZnQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpXG4gICAgdGhpcy50d2VudHlmb3VyaG91ckNoYXJ0LnNldDI0SHJDaGFydChjdXJyZW50LmNoYXJ0KVxuICB9XG4gIGFzeW5jIHNldEZvcmVjYXN0QW5kQ2hhcnQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IE5XUy5mZXRjaEZvcmVjYXN0V2VhdGhlcigpXG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShkYXRhLm5hbWVbMF0sIDEuMikpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlSWNvbihkYXRhLmljb25bMF0sIGRhdGEuZm9yZWNhc3RbMF0pKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoYCR7ZGF0YS50ZW1wZXJhdHVyZVswXX0mZGVnO0ZgLCAwLjgpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoZGF0YS53aW5kWzBdLCAwLjgpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoYCR7ZGF0YS5yYWluWzBdfSUgQ2hhbmNlIFJhaW5gLCAwLjgpKVxuICAgIHRoaXMud2VhdGhlckRpdlJpZ2h0LmFwcGVuZENoaWxkKGZyYWdtZW50KVxuXG4gICAgY29uc3QgZm9yZWNhc3RGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgZGF0YS5uYW1lLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgY29uc3QgaXNEYXl0aW1lID0gZGF0YS5pc0RheXRpbWVbaV1cbiAgICAgIGlmICghaXNEYXl0aW1lKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3JlY2FzdERheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIGZvcmVjYXN0RGF5LmNsYXNzTGlzdC5hZGQoJ2RheS1jYXJkJylcbiAgICAgICAgZm9yZWNhc3REYXkuc2V0QXR0cmlidXRlKCd0aXRsZScsIGAke2RhdGEubmFtZVtpXX06ICR7ZGF0YS5mb3JlY2FzdFtpXX1gKVxuICAgICAgICBmb3JlY2FzdERheS5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJkYXlcIj4ke2RhdGEubmFtZVtpXS5zdWJzdHJpbmcoMCwgMyl9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwicmFpblwiPiR7ZGF0YS5yYWluW2ldfSU8L3NwYW4+XG4gICAgICAgICAgPGltZyBzcmM9XCIke2RhdGEuaWNvbltpXX1cIiBhbHQ9XCJpY29uXCIgaGVpZ2h0PVwiYXV0b1wiIHdpZHRoPVwiNzUlXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJoaVwiPiR7ZGF0YS50ZW1wZXJhdHVyZVtpXX0mZGVnRjwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxvXCI+JHtkYXRhLnRlbXBlcmF0dXJlW2kgKyAxXX0mZGVnRjwvc3Bhbj5cbiAgICAgICAgYFxuICAgICAgICBmb3JlY2FzdEZyYWdtZW50LmFwcGVuZENoaWxkKGZvcmVjYXN0RGF5KVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLndlZWtGb3JlY2FzdC5hcHBlbmRDaGlsZChmb3JlY2FzdEZyYWdtZW50KVxuICAgIHRoaXMuc2V2ZW5EYXlDaGFydC5zZXQ3RGF5Q2hhcnQoZGF0YS5jaGFydCwgZGF0YS5sb2NhdGlvbilcbiAgfVxuICBhc3luYyBzZXRBY3RpdmVBbGVydHMoKSB7XG4gICAgY29uc3QgYWxlcnREYXRhID0gYXdhaXQgTldTLmZldGNoQWxlcnRzKClcbiAgICBpZiAoYWxlcnREYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coYE5vIGFjdGl2ZSBhbGVydHMgZm91bmQuYClcbiAgICB9XG4gICAgZm9yIChjb25zdCBmZWF0dXJlIG9mIGFsZXJ0RGF0YSkge1xuICAgICAgY29uc3QgYWxlcnRUaXRsZSA9IGAke2ZlYXR1cmUubWVzc2FnZVR5cGV9OiAke2ZlYXR1cmUuZXZlbnR9IC8gJHtmZWF0dXJlLnNldmVyaXR5fWBcbiAgICAgIGNvbnN0IGluZm9ybWF0aW9uID0gYCR7ZmVhdHVyZS5kZXNjcmlwdGlvbn1cXG4ke2ZlYXR1cmUuaW5zdHJ1Y3Rpb24gfHwgJyd9YFxuICAgICAgY29uc3QgYWxlcnRNZXNzYWdlID0gYCR7ZmVhdHVyZS5oZWFkbGluZX1cXG4ke2luZm9ybWF0aW9ufWBcbiAgICAgIGlmIChmZWF0dXJlLnN0YXR1cyA9PT0gJ0FjdHVhbCcpIHtcbiAgICAgICAgY29uc3Qgd2VhdGhlckFsZXJ0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgd2VhdGhlckFsZXJ0LnNldEF0dHJpYnV0ZSgndGl0bGUnLCBmZWF0dXJlLmhlYWRsaW5lKVxuICAgICAgICB3ZWF0aGVyQWxlcnQuc3R5bGUucGFkZGluZyA9ICc1cHgnXG4gICAgICAgIHdlYXRoZXJBbGVydC5pbm5lckhUTUwgPSBhbGVydFRpdGxlXG4gICAgICAgIHdlYXRoZXJBbGVydC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgIGFsZXJ0KGFsZXJ0TWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndlYXRoZXJBbGVydHMuYXBwZW5kQ2hpbGQod2VhdGhlckFsZXJ0KVxuICAgICAgfVxuICAgICAgdGhpcy5sb2dBY3RpdmVBbGVydHMoZmVhdHVyZSwgYWxlcnRUaXRsZSwgaW5mb3JtYXRpb24pXG4gICAgfVxuICB9XG4gIGxvZ0FjdGl2ZUFsZXJ0cyhmZWF0dXJlLCBhbGVydFRpdGxlLCBpbmZvcm1hdGlvbikge1xuICAgIGNvbnNvbGUuZ3JvdXAoYWxlcnRUaXRsZSlcbiAgICBjb25zb2xlLmxvZyhgU3RhdHVzOiAke2ZlYXR1cmUuc3RhdHVzfWApXG4gICAgY29uc29sZS5ncm91cENvbGxhcHNlZChmZWF0dXJlLmhlYWRsaW5lKVxuICAgIGNvbnNvbGUuaW5mbyhpbmZvcm1hdGlvbilcbiAgICBjb25zb2xlLmxvZyhgVXJnZW5jeTogJHtmZWF0dXJlLnVyZ2VuY3l9IC8gQ2VydGFpbnR5OiAke2ZlYXR1cmUuY2VydGFpbnR5fWApXG4gICAgY29uc29sZS5ncm91cEVuZCgpXG4gICAgY29uc29sZS5ncm91cEVuZCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXZWF0aGVyRm9yZWNhc3REYXRhRGlzcGxheVxuIiwiY2xhc3MgR2VvTG9jYXRpb25VdGlsaXR5IHtcbiAgc3RhdGljIGFzeW5jIGdldENvb3JkaW5hdGVzKCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGVuYWJsZUhpZ2hBY2N1cmFjeTogZmFsc2UsIHRpbWVvdXQ6IDUwMDAsIG1heGltdW1BZ2U6IDAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdWNjZXNzID0gcG9zaXRpb24gPT4ge1xuICAgICAgICByZXNvbHZlKHBvc2l0aW9uLmNvb3JkcylcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVycm9yID0gZXJyb3IgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKVxuICAgICAgfVxuICAgICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignR2VvbG9jYXRpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYnJvd3Nlci4nKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oc3VjY2VzcywgZXJyb3IsIG9wdGlvbnMpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBzdGF0aWMgZ2V0TG9jYWxlcygpIHtcbiAgICBpZiAoIW5hdmlnYXRvci5sYW5ndWFnZXMpIHtcbiAgICAgIHJldHVybiAnZW4tVVMnXG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubGFuZ3VhZ2VzXG4gIH1cbn1cblxuY2xhc3MgV2VhdGhlclV0aWxpdHkge1xuICBzdGF0aWMgYXN5bmMgZmV0Y2hEYXRhKGVuZHBvaW50KSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChlbmRwb2ludClcbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoeyAnVXNlci1BZ2VudCc6ICdodHRwczovL2dpdGh1Yi5jb20vZmVsaXh0aGVjYXQ4YScgfSlcbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLCB7IGhlYWRlcnMgfSlcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJlcXVlc3QpXG4gICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGAke3Jlc3BvbnNlLnN0YXR1c30gRGF0YSBOb3QgRm91bmQ6ICR7cmVzcG9uc2UudXJsfWApXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbiAgc3RhdGljIGZvcm1hdERhdGUoZGF0ZVRpbWUpIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVRpbWUpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgZGF0ZVN0eWxlOiAnZnVsbCcgfVxuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChHZW9Mb2NhdGlvblV0aWxpdHkuZ2V0TG9jYWxlcygpLCBvcHRpb25zKS5mb3JtYXQoZGF0ZSlcbiAgfVxuICBzdGF0aWMgZm9ybWF0VGltZShkYXRlVGltZSkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShkYXRlVGltZSlcbiAgICBjb25zdCBvcHRpb25zID0geyB0aW1lU3R5bGU6ICdzaG9ydCcgfVxuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChHZW9Mb2NhdGlvblV0aWxpdHkuZ2V0TG9jYWxlcygpLCBvcHRpb25zKS5mb3JtYXQoZGF0ZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5lKGNvbnRlbnQsIHNpemUpIHtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGl2LnN0eWxlLmZvbnRTaXplID0gYCR7c2l6ZX1yZW1gXG4gIGRpdi5pbm5lckhUTUwgPSBjb250ZW50XG4gIHJldHVybiBkaXZcbn1cblxuZnVuY3Rpb24gY3JlYXRlSWNvbihzcmMsIHRpdGxlKSB7XG4gIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIHNyYylcbiAgaW1nLnNldEF0dHJpYnV0ZSgndGl0bGUnLCB0aXRsZSlcbiAgaW1nLnNldEF0dHJpYnV0ZSgnYWx0JywgJ2ljb24nKVxuICByZXR1cm4gaW1nXG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBHZW9Mb2NhdGlvblV0aWxpdHksIFdlYXRoZXJVdGlsaXR5LCBjcmVhdGVMaW5lLCBjcmVhdGVJY29uIH1cbiIsImNsYXNzIFN0YXR1c1V0aWxpdHkge1xuICBzdGF0dXNESVZcbiAgY29uc3RydWN0b3Ioc3RhdHVzRGl2RWxlbWVudElkKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0YXR1c0RpdkVsZW1lbnRJZClcbiAgICBpZiAoIWVsZW1lbnQgfHwgIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFN0YXR1cyBEaXYgRWxlbWVudCBOb3QgRm91bmQgb3IgTm90IGEgRElWYClcbiAgICB9XG4gICAgdGhpcy5zdGF0dXNESVYgPSBlbGVtZW50XG4gIH1cbiAgc2V0U3RhdHVzKHN0YXR1cykge1xuICAgIHRoaXMuc3RhdHVzRElWLnRleHRDb250ZW50ID0gc3RhdHVzID8/ICcnXG4gIH1cbiAgY2xlYXJTdGF0dXMoKSB7XG4gICAgdGhpcy5zdGF0dXNESVYudGV4dENvbnRlbnQgPSAnJ1xuICB9XG4gIHNldEVycm9yKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmNsZWFyU3RhdHVzKClcbiAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bhbi50ZXh0Q29udGVudCA9IG1lc3NhZ2VcbiAgICBzcGFuLnN0eWxlLmNvbG9yID0gJ3BhbGV2aW9sZXRyZWQnXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQoc3BhbilcbiAgfVxuICBzZXRMb2FkaW5nKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmNsZWFyU3RhdHVzKClcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpXG4gICAgY29uc3Qgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gJ3NwaW5uZXInXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQodGV4dE5vZGUpXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxuICBsb2FkV2VhdGhlcihtZXNzYWdlKSB7XG4gICAgdGhpcy5jbGVhclN0YXR1cygpXG4gICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKVxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGlubmVyLmNsYXNzTmFtZSA9ICdjbG91ZExvYWRlcidcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSlcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZChzcGlubmVyKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHVzVXRpbGl0eVxuIiwicmVxdWlyZSgnLi4vc2Nzcy9zdHlsZS5zY3NzJylcbnJlcXVpcmUoJy4uL2Nzcy93ZWF0aGVyLmNzcycpXG5jb25zdCBTdGF0dXNVdGlsaXR5ID0gcmVxdWlyZSgnLi91dGlscy9zdGF0dXMnKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KGZhbHNlKVxufSlcblxuY29uc3QgYXBpU0VMRUNUID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwaVNlbGVjdCcpXG5hcGlTRUxFQ1QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgZXZlbnQgPT4ge1xuICBjb25zdCBzdGF0dXNEaXYgPSBuZXcgU3RhdHVzVXRpbGl0eSgnc3RhdHVzRGl2JylcbiAgY29uc3Qgd2VhdGhlckxvY2F0aW9uID0gZXZlbnQudGFyZ2V0LnZhbHVlXG4gIHRyeSB7XG4gICAgc3dpdGNoICh3ZWF0aGVyTG9jYXRpb24pIHtcbiAgICAgIGNhc2UgJ3Nob3dEZWZhdWx0JzpcbiAgICAgICAgc3RhdHVzRGl2LmxvYWRXZWF0aGVyKCdMb2NhdGluZycpXG4gICAgICAgIGF3YWl0IGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QoZmFsc2UpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaG93Rm9yZWNhc3QnOlxuICAgICAgICBzdGF0dXNEaXYubG9hZFdlYXRoZXIoJ0xvY2F0aW5nJylcbiAgICAgICAgYXdhaXQgZGlzcGxheVdlYXRoZXJGb3JlY2FzdCh0cnVlKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnc2hvd0NhdCc6XG4gICAgICAgIHN0YXR1c0Rpdi5zZXRMb2FkaW5nKCdNZW93aW5nJylcbiAgICAgICAgYXdhaXQgZGlzcGxheUNhdCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaG93Q2F0U2xpZGVyJzpcbiAgICAgICAgc3RhdHVzRGl2LnNldExvYWRpbmcoJ01lb3dpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5Q2F0U2xpZGVyKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHN0YXR1c0Rpdi5jbGVhclN0YXR1cygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXdhaXQgZGlzcGxheVdlYXRoZXJGb3JlY2FzdChmYWxzZSlcbiAgICBzdGF0dXNEaXYuc2V0RXJyb3IoZXJyb3IpXG4gIH1cbn0pXG5cbmNvbnN0IFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5ID0gcmVxdWlyZSgnLi9saWJzL2ZvcmVjYXN0TGliJylcbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QodXNlR2VvTG9jYXRpb24pIHtcbiAgY29uc3QgZm9yZWNhc3QgPSBuZXcgV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXkoJ2Rpc3BsYXlEaXYnLCAnYXBpTGluaycpXG4gIGF3YWl0IGZvcmVjYXN0LnNldERpc3BsYXkodXNlR2VvTG9jYXRpb24pXG59XG5cbmNvbnN0IHsgUmFuZG9tQ2F0SW1hZ2VEaXNwbGF5LCBSYW5kb21DYXRJbWFnZVNsaWRlciB9ID0gcmVxdWlyZSgnLi9saWJzL2NhdExpYicpXG5hc3luYyBmdW5jdGlvbiBkaXNwbGF5Q2F0KCkge1xuICBjb25zdCBjYXQgPSBuZXcgUmFuZG9tQ2F0SW1hZ2VEaXNwbGF5KCdkaXNwbGF5RGl2JywgJ2FwaUxpbmsnKVxuICBhd2FpdCBjYXQuZGlzcGxheUNhdCgpXG59XG5hc3luYyBmdW5jdGlvbiBkaXNwbGF5Q2F0U2xpZGVyKCkge1xuICBjb25zdCBzbGlkZXIgPSBuZXcgUmFuZG9tQ2F0SW1hZ2VTbGlkZXIoJ2Rpc3BsYXlEaXYnLCAnYXBpTGluaycpXG4gIGF3YWl0IHNsaWRlci5kaXNwbGF5KClcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwid2VhdGhlclwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2V4YW1wbGVcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInNyY19zY3NzX3N0eWxlX3Njc3NcIixcInNyY19qc19saWJzX2NhdExpYl9qc1wiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy93ZWF0aGVyLmpzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=