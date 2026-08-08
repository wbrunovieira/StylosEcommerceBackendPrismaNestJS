import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function finalPriceOf(price: number, discount: number): number {
    return Number((price - price * (discount / 100)).toFixed(2));
}

// Imagens reais do Unsplash, agrupadas por categoria (URLs validadas).
const UNSPLASH = (id: string) =>
    `https://images.unsplash.com/photo-${id}?w=600&h=800&fit=crop&q=75`;

const CATEGORY_IMAGES: Record<string, string[]> = {
    Sutiãs: [
        "1574539602047-548bf9557352",
        "1585250047310-592b1805a8aa",
        "1568663521381-33b7c467fda0",
        "1590397041404-a0cfb285a2a6",
    ].map(UNSPLASH),
    Calcinhas: [
        "1568441556126-f36ae0900180",
        "1529982567978-dbaa7babe4df",
        "1591385208815-e09e859e03d2",
        "1573581043086-03ff56754b22",
        "1643539293760-0061e47e6828",
    ].map(UNSPLASH),
    Conjuntos: [
        "1575186083127-03641b958f61",
        "1642945680515-faada4c0ca7b",
        "1610241519159-8a62634bac9a",
        "1574539602047-548bf9557352",
    ].map(UNSPLASH),
    "Camisolas & Robes": [
        "1580565996832-60ccfdf1a755",
        "1766056278976-87f269e3b69c",
        "1770294759006-356f25f4f156",
        "1763392742244-038fa57957f6",
        "1709979140796-a440f8e2512c",
    ].map(UNSPLASH),
    Pijamas: [
        "1681157819947-5faaa3d8388a",
        "1654512462970-8191bc8742bd",
        "1692111643020-4b4726e0dd8f",
        "1573258517406-4a3824f3a476",
    ].map(UNSPLASH),
    Body: [
        "1568663521381-33b7c467fda0",
        "1590397041404-a0cfb285a2a6",
        "1585250047310-592b1805a8aa",
    ].map(UNSPLASH),
    Modeladores: [
        "1591385208815-e09e859e03d2",
        "1573581043086-03ff56754b22",
        "1568441556126-f36ae0900180",
    ].map(UNSPLASH),
    "Moda Praia": [
        "1581588636584-5c447d2c9d97",
        "1656457981333-a9e055bd783f",
        "1515161318750-781d6122e367",
        "1631157892458-7cc24bc95e68",
        "1594590438588-aadc19454cb0",
    ].map(UNSPLASH),
    Acessórios: [
        "1578641915798-950f58b9499c",
        "1598472585386-9e8538b80424",
        "1705532301641-f0d542cd6c99",
        "1761393956376-98c280da9698",
        "1735977223259-0e0e37a69060",
    ].map(UNSPLASH),
    Masculino: [
        "1601393710008-984348f7447b",
        "1656587132121-aaccc57589cf",
        "1640765937555-6f413ed1d936",
        "1683449155666-7531f07a9b68",
        "1561504599-f900052636b3",
    ].map(UNSPLASH),
};

// Seleciona 3 imagens da categoria, rotacionando por índice do produto
// para que produtos da mesma categoria não fiquem com a mesma foto.
function imagesForCategory(category: string, offset: number): string[] {
    const pool = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Conjuntos"];
    const start = offset % pool.length;
    return [0, 1, 2].map((k) => pool[(start + k) % pool.length]);
}

const CATEGORIES = [
    { name: "Sutiãs", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Calcinhas", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Conjuntos", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Camisolas & Robes", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Pijamas", imageUrl: "/icons/pijamas-mini.svg" },
    { name: "Body", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Modeladores", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Moda Praia", imageUrl: "/icons/lingerie-mini.svg" },
    { name: "Acessórios", imageUrl: "/icons/bag-mini.svg" },
    { name: "Masculino", imageUrl: "/icons/boy.svg" },
];

const COLORS = [
    { name: "Preto", hex: "#1A1A1A" },
    { name: "Branco", hex: "#FFFFFF" },
    { name: "Nude", hex: "#E8C8B0" },
    { name: "Vermelho Paixão", hex: "#C2173B" },
    { name: "Rosa Bebê", hex: "#F8BBD0" },
    { name: "Vinho", hex: "#5C0A2E" },
    { name: "Azul Marinho", hex: "#1A237E" },
    { name: "Renda Bege", hex: "#D9C7A8" },
    { name: "Verde Esmeralda", hex: "#1B5E40" },
    { name: "Lilás", hex: "#9C6ADE" },
];

