<!-- Dark Mode Toggle -->
# Dark Mode Toggle
The dark mode is implemented using class-based theming, which toggles styles based on whether the `dark-mode` class is present on the root element.
## HTML Setup: Dark Mode Checkbox
```html
<!-- src/html/UI.html -->
<label class="dark-mode-toggle">
  <input type="checkbox" id="darkModeCheckbox" class="dark-mode-checkbox">
  <span id="slider">light</span>
</label>
```
## Dark Mode Toggle JavaScript
```html
<script>
  const darkModeCheckbox = document.getElementById('darkModeCheckbox')
  const darkModeText = document.getElementById('slider')
  if (localStorage.getItem('darkMode') === 'true') {
    darkModeCheckbox.checked = true
    document.body.classList.add('dark-mode');
    darkModeText.textContent = 'dark'
  }
  darkModeCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkModeCheckbox.checked)
    if (darkModeCheckbox.checked) {
      darkModeText.textContent = 'dark'
    } else {
        darkModeText.textContent = 'light'
    }
  })
</script>
```
