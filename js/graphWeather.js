async function getGeoLocation() {
    return new Promise((resolve, reject) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (error) => reject('Unable to retrieve location')
            );
        } else {
            reject('Geolocation not supported by your browser.');
        }
    });
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
        const response = await fetch(NWS_URL);
        const data = await response.json();
        const endpoint = data.properties.forecast
        const locationData = data.properties.relativeLocation.properties
        const location = (`${locationData.city}, ${locationData.state}`)
        return {endpoint, location}
    } catch (error) {
        console.error(error);
        return null;
    }
}
async function getForecastData(useGeolocation) {
    try {
        const locationData = await getGeoEndpoint(useGeolocation);
        const location = locationData.location;
        const response = await fetch(locationData.endpoint);
        const data = await response.json();
        const daytimeData = data.properties.periods.filter((period) => period.isDaytime);
        const nighttimeData = data.properties.periods.filter((period) => !period.isDaytime);
        const dayLabels = daytimeData.map((period) => period.name);
        const dayTemperature = daytimeData.map((period) => period.temperature);
        const nightTemperature = nighttimeData.map((period) => period.temperature);
        const rainChance = daytimeData.map((period) => period.probabilityOfPrecipitation.value);
        return { dayLabels , dayTemperature, nightTemperature, rainChance, location };
    } catch (error) {
        console.error(error);
        return null;
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const { temperatureChart, rainChanceChart } = await createForecastChart()
    const selectForecastGraph = document.getElementById('selectForecastGraph')
    selectForecastGraph.addEventListener('change', async (event) => {
        const graphSelection = event.target.value;
        if (graphSelection == 'geolocation') {
            await updateForecastChart(temperatureChart, rainChanceChart , true);
        }
        else {
            await updateForecastChart(temperatureChart, rainChanceChart , false);
        }
    });
});
async function createForecastChart() {
    const forecastData = await getForecastData(false);
    const ctx = document.getElementById("temperatureChart");
    const temperatureChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: forecastData.dayLabels,
            datasets: [
                {
                    label: "Highs",
                    data: forecastData.dayTemperature,
                    borderColor: "red",
                    fill: false,
                },
                {
                    label: "Lows",
                    data: forecastData.nightTemperature,
                    borderColor: "blue",
                    fill: false,
                },
                {
                    label: "72\u00B0F",
                    data: Array(forecastData.dayTemperature.length).fill(72),
                    borderColor: "rgba(144, 240, 144, 0.6)",
                    fill: false,
                    pointRadius: 0,
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Forecast Temperatures',
                    color: 'lightgray',
                    font: {
                        size: 14,
                    },
                },
                subtitle: {
                    display: true,
                    text: forecastData.location
                },
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (\u00B0F)',
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day',
                    }
                }
            },
        }
    });
    temperatureChart.resize(500,400)
    const ctx2 = document.getElementById("rainChanceChart");
    const rainChanceChart = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: forecastData.dayLabels,
            datasets: [
                {
                    label: "Chance of Rain",
                    data: forecastData.rainChance,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '%',
                        color: 'gray',
                        font: {
                            size: 14,
                        },
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day',
                        color: 'gray',
                        font: {
                            size: 14,
                        },
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Forecast Chance of Rain',
                    color: 'lightgray',
                    font: {
                        size: 14,
                    },
                },
                subtitle: {
                    display: true,
                    text: forecastData.location
                },
            }
        },
    });
    rainChanceChart.resize(500,400)
    return { temperatureChart, rainChanceChart }
}
async function updateForecastChart(temperatureChart, rainChanceChart, useGeolocation) {
    const forecastData = await getForecastData(useGeolocation);
    temperatureChart.data.datasets[0].data = forecastData.dayTemperature
    temperatureChart.data.datasets[1].data = forecastData.nightTemperature
    temperatureChart.options.plugins.subtitle.text = forecastData.location
    temperatureChart.update()
    rainChanceChart.data.datasets[0].data = forecastData.rainChance
    rainChanceChart.options.plugins.subtitle.text = forecastData.location
    rainChanceChart.update()
}
