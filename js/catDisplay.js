"use strict";
const CatAPI = new TheCatAPI();
const catDiv = document.getElementById('catDisplay');
const catHeading = document.getElementById('catHeading');
const catParagraph = document.getElementById('catParagraph');
const catInfo = document.getElementById('catInfo');
document.addEventListener('DOMContentLoaded', async () => {
    displayRandomCats();
    const catSelector = document.getElementById('catSelector');
    catSelector.innerHTML = `
    <select id="catSelect">
        <optgroup label="Random Cat">
            <option value="showCat" selected>Show Random Cats</option>
        </optgroup>
        <optgroup label="Cat by Breed" id="catBreedOptGroup">
            <option value="catBreed" id="catBreed" hidden>Choose a Cat Breed</option>
        </optgroup>
    </select>
    `;
    try {
        const catSelect = document.getElementById('catSelect');
        const catBreedOptGroup = document.getElementById('catBreedOptGroup');
        const breeds = await CatAPI.getCatBreeds();
        CatAPI.setCatBreedOptions(catBreedOptGroup, breeds);
        catSelect.addEventListener('change', async (event) => {
            const catBreedEvent = event.target.value;
            if (catBreedEvent === 'showCat') {
                displayRandomCats();
            }
            else {
                const selectedBreed = breeds.find((breed) => breed.id === catBreedEvent);
                if (selectedBreed) {
                    displayCatBreed(selectedBreed);
                }
            }
        });
    }
    catch (error) {
        console.error(error);
    }
});
const { Splide } = window;
async function displayRandomCats() {
    catHeading.textContent = 'Random Cats';
    catParagraph.textContent = '';
    catInfo.innerHTML = '';
    console.log('showing random cats');
    const data = await CatAPI.getCatImageData(4);
    const catImg = data.map((cat) => cat.url);
    const imgWidth = data.map((cat) => cat.width);
    console.log(imgWidth);
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
    `;
    new Splide('.splide').mount();
}
async function displayCatBreed(catBreed) {
    catHeading.textContent = catBreed.name;
    catParagraph.textContent = catBreed.description;
    catInfo.innerHTML = `
    <p>Temperament: ${catBreed.temperament}<br>Alternate Names: ${catBreed.alt_names || 'None'}</p>
    `;
    console.log(`now showing ${catBreed.name}`);
    const limit = 4;
    const data = await CatAPI.getCatImageData(limit, catBreed.id);
    const catImages = data.map((cat) => cat.url);
    const imgWidth = data.map((cat) => cat.width);
    catDiv.innerHTML = getDisplayHTML(catImages, catBreed.name, imgWidth);
    const options = { type: 'fade', rewind: true };
    new Splide('.splide', options).mount();
}
function getDisplayHTML(img, name, imgWidth) {
    if (img.length === 0) {
        console.log(`No images found for ${name}.`);
        return `<h4>No images found for ${name}.</h4>`;
    }
    else if (img.length === 1) {
        console.log(`${name} has only 1 image`);
        return `<img src="${img[0]}" alt="${name}" height='350px' width='auto'>`;
    }
    else if (img.length < 3) {
        console.log(`${name} has less than 3 images`);
        return `
        <section class="splide" aria-label="Splide Cat Images">
        <div class="splide__track">
            <ul class="splide__list">
                <li class="splide__slide"><img src="${img[0]}" alt="${name}" height='350px' width='auto'></li>
                <li class="splide__slide"><img src="${img[1]}" alt="${name}" height='350px' width='auto'></li>
            </ul>
        </div>
        </section>
        `;
    }
    else {
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
        `;
    }
}
//# sourceMappingURL=catDisplay.js.map