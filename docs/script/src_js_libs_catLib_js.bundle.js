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
    const response = await fetch(request, { headers: { 'x-api-key': this.CAT_API.KEY } })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0L3NyY19qc19saWJzX2NhdExpYl9qcy5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxvQkFBb0IsbUJBQU8sQ0FBQyw2Q0FBZTs7QUFFM0M7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxzQkFBc0I7QUFDekQsNENBQTRDLFdBQVcsaUNBQWlDO0FBQ3hGO0FBQ0EseUJBQXlCLGlCQUFpQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsc0JBQXNCO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFdBQVcsaUNBQWlDO0FBQ3BGO0FBQ0EseUJBQXlCLGlCQUFpQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsYUFBYTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixlQUFlLGFBQWE7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGFBQWE7QUFDMUQsNkNBQTZDLGFBQWE7QUFDMUQsNkNBQTZDLGFBQWE7QUFDMUQsNkNBQTZDLGFBQWE7QUFDMUQsNkNBQTZDLGFBQWE7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9saWJzL2NhdExpYi5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLy4vc3JjL2pzL3V0aWxzL2xpbmsuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgTGlua1V0aWxpdHkgPSByZXF1aXJlKCcuLi91dGlscy9saW5rJylcblxuY2xhc3MgVGhlQ2F0QVBJIHtcbiAgc3RhdGljIExJTksgPSB7IHRpdGxlOiAnVGhlIENhdCBBUEknLCB0YXJnZXQ6ICdodHRwczovL3d3dy50aGVjYXRhcGkuY29tJyB9XG4gIHN0YXRpYyBDQVRfQVBJID0ge1xuICAgIEJBU0VfVVJMOiAnaHR0cHM6Ly9hcGkudGhlY2F0YXBpLmNvbS92MScsXG4gICAgS0VZOiAnbGl2ZV84ZTl2cXBMcG50VVNDaXVtdGhRdTJ6SG52WXdNT0lNRjFKTGRXcGNVS2VxenRMYTUzbWZqb1pjejNHcnltYUJoJyxcbiAgfVxuICBzdGF0aWMgYXN5bmMgZmV0Y2hDYXRCcmVlZHMoKSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGAke3RoaXMuQ0FUX0FQSS5CQVNFX1VSTH0vYnJlZWRzYClcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHJlcXVlc3QsIHsgaGVhZGVyczogeyAneC1hcGkta2V5JzogdGhpcy5DQVRfQVBJLktFWSB9IH0pXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3Jlc3BvbnNlLnN0YXR1c30gQnJlZWQgT3B0aW9ucyBOb3QgRm91bmQhYClcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbiAgc3RhdGljIGdldENhdEJyZWVkT3B0aW9ucyhicmVlZHMpIHtcbiAgICBjb25zdCBmcmFnbWVudCA9IG5ldyBEb2N1bWVudEZyYWdtZW50KClcbiAgICBmb3IgKGNvbnN0IGJyZWVkIG9mIGJyZWVkcykge1xuICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgIG9wdGlvbi52YWx1ZSA9IGJyZWVkLmlkXG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBicmVlZC5uYW1lXG4gICAgICBmcmFnbWVudC5hcHBlbmQob3B0aW9uKVxuICAgIH1cbiAgICByZXR1cm4gZnJhZ21lbnRcbiAgfVxuICBzdGF0aWMgYXN5bmMgZmV0Y2hDYXRJbWFnZURhdGEobGltaXQsIGJyZWVkSWQgPSBudWxsKSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChgJHt0aGlzLkNBVF9BUEkuQkFTRV9VUkx9L2ltYWdlcy9zZWFyY2hgKVxuICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdsaW1pdCcsIFN0cmluZyhsaW1pdCkpXG4gICAgaWYgKGJyZWVkSWQpIHtcbiAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdicmVlZF9pZCcsIGJyZWVkSWQpXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IGhlYWRlcnM6IHsgJ3gtYXBpLWtleSc6IHRoaXMuQ0FUX0FQSS5LRVkgfSB9KVxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtyZXNwb25zZS5zdGF0dXN9IEltYWdlcyBOb3QgRm91bmRgKVxuICAgIH1cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgcmV0dXJuIGRhdGFcbiAgfVxufVxuXG5jbGFzcyBDYXRCcmVlZEltYWdlVXRpbGl0eSB7XG4gIGNvbnN0cnVjdG9yKCkge31cbiAgYXN5bmMgZ2V0Q2F0QnJlZWRzKCkge1xuICAgIGNvbnN0IGNhdEJyZWVkcyA9IGF3YWl0IFRoZUNhdEFQSS5mZXRjaENhdEJyZWVkcygpXG4gICAgcmV0dXJuIGNhdEJyZWVkc1xuICB9XG4gIHNldENhdEJyZWVkcyhvcHRHcm91cCwgYnJlZWRzKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFRoZUNhdEFQSS5nZXRDYXRCcmVlZE9wdGlvbnMoYnJlZWRzKVxuICAgIG9wdEdyb3VwLmFwcGVuZENoaWxkKG9wdGlvbnMpXG4gIH1cbiAgYXN5bmMgZ2V0Q2F0QnJlZWRJbWFnZURhdGEobGltaXQsIGJyZWVkSWQpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgVGhlQ2F0QVBJLmZldGNoQ2F0SW1hZ2VEYXRhKGxpbWl0LCBicmVlZElkKVxuICAgIHJldHVybiBkYXRhXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0UmFuZG9tQ2F0SW1hZ2VEYXRhKGxpbWl0KSB7XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBUaGVDYXRBUEkuZmV0Y2hDYXRJbWFnZURhdGEobGltaXQpXG4gIHJldHVybiBkYXRhXG59XG5cbmNsYXNzIFJhbmRvbUNhdEltYWdlRGlzcGxheSBleHRlbmRzIExpbmtVdGlsaXR5IHtcbiAgZGlzcGxheURJVlxuICBjb25zdHJ1Y3RvcihkaXNwbGF5SWQsIGxpbmtJZCkge1xuICAgIHN1cGVyKGxpbmtJZClcbiAgICBzdXBlci5zZXRMaW5rKFRoZUNhdEFQSS5MSU5LLnRpdGxlLCBUaGVDYXRBUEkuTElOSy50YXJnZXQsIHRydWUpXG4gICAgdGhpcy5kaXNwbGF5RElWID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGlzcGxheUlkKVxuICB9XG4gIGFzeW5jIGRpc3BsYXlDYXQoKSB7XG4gICAgY29uc3QgaW1hZ2UgPSBhd2FpdCBUaGVDYXRBUEkuZmV0Y2hDYXRJbWFnZURhdGEoMSlcbiAgICB0aGlzLmRpc3BsYXlESVYuaW5uZXJIVE1MID0gYDxpbWcgc3JjPVwiJHtpbWFnZVswXS51cmx9XCIgaGVpZ2h0PVwiYXV0b1wiIHdpZHRoPVwiMTAwJVwiPmBcbiAgICBjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICAgIGJ1dHRvbi5zdHlsZS5tYXJnaW4gPSAnMC41cmVtJ1xuICAgIGJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J1dHRvbi13YXJuaW5nJylcbiAgICBidXR0b24udGV4dENvbnRlbnQgPSAnTmV3IENhdCdcbiAgICBidXR0b24ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuZGlzcGxheUNhdCgpXG4gICAgfVxuICAgIHRoaXMuZGlzcGxheURJVi5hcHBlbmRDaGlsZChidXR0b24pXG4gIH1cbn1cblxuY2xhc3MgUmFuZG9tQ2F0SW1hZ2VTbGlkZXIgZXh0ZW5kcyBMaW5rVXRpbGl0eSB7XG4gIGRpc3BsYXlESVZcbiAgY29uc3RydWN0b3IoZGlzcGxheUlkLCBsaW5rSWQpIHtcbiAgICBzdXBlcihsaW5rSWQpXG4gICAgc3VwZXIuc2V0TGluayhUaGVDYXRBUEkuTElOSy50aXRsZSwgVGhlQ2F0QVBJLkxJTksudGFyZ2V0LCB0cnVlKVxuICAgIHRoaXMuZGlzcGxheURJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpc3BsYXlJZClcbiAgfVxuICBhc3luYyBkaXNwbGF5KCkge1xuICAgIGNvbnN0IGltYWdlID0gYXdhaXQgVGhlQ2F0QVBJLmZldGNoQ2F0SW1hZ2VEYXRhKDUpXG4gICAgdGhpcy5kaXNwbGF5RElWLmlubmVySFRNTCA9IGBcbiAgPHN0eWxlPi5jYXRJbWcge2hlaWdodDogMzUwcHg7IHdpZHRoPSBhdXRvO308L3N0eWxlPlxuICA8ZGl2IGNsYXNzPVwiZ2xpZGVcIj5cbiAgICA8ZGl2IGNsYXNzPVwiZ2xpZGVfX3RyYWNrXCIgZGF0YS1nbGlkZS1lbD1cInRyYWNrXCI+XG4gICAgICA8dWwgY2xhc3M9XCJnbGlkZV9fc2xpZGVzXCI+XG4gICAgICAgIDxsaSBjbGFzcz1cImdsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtpbWFnZVswXS51cmx9XCIgY2xhc3M9XCJjYXRJbWdcIj48L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJnbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7aW1hZ2VbMV0udXJsfVwiIGNsYXNzPVwiY2F0SW1nXCI+PC9saT5cbiAgICAgICAgPGxpIGNsYXNzPVwiZ2xpZGVfX3NsaWRlXCI+PGltZyBzcmM9XCIke2ltYWdlWzJdLnVybH1cIiBjbGFzcz1cImNhdEltZ1wiPjwvbGk+XG4gICAgICAgIDxsaSBjbGFzcz1cImdsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtpbWFnZVszXS51cmx9XCIgY2xhc3M9XCJjYXRJbWdcIj48L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJnbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7aW1hZ2VbNF0udXJsfVwiIGNsYXNzPVwiY2F0SW1nXCI+PC9saT5cbiAgICAgIDwvdWw+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImdsaWRlX19hcnJvd3NcIiBkYXRhLWdsaWRlLWVsPVwiY29udHJvbHNcIj5cbiAgICAgIDxidXR0b24gY2xhc3M9XCJnbGlkZV9fYXJyb3cgZ2xpZGVfX2Fycm93LS1sZWZ0XCIgZGF0YS1nbGlkZS1kaXI9XCI8XCI+cHJldjwvYnV0dG9uPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImdsaWRlX19hcnJvdyBnbGlkZV9fYXJyb3ctLXJpZ2h0XCIgZGF0YS1nbGlkZS1kaXI9XCI+XCI+bmV4dDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgYFxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGF1dG9wbGF5OiAzMDAwLCBob3ZlcnBhdXNlOiBmYWxzZSB9XG4gICAgY29uc3QgeyBHbGlkZSB9ID0gd2luZG93XG4gICAgbmV3IEdsaWRlKCcuZ2xpZGUnLCBvcHRpb25zKS5tb3VudCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENhdEJyZWVkSW1hZ2VVdGlsaXR5LFxuICBnZXRSYW5kb21DYXRJbWFnZURhdGEsXG4gIFJhbmRvbUNhdEltYWdlRGlzcGxheSxcbiAgUmFuZG9tQ2F0SW1hZ2VTbGlkZXIsXG59XG4iLCJjbGFzcyBMaW5rVXRpbGl0eSB7XG4gIGxpbmtFbGVtZW50XG4gIGNvbnN0cnVjdG9yKGxpbmtJRCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsaW5rSUQpXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xpbmsgRWxlbWVudCBOb3QgRm91bmQnKVxuICAgIH1cbiAgICBpZiAoZWxlbWVudC50YWdOYW1lICE9PSAnQScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm90IEEgTGluayBFbGVtZW50JylcbiAgICB9XG4gICAgdGhpcy5saW5rRWxlbWVudCA9IGVsZW1lbnRcbiAgfVxuICBzZXRMaW5rKHRpdGxlLCBocmVmLCBvcGVuSW5OZXdUYWIgPSBmYWxzZSkge1xuICAgIHRoaXMubGlua0VsZW1lbnQuaHJlZiA9IGhyZWZcbiAgICB0aGlzLmxpbmtFbGVtZW50LnRleHRDb250ZW50ID0gdGl0bGVcbiAgICBpZiAob3BlbkluTmV3VGFiKSB7XG4gICAgICB0aGlzLmxpbmtFbGVtZW50LnRhcmdldCA9ICdfYmxhbmsnXG4gICAgICB0aGlzLmxpbmtFbGVtZW50LnJlbCA9ICdub29wZW5lciBub3JlZmVycmVyJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbmtFbGVtZW50LnRhcmdldCA9ICcnXG4gICAgICB0aGlzLmxpbmtFbGVtZW50LnJlbCA9ICcnXG4gICAgfVxuICB9XG4gIGdldExpbmsoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiB0aGlzLmxpbmtFbGVtZW50LnRleHRDb250ZW50IHx8ICcnLFxuICAgICAgaHJlZjogdGhpcy5saW5rRWxlbWVudC5ocmVmLFxuICAgICAgdGFyZ2V0OiB0aGlzLmxpbmtFbGVtZW50LnRhcmdldCxcbiAgICAgIHJlbDogdGhpcy5saW5rRWxlbWVudC5yZWwsXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGlua1V0aWxpdHlcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==