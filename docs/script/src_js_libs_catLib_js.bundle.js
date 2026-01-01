(self["webpackChunkexample"] = self["webpackChunkexample"] || []).push([["src_js_libs_catLib_js"],{

/***/ "./src/js/libs/catLib.js"
/*!*******************************!*\
  !*** ./src/js/libs/catLib.js ***!
  \*******************************/
(module, __unused_webpack_exports, __webpack_require__) {

const LinkUtility = __webpack_require__(/*! ../utils/link */ "./src/js/utils/link.js")

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


/***/ },

/***/ "./src/js/utils/link.js"
/*!******************************!*\
  !*** ./src/js/utils/link.js ***!
  \******************************/
(module) {

class LinkUtility {
  linkElement
  constructor(linkID) {
    const element = document.getElementById(linkID)
    if (!element) {
      throw new Error('Link Element Not Found')
    }
    if (element.tagName !== 'A') {
      throw new Error('Not A Link Element')
    }
    this.linkElement = element
  }
  setLink(title, href, openInNewTab = false) {
    this.linkElement.href = href
    this.linkElement.textContent = title
    if (openInNewTab) {
      this.linkElement.target = '_blank'
      this.linkElement.rel = 'noopener noreferrer'
    } else {
      this.linkElement.target = ''
      this.linkElement.rel = ''
    }
  }
  getLink() {
    return {
      title: this.linkElement.textContent || '',
      href: this.linkElement.href,
      target: this.linkElement.target,
      rel: this.linkElement.rel,
    }
  }
}

module.exports = LinkUtility


/***/ }

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0L3NyY19qc19saWJzX2NhdExpYl9qcy5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxvQkFBb0IsbUJBQU8sQ0FBQyw2Q0FBZTs7QUFFM0M7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxzQkFBc0I7QUFDekQ7QUFDQTtBQUNBLHlCQUF5QixpQkFBaUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLHNCQUFzQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxXQUFXLGlDQUFpQztBQUNwRjtBQUNBLHlCQUF5QixpQkFBaUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGFBQWE7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZUFBZSxhQUFhO0FBQzlDO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxhQUFhO0FBQzFELDZDQUE2QyxhQUFhO0FBQzFELDZDQUE2QyxhQUFhO0FBQzFELDZDQUE2QyxhQUFhO0FBQzFELDZDQUE2QyxhQUFhO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvbGlicy9jYXRMaWIuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy91dGlscy9saW5rLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IExpbmtVdGlsaXR5ID0gcmVxdWlyZSgnLi4vdXRpbHMvbGluaycpXG5cbmNsYXNzIFRoZUNhdEFQSSB7XG4gIHN0YXRpYyBMSU5LID0geyB0aXRsZTogJ1RoZSBDYXQgQVBJJywgdGFyZ2V0OiAnaHR0cHM6Ly93d3cudGhlY2F0YXBpLmNvbScgfVxuICBzdGF0aWMgQ0FUX0FQSSA9IHtcbiAgICBCQVNFX1VSTDogJ2h0dHBzOi8vYXBpLnRoZWNhdGFwaS5jb20vdjEnLFxuICAgIEtFWTogJ2xpdmVfOGU5dnFwTHBudFVTQ2l1bXRoUXUyekhudll3TU9JTUYxSkxkV3BjVUtlcXp0TGE1M21mam9aY3ozR3J5bWFCaCcsXG4gIH1cbiAgc3RhdGljIGFzeW5jIGZldGNoQ2F0QnJlZWRzKCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdChgJHt0aGlzLkNBVF9BUEkuQkFTRV9VUkx9L2JyZWVkc2ApXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZXF1ZXN0KVxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtyZXNwb25zZS5zdGF0dXN9IEJyZWVkIE9wdGlvbnMgTm90IEZvdW5kIWApXG4gICAgfVxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICByZXR1cm4gZGF0YVxuICB9XG4gIHN0YXRpYyBnZXRDYXRCcmVlZE9wdGlvbnMoYnJlZWRzKSB7XG4gICAgY29uc3QgZnJhZ21lbnQgPSBuZXcgRG9jdW1lbnRGcmFnbWVudCgpXG4gICAgZm9yIChjb25zdCBicmVlZCBvZiBicmVlZHMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG4gICAgICBvcHRpb24udmFsdWUgPSBicmVlZC5pZFxuICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gYnJlZWQubmFtZVxuICAgICAgZnJhZ21lbnQuYXBwZW5kKG9wdGlvbilcbiAgICB9XG4gICAgcmV0dXJuIGZyYWdtZW50XG4gIH1cbiAgc3RhdGljIGFzeW5jIGZldGNoQ2F0SW1hZ2VEYXRhKGxpbWl0LCBicmVlZElkID0gbnVsbCkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYCR7dGhpcy5DQVRfQVBJLkJBU0VfVVJMfS9pbWFnZXMvc2VhcmNoYClcbiAgICB1cmwuc2VhcmNoUGFyYW1zLnNldCgnbGltaXQnLCBTdHJpbmcobGltaXQpKVxuICAgIGlmIChicmVlZElkKSB7XG4gICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnYnJlZWRfaWQnLCBicmVlZElkKVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyBoZWFkZXJzOiB7ICd4LWFwaS1rZXknOiB0aGlzLkNBVF9BUEkuS0VZIH0gfSlcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cmVzcG9uc2Uuc3RhdHVzfSBJbWFnZXMgTm90IEZvdW5kYClcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbn1cblxuY2xhc3MgQ2F0QnJlZWRJbWFnZVV0aWxpdHkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGFzeW5jIGdldENhdEJyZWVkcygpIHtcbiAgICBjb25zdCBjYXRCcmVlZHMgPSBhd2FpdCBUaGVDYXRBUEkuZmV0Y2hDYXRCcmVlZHMoKVxuICAgIHJldHVybiBjYXRCcmVlZHNcbiAgfVxuICBzZXRDYXRCcmVlZHMob3B0R3JvdXAsIGJyZWVkcykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBUaGVDYXRBUEkuZ2V0Q2F0QnJlZWRPcHRpb25zKGJyZWVkcylcbiAgICBvcHRHcm91cC5hcHBlbmRDaGlsZChvcHRpb25zKVxuICB9XG4gIGFzeW5jIGdldENhdEJyZWVkSW1hZ2VEYXRhKGxpbWl0LCBicmVlZElkKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IFRoZUNhdEFQSS5mZXRjaENhdEltYWdlRGF0YShsaW1pdCwgYnJlZWRJZClcbiAgICByZXR1cm4gZGF0YVxuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJhbmRvbUNhdEltYWdlRGF0YShsaW1pdCkge1xuICBjb25zdCBkYXRhID0gYXdhaXQgVGhlQ2F0QVBJLmZldGNoQ2F0SW1hZ2VEYXRhKGxpbWl0KVxuICByZXR1cm4gZGF0YVxufVxuXG5jbGFzcyBSYW5kb21DYXRJbWFnZURpc3BsYXkgZXh0ZW5kcyBMaW5rVXRpbGl0eSB7XG4gIGRpc3BsYXlESVZcbiAgY29uc3RydWN0b3IoZGlzcGxheUlkLCBsaW5rSWQpIHtcbiAgICBzdXBlcihsaW5rSWQpXG4gICAgc3VwZXIuc2V0TGluayhUaGVDYXRBUEkuTElOSy50aXRsZSwgVGhlQ2F0QVBJLkxJTksudGFyZ2V0LCB0cnVlKVxuICAgIHRoaXMuZGlzcGxheURJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpc3BsYXlJZClcbiAgfVxuICBhc3luYyBkaXNwbGF5Q2F0KCkge1xuICAgIGNvbnN0IGltYWdlID0gYXdhaXQgVGhlQ2F0QVBJLmZldGNoQ2F0SW1hZ2VEYXRhKDEpXG4gICAgdGhpcy5kaXNwbGF5RElWLmlubmVySFRNTCA9IGA8aW1nIHNyYz1cIiR7aW1hZ2VbMF0udXJsfVwiIGhlaWdodD1cImF1dG9cIiB3aWR0aD1cIjEwMCVcIj5gXG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgICBidXR0b24uc3R5bGUubWFyZ2luID0gJzAuNXJlbSdcbiAgICBidXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdidXR0b24td2FybmluZycpXG4gICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ05ldyBDYXQnXG4gICAgYnV0dG9uLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLmRpc3BsYXlDYXQoKVxuICAgIH1cbiAgICB0aGlzLmRpc3BsYXlESVYuYXBwZW5kQ2hpbGQoYnV0dG9uKVxuICB9XG59XG5cbmNsYXNzIFJhbmRvbUNhdEltYWdlU2xpZGVyIGV4dGVuZHMgTGlua1V0aWxpdHkge1xuICBkaXNwbGF5RElWXG4gIGNvbnN0cnVjdG9yKGRpc3BsYXlJZCwgbGlua0lkKSB7XG4gICAgc3VwZXIobGlua0lkKVxuICAgIHN1cGVyLnNldExpbmsoVGhlQ2F0QVBJLkxJTksudGl0bGUsIFRoZUNhdEFQSS5MSU5LLnRhcmdldCwgdHJ1ZSlcbiAgICB0aGlzLmRpc3BsYXlESVYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXNwbGF5SWQpXG4gIH1cbiAgYXN5bmMgZGlzcGxheSgpIHtcbiAgICBjb25zdCBpbWFnZSA9IGF3YWl0IFRoZUNhdEFQSS5mZXRjaENhdEltYWdlRGF0YSg1KVxuICAgIHRoaXMuZGlzcGxheURJVi5pbm5lckhUTUwgPSBgXG4gIDxzdHlsZT4uY2F0SW1nIHtoZWlnaHQ6IDM1MHB4OyB3aWR0aD0gYXV0bzt9PC9zdHlsZT5cbiAgPGRpdiBjbGFzcz1cImdsaWRlXCI+XG4gICAgPGRpdiBjbGFzcz1cImdsaWRlX190cmFja1wiIGRhdGEtZ2xpZGUtZWw9XCJ0cmFja1wiPlxuICAgICAgPHVsIGNsYXNzPVwiZ2xpZGVfX3NsaWRlc1wiPlxuICAgICAgICA8bGkgY2xhc3M9XCJnbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7aW1hZ2VbMF0udXJsfVwiIGNsYXNzPVwiY2F0SW1nXCI+PC9saT5cbiAgICAgICAgPGxpIGNsYXNzPVwiZ2xpZGVfX3NsaWRlXCI+PGltZyBzcmM9XCIke2ltYWdlWzFdLnVybH1cIiBjbGFzcz1cImNhdEltZ1wiPjwvbGk+XG4gICAgICAgIDxsaSBjbGFzcz1cImdsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtpbWFnZVsyXS51cmx9XCIgY2xhc3M9XCJjYXRJbWdcIj48L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJnbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7aW1hZ2VbM10udXJsfVwiIGNsYXNzPVwiY2F0SW1nXCI+PC9saT5cbiAgICAgICAgPGxpIGNsYXNzPVwiZ2xpZGVfX3NsaWRlXCI+PGltZyBzcmM9XCIke2ltYWdlWzRdLnVybH1cIiBjbGFzcz1cImNhdEltZ1wiPjwvbGk+XG4gICAgICA8L3VsPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJnbGlkZV9fYXJyb3dzXCIgZGF0YS1nbGlkZS1lbD1cImNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIGNsYXNzPVwiZ2xpZGVfX2Fycm93IGdsaWRlX19hcnJvdy0tbGVmdFwiIGRhdGEtZ2xpZGUtZGlyPVwiPFwiPnByZXY8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJnbGlkZV9fYXJyb3cgZ2xpZGVfX2Fycm93LS1yaWdodFwiIGRhdGEtZ2xpZGUtZGlyPVwiPlwiPm5leHQ8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIGBcbiAgICBjb25zdCBvcHRpb25zID0geyBhdXRvcGxheTogMzAwMCwgaG92ZXJwYXVzZTogZmFsc2UgfVxuICAgIGNvbnN0IHsgR2xpZGUgfSA9IHdpbmRvd1xuICAgIG5ldyBHbGlkZSgnLmdsaWRlJywgb3B0aW9ucykubW91bnQoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDYXRCcmVlZEltYWdlVXRpbGl0eSxcbiAgZ2V0UmFuZG9tQ2F0SW1hZ2VEYXRhLFxuICBSYW5kb21DYXRJbWFnZURpc3BsYXksXG4gIFJhbmRvbUNhdEltYWdlU2xpZGVyLFxufVxuIiwiY2xhc3MgTGlua1V0aWxpdHkge1xuICBsaW5rRWxlbWVudFxuICBjb25zdHJ1Y3RvcihsaW5rSUQpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobGlua0lEKVxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdMaW5rIEVsZW1lbnQgTm90IEZvdW5kJylcbiAgICB9XG4gICAgaWYgKGVsZW1lbnQudGFnTmFtZSAhPT0gJ0EnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBBIExpbmsgRWxlbWVudCcpXG4gICAgfVxuICAgIHRoaXMubGlua0VsZW1lbnQgPSBlbGVtZW50XG4gIH1cbiAgc2V0TGluayh0aXRsZSwgaHJlZiwgb3BlbkluTmV3VGFiID0gZmFsc2UpIHtcbiAgICB0aGlzLmxpbmtFbGVtZW50LmhyZWYgPSBocmVmXG4gICAgdGhpcy5saW5rRWxlbWVudC50ZXh0Q29udGVudCA9IHRpdGxlXG4gICAgaWYgKG9wZW5Jbk5ld1RhYikge1xuICAgICAgdGhpcy5saW5rRWxlbWVudC50YXJnZXQgPSAnX2JsYW5rJ1xuICAgICAgdGhpcy5saW5rRWxlbWVudC5yZWwgPSAnbm9vcGVuZXIgbm9yZWZlcnJlcidcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saW5rRWxlbWVudC50YXJnZXQgPSAnJ1xuICAgICAgdGhpcy5saW5rRWxlbWVudC5yZWwgPSAnJ1xuICAgIH1cbiAgfVxuICBnZXRMaW5rKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogdGhpcy5saW5rRWxlbWVudC50ZXh0Q29udGVudCB8fCAnJyxcbiAgICAgIGhyZWY6IHRoaXMubGlua0VsZW1lbnQuaHJlZixcbiAgICAgIHRhcmdldDogdGhpcy5saW5rRWxlbWVudC50YXJnZXQsXG4gICAgICByZWw6IHRoaXMubGlua0VsZW1lbnQucmVsLFxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmtVdGlsaXR5XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9