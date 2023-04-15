const url = `https://api.thecatapi.com/v1/breeds`;
const api_key = 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh';
let storedBreeds = []

async function start() {
    try {
        const response = await (await fetch(url,{headers: {'x-api-key':api_key}}))
        const data = await response.json()
        createBreedList(data)
        showBreedImage(0)
    } catch (error) {console.log("There was a problem fetching the breed list.")}
}
start()

function createBreedList (data) {
    storedBreeds = data.filter(img=> img.image?.url!=null);
    for (let i = 0; i < storedBreeds.length; i++) {
        const breed = storedBreeds[i];
        let option = document.createElement('option');
        if(!breed.image)continue; //skip any breeds that don't have an image
        option.value = i; //use the current array index
        option.innerHTML = `${breed.name}`;
        document.getElementById('breed_selector').appendChild(option);
    }
}
function showBreedImage(index) { 
  document.getElementById("breed_image").src= storedBreeds[index].image.url;
  document.getElementById("breed_name").textContent= storedBreeds[index].name;
  document.getElementById("breed_description").textContent= storedBreeds[index].description;
  document.getElementById("breed_origin").textContent= storedBreeds[index].origin;
}
