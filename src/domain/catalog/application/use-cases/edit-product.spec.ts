import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { EditProductUseCase } from "./edit-product";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeProduct } from "@test/factories/make-product";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { left } from "@/core/either";
import { ProductProps } from "../../enterprise/entities/product";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { makeBrand } from "@test/factories/make-brand";

describe("EditProductUseCase", () => {
  let useCase: EditProductUseCase;
  let mockProductRepository: InMemoryProductRepository;
  let mockBrandRepository: IBrandRepository;
  let productId: UniqueEntityID;
  let brandId: UniqueEntityID;

  beforeEach(() => {
    mockProductRepository = new InMemoryProductRepository();
    useCase = new EditProductUseCase(
      mockProductRepository,
      mockBrandRepository
    );
    brandId = new UniqueEntityID("82a6d71c-6378-4d11-8258-4ee8732161a3");
    productId = new UniqueEntityID("test_product_id");

    const consistentBrand = makeBrand({ name: "Test Brand Name" }, brandId);

    const existingProduct = makeProduct(
      {
        name: "Existing Product",
        brandId: brandId,
        description: "Existing product description",
        price: 100,
        discount: 10,
        finalPrice: 90,
      },
      productId
    );

    mockProductRepository.create(existingProduct);
  });

  it("should edit a product successfully", async () => {

    const result = await useCase.execute({
      productId: productId.toString(),
      name: "Updated Product",
      description: "Updated product description",
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const updatedProduct = result.value.product;
      expect(updatedProduct.name).toBe("Updated Product");
      expect(updatedProduct.description).toBe("Updated product description");
    } else {
      throw new Error("Expected product to be updated successfully");
    }
  });

  it("should return an error if product is not found", async () => {
    const result = await useCase.execute({
      productId: "non_existing_product_id",
      name: "Updated Product",
      description: "Updated product description",
      
      price: 100,
      discount: 10,
      finalPrice: 90,
    });

    expect(result.isLeft()).toBeTruthy();

    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(ResourceNotFoundError);
      expect(error.message).toBe("Product not found");
    } else {
      throw new Error(
        "Expected ResourceNotFoundError but got a successful result"
      );
    }
  });

  it("should edit multiple fields of a product", async () => {
    const result = await useCase.execute({
      productId: productId.toString(),
      name: "Updated Product",
      description: "Updated product description",
      price: 150,
      stock: 20,
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const updatedProduct = result.value.product;
      expect(updatedProduct.name).toBe("Updated Product");
      expect(updatedProduct.description).toBe("Updated product description");
      expect(updatedProduct.price).toBe(150);
      expect(updatedProduct.stock).toBe(20);
    } else {
      throw new Error("Expected product to be updated successfully");
    }
  });

  it("should correctly calculate the final price when discount is provided", async () => {
    const result = await useCase.execute({
      productId: productId.toString(),
      price: 200,
      discount: 10, // 10% discount
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const updatedProduct = result.value.product;
      expect(updatedProduct.price).toBe(200);
      expect(updatedProduct.discount).toBe(10);
      expect(updatedProduct.finalPrice).toBe(180); // 200 - 10%
    } else {
      throw new Error("Expected product to be updated successfully");
    }
  });

  it("should handle errors when saving the product", async () => {
    mockProductRepository.save = vi.fn(() =>
      Promise.resolve(left(new Error("Save error")))
    );

    const result = await useCase.execute({
      productId: productId.toString(),
      name: "Updated Product",
      description: "Updated product description",
    });

    expect(result.isLeft()).toBeTruthy();

    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(ResourceNotFoundError);
      expect(error.message).toBe("Failed to update product");
    } else {
      throw new Error(
        "Expected ResourceNotFoundError but got a successful result"
      );
    }
  });

  it("should correctly calculate the final price when discount is changed", async () => {
    const result = await useCase.execute({
      productId: productId.toString(),
      discount: 20,
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const updatedProduct = result.value.product;
      expect(updatedProduct.discount).toBe(20);
      expect(updatedProduct.finalPrice).toBe(80); // 100 - 20%
    } else {
      throw new Error("Expected product to be updated successfully");
    }
  });

  it("should correctly calculate the final price when price is changed", async () => {
    const result = await useCase.execute({
      productId: productId.toString(),
      price: 200, // Changing price to 200
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const updatedProduct = result.value.product;
      expect(updatedProduct.price).toBe(200);
      expect(updatedProduct.finalPrice).toBe(180); // 200 - 10%
    } else {
      throw new Error("Expected product to be updated successfully");
    }
  });

  it("should correctly handle unique constraint on slug", async () => {
    const anotherProductId = new UniqueEntityID("another_test_product_id");
    const anotherProduct = makeProduct(
      {
        name: "Existing Product",
        description: "Another existing product description",
        price: 150,
        discount: 10,
        finalPrice: 135,
        brandId,
      },
      anotherProductId
    );
    

    await mockProductRepository.create(anotherProduct);

    const result = await useCase.execute({
      productId: productId.toString(),
      name: "Existing Product", 
      description: "Updated product description",
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const updatedProduct = result.value.product;
     
      expect(updatedProduct.slug.value).not.toBe("existing-product");
      expect(updatedProduct.slug.value).toMatch(/existing-product-\d+/);
    } else {
      throw new Error("Expected product to be updated successfully");
    }
  });
});
