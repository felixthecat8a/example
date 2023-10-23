const catSelect = document.getElementById('catSelect');
const catDiv = document.getElementById("catDisplay");
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
                await displayCatBreed(catBreed);
            }
        });
    }
    catch (e) {
        console.log("There was a problem fetching the breed list.");
    }
}
async function displayRandomCat() {
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
async function displayCatBreed(breedId) {
    console.log(`showing id:${breedId}`);
    const API_KEY = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
    const BREED_URL = `https://api.thecatapi.com/v1/images/search?limit=4&breed_id=${breedId}`;
    try {
        const response = await fetch(BREED_URL, { headers: { 'x-api-key': API_KEY } })
        const data = await response.json()
        const catImages = data.map((cat) => cat.url)
        if (catImages.length === 0) {
            console.log(`no images found for id:${breedId}`)
            catDiv.innerHTML = `<p>no images found for id:${breedId}</p>`
            return
        }
        if (catImages.length < 4) {
            console.log(`id:${breedId} has less than 4 images`);
            const catImg = (`
            <div class="catRow">
                <div class="catColumn">
                    <img src="${catImages[0]}" alt="${breedId}" height="250px" width="auto">
                </div>
            </div>
            `);
            catDiv.innerHTML = catImg
            return
        }
        else {
            const catImg = (`
            <div class="catRow">
                <div class="catColumn">
                    <img src="${catImages[0]}" alt="${breedId}" height="250px" width="auto">
                    <img src="${catImages[1]}" alt="${breedId}" height="250px" width="auto">
                </div>
                <div class="catColumn">
                    <img src="${catImages[2]}" alt="${breedId}" height="250px" width="auto">
                    <img src="${catImages[3]}" alt="${breedId}" height="250px" width="auto">
                <div>
            </div>
            `);
            catDiv.innerHTML = catImg
        }
    } catch (error) {
        console.log(`There was a problem fetching id:${breedId} images.`)
    }
}
