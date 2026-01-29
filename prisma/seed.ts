import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const spiritAnimals = [
    {
        name: 'Rồng',
        slug: 'dragon',
        personality: ['analytical', 'independent', 'logical'],
        description:
            'Rồng là biểu tượng của trí tuệ và sức mạnh. Phù hợp với những bạn thích tư duy logic, giải quyết vấn đề phức tạp, và học tập độc lập. Rồng sẽ thách thức em với những câu hỏi sâu sắc.',
        color: '#1E40AF', // Blue-700
        imageUrl: '/spirit-animals/dragon.png',
    },
    {
        name: 'Phượng Hoàng',
        slug: 'phoenix',
        personality: ['curious', 'social', 'creative'],
        description:
            'Phượng Hoàng tượng trưng cho sự tái sinh và sáng tạo. Dành cho những bạn tò mò, thích khám phá điều mới, và học tốt qua trao đổi. Phượng Hoàng sẽ dẫn em đến những chân trời kiến thức mới.',
        color: '#EA580C', // Orange-600
        imageUrl: '/spirit-animals/phoenix.png',
    },
    {
        name: 'Rùa',
        slug: 'turtle',
        personality: ['patient', 'methodical', 'reading-focused'],
        description:
            'Rùa đại diện cho sự kiên nhẫn và trí tuệ lâu dài. Phù hợp với những bạn học chậm nhưng chắc, thích đọc sách và hiểu sâu. Rùa sẽ hướng dẫn em từng bước một cách cẩn thận.',
        color: '#059669', // Green-600
        imageUrl: '/spirit-animals/turtle.png',
    },
    {
        name: 'Hổ',
        slug: 'tiger',
        personality: ['energetic', 'kinesthetic', 'competitive'],
        description:
            'Hổ tượng trưng cho sức mạnh và hành động. Dành cho những bạn năng động, thích học qua thực hành, và yêu thích thử thách. Hổ sẽ động viên em vượt qua mọi khó khăn.',
        color: '#DC2626', // Red-600
        imageUrl: '/spirit-animals/tiger.png',
    },
    {
        name: 'Kỳ Lân',
        slug: 'unicorn',
        personality: ['balanced', 'visual', 'artistic'],
        description:
            'Kỳ Lân là biểu tượng của sự cân bằng và nghệ thuật. Phù hợp với những bạn học tốt qua hình ảnh, thích sáng tạo, và có tư duy toàn diện. Kỳ Lân sẽ giúp em nhìn thấy vẻ đẹp trong kiến thức.',
        color: '#9333EA', // Purple-600
        imageUrl: '/spirit-animals/unicorn.png',
    },
];

async function main() {
    console.log('🌱 Seeding Spirit Animals...');

    for (const animal of spiritAnimals) {
        const created = await prisma.spiritAnimal.upsert({
            where: { slug: animal.slug },
            update: animal,
            create: animal,
        });
        console.log(`✅ Created/Updated: ${created.name} (${created.slug})`);
    }

    console.log('✨ Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