const SIZES = [
    { name: "PP" },
    { name: "P" },
    { name: "M" },
    { name: "G" },
    { name: "GG" },
    { name: "XG" },
];

type ProductSeed = {
    name: string;
    description: string;
    brand: string;
    category: string;
    price: number;
    discount: number;
    colors: string[];
    sizes: string[];
    tags: string[];
    flags?: { isNew?: boolean; onSale?: boolean; isFeatured?: boolean };
};

const PRODUCTS: ProductSeed[] = [
    {
        name: "Sutiã Sem Bojo Renda Liz",
        description:
            "Sutiã em renda delicada sem bojo, com alças reguláveis e fecho nas costas. Conforto e elegância para o dia a dia.",
        brand: "Liz",
        category: "Sutiãs",
        price: 89.9,
        discount: 10,
        colors: ["Preto", "Nude", "Branco", "Vinho"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["renda", "sem bojo", "delicado"],
        flags: { isFeatured: true, isNew: true },
    },
    {
        name: "Sutiã Push-Up Microfibra De Millus",
        description:
            "Sutiã push-up em microfibra com bojo de realce, proporcionando sustentação e decote marcante.",
        brand: "De Millus",
        category: "Sutiãs",
        price: 119.9,
        discount: 0,
        colors: ["Preto", "Nude", "Rosa Bebê"],
        sizes: ["P", "M", "G"],
        tags: ["push-up", "microfibra", "realce"],
        flags: { isFeatured: true },
    },
    {
        name: "Sutiã Nadador Sem Costura",
        description:
            "Sutiã nadador sem costura, ideal para usar sob blusas justas. Toque suave e caimento perfeito.",
        brand: "TRIUMPH",
        category: "Sutiãs",
        price: 99.9,
        discount: 15,
        colors: ["Preto", "Branco", "Nude"],
        sizes: ["PP", "P", "M", "G", "GG"],
        tags: ["sem costura", "nadador", "conforto"],
        flags: { onSale: true },
    },
    {
        name: "Sutiã Tomara que Caia Bojo Removível",
        description:
            "Sutiã tomara que caia com bojo removível e silicone antideslizante. Perfeito para roupas de ombro a ombro.",
        brand: "MASH",
        category: "Sutiãs",
        price: 109.9,
        discount: 0,
        colors: ["Preto", "Nude", "Vermelho Paixão"],
        sizes: ["P", "M", "G"],
        tags: ["tomara que caia", "bojo removível"],
    },
    {
        name: "Calcinha Tanga Renda Floral",
        description:
            "Calcinha tanga em renda floral com acabamento sem costura nas laterais. Leveza e sensualidade.",
        brand: "DULOREN",
        category: "Calcinhas",
        price: 29.9,
        discount: 0,
        colors: ["Preto", "Vermelho Paixão", "Renda Bege", "Vinho"],
        sizes: ["PP", "P", "M", "G", "GG"],
        tags: ["tanga", "renda", "floral"],
        flags: { isNew: true },
    },
    {
        name: "Calcinha Fio Dental Cós Alto",
        description:
            "Calcinha fio dental com cós alto modelador em microfibra. Não marca a roupa.",
        brand: "DILADY",
        category: "Calcinhas",
        price: 24.9,
        discount: 20,
        colors: ["Preto", "Branco", "Nude", "Lilás"],
        sizes: ["PP", "P", "M", "G"],
        tags: ["fio dental", "cós alto", "não marca"],
        flags: { onSale: true },
    },
    {
        name: "Calcinha Biquíni Algodão Kit 3 Peças",
        description:
            "Kit com 3 calcinhas modelo biquíni em algodão respirável. Conforto para o uso diário.",
        brand: "Lupo",
        category: "Calcinhas",
        price: 59.9,
        discount: 10,
        colors: ["Branco", "Preto", "Rosa Bebê"],
        sizes: ["P", "M", "G", "GG", "XG"],
        tags: ["kit", "algodão", "biquíni"],
        flags: { isFeatured: true },
    },
    {
        name: "Calcinha Hot Pant Cintura Alta",
        description:
            "Calcinha hot pant de cintura alta em renda e tule. Estilo retrô e sofisticado.",
        brand: "SEGREDO DA PAIXAO",
        category: "Calcinhas",
        price: 39.9,
        discount: 0,
        colors: ["Preto", "Vinho", "Verde Esmeralda"],
        sizes: ["P", "M", "G"],
        tags: ["hot pant", "cintura alta", "renda"],
    },
    {
        name: "Conjunto Renda Sensual Vermelho Paixão",
        description:
            "Conjunto de sutiã com bojo e calcinha tanga em renda vermelha. A escolha perfeita para uma noite especial.",
        brand: "SEGREDO DA PAIXAO",
        category: "Conjuntos",
        price: 189.9,
        discount: 0,
        colors: ["Vermelho Paixão", "Preto", "Vinho"],
        sizes: ["P", "M", "G"],
        tags: ["conjunto", "renda", "sensual"],
        flags: { isFeatured: true, isNew: true },
    },
    {
        name: "Conjunto Microfibra Sem Costura",
        description:
            "Conjunto de sutiã e calcinha em microfibra sem costura. Liso, leve e invisível sob a roupa.",
        brand: "TRIUMPH",
        category: "Conjuntos",
        price: 159.9,
        discount: 12,
        colors: ["Nude", "Preto", "Branco"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["conjunto", "sem costura", "microfibra"],
        flags: { onSale: true },
    },
    {
        name: "Conjunto Noiva Branco Renda Premium",
        description:
            "Conjunto exclusivo para noivas em renda premium branca com detalhes em pérola. Edição limitada.",
        brand: "Liz",
        category: "Conjuntos",
        price: 249.9,
        discount: 0,
        colors: ["Branco", "Renda Bege"],
        sizes: ["P", "M", "G"],
        tags: ["noiva", "premium", "renda", "casamento"],
        flags: { isFeatured: true },
    },
    {
        name: "Camisola Cetim Longa com Fenda",
        description:
            "Camisola longa em cetim com fenda lateral e decote em renda. Sofisticação para dormir com charme.",
        brand: "Nayane",
        category: "Camisolas & Robes",
        price: 159.9,
        discount: 0,
        colors: ["Vinho", "Preto", "Azul Marinho"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["camisola", "cetim", "longa"],
        flags: { isNew: true },
    },
    {
        name: "Camisola Curta Renda Plus Size",
        description:
            "Camisola curta em renda com modelagem plus size. Conforto e beleza em todos os tamanhos.",
        brand: "Nayane",
        category: "Camisolas & Robes",
        price: 129.9,
        discount: 15,
        colors: ["Preto", "Vermelho Paixão", "Renda Bege"],
        sizes: ["G", "GG", "XG"],
        tags: ["camisola", "plus size", "renda"],
        flags: { onSale: true },
    },
    {
        name: "Robe Cetim com Renda",
        description:
            "Robe em cetim com acabamento em renda e faixa para amarração. Combina com qualquer camisola.",
        brand: "Nayane",
        category: "Camisolas & Robes",
        price: 169.9,
        discount: 0,
        colors: ["Preto", "Vinho", "Nude"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["robe", "cetim", "renda"],
    },
    {
        name: "Pijama Americano Algodão Listrado",
        description:
            "Pijama americano em algodão macio com calça comprida e blusa de manga. Aconchego para as noites frias.",
        brand: "Lupo",
        category: "Pijamas",
        price: 139.9,
        discount: 0,
        colors: ["Azul Marinho", "Rosa Bebê", "Verde Esmeralda"],
        sizes: ["P", "M", "G", "GG", "XG"],
        tags: ["pijama", "algodão", "inverno"],
        flags: { isFeatured: true },
    },
    {
        name: "Pijama Curto Estampado Verão",
        description:
            "Pijama curto com short e blusinha em viscose estampada. Fresquinho para o verão.",
        brand: "Lupo",
        category: "Pijamas",
        price: 89.9,
        discount: 20,
        colors: ["Rosa Bebê", "Branco", "Lilás"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["pijama", "short", "verão"],
        flags: { onSale: true },
    },
    {
        name: "Body Renda Decote V",
        description:
            "Body em renda com decote V profundo e fechamento por colchetes. Use como peça íntima ou sobreposição.",
        brand: "DULOREN",
        category: "Body",
        price: 119.9,
        discount: 0,
        colors: ["Preto", "Vermelho Paixão", "Branco"],
        sizes: ["P", "M", "G"],
        tags: ["body", "renda", "decote"],
        flags: { isNew: true },
    },
    {
        name: "Body Tule Manga Longa",
        description:
            "Body em tule transparente com manga longa e bordados delicados. Elegância e ousadia.",
        brand: "SEGREDO DA PAIXAO",
        category: "Body",
        price: 139.9,
        discount: 10,
        colors: ["Preto", "Vinho"],
        sizes: ["P", "M", "G"],
        tags: ["body", "tule", "manga longa"],
    },
    {
        name: "Cinta-Liga Renda Preta",
        description:
            "Cinta-liga em renda com presilhas ajustáveis. O toque final para um look sensual.",
        brand: "SEGREDO DA PAIXAO",
        category: "Modeladores",
        price: 79.9,
        discount: 0,
        colors: ["Preto", "Vermelho Paixão"],
        sizes: ["P", "M", "G"],
        tags: ["cinta-liga", "renda", "sensual"],
    },
    {
        name: "Corselet Modelador Cintura Fina",
        description:
            "Corselet modelador com barbatanas que afinam a cintura e realçam a silhueta. Sustentação firme.",
        brand: "DILADY",
        category: "Modeladores",
        price: 149.9,
        discount: 0,
        colors: ["Preto", "Nude", "Vinho"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["modelador", "corselet", "cintura"],
        flags: { isFeatured: true },
    },
    {
        name: "Calcinha Modeladora Cintura Alta",
        description:
            "Calcinha modeladora de cintura alta que controla a barriga e modela o quadril. Invisível sob vestidos.",
        brand: "DILADY",
        category: "Modeladores",
        price: 69.9,
        discount: 15,
        colors: ["Nude", "Preto"],
        sizes: ["P", "M", "G", "GG", "XG"],
        tags: ["modeladora", "cintura alta", "redução"],
        flags: { onSale: true },
    },
    {
        name: "Biquíni Cortininha Lacinho",
        description:
            "Biquíni modelo cortininha com lacinhos reguláveis e calcinha de amarrar. Bronzeado sem marcas.",
        brand: "ORLA DA PRAIA",
        category: "Moda Praia",
        price: 129.9,
        discount: 0,
        colors: ["Vermelho Paixão", "Preto", "Verde Esmeralda", "Azul Marinho"],
        sizes: ["P", "M", "G"],
        tags: ["biquíni", "praia", "verão"],
        flags: { isNew: true, isFeatured: true },
    },
    {
        name: "Maiô Engana Mamãe Decote Costas",
        description:
            "Maiô modelo engana mamãe com recortes laterais e decote nas costas. Modela e valoriza o corpo.",
        brand: "ORLA DA PRAIA",
        category: "Moda Praia",
        price: 159.9,
        discount: 10,
        colors: ["Preto", "Vinho"],
        sizes: ["P", "M", "G", "GG"],
        tags: ["maiô", "praia", "modelador"],
        flags: { onSale: true },
    },
    {
        name: "Meia-Calça Fio 40 Transparente",
        description:
            "Meia-calça fio 40 com toque acetinado e cós confortável. Transparência uniforme.",
        brand: "TRIFIL",
        category: "Acessórios",
        price: 34.9,
        discount: 0,
        colors: ["Preto", "Nude"],
        sizes: ["P", "M", "G"],
        tags: ["meia-calça", "fio 40", "acessório"],
    },
    {
        name: "Cueca Boxer Microfibra Kit 3",
        description:
            "Kit com 3 cuecas boxer em microfibra com elástico emborrachado. Conforto masculino o dia todo.",
        brand: "Lupo",
        category: "Masculino",
        price: 89.9,
        discount: 10,
        colors: ["Preto", "Azul Marinho", "Branco"],
        sizes: ["P", "M", "G", "GG", "XG"],
        tags: ["cueca", "boxer", "masculino", "kit"],
        flags: { isFeatured: true },
    },
];

const CUSTOMERS = [
    {
        name: "Mariana Oliveira",
        email: "mariana.oliveira@example.com",
        phone: "(11) 98765-4321",
        address: {
            street: "Rua das Flores",
            number: 245,
            complement: "Apto 52",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-000",
        },
    },
    {
        name: "Camila Santos",
        email: "camila.santos@example.com",
        phone: "(21) 99876-5432",
        address: {
            street: "Avenida Atlântica",
            number: 1702,
            complement: "Bloco B",
            city: "Rio de Janeiro",
            state: "RJ",
            zipCode: "22021-001",
        },
    },
    {
        name: "Juliana Costa",
        email: "juliana.costa@example.com",
        phone: "(31) 98123-4567",
        address: {
            street: "Rua da Bahia",
            number: 980,
            city: "Belo Horizonte",
            state: "MG",
            zipCode: "30160-011",
        },
    },
    {
        name: "Beatriz Almeida",
        email: "beatriz.almeida@example.com",
        phone: "(41) 99654-3210",
        address: {
            street: "Avenida Sete de Setembro",
            number: 3344,
            complement: "Casa 2",
            city: "Curitiba",
            state: "PR",
            zipCode: "80230-010",
        },
    },
];

async function main() {
    console.log("🌱 Seed de demonstração — Loja de Lingerie\n");

    // 1) Categorias
    for (const c of CATEGORIES) {
        await prisma.category.upsert({
            where: { name: c.name },
            update: { imageUrl: c.imageUrl },
            create: c,
        });
    }
    console.log(`✓ ${CATEGORIES.length} categorias`);

    // 2) Cores
    for (const c of COLORS) {
        await prisma.color.upsert({
            where: { name: c.name },
            update: { hex: c.hex },
            create: c,
        });
    }
    console.log(`✓ ${COLORS.length} cores`);

    // 3) Tamanhos
    for (const s of SIZES) {
        await prisma.size.upsert({
            where: { name: s.name },
            update: {},
            create: s,
        });
    }
    console.log(`✓ ${SIZES.length} tamanhos`);

    const brands = await prisma.brand.findMany();
    const colors = await prisma.color.findMany();
    const sizes = await prisma.size.findMany();
    const categories = await prisma.category.findMany();

    const brandByName = new Map(brands.map((b) => [b.name, b.id]));
    const colorByName = new Map(colors.map((c) => [c.name, c.id]));
    const sizeByName = new Map(sizes.map((s) => [s.name, s.id]));
    const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

    // 4) Produtos com cores, tamanhos, categorias e variantes
    const createdProductIds: string[] = [];
    const categoryCounter: Record<string, number> = {};
    for (const p of PRODUCTS) {
        const brandId = brandByName.get(p.brand);
        const categoryId = categoryByName.get(p.category);
        if (!brandId || !categoryId) {
            console.warn(`⚠ pulando ${p.name} (marca/categoria não encontrada)`);
            continue;
        }

        const finalPrice = finalPriceOf(p.price, p.discount);
        const slug = slugify(p.name);
        const offset = categoryCounter[p.category] ?? 0;
        categoryCounter[p.category] = offset + 1;
        const images = imagesForCategory(p.category, offset);
        const productColors = p.colors
            .filter((n) => colorByName.has(n))
            .map((n) => colorByName.get(n)!);
        const productSizes = p.sizes
            .filter((n) => sizeByName.has(n))
            .map((n) => sizeByName.get(n)!);

        const existing = await prisma.product.findUnique({
            where: { name: p.name },
        });
        if (existing) {
            // atualiza imagens (e das variantes) para produtos já criados
            await prisma.product.update({
                where: { id: existing.id },
                data: { images },
            });
            await prisma.productVariant.updateMany({
                where: { productId: existing.id },
                data: { images },
            });
            createdProductIds.push(existing.id);
            continue;
        }

        const product = await prisma.product.create({
            data: {
                name: p.name,
                description: p.description,
                slug,
                brandId,
                price: p.price,
                discount: p.discount,
                finalPrice,
                height: 4,
                width: 18,
                length: 22,
                weight: 0.2,
                sku: `STY-${slug.slice(0, 10).toUpperCase()}`,
                tags: p.tags,
                images,
                stock: 40 + Math.floor(Math.random() * 60),
                hasVariants: true,
                showInSite: true,
                visibility: true,
                onSale: p.flags?.onSale ?? false,
                isNew: p.flags?.isNew ?? false,
                isFeatured: p.flags?.isFeatured ?? false,
                seoTitle: p.name,
                seoDescription: p.description.slice(0, 150),
                seoKeywords: p.tags.join(", "),
                productCategories: {
                    create: { category: { connect: { id: categoryId } } },
                },
                productColors: {
                    create: productColors.map((id) => ({
                        color: { connect: { id } },
                    })),
                },
                productSizes: {
                    create: productSizes.map((id) => ({
                        size: { connect: { id } },
                    })),
                },
                productVariants: {
                    create: productColors.flatMap((colorId) =>
                        productSizes.map((sizeId) => ({
                            colorId,
                            sizeId,
                            sku: `STY-${slug.slice(0, 8).toUpperCase()}-${sizeByName2(
                                sizes,
                                sizeId
                            )}`,
                            price: finalPrice,
                            stock: 5 + Math.floor(Math.random() * 25),
                            images,
                            status: "ACTIVE" as const,
                        }))
                    ),
                },
            },
        });

        await prisma.product.update({
            where: { id: product.id },
            data: { productIdVariant: product.id },
        });
        createdProductIds.push(product.id);
    }
    console.log(`✓ ${createdProductIds.length} produtos (com cores, tamanhos e variantes)`);

    // 5) Clientes (User + Customer + Address)
    const customerHash = await hash("Cliente@123", 8);
    const customerRecords: { userId: string; customerId: string }[] = [];
    for (const c of CUSTOMERS) {
        let user = await prisma.user.findUnique({ where: { email: c.email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: c.name,
                    email: c.email,
                    password: customerHash,
                    role: "customer",
                    phone: c.phone,
                    isCustomer: true,
                    isVerified: true,
                    accountStatus: "active",
                    addresses: {
                        create: {
                            street: c.address.street,
                            number: c.address.number,
                            complement: c.address.complement,
                            city: c.address.city,
                            state: c.address.state,
                            country: "Brasil",
                            zipCode: c.address.zipCode,
                        },
                    },
                },
            });
        }
        let customer = await prisma.customer.findUnique({
            where: { userId: user.id },
        });
        if (!customer) {
            customer = await prisma.customer.create({
                data: { userId: user.id, firstOrderDate: new Date() },
            });
        }
        customerRecords.push({ userId: user.id, customerId: customer.id });
    }
    console.log(`✓ ${customerRecords.length} clientes`);

    // 6) Pedidos (apenas se ainda não houver pedidos)
    const orderCount = await prisma.order.count();
    if (orderCount === 0 && createdProductIds.length > 0) {
        const allProducts = await prisma.product.findMany({
            where: { id: { in: createdProductIds } },
        });
        const statuses: ("PENDING" | "COMPLETED" | "CANCELLED")[] = [
            "COMPLETED",
            "COMPLETED",
            "PENDING",
            "COMPLETED",
            "CANCELLED",
            "PENDING",
        ];
        const payMethods = ["pix", "credit_card", "boleto"];
        let made = 0;
        for (let i = 0; i < customerRecords.length; i++) {
            const cust = customerRecords[i];
            const numOrders = 1 + (i % 2); // 1 ou 2 pedidos
            for (let o = 0; o < numOrders; o++) {
                const itemsCount = 1 + Math.floor(Math.random() * 3);
                const picked = allProducts
                    .slice()
                    .sort(() => Math.random() - 0.5)
                    .slice(0, itemsCount);
                const status = statuses[made % statuses.length];
                const order = await prisma.order.create({
                    data: {
                        userId: cust.userId,
                        customerId: cust.customerId,
                        status,
                        paymentStatus:
                            status === "COMPLETED"
                                ? "approved"
                                : status === "CANCELLED"
                                  ? "cancelled"
                                  : "pending",
                        paymentMethod: payMethods[made % payMethods.length],
                        paymentDate: status === "COMPLETED" ? new Date() : null,
                        items: {
                            create: picked.map((prod) => {
                                const qty = 1 + Math.floor(Math.random() * 2);
                                return {
                                    productId: prod.id,
                                    productName: prod.name,
                                    imageUrl: prod.images[0] ?? "",
                                    quantity: qty,
                                    price: prod.finalPrice ?? prod.price,
                                };
                            }),
                        },
                    },
                });
                made++;
                void order;
            }
        }
        console.log(`✓ ${made} pedidos`);
    } else {
        console.log(`• pedidos: ${orderCount} já existentes (mantidos)`);
    }

    console.log("\n✅ Seed de demonstração concluído.");
}

function sizeByName2(
    sizes: { id: string; name: string }[],
    sizeId: string
): string {
    return sizes.find((s) => s.id === sizeId)?.name ?? "U";
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
