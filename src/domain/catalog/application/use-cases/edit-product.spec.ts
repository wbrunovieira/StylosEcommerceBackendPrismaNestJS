import { EditProductUseCase } from './edit-product';
import { InMemoryProductRepository } from '@/test/repositories/in-memory-product-repository';
import { makeProduct } from '@/test/factories/make-product';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { ProductRepository } from '../repositories/product-repository';
import { CreateProductUseCase } from './create-product';
import { ProductColorRepository } from '../repositories/product-color-repository';
import { ColorRepository } from '../repositories/color-repository';
import { InMemoryProductColorRepository } from '@/test/repositories/in-memory-product-color-repository';
import { InMemoryColorRepository } from '@/test/repositories/in-memory-color-repository';
import { makeColor } from '@/test/factories/make-color';

describe('Edit Product', () => {
  let inMemoryProductRepository: ProductRepository;
  let sut: EditProductUseCase;
  let inMemoryProductColorRepository: ProductColorRepository;
  let inMemoryColorRepository: ColorRepository;

  beforeEach(() => {
    inMemoryProductRepository = new InMemoryProductRepository();
    inMemoryProductRepository = new InMemoryProductRepository();
    inMemoryProductColorRepository = new InMemoryProductColorRepository();
    inMemoryColorRepository = new InMemoryColorRepository();

    const color1 = makeColor({ name: 'Cor 1' }, new UniqueEntityID('1'));
    const color2 = makeColor({ name: 'Cor 2' }, new UniqueEntityID('2'));

    inMemoryColorRepository.create(color1);
    inMemoryColorRepository.create(color2);

    sut = new EditProductUseCase(
      inMemoryProductRepository,
      inMemoryProductColorRepository,
      inMemoryColorRepository
    );
  });

  it('should edit a product and associate existing colors', async () => {
    // Cria um produto para ser editado
    const product = makeProduct(
      { name: 'Produto Original' },
      new UniqueEntityID('product-1')
    );
    await inMemoryProductRepository.create(product);

    // Executa a edição, associando cores existentes
    const result = await sut.execute({
      productId: product.id.toValue(),
      name: 'Produto Editado',
      description: 'Descrição Editada',
      price: 20,
      stock: 5,
      colorIds: ['1', '2'], // IDs das cores existentes
      sizeId: [],
      materialId: new UniqueEntityID('material-1'),
      brandID: new UniqueEntityID('brand-1'),
      slug: 'produto-editado',
    });

    expect(result.isRight()).toBe(true);

    const updatedProduct =
      await inMemoryProductRepository.findById('product-1');

    expect(updatedProduct).not.toBeNull();
    if (updatedProduct) {
      // Essa checagem previne TypeScript de reclamar sobre updatedProduct ser possivelmente null
      expect(updatedProduct.name).toEqual('Produto Editado');
    }

    // Verifica se as cores foram associadas corretamente ao produto
    const productColors =
      await inMemoryProductColorRepository.findByProductId('product-1');
    expect(productColors.length).toEqual(2);
    expect(productColors.some((pc) => pc.colorId.toString() === '1')).toBe(
      true
    );
    expect(productColors.some((pc) => pc.colorId.toString() === '2')).toBe(
      true
    );
  });

  it('should not associate non-existing colors to the product', async () => {
    const product = makeProduct(
      { name: 'Produto Original' },
      new UniqueEntityID('product-1')
    );
    await inMemoryProductRepository.create(product);

    // Tenta associar cores que não existem
    const result = await sut.execute({
      productId: product.id.toValue(),
      name: 'Produto Editado',
      description: 'Descrição Editada',
      price: 20,
      stock: 5,
      colorIds: ['color-id-inexistente'], // ID de cor inexistente
      sizeId: [],
      materialId: new UniqueEntityID('material-1'),
      brandID: new UniqueEntityID('brand-1'),
      slug: 'produto-editado',
    });

    // Aqui você pode escolher o comportamento esperado. Se o seu caso de uso retornar um erro para cores inexistentes:
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
  it('should return an error if the product does not exist', async () => {
    const result = await sut.execute({
      productId: 'non-existing-product',
      name: 'name teste',
      description: 'description teste',
      price: 10,
      stock: 10,
      colorIds: [],
      sizeId: [],
      materialId: new UniqueEntityID('material-1'),
      brandID: new UniqueEntityID('brand-1'),
      slug: 'name-teste',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
