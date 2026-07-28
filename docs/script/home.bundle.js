/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/css/game.css"
/*!**************************!*\
  !*** ./src/css/game.css ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/js/home.js"
/*!************************!*\
  !*** ./src/js/home.js ***!
  \************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! ../scss/style.scss */ "./src/scss/style.scss")
__webpack_require__(/*! ../css/game.css */ "./src/css/game.css")

const gameDIV = document.getElementById('numberGuessingGame')
const gameButton = '<button type="button" id="startGame" class="button-info">Click to Play</button>'

function setGame(limit) {
  gameDIV.innerHTML = gameButton

  document.getElementById('startGame').addEventListener('click', () => playGame(limit))
}

document.addEventListener('DOMContentLoaded', () => {
  setGame(5)
})

function playGame(limit) {
  window.animatelo.jackInTheBox('#numberGuessingGameContainer')
  gameDIV.innerHTML = `
  <input type="number" id="guess" min="1" max="100" placeholder="Guess">
  <button type="button" id="check" class="button-success">Check</button><br>
  <h4 id="heading">Guess the number from 1 to 100<br>in ${limit} tries or less.</h4>
  <meter value="0" min="0" high="5" max="${limit}" id="meter"></meter><br>
  <button type="button" id="playAgain" class="button-primary">Play Again?</button>
  <button type="button" id="close" class="button-danger">Close</button>
  `
  const heading = document.getElementById('heading')
  heading.style.color = 'mediumaquamarine'
  const guessInput = document.getElementById('guess')
  const checkButton = document.getElementById('check')
  const attemptMeter = document.getElementById('meter')
  const playAgainButton = document.getElementById('playAgain')
  const close = document.getElementById('close')
  const answer = Math.floor(Math.random() * 100) + 1
  console.log(answer)
  let attempts = 0
  attemptMeter.value = 0
  guessInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      checkButton.click()
    }
  })
  checkButton.addEventListener('click', () => {
    if (guessInput.value) {
      checkNumber(Number(guessInput.value))
    }
  })
  function checkNumber(guessNumber) {
    attempts++
    attemptMeter.value = attempts
    if (guessNumber === answer) {
      window.animatelo.rubberBand('#heading')
      const tries = attempts === 1 ? 'try' : 'tries'
      updateHeading(`${answer} is correct\nin only ${attempts} ${tries}!`, 'gold')
      disableCheckButton()
      return
    }
    if (attempts < limit) {
      window.animatelo.shake('#heading')
      if (guessNumber < answer) {
        updateHeading(`Too low. Try again.\nAttempts Left: ${limit - attempts}`, 'cornflowerblue')
      } else {
        updateHeading(`Too high. Try again.\nAttempts Left: ${limit - attempts}`, 'palevioletred')
      }
    } else {
      window.animatelo.flash('#heading')
      updateHeading(`You've reached the limit.\nThe number was ${answer}.`, 'orchid')
      disableCheckButton()
    }
  }
  function updateHeading(text, color) {
    heading.innerText = text
    heading.style.color = color
  }
  function disableCheckButton() {
    checkButton.disabled = true
    checkButton.style.opacity = '0.5'
  }
  playAgainButton.onclick = () => playGame(limit)
  close.addEventListener('click', function () {
    window.animatelo.flip('#numberGuessingGame')
    setGame(limit)
  })
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
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
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
/******/ 			"home": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["src_scss_style_scss"], () => (__webpack_require__("./src/js/home.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0L2hvbWUuYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7O0FDQUEsbUJBQU8sQ0FBQyxpREFBb0I7QUFDNUIsbUJBQU8sQ0FBQywyQ0FBaUI7O0FBRXpCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsT0FBTztBQUNqRSwyQ0FBMkMsTUFBTTtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsUUFBUSxzQkFBc0IsVUFBVSxFQUFFLE1BQU07QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELGlCQUFpQjtBQUM5RSxRQUFRO0FBQ1IsOERBQThELGlCQUFpQjtBQUMvRTtBQUNBLE1BQU07QUFDTjtBQUNBLGlFQUFpRSxPQUFPO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7OztVQ3BGQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOztVQUVBO1VBQ0E7Ozs7O1dDL0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBLGtCQUFrQixxQkFBcUI7V0FDdkM7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRTs7Ozs7V0MzQkEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhhbXBsZS8uL3NyYy9jc3MvZ2FtZS5jc3M/NDI4ZiIsIndlYnBhY2s6Ly9leGFtcGxlLy4vc3JjL2pzL2hvbWUuanMiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCJyZXF1aXJlKCcuLi9zY3NzL3N0eWxlLnNjc3MnKVxucmVxdWlyZSgnLi4vY3NzL2dhbWUuY3NzJylcblxuY29uc3QgZ2FtZURJViA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdudW1iZXJHdWVzc2luZ0dhbWUnKVxuY29uc3QgZ2FtZUJ1dHRvbiA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBpZD1cInN0YXJ0R2FtZVwiIGNsYXNzPVwiYnV0dG9uLWluZm9cIj5DbGljayB0byBQbGF5PC9idXR0b24+J1xuXG5mdW5jdGlvbiBzZXRHYW1lKGxpbWl0KSB7XG4gIGdhbWVESVYuaW5uZXJIVE1MID0gZ2FtZUJ1dHRvblxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydEdhbWUnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHBsYXlHYW1lKGxpbWl0KSlcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgc2V0R2FtZSg1KVxufSlcblxuZnVuY3Rpb24gcGxheUdhbWUobGltaXQpIHtcbiAgd2luZG93LmFuaW1hdGVsby5qYWNrSW5UaGVCb3goJyNudW1iZXJHdWVzc2luZ0dhbWVDb250YWluZXInKVxuICBnYW1lRElWLmlubmVySFRNTCA9IGBcbiAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBpZD1cImd1ZXNzXCIgbWluPVwiMVwiIG1heD1cIjEwMFwiIHBsYWNlaG9sZGVyPVwiR3Vlc3NcIj5cbiAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJjaGVja1wiIGNsYXNzPVwiYnV0dG9uLXN1Y2Nlc3NcIj5DaGVjazwvYnV0dG9uPjxicj5cbiAgPGg0IGlkPVwiaGVhZGluZ1wiPkd1ZXNzIHRoZSBudW1iZXIgZnJvbSAxIHRvIDEwMDxicj5pbiAke2xpbWl0fSB0cmllcyBvciBsZXNzLjwvaDQ+XG4gIDxtZXRlciB2YWx1ZT1cIjBcIiBtaW49XCIwXCIgaGlnaD1cIjVcIiBtYXg9XCIke2xpbWl0fVwiIGlkPVwibWV0ZXJcIj48L21ldGVyPjxicj5cbiAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJwbGF5QWdhaW5cIiBjbGFzcz1cImJ1dHRvbi1wcmltYXJ5XCI+UGxheSBBZ2Fpbj88L2J1dHRvbj5cbiAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJjbG9zZVwiIGNsYXNzPVwiYnV0dG9uLWRhbmdlclwiPkNsb3NlPC9idXR0b24+XG4gIGBcbiAgY29uc3QgaGVhZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoZWFkaW5nJylcbiAgaGVhZGluZy5zdHlsZS5jb2xvciA9ICdtZWRpdW1hcXVhbWFyaW5lJ1xuICBjb25zdCBndWVzc0lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2d1ZXNzJylcbiAgY29uc3QgY2hlY2tCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hlY2snKVxuICBjb25zdCBhdHRlbXB0TWV0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWV0ZXInKVxuICBjb25zdCBwbGF5QWdhaW5CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxheUFnYWluJylcbiAgY29uc3QgY2xvc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvc2UnKVxuICBjb25zdCBhbnN3ZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApICsgMVxuICBjb25zb2xlLmxvZyhhbnN3ZXIpXG4gIGxldCBhdHRlbXB0cyA9IDBcbiAgYXR0ZW1wdE1ldGVyLnZhbHVlID0gMFxuICBndWVzc0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgY2hlY2tCdXR0b24uY2xpY2soKVxuICAgIH1cbiAgfSlcbiAgY2hlY2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKGd1ZXNzSW5wdXQudmFsdWUpIHtcbiAgICAgIGNoZWNrTnVtYmVyKE51bWJlcihndWVzc0lucHV0LnZhbHVlKSlcbiAgICB9XG4gIH0pXG4gIGZ1bmN0aW9uIGNoZWNrTnVtYmVyKGd1ZXNzTnVtYmVyKSB7XG4gICAgYXR0ZW1wdHMrK1xuICAgIGF0dGVtcHRNZXRlci52YWx1ZSA9IGF0dGVtcHRzXG4gICAgaWYgKGd1ZXNzTnVtYmVyID09PSBhbnN3ZXIpIHtcbiAgICAgIHdpbmRvdy5hbmltYXRlbG8ucnViYmVyQmFuZCgnI2hlYWRpbmcnKVxuICAgICAgY29uc3QgdHJpZXMgPSBhdHRlbXB0cyA9PT0gMSA/ICd0cnknIDogJ3RyaWVzJ1xuICAgICAgdXBkYXRlSGVhZGluZyhgJHthbnN3ZXJ9IGlzIGNvcnJlY3RcXG5pbiBvbmx5ICR7YXR0ZW1wdHN9ICR7dHJpZXN9IWAsICdnb2xkJylcbiAgICAgIGRpc2FibGVDaGVja0J1dHRvbigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGF0dGVtcHRzIDwgbGltaXQpIHtcbiAgICAgIHdpbmRvdy5hbmltYXRlbG8uc2hha2UoJyNoZWFkaW5nJylcbiAgICAgIGlmIChndWVzc051bWJlciA8IGFuc3dlcikge1xuICAgICAgICB1cGRhdGVIZWFkaW5nKGBUb28gbG93LiBUcnkgYWdhaW4uXFxuQXR0ZW1wdHMgTGVmdDogJHtsaW1pdCAtIGF0dGVtcHRzfWAsICdjb3JuZmxvd2VyYmx1ZScpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGVIZWFkaW5nKGBUb28gaGlnaC4gVHJ5IGFnYWluLlxcbkF0dGVtcHRzIExlZnQ6ICR7bGltaXQgLSBhdHRlbXB0c31gLCAncGFsZXZpb2xldHJlZCcpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5hbmltYXRlbG8uZmxhc2goJyNoZWFkaW5nJylcbiAgICAgIHVwZGF0ZUhlYWRpbmcoYFlvdSd2ZSByZWFjaGVkIHRoZSBsaW1pdC5cXG5UaGUgbnVtYmVyIHdhcyAke2Fuc3dlcn0uYCwgJ29yY2hpZCcpXG4gICAgICBkaXNhYmxlQ2hlY2tCdXR0b24oKVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVIZWFkaW5nKHRleHQsIGNvbG9yKSB7XG4gICAgaGVhZGluZy5pbm5lclRleHQgPSB0ZXh0XG4gICAgaGVhZGluZy5zdHlsZS5jb2xvciA9IGNvbG9yXG4gIH1cbiAgZnVuY3Rpb24gZGlzYWJsZUNoZWNrQnV0dG9uKCkge1xuICAgIGNoZWNrQnV0dG9uLmRpc2FibGVkID0gdHJ1ZVxuICAgIGNoZWNrQnV0dG9uLnN0eWxlLm9wYWNpdHkgPSAnMC41J1xuICB9XG4gIHBsYXlBZ2FpbkJ1dHRvbi5vbmNsaWNrID0gKCkgPT4gcGxheUdhbWUobGltaXQpXG4gIGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5hbmltYXRlbG8uZmxpcCgnI251bWJlckd1ZXNzaW5nR2FtZScpXG4gICAgc2V0R2FtZShsaW1pdClcbiAgfSlcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiaG9tZVwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2V4YW1wbGVcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInNyY19zY3NzX3N0eWxlX3Njc3NcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvanMvaG9tZS5qc1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9