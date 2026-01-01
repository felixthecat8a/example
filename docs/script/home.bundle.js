/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/home.js"
/*!************************!*\
  !*** ./src/js/home.js ***!
  \************************/
(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

__webpack_require__(/*! ../scss/style.scss */ "./src/scss/style.scss")

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0L2hvbWUuYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUFPLENBQUMsaURBQW9COztBQUU1QjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELE9BQU87QUFDakUsMkNBQTJDLE1BQU07QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFFBQVEsc0JBQXNCLFVBQVUsRUFBRSxNQUFNO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxpQkFBaUI7QUFDOUUsUUFBUTtBQUNSLDhEQUE4RCxpQkFBaUI7QUFDL0U7QUFDQSxNQUFNO0FBQ047QUFDQSxpRUFBaUUsT0FBTztBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7VUNuRkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQy9CQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLCtCQUErQix3Q0FBd0M7V0FDdkU7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDM0JBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQSw0Rzs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4YW1wbGUvLi9zcmMvanMvaG9tZS5qcyIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9leGFtcGxlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZXhhbXBsZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2V4YW1wbGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoJy4uL3Njc3Mvc3R5bGUuc2NzcycpXG5cbmNvbnN0IGdhbWVESVYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtYmVyR3Vlc3NpbmdHYW1lJylcbmNvbnN0IGdhbWVCdXR0b24gPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgaWQ9XCJzdGFydEdhbWVcIiBjbGFzcz1cImJ1dHRvbi1pbmZvXCI+Q2xpY2sgdG8gUGxheTwvYnV0dG9uPidcblxuZnVuY3Rpb24gc2V0R2FtZShsaW1pdCkge1xuICBnYW1lRElWLmlubmVySFRNTCA9IGdhbWVCdXR0b25cblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRHYW1lJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBwbGF5R2FtZShsaW1pdCkpXG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIHNldEdhbWUoNSlcbn0pXG5cbmZ1bmN0aW9uIHBsYXlHYW1lKGxpbWl0KSB7XG4gIHdpbmRvdy5hbmltYXRlbG8uamFja0luVGhlQm94KCcjbnVtYmVyR3Vlc3NpbmdHYW1lQ29udGFpbmVyJylcbiAgZ2FtZURJVi5pbm5lckhUTUwgPSBgXG4gIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgaWQ9XCJndWVzc1wiIG1pbj1cIjFcIiBtYXg9XCIxMDBcIiBwbGFjZWhvbGRlcj1cIkd1ZXNzXCI+XG4gIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGlkPVwiY2hlY2tcIiBjbGFzcz1cImJ1dHRvbi1zdWNjZXNzXCI+Q2hlY2s8L2J1dHRvbj48YnI+XG4gIDxoNCBpZD1cImhlYWRpbmdcIj5HdWVzcyB0aGUgbnVtYmVyIGZyb20gMSB0byAxMDA8YnI+aW4gJHtsaW1pdH0gdHJpZXMgb3IgbGVzcy48L2g0PlxuICA8bWV0ZXIgdmFsdWU9XCIwXCIgbWluPVwiMFwiIGhpZ2g9XCI1XCIgbWF4PVwiJHtsaW1pdH1cIiBpZD1cIm1ldGVyXCI+PC9tZXRlcj48YnI+XG4gIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGlkPVwicGxheUFnYWluXCIgY2xhc3M9XCJidXR0b24tcHJpbWFyeVwiPlBsYXkgQWdhaW4/PC9idXR0b24+XG4gIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGlkPVwiY2xvc2VcIiBjbGFzcz1cImJ1dHRvbi1kYW5nZXJcIj5DbG9zZTwvYnV0dG9uPlxuICBgXG4gIGNvbnN0IGhlYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGVhZGluZycpXG4gIGhlYWRpbmcuc3R5bGUuY29sb3IgPSAnbWVkaXVtYXF1YW1hcmluZSdcbiAgY29uc3QgZ3Vlc3NJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdndWVzcycpXG4gIGNvbnN0IGNoZWNrQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoZWNrJylcbiAgY29uc3QgYXR0ZW1wdE1ldGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldGVyJylcbiAgY29uc3QgcGxheUFnYWluQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXlBZ2FpbicpXG4gIGNvbnN0IGNsb3NlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3NlJylcbiAgY29uc3QgYW5zd2VyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSArIDFcbiAgY29uc29sZS5sb2coYW5zd2VyKVxuICBsZXQgYXR0ZW1wdHMgPSAwXG4gIGF0dGVtcHRNZXRlci52YWx1ZSA9IDBcbiAgZ3Vlc3NJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNoZWNrQnV0dG9uLmNsaWNrKClcbiAgICB9XG4gIH0pXG4gIGNoZWNrQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGlmIChndWVzc0lucHV0LnZhbHVlKSB7XG4gICAgICBjaGVja051bWJlcihOdW1iZXIoZ3Vlc3NJbnB1dC52YWx1ZSkpXG4gICAgfVxuICB9KVxuICBmdW5jdGlvbiBjaGVja051bWJlcihndWVzc051bWJlcikge1xuICAgIGF0dGVtcHRzKytcbiAgICBhdHRlbXB0TWV0ZXIudmFsdWUgPSBhdHRlbXB0c1xuICAgIGlmIChndWVzc051bWJlciA9PT0gYW5zd2VyKSB7XG4gICAgICB3aW5kb3cuYW5pbWF0ZWxvLnJ1YmJlckJhbmQoJyNoZWFkaW5nJylcbiAgICAgIGNvbnN0IHRyaWVzID0gYXR0ZW1wdHMgPT09IDEgPyAndHJ5JyA6ICd0cmllcydcbiAgICAgIHVwZGF0ZUhlYWRpbmcoYCR7YW5zd2VyfSBpcyBjb3JyZWN0XFxuaW4gb25seSAke2F0dGVtcHRzfSAke3RyaWVzfSFgLCAnZ29sZCcpXG4gICAgICBkaXNhYmxlQ2hlY2tCdXR0b24oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChhdHRlbXB0cyA8IGxpbWl0KSB7XG4gICAgICB3aW5kb3cuYW5pbWF0ZWxvLnNoYWtlKCcjaGVhZGluZycpXG4gICAgICBpZiAoZ3Vlc3NOdW1iZXIgPCBhbnN3ZXIpIHtcbiAgICAgICAgdXBkYXRlSGVhZGluZyhgVG9vIGxvdy4gVHJ5IGFnYWluLlxcbkF0dGVtcHRzIExlZnQ6ICR7bGltaXQgLSBhdHRlbXB0c31gLCAnY29ybmZsb3dlcmJsdWUnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlSGVhZGluZyhgVG9vIGhpZ2guIFRyeSBhZ2Fpbi5cXG5BdHRlbXB0cyBMZWZ0OiAke2xpbWl0IC0gYXR0ZW1wdHN9YCwgJ3BhbGV2aW9sZXRyZWQnKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuYW5pbWF0ZWxvLmZsYXNoKCcjaGVhZGluZycpXG4gICAgICB1cGRhdGVIZWFkaW5nKGBZb3UndmUgcmVhY2hlZCB0aGUgbGltaXQuXFxuVGhlIG51bWJlciB3YXMgJHthbnN3ZXJ9LmAsICdvcmNoaWQnKVxuICAgICAgZGlzYWJsZUNoZWNrQnV0dG9uKClcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlSGVhZGluZyh0ZXh0LCBjb2xvcikge1xuICAgIGhlYWRpbmcuaW5uZXJUZXh0ID0gdGV4dFxuICAgIGhlYWRpbmcuc3R5bGUuY29sb3IgPSBjb2xvclxuICB9XG4gIGZ1bmN0aW9uIGRpc2FibGVDaGVja0J1dHRvbigpIHtcbiAgICBjaGVja0J1dHRvbi5kaXNhYmxlZCA9IHRydWVcbiAgICBjaGVja0J1dHRvbi5zdHlsZS5vcGFjaXR5ID0gJzAuNSdcbiAgfVxuICBwbGF5QWdhaW5CdXR0b24ub25jbGljayA9ICgpID0+IHBsYXlHYW1lKGxpbWl0KVxuICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuYW5pbWF0ZWxvLmZsaXAoJyNudW1iZXJHdWVzc2luZ0dhbWUnKVxuICAgIHNldEdhbWUobGltaXQpXG4gIH0pXG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBleGlzdHMgKGRldmVsb3BtZW50IG9ubHkpXG5cdGlmIChfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcImhvbWVcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rZXhhbXBsZVwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtleGFtcGxlXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJzcmNfc2Nzc19zdHlsZV9zY3NzXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2pzL2hvbWUuanNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=