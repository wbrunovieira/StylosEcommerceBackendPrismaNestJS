import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

function generateSlug(
  name: string,
  brandName: string,
  productId: string
): string {
  const slug = `${name}-${brandName}-${productId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug;
}

function calculateFinalPrice(price: number, discount?: number): number {
  if (discount && discount > 0) {
    return price - price * (discount / 100);
  }
  return price;
}

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "Adminpassword@8";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 8);
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }

  // Criar materiais

  const materials = [{ name: "algodão" }, { name: "lycra" }];

  for (const material of materials) {
    await prisma.material.upsert({
      where: { name: material.name },
      update: {},
      create: {
        name: material.name,
      },
    });
  }

  console.log("Materials created");

  // Criar marcas
  const brands = [
    { name: "Liz", imageUrl: "/icons/logo-liz.svg" },
    { name: "Nayane", imageUrl: "/icons/logo-nayne.jpeg" },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: {
        name: brand.name,
        imageUrl: brand.imageUrl,
      },
    });
  }
  console.log("Brands created");

  // Criar categorias
  const categories = [
    { name: "lingerie", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "masculino", imageUrl: "/icons/boy.svg" },
    { name: "pijamas", imageUrl: "/icons/pijamas-mini.svg" },
    { name: "bolsa", imageUrl: "/icons/bag-mini.svg" },
    { name: "oculos", imageUrl: "/icons/glasses-mini.svg" },
  ];
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        imageUrl: category.imageUrl,
      },
    });
  }
  console.log("Categories created");

  // Criar cores
  const colors = [
    { name: "preto", hex: "#000000" },
    { name: "branco", hex: "#FFFFFF" },
    { name: "vermelho", hex: "#FF0000" },
  ];

  for (const color of colors) {
    await prisma.color.upsert({
      where: { name: color.name },
      update: {},
      create: {
        name: color.name,
        hex: color.hex,
      },
    });
  }
  console.log("Colors created");

  // Criar tamanhos

  const sizes = [
    { name: "pp" },
    { name: "p" },
    { name: "m" },
    { name: "g" },
    { name: "xg" },
  ];
  for (const size of sizes) {
    await prisma.size.upsert({
      where: { name: size.name },
      update: {},
      create: {
        name: size.name,
      },
    });
  }
  console.log("Sizes created");

  // Obter IDs de materiais, marcas, categorias, cores e tamanhos
  const materialsData = await prisma.material.findMany();
  const brandsData = await prisma.brand.findMany();
  const categoriesData = await prisma.category.findMany();
  const colorsData = await prisma.color.findMany();
  const sizesData = await prisma.size.findMany();

  // Criar ou atualizar produtos
  for (let i = 1; i <= 12; i++) {
    const price = 100 + i;
    const discount = Math.floor(Math.random() * 30);
    const finalPrice = calculateFinalPrice(price, discount);
    const productName = `produto ${i}`;

    const product = await prisma.product.upsert({
      where: { name: productName },
      update: {
        description: `Descrição atualizada do produto ${i}`,
        images: ["/images/foto1.jpg"],
        materialId:
          materialsData[Math.floor(Math.random() * materialsData.length)].id,
        brandId: brandsData[Math.floor(Math.random() * brandsData.length)].id,
        sku: `sku${i}`,
        price: price,
        discount: discount,
        finalPrice: finalPrice,
        stock: 0,
        height: 10 + i,
        width: 15 + i,
        length: 20 + i,
        weight: 0.5 + i,
        isFeatured: true,
      },
      create: {
        name: productName,
        description: `Descrição do produto ${i}`,
        images: ["/images/foto1.jpg"],
        materialId:
          materialsData[Math.floor(Math.random() * materialsData.length)].id,
        brandId: brandsData[Math.floor(Math.random() * brandsData.length)].id,
        sku: `sku${i}`,
        price: price,
        discount: discount,
        finalPrice: finalPrice,
        stock: 10 + i,
        height: 10 + i,
        width: 15 + i,
        length: 20 + i,
        weight: 0.5 + i,
        isFeatured: true,
        slug: uuidv4(),
        productColors: {
          create: colorsData.map((color) => ({
            color: { connect: { id: color.id } },
          })),
        },
        productCategories: {
          create: {
            category: {
              connect: {
                id: categoriesData[
                  Math.floor(Math.random() * categoriesData.length)
                ].id,
              },
            },
          },
        },
        productSizes: {
          create: sizesData.map((size) => ({
            size: { connect: { id: size.id } },
          })),
        },
        productVariants: {
          create: colorsData.flatMap((color) =>
            sizesData.map((size) => ({
              color: { connect: { id: color.id } },
              size: { connect: { id: size.id } },
              sku: `sku-${color.name}-${size.name}-${i}`,
              price: price,
              stock: 10 + i,
              images: ["/images/foto1.jpg"],
              status: "ACTIVE",
            }))
          ),
        },
      },
    });

    const newSlug = generateSlug(product.name, product.brandId, product.id);
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: String(newSlug) },
    });
  }
  console.log("Products created or updated");

  // Criar ou atualizar produtos sem cores, tamanhos e variantes (bolsa e oculos)
  const productsWithoutVariants = [
    { name: "bolsa 1", category: "bolsa" },
    { name: "oculos 1", category: "oculos" },
  ];

  for (const { name, category } of productsWithoutVariants) {
    const price = 200 + Math.floor(Math.random() * 10);
    const discount = Math.floor(Math.random() * 20);
    const finalPrice = calculateFinalPrice(price, discount);
    const categoryId = categoriesData.find((cat) => cat.name === category)?.id;

    if (!categoryId) {
      console.error(`Category ${category} not found`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { name },
      update: {
        description: `Descrição atualizada do ${name}`,
        images: ["/images/foto1.jpg"],
        materialId:
          materialsData[Math.floor(Math.random() * materialsData.length)].id,
        brandId: brandsData[Math.floor(Math.random() * brandsData.length)].id,
        sku: `${name}-sku`,
        price: price,
        discount: discount,
        finalPrice: finalPrice,
        stock: 10 + Math.floor(Math.random() * 10),
        height: 10 + Math.floor(Math.random() * 10),
        width: 15 + Math.floor(Math.random() * 10),
        length: 20 + Math.floor(Math.random() * 10),
        weight: 0.5 + Math.floor(Math.random() * 10),
        isFeatured: true,
      },
      create: {
        name,
        description: `Descrição do ${name}`,
        images: ["/images/foto1.jpg"],
        materialId:
          materialsData[Math.floor(Math.random() * materialsData.length)].id,
        brandId: brandsData[Math.floor(Math.random() * brandsData.length)].id,
        sku: `${name}-sku`,
        price: price,
        discount: discount,
        finalPrice: finalPrice,
        stock: 10 + Math.floor(Math.random() * 10),
        height: 10 + Math.floor(Math.random() * 10),
        width: 15 + Math.floor(Math.random() * 10),
        length: 20 + Math.floor(Math.random() * 10),
        weight: 0.5 + Math.floor(Math.random() * 10),
        isFeatured: true,
        slug: uuidv4(),
        productCategories: {
          create: {
            category: {
              connect: {
                id: categoryId,
              },
            },
          },
        },
      },
    });

    const newSlug = generateSlug(product.name, product.brandId, product.id);
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: String(newSlug) },
    });
  }

  console.log("Products without variants created or updated");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
