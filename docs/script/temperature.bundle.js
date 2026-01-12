/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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
        //statusDiv.setLoading('Loading')
        statusDiv.loadCat('loading')
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
  loadWeather(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'cloudLoader'
    this.statusDIV.appendChild(textNode)
    this.statusDIV.appendChild(spinner)
  }
  loadCat(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'catLoader'
    spinner.innerHTML = `
    <div class="catcontainer">
      <div class="cat">
          <div class="ear left"></div>
          <div class="ear right"></div>
          <div class="eye left"></div>
          <div class="eye right"></div>
          <div class="nose"></div>
      </div>
    </div>
    `
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9saWJzL2ZvcmVjYXN0TGliLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvbGlicy93ZWF0aGVyLmpzIiwid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvdGVtcGVyYXR1cmUuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy91dGlscy9zdGF0dXMuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBMaW5rVXRpbGl0eSA9IHJlcXVpcmUoJy4uL3V0aWxzL2xpbmsnKVxuY29uc3QgeyBHZW9Mb2NhdGlvblV0aWxpdHksIFdlYXRoZXJVdGlsaXR5LCBjcmVhdGVMaW5lLCBjcmVhdGVJY29uIH0gPSByZXF1aXJlKCcuL3dlYXRoZXInKVxuXG5jbGFzcyBOYXRpb25hbFdlYXRoZXJTZXJ2aWNlQVBJIHtcbiAgTElOSyA9IHtcbiAgICB0aXRsZTogJ05hdGlvbmFsIFdlYXRoZXIgU2VydmljZScsXG4gICAgdGFyZ2V0OiAnaHR0cHM6Ly93d3cud2VhdGhlci5nb3YnLFxuICB9XG4gIEFQSV9VUkwgPSAnaHR0cHM6Ly9hcGkud2VhdGhlci5nb3YnXG4gIGVuZHBvaW50c1xuICBsb2NhdGlvbk5hbWVcbiAgcG9pbnRcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbmRwb2ludHMgPSB7IGZvcmVjYXN0SG91cmx5OiAnJywgZm9yZWNhc3Q6ICcnIH1cbiAgICB0aGlzLmxvY2F0aW9uTmFtZSA9ICcnXG4gICAgdGhpcy5wb2ludCA9ICcnXG4gIH1cbiAgYXN5bmMgZ2V0Q29vcmRzKCkge1xuICAgIGNvbnN0IGNvb3JkcyA9IGF3YWl0IEdlb0xvY2F0aW9uVXRpbGl0eS5nZXRDb29yZGluYXRlcygpXG4gICAgcmV0dXJuIHsgbGF0aXR1ZGU6IGNvb3Jkcy5sYXRpdHVkZSwgbG9uZ2l0dWRlOiBjb29yZHMubG9uZ2l0dWRlIH1cbiAgfVxuICBhc3luYyBmZXRjaERhdGEodXJsKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IFdlYXRoZXJVdGlsaXR5LmZldGNoRGF0YSh1cmwpXG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuICBhc3luYyBmZXRjaFBvaW50cyhsYXQsIGxvbmcsIGxvZykge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoRGF0YShgJHt0aGlzLkFQSV9VUkx9L3BvaW50cy8ke2xhdH0sJHtsb25nfWApXG4gICAgaWYgKGxvZykge1xuICAgICAgY29uc29sZS5sb2coJ1BvaW50czogJywgZGF0YS5pZClcbiAgICB9XG4gICAgY29uc3QgcHJvcHMgPSBkYXRhLnByb3BlcnRpZXNcbiAgICB0aGlzLmVuZHBvaW50cyA9IHsgZm9yZWNhc3RIb3VybHk6IHByb3BzLmZvcmVjYXN0SG91cmx5LCBmb3JlY2FzdDogcHJvcHMuZm9yZWNhc3QgfVxuICAgIGNvbnN0IGxvY2F0aW9uRGF0YSA9IHByb3BzLnJlbGF0aXZlTG9jYXRpb24ucHJvcGVydGllc1xuICAgIHRoaXMubG9jYXRpb25OYW1lID0gYCR7bG9jYXRpb25EYXRhLmNpdHl9LCAke2xvY2F0aW9uRGF0YS5zdGF0ZX1gXG4gICAgY29uc3QgY29vcmRpbmF0ZXMgPSBwcm9wcy5yZWxhdGl2ZUxvY2F0aW9uLmdlb21ldHJ5LmNvb3JkaW5hdGVzXG4gICAgdGhpcy5wb2ludCA9IGAke2Nvb3JkaW5hdGVzWzFdLnRvRml4ZWQoNCl9LCR7Y29vcmRpbmF0ZXNbMF0udG9GaXhlZCg0KX1gXG4gIH1cbiAgYXN5bmMgZmV0Y2hDdXJyZW50V2VhdGhlcigpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaERhdGEodGhpcy5lbmRwb2ludHMuZm9yZWNhc3RIb3VybHkpXG4gICAgY29uc3QgY3VycmVudCA9IGRhdGEucHJvcGVydGllcy5wZXJpb2RzWzBdXG4gICAgY29uc3QgY2hhcnQgPSBkYXRhLnByb3BlcnRpZXMucGVyaW9kcy5zbGljZSgxLCAyNSlcbiAgICBjb25zdCB0ZW1wZXJhdHVyZSA9IGNoYXJ0Lm1hcChwID0+IHAudGVtcGVyYXR1cmUpXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2F0aW9uOiB0aGlzLmxvY2F0aW9uTmFtZSxcbiAgICAgIGRhdGU6IFdlYXRoZXJVdGlsaXR5LmZvcm1hdERhdGUoY3VycmVudC5zdGFydFRpbWUpLFxuICAgICAgdGVtcGVyYXR1cmU6IGAke2N1cnJlbnQudGVtcGVyYXR1cmV9wrAke2N1cnJlbnQudGVtcGVyYXR1cmVVbml0fWAsXG4gICAgICB3aW5kOiBgJHtjdXJyZW50LndpbmRTcGVlZH0gJHtjdXJyZW50LndpbmREaXJlY3Rpb259YCxcbiAgICAgIGZvcmVjYXN0OiBjdXJyZW50LnNob3J0Rm9yZWNhc3QsXG4gICAgICBodW1pZGl0eTogYCR7Y3VycmVudC5yZWxhdGl2ZUh1bWlkaXR5LnZhbHVlfSUgUkhgLFxuICAgICAgaWNvbjogY3VycmVudC5pY29uLFxuICAgICAgY2hhcnQ6IHtcbiAgICAgICAgdGVtcDogdGVtcGVyYXR1cmUsXG4gICAgICAgIHJvb206IEFycmF5KHRlbXBlcmF0dXJlLmxlbmd0aCkuZmlsbCg3MiksXG4gICAgICAgIG1pbjogTWF0aC5taW4oLi4udGVtcGVyYXR1cmUsIDcyKSAtIDUsXG4gICAgICAgIG1heDogTWF0aC5tYXgoLi4udGVtcGVyYXR1cmUsIDcyKSArIDUsXG4gICAgICAgIHJhaW46IGNoYXJ0Lm1hcChwID0+IHAucHJvYmFiaWxpdHlPZlByZWNpcGl0YXRpb24udmFsdWUpLFxuICAgICAgICB0aW1lOiBjaGFydC5tYXAocCA9PiBXZWF0aGVyVXRpbGl0eS5mb3JtYXRUaW1lKHAuZW5kVGltZSkpLFxuICAgICAgICBodW06IGNoYXJ0Lm1hcChwID0+IHAucmVsYXRpdmVIdW1pZGl0eS52YWx1ZSB8IDApLFxuICAgICAgfSxcbiAgICB9XG4gIH1cbiAgYXN5bmMgZmV0Y2hGb3JlY2FzdFdlYXRoZXIoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2hEYXRhKHRoaXMuZW5kcG9pbnRzLmZvcmVjYXN0KVxuICAgIGNvbnN0IGZvcmVjYXN0ID0gZGF0YS5wcm9wZXJ0aWVzLnBlcmlvZHNcbiAgICByZXR1cm4ge1xuICAgICAgbG9jYXRpb246IHRoaXMubG9jYXRpb25OYW1lLFxuICAgICAgaXNEYXl0aW1lOiBmb3JlY2FzdC5tYXAocCA9PiBwLmlzRGF5dGltZSksXG4gICAgICBuYW1lOiBmb3JlY2FzdC5tYXAocCA9PiBwLm5hbWUpLFxuICAgICAgdGVtcGVyYXR1cmU6IGZvcmVjYXN0Lm1hcChwID0+IHAudGVtcGVyYXR1cmUpLFxuICAgICAgd2luZDogZm9yZWNhc3QubWFwKHAgPT4gYCR7cC53aW5kU3BlZWR9ICR7cC53aW5kRGlyZWN0aW9ufWApLFxuICAgICAgZm9yZWNhc3Q6IGZvcmVjYXN0Lm1hcChwID0+IHAuZGV0YWlsZWRGb3JlY2FzdCksXG4gICAgICByYWluOiBmb3JlY2FzdC5tYXAocCA9PiBwLnByb2JhYmlsaXR5T2ZQcmVjaXBpdGF0aW9uLnZhbHVlIHwgMCksXG4gICAgICBpY29uOiBmb3JlY2FzdC5tYXAocCA9PiBwLmljb24pLFxuICAgICAgY2hhcnQ6IHNldHNldmVuRGF5Q2hhcnREYXRhKGZvcmVjYXN0KSxcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0c2V2ZW5EYXlDaGFydERhdGEoZm9yZWNhc3QpIHtcbiAgICAgIGNvbnN0IERheXRpbWUgPSBmb3JlY2FzdC5maWx0ZXIocCA9PiBwLmlzRGF5dGltZSlcbiAgICAgIGNvbnN0IE5pZ2h0dGltZSA9IGZvcmVjYXN0LmZpbHRlcihwID0+ICFwLmlzRGF5dGltZSlcbiAgICAgIGNvbnN0IGhpZ2ggPSBEYXl0aW1lLm1hcChwID0+IHAudGVtcGVyYXR1cmUpXG4gICAgICBjb25zdCBtYXggPSBNYXRoLm1heCguLi5oaWdoKSArIDVcbiAgICAgIGNvbnN0IGxvdyA9IE5pZ2h0dGltZS5tYXAocCA9PiBwLnRlbXBlcmF0dXJlKVxuICAgICAgY29uc3QgbWluID0gTWF0aC5taW4oLi4ubG93LCA3MikgLSA1XG4gICAgICBjb25zdCByb29tID0gQXJyYXkoaGlnaC5sZW5ndGgpLmZpbGwoNzIpXG4gICAgICBjb25zdCB0ZW1wID0geyBoaWdoLCBsb3csIHJvb20sIG1heCwgbWluIH1cbiAgICAgIGNvbnN0IHJhaW4gPSBEYXl0aW1lLm1hcChwID0+IHAucHJvYmFiaWxpdHlPZlByZWNpcGl0YXRpb24udmFsdWUgPz8gMClcbiAgICAgIGNvbnN0IGRheXMgPSBEYXl0aW1lLm1hcChwID0+IHAubmFtZSlcbiAgICAgIHJldHVybiB7IHRlbXAsIHJhaW4sIGRheXMgfVxuICAgIH1cbiAgfVxuICBhc3luYyBmZXRjaEFsZXJ0cygpIHtcbiAgICBjb25zdCBhbGVydHNVUkkgPSBgJHt0aGlzLkFQSV9VUkx9L2FsZXJ0cy9hY3RpdmU/cG9pbnQ9JHt0aGlzLnBvaW50fWBcbiAgICBjb25zdCBhbGVydHMgPSBhd2FpdCB0aGlzLmZldGNoRGF0YShhbGVydHNVUkkpXG4gICAgcmV0dXJuIGFsZXJ0cy5mZWF0dXJlc1xuICB9XG59XG5cbmNsYXNzIFdlYXRoZXJDaGFydEpTIHtcbiAgdHh0ID0gJyNjY2MnXG4gIGJnQ29sb3IgPSAnIzMzMydcbiAgZ3JpZENvbG9yID0gJyM1NTUnXG4gIGxpbmVDb2xvciA9IHtcbiAgICBCbHVlOiAnIzM2QTJFQicsXG4gICAgUmVkOiAnI0ZGNjM4NCcsXG4gICAgT3JhbmdlOiAnI0ZGOUY0MCcsXG4gICAgWWVsbG93OiAnI0ZGQ0Q1NicsXG4gICAgR3JlZW46ICcjNEJDMEMwJyxcbiAgICBQdXJwbGU6ICcjOTk2NkZGJyxcbiAgICBHcmV5OiAnI0M5Q0JDRScsXG4gIH1cbiAgY2hhcnRESVZcbiAgY3R4XG4gIGNvbnN0cnVjdG9yKGNoYXJ0SUQpIHtcbiAgICB0aGlzLmNoYXJ0RElWID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2hhcnRJRClcbiAgICBjb25zdCBjYW52YXNJRCA9IGAke2NoYXJ0SUR9Q1RYYFxuICAgIHRoaXMuY2hhcnRESVYuaW5uZXJIVE1MID0gYDxkaXY+PGNhbnZhcyBpZD0nJHtjYW52YXNJRH0nPjwvY2FudmFzPjwvZGl2PmBcbiAgICB0aGlzLmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNhbnZhc0lEKVxuICB9XG4gIGRpc3BsYXlDaGFydChkYXRhLCBvcHRpb25zKSB7XG4gICAgY29uc3QgeyBDaGFydCB9ID0gd2luZG93XG4gICAgQ2hhcnQuZGVmYXVsdHMuY29sb3IgPSB0aGlzLnR4dFxuICAgIHRoaXMuY3R4LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuYmdDb2xvclxuICAgIGNvbnN0IGNvbmZpZyA9IHsgdHlwZTogJ2xpbmUnLCBkYXRhLCBvcHRpb25zIH1cbiAgICBjb25zdCB0ZW1wZXJhdHVyZUNoYXJ0ID0gbmV3IENoYXJ0KHRoaXMuY3R4LCBjb25maWcpXG4gICAgdGhpcy5zZXRDaGFydFdpZHRoKHRlbXBlcmF0dXJlQ2hhcnQpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q2hhcnRXaWR0aCh0ZW1wZXJhdHVyZUNoYXJ0KVxuICAgIH0pXG4gIH1cbiAgc2V0Q2hhcnRXaWR0aCh3ZWF0aGVyQ2hhcnQpIHtcbiAgICBjb25zdCBjaGFydFN0eWxlID0gd2VhdGhlckNoYXJ0LmNhbnZhcy5wYXJlbnROb2RlLnN0eWxlXG4gICAgY2hhcnRTdHlsZS5tYXJnaW4gPSAnYXV0bydcbiAgICBjb25zdCBzY3JlZW5XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgd2VhdGhlckNoYXJ0LnJlc2l6ZShzY3JlZW5XaWR0aCwgJ2F1dG8nKVxuICAgIGNoYXJ0U3R5bGUud2lkdGggPSAnMTAwJSdcbiAgfVxuICBzZXQ3RGF5Q2hhcnQoY2hhcnREYXRhLCBsb2NhdGlvbk5hbWUpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5zZXQ3RGF5RGF0YShjaGFydERhdGEpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuc2V0N0RheU9wdGlvbnMobG9jYXRpb25OYW1lKVxuICAgIHRoaXMuZGlzcGxheUNoYXJ0KGRhdGEsIG9wdGlvbnMpXG4gIH1cbiAgc2V0N0RheURhdGEoY2hhcnREYXRhKSB7XG4gICAgY29uc3QgaGlnaERhdGFTZXQgPSB7XG4gICAgICB0eXBlOiAnbGluZScsXG4gICAgICBsYWJlbDogJ0hpZ2hzJyxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5SZWQsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICAgIGRhdGE6IGNoYXJ0RGF0YS50ZW1wLmhpZ2gsXG4gICAgfVxuICAgIGNvbnN0IGxvd0RhdGFTZXQgPSB7XG4gICAgICB0eXBlOiAnbGluZScsXG4gICAgICBsYWJlbDogJ0xvd3MnLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLkJsdWUsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICAgIGRhdGE6IGNoYXJ0RGF0YS50ZW1wLmxvdyxcbiAgICB9XG4gICAgY29uc3Qgcm9vbURhdGFTZXQgPSB7XG4gICAgICB0eXBlOiAnbGluZScsXG4gICAgICBsYWJlbDogJzcyXFx1MDBCMEYnLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLkdyZWVuLFxuICAgICAgcG9pbnRSYWRpdXM6IDAsXG4gICAgICBkYXRhOiBBcnJheShjaGFydERhdGEudGVtcC5oaWdoLmxlbmd0aCkuZmlsbCg3MiksXG4gICAgICBib3JkZXJEYXNoOiBbNSwgNV0sXG4gICAgfVxuICAgIGNvbnN0IHJhaW5EYXRhU2V0ID0ge1xuICAgICAgdHlwZTogJ2JhcicsXG4gICAgICBsYWJlbDogJ1JhaW4nLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmxpbmVDb2xvci5QdXJwbGUsXG4gICAgICBiYXJUaGlja25lc3M6IDE1LFxuICAgICAgZGF0YTogY2hhcnREYXRhLnJhaW4sXG4gICAgICB5QXhpc0lEOiAneTInLFxuICAgIH1cbiAgICBjb25zdCBkYXRhc2V0cyA9IFtoaWdoRGF0YVNldCwgbG93RGF0YVNldCwgcm9vbURhdGFTZXQsIHJhaW5EYXRhU2V0XVxuICAgIHJldHVybiB7IGxhYmVsczogY2hhcnREYXRhLmRheXMsIGRhdGFzZXRzIH1cbiAgfVxuICBzZXQ3RGF5T3B0aW9ucyhsb2NhdGlvbikge1xuICAgIGNvbnN0IG5hbWUgPSAnV2VhdGhlciBGb3JlY2FzdCdcbiAgICBjb25zdCB0aXRsZSA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogbmFtZSwgY29sb3I6IHRoaXMudHh0LCBmb250OiB7IHNpemU6IDE4IH0gfVxuICAgIGNvbnN0IHN1YnRpdGxlID0geyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiBsb2NhdGlvbiwgY29sb3I6IHRoaXMudHh0LCBmb250OiB7IHNpemU6IDE2IH0gfVxuICAgIGNvbnN0IHBsdWdpbnMgPSB7IHRpdGxlLCBzdWJ0aXRsZSB9XG4gICAgY29uc3QgZ3JpZCA9IHsgZGlzcGxheTogdHJ1ZSwgY29sb3I6IHRoaXMuZ3JpZENvbG9yIH1cbiAgICBjb25zdCBzY2FsZVggPSB7IHRpdGxlOiB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdEYXkgb2YgdGhlIFdlZWsnIH0sIGdyaWQgfVxuICAgIGNvbnN0IHNjYWxlWSA9IHtcbiAgICAgIHRpdGxlOiB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdUZW1wZXJhdHVyZSAoXFx1MDBCMEYpJyB9LFxuICAgICAgZ3JpZCxcbiAgICAgIHBvc2l0aW9uOiAnbGVmdCcsXG4gICAgfVxuICAgIGNvbnN0IHNjYWxlWTIgPSB7XG4gICAgICB0aXRsZTogeyBkaXNwbGF5OiB0cnVlLCB0ZXh0OiAnUGVyY2VudCAoJSknIH0sXG4gICAgICBncmlkLFxuICAgICAgcG9zaXRpb246ICdyaWdodCcsXG4gICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgIHN1Z2dlc3RlZE1heDogMTAwLFxuICAgIH1cbiAgICBjb25zdCBvcHRpb25zID0geyBwbHVnaW5zLCBzY2FsZXM6IHsgeDogc2NhbGVYLCB5OiBzY2FsZVksIHkyOiBzY2FsZVkyIH0gfVxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cbiAgc2V0MjRIckNoYXJ0KGNoYXJ0RGF0YSkge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLnNldDI0SHJEYXRhKGNoYXJ0RGF0YSlcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5nZXQyNEhyT3B0aW9ucygpXG4gICAgdGhpcy5kaXNwbGF5Q2hhcnQoZGF0YSwgb3B0aW9ucylcbiAgfVxuICBnZXQyNEhyT3B0aW9ucygpIHtcbiAgICBjb25zdCBuYW1lID0gJzI0IEhvdXIgRm9yZWNhc3QnXG4gICAgY29uc3QgdGl0bGUgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6IG5hbWUsIGNvbG9yOiB0aGlzLnR4dCwgZm9udDogeyBzaXplOiAxNiB9IH1cbiAgICBjb25zdCBncmlkID0geyBkaXNwbGF5OiB0cnVlLCBjb2xvcjogdGhpcy5ncmlkQ29sb3IgfVxuICAgIGNvbnN0IHRpdGxlWCA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1RpbWUnIH1cbiAgICBjb25zdCBzY2FsZVggPSB7IHRpdGxlOiB0aXRsZVgsIGdyaWQgfVxuICAgIGNvbnN0IHRpdGxlWSA9IHsgZGlzcGxheTogdHJ1ZSwgdGV4dDogJ1RlbXBlcmF0dXJlIChcXHUwMEIwRiknIH1cbiAgICBjb25zdCBzY2FsZVkgPSB7IHRpdGxlOiB0aXRsZVksIGdyaWQsIHBvc2l0aW9uOiAnbGVmdCcgfVxuICAgIGNvbnN0IHRpdGxlWTIgPSB7IGRpc3BsYXk6IHRydWUsIHRleHQ6ICdQZXJjZW50ICglKScgfVxuICAgIGNvbnN0IHNjYWxlWTIgPSB7XG4gICAgICB0aXRsZTogdGl0bGVZMixcbiAgICAgIGdyaWQsXG4gICAgICBwb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgbWF4OiAxMDAsXG4gICAgfVxuICAgIHJldHVybiB7IHBsdWdpbnM6IHsgdGl0bGUgfSwgc2NhbGVzOiB7IHg6IHNjYWxlWCwgeTogc2NhbGVZLCB5Mjogc2NhbGVZMiB9IH1cbiAgfVxuICBzZXQyNEhyRGF0YShkYXRhKSB7XG4gICAgY29uc3QgdGVtcCA9IHtcbiAgICAgIGxhYmVsOiAnVGVtcGVyYXR1cmUnLFxuICAgICAgZGF0YTogZGF0YS50ZW1wLFxuICAgICAgYm9yZGVyQ29sb3I6IHRoaXMubGluZUNvbG9yLk9yYW5nZSxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgIH1cbiAgICBjb25zdCByb29tID0ge1xuICAgICAgbGFiZWw6ICc3MsKwRicsXG4gICAgICBkYXRhOiBkYXRhLnJvb20sXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuR3JlZW4sXG4gICAgICBwb2ludFJhZGl1czogMCxcbiAgICAgIGJvcmRlckRhc2g6IFs1LCA1XSxcbiAgICB9XG4gICAgY29uc3QgcmFpbiA9IHtcbiAgICAgIGxhYmVsOiAnUmFpbicsXG4gICAgICBkYXRhOiBkYXRhLnJhaW4sXG4gICAgICBib3JkZXJDb2xvcjogdGhpcy5saW5lQ29sb3IuQmx1ZSxcbiAgICAgIHBvaW50UmFkaXVzOiAzLFxuICAgICAgeUF4aXNJRDogJ3kyJyxcbiAgICB9XG4gICAgY29uc3QgaHVtID0ge1xuICAgICAgbGFiZWw6ICdIdW1pZGl0eScsXG4gICAgICBkYXRhOiBkYXRhLmh1bSxcbiAgICAgIGJvcmRlckNvbG9yOiB0aGlzLmxpbmVDb2xvci5QdXJwbGUsXG4gICAgICBwb2ludFJhZGl1czogMyxcbiAgICB9XG4gICAgcmV0dXJuIHsgbGFiZWxzOiBkYXRhLnRpbWUsIGRhdGFzZXRzOiBbdGVtcCwgcm9vbSwgcmFpbiwgaHVtXSB9XG4gIH1cbn1cblxuY29uc3QgTldTID0gbmV3IE5hdGlvbmFsV2VhdGhlclNlcnZpY2VBUEkoKVxuXG5jbGFzcyBXZWF0aGVyRm9yZWNhc3REYXRhRGlzcGxheSBleHRlbmRzIExpbmtVdGlsaXR5IHtcbiAgZGlzcGxheURJVlxuICB3ZWF0aGVyRGl2TGVmdFxuICB3ZWF0aGVyRGl2UmlnaHRcbiAgd2VhdGhlckFsZXJ0c1xuICB3ZWVrRm9yZWNhc3RcbiAgc2V2ZW5EYXlDaGFydFxuICB0d2VudHlmb3VyaG91ckNoYXJ0XG4gIEZpeGVkQ29vcmRzID0geyBsYXRpdHVkZTogMjYuMzA4NSwgbG9uZ2l0dWRlOiAtOTguMTAxNiB9XG4gIGNvbnN0cnVjdG9yKGRpc3BsYXlJZCwgbGlua0lkKSB7XG4gICAgc3VwZXIobGlua0lkKVxuICAgIHN1cGVyLnNldExpbmsoTldTLkxJTksudGl0bGUsIE5XUy5MSU5LLnRhcmdldCwgdHJ1ZSlcbiAgICB0aGlzLmRpc3BsYXlESVYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXNwbGF5SWQpXG4gICAgY29uc3QgVEVNUExBVEUgPSBgXG4gICAgICA8ZGl2IGlkPVwid2VhdGhlckNvbnRhaW5lclwiPlxuICAgICAgICAgIDxkaXYgaWQ9J3dlYXRoZXJEaXZMZWZ0Jz48L2Rpdj48ZGl2IGlkPSd3ZWF0aGVyRGl2UmlnaHQnPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGlkPVwiYWxlcnRzSWRcIj48L2Rpdj5cXG48ZGl2IGlkPVwiZm9yZWNhc3REaXZcIj5cXG48L2Rpdj5cbiAgICAgIDxkaXYgaWQ9XCJjaGFydE9uZURpdlwiPjwvZGl2PjxkaXYgaWQ9XCJjaGFydFR3b0RpdlwiPjwvZGl2PlxuICAgICAgYFxuICAgIHRoaXMuZGlzcGxheURJVi5pbm5lckhUTUwgPSBURU1QTEFURVxuICAgIHRoaXMud2VhdGhlckRpdkxlZnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2VhdGhlckRpdkxlZnQnKVxuICAgIHRoaXMud2VhdGhlckRpdlJpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dlYXRoZXJEaXZSaWdodCcpXG4gICAgdGhpcy53ZWF0aGVyQWxlcnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsZXJ0c0lkJylcbiAgICB0aGlzLndlZWtGb3JlY2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JlY2FzdERpdicpXG4gICAgdGhpcy5zZXZlbkRheUNoYXJ0ID0gbmV3IFdlYXRoZXJDaGFydEpTKCdjaGFydE9uZURpdicpXG4gICAgdGhpcy50d2VudHlmb3VyaG91ckNoYXJ0ID0gbmV3IFdlYXRoZXJDaGFydEpTKCdjaGFydFR3b0RpdicpXG4gIH1cbiAgYXN5bmMgc2V0RGlzcGxheSh1c2VHZW9Mb2NhdGlvbikge1xuICAgIGxldCBjb29yZHMgPSB0aGlzLkZpeGVkQ29vcmRzXG4gICAgaWYgKHVzZUdlb0xvY2F0aW9uKSB7XG4gICAgICBjb29yZHMgPSAoYXdhaXQgTldTLmdldENvb3JkcygpKSB8fCBjb29yZHNcbiAgICB9XG4gICAgYXdhaXQgTldTLmZldGNoUG9pbnRzKGNvb3Jkcy5sYXRpdHVkZSwgY29vcmRzLmxvbmdpdHVkZSlcbiAgICBjb25zb2xlLmxvZyhgRGlzcGxheWluZyAke05XUy5sb2NhdGlvbk5hbWV9OiAke05XUy5lbmRwb2ludHMuZm9yZWNhc3R9IWApXG4gICAgYXdhaXQgdGhpcy5zZXRDdXJyZW50V2VhdGhlcigpXG4gICAgYXdhaXQgdGhpcy5zZXRGb3JlY2FzdEFuZENoYXJ0KClcbiAgICBhd2FpdCB0aGlzLnNldEFjdGl2ZUFsZXJ0cygpXG4gIH1cbiAgYXN5bmMgc2V0Q3VycmVudFdlYXRoZXIoKSB7XG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IE5XUy5mZXRjaEN1cnJlbnRXZWF0aGVyKClcbiAgICBjb25zdCBmcmFnbWVudCA9IG5ldyBEb2N1bWVudEZyYWdtZW50KClcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQuZGF0ZSwgMS4xKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQubG9jYXRpb24sIDEuNCkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShjdXJyZW50LnRlbXBlcmF0dXJlLCAzKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQud2luZCwgMS41KSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGN1cnJlbnQuZm9yZWNhc3QsIDEpKVxuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUxpbmUoY3VycmVudC5odW1pZGl0eSwgMSkpXG4gICAgdGhpcy53ZWF0aGVyRGl2TGVmdC5hcHBlbmRDaGlsZChmcmFnbWVudClcbiAgICB0aGlzLnR3ZW50eWZvdXJob3VyQ2hhcnQuc2V0MjRIckNoYXJ0KGN1cnJlbnQuY2hhcnQpXG4gIH1cbiAgYXN5bmMgc2V0Rm9yZWNhc3RBbmRDaGFydCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgTldTLmZldGNoRm9yZWNhc3RXZWF0aGVyKClcbiAgICBjb25zdCBmcmFnbWVudCA9IG5ldyBEb2N1bWVudEZyYWdtZW50KClcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVMaW5lKGRhdGEubmFtZVswXSwgMS4yKSlcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjcmVhdGVJY29uKGRhdGEuaWNvblswXSwgZGF0YS5mb3JlY2FzdFswXSkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShgJHtkYXRhLnRlbXBlcmF0dXJlWzBdfSZkZWc7RmAsIDAuOCkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShkYXRhLndpbmRbMF0sIDAuOCkpXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY3JlYXRlTGluZShgJHtkYXRhLnJhaW5bMF19JSBDaGFuY2UgUmFpbmAsIDAuOCkpXG4gICAgdGhpcy53ZWF0aGVyRGl2UmlnaHQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpXG5cbiAgICBjb25zdCBmb3JlY2FzdEZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBkYXRhLm5hbWUubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBjb25zdCBpc0RheXRpbWUgPSBkYXRhLmlzRGF5dGltZVtpXVxuICAgICAgaWYgKCFpc0RheXRpbWUpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZvcmVjYXN0RGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgZm9yZWNhc3REYXkuY2xhc3NMaXN0LmFkZCgnZGF5LWNhcmQnKVxuICAgICAgICBmb3JlY2FzdERheS5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgYCR7ZGF0YS5uYW1lW2ldfTogJHtkYXRhLmZvcmVjYXN0W2ldfWApXG4gICAgICAgIGZvcmVjYXN0RGF5LmlubmVySFRNTCA9IGBcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImRheVwiPiR7ZGF0YS5uYW1lW2ldLnN1YnN0cmluZygwLCAzKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJyYWluXCI+JHtkYXRhLnJhaW5baV19JTwvc3Bhbj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7ZGF0YS5pY29uW2ldfVwiIGFsdD1cImljb25cIiBoZWlnaHQ9XCJhdXRvXCIgd2lkdGg9XCI3NSVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImhpXCI+JHtkYXRhLnRlbXBlcmF0dXJlW2ldfSZkZWdGPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwibG9cIj4ke2RhdGEudGVtcGVyYXR1cmVbaSArIDFdfSZkZWdGPC9zcGFuPlxuICAgICAgICBgXG4gICAgICAgIGZvcmVjYXN0RnJhZ21lbnQuYXBwZW5kQ2hpbGQoZm9yZWNhc3REYXkpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMud2Vla0ZvcmVjYXN0LmFwcGVuZENoaWxkKGZvcmVjYXN0RnJhZ21lbnQpXG4gICAgdGhpcy5zZXZlbkRheUNoYXJ0LnNldDdEYXlDaGFydChkYXRhLmNoYXJ0LCBkYXRhLmxvY2F0aW9uKVxuICB9XG4gIGFzeW5jIHNldEFjdGl2ZUFsZXJ0cygpIHtcbiAgICBjb25zdCBhbGVydERhdGEgPSBhd2FpdCBOV1MuZmV0Y2hBbGVydHMoKVxuICAgIGlmIChhbGVydERhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhgTm8gYWN0aXZlIGFsZXJ0cyBmb3VuZC5gKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGZlYXR1cmUgb2YgYWxlcnREYXRhKSB7XG4gICAgICBjb25zdCBhbGVydFRpdGxlID0gYCR7ZmVhdHVyZS5tZXNzYWdlVHlwZX06ICR7ZmVhdHVyZS5ldmVudH0gLyAke2ZlYXR1cmUuc2V2ZXJpdHl9YFxuICAgICAgY29uc3QgaW5mb3JtYXRpb24gPSBgJHtmZWF0dXJlLmRlc2NyaXB0aW9ufVxcbiR7ZmVhdHVyZS5pbnN0cnVjdGlvbiB8fCAnJ31gXG4gICAgICBjb25zdCBhbGVydE1lc3NhZ2UgPSBgJHtmZWF0dXJlLmhlYWRsaW5lfVxcbiR7aW5mb3JtYXRpb259YFxuICAgICAgaWYgKGZlYXR1cmUuc3RhdHVzID09PSAnQWN0dWFsJykge1xuICAgICAgICBjb25zdCB3ZWF0aGVyQWxlcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICB3ZWF0aGVyQWxlcnQuc2V0QXR0cmlidXRlKCd0aXRsZScsIGZlYXR1cmUuaGVhZGxpbmUpXG4gICAgICAgIHdlYXRoZXJBbGVydC5zdHlsZS5wYWRkaW5nID0gJzVweCdcbiAgICAgICAgd2VhdGhlckFsZXJ0LmlubmVySFRNTCA9IGFsZXJ0VGl0bGVcbiAgICAgICAgd2VhdGhlckFsZXJ0Lm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgYWxlcnQoYWxlcnRNZXNzYWdlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMud2VhdGhlckFsZXJ0cy5hcHBlbmRDaGlsZCh3ZWF0aGVyQWxlcnQpXG4gICAgICB9XG4gICAgICB0aGlzLmxvZ0FjdGl2ZUFsZXJ0cyhmZWF0dXJlLCBhbGVydFRpdGxlLCBpbmZvcm1hdGlvbilcbiAgICB9XG4gIH1cbiAgbG9nQWN0aXZlQWxlcnRzKGZlYXR1cmUsIGFsZXJ0VGl0bGUsIGluZm9ybWF0aW9uKSB7XG4gICAgY29uc29sZS5ncm91cChhbGVydFRpdGxlKVxuICAgIGNvbnNvbGUubG9nKGBTdGF0dXM6ICR7ZmVhdHVyZS5zdGF0dXN9YClcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGZlYXR1cmUuaGVhZGxpbmUpXG4gICAgY29uc29sZS5pbmZvKGluZm9ybWF0aW9uKVxuICAgIGNvbnNvbGUubG9nKGBVcmdlbmN5OiAke2ZlYXR1cmUudXJnZW5jeX0gLyBDZXJ0YWludHk6ICR7ZmVhdHVyZS5jZXJ0YWludHl9YClcbiAgICBjb25zb2xlLmdyb3VwRW5kKClcbiAgICBjb25zb2xlLmdyb3VwRW5kKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5XG4iLCJjbGFzcyBHZW9Mb2NhdGlvblV0aWxpdHkge1xuICBzdGF0aWMgYXN5bmMgZ2V0Q29vcmRpbmF0ZXMoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgZW5hYmxlSGlnaEFjY3VyYWN5OiBmYWxzZSwgdGltZW91dDogNTAwMCwgbWF4aW11bUFnZTogMCB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBwb3NpdGlvbiA9PiB7XG4gICAgICAgIHJlc29sdmUocG9zaXRpb24uY29vcmRzKVxuICAgICAgfVxuICAgICAgY29uc3QgZXJyb3IgPSBlcnJvciA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSkpXG4gICAgICB9XG4gICAgICBpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdHZW9sb2NhdGlvbiBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBicm93c2VyLicpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihzdWNjZXNzLCBlcnJvciwgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHN0YXRpYyBnZXRMb2NhbGVzKCkge1xuICAgIGlmICghbmF2aWdhdG9yLmxhbmd1YWdlcykge1xuICAgICAgcmV0dXJuICdlbi1VUydcbiAgICB9XG4gICAgcmV0dXJuIG5hdmlnYXRvci5sYW5ndWFnZXNcbiAgfVxufVxuXG5jbGFzcyBXZWF0aGVyVXRpbGl0eSB7XG4gIHN0YXRpYyBhc3luYyBmZXRjaERhdGEoZW5kcG9pbnQpIHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGVuZHBvaW50KVxuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyh7ICdVc2VyLUFnZW50JzogJ2h0dHBzOi8vZ2l0aHViLmNvbS9mZWxpeHRoZWNhdDhhJyB9KVxuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh1cmwsIHsgaGVhZGVycyB9KVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2gocmVxdWVzdClcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYCR7cmVzcG9uc2Uuc3RhdHVzfSBEYXRhIE5vdCBGb3VuZDogJHtyZXNwb25zZS51cmx9YClcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIGRhdGFcbiAgfVxuICBzdGF0aWMgZm9ybWF0RGF0ZShkYXRlVGltZSkge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShkYXRlVGltZSlcbiAgICBjb25zdCBvcHRpb25zID0geyBkYXRlU3R5bGU6ICdmdWxsJyB9XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KEdlb0xvY2F0aW9uVXRpbGl0eS5nZXRMb2NhbGVzKCksIG9wdGlvbnMpLmZvcm1hdChkYXRlKVxuICB9XG4gIHN0YXRpYyBmb3JtYXRUaW1lKGRhdGVUaW1lKSB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVUaW1lKVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IHRpbWVTdHlsZTogJ3Nob3J0JyB9XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KEdlb0xvY2F0aW9uVXRpbGl0eS5nZXRMb2NhbGVzKCksIG9wdGlvbnMpLmZvcm1hdChkYXRlKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxpbmUoY29udGVudCwgc2l6ZSkge1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkaXYuc3R5bGUuZm9udFNpemUgPSBgJHtzaXplfXJlbWBcbiAgZGl2LmlubmVySFRNTCA9IGNvbnRlbnRcbiAgcmV0dXJuIGRpdlxufVxuXG5mdW5jdGlvbiBjcmVhdGVJY29uKHNyYywgdGl0bGUpIHtcbiAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcbiAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgc3JjKVxuICBpbWcuc2V0QXR0cmlidXRlKCd0aXRsZScsIHRpdGxlKVxuICBpbWcuc2V0QXR0cmlidXRlKCdhbHQnLCAnaWNvbicpXG4gIHJldHVybiBpbWdcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IEdlb0xvY2F0aW9uVXRpbGl0eSwgV2VhdGhlclV0aWxpdHksIGNyZWF0ZUxpbmUsIGNyZWF0ZUljb24gfVxuIiwicmVxdWlyZSgnLi4vc2Nzcy9zdHlsZS5zY3NzJylcbmNvbnN0IFN0YXR1c1V0aWxpdHkgPSByZXF1aXJlKCcuL3V0aWxzL3N0YXR1cycpXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QoZmFsc2UpXG59KVxuXG5jb25zdCBhcGlTRUxFQ1QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBpU2VsZWN0JylcbmFwaVNFTEVDVC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyBldmVudCA9PiB7XG4gIGNvbnN0IHN0YXR1c0RpdiA9IG5ldyBTdGF0dXNVdGlsaXR5KCdzdGF0dXNEaXYnKVxuICBjb25zdCB3ZWF0aGVyTG9jYXRpb24gPSBldmVudC50YXJnZXQudmFsdWVcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKHdlYXRoZXJMb2NhdGlvbikge1xuICAgICAgY2FzZSAnc2hvd0RlZmF1bHQnOlxuICAgICAgICBzdGF0dXNEaXYubG9hZFdlYXRoZXIoJ0xvY2F0aW5nJylcbiAgICAgICAgYXdhaXQgZGlzcGxheVdlYXRoZXJGb3JlY2FzdChmYWxzZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Nob3dGb3JlY2FzdCc6XG4gICAgICAgIHN0YXR1c0Rpdi5sb2FkV2VhdGhlcignTG9jYXRpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5V2VhdGhlckZvcmVjYXN0KHRydWUpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzaG93Q2F0JzpcbiAgICAgICAgc3RhdHVzRGl2LnNldExvYWRpbmcoJ01lb3dpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5Q2F0KClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3Nob3dDYXRTbGlkZXInOlxuICAgICAgICAvL3N0YXR1c0Rpdi5zZXRMb2FkaW5nKCdMb2FkaW5nJylcbiAgICAgICAgc3RhdHVzRGl2LmxvYWRDYXQoJ2xvYWRpbmcnKVxuICAgICAgICBhd2FpdCBkaXNwbGF5Q2F0U2xpZGVyKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICAgIHN0YXR1c0Rpdi5jbGVhclN0YXR1cygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgYXdhaXQgZGlzcGxheVdlYXRoZXJGb3JlY2FzdChmYWxzZSlcbiAgICBzdGF0dXNEaXYuc2V0RXJyb3IoZXJyb3IpXG4gIH1cbn0pXG5cbmNvbnN0IFdlYXRoZXJGb3JlY2FzdERhdGFEaXNwbGF5ID0gcmVxdWlyZSgnLi9saWJzL2ZvcmVjYXN0TGliJylcbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlXZWF0aGVyRm9yZWNhc3QodXNlR2VvTG9jYXRpb24pIHtcbiAgY29uc3QgZm9yZWNhc3QgPSBuZXcgV2VhdGhlckZvcmVjYXN0RGF0YURpc3BsYXkoJ2Rpc3BsYXlEaXYnLCAnYXBpTGluaycpXG4gIGF3YWl0IGZvcmVjYXN0LnNldERpc3BsYXkodXNlR2VvTG9jYXRpb24pXG59XG5cbmNvbnN0IHsgUmFuZG9tQ2F0SW1hZ2VEaXNwbGF5LCBSYW5kb21DYXRJbWFnZVNsaWRlciB9ID0gcmVxdWlyZSgnLi9saWJzL2NhdExpYicpXG5hc3luYyBmdW5jdGlvbiBkaXNwbGF5Q2F0KCkge1xuICBjb25zdCBjYXQgPSBuZXcgUmFuZG9tQ2F0SW1hZ2VEaXNwbGF5KCdkaXNwbGF5RGl2JywgJ2FwaUxpbmsnKVxuICBhd2FpdCBjYXQuZGlzcGxheUNhdCgpXG59XG5hc3luYyBmdW5jdGlvbiBkaXNwbGF5Q2F0U2xpZGVyKCkge1xuICBjb25zdCBzbGlkZXIgPSBuZXcgUmFuZG9tQ2F0SW1hZ2VTbGlkZXIoJ2Rpc3BsYXlEaXYnLCAnYXBpTGluaycpXG4gIGF3YWl0IHNsaWRlci5kaXNwbGF5KClcbn1cbiIsImNsYXNzIFN0YXR1c1V0aWxpdHkge1xuICBzdGF0dXNESVZcbiAgY29uc3RydWN0b3Ioc3RhdHVzRGl2RWxlbWVudElkKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN0YXR1c0RpdkVsZW1lbnRJZClcbiAgICBpZiAoIWVsZW1lbnQgfHwgIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTERpdkVsZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFN0YXR1cyBEaXYgRWxlbWVudCBOb3QgRm91bmQgb3IgTm90IGEgRElWYClcbiAgICB9XG4gICAgdGhpcy5zdGF0dXNESVYgPSBlbGVtZW50XG4gIH1cbiAgc2V0U3RhdHVzKHN0YXR1cykge1xuICAgIHRoaXMuc3RhdHVzRElWLnRleHRDb250ZW50ID0gc3RhdHVzID8/ICcnXG4gIH1cbiAgY2xlYXJTdGF0dXMoKSB7XG4gICAgdGhpcy5zdGF0dXNESVYudGV4dENvbnRlbnQgPSAnJ1xuICB9XG4gIHNldEVycm9yKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmNsZWFyU3RhdHVzKClcbiAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bhbi50ZXh0Q29udGVudCA9IG1lc3NhZ2VcbiAgICBzcGFuLnN0eWxlLmNvbG9yID0gJ3BhbGV2aW9sZXRyZWQnXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQoc3BhbilcbiAgfVxuICBzZXRMb2FkaW5nKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmNsZWFyU3RhdHVzKClcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpXG4gICAgY29uc3Qgc3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHNwaW5uZXIuY2xhc3NOYW1lID0gJ3NwaW5uZXInXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQodGV4dE5vZGUpXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxuICBsb2FkV2VhdGhlcihtZXNzYWdlKSB7XG4gICAgdGhpcy5jbGVhclN0YXR1cygpXG4gICAgY29uc3QgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKVxuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGlubmVyLmNsYXNzTmFtZSA9ICdjbG91ZExvYWRlcidcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSlcbiAgICB0aGlzLnN0YXR1c0RJVi5hcHBlbmRDaGlsZChzcGlubmVyKVxuICB9XG4gIGxvYWRDYXQobWVzc2FnZSkge1xuICAgIHRoaXMuY2xlYXJTdGF0dXMoKVxuICAgIGNvbnN0IHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSlcbiAgICBjb25zdCBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bpbm5lci5jbGFzc05hbWUgPSAnY2F0TG9hZGVyJ1xuICAgIHNwaW5uZXIuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgY2xhc3M9XCJjYXRjb250YWluZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjYXRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWFyIGxlZnRcIj48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWFyIHJpZ2h0XCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV5ZSBsZWZ0XCI+PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImV5ZSByaWdodFwiPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJub3NlXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQodGV4dE5vZGUpXG4gICAgdGhpcy5zdGF0dXNESVYuYXBwZW5kQ2hpbGQoc3Bpbm5lcilcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXR1c1V0aWxpdHlcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwidGVtcGVyYXR1cmVcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rZXhhbXBsZVwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJzcmNfc2Nzc19zdHlsZV9zY3NzXCIsXCJzcmNfanNfbGlic19jYXRMaWJfanNcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvanMvdGVtcGVyYXR1cmUuanNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=