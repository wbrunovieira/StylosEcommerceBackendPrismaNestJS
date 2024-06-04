import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // Para gerar slugs únicos

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
  const materials = ["algodao", "lycra"];
  for (const material of materials) {
    await prisma.material.create({
      data: {
        name: material,
      },
    });
  }
  console.log("Materials created");

  // Criar marcas
  const brands = ["Liz", "Nayane"];
  for (const brand of brands) {
    await prisma.brand.create({
      data: {
        name: brand,
      },
    });
  }
  console.log("Brands created");

  // Criar categorias
  const categories = ["lingerie", "masculino", "pijamas"];
  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category,
      },
    });
  }
  console.log("Categories created");

  // Criar cores
  const colors = ["preto", "branco", "vermelho"];
  for (const color of colors) {
    await prisma.color.create({
      data: {
        name: color,
      },
    });
  }
  console.log("Colors created");

  // Criar tamanhos
  const sizes = ["pequena", "media", "grande"];
  for (const size of sizes) {
    await prisma.size.create({
      data: {
        name: size,
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

  // Criar produtos
  for (let i = 1; i <= 12; i++) {
    const price = 100 + i;
    const discount = Math.floor(Math.random() * 30);
    const finalPrice = calculateFinalPrice(price, discount);
    const product = await prisma.product.create({
      data: {
        name: `produto ${i}`,
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
          create: categoriesData.map((category) => ({
            category: { connect: { id: category.id } },
          })),
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
  console.log("Products created");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
