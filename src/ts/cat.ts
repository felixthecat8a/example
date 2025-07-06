type CatBreedData = {
    id: string
    name: string
    description: string
    temperament: string
    alt_names?: string
}
type CatIMG = { id: string; url: string; width: number; height: number }
class Cat {
    private static readonly CAT_API = {
        BASE_URL: 'https://api.thecatapi.com/v1',
        KEY: 'live_8e9vqpLpntUSCiumthQu2zHnvYwMOIMF1JLdWpcUKeqztLa53mfjoZcz3GrymaBh',
    }
    public static async fetchCatBreeds<T>(): Promise<T> {
        const request = new Request(`${this.CAT_API.BASE_URL}/breeds`)
        const response = await fetch(request)
        if (!response.ok) {
            throw new Error(`${response.status} Breed Options Not Found!`)
        }
        return await response.json()
    }
    public static getCatBreedOptions(breeds: CatBreedData[]): DocumentFragment {
        const fragment = new DocumentFragment()
        for (const breed of breeds) {
            const option = document.createElement('option') as HTMLOptionElement
            option.value = breed.id
            option.textContent = breed.name
            fragment.append(option)
        }
        return fragment
    }
    public static async fetchCatImageData(limit: number, breedId?: string): Promise<CatIMG[]> {
        const url = new URL(`${this.CAT_API.BASE_URL}/images/search`)
        url.searchParams.set('limit', String(limit))
        if (breedId) {
            url.searchParams.append('breed_id', breedId)
        }
        const response = await fetch(url, { headers: { 'x-api-key': this.CAT_API.KEY } })
        if (!response.ok) {
            throw new Error(`${response.status} Images Not Found`)
        }
        return await response.json()
    }
}
/**************************************************************************************************/
class TheCatAPI {
    public readonly LINK = { title: 'The Cat API', target: 'https://www.thecatapi.com' }
    constructor() {}
    public async getCatBreeds(): Promise<CatBreedData[]> {
        return await Cat.fetchCatBreeds()
    }
    public setCatBreedOptions(optGroup: HTMLOptGroupElement, breeds: CatBreedData[]): void {
        const options = Cat.getCatBreedOptions(breeds)
        optGroup.appendChild(options)
    }
    public async getCatImageData(limit: number, breedId?: string): Promise<CatIMG[]> {
        return Cat.fetchCatImageData(limit, breedId)
    }
}
/**************************************************************************************************/
module.exports = { TheCatAPI }
