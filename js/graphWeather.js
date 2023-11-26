async function getGeoLocation() {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (error) => reject(error)
            )
        } else {
            reject('Geolocation not supported by your browser.')
        }
    })
}
async function getGeoEndpoint(useGeolocation) {
    try {
        let position
        if (useGeolocation){
            const coords = await getGeoLocation()
            position = (`${coords.latitude},${coords.longitude}`) 
        } else {
            const jehsLatitude = '26.3086'
            const jehsLongitude = '-98.103'
            position = (`${jehsLatitude},${jehsLongitude}`) 
        }
        const NWS_URL = (`https://api.weather.gov/points/${position}`)
        console.log(NWS_URL)
        const response = await fetch(NWS_URL)
        const data = await response.json()
        const endpoint = data.properties.forecast
        const locationData = data.properties.relativeLocation.properties
        const location = (`${locationData.city}, ${locationData.state}`)
        return {endpoint, location}
    } catch (error) {
        console.error(error)
        return null
    }
}
async function getForecastData(useGeolocation) {
    try {
        const locationData = await getGeoEndpoint(useGeolocation)
        const location = locationData.location
        const response = await fetch(locationData.endpoint)
        const data = await response.json()
        const daytimeData = data.properties.periods.filter((period) => period.isDaytime)
        const nighttimeData = data.properties.periods.filter((period) => !period.isDaytime)
        const dayLabels = daytimeData.map((period) => period.name)
        const dayTemperature = daytimeData.map((period) => period.temperature)
        const nightTemperature = nighttimeData.map((period) => period.temperature)
        const rainChance = daytimeData.map((period) => period.probabilityOfPrecipitation.value)
        return { dayLabels, dayTemperature, nightTemperature, rainChance, location }
    } catch (error) {
        console.error(error);
        return null;
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const { temperatureChart, rainChanceChart } = await createForecastChart()
    const selectForecastGraph = document.getElementById('selectForecastGraph')
    selectForecastGraph.addEventListener('change', async (event) => {
        const graphSelection = event.target.value
        if (graphSelection == 'geolocation') {
            await updateForecastChart(temperatureChart, rainChanceChart , true)
        } else {
            await updateForecastChart(temperatureChart, rainChanceChart , false)
        }
    })
})
async function createForecastChart() {
    const forecastData = await getForecastData(false)
    const roomTemperature = 72
    const arrayLength = forecastData.dayTemperature.length
    const rtLine = Array(arrayLength).fill(roomTemperature)
    Chart.defaults.color = 'darkgray'
    const ctx = document.getElementById("temperatureChart")
    ctx.style.backgroundColor = '#1e1e1e'
    const data = {
        labels: forecastData.dayLabels,
        datasets: [
            { label: "Highs", data: forecastData.dayTemperature, borderColor: "red", fill: false },
            { label: "Lows", data: forecastData.nightTemperature, borderColor: "blue", fill: false },
            { label: "72\u00B0F", data: rtLine, borderColor: "green", fill: false, pointRadius: 0 },
        ],
    }
    const options = {
        plugins: {
            title: { display: true, text: 'Forecast Temperatures', color: 'lightgray', font: { size: 18 } },
            subtitle: { display: true, text: forecastData.location, color: 'lightgray', font: { size: 16 } },
        },
        scales: {
            y: { title: { display: true, text: 'Temperature (\u00B0F)' } },
            x: { title: { display: true, text: 'Day' } }
        },
    }
    const temperatureChart = new Chart(ctx, { type: "line", data: data, options: options })
    const ctx2 = document.getElementById("rainChanceChart")
    ctx2.style.backgroundColor = '#1e1e1e'
    const data2 = {
        labels: forecastData.dayLabels,
        datasets: [
            {
                label: "Chance of Rain",
                data: forecastData.rainChance,
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderWidth: 1,
            },
        ],
    }
    const options2 = {
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Percent Chance (%)',
                    color: 'gray',
                    font: { size: 14 },
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Day of the Week',
                    color: 'gray',
                    font: { size: 14 },
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Precipitation Forecast',
                color: 'lightgray',
                font: { size: 18 },
            },
            subtitle: {
                display: true,
                text: forecastData.location,
                color: 'lightgray',
                font: { size: 16 },
            },
        },
    }
    const rainChanceChart = new Chart(ctx2, { type: "bar", data: data2, options: options2 })
    const defaultChartWidth = 700
    if (window.innerWidth <= 550) {
        temperatureChart.resize(window.innerWidth,'auto')
        temperatureChart.canvas.parentNode.style.width = window.innerWidth
        rainChanceChart.resize(window.innerWidth,'auto')
        rainChanceChart.canvas.parentNode.style.width = window.innerWidth
    } else {
        temperatureChart.resize(defaultChartWidth,'auto')
        temperatureChart.canvas.parentNode.style.width = `${defaultChartWidth}px`
        rainChanceChart.resize(defaultChartWidth,'auto')
        rainChanceChart.canvas.parentNode.style.width = `${defaultChartWidth}px`
    }
    temperatureChart.canvas.parentNode.style.margin = 'auto'
    rainChanceChart.canvas.parentNode.style.margin = 'auto'
    window.addEventListener('resize', () => {
        const screenWidth = window.innerWidth
        temperatureChart.canvas.parentNode.style.margin = 'auto'
        rainChanceChart.canvas.parentNode.style.margin = 'auto'
        if (screenWidth <= defaultChartWidth) {
            temperatureChart.resize(screenWidth,'auto')
            temperatureChart.canvas.parentNode.style.width = screenWidth
            rainChanceChart.resize(screenWidth,'auto')
            rainChanceChart.canvas.parentNode.style.width = screenWidth
        } else {
            temperatureChart.resize(defaultChartWidth,'auto')
            temperatureChart.canvas.parentNode.style.width = `${defaultChartWidth}px`
            rainChanceChart.resize(defaultChartWidth,'auto')
            rainChanceChart.canvas.parentNode.style.width = `${defaultChartWidth}px`
        }
    })
    return { temperatureChart, rainChanceChart }
}
async function updateForecastChart(temperatureChart, rainChanceChart, useGeolocation) {
    const forecastData = await getForecastData(useGeolocation)
    temperatureChart.data.datasets[0].data = forecastData.dayTemperature
    temperatureChart.data.datasets[1].data = forecastData.nightTemperature
    temperatureChart.options.plugins.subtitle.text = forecastData.location
    temperatureChart.update()
    rainChanceChart.data.datasets[0].data = forecastData.rainChance
    rainChanceChart.options.plugins.subtitle.text = forecastData.location
    rainChanceChart.update()
}
