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
const CatAPI = new TheCatAPI()
const catDiv = document.getElementById('catDisplay') as HTMLDivElement
const catHeading = document.getElementById('catHeading') as HTMLHeadingElement
const catParagraph = document.getElementById('catParagraph') as HTMLParagraphElement
const catInfo = document.getElementById('catInfo') as HTMLDivElement
document.addEventListener('DOMContentLoaded', async () => {
    displayRandomCats()
    const catSelector = document.getElementById('catSelector') as HTMLDivElement
    catSelector.innerHTML = `
    <select id="catSelect">
        <optgroup label="Random Cat">
            <option value="showCat" selected>Show Random Cats</option>
        </optgroup>
        <optgroup label="Cat by Breed" id="catBreedOptGroup">
            <option value="catBreed" id="catBreed" hidden>Choose a Cat Breed</option>
        </optgroup>
    </select>
    `
    try {
        const catSelect = document.getElementById('catSelect') as HTMLSelectElement
        const catBreedOptGroup = document.getElementById('catBreedOptGroup') as HTMLOptGroupElement
        const breeds = await CatAPI.getCatBreeds()
        CatAPI.setCatBreedOptions(catBreedOptGroup, breeds)
        catSelect.addEventListener('change', async (event: Event) => {
            const catBreedEvent = (event.target as HTMLSelectElement).value
            if (catBreedEvent === 'showCat') {
                displayRandomCats()
            } else {
                const selectedBreed = breeds.find((breed) => breed.id === catBreedEvent)
                if (selectedBreed) {
                    displayCatBreed(selectedBreed)
                }
            }
        })
    } catch (error) {
        console.error(error)
    }
})
/****************************************************************************************************/
interface Window {
    Splide: any
}
const { Splide } = window
async function displayRandomCats(): Promise<void> {
    catHeading.textContent = 'Random Cats'
    catParagraph.textContent = ''
    catInfo.innerHTML = ''
    console.log('showing random cats')
    const data = await CatAPI.getCatImageData(4)
    const catImg = data.map((cat) => cat.url)
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
    `
    const options = { type: 'loop', padding: '5rem' }
    new Splide('.splide', options).mount()
}
/****************************************************************************************************/
async function displayCatBreed(catBreed: CatBreedData) {
    catHeading.textContent = catBreed.name
    catParagraph.textContent = catBreed.description
    catInfo.innerHTML = `
    <p>Temperament: ${catBreed.temperament}<br>Alternate Names: ${catBreed.alt_names || 'None'}</p>
    `
    console.log(`now showing ${catBreed.name}`)
    const limit = 4
    const data = await CatAPI.getCatImageData(limit, catBreed.id)
    const catImages = data.map((cat: { url: string }) => cat.url)
    catDiv.innerHTML = getDisplayHTML(catImages, catBreed.name)
    //const options = { type: 'fade', rewind: true }
    const options = { type: 'loop', padding: '5rem' }
    new Splide('.splide', options).mount()
}
function getDisplayHTML(img: string[], name: string): string {
    const dimensions = "height='350px' width='auto'"
    if (img.length === 0) {
        console.log(`No images found for ${name}.`)
        return `<h4>No images found for ${name}.</h4>`
    } else if (img.length === 1) {
        console.log(`${name} has only 1 image`)
        return `<img src="${img[0]}" alt="${name}" ${dimensions}>`
    } else if (img.length < 3) {
        console.log(`${name} has less than 3 images`)
        return `
        <section class="splide" aria-label="Splide Cat Images">
        <div class="splide__track">
            <ul class="splide__list">
                <li class="splide__slide"><img src="${img[0]}" alt="${name}" ${dimensions}></li>
                <li class="splide__slide"><img src="${img[1]}" alt="${name}" ${dimensions}></li>
            </ul>
        </div>
        </section>
        `
    } else {
        return `
        <section class="splide" aria-label="Splide Cat Images">
        <div class="splide__track">
            <ul class="splide__list">
                <li class="splide__slide"><img src="${img[0]}" alt="${name}" ${dimensions}></li>
                <li class="splide__slide"><img src="${img[1]}" alt="${name}" ${dimensions}></li>
                <li class="splide__slide"><img src="${img[2]}" alt="${name}" ${dimensions}></li>
                <li class="splide__slide"><img src="${img[3]}" alt="${name}" ${dimensions}></li>
            </ul>
        </div>
        </section>
        `
    }
}
/****************************************************************************************************/
