"use strict";
class Cat {
    static CAT_API = {
        BASE_URL: 'https://api.thecatapi.com/v1',
        KEY: 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh',
    };
    static async fetchCatBreeds() {
        const request = new Request(`${this.CAT_API.BASE_URL}/breeds`);
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`${response.status} Breed Options Not Found!`);
        }
        return await response.json();
    }
    static getCatBreedOptions(breeds) {
        const fragment = new DocumentFragment();
        for (const breed of breeds) {
            const option = document.createElement('option');
            option.value = breed.id;
            option.textContent = breed.name;
            fragment.append(option);
        }
        return fragment;
    }
    static async fetchCatImageData(limit, breedId) {
        const url = new URL(`${this.CAT_API.BASE_URL}/images/search`);
        url.searchParams.set('limit', String(limit));
        if (breedId) {
            url.searchParams.append('breed_id', breedId);
        }
        const response = await fetch(url, { headers: { 'x-api-key': this.CAT_API.KEY } });
        if (!response.ok) {
            throw new Error(`${response.status} Images Not Found`);
        }
        return await response.json();
    }
}
class TheCatAPI {
    LINK = { title: 'The Cat API', target: 'https://www.thecatapi.com' };
    constructor() { }
    async getCatBreeds() {
        return await Cat.fetchCatBreeds();
    }
    setCatBreedOptions(optGroup, breeds) {
        const options = Cat.getCatBreedOptions(breeds);
        optGroup.appendChild(options);
    }
    async getCatImageData(limit, breedId) {
        return Cat.fetchCatImageData(limit, breedId);
    }
}
module.exports = { TheCatAPI };
//# sourceMappingURL=cat.js.map