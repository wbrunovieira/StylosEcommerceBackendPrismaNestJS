import { InMemoryProductColorRepository } from "@test/repositories/in-memory-product-color-repository"
import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository"
import { ColorOnProductUseCase } from "./color-on-product"
import { makeProduct } from "@test/factories/make-product"
import { InMemoryColorRepository } from "@test/repositories/in-memory-color-repository"


let inMemoryProductRepository: InMemoryProductRepository
let inMemoryColorRepository = InMemoryColorRepository
let inMemoryProductColorRepository: InMemoryProductColorRepository

let sut: ColorOnProductUseCase

describe('Product on Color ', () => {
  beforeEach(() => {
  
    inMemoryColorRepository = new InMemoryColorRepository()
    inMemoryProductRepository = new InMemoryProductRepository()
    inMemoryProductColorRepository = new InMemoryProductColorRepository()
  
    
    
    sut = new ColorOnProductUseCase(
        inMemoryProductRepository,
        inMemoryProductColorRepository,
        inMemoryColorRepository
    )
  })

  it('should be able to create a product on Product Color table', async () => {
    const product = makeProduct()

    await inMemoryProductRepository.create(product)

    await sut.execute({
      productId: product.id.toString(),
      colorId: product.colorId.toString(),
      content: 'Colorteste',
    })

    expect(inMemoryProductColorRepository.items[0].colorId.toString()).toEqual(
      'Comentário teste',
    )
  })
})