const LinkUtility = require('../utils/link')

class TheCatAPI {
  static LINK = { title: 'The Cat API', target: 'https://www.thecatapi.com' }
  static CAT_API = {
    BASE_URL: 'https://api.thecatapi.com/v1',
    KEY: 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh',
  }
  static async fetchCatBreeds() {
    const request = new Request(`${this.CAT_API.BASE_URL}/breeds`)
    const response = await fetch(request)
    if (!response.ok) {
      throw new Error(`${response.status} Breed Options Not Found!`)
    }
    const data = await response.json()
    return data
  }
  static getCatBreedOptions(breeds) {
    const fragment = new DocumentFragment()
    for (const breed of breeds) {
      const option = document.createElement('option')
      option.value = breed.id
      option.textContent = breed.name
      fragment.append(option)
    }
    return fragment
  }
  static async fetchCatImageData(limit, breedId = null) {
    const url = new URL(`${this.CAT_API.BASE_URL}/images/search`)
    url.searchParams.set('limit', String(limit))
    if (breedId) {
      url.searchParams.append('breed_id', breedId)
    }
    const response = await fetch(url, { headers: { 'x-api-key': this.CAT_API.KEY } })
    if (!response.ok) {
      throw new Error(`${response.status} Images Not Found`)
    }
    const data = await response.json()
    return data
  }
}

class CatBreedImageUtility {
  constructor() {}
  async getCatBreeds() {
    const catBreeds = await TheCatAPI.fetchCatBreeds()
    return catBreeds
  }
  setCatBreeds(optGroup, breeds) {
    const options = TheCatAPI.getCatBreedOptions(breeds)
    optGroup.appendChild(options)
  }
  async getCatBreedImageData(limit, breedId) {
    const data = await TheCatAPI.fetchCatImageData(limit, breedId)
    return data
  }
}

async function getRandomCatImageData(limit) {
  const data = await TheCatAPI.fetchCatImageData(limit)
  return data
}

class RandomCatImageDisplay extends LinkUtility {
  displayDIV
  constructor(displayId, linkId) {
    super(linkId)
    super.setLink(TheCatAPI.LINK.title, TheCatAPI.LINK.target, true)
    this.displayDIV = document.getElementById(displayId)
  }
  async displayCat() {
    const image = await TheCatAPI.fetchCatImageData(1)
    this.displayDIV.innerHTML = `<img src="${image[0].url}" height="auto" width="100%">`
    const button = document.createElement('button')
    button.style.margin = '0.5rem'
    button.setAttribute('class', 'button-warning')
    button.textContent = 'New Cat'
    button.onclick = async () => {
      await this.displayCat()
    }
    this.displayDIV.appendChild(button)
  }
}

class RandomCatImageSlider extends LinkUtility {
  displayDIV
  constructor(displayId, linkId) {
    super(linkId)
    super.setLink(TheCatAPI.LINK.title, TheCatAPI.LINK.target, true)
    this.displayDIV = document.getElementById(displayId)
  }
  async display() {
    const image = await TheCatAPI.fetchCatImageData(5)
    this.displayDIV.innerHTML = `
  <style>.catImg {height: 350px; width= auto;}</style>
  <div class="glide">
    <div class="glide__track" data-glide-el="track">
      <ul class="glide__slides">
        <li class="glide__slide"><img src="${image[0].url}" class="catImg"></li>
        <li class="glide__slide"><img src="${image[1].url}" class="catImg"></li>
        <li class="glide__slide"><img src="${image[2].url}" class="catImg"></li>
        <li class="glide__slide"><img src="${image[3].url}" class="catImg"></li>
        <li class="glide__slide"><img src="${image[4].url}" class="catImg"></li>
      </ul>
    </div>
    <div class="glide__arrows" data-glide-el="controls">
      <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
      <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
    </div>
  </div>
  `
    const options = { autoplay: 3000, hoverpause: false }
    const { Glide } = window
    new Glide('.glide', options).mount()
  }
}

module.exports = {
  CatBreedImageUtility,
  getRandomCatImageData,
  RandomCatImageDisplay,
  RandomCatImageSlider,
}
