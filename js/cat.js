const catSelect = document.getElementById('catSelect');
const catDiv = document.getElementById("catDisplay");
const catNameHeading = document.getElementById('catNameHeading');
const catParagraph = document.getElementById("catParagraph");
const catInfo = document.getElementById("catInfo");
document.addEventListener('DOMContentLoaded', () => {
    createCatBreedOptions();
    displayRandomCat();
});
async function createCatBreedOptions() {
    const URL = `https://api.thecatapi.com/v1/breeds`;
    try {
        const response = await fetch(URL);
        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
            const catOption = document.createElement('option');
            catOption.value = data[i].id;
            catOption.textContent = data[i].name;
            catSelect.appendChild(catOption);
        }
        catSelect.addEventListener('change', async(event) => {
            const catBreed = event.target.value
            if (catBreed == 'showCat') {
                await displayRandomCat();
            } else {
                const catData = data.find((cat) => cat.id === catBreed);
                const catName = catData.name;
                await displayCatBreed(catBreed,catName,catData);
            }
        });
    }
    catch (e) {
        console.log("There was a problem fetching the breed list.");
    }
}
async function displayRandomCat() {
    catNameHeading.textContent = 'Random Cat Image';
    catParagraph.textContent = '';
    catInfo.textContent = '';
    console.log('showing random cat');
    const API_KEY = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const CAT_URL = `https://api.thecatapi.com/v1/images/search?limit=1&${API_KEY}`;
    try {
        const response = await (await fetch(CAT_URL));
        const data = await response.json();
        const catImage = data[0].url;
        const catImg = (`<img src="${catImage}" alt="cat" height="300px" width="auto">`);
        catDiv.innerHTML = catImg;
    }
    catch (error) {
        console.log("There was a problem fetching a cat image.");
    }
}
async function displayCatBreed(breedId,breedName,breedData) {
    catNameHeading.textContent = (`${breedName}`);
    catParagraph.textContent = (`${breedData.description}`);
    catInfo.innerHTML = (`
    <p>Temperament: ${breedData.temperament}<br>Alternate Names: ${breedData.alt_names || "None"}</p>
    `);
    console.log(`showing ${breedName}`);
    const API_KEY = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const BREED_URL = `https://api.thecatapi.com/v1/images/search?limit=4&breed_id=${breedId}`;
    try {
        const response = await fetch(BREED_URL, { headers: { 'x-api-key': API_KEY } })
        const data = await response.json()
        const catImages = data.map((cat) => cat.url)
        if (catImages.length === 0) {
            console.log(`no images found for ${breedName}`)
            catDiv.innerHTML = `<p>no images found for ${breedName}</p>`
            return
        }
        if (catImages.length < 4) {
            console.log(`${breedName} has less than 4 images`);
            const catImg = (`
            <div class="catRow">
                <div class="catColumn">
                    <img src="${catImages[0]}" ${breedName}" height="250px" width="auto">
                </div>
            </div>
            `);
            catDiv.innerHTML = catImg
            return
        }
        else {
            /*const catImg = (`
            <div class="catRow">
                <div class="catColumn">
                    <img src="${catImages[0]}" alt="${breedName}" height="250px" width="auto">
                    <img src="${catImages[1]}" alt="${breedName}" height="250px" width="auto">
                </div>
                <div class="catColumn">
                    <img src="${catImages[2]}" alt="${breedName}" height="250px" width="auto">
                    <img src="${catImages[3]}" alt="${breedName}" height="250px" width="auto">
                <div>
            </div>
            `);*/
            const catImg = (`
            <section class="splide" aria-label="Splide Basic Cat Images" style="width:400px; margin: auto;">
            <div class="splide__track">
                <ul class="splide__list">
                    <li class="splide__slide"><img src="${catImages[0]}" alt="${breedName}" height="270px" width="auto"></li>
                    <li class="splide__slide"><img src="${catImages[1]}" alt="${breedName}" height="270px" width="auto"></li>
                    <li class="splide__slide"><img src="${catImages[2]}" alt="${breedName}" height="270px" width="auto"></li>
                    <li class="splide__slide"><img src="${catImages[3]}" alt="${breedName}" height="270px" width="auto"></li>
                </ul>
            </div>
            </section>
            `);
            catDiv.innerHTML = catImg
            const { Splide } = window;
            var splide = new Splide('.splide', {
                type: 'fade',
                rewind: true,
            });
            splide.mount();
        }
    } catch (error) {
        console.log(`There was a problem fetching ${breedName} images.`)
    }
}
