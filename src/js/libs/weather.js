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
