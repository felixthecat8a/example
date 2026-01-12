class StatusUtility {
  statusDIV
  constructor(statusDivElementId) {
    const element = document.getElementById(statusDivElementId)
    if (!element || !(element instanceof HTMLDivElement)) {
      throw new Error(`Status Div Element Not Found or Not a DIV`)
    }
    this.statusDIV = element
  }
  setStatus(status) {
    this.statusDIV.textContent = status ?? ''
  }
  clearStatus() {
    this.statusDIV.textContent = ''
  }
  setError(message) {
    this.clearStatus()
    const span = document.createElement('span')
    span.textContent = message
    span.style.color = 'palevioletred'
    this.statusDIV.appendChild(span)
  }
  setLoading(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'spinner'
    this.statusDIV.appendChild(textNode)
    this.statusDIV.appendChild(spinner)
  }
  loadWeather(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'cloudLoader'
    this.statusDIV.appendChild(textNode)
    this.statusDIV.appendChild(spinner)
  }
  loadCat(message) {
    this.clearStatus()
    const textNode = document.createTextNode(message)
    const spinner = document.createElement('span')
    spinner.className = 'catLoader'
    spinner.innerHTML = `
    <div class="catcontainer">
      <div class="cat">
          <div class="ear left"></div>
          <div class="ear right"></div>
          <div class="eye left"></div>
          <div class="eye right"></div>
          <div class="nose"></div>
      </div>
    </div>
    `
    this.statusDIV.appendChild(textNode)
    this.statusDIV.appendChild(spinner)
  }
}

module.exports = StatusUtility
