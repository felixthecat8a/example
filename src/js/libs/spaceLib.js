const LinkUtility = require('../utils/link')

class SpaceAPI {
  LINK = { title: 'NASA APOD', target: 'https://api.nasa.gov' }
  API_KEY = 'hkK0YnyCZ1aD50PCnbdLtwVzpvUfeGfD4QBVgUMr'
  constructor() {}
  async fetchAstronomyPictureOfTheDay() {
    const url = new URL('/planetary/apod', this.LINK.target)
    url.searchParams.append('api_key', this.API_KEY)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`${response.status} Data Not Found: ${response.url}`)
    }
    const data = await response.json()
    return data
  }
  async getAstronomyPictureOfTheDay() {
    const data = await this.fetchAstronomyPictureOfTheDay()
    let spaceHTML
    if (data.media_type === 'image') {
      spaceHTML = `
          <figure>
              <img src="${data.url}" alt="APOD" title="${data.title}" height="auto" width="100%">
              <figcaption class="space-info-card">${data.explanation}</figcaption>
          </figure>
          `
    } else if (data.media_type === 'video') {
      spaceHTML = `<iframe src="${data.url}" width="100%" height="330px"></iframe>`
    } else {
      spaceHTML = ``
    }
    return spaceHTML
  }
}

const NASA = new SpaceAPI()

class SpaceImageDisplay extends LinkUtility {
  displayDIV
  constructor(displayId, linkId) {
    super(linkId)
    super.setLink(NASA.LINK.title, NASA.LINK.target, true)
    this.displayDIV = document.getElementById(displayId)
  }
  async setDisplay() {
    this.displayDIV.innerHTML = await NASA.getAstronomyPictureOfTheDay()
  }
}

module.exports = SpaceImageDisplay
