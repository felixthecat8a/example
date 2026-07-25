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
    title: 'National Weather Service Data',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQSw0Rzs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4YW1wbGUvLi9zcmMvY3NzL3dlYXRoZXIuY3NzP2E2OWIiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9saWJzL2ZvcmVjYXN0TGliLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvbGlicy93ZWF0aGVyLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvdXRpbHMvc3RhdHVzLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvd2VhdGhlci5qcyIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsImNvbnN0IExpbmtVdGlsaXR5ID0gcmVxdWlyZSgnLi4vdXRpbHMvbGluaycpXG5jb25zdCB7IEdlb0xvY2F0aW9uVXRpbGl0eSwgV2VhdGhlclV0aWxpdHksIGNyZWF0ZUxpbmUsIGNyZWF0ZUljb24gfSA9IHJlcXVpcmUoJy4vd2VhdGhlcicpXG5cbmNsYXNzIE5hdGlvbmFsV2VhdGhlclNlcnZpY2VBUEkge1xuICBMSU5LID0ge1xuICAgIHRpdGxlOiAnTmF0aW9uYWwgV2VhdGhlciBTZXJ2aWNlIERhdGEnLFxuICAgIHRhcmdldDogJ2h0dHBzOi8vd3d3LndlYXRoZXIuZ292JyxcbiAgfVxuICBBUElfVVJMID0gJ2h0dHBzOi8vYXBpLndlYXRoZXIuZ292J1xuICBlbmRwb2ludHNcbiAgbG9jYXRpb25OYW1lXG4gIHBvaW50XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW5kcG9pbnRzID0geyBmb3JlY2FzdEhvdXJseTogJycsIGZvcmVjYXN0OiAnJyB9XG4gICAgdGhpcy5sb2NhdGlvbk5hbWUgPSAnJ1xuICAgIHRoaXMucG9pbnQgPSAnJ1xuICB9XG4gIGFzeW5jIGdldENvb3JkcygpIHtcbiAgICBjb25zdCBjb29yZHMgPSBhd2FpdCBHZW9Mb2NhdGlvblV0aWxpdHkuZ2V0Q29vcmRpbmF0ZXMoKVxuICAgIHJldHVybiB7IGxhdGl0dWRlOiBjb29yZHMubGF0aXR1ZGUsIGxvbmdpdHVkZTogY29vcmRzLmxvbmdpdHVkZSB9XG4gIH1cbiAgYXN5bmMgZmV0Y2hEYXRhKHVybCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBXZWF0aGVyVXRpbGl0eS5mZXRjaERhdGEodXJsKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbiAgYXN5bmMgZmV0Y2hQb2ludHMobGF0LCBsb25nLCBsb2cpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaERhdGEoYCR7dGhpcy5BUElfVVJMfS9wb2ludHMvJHtsYXR9LCR7bG9uZ31gKVxuICAgIGlmIChsb2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQb2ludHM6ICcsIGRhdGEuaWQpXG4gICAgfVxuICAgIGNvbnN0IHByb3BzID0gZGF0YS5wcm9wZXJ0aWVzXG4gICAgdGhpcy5lbmRwb2ludHMgPSB7IGZvcmVjYXN0SG91cmx5OiBwcm9wcy5mb3JlY2FzdEhvdXJseSwgZm9yZWNhc3Q6IHByb3BzLmZvcmVjYXN0IH1cbiAgICBjb25zdCBsb2NhdGlvbkRhdGEgPSBwcm9wcy5yZWxhdGl2ZUxvY2F0aW9uLnByb3BlcnRpZXNcbiAgICB0aGlzLmxvY2F0aW9uTmFtZSA9IGAke2xvY2F0aW9uRGF0YS5jaXR5fSwgJHtsb2NhdGlvbkRhdGEuc3RhdGV9YFxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gcHJvcHMucmVsYXRpdmVMb2NhdGlvbi5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgIHRoaXMucG9pbnQgPSBgJHtjb29yZGluYXRlc1sxXS50b0ZpeGVkKDQpfSwke2Nvb3JkaW5hdGVzWzBdLnRvRml4ZWQoNCl9YFxuICB9XG4gIGFzeW5jIGZldGNoQ3VycmVudFdlYXRoZXIoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKHRoaXMuZW5kcG9pbnRzLmZvcmVjYXN0SG91cmx5KVxuICAgIGNvbnN0IGN1cnJlbnQgPSBkYXRhLnByb3BlcnRpZXMucGVyaW9kc1swXVxuICAgIGNvbnN0IGNoYXJ0ID0gZGF0YS5wcm9wZXJ0aWVzLnBlcmlvZHMuc2xpY2UoMSwgMjUpXG4gICAgY29uc3QgdGVtcGVyYXR1cmUgPSBjaGFydC5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKVxuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbjogdGhpcy5sb2NhdGlvbk5hbWUsXG4gICAgICBkYXRlOiBXZWF0aGVyVXRpbGl0eS5mb3JtYXREYXRlKGN1cnJlbnQuc3RhcnRUaW1lKSxcbiAgICAgIHRlbXBlcmF0dXJlOiBgJHtjdXJyZW50LnRlbXBlcmF0dXJlfcKwJHtjdXJyZW50LnRlbXBlcmF0dXJlVW5pdH1gLFxuICAgICAgd2luZDogYCR7Y3VycmVudC53aW5kU3BlZWR9ICR7Y3VycmVudC53aW5kRGlyZWN0aW9ufWAsXG4gICAgICBmb3JlY2FzdDogY3VycmVudC5zaG9ydEZvcmVjYXN0LFxuICAgICAgaHVtaWRpdHk6IGAke2N1cnJlbnQucmVsYXRpdmVIdW1pZGl0eS52YWx1ZX0lIFJIYCxcbiAgICAgIGljb246IGN1cnJlbnQuaWNvbixcbiAgICAgIGNoYXJ0OiB7XG4gICAgICAgIHRlbXA6IHRlbXBlcmF0dXJlLFxuICAgICAgICByb29tOiBBcnJheSh0ZW1wZXJhdHVyZS5sZW5ndGgpLmZpbGwoNzIpLFxuICAgICAgICBtaW46IE1hdGgubWluKC4uLnRlbXBlcmF0dXJlLCA3MikgLSA1LFxuICAgICAgICBtYXg6IE1hdGgubWF4KC4uLnRlbXBlcmF0dXJlLCA3MikgKyA1LFxuICAgICAgICByYWluOiBjaGFydC5tYXAocCA9PiBwLnByb2JhYmlsaXR5T2ZQcmVjaXBpdGF0aW9uLnZhbHVlKSxcbiAgICAgICAgdGltZTogY2hhcnQubWFwKHAgPT4gV2VhdGhlclV0aWxpdHkuZm9ybWF0VGltZShwLmVuZFRpbWUpKSxcbiAgICAgICAgaHVtOiBjaGFydC5tYXAocCA9PiBwLnJlbGF0aXZlSHVtaWRpdHkudmFsdWUgfCAwKSxcbiAgICAgIH0sXG4gICAgfVxuICB9XG4gIGFzeW5jIGZldGNoRm9yZWNhc3RXZWF0aGVyKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoRGF0YSh0aGlzLmVuZHBvaW50cy5mb3JlY2FzdClcbiAgICBjb25zdCBmb3JlY2FzdCA9IGRhdGEucHJvcGVydGllcy5wZXJpb2RzXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2F0aW9uOiB0aGlzLmxvY2F0aW9uTmFtZSxcbiAgICAgIGlzRGF5dGltZTogZm9yZWNhc3QubWFwKHAgPT4gcC5pc0RheXRpbWUpLFxuICAgICAgbmFtZTogZm9yZWNhc3QubWFwKHAgPT4gcC5uYW1lKSxcbiAgICAgIHRlbXBlcmF0dXJlOiBmb3JlY2FzdC5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKSxcbiAgICAgIHdpbmQ6IGZvcmVjYXN0Lm1hcChwID0+IGAke3Aud2luZFNwZWVkfSAke3Aud2luZERpcmVjdGlvbn1gKSxcbiAgICAgIGZvcmVjYXN0OiBmb3JlY2FzdC5tYXAocCA9PiBwLmRldGFpbGVkRm9yZWNhc3QpLFxuICAgICAgcmFpbjogZm9yZWNhc3QubWFwKHAgPT4gcC5wcm9iYWJpbGl0eU9mUHJlY2lwaXRhdGlvbi52YWx1ZSB8IDApLFxuICAgICAgaWNvbjogZm9yZWNhc3QubWFwKHAgPT4gcC5pY29uKSxcbiAgICAgIGNoYXJ0OiBzZXRzZXZlbkRheUNoYXJ0RGF0YShmb3JlY2FzdCksXG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldHNldmVuRGF5Q2hhcnREYXRhKGZvcmVjYXN0KSB7XG4gICAgICBjb25zdCBEYXl0aW1lID0gZm9yZWNhc3QuZmlsdGVyKHAgPT4gcC5pc0RheXRpbWUpXG4gICAgICBjb25zdCBOaWdodHRpbWUgPSBmb3JlY2FzdC5maWx0ZXIocCA9PiAhcC5pc0RheXRpbWUpXG4gICAgICBjb25zdCBoaWdoID0gRGF5dGltZS5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKVxuICAgICAgY29uc3QgbWF4ID0gTWF0aC5tYXgoLi4uaGlnaCkgKyA1XG4gICAgICBjb25zdCBsb3cgPSBOaWdodHRpbWUubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSlcbiAgICAgIGNvbnN0IG1pbiA9IE1hdGgubWluKC4uLmxvdywgNzIpIC0gNVxuICAgICAgY29uc3Qgcm9vbSA9IEFycmF5KGhpZ2gubGVuZ3RoKS5maWxsKDcyKVxuICAgICAgY29uc3QgdGVtcCA9IHsgaGlnaCwgbG93LCByb29tLCBtYXgsIG1pbiB9XG4gICAgICBjb25zdCByYWluID0gRGF5dGltZS5tYXAocCA9PiBwLnByb2JhYmlsaXR5T2ZQcmVjaXBpdGF0aW9uLnZhbHVlID8/IDApXG4gICAgICBjb25zdCBkYXlzID0gRGF5dGltZS5tYXAocCA9PiBwLm5hbWUpXG4gICAgICByZXR1cm4geyB0ZW1wLCByYWluLCBkYXlzIH1cbiAgICB9XG4gIH1cbiAgYXN5bmMgZmV0Y2hBbGVydHMoKSB7XG4gICAgY29uc3QgYWxlcnRzVVJJID0gYCR7dGhpcy5BUElfVVJMfS9hbGVydHMvYWN0aXZlP3BvaW50PSR7dGhpcy5wb2ludH1gXG4gICAgY29uc3QgYWxlcnRzID0gYXdhaXQgdGhpcy5mZXRjaERhdGEoYWxlcnRzVVJJKVxuICAgIHJldHVybiBhbGVydHMuZmVhdHVyZXNcbiAgfVxufVxuXG5jbGFzcyBXZWF0aGVyQ2hhcnRKUyB7XG4gIHR4dCA9ICcjY2NjJ1xuICBiZ0NvbG9yID0gJyMzMzMnXG4gIGdyaWRDb2xvciA9ICcjNTU1J1xuICBsaW5lQ29sb3IgPSB7XG4gICAgQmx1ZTogJyMzNkEyRUInLFxuICAgIFJlZDogJyNGRjYzODQnLFxuICAgIE9yYW5nZTogJyNGRjlGNDAnLFxuICAgIFllbGxvdzogJyNGRkNENTYnLFxuICAgIEdyZWVuOiAnIzRCQzBDMCcsXG4gICAgUHVycGxlOiAnIzk5NjZGRicsXG4gICAgR3JleTogJyNDOUNCQ0UnLFxuICB9XG4gIGNoYXJ0RElWXG4gIGN0eFxuICBjb25zdHJ1Y3RvcihjaGFydElEKSB7XG4gICAgdGhpcy5jaGFydERJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNoYXJ0SUQpXG4gICAgY29uc3QgY2FudmFzSUQgPSBgJHtjaGFydElEfUNUWGBcbiAgICB0aGlzLmNoYXJ0RElWLmlubmVySFRNTCA9IGA8ZGl2PjxjYW52YXMgaWQ9JyR7Y2FudmFzSUR9Jz48L2NhbnZhcz48L2Rpdj5gXG4gICAgdGhpcy5jdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjYW52YXNJRClcbiAgfVxuICBkaXNwbGF5Q2hhcnQoZGF0YSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgQ2hhcnQgfSA9IHdpbmRvd1xuICAgIENoYXJ0LmRlZmF1bHRzLmNvbG9yID0gdGhpcy50eHRcbiAgICB0aGlzLmN0eC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmJnQ29sb3JcbiAgICBjb25zdCBjb25maWcgPSB7IHR5cGU6ICdsaW5lJywgZGF0YSwgb3B0aW9ucyB9XG4gICAgY29uc3QgdGVtcGVyYXR1cmVDaGFydCA9IG5ldyBDaGFydCh0aGlzLmN0eCwgY29uZmlnKVxuICAgIHRoaXMuc2V0Q2hhcnRXaWR0aCh0ZW1wZXJhdHVyZUNoYXJ0KVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldENoYXJ0V2lkdGgodGVtcGVyYXR1cmVDaGFydClcbiAgICB9KVxuICB9XG4gIHNldENoYXJ0V2lkdGgod2VhdGhlckNoYXJ0KSB7XG4gICAgY29uc3QgY2hhcnRTdHlsZSA9IHdlYXRoZXJDaGFydC5jYW52YXMucGFyZW50Tm9kZS5zdHlsZVxuICAgIGNoYXJ0U3R5bGUubWFyZ2luID0gJ2F1dG8nXG4gICAgY29uc3Qgc2NyZWVuV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHdlYXRoZXJDaGFydC5yZXNpemUoc2NyZWVuV2lkdGgsICdhdXRvJylcbiAgICBjaGFydFN0eWxlLndpZHRoID0gJzEwMCUnXG4gIH1cbiAgc2V0N0RheUNoYXJ0KGNoYXJ0RGF0YSwgbG9jYXRpb25OYW1lKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2V0N0RheURhdGEoY2hhcnREYXRhKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnNldDdEYXlPcHRpb25zKGxvY2F0aW9uTmFtZSlcbiAgICB0aGlzLmRpc3BsYXlDaGFydChkYXRhLCBvcHRpb25zKVxuICB9XG4gIHNldDdEYXlEYXRhKGNoYXJ0RGF0YSkge1xuICAgIGNvbnN0IGhpZ2hEYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgbGFiZWw6ICdIaWdocycsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuUmVkLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgICBkYXRhOiBjaGFydERhdGEudGVtcC5oaWdoLFxuICAgIH1cbiAgICBjb25zdCBsb3dEYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgbGFiZWw6ICdMb3dzJyxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5CbHVlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgICBkYXRhOiBjaGFydERhdGEudGVtcC5sb3csXG4gICAgfVxuICAgIGNvbnN0IHJvb21EYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgbGFiZWw6ICc3MlxcdTAwQjBGJyxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5HcmVlbixcbiAgICAgIHBvaW50UmFkaXVzOiAwLFxuICAgICAgZGF0YTogQXJyYXkoY2hhcnREYXRhLnRlbXAuaGlnaC5sZW5ndGgpLmZpbGwoNzIpLFxuICAgICAgYm9yZGVyRGFzaDogWzUsIDVdLFxuICAgIH1cbiAgICBjb25zdCByYWluRGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgbGFiZWw6ICdSYWluJyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5saW5lQ29sb3IuUHVycGxlLFxuICAgICAgYmFyVGhpY2tuZXNzOiAxNSxcbiAgICAgIGRhdGE6IGNoYXJ0RGF0YS5yYWluLFxuICAgICAgeUF4aXNJRDogJ3kyJyxcbiAgICB9XG4gICAgY29uc3QgZGF0YXNldHMgPSBbaGlnaERhdGFTZXQsIGxvd0RhdGFTZXQsIHJvb21EYXRhU2V0LCByYWluRGF0YVNldF1cbiAgICByZXR1cm4geyBsYWJlbHM6IGNoYXJ0RGF0YS5kYXlzLCBkYXRhc2V0cyB9XG4gIH1cbiAgc2V0N0RheU9wdGlvbnMobG9jYXRpb24pIHtcbiAgICBjb25zdCBuYW1lID0gJ1dlYXRoZXIgRm9yZWNhc3QnXG4gICAgY29uc3QgdGl0bGUgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6IG5hbWUsIGNvbG9yOiB0aGlzLnR4dCwgZm9udDogeyBzaXplOiAxOCB9IH1cbiAgICBjb25zdCBzdWJ0aXRsZSA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogbG9jYXRpb24sIGNvbG9yOiB0aGlzLnR4dCwgZm9udDogeyBzaXplOiAxNiB9IH1cbiAgICBjb25zdCBwbHVnaW5zID0geyB0aXRsZSwgc3VidGl0bGUgfVxuICAgIGNvbnN0IGdyaWQgPSB7IGRpc3BsYXk6IHRydWUsIGNvbG9yOiB0aGlzLmdyaWRDb2xvciB9XG4gICAgY29uc3Qgc2NhbGVYID0geyB0aXRsZTogeyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnRGF5IG9mIHRoZSBXZWVrJyB9LCBncmlkIH1cbiAgICBjb25zdCBzY2FsZVkgPSB7XG4gICAgICB0aXRsZTogeyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnVGVtcGVyYXR1cmUgKFxcdTAwQjBGKScgfSxcbiAgICAgIGdyaWQsXG4gICAgICBwb3NpdGlvbjogJ2xlZnQnLFxuICAgIH1cbiAgICBjb25zdCBzY2FsZVkyID0ge1xuICAgICAgdGl0bGU6IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1BlcmNlbnQgKCUpJyB9LFxuICAgICAgZ3JpZCxcbiAgICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICBzdWdnZXN0ZWRNYXg6IDEwMCxcbiAgICB9XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgcGx1Z2lucywgc2NhbGVzOiB7IHg6IHNjYWxlWCwgeTogc2NhbGVZLCB5Mjogc2NhbGVZMiB9IH1cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG4gIHNldDI0SHJDaGFydChjaGFydERhdGEpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5zZXQyNEhyRGF0YShjaGFydERhdGEpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZ2V0MjRIck9wdGlvbnMoKVxuICAgIHRoaXMuZGlzcGxheUNoYXJ0KGRhdGEsIG9wdGlvbnMpXG4gIH1cbiAgZ2V0MjRIck9wdGlvbnMoKSB7XG4gICAgY29uc3QgbmFtZSA9ICcyNCBIb3VyIEZvcmVjYXN0J1xuICAgIGNvbnN0IHRpdGxlID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiBuYW1lLCBjb2xvcjogdGhpcy50eHQsIGZvbnQ6IHsgc2l6ZTogMTYgfSB9XG4gICAgY29uc3QgZ3JpZCA9IHsgZGlzcGxheTogdHJ1ZSwgY29sb3I6IHRoaXMuZ3JpZENvbG9yIH1cbiAgICBjb25zdCB0aXRsZVggPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdUaW1lJyB9XG4gICAgY29uc3Qgc2NhbGVYID0geyB0aXRsZTogdGl0bGVYLCBncmlkIH1cbiAgICBjb25zdCB0aXRsZVkgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdUZW1wZXJhdHVyZSAoXFx1MDBCMEYpJyB9XG4gICAgY29uc3Qgc2NhbGVZID0geyB0aXRsZTogdGl0bGVZLCBncmlkLCBwb3NpdGlvbjogJ2xlZnQnIH1cbiAgICBjb25zdCB0aXRsZVkyID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnUGVyY2VudCAoJSknIH1cbiAgICBjb25zdCBzY2FsZVkyID0ge1xuICAgICAgdGl0bGU6IHRpdGxlWTIsXG4gICAgICBncmlkLFxuICAgICAgcG9zaXRpb246ICdyaWdodCcsXG4gICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgIG1heDogMTAwLFxuICAgIH1cbiAgICByZXR1cm4geyBwbHVnaW5zOiB7IHRpdGxlIH0sIHNjYWxlczogeyB4OiBzY2FsZVgsIHk6IHNjYWxlWSwgeTI6IHNjYWxlWTIgfSB9XG4gIH1cbiAgc2V0MjRIckRhdGEoZGF0YSkge1xuICAgIGNvbnN0IHRlbXAgPSB7XG4gICAgICBsYWJlbDogJ1RlbXBlcmF0dXJlJyxcbiAgICAgIGRhdGE6IGRhdGEudGVtcCxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5PcmFuZ2UsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICB9XG4gICAgY29uc3Qgcm9vbSA9IHtcbiAgICAgIGxhYmVsOiAnNzLCsEYnLFxuICAgICAgZGF0YTogZGF0YS5yb29tLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLkdyZWVuLFxuICAgICAgcG9pbnRSYWRpdXM6IDAsXG4gICAgICBib3JkZXJEYXNoOiBbNSwgNV0sXG4gICAgfVxuICAgIGNvbnN0IHJhaW4gPSB7XG4gICAgICBsYWJlbDogJ1JhaW4nLFxuICAgICAgZGF0YTogZGF0YS5yYWluLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLkJsdWUsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICAgIHlBeGlzSUQ6ICd5MicsXG4gICAgfVxuICAgIGNvbnN0IGh1bSA9IHtcbiAgICAgIGxhYmVsOiAnSHVtaWRpdHknLFxuICAgICAgZGF0YTogZGF0YS5odW0sXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuUHVycGxlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgfVxuICAgIHJldHVybiB7IGxhYmVsczogZGF0YS50aW1lLCBkYXRhc2V0czogW3RlbXAsIHJvb20sIHJhaW4sIGh1bV0gfVxuICB9XG59XG5cbmNvbnN0IE5XUyA9IG5ldyBOYXRpb25hbFdlYXRoZXJTZXJ2aWNlQVBJKClcblxuY2xhc3MgV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXkgZXh0ZW5kcyBMaW5rVXRpbGl0eSB7XG4gIGRpc3BsYXlESVZcbiAgd2VhdGhlckRpdkxlZnRcbiAgd2VhdGhlckRpdlJpZ2h0XG4gIHdlYXRoZXJBbGVydHNcbiAgd2Vla0ZvcmVjYXN0XG4gIHNldmVuRGF5Q2hhcnRcbiAgdHdlbnR5Zm91cmhvdXJDaGFydFxuICBGaXhlZENvb3JkcyA9IHsgbGF0aXR1ZGU6IDI2LjMwODUsIGxvbmdpdHVkZTogLTk4LjEwMTYgfVxuICBjb25zdHJ1Y3RvcihkaXNwbGF5SWQsIGxpbmtJZCkge1xuICAgIHN1cGVyKGxpbmtJZClcbiAgICBzdXBlci5zZXRMaW5rKE5XUy5MSU5LLnRpdGxlLCBOV1MuTElOSy50YXJnZXQsIHRydWUpXG4gICAgdGhpcy5kaXNwbGF5RElWID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGlzcGxheUlkKVxuICAgIGNvbnN0IFRFTVBMQVRFID0gYFxuICAgICAgPGRpdiBpZD1cIndlYXRoZXJDb250YWluZXJcIj5cbiAgICAgICAgICA8ZGl2IGlkPSd3ZWF0aGVyRGl2TGVmdCc+PC9kaXY+PGRpdiBpZD0nd2VhdGhlckRpdlJpZ2h0Jz48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBpZD1cImFsZXJ0c0lkXCI+PC9kaXY+XFxuPGRpdiBpZD1cImZvcmVjYXN0RGl2XCI+XFxuPC9kaXY+XG4gICAgICA8ZGl2IGlkPVwiY2hhcnRPbmVEaXZcIj48L2Rpdj48ZGl2IGlkPVwiY2hhcnRUd29EaXZcIj48L2Rpdj5cbiAgICAgIGBcbiAgICB0aGlzLmRpc3BsYXlESVYuaW5uZXJIVE1MID0gVEVNUExBVEVcbiAgICB0aGlzLndlYXRoZXJEaXZMZWZ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dlYXRoZXJEaXZMZWZ0JylcbiAgICB0aGlzLndlYXRoZXJEaXZSaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWF0aGVyRGl2UmlnaHQnKVxuICAgIHRoaXMud2VhdGhlckFsZXJ0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbGVydHNJZCcpXG4gICAgdGhpcy53ZWVrRm9yZWNhc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm9yZWNhc3REaXYnKVxuICAgIHRoaXMuc2V2ZW5EYXlDaGFydCA9IG5ldyBXZWF0aGVyQ2hhcnRKUygnY2hhcnRPbmVEaXYnKVxuICAgIHRoaXMudHdlbnR5Zm91cmhvdXJDaGFydCA9IG5ldyBXZWF0aGVyQ2hhcnRKUygnY2hhcnRUd29EaXYnKVxuICB9XG4gIGFzeW5jIHNldERpc3BsYXkodXNlR2VvTG9jYXRpb24pIHtcbiAgICBsZXQgY29vcmRzID0gdGhpcy5GaXhlZENvb3Jkc1xuICAgIGlmICh1c2VHZW9Mb2NhdGlvbikge1xuICAgICAgY29vcmRzID0gKGF3YWl0IE5XUy5nZXRDb29yZHMoKSkgfHwgY29vcmRzXG4gICAgfVxuICAgIGF3YWl0IE5XUy5mZXRjaFBvaW50cyhjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGUpXG4gICAgY29uc29sZS5sb2coYERpc3BsYXlpbmcgJHtOV1MubG9jYXRpb25OYW1lfTogJHtOV1MuZW5kcG9pbnRzLmZvcmVjYXN0fSFgKVxuICAgIGF3YWl0IHRoaXMuc2V0Q3VycmVudFdlYXRoZXIoKVxuICAgIGF3YWl0IHRoaXMuc2V0Rm9yZWNhc3RBbmRDaGFydCgpXG4gICAgYXdhaXQgdGhpcy5zZXRBY3RpdmVBbGVydHMoKVxuICB9XG4gIGFzeW5jIHNldEN1cnJlbnRXZWF0aGVyKCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBOV1MuZmV0Y2hDdXJyZW50V2VhdGhlcigpXG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmRhdGUsIDEuMSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmxvY2F0aW9uLCAxLjQpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC50ZW1wZXJhdHVyZSwgMykpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LndpbmQsIDEuNSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmZvcmVjYXN0LCAxKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQuaHVtaWRpdHksIDEpKVxuICAgIHRoaXMud2VhdGhlckRpdkxlZnQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpXG4gICAgdGhpcy50d2VudHlmb3VyaG91ckNoYXJ0LnNldDI0SHJDaGFydChjdXJyZW50LmNoYXJ0KVxuICB9XG4gIGFzeW5jIHNldEZvcmVjYXN0QW5kQ2hhcnQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IE5XUy5mZXRjaEZvcmVjYXN0V2VhdGhlcigpXG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShkYXRhLm5hbWVbMF0sIDEuMikpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlSWNvbihkYXRhLmljb25bMF0sIGRhdGEuZm9yZWNhc3RbMF0pKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoYCR7ZGF0YS50ZW1wZXJhdHVyZVswXX0mZGVnO0ZgLCAwLjgpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoZGF0YS53aW5kWzBdLCAwLjgpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoYCR7ZGF0YS5yYWluWzBdfSUgQ2hhbmNlIFJhaW5gLCAwLjgpKVxuICAgIHRoaXMud2VhdGhlckRpdlJpZ2h0LmFwcGVuZENoaWxkKGZyYWdtZW50KVxuXG4gICAgY29uc3QgZm9yZWNhc3RGcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBkYXRhLm5hbWUubGVuZ3RoOyBpKyspIHtcblxuICAgIC8vICAgY29uc3QgaXNEYXl0aW1lID0gZGF0YS5pc0RheXRpbWVbaV1cbiAgICAvLyAgIGlmICghaXNEYXl0aW1lKSB7XG4gICAgLy8gICAgIGNvbnRpbnVlXG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICBjb25zdCBmb3JlY2FzdERheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgLy8gICAgIGZvcmVjYXN0RGF5LmNsYXNzTGlzdC5hZGQoJ2RheS1jYXJkJylcbiAgICAvLyAgICAgZm9yZWNhc3REYXkuc2V0QXR0cmlidXRlKCd0aXRsZScsIGAke2RhdGEubmFtZVtpXX06ICR7ZGF0YS5mb3JlY2FzdFtpXX1gKVxuICAgIC8vICAgICBmb3JlY2FzdERheS5pbm5lckhUTUwgPSBgXG4gICAgLy8gICAgICAgPHNwYW4gY2xhc3M9XCJkYXlcIj4ke2RhdGEubmFtZVtpXS5zdWJzdHJpbmcoMCwgMyl9PC9zcGFuPlxuICAgIC8vICAgICAgIDxzcGFuIGNsYXNzPVwicmFpblwiPiR7ZGF0YS5yYWluW2ldfSU8L3NwYW4+XG4gICAgLy8gICAgICAgPGltZyBzcmM9XCIke2RhdGEuaWNvbltpXX1cIiBhbHQ9XCJpY29uXCIgaGVpZ2h0PVwiYXV0b1wiIHdpZHRoPVwiNzUlXCI+XG4gICAgLy8gICAgICAgPHNwYW4gY2xhc3M9XCJoaVwiPiR7ZGF0YS50ZW1wZXJhdHVyZVtpXX0mZGVnO0Y8L3NwYW4+XG4gICAgLy8gICAgICAgPHNwYW4gY2xhc3M9XCJsb1wiPiR7ZGF0YS50ZW1wZXJhdHVyZVtpICsgMV19JmRlZ0Y8L3NwYW4+XG4gICAgLy8gICAgIGBcblxuICAgICAgaWYgKCFkYXRhLmlzRGF5dGltZVtpXSkgY29udGludWVcbiAgICAgIGlmIChpICsgMSA+PSBkYXRhLnRlbXBlcmF0dXJlLmxlbmd0aCkgYnJlYWtcbiAgICAgIGNvbnN0IGZvcmVjYXN0RGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIGZvcmVjYXN0RGF5LmNsYXNzTGlzdC5hZGQoJ2ZvcmVjYXN0LWRheS1jYXJkJylcbiAgICAgIGZvcmVjYXN0RGF5LnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgJHtkYXRhLm5hbWVbaV19OiAke2RhdGEuZm9yZWNhc3RbaV19YClcbiAgICAgIGZvcmVjYXN0RGF5LmlubmVySFRNTCA9IGBcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJkYXlcIj4ke2RhdGEubmFtZVtpXS5zdWJzdHJpbmcoMCwgMyl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInJhaW5cIj4ke2RhdGEucmFpbltpXX0lPC9zcGFuPlxuICAgICAgICA8aW1nIHNyYz1cIiR7ZGF0YS5pY29uW2ldfVwiIGFsdD1cImljb25cIiB3aWR0aD1cIjc1JVwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImhpXCI+JHtkYXRhLnRlbXBlcmF0dXJlW2ldfSZkZWc7Rjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJsb1wiPiR7ZGF0YS50ZW1wZXJhdHVyZVtpICsgMV0gPz8gJy0tJ30mZGVnO0Y8L3NwYW4+XG4gICAgICBgXG5cbiAgICAgIGZvcmVjYXN0RnJhZ21lbnQuYXBwZW5kQ2hpbGQoZm9yZWNhc3REYXkpXG4gICAgfVxuICAgIHRoaXMud2Vla0ZvcmVjYXN0LmlubmVySFRNTCA9ICcnXG4gICAgdGhpcy53ZWVrRm9yZWNhc3QuYXBwZW5kQ2hpbGQoZm9yZWNhc3RGcmFnbWVudClcbiAgICB0aGlzLnNldmVuRGF5Q2hhcnQuc2V0N0RheUNoYXJ0KGRhdGEuY2hhcnQsIGRhdGEubG9jYXRpb24pXG4gIH1cbiAgYXN5bmMgc2V0QWN0aXZlQWxlcnRzKCkge1xuICAgIGNvbnN0IGFsZXJ0RGF0YSA9IGF3YWl0IE5XUy5mZXRjaEFsZXJ0cygpXG4gICAgaWYgKGFsZXJ0RGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKGBObyBhY3RpdmUgYWxlcnRzIGZvdW5kLmApXG4gICAgfVxuICAgIGZvciAoY29uc3QgZmVhdHVyZSBvZiBhbGVydERhdGEpIHtcbiAgICAgIGNvbnN0IGFsZXJ0VGl0bGUgPSBgJHtmZWF0dXJlLm1lc3NhZ2VUeXBlfTogJHtmZWF0dXJlLmV2ZW50fSAvICR7ZmVhdHVyZS5zZXZlcml0eX1gXG4gICAgICBjb25zdCBpbmZvcm1hdGlvbiA9IGAke2ZlYXR1cmUuZGVzY3JpcHRpb259XFxuJHtmZWF0dXJlLmluc3RydWN0aW9uIHx8ICcnfWBcbiAgICAgIGNvbnN0IGFsZXJ0TWVzc2FnZSA9IGAke2ZlYXR1cmUuaGVhZGxpbmV9XFxuJHtpbmZvcm1hdGlvbn1gXG4gICAgICBpZiAoZmVhdHVyZS5zdGF0dXMgPT09ICdBY3R1YWwnKSB7XG4gICAgICAgIGNvbnN0IHdlYXRoZXJBbGVydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIHdlYXRoZXJBbGVydC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgZmVhdHVyZS5oZWFkbGluZSlcbiAgICAgICAgd2VhdGhlckFsZXJ0LnN0eWxlLnBhZGRpbmcgPSAnNXB4J1xuICAgICAgICB3ZWF0aGVyQWxlcnQuaW5uZXJIVE1MID0gYWxlcnRUaXRsZVxuICAgICAgICB3ZWF0aGVyQWxlcnQub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICBhbGVydChhbGVydE1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53ZWF0aGVyQWxlcnRzLmFwcGVuZENoaWxkKHdlYXRoZXJBbGVydClcbiAgICAgIH1cbiAgICAgIHRoaXMubG9nQWN0aXZlQWxlcnRzKGZlYXR1cmUsIGFsZXJ0VGl0bGUsIGluZm9ybWF0aW9uKVxuICAgIH1cbiAgfVxuICBsb2dBY3RpdmVBbGVydHMoZmVhdHVyZSwgYWxlcnRUaXRsZSwgaW5mb3JtYXRpb24pIHtcbiAgICBjb25zb2xlLmdyb3VwKGFsZXJ0VGl0bGUpXG4gICAgY29uc29sZS5sb2coYFN0YXR1czogJHtmZWF0dXJlLnN0YXR1c31gKVxuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoZmVhdHVyZS5oZWFkbGluZSlcbiAgICBjb25zb2xlLmluZm8oaW5mb3JtYXRpb24pXG4gICAgY29uc29sZS5sb2coYFVyZ2VuY3k6ICR7ZmVhdHVyZS51cmdlbmN5fSAvIENlcnRhaW50eTogJHtmZWF0dXJlLmNlcnRhaW50eX1gKVxuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKVxuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXlcbiIsImNsYXNzIEdlb0xvY2F0aW9uVXRpbGl0eSB7XG4gIHN0YXRpYyBhc3luYyBnZXRDb29yZGluYXRlcygpIHtcbiAgICBjb25zdCBvcHRpb25zID0geyBlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlLCB0aW1lb3V0OiA1MDAwLCBtYXhpbXVtQWdlOiAwIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc3VjY2VzcyA9IHBvc2l0aW9uID0+IHtcbiAgICAgICAgcmVzb2x2ZShwb3NpdGlvbi5jb29yZHMpXG4gICAgICB9XG4gICAgICBjb25zdCBlcnJvciA9IGVycm9yID0+IHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSlcbiAgICAgIH1cbiAgICAgIGlmICghbmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0dlb2xvY2F0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGJyb3dzZXIuJykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKHN1Y2Nlc3MsIGVycm9yLCBvcHRpb25zKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgc3RhdGljIGdldExvY2FsZXMoKSB7XG4gICAgaWYgKCFuYXZpZ2F0b3IubGFuZ3VhZ2VzKSB7XG4gICAgICByZXR1cm4gJ2VuLVVTJ1xuICAgIH1cbiAgICByZXR1cm4gbmF2aWdhdG9yLmxhbmd1YWdlc1xuICB9XG59XG5cbmNsYXNzIFdlYXRoZXJVdGlsaXR5IHtcbiAgc3RhdGljIGFzeW5jIGZldGNoRGF0YShlbmRwb2ludCkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoZW5kcG9pbnQpXG4gICAgY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKHsgJ1VzZXItQWdlbnQnOiAnaHR0cHM6Ly9naXRodWIuY29tL2ZlbGl4dGhlY2F0OGEnIH0pXG4gICAgY29uc3QgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHVybCwgeyBoZWFkZXJzIH0pXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZXF1ZXN0KVxuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgJHtyZXNwb25zZS5zdGF0dXN9IERhdGEgTm90IEZvdW5kOiAke3Jlc3BvbnNlLnVybH1gKVxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICByZXR1cm4gZGF0YVxuICB9XG4gIHN0YXRpYyBmb3JtYXREYXRlKGRhdGVUaW1lKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVUaW1lKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGRhdGVTdHlsZTogJ2Z1bGwnIH1cbiAgICByZXR1cm4gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoR2VvTG9jYXRpb25VdGlsaXR5LmdldExvY2FsZXMoKSwgb3B0aW9ucykuZm9ybWF0KGRhdGUpXG4gIH1cbiAgc3RhdGljIGZvcm1hdFRpbWUoZGF0ZVRpbWUpIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVRpbWUpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgdGltZVN0eWxlOiAnc2hvcnQnIH1cbiAgICByZXR1cm4gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoR2VvTG9jYXRpb25VdGlsaXR5LmdldExvY2FsZXMoKSwgb3B0aW9ucykuZm9ybWF0KGRhdGUpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTGluZShjb250ZW50LCBzaXplKSB7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGRpdi5zdHlsZS5mb250U2l6ZSA9IGAke3NpemV9cmVtYFxuICBkaXYuaW5uZXJIVE1MID0gY29udGVudFxuICByZXR1cm4gZGl2XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUljb24oc3JjLCB0aXRsZSkge1xuICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKVxuICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBzcmMpXG4gIGltZy5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgdGl0bGUpXG4gIGltZy5zZXRBdHRyaWJ1dGUoJ2FsdCcsICdpY29uJylcbiAgcmV0dXJuIGltZ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgR2VvTG9jYXRpb25VdGlsaXR5LCBXZWF0aGVyVXRpbGl0eSwgY3JlYXRlTGluZSwgY3JlYXRlSWNvbiB9XG4iLCJjbGFzcyBTdGF0dXNVdGlsaXR5IHtcbiAgc3RhdHVzRElWXG4gIGNvbnN0cnVjdG9yKHN0YXR1c0RpdkVsZW1lbnRJZCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdGF0dXNEaXZFbGVtZW50SWQpXG4gICAgaWYgKCFlbGVtZW50IHx8ICEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxEaXZFbGVtZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTdGF0dXMgRGl2IEVsZW1lbnQgTm90IEZvdW5kIG9yIE5vdCBhIERJVmApXG4gICAgfVxuICAgIHRoaXMuc3RhdHVzRElWID0gZWxlbWVudFxuICB9XG4gIHNldFN0YXR1cyhzdGF0dXMpIHtcbiAgICB0aGlzLnN0YXR1c0RJVi50ZXh0Q29udGVudCA9IHN0YXR1cyA/PyAnJ1xuICB9XG4gIGNsZWFyU3RhdHVzKCkge1xuICAgIHRoaXMuc3RhdHVzRElWLnRleHRDb250ZW50ID0gJydcbiAgfVxuICBzZXRFcnJvcihtZXNzYWdlKSB7XG4gICAgdGhpcy5jbGVhclN0YXR1cygpXG4gICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHNwYW4udGV4dENvbnRlbnQgPSBtZXNzYWdlXG4gICAgc3Bhbi5zdHlsZS5jb2xvciA9ICdwYWxldmlvbGV0cmVkJ1xuICAgIHRoaXMuc3RhdHVzRElWLmFwcGVuZENoaWxkKHNwYW4pXG4gIH1cbiAgc2V0TG9hZGluZyhtZXNzYWdlKSB7XG4gICAgdGhpcy5jbGVhclN0YXR1cygpXG4gICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKVxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGlubmVyLmNsYXNzTmFtZSA9ICdzcGlubmVyJ1xuICAgIHRoaXMuc3RhdHVzRElWLmFwcGVuZENoaWxkKHRleHROb2RlKVxuICAgIHRoaXMuc3RhdHVzRElWLmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gIH1cbiAgbG9hZFdlYXRoZXIobWVzc2FnZSkge1xuICAgIHRoaXMuY2xlYXJTdGF0dXMoKVxuICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSlcbiAgICBjb25zdCBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bpbm5lci5jbGFzc05hbWUgPSAnY2xvdWRMb2FkZXInXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQodGV4dE5vZGUpXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXR1c1V0aWxpdHlcbiIsInJlcXVpcmUoJy4uL3Njc3Mvc3R5bGUuc2NzcycpXG5yZXF1aXJlKCcuLi9jc3Mvd2VhdGhlci5jc3MnKVxuY29uc3QgU3RhdHVzVXRpbGl0eSA9IHJlcXVpcmUoJy4vdXRpbHMvc3RhdHVzJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgZGlzcGxheVdlYXRoZXJGb3JlY2FzdChmYWxzZSlcbn0pXG5cbmNvbnN0IGFwaVNFTEVDVCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcGlTZWxlY3QnKVxuYXBpU0VMRUNULmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIGV2ZW50ID0+IHtcbiAgY29uc3Qgc3RhdHVzRGl2ID0gbmV3IFN0YXR1c1V0aWxpdHkoJ3N0YXR1c0RpdicpXG4gIGNvbnN0IHdlYXRoZXJMb2NhdGlvbiA9IGV2ZW50LnRhcmdldC52YWx1ZVxuICB0cnkge1xuICAgIHN3aXRjaCAod2VhdGhlckxvY2F0aW9uKSB7XG4gICAgICBjYXNlICdzaG93RGVmYXVsdCc6XG4gICAgICAgIHN0YXR1c0Rpdi5sb2FkV2VhdGhlcignTG9jYXRpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KGZhbHNlKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnc2hvd0ZvcmVjYXN0JzpcbiAgICAgICAgc3RhdHVzRGl2LmxvYWRXZWF0aGVyKCdMb2NhdGluZycpXG4gICAgICAgIGF3YWl0IGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QodHJ1ZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Nob3dDYXQnOlxuICAgICAgICBzdGF0dXNEaXYuc2V0TG9hZGluZygnTWVvd2luZycpXG4gICAgICAgIGF3YWl0IGRpc3BsYXlDYXQoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnc2hvd0NhdFNsaWRlcic6XG4gICAgICAgIHN0YXR1c0Rpdi5zZXRMb2FkaW5nKCdNZW93aW5nJylcbiAgICAgICAgYXdhaXQgZGlzcGxheUNhdFNsaWRlcigpXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVha1xuICAgIH1cbiAgICBzdGF0dXNEaXYuY2xlYXJTdGF0dXMoKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGF3YWl0IGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QoZmFsc2UpXG4gICAgc3RhdHVzRGl2LnNldEVycm9yKGVycm9yKVxuICB9XG59KVxuXG5jb25zdCBXZWF0aGVyRm9yZWNhc3REYXRhRGlzcGxheSA9IHJlcXVpcmUoJy4vbGlicy9mb3JlY2FzdExpYicpXG5hc3luYyBmdW5jdGlvbiBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KHVzZUdlb0xvY2F0aW9uKSB7XG4gIGNvbnN0IGZvcmVjYXN0ID0gbmV3IFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5KCdkaXNwbGF5RGl2JywgJ2FwaUxpbmsnKVxuICBhd2FpdCBmb3JlY2FzdC5zZXREaXNwbGF5KHVzZUdlb0xvY2F0aW9uKVxufVxuXG5jb25zdCB7IFJhbmRvbUNhdEltYWdlRGlzcGxheSwgUmFuZG9tQ2F0SW1hZ2VTbGlkZXIgfSA9IHJlcXVpcmUoJy4vbGlicy9jYXRMaWInKVxuYXN5bmMgZnVuY3Rpb24gZGlzcGxheUNhdCgpIHtcbiAgY29uc3QgY2F0ID0gbmV3IFJhbmRvbUNhdEltYWdlRGlzcGxheSgnZGlzcGxheURpdicsICdhcGlMaW5rJylcbiAgYXdhaXQgY2F0LmRpc3BsYXlDYXQoKVxufVxuYXN5bmMgZnVuY3Rpb24gZGlzcGxheUNhdFNsaWRlcigpIHtcbiAgY29uc3Qgc2xpZGVyID0gbmV3IFJhbmRvbUNhdEltYWdlU2xpZGVyKCdkaXNwbGF5RGl2JywgJ2FwaUxpbmsnKVxuICBhd2FpdCBzbGlkZXIuZGlzcGxheSgpXG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIndlYXRoZXJcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rZXhhbXBsZVwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJzcmNfc2Nzc19zdHlsZV9zY3NzXCIsXCJzcmNfanNfbGlic19jYXRMaWJfanNcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvanMvd2VhdGhlci5qc1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9