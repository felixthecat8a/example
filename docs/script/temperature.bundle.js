/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/libs/forecastLib.js"
/*!************************************!*\
  !*** ./src/js/libs/forecastLib.js ***!
  \************************************/
(module, __unused_webpack_exports, __webpack_require__) {

const LinkUtility = __webpack_require__(/*! ../utils/link */ "./src/js/utils/link.js")
const { GeoLocationUtility, WeatherUtility } = __webpack_require__(/*! ./weather */ "./src/js/libs/weather.js")

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
    //const coords = await NWS.getCoords()
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
    function createLine(content, size) {
      const div = document.createElement('div')
      div.style.fontSize = `${size}rem`
      div.innerHTML = content
      return div
    }
  }
  async setForecastAndChart() {
    const data = await NWS.fetchForecastWeather()
    this.weatherDivRight.innerHTML = `
      <div style="font-size:1.2rem;">${data.name[0]}</div>
      <img src="${data.icon[0]}" alt="icon" title="${data.forecast[0]}">
      <div style="font-size:0.8rem;">${data.temperature[0]}&deg;F</div>
      <div style="font-size:0.8rem;">${data.wind[0]}</div>
      <div style="font-size:0.8rem;">${data.rain[0]}% Chance Rain</div>
      `
    const fragment = document.createDocumentFragment()
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
        fragment.appendChild(forecastDay)
      }
    }
    this.weekForecast.appendChild(fragment)
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

module.exports = { GeoLocationUtility, WeatherUtility }


/***/ },

/***/ "./src/js/temperature.js"
/*!*******************************!*\
  !*** ./src/js/temperature.js ***!
  \*******************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! ../scss/style.scss */ "./src/scss/style.scss")
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
        statusDiv.setLoading('Locating')
        await displayWeatherForecast(false)
        break
      case 'showForecast':
        statusDiv.setLoading('Locating')
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
}

