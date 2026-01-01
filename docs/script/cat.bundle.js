/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/cat.js"
/*!***********************!*\
  !*** ./src/js/cat.js ***!
  \***********************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! ../scss/style.scss */ "./src/scss/style.scss")
const { CatBreedImageUtility, getRandomCatImageData } = __webpack_require__(/*! ./libs/catLib */ "./src/js/libs/catLib.js")
const breedUtil = new CatBreedImageUtility()

const catDiv = document.getElementById('catDisplay')
const catHeading = document.getElementById('catHeading')
const catParagraph = document.getElementById('catParagraph')
const catInfo = document.getElementById('catInfo')
document.addEventListener('DOMContentLoaded', async () => {
  displayRandomCats()
  const catSelector = document.getElementById('catSelector')
  catSelector.innerHTML = `
  <select id="catSelect">
    <optgroup label="Random Cat">
      <option value="showCat" selected>Show Random Cats</option>
    </optgroup>
    <optgroup label="Cat by Breed" id="catBreedOptGroup">
      <option value="catBreed" id="catBreed" hidden>Choose a Cat Breed</option>
    </optgroup>
  </select>
  `
  try {
    const catSelect = document.getElementById('catSelect')
    const catBreedOptGroup = document.getElementById('catBreedOptGroup')
    const breeds = await breedUtil.getCatBreeds()
    breedUtil.setCatBreeds(catBreedOptGroup, breeds)
    catSelect.addEventListener('change', async event => {
      const catBreedEvent = event.target.value
      if (catBreedEvent === 'showCat') {
        displayRandomCats()
      } else {
        const selectedBreed = breeds.find(breed => breed.id === catBreedEvent)
        if (selectedBreed) {
          displayCatBreed(selectedBreed)
        }
      }
    })
  } catch (error) {
    console.error(error)
  }
})
const { Splide } = window
async function displayRandomCats() {
  catHeading.textContent = 'Random Cats'
  catParagraph.textContent = ''
  catInfo.innerHTML = ''
  console.log('showing random cats')
  const data = await getRandomCatImageData(4)
  const catImg = data.map(cat => cat.url)
  const imgWidth = data.map(cat => cat.width)
  console.log(imgWidth)
  catDiv.innerHTML = `
  <section class="splide" aria-label="Splide Cat Images">
    <div class="splide__track">
      <ul class="splide__list">
        <li class="splide__slide"><img src="${catImg[0]}" height="350px" width="auto"></li>
        <li class="splide__slide"><img src="${catImg[1]}" height="350px" width="auto"></li>
        <li class="splide__slide"><img src="${catImg[2]}" height="350px" width="auto"></li>
        <li class="splide__slide"><img src="${catImg[3]}" height="350px" width="auto"></li>
      </ul>
    </div>
  </section>
  `
  new Splide('.splide').mount()
}
async function displayCatBreed(catBreed) {
  catHeading.textContent = catBreed.name
  catParagraph.textContent = catBreed.description
  catInfo.innerHTML = `
  <p>Temperament: ${catBreed.temperament}<br>Alternate Names: ${catBreed.alt_names || 'None'}</p>
  `
  console.log(`now showing ${catBreed.name}`)
  const limit = 4
  const data = await breedUtil.getCatBreedImageData(limit, catBreed.id)
  const catImages = data.map(cat => cat.url)
  catDiv.innerHTML = getDisplayHTML(catImages, catBreed.name)
  const options = { type: 'fade', rewind: true }
  new Splide('.splide', options).mount()
}
function getDisplayHTML(img, name) {
  if (img.length === 0) {
    console.log(`No images found for ${name}.`)
    return `<h4>No images found for ${name}.</h4>`
  } else if (img.length === 1) {
    console.log(`${name} has only 1 image`)
    return `<img src="${img[0]}" alt="${name}" height='350px' width='auto'>`
  } else if (img.length < 3) {
    console.log(`${name} has less than 3 images`)
    return `
    <section class="splide" aria-label="Splide Cat Images">
      <div class="splide__track">
        <ul class="splide__list">
          <li class="splide__slide"><img src="${img[0]}" alt="${name}" height='350px' width='auto'></li>
          <li class="splide__slide"><img src="${img[1]}" alt="${name}" height='350px' width='auto'></li>
        </ul>
      </div>
    </section>
    `
  } else {
    return `
    <section class="splide" aria-label="Splide Cat Images">
      <div class="splide__track">
        <ul class="splide__list">
          <li class="splide__slide"><img src="${img[0]}" alt="${name}" height='350px' width='auto'></li>
          <li class="splide__slide"><img src="${img[1]}" alt="${name}" height='350px' width='auto'></li>
          <li class="splide__slide"><img src="${img[2]}" alt="${name}" height='350px' width='auto'></li>
          <li class="splide__slide"><img src="${img[3]}" alt="${name}" height='350px' width='auto'></li>
        </ul>
      </div>
    </section>
    `
  }
}


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
/******/ 			"cat": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["src_scss_style_scss","src_js_libs_catLib_js"], () => (__webpack_require__("./src/js/cat.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0L2NhdC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUJBQU8sQ0FBQyxpREFBb0I7QUFDNUIsUUFBUSw4Q0FBOEMsRUFBRSxtQkFBTyxDQUFDLDhDQUFlO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBLENBQUM7QUFDRCxRQUFRLFNBQVM7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsVUFBVTtBQUN4RCw4Q0FBOEMsVUFBVTtBQUN4RCw4Q0FBOEMsVUFBVTtBQUN4RCw4Q0FBOEMsVUFBVTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUIsdUJBQXVCLDZCQUE2QjtBQUM3RjtBQUNBLDZCQUE2QixjQUFjO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLEtBQUs7QUFDNUMsc0NBQXNDLEtBQUs7QUFDM0MsSUFBSTtBQUNKLG1CQUFtQixNQUFNO0FBQ3pCLHdCQUF3QixPQUFPLFNBQVMsS0FBSztBQUM3QyxJQUFJO0FBQ0osbUJBQW1CLE1BQU07QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsT0FBTyxTQUFTLEtBQUs7QUFDckUsZ0RBQWdELE9BQU8sU0FBUyxLQUFLO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELE9BQU8sU0FBUyxLQUFLO0FBQ3JFLGdEQUFnRCxPQUFPLFNBQVMsS0FBSztBQUNyRSxnREFBZ0QsT0FBTyxTQUFTLEtBQUs7QUFDckUsZ0RBQWdELE9BQU8sU0FBUyxLQUFLO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQ2hIQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOztVQUVBO1VBQ0E7Ozs7O1dDL0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBLGtCQUFrQixxQkFBcUI7V0FDdkM7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRTs7Ozs7V0MzQkEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9qcy9jYXQuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKCcuLi9zY3NzL3N0eWxlLnNjc3MnKVxuY29uc3QgeyBDYXRCcmVlZEltYWdlVXRpbGl0eSwgZ2V0UmFuZG9tQ2F0SW1hZ2VEYXRhIH0gPSByZXF1aXJlKCcuL2xpYnMvY2F0TGliJylcbmNvbnN0IGJyZWVkVXRpbCA9IG5ldyBDYXRCcmVlZEltYWdlVXRpbGl0eSgpXG5cbmNvbnN0IGNhdERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXREaXNwbGF5JylcbmNvbnN0IGNhdEhlYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0SGVhZGluZycpXG5jb25zdCBjYXRQYXJhZ3JhcGggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0UGFyYWdyYXBoJylcbmNvbnN0IGNhdEluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0SW5mbycpXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYXN5bmMgKCkgPT4ge1xuICBkaXNwbGF5UmFuZG9tQ2F0cygpXG4gIGNvbnN0IGNhdFNlbGVjdG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhdFNlbGVjdG9yJylcbiAgY2F0U2VsZWN0b3IuaW5uZXJIVE1MID0gYFxuICA8c2VsZWN0IGlkPVwiY2F0U2VsZWN0XCI+XG4gICAgPG9wdGdyb3VwIGxhYmVsPVwiUmFuZG9tIENhdFwiPlxuICAgICAgPG9wdGlvbiB2YWx1ZT1cInNob3dDYXRcIiBzZWxlY3RlZD5TaG93IFJhbmRvbSBDYXRzPC9vcHRpb24+XG4gICAgPC9vcHRncm91cD5cbiAgICA8b3B0Z3JvdXAgbGFiZWw9XCJDYXQgYnkgQnJlZWRcIiBpZD1cImNhdEJyZWVkT3B0R3JvdXBcIj5cbiAgICAgIDxvcHRpb24gdmFsdWU9XCJjYXRCcmVlZFwiIGlkPVwiY2F0QnJlZWRcIiBoaWRkZW4+Q2hvb3NlIGEgQ2F0IEJyZWVkPC9vcHRpb24+XG4gICAgPC9vcHRncm91cD5cbiAgPC9zZWxlY3Q+XG4gIGBcbiAgdHJ5IHtcbiAgICBjb25zdCBjYXRTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2F0U2VsZWN0JylcbiAgICBjb25zdCBjYXRCcmVlZE9wdEdyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhdEJyZWVkT3B0R3JvdXAnKVxuICAgIGNvbnN0IGJyZWVkcyA9IGF3YWl0IGJyZWVkVXRpbC5nZXRDYXRCcmVlZHMoKVxuICAgIGJyZWVkVXRpbC5zZXRDYXRCcmVlZHMoY2F0QnJlZWRPcHRHcm91cCwgYnJlZWRzKVxuICAgIGNhdFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyBldmVudCA9PiB7XG4gICAgICBjb25zdCBjYXRCcmVlZEV2ZW50ID0gZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgICBpZiAoY2F0QnJlZWRFdmVudCA9PT0gJ3Nob3dDYXQnKSB7XG4gICAgICAgIGRpc3BsYXlSYW5kb21DYXRzKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQnJlZWQgPSBicmVlZHMuZmluZChicmVlZCA9PiBicmVlZC5pZCA9PT0gY2F0QnJlZWRFdmVudClcbiAgICAgICAgaWYgKHNlbGVjdGVkQnJlZWQpIHtcbiAgICAgICAgICBkaXNwbGF5Q2F0QnJlZWQoc2VsZWN0ZWRCcmVlZClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgfVxufSlcbmNvbnN0IHsgU3BsaWRlIH0gPSB3aW5kb3dcbmFzeW5jIGZ1bmN0aW9uIGRpc3BsYXlSYW5kb21DYXRzKCkge1xuICBjYXRIZWFkaW5nLnRleHRDb250ZW50ID0gJ1JhbmRvbSBDYXRzJ1xuICBjYXRQYXJhZ3JhcGgudGV4dENvbnRlbnQgPSAnJ1xuICBjYXRJbmZvLmlubmVySFRNTCA9ICcnXG4gIGNvbnNvbGUubG9nKCdzaG93aW5nIHJhbmRvbSBjYXRzJylcbiAgY29uc3QgZGF0YSA9IGF3YWl0IGdldFJhbmRvbUNhdEltYWdlRGF0YSg0KVxuICBjb25zdCBjYXRJbWcgPSBkYXRhLm1hcChjYXQgPT4gY2F0LnVybClcbiAgY29uc3QgaW1nV2lkdGggPSBkYXRhLm1hcChjYXQgPT4gY2F0LndpZHRoKVxuICBjb25zb2xlLmxvZyhpbWdXaWR0aClcbiAgY2F0RGl2LmlubmVySFRNTCA9IGBcbiAgPHNlY3Rpb24gY2xhc3M9XCJzcGxpZGVcIiBhcmlhLWxhYmVsPVwiU3BsaWRlIENhdCBJbWFnZXNcIj5cbiAgICA8ZGl2IGNsYXNzPVwic3BsaWRlX190cmFja1wiPlxuICAgICAgPHVsIGNsYXNzPVwic3BsaWRlX19saXN0XCI+XG4gICAgICAgIDxsaSBjbGFzcz1cInNwbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7Y2F0SW1nWzBdfVwiIGhlaWdodD1cIjM1MHB4XCIgd2lkdGg9XCJhdXRvXCI+PC9saT5cbiAgICAgICAgPGxpIGNsYXNzPVwic3BsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtjYXRJbWdbMV19XCIgaGVpZ2h0PVwiMzUwcHhcIiB3aWR0aD1cImF1dG9cIj48L2xpPlxuICAgICAgICA8bGkgY2xhc3M9XCJzcGxpZGVfX3NsaWRlXCI+PGltZyBzcmM9XCIke2NhdEltZ1syXX1cIiBoZWlnaHQ9XCIzNTBweFwiIHdpZHRoPVwiYXV0b1wiPjwvbGk+XG4gICAgICAgIDxsaSBjbGFzcz1cInNwbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7Y2F0SW1nWzNdfVwiIGhlaWdodD1cIjM1MHB4XCIgd2lkdGg9XCJhdXRvXCI+PC9saT5cbiAgICAgIDwvdWw+XG4gICAgPC9kaXY+XG4gIDwvc2VjdGlvbj5cbiAgYFxuICBuZXcgU3BsaWRlKCcuc3BsaWRlJykubW91bnQoKVxufVxuYXN5bmMgZnVuY3Rpb24gZGlzcGxheUNhdEJyZWVkKGNhdEJyZWVkKSB7XG4gIGNhdEhlYWRpbmcudGV4dENvbnRlbnQgPSBjYXRCcmVlZC5uYW1lXG4gIGNhdFBhcmFncmFwaC50ZXh0Q29udGVudCA9IGNhdEJyZWVkLmRlc2NyaXB0aW9uXG4gIGNhdEluZm8uaW5uZXJIVE1MID0gYFxuICA8cD5UZW1wZXJhbWVudDogJHtjYXRCcmVlZC50ZW1wZXJhbWVudH08YnI+QWx0ZXJuYXRlIE5hbWVzOiAke2NhdEJyZWVkLmFsdF9uYW1lcyB8fCAnTm9uZSd9PC9wPlxuICBgXG4gIGNvbnNvbGUubG9nKGBub3cgc2hvd2luZyAke2NhdEJyZWVkLm5hbWV9YClcbiAgY29uc3QgbGltaXQgPSA0XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBicmVlZFV0aWwuZ2V0Q2F0QnJlZWRJbWFnZURhdGEobGltaXQsIGNhdEJyZWVkLmlkKVxuICBjb25zdCBjYXRJbWFnZXMgPSBkYXRhLm1hcChjYXQgPT4gY2F0LnVybClcbiAgY2F0RGl2LmlubmVySFRNTCA9IGdldERpc3BsYXlIVE1MKGNhdEltYWdlcywgY2F0QnJlZWQubmFtZSlcbiAgY29uc3Qgb3B0aW9ucyA9IHsgdHlwZTogJ2ZhZGUnLCByZXdpbmQ6IHRydWUgfVxuICBuZXcgU3BsaWRlKCcuc3BsaWRlJywgb3B0aW9ucykubW91bnQoKVxufVxuZnVuY3Rpb24gZ2V0RGlzcGxheUhUTUwoaW1nLCBuYW1lKSB7XG4gIGlmIChpbWcubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS5sb2coYE5vIGltYWdlcyBmb3VuZCBmb3IgJHtuYW1lfS5gKVxuICAgIHJldHVybiBgPGg0Pk5vIGltYWdlcyBmb3VuZCBmb3IgJHtuYW1lfS48L2g0PmBcbiAgfSBlbHNlIGlmIChpbWcubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc29sZS5sb2coYCR7bmFtZX0gaGFzIG9ubHkgMSBpbWFnZWApXG4gICAgcmV0dXJuIGA8aW1nIHNyYz1cIiR7aW1nWzBdfVwiIGFsdD1cIiR7bmFtZX1cIiBoZWlnaHQ9JzM1MHB4JyB3aWR0aD0nYXV0byc+YFxuICB9IGVsc2UgaWYgKGltZy5sZW5ndGggPCAzKSB7XG4gICAgY29uc29sZS5sb2coYCR7bmFtZX0gaGFzIGxlc3MgdGhhbiAzIGltYWdlc2ApXG4gICAgcmV0dXJuIGBcbiAgICA8c2VjdGlvbiBjbGFzcz1cInNwbGlkZVwiIGFyaWEtbGFiZWw9XCJTcGxpZGUgQ2F0IEltYWdlc1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInNwbGlkZV9fdHJhY2tcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwic3BsaWRlX19saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwic3BsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtpbWdbMF19XCIgYWx0PVwiJHtuYW1lfVwiIGhlaWdodD0nMzUwcHgnIHdpZHRoPSdhdXRvJz48L2xpPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInNwbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7aW1nWzFdfVwiIGFsdD1cIiR7bmFtZX1cIiBoZWlnaHQ9JzM1MHB4JyB3aWR0aD0nYXV0byc+PC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgICBgXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGBcbiAgICA8c2VjdGlvbiBjbGFzcz1cInNwbGlkZVwiIGFyaWEtbGFiZWw9XCJTcGxpZGUgQ2F0IEltYWdlc1wiPlxuICAgICAgPGRpdiBjbGFzcz1cInNwbGlkZV9fdHJhY2tcIj5cbiAgICAgICAgPHVsIGNsYXNzPVwic3BsaWRlX19saXN0XCI+XG4gICAgICAgICAgPGxpIGNsYXNzPVwic3BsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtpbWdbMF19XCIgYWx0PVwiJHtuYW1lfVwiIGhlaWdodD0nMzUwcHgnIHdpZHRoPSdhdXRvJz48L2xpPlxuICAgICAgICAgIDxsaSBjbGFzcz1cInNwbGlkZV9fc2xpZGVcIj48aW1nIHNyYz1cIiR7aW1nWzFdfVwiIGFsdD1cIiR7bmFtZX1cIiBoZWlnaHQ9JzM1MHB4JyB3aWR0aD0nYXV0byc+PC9saT5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJzcGxpZGVfX3NsaWRlXCI+PGltZyBzcmM9XCIke2ltZ1syXX1cIiBhbHQ9XCIke25hbWV9XCIgaGVpZ2h0PSczNTBweCcgd2lkdGg9J2F1dG8nPjwvbGk+XG4gICAgICAgICAgPGxpIGNsYXNzPVwic3BsaWRlX19zbGlkZVwiPjxpbWcgc3JjPVwiJHtpbWdbM119XCIgYWx0PVwiJHtuYW1lfVwiIGhlaWdodD0nMzUwcHgnIHdpZHRoPSdhdXRvJz48L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuICAgIGBcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJjYXRcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rZXhhbXBsZVwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJzcmNfc2Nzc19zdHlsZV9zY3NzXCIsXCJzcmNfanNfbGlic19jYXRMaWJfanNcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvanMvY2F0LmpzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9