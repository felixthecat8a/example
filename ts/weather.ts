class Weather {
    public static async getCoordinates(): Promise<GeolocationCoordinates> {
        const options: PositionOptions = { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        return new Promise((resolve, reject) => {
            const success = (position: GeolocationPosition) => {
                resolve(position.coords)
            }
            const error = (error: GeolocationPositionError) => {
                reject(new Error(error.message))
            }
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by the browser.'))
            } else {
                navigator.geolocation.getCurrentPosition(success, error, options)
            }
        })
    }
    public static async fetchData<T>(endpoint: string): Promise<T> {
        const url = new URL(endpoint)
        const headers = new Headers({ 'User-Agent': 'https://github.com/felixthecat8a' })
        const request = new Request(url, { headers: headers })
        const response = await fetch(request)
        if (!response.ok) {
            throw new Error(`${response.status} Data Not Found: ${response.url}`)
        }
        return response.json() as Promise<T>
    }
    public static formatDate(dateTime: string): string {
        const date = new Date(dateTime)
        const locales: Intl.LocalesArgument = navigator.language
        const options: Intl.DateTimeFormatOptions = { dateStyle: 'full' }
        return new Intl.DateTimeFormat(locales, options).format(date)
    }
    public static formatTime(dateTime: string): string {
        const date = new Date(dateTime)
        const locales: Intl.LocalesArgument = navigator.language
        const options: Intl.DateTimeFormatOptions = { timeStyle: 'short' }
        return new Intl.DateTimeFormat(locales, options).format(date)
    }
}
/**************************************************************************************************/
type Geometry = { coordinates: { 0: number; 1: number } }
type RelativeLocation = { geometry: Geometry; properties: { city: string; state: string } }
type Endpoints = { forecast: string; forecastHourly: string; relativeLocation: RelativeLocation }
type Points = { id: string; geometry: Geometry; properties: Endpoints }
type Value = { unitCode: string; value: number }
type Periods = {
    temperature: number
    temperatureUnit: string
    windSpeed: string
    windDirection: string
    icon: string
    isDaytime: boolean
    shortForecast: string
    probabilityOfPrecipitation: Value
    startTime: string
    endTime: string
    dewpoint: Value
    detailedForecast: string
    name: string
    relativeHumidity: Value
}
interface WeatherData {
    properties: { periods: Array<Periods> }
}
class NationalWeatherServiceAPI {
    public readonly LINK = {
        title: 'National Weather Service API',
        target: 'https://www.weather.gov',
    }
    private readonly BASE_URL = 'https://api.weather.gov'
    constructor() {}
    public async getCoords(): Promise<{ latitude: number; longitude: number }> {
        const coords = await Weather.getCoordinates()
        return { latitude: coords.latitude, longitude: coords.longitude }
    }
    public async fetchData<T>(url: string): Promise<T> {
        return await Weather.fetchData<T>(url)
    }
    public async fetchPoints<Coords>(lat: Coords, long: Coords, log?: boolean): Promise<any> {
        const data = (await this.fetchData(`${this.BASE_URL}/points/${lat},${long}`)) as Points
        if (log) {
            console.log('Points: ', data.id)
        }
        const props = data.properties
        const endpoints = { current: props.forecastHourly, forecast: props.forecast }
        const locationData = props.relativeLocation.properties
        const name = `${locationData.city}, ${locationData.state}`
        //const coordinates = data.geometry.coordinates
        const coordinates = props.relativeLocation.geometry.coordinates
        const point = `${coordinates[1].toFixed(4)},${coordinates[0].toFixed(4)}`
        return { endpoints: endpoints, location: name, point: point }
    }
    public async fetchCurrentWeather(endpoint: string): Promise<any> {
        const data = (await this.fetchData(endpoint)) as WeatherData
        const current = data.properties.periods[0]
        const chart = data.properties.periods.slice(1, 25)
        const temperature = chart.map((period) => period.temperature)
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
        }
    }
    public async fetchForecastWeather(endpoint: string): Promise<any> {
        const data = (await this.fetchData(endpoint)) as WeatherData
        const forecast = data.properties.periods
        return {
            isDaytime: forecast.map((period) => period.isDaytime),
            name: forecast.map((period) => period.name),
            temperature: forecast.map((period) => period.temperature),
            wind: forecast.map((period) => `${period.windSpeed} ${period.windDirection}`),
            forecast: forecast.map((period) => period.detailedForecast),
            rain: forecast.map((period) => period.probabilityOfPrecipitation.value | 0),
            icon: forecast.map((period) => period.icon),
            chart: forecast,
        }
    }
    public async fetchAlerts<T>(point: string): Promise<T> {
        return this.fetchData<T>(`${this.BASE_URL}/alerts/active?point=${point}`)
    }
} //const nws = new NationalWeatherServiceAPI()
/**************************************************************************************************/
class StatusUtility {
    private readonly statusDIV: HTMLDivElement
    constructor(statusDivElement: string) {
        const element = document.getElementById(statusDivElement) as HTMLDivElement
        if (!element) {
            throw new Error(`Status Div Element Not Found`)
        }
        this.statusDIV = element
    }
    public setStatus(status: string | null): void {
        this.statusDIV.textContent = status
    }
    public clearStatus(): void {
        this.setStatus(null)
    }
    public setError(message: string): void {
        this.statusDIV.innerHTML = `<span style="color:palevioletred">${message}</span>`
    }
    public setLoading(message: string): void {
        this.statusDIV.innerHTML = `${message}...<span class="spinner"></span>`
    }
} //const statusDIV = new StatusUtility('statusDIV')
/**************************************************************************************************/
interface CurrentChartData {
    temp: number[]
    min: number
    max: number
    room: number[]
    rain: number[]
    time: string[]
    hum: number[]
}
interface Window {
    ApexCharts: any
}
class WeatherApexCharts {
    private readonly line = {
        Blue: '#008FFB',
        Green: '#00E396',
        Orange: '#FEB019',
        Red: '#FF4560',
        Purple: '#775DD0',
    }
    private readonly chartDIV: HTMLDivElement
    constructor(chartID: string) {
        this.chartDIV = document.getElementById(chartID) as HTMLDivElement
    }
    public set7DayChart(forecastData: Periods[], locationName: string): void {
        const options = this.set7DayOptions(forecastData, locationName)
        const { ApexCharts } = window
        const chart = new ApexCharts(this.chartDIV, options)
        chart.render()
    }
    private set7DayOptions(data: Periods[], locationName: string): any {
        const Daytime = data.filter((data) => data.isDaytime)
        const Nighttime = data.filter((data) => !data.isDaytime)
        const highTemp = Daytime.map((data) => data.temperature)
        const lowTemp = Nighttime.map((data) => data.temperature)
        const roomTemp = Array(highTemp.length).fill(72)
        const rain = Daytime.map((data) => data.probabilityOfPrecipitation.value)
        const days = Daytime.map((data) => data.name)
        const highSeries = { name: 'Highs', type: 'line', data: highTemp }
        const lowSeries = { name: 'Lows', type: 'line', data: lowTemp }
        const roomSeries = { name: 'Room', type: 'line', data: roomTemp }
        const rainSeries = { name: 'Rain', type: 'column', data: rain }
        const maxTemp = Math.max(...highTemp) + 5
        const minTemp = Math.min(...lowTemp, 72) - 5
        const yTemp = { title: { text: 'Temperature (\u00B0F)' }, min: minTemp, max: maxTemp }
        const yRain = { opposite: true, title: { text: 'Percent (%)' }, min: 0, max: 100 }
        const toolbar = { show: true, tools: { download: false } }
        const rotate = { rotate: -30, rotateAlways: true }
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
        }
    }
    public set24HrChart(data: CurrentChartData): void {
        const roomSeries = { name: 'Room', data: data.room }
        const tempSeries = { name: 'Temperature', data: data.temp }
        const rainSeries = { name: 'Rain', data: data.rain }
        const humiditySeries = { name: 'Humidity', data: data.hum }
        const yRoom = { show: false, min: data.min, max: data.max }
        const yTemp = { title: { text: 'Temperature (\u00B0F)' }, min: data.min, max: data.max }
        const yPercent = { opposite: true, title: { text: 'Percent (%)' }, min: 0, max: 100 }
        const toolbar = { show: true, tools: { download: false } }
        const rotate = { rotate: -30, rotateAlways: true }
        const fixed = { enabled: true, position: 'topRight', offsetX: 0, offsetY: 0 }
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
        }
        const { ApexCharts } = window
        const chart = new ApexCharts(this.chartDIV, options)
        chart.render()
    }
}
/**************************************************************************************************/
module.exports = { NationalWeatherServiceAPI, StatusUtility, WeatherApexCharts }