module.exports = StatusUtility


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
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
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
/******/ 			"temperature": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["src_scss_style_scss","src_js_libs_catLib_js"], () => (__webpack_require__("./src/js/temperature.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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c3JjL2pzL2xpYnMvZm9yZWNhc3RMaWIuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9saWJzL3dlYXRoZXIuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy90ZW1wZXJhdHVyZS5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLy4vc3JjL2pzL3V0aWxzL3N0YXR1cy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IExpbmtVdGlsaXR5ID0gcmVxdWlyZSgnLi4vdXRpbHMvbGluaycpXG5jb25zdCB7IEdlb0xvY2F0aW9uVXRpbGl0eSwgV2VhdGhlclV0aWxpdHkgfSA9IHJlcXVpcmUoJy4vd2VhdGhlcicpXG5cbmNsYXNzIE5hdGlvbmFsV2VhdGhlclNlcnZpY2VBUEkge1xuICBMSU5LID0ge1xuICAgIHRpdGxlOiAnTmF0aW9uYWwgV2VhdGhlciBTZXJ2aWNlJyxcbiAgICB0YXJnZXQ6ICdodHRwczovL3d3dy53ZWF0aGVyLmdvdicsXG4gIH1cbiAgQVBJX1VSTCA9ICdodHRwczovL2FwaS53ZWF0aGVyLmdvdidcbiAgZW5kcG9pbnRzXG4gIGxvY2F0aW9uTmFtZVxuICBwb2ludFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVuZHBvaW50cyA9IHsgZm9yZWNhc3RIb3VybHk6ICcnLCBmb3JlY2FzdDogJycgfVxuICAgIHRoaXMubG9jYXRpb25OYW1lID0gJydcbiAgICB0aGlzLnBvaW50ID0gJydcbiAgfVxuICBhc3luYyBnZXRDb29yZHMoKSB7XG4gICAgY29uc3QgY29vcmRzID0gYXdhaXQgR2VvTG9jYXRpb25VdGlsaXR5LmdldENvb3JkaW5hdGVzKClcbiAgICByZXR1cm4geyBsYXRpdHVkZTogY29vcmRzLmxhdGl0dWRlLCBsb25naXR1ZGU6IGNvb3Jkcy5sb25naXR1ZGUgfVxuICB9XG4gIGFzeW5jIGZldGNoRGF0YSh1cmwpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgV2VhdGhlclV0aWxpdHkuZmV0Y2hEYXRhKHVybClcbiAgICByZXR1cm4gZGF0YVxuICB9XG4gIGFzeW5jIGZldGNoUG9pbnRzKGxhdCwgbG9uZywgbG9nKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKGAke3RoaXMuQVBJX1VSTH0vcG9pbnRzLyR7bGF0fSwke2xvbmd9YClcbiAgICBpZiAobG9nKSB7XG4gICAgICBjb25zb2xlLmxvZygnUG9pbnRzOiAnLCBkYXRhLmlkKVxuICAgIH1cbiAgICBjb25zdCBwcm9wcyA9IGRhdGEucHJvcGVydGllc1xuICAgIHRoaXMuZW5kcG9pbnRzID0geyBmb3JlY2FzdEhvdXJseTogcHJvcHMuZm9yZWNhc3RIb3VybHksIGZvcmVjYXN0OiBwcm9wcy5mb3JlY2FzdCB9XG4gICAgY29uc3QgbG9jYXRpb25EYXRhID0gcHJvcHMucmVsYXRpdmVMb2NhdGlvbi5wcm9wZXJ0aWVzXG4gICAgdGhpcy5sb2NhdGlvbk5hbWUgPSBgJHtsb2NhdGlvbkRhdGEuY2l0eX0sICR7bG9jYXRpb25EYXRhLnN0YXRlfWBcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IHByb3BzLnJlbGF0aXZlTG9jYXRpb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNcbiAgICB0aGlzLnBvaW50ID0gYCR7Y29vcmRpbmF0ZXNbMV0udG9GaXhlZCg0KX0sJHtjb29yZGluYXRlc1swXS50b0ZpeGVkKDQpfWBcbiAgfVxuICBhc3luYyBmZXRjaEN1cnJlbnRXZWF0aGVyKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoRGF0YSh0aGlzLmVuZHBvaW50cy5mb3JlY2FzdEhvdXJseSlcbiAgICBjb25zdCBjdXJyZW50ID0gZGF0YS5wcm9wZXJ0aWVzLnBlcmlvZHNbMF1cbiAgICBjb25zdCBjaGFydCA9IGRhdGEucHJvcGVydGllcy5wZXJpb2RzLnNsaWNlKDEsIDI1KVxuICAgIGNvbnN0IHRlbXBlcmF0dXJlID0gY2hhcnQubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSlcbiAgICByZXR1cm4ge1xuICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25OYW1lLFxuICAgICAgZGF0ZTogV2VhdGhlclV0aWxpdHkuZm9ybWF0RGF0ZShjdXJyZW50LnN0YXJ0VGltZSksXG4gICAgICB0ZW1wZXJhdHVyZTogYCR7Y3VycmVudC50ZW1wZXJhdHVyZX3CsCR7Y3VycmVudC50ZW1wZXJhdHVyZVVuaXR9YCxcbiAgICAgIHdpbmQ6IGAke2N1cnJlbnQud2luZFNwZWVkfSAke2N1cnJlbnQud2luZERpcmVjdGlvbn1gLFxuICAgICAgZm9yZWNhc3Q6IGN1cnJlbnQuc2hvcnRGb3JlY2FzdCxcbiAgICAgIGh1bWlkaXR5OiBgJHtjdXJyZW50LnJlbGF0aXZlSHVtaWRpdHkudmFsdWV9JSBSSGAsXG4gICAgICBpY29uOiBjdXJyZW50Lmljb24sXG4gICAgICBjaGFydDoge1xuICAgICAgICB0ZW1wOiB0ZW1wZXJhdHVyZSxcbiAgICAgICAgcm9vbTogQXJyYXkodGVtcGVyYXR1cmUubGVuZ3RoKS5maWxsKDcyKSxcbiAgICAgICAgbWluOiBNYXRoLm1pbiguLi50ZW1wZXJhdHVyZSwgNzIpIC0gNSxcbiAgICAgICAgbWF4OiBNYXRoLm1heCguLi50ZW1wZXJhdHVyZSwgNzIpICsgNSxcbiAgICAgICAgcmFpbjogY2hhcnQubWFwKHAgPT4gcC5wcm9iYWJpbGl0eU9mUHJlY2lwaXRhdGlvbi52YWx1ZSksXG4gICAgICAgIHRpbWU6IGNoYXJ0Lm1hcChwID0+IFdlYXRoZXJVdGlsaXR5LmZvcm1hdFRpbWUocC5lbmRUaW1lKSksXG4gICAgICAgIGh1bTogY2hhcnQubWFwKHAgPT4gcC5yZWxhdGl2ZUh1bWlkaXR5LnZhbHVlIHwgMCksXG4gICAgICB9LFxuICAgIH1cbiAgfVxuICBhc3luYyBmZXRjaEZvcmVjYXN0V2VhdGhlcigpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaERhdGEodGhpcy5lbmRwb2ludHMuZm9yZWNhc3QpXG4gICAgY29uc3QgZm9yZWNhc3QgPSBkYXRhLnByb3BlcnRpZXMucGVyaW9kc1xuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbjogdGhpcy5sb2NhdGlvbk5hbWUsXG4gICAgICBpc0RheXRpbWU6IGZvcmVjYXN0Lm1hcChwID0+IHAuaXNEYXl0aW1lKSxcbiAgICAgIG5hbWU6IGZvcmVjYXN0Lm1hcChwID0+IHAubmFtZSksXG4gICAgICB0ZW1wZXJhdHVyZTogZm9yZWNhc3QubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSksXG4gICAgICB3aW5kOiBmb3JlY2FzdC5tYXAocCA9PiBgJHtwLndpbmRTcGVlZH0gJHtwLndpbmREaXJlY3Rpb259YCksXG4gICAgICBmb3JlY2FzdDogZm9yZWNhc3QubWFwKHAgPT4gcC5kZXRhaWxlZEZvcmVjYXN0KSxcbiAgICAgIHJhaW46IGZvcmVjYXN0Lm1hcChwID0+IHAucHJvYmFiaWxpdHlPZlByZWNpcGl0YXRpb24udmFsdWUgfCAwKSxcbiAgICAgIGljb246IGZvcmVjYXN0Lm1hcChwID0+IHAuaWNvbiksXG4gICAgICBjaGFydDogc2V0c2V2ZW5EYXlDaGFydERhdGEoZm9yZWNhc3QpLFxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRzZXZlbkRheUNoYXJ0RGF0YShmb3JlY2FzdCkge1xuICAgICAgY29uc3QgRGF5dGltZSA9IGZvcmVjYXN0LmZpbHRlcihwID0+IHAuaXNEYXl0aW1lKVxuICAgICAgY29uc3QgTmlnaHR0aW1lID0gZm9yZWNhc3QuZmlsdGVyKHAgPT4gIXAuaXNEYXl0aW1lKVxuICAgICAgY29uc3QgaGlnaCA9IERheXRpbWUubWFwKHAgPT4gcC50ZW1wZXJhdHVyZSlcbiAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLmhpZ2gpICsgNVxuICAgICAgY29uc3QgbG93ID0gTmlnaHR0aW1lLm1hcChwID0+IHAudGVtcGVyYXR1cmUpXG4gICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi5sb3csIDcyKSAtIDVcbiAgICAgIGNvbnN0IHJvb20gPSBBcnJheShoaWdoLmxlbmd0aCkuZmlsbCg3MilcbiAgICAgIGNvbnN0IHRlbXAgPSB7IGhpZ2gsIGxvdywgcm9vbSwgbWF4LCBtaW4gfVxuICAgICAgY29uc3QgcmFpbiA9IERheXRpbWUubWFwKHAgPT4gcC5wcm9iYWJpbGl0eU9mUHJlY2lwaXRhdGlvbi52YWx1ZSA/PyAwKVxuICAgICAgY29uc3QgZGF5cyA9IERheXRpbWUubWFwKHAgPT4gcC5uYW1lKVxuICAgICAgcmV0dXJuIHsgdGVtcCwgcmFpbiwgZGF5cyB9XG4gICAgfVxuICB9XG4gIGFzeW5jIGZldGNoQWxlcnRzKCkge1xuICAgIGNvbnN0IGFsZXJ0c1VSSSA9IGAke3RoaXMuQVBJX1VSTH0vYWxlcnRzL2FjdGl2ZT9wb2ludD0ke3RoaXMucG9pbnR9YFxuICAgIGNvbnN0IGFsZXJ0cyA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKGFsZXJ0c1VSSSlcbiAgICByZXR1cm4gYWxlcnRzLmZlYXR1cmVzXG4gIH1cbn1cblxuY2xhc3MgV2VhdGhlckNoYXJ0SlMge1xuICB0eHQgPSAnI2NjYydcbiAgYmdDb2xvciA9ICcjMzMzJ1xuICBncmlkQ29sb3IgPSAnIzU1NSdcbiAgbGluZUNvbG9yID0ge1xuICAgIEJsdWU6ICcjMzZBMkVCJyxcbiAgICBSZWQ6ICcjRkY2Mzg0JyxcbiAgICBPcmFuZ2U6ICcjRkY5RjQwJyxcbiAgICBZZWxsb3c6ICcjRkZDRDU2JyxcbiAgICBHcmVlbjogJyM0QkMwQzAnLFxuICAgIFB1cnBsZTogJyM5OTY2RkYnLFxuICAgIEdyZXk6ICcjQzlDQkNFJyxcbiAgfVxuICBjaGFydERJVlxuICBjdHhcbiAgY29uc3RydWN0b3IoY2hhcnRJRCkge1xuICAgIHRoaXMuY2hhcnRESVYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjaGFydElEKVxuICAgIGNvbnN0IGNhbnZhc0lEID0gYCR7Y2hhcnRJRH1DVFhgXG4gICAgdGhpcy5jaGFydERJVi5pbm5lckhUTUwgPSBgPGRpdj48Y2FudmFzIGlkPScke2NhbnZhc0lEfSc+PC9jYW52YXM+PC9kaXY+YFxuICAgIHRoaXMuY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzSUQpXG4gIH1cbiAgZGlzcGxheUNoYXJ0KGRhdGEsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IENoYXJ0IH0gPSB3aW5kb3dcbiAgICBDaGFydC5kZWZhdWx0cy5jb2xvciA9IHRoaXMudHh0XG4gICAgdGhpcy5jdHguc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5iZ0NvbG9yXG4gICAgY29uc3QgY29uZmlnID0geyB0eXBlOiAnbGluZScsIGRhdGEsIG9wdGlvbnMgfVxuICAgIGNvbnN0IHRlbXBlcmF0dXJlQ2hhcnQgPSBuZXcgQ2hhcnQodGhpcy5jdHgsIGNvbmZpZylcbiAgICB0aGlzLnNldENoYXJ0V2lkdGgodGVtcGVyYXR1cmVDaGFydClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDaGFydFdpZHRoKHRlbXBlcmF0dXJlQ2hhcnQpXG4gICAgfSlcbiAgfVxuICBzZXRDaGFydFdpZHRoKHdlYXRoZXJDaGFydCkge1xuICAgIGNvbnN0IGNoYXJ0U3R5bGUgPSB3ZWF0aGVyQ2hhcnQuY2FudmFzLnBhcmVudE5vZGUuc3R5bGVcbiAgICBjaGFydFN0eWxlLm1hcmdpbiA9ICdhdXRvJ1xuICAgIGNvbnN0IHNjcmVlbldpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB3ZWF0aGVyQ2hhcnQucmVzaXplKHNjcmVlbldpZHRoLCAnYXV0bycpXG4gICAgY2hhcnRTdHlsZS53aWR0aCA9ICcxMDAlJ1xuICB9XG4gIHNldDdEYXlDaGFydChjaGFydERhdGEsIGxvY2F0aW9uTmFtZSkge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnNldDdEYXlEYXRhKGNoYXJ0RGF0YSlcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5zZXQ3RGF5T3B0aW9ucyhsb2NhdGlvbk5hbWUpXG4gICAgdGhpcy5kaXNwbGF5Q2hhcnQoZGF0YSwgb3B0aW9ucylcbiAgfVxuICBzZXQ3RGF5RGF0YShjaGFydERhdGEpIHtcbiAgICBjb25zdCBoaWdoRGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGxhYmVsOiAnSGlnaHMnLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLlJlZCxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgICAgZGF0YTogY2hhcnREYXRhLnRlbXAuaGlnaCxcbiAgICB9XG4gICAgY29uc3QgbG93RGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGxhYmVsOiAnTG93cycsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuQmx1ZSxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgICAgZGF0YTogY2hhcnREYXRhLnRlbXAubG93LFxuICAgIH1cbiAgICBjb25zdCByb29tRGF0YVNldCA9IHtcbiAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgIGxhYmVsOiAnNzJcXHUwMEIwRicsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuR3JlZW4sXG4gICAgICBwb2ludFJhZGl1czogMCxcbiAgICAgIGRhdGE6IEFycmF5KGNoYXJ0RGF0YS50ZW1wLmhpZ2gubGVuZ3RoKS5maWxsKDcyKSxcbiAgICAgIGJvcmRlckRhc2g6IFs1LCA1XSxcbiAgICB9XG4gICAgY29uc3QgcmFpbkRhdGFTZXQgPSB7XG4gICAgICB0eXBlOiAnYmFyJyxcbiAgICAgIGxhYmVsOiAnUmFpbicsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMubGluZUNvbG9yLlB1cnBsZSxcbiAgICAgIGJhclRoaWNrbmVzczogMTUsXG4gICAgICBkYXRhOiBjaGFydERhdGEucmFpbixcbiAgICAgIHlBeGlzSUQ6ICd5MicsXG4gICAgfVxuICAgIGNvbnN0IGRhdGFzZXRzID0gW2hpZ2hEYXRhU2V0LCBsb3dEYXRhU2V0LCByb29tRGF0YVNldCwgcmFpbkRhdGFTZXRdXG4gICAgcmV0dXJuIHsgbGFiZWxzOiBjaGFydERhdGEuZGF5cywgZGF0YXNldHMgfVxuICB9XG4gIHNldDdEYXlPcHRpb25zKGxvY2F0aW9uKSB7XG4gICAgY29uc3QgbmFtZSA9ICdXZWF0aGVyIEZvcmVjYXN0J1xuICAgIGNvbnN0IHRpdGxlID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiBuYW1lLCBjb2xvcjogdGhpcy50eHQsIGZvbnQ6IHsgc2l6ZTogMTggfSB9XG4gICAgY29uc3Qgc3VidGl0bGUgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6IGxvY2F0aW9uLCBjb2xvcjogdGhpcy50eHQsIGZvbnQ6IHsgc2l6ZTogMTYgfSB9XG4gICAgY29uc3QgcGx1Z2lucyA9IHsgdGl0bGUsIHN1YnRpdGxlIH1cbiAgICBjb25zdCBncmlkID0geyBkaXNwbGF5OiB0cnVlLCBjb2xvcjogdGhpcy5ncmlkQ29sb3IgfVxuICAgIGNvbnN0IHNjYWxlWCA9IHsgdGl0bGU6IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ0RheSBvZiB0aGUgV2VlaycgfSwgZ3JpZCB9XG4gICAgY29uc3Qgc2NhbGVZID0ge1xuICAgICAgdGl0bGU6IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1RlbXBlcmF0dXJlIChcXHUwMEIwRiknIH0sXG4gICAgICBncmlkLFxuICAgICAgcG9zaXRpb246ICdsZWZ0JyxcbiAgICB9XG4gICAgY29uc3Qgc2NhbGVZMiA9IHtcbiAgICAgIHRpdGxlOiB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdQZXJjZW50ICglKScgfSxcbiAgICAgIGdyaWQsXG4gICAgICBwb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgc3VnZ2VzdGVkTWF4OiAxMDAsXG4gICAgfVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IHBsdWdpbnMsIHNjYWxlczogeyB4OiBzY2FsZVgsIHk6IHNjYWxlWSwgeTI6IHNjYWxlWTIgfSB9XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuICBzZXQyNEhyQ2hhcnQoY2hhcnREYXRhKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuc2V0MjRIckRhdGEoY2hhcnREYXRhKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmdldDI0SHJPcHRpb25zKClcbiAgICB0aGlzLmRpc3BsYXlDaGFydChkYXRhLCBvcHRpb25zKVxuICB9XG4gIGdldDI0SHJPcHRpb25zKCkge1xuICAgIGNvbnN0IG5hbWUgPSAnMjQgSG91ciBGb3JlY2FzdCdcbiAgICBjb25zdCB0aXRsZSA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogbmFtZSwgY29sb3I6IHRoaXMudHh0LCBmb250OiB7IHNpemU6IDE2IH0gfVxuICAgIGNvbnN0IGdyaWQgPSB7IGRpc3BsYXk6IHRydWUsIGNvbG9yOiB0aGlzLmdyaWRDb2xvciB9XG4gICAgY29uc3QgdGl0bGVYID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnVGltZScgfVxuICAgIGNvbnN0IHNjYWxlWCA9IHsgdGl0bGU6IHRpdGxlWCwgZ3JpZCB9XG4gICAgY29uc3QgdGl0bGVZID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnVGVtcGVyYXR1cmUgKFxcdTAwQjBGKScgfVxuICAgIGNvbnN0IHNjYWxlWSA9IHsgdGl0bGU6IHRpdGxlWSwgZ3JpZCwgcG9zaXRpb246ICdsZWZ0JyB9XG4gICAgY29uc3QgdGl0bGVZMiA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1BlcmNlbnQgKCUpJyB9XG4gICAgY29uc3Qgc2NhbGVZMiA9IHtcbiAgICAgIHRpdGxlOiB0aXRsZVkyLFxuICAgICAgZ3JpZCxcbiAgICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICBtYXg6IDEwMCxcbiAgICB9XG4gICAgcmV0dXJuIHsgcGx1Z2luczogeyB0aXRsZSB9LCBzY2FsZXM6IHsgeDogc2NhbGVYLCB5OiBzY2FsZVksIHkyOiBzY2FsZVkyIH0gfVxuICB9XG4gIHNldDI0SHJEYXRhKGRhdGEpIHtcbiAgICBjb25zdCB0ZW1wID0ge1xuICAgICAgbGFiZWw6ICdUZW1wZXJhdHVyZScsXG4gICAgICBkYXRhOiBkYXRhLnRlbXAsXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuT3JhbmdlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSB7XG4gICAgICBsYWJlbDogJzcywrBGJyxcbiAgICAgIGRhdGE6IGRhdGEucm9vbSxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5HcmVlbixcbiAgICAgIHBvaW50UmFkaXVzOiAwLFxuICAgICAgYm9yZGVyRGFzaDogWzUsIDVdLFxuICAgIH1cbiAgICBjb25zdCByYWluID0ge1xuICAgICAgbGFiZWw6ICdSYWluJyxcbiAgICAgIGRhdGE6IGRhdGEucmFpbixcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5CbHVlLFxuICAgICAgcG9pbnRSYWRpdXM6IDMsXG4gICAgICB5QXhpc0lEOiAneTInLFxuICAgIH1cbiAgICBjb25zdCBodW0gPSB7XG4gICAgICBsYWJlbDogJ0h1bWlkaXR5JyxcbiAgICAgIGRhdGE6IGRhdGEuaHVtLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLlB1cnBsZSxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgIH1cbiAgICByZXR1cm4geyBsYWJlbHM6IGRhdGEudGltZSwgZGF0YXNldHM6IFt0ZW1wLCByb29tLCByYWluLCBodW1dIH1cbiAgfVxufVxuXG5jb25zdCBOV1MgPSBuZXcgTmF0aW9uYWxXZWF0aGVyU2VydmljZUFQSSgpXG5cbmNsYXNzIFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5IGV4dGVuZHMgTGlua1V0aWxpdHkge1xuICBkaXNwbGF5RElWXG4gIHdlYXRoZXJEaXZMZWZ0XG4gIHdlYXRoZXJEaXZSaWdodFxuICB3ZWF0aGVyQWxlcnRzXG4gIHdlZWtGb3JlY2FzdFxuICBzZXZlbkRheUNoYXJ0XG4gIHR3ZW50eWZvdXJob3VyQ2hhcnRcbiAgRml4ZWRDb29yZHMgPSB7IGxhdGl0dWRlOiAyNi4zMDg1LCBsb25naXR1ZGU6IC05OC4xMDE2IH1cbiAgY29uc3RydWN0b3IoZGlzcGxheUlkLCBsaW5rSWQpIHtcbiAgICBzdXBlcihsaW5rSWQpXG4gICAgc3VwZXIuc2V0TGluayhOV1MuTElOSy50aXRsZSwgTldTLkxJTksudGFyZ2V0LCB0cnVlKVxuICAgIHRoaXMuZGlzcGxheURJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpc3BsYXlJZClcbiAgICBjb25zdCBURU1QTEFURSA9IGBcbiAgICAgIDxkaXYgaWQ9XCJ3ZWF0aGVyQ29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBpZD0nd2VhdGhlckRpdkxlZnQnPjwvZGl2PjxkaXYgaWQ9J3dlYXRoZXJEaXZSaWdodCc+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJhbGVydHNJZFwiPjwvZGl2PlxcbjxkaXYgaWQ9XCJmb3JlY2FzdERpdlwiPlxcbjwvZGl2PlxuICAgICAgPGRpdiBpZD1cImNoYXJ0T25lRGl2XCI+PC9kaXY+PGRpdiBpZD1cImNoYXJ0VHdvRGl2XCI+PC9kaXY+XG4gICAgICBgXG4gICAgdGhpcy5kaXNwbGF5RElWLmlubmVySFRNTCA9IFRFTVBMQVRFXG4gICAgdGhpcy53ZWF0aGVyRGl2TGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWF0aGVyRGl2TGVmdCcpXG4gICAgdGhpcy53ZWF0aGVyRGl2UmlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2VhdGhlckRpdlJpZ2h0JylcbiAgICB0aGlzLndlYXRoZXJBbGVydHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWxlcnRzSWQnKVxuICAgIHRoaXMud2Vla0ZvcmVjYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvcmVjYXN0RGl2JylcbiAgICB0aGlzLnNldmVuRGF5Q2hhcnQgPSBuZXcgV2VhdGhlckNoYXJ0SlMoJ2NoYXJ0T25lRGl2JylcbiAgICB0aGlzLnR3ZW50eWZvdXJob3VyQ2hhcnQgPSBuZXcgV2VhdGhlckNoYXJ0SlMoJ2NoYXJ0VHdvRGl2JylcbiAgfVxuICBhc3luYyBzZXREaXNwbGF5KHVzZUdlb0xvY2F0aW9uKSB7XG4gICAgLy9jb25zdCBjb29yZHMgPSBhd2FpdCBOV1MuZ2V0Q29vcmRzKClcbiAgICBsZXQgY29vcmRzID0gdGhpcy5GaXhlZENvb3Jkc1xuICAgIGlmICh1c2VHZW9Mb2NhdGlvbikge1xuICAgICAgY29vcmRzID0gKGF3YWl0IE5XUy5nZXRDb29yZHMoKSkgfHwgY29vcmRzXG4gICAgfVxuICAgIGF3YWl0IE5XUy5mZXRjaFBvaW50cyhjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGUpXG4gICAgY29uc29sZS5sb2coYERpc3BsYXlpbmcgJHtOV1MubG9jYXRpb25OYW1lfTogJHtOV1MuZW5kcG9pbnRzLmZvcmVjYXN0fSFgKVxuICAgIGF3YWl0IHRoaXMuc2V0Q3VycmVudFdlYXRoZXIoKVxuICAgIGF3YWl0IHRoaXMuc2V0Rm9yZWNhc3RBbmRDaGFydCgpXG4gICAgYXdhaXQgdGhpcy5zZXRBY3RpdmVBbGVydHMoKVxuICB9XG4gIGFzeW5jIHNldEN1cnJlbnRXZWF0aGVyKCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBOV1MuZmV0Y2hDdXJyZW50V2VhdGhlcigpXG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmRhdGUsIDEuMSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmxvY2F0aW9uLCAxLjQpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC50ZW1wZXJhdHVyZSwgMykpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LndpbmQsIDEuNSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LmZvcmVjYXN0LCAxKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQuaHVtaWRpdHksIDEpKVxuICAgIHRoaXMud2VhdGhlckRpdkxlZnQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpXG4gICAgdGhpcy50d2VudHlmb3VyaG91ckNoYXJ0LnNldDI0SHJDaGFydChjdXJyZW50LmNoYXJ0KVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUxpbmUoY29udGVudCwgc2l6ZSkge1xuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIGRpdi5zdHlsZS5mb250U2l6ZSA9IGAke3NpemV9cmVtYFxuICAgICAgZGl2LmlubmVySFRNTCA9IGNvbnRlbnRcbiAgICAgIHJldHVybiBkaXZcbiAgICB9XG4gIH1cbiAgYXN5bmMgc2V0Rm9yZWNhc3RBbmRDaGFydCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgTldTLmZldGNoRm9yZWNhc3RXZWF0aGVyKClcbiAgICB0aGlzLndlYXRoZXJEaXZSaWdodC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjEuMnJlbTtcIj4ke2RhdGEubmFtZVswXX08L2Rpdj5cbiAgICAgIDxpbWcgc3JjPVwiJHtkYXRhLmljb25bMF19XCIgYWx0PVwiaWNvblwiIHRpdGxlPVwiJHtkYXRhLmZvcmVjYXN0WzBdfVwiPlxuICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjhyZW07XCI+JHtkYXRhLnRlbXBlcmF0dXJlWzBdfSZkZWc7RjwvZGl2PlxuICAgICAgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZTowLjhyZW07XCI+JHtkYXRhLndpbmRbMF19PC9kaXY+XG4gICAgICA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjAuOHJlbTtcIj4ke2RhdGEucmFpblswXX0lIENoYW5jZSBSYWluPC9kaXY+XG4gICAgICBgXG4gICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IGRhdGEubmFtZS5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGNvbnN0IGlzRGF5dGltZSA9IGRhdGEuaXNEYXl0aW1lW2ldXG4gICAgICBpZiAoIWlzRGF5dGltZSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZm9yZWNhc3REYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBmb3JlY2FzdERheS5jbGFzc0xpc3QuYWRkKCdkYXktY2FyZCcpXG4gICAgICAgIGZvcmVjYXN0RGF5LnNldEF0dHJpYnV0ZSgndGl0bGUnLCBgJHtkYXRhLm5hbWVbaV19OiAke2RhdGEuZm9yZWNhc3RbaV19YClcbiAgICAgICAgZm9yZWNhc3REYXkuaW5uZXJIVE1MID0gYFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZGF5XCI+JHtkYXRhLm5hbWVbaV0uc3Vic3RyaW5nKDAsIDMpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInJhaW5cIj4ke2RhdGEucmFpbltpXX0lPC9zcGFuPlxuICAgICAgICAgIDxpbWcgc3JjPVwiJHtkYXRhLmljb25baV19XCIgYWx0PVwiaWNvblwiIGhlaWdodD1cImF1dG9cIiB3aWR0aD1cIjc1JVwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaGlcIj4ke2RhdGEudGVtcGVyYXR1cmVbaV19JmRlZ0Y8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJsb1wiPiR7ZGF0YS50ZW1wZXJhdHVyZVtpICsgMV19JmRlZ0Y8L3NwYW4+XG4gICAgICAgIGBcbiAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZm9yZWNhc3REYXkpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMud2Vla0ZvcmVjYXN0LmFwcGVuZENoaWxkKGZyYWdtZW50KVxuICAgIHRoaXMuc2V2ZW5EYXlDaGFydC5zZXQ3RGF5Q2hhcnQoZGF0YS5jaGFydCwgZGF0YS5sb2NhdGlvbilcbiAgfVxuICBhc3luYyBzZXRBY3RpdmVBbGVydHMoKSB7XG4gICAgY29uc3QgYWxlcnREYXRhID0gYXdhaXQgTldTLmZldGNoQWxlcnRzKClcbiAgICBpZiAoYWxlcnREYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5sb2coYE5vIGFjdGl2ZSBhbGVydHMgZm91bmQuYClcbiAgICB9XG4gICAgZm9yIChjb25zdCBmZWF0dXJlIG9mIGFsZXJ0RGF0YSkge1xuICAgICAgY29uc3QgYWxlcnRUaXRsZSA9IGAke2ZlYXR1cmUubWVzc2FnZVR5cGV9OiAke2ZlYXR1cmUuZXZlbnR9IC8gJHtmZWF0dXJlLnNldmVyaXR5fWBcbiAgICAgIGNvbnN0IGluZm9ybWF0aW9uID0gYCR7ZmVhdHVyZS5kZXNjcmlwdGlvbn1cXG4ke2ZlYXR1cmUuaW5zdHJ1Y3Rpb24gfHwgJyd9YFxuICAgICAgY29uc3QgYWxlcnRNZXNzYWdlID0gYCR7ZmVhdHVyZS5oZWFkbGluZX1cXG4ke2luZm9ybWF0aW9ufWBcbiAgICAgIGlmIChmZWF0dXJlLnN0YXR1cyA9PT0gJ0FjdHVhbCcpIHtcbiAgICAgICAgY29uc3Qgd2VhdGhlckFsZXJ0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgd2VhdGhlckFsZXJ0LnNldEF0dHJpYnV0ZSgndGl0bGUnLCBmZWF0dXJlLmhlYWRsaW5lKVxuICAgICAgICB3ZWF0aGVyQWxlcnQuc3R5bGUucGFkZGluZyA9ICc1cHgnXG4gICAgICAgIHdlYXRoZXJBbGVydC5pbm5lckhUTUwgPSBhbGVydFRpdGxlXG4gICAgICAgIHdlYXRoZXJBbGVydC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgIGFsZXJ0KGFsZXJ0TWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndlYXRoZXJBbGVydHMuYXBwZW5kQ2hpbGQod2VhdGhlckFsZXJ0KVxuICAgICAgfVxuICAgICAgdGhpcy5sb2dBY3RpdmVBbGVydHMoZmVhdHVyZSwgYWxlcnRUaXRsZSwgaW5mb3JtYXRpb24pXG4gICAgfVxuICB9XG4gIGxvZ0FjdGl2ZUFsZXJ0cyhmZWF0dXJlLCBhbGVydFRpdGxlLCBpbmZvcm1hdGlvbikge1xuICAgIGNvbnNvbGUuZ3JvdXAoYWxlcnRUaXRsZSlcbiAgICBjb25zb2xlLmxvZyhgU3RhdHVzOiAke2ZlYXR1cmUuc3RhdHVzfWApXG4gICAgY29uc29sZS5ncm91cENvbGxhcHNlZChmZWF0dXJlLmhlYWRsaW5lKVxuICAgIGNvbnNvbGUuaW5mbyhpbmZvcm1hdGlvbilcbiAgICBjb25zb2xlLmxvZyhgVXJnZW5jeTogJHtmZWF0dXJlLnVyZ2VuY3l9IC8gQ2VydGFpbnR5OiAke2ZlYXR1cmUuY2VydGFpbnR5fWApXG4gICAgY29uc29sZS5ncm91cEVuZCgpXG4gICAgY29uc29sZS5ncm91cEVuZCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXZWF0aGVyRm9yZWNhc3REYXRhRGlzcGxheVxuIiwiY2xhc3MgR2VvTG9jYXRpb25VdGlsaXR5IHtcbiAgc3RhdGljIGFzeW5jIGdldENvb3JkaW5hdGVzKCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGVuYWJsZUhpZ2hBY2N1cmFjeTogZmFsc2UsIHRpbWVvdXQ6IDUwMDAsIG1heGltdW1BZ2U6IDAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdWNjZXNzID0gcG9zaXRpb24gPT4ge1xuICAgICAgICByZXNvbHZlKHBvc2l0aW9uLmNvb3JkcylcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVycm9yID0gZXJyb3IgPT4ge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKVxuICAgICAgfVxuICAgICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignR2VvbG9jYXRpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYnJvd3Nlci4nKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oc3VjY2VzcywgZXJyb3IsIG9wdGlvbnMpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBzdGF0aWMgZ2V0TG9jYWxlcygpIHtcbiAgICBpZiAoIW5hdmlnYXRvci5sYW5ndWFnZXMpIHtcbiAgICAgIHJldHVybiAnZW4tVVMnXG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubGFuZ3VhZ2VzXG4gIH1cbn1cblxuY2xhc3MgV2VhdGhlclV0aWxpdHkge1xuICBzdGF0aWMgYXN5bmMgZmV0Y2hEYXRhKGVuZHBvaW50KSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChlbmRwb2ludClcbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoeyAnVXNlci1BZ2VudCc6ICdodHRwczovL2dpdGh1Yi5jb20vZmVsaXh0aGVjYXQ4YScgfSlcbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLCB7IGhlYWRlcnMgfSlcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJlcXVlc3QpXG4gICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGAke3Jlc3BvbnNlLnN0YXR1c30gRGF0YSBOb3QgRm91bmQ6ICR7cmVzcG9uc2UudXJsfWApXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbiAgc3RhdGljIGZvcm1hdERhdGUoZGF0ZVRpbWUpIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVRpbWUpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgZGF0ZVN0eWxlOiAnZnVsbCcgfVxuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChHZW9Mb2NhdGlvblV0aWxpdHkuZ2V0TG9jYWxlcygpLCBvcHRpb25zKS5mb3JtYXQoZGF0ZSlcbiAgfVxuICBzdGF0aWMgZm9ybWF0VGltZShkYXRlVGltZSkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShkYXRlVGltZSlcbiAgICBjb25zdCBvcHRpb25zID0geyB0aW1lU3R5bGU6ICdzaG9ydCcgfVxuICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChHZW9Mb2NhdGlvblV0aWxpdHkuZ2V0TG9jYWxlcygpLCBvcHRpb25zKS5mb3JtYXQoZGF0ZSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgR2VvTG9jYXRpb25VdGlsaXR5LCBXZWF0aGVyVXRpbGl0eSB9XG4iLCJyZXF1aXJlKCcuLi9zY3NzL3N0eWxlLnNjc3MnKVxuY29uc3QgU3RhdHVzVXRpbGl0eSA9IHJlcXVpcmUoJy4vdXRpbHMvc3RhdHVzJylcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgZGlzcGxheVdlYXRoZXJGb3JlY2FzdChmYWxzZSlcbn0pXG5cbmNvbnN0IGFwaVNFTEVDVCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcGlTZWxlY3QnKVxuYXBpU0VMRUNULmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIGV2ZW50ID0+IHtcbiAgY29uc3Qgc3RhdHVzRGl2ID0gbmV3IFN0YXR1c1V0aWxpdHkoJ3N0YXR1c0RpdicpXG4gIGNvbnN0IHdlYXRoZXJMb2NhdGlvbiA9IGV2ZW50LnRhcmdldC52YWx1ZVxuICB0cnkge1xuICAgIHN3aXRjaCAod2VhdGhlckxvY2F0aW9uKSB7XG4gICAgICBjYXNlICdzaG93RGVmYXVsdCc6XG4gICAgICAgIHN0YXR1c0Rpdi5zZXRMb2FkaW5nKCdMb2NhdGluZycpXG4gICAgICAgIGF3YWl0IGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QoZmFsc2UpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaG93Rm9yZWNhc3QnOlxuICAgICAgICBzdGF0dXNEaXYuc2V0TG9hZGluZygnTG9jYXRpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KHRydWUpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaG93Q2F0JzpcbiAgICAgICAgc3RhdHVzRGl2LnNldExvYWRpbmcoJ01lb3dpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5Q2F0KClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Nob3dDYXRTbGlkZXInOlxuICAgICAgICBzdGF0dXNEaXYuc2V0TG9hZGluZygnTWVvd2luZycpXG4gICAgICAgIGF3YWl0IGRpc3BsYXlDYXRTbGlkZXIoKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgc3RhdHVzRGl2LmNsZWFyU3RhdHVzKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhd2FpdCBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KGZhbHNlKVxuICAgIHN0YXR1c0Rpdi5zZXRFcnJvcihlcnJvcilcbiAgfVxufSlcblxuY29uc3QgV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXkgPSByZXF1aXJlKCcuL2xpYnMvZm9yZWNhc3RMaWInKVxuYXN5bmMgZnVuY3Rpb24gZGlzcGxheVdlYXRoZXJGb3JlY2FzdCh1c2VHZW9Mb2NhdGlvbikge1xuICBjb25zdCBmb3JlY2FzdCA9IG5ldyBXZWF0aGVyRm9yZWNhc3REYXRhRGlzcGxheSgnZGlzcGxheURpdicsICdhcGlMaW5rJylcbiAgYXdhaXQgZm9yZWNhc3Quc2V0RGlzcGxheSh1c2VHZW9Mb2NhdGlvbilcbn1cblxuY29uc3QgeyBSYW5kb21DYXRJbWFnZURpc3BsYXksIFJhbmRvbUNhdEltYWdlU2xpZGVyIH0gPSByZXF1aXJlKCcuL2xpYnMvY2F0TGliJylcbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlDYXQoKSB7XG4gIGNvbnN0IGNhdCA9IG5ldyBSYW5kb21DYXRJbWFnZURpc3BsYXkoJ2Rpc3BsYXlEaXYnLCAnYXBpTGluaycpXG4gIGF3YWl0IGNhdC5kaXNwbGF5Q2F0KClcbn1cbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlDYXRTbGlkZXIoKSB7XG4gIGNvbnN0IHNsaWRlciA9IG5ldyBSYW5kb21DYXRJbWFnZVNsaWRlcignZGlzcGxheURpdicsICdhcGlMaW5rJylcbiAgYXdhaXQgc2xpZGVyLmRpc3BsYXkoKVxufVxuIiwiY2xhc3MgU3RhdHVzVXRpbGl0eSB7XG4gIHN0YXR1c0RJVlxuICBjb25zdHJ1Y3RvcihzdGF0dXNEaXZFbGVtZW50SWQpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3RhdHVzRGl2RWxlbWVudElkKVxuICAgIGlmICghZWxlbWVudCB8fCAhKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRGl2RWxlbWVudCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU3RhdHVzIERpdiBFbGVtZW50IE5vdCBGb3VuZCBvciBOb3QgYSBESVZgKVxuICAgIH1cbiAgICB0aGlzLnN0YXR1c0RJViA9IGVsZW1lbnRcbiAgfVxuICBzZXRTdGF0dXMoc3RhdHVzKSB7XG4gICAgdGhpcy5zdGF0dXNESVYudGV4dENvbnRlbnQgPSBzdGF0dXMgPz8gJydcbiAgfVxuICBjbGVhclN0YXR1cygpIHtcbiAgICB0aGlzLnN0YXR1c0RJVi50ZXh0Q29udGVudCA9ICcnXG4gIH1cbiAgc2V0RXJyb3IobWVzc2FnZSkge1xuICAgIHRoaXMuY2xlYXJTdGF0dXMoKVxuICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGFuLnRleHRDb250ZW50ID0gbWVzc2FnZVxuICAgIHNwYW4uc3R5bGUuY29sb3IgPSAncGFsZXZpb2xldHJlZCdcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZChzcGFuKVxuICB9XG4gIHNldExvYWRpbmcobWVzc2FnZSkge1xuICAgIHRoaXMuY2xlYXJTdGF0dXMoKVxuICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSlcbiAgICBjb25zdCBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bpbm5lci5jbGFzc05hbWUgPSAnc3Bpbm5lcidcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSlcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZChzcGlubmVyKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHVzVXRpbGl0eVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJ0ZW1wZXJhdHVyZVwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2V4YW1wbGVcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInNyY19zY3NzX3N0eWxlX3Njc3NcIixcInNyY19qc19saWJzX2NhdExpYl9qc1wiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy90ZW1wZXJhdHVyZS5qc1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==