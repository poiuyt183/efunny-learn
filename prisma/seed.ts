import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const spiritAnimals = [
  {
    name: "Rồng",
    slug: "dragon",
    personality: ["analytical", "independent", "logical"],
    description:
      "Rồng là biểu tượng của trí tuệ và sức mạnh. Phù hợp với những bạn thích tư duy logic, giải quyết vấn đề phức tạp, và học tập độc lập. Rồng sẽ thách thức em với những câu hỏi sâu sắc.",
    color: "#1E40AF", // Blue-700
    imageUrl: "/spirit-animals/dragon.png",
  },
  {
    name: "Phượng Hoàng",
    slug: "phoenix",
    personality: ["curious", "social", "creative"],
    description:
      "Phượng Hoàng tượng trưng cho sự tái sinh và sáng tạo. Dành cho những bạn tò mò, thích khám phá điều mới, và học tốt qua trao đổi. Phượng Hoàng sẽ dẫn em đến những chân trời kiến thức mới.",
    color: "#EA580C", // Orange-600
    imageUrl: "/spirit-animals/phoenix.png",
  },
  {
    name: "Rùa",
    slug: "turtle",
    personality: ["patient", "methodical", "reading-focused"],
    description:
      "Rùa đại diện cho sự kiên nhẫn và trí tuệ lâu dài. Phù hợp với những bạn học chậm nhưng chắc, thích đọc sách và hiểu sâu. Rùa sẽ hướng dẫn em từng bước một cách cẩn thận.",
    color: "#059669", // Green-600
    imageUrl: "/spirit-animals/turtle.png",
  },
  {
    name: "Hổ",
    slug: "tiger",
    personality: ["energetic", "kinesthetic", "competitive"],
    description:
      "Hổ tượng trưng cho sức mạnh và hành động. Dành cho những bạn năng động, thích học qua thực hành, và yêu thích thử thách. Hổ sẽ động viên em vượt qua mọi khó khăn.",
    color: "#DC2626", // Red-600
    imageUrl: "/spirit-animals/tiger.png",
  },
  {
    name: "Kỳ Lân",
    slug: "unicorn",
    personality: ["balanced", "visual", "artistic"],
    description:
      "Kỳ Lân là biểu tượng của sự cân bằng và nghệ thuật. Phù hợp với những bạn học tốt qua hình ảnh, thích sáng tạo, và có tư duy toàn diện. Kỳ Lân sẽ giúp em nhìn thấy vẻ đẹp trong kiến thức.",
    color: "#9333EA", // Purple-600
    imageUrl: "/spirit-animals/unicorn.png",
  },
];

// Parent seed data with different timestamps (last 6 months)
const parents = [
  {
    email: "parent1@example.com",
    name: "Trần Minh Hoàng",
    createdAt: new Date("2025-08-10T08:30:00Z"), // August 2025
  },
  {
    email: "parent2@example.com",
    name: "Nguyễn Thị Hương",
    createdAt: new Date("2025-08-25T14:15:00Z"), // August 2025
  },
  {
    email: "parent3@example.com",
    name: "Phạm Văn Đức",
    createdAt: new Date("2025-09-12T09:45:00Z"), // September 2025
  },
  {
    email: "parent4@example.com",
    name: "Lê Thị Lan Anh",
    createdAt: new Date("2025-09-28T11:20:00Z"), // September 2025
  },
  {
    email: "parent5@example.com",
    name: "Hoàng Quốc Tuấn",
    createdAt: new Date("2025-10-15T16:00:00Z"), // October 2025
  },
  {
    email: "parent6@example.com",
    name: "Vũ Thị Mai",
    createdAt: new Date("2025-10-30T10:30:00Z"), // October 2025
  },
  {
    email: "parent7@example.com",
    name: "Đỗ Văn Long",
    createdAt: new Date("2025-11-18T13:45:00Z"), // November 2025
  },
  {
    email: "parent8@example.com",
    name: "Bùi Thị Thu Hà",
    createdAt: new Date("2025-12-05T07:20:00Z"), // December 2025
  },
  {
    email: "parent9@example.com",
    name: "Ngô Minh Tuấn",
    createdAt: new Date("2025-12-22T15:30:00Z"), // December 2025
  },
  {
    email: "parent10@example.com",
    name: "Phan Thị Kim Ngân",
    createdAt: new Date("2026-01-28T09:00:00Z"), // January 2026
  },
];

const tutors = [
  {
    email: "tutor1@example.com",
    name: "Nguyễn Văn An",
    subjects: ["Toán", "Vật lý"],
    grades: [10, 11, 12],
    hourlyRate: 300000,
    bio: "Tốt nghiệp loại Giỏi Đại học Bách Khoa, chuyên dạy Toán và Vật lý cho học sinh THPT. Có 5 năm kinh nghiệm giảng dạy, đã giúp nhiều học sinh đạt điểm cao trong kỳ thi THPT Quốc gia. Phương pháp giảng dạy tập trung vào việc hiểu bản chất và áp dụng linh hoạt kiến thức.",
    bankAccount: "VCB - 1234567890 - Nguyen Van An",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample1", name: "Bằng Đại học Bách Khoa" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample2", name: "Chứng chỉ sư phạm" }),
    ],
    rating: 4.8,
    totalSessions: 45,
    createdAt: new Date("2025-08-08T10:00:00Z"), // August 2025
  },
  {
    email: "tutor2@example.com",
    name: "Trần Thị Bình",
    subjects: ["Tiếng Anh"],
    grades: [6, 7, 8, 9, 10, 11, 12],
    hourlyRate: 350000,
    bio: "IELTS 8.0, tốt nghiệp chuyên ngành Ngôn ngữ Anh tại ĐH Ngoại ngữ. Có 7 năm kinh nghiệm dạy IELTS và Tiếng Anh học thuật. Phương pháp giảng dạy tập trung vào giao tiếp thực tế và luyện thi hiệu quả. Đã giúp hơn 100 học sinh đạt điểm IELTS mục tiêu.",
    bankAccount: "Techcombank - 9876543210 - Tran Thi Binh",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample3", name: "IELTS 8.0" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample4", name: "TESOL Certificate" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample5", name: "Bằng Cử nhân Ngôn ngữ Anh" }),
    ],
    rating: 4.9,
    totalSessions: 89,
    createdAt: new Date("2025-08-20T14:30:00Z"), // August 2025
  },
  {
    email: "tutor3@example.com",
    name: "Lê Minh Châu",
    subjects: ["Hóa học", "Sinh học"],
    grades: [10, 11, 12],
    hourlyRate: 280000,
    bio: "Tốt nghiệp Đại học Y Hà Nội, chuyên dạy Hóa học và Sinh học cho học sinh THPT. Có kinh nghiệm 4 năm, đặc biệt giỏi trong việc giải thích các khái niệm phức tạp một cách dễ hiểu. Nhiều học sinh đạt điểm 9-10 trong kỳ thi THPT.",
    bankAccount: "Vietcombank - 1122334455 - Le Minh Chau",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample6", name: "Bằng Dược sĩ" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample7", name: "Giấy khen Sinh viên 5 tốt" }),
    ],
    rating: 4.7,
    totalSessions: 32,
    createdAt: new Date("2025-09-05T09:15:00Z"), // September 2025
  },
  {
    email: "tutor4@example.com",
    name: "Phạm Đức Duy",
    subjects: ["Toán"],
    grades: [6, 7, 8, 9],
    hourlyRate: 250000,
    bio: "Giáo viên Toán THCS với 6 năm kinh nghiệm. Tốt nghiệp Sư phạm Toán, đặc biệt giỏi trong việc xây dựng nền tảng Toán vững chắc cho học sinh. Phương pháp giảng dạy vui vẻ, gần gũi, giúp học sinh yêu thích môn Toán.",
    bankAccount: "ACB - 5566778899 - Pham Duc Duy",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample8", name: "Bằng Sư phạm Toán" }),
    ],
    rating: 4.6,
    totalSessions: 56,
    createdAt: new Date("2025-09-22T11:45:00Z"), // September 2025
  },
  {
    email: "tutor5@example.com",
    name: "Hoàng Thị Lan",
    subjects: ["Văn học", "Lịch sử"],
    grades: [10, 11, 12],
    hourlyRate: 270000,
    bio: "Thạc sĩ Văn học Việt Nam, 8 năm kinh nghiệm dạy Ngữ văn và Lịch sử. Chuyên hướng dẫn kỹ năng làm bài văn nghị luận, phân tích tác phẩm văn học. Đã giúp nhiều học sinh đạt điểm cao môn Văn trong kỳ thi THPT.",
    bankAccount: "BIDV - 3344556677 - Hoang Thi Lan",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample9", name: "Bằng Thạc sĩ Văn học" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample10", name: "Giải Nhì Nghiên cứu khoa học" }),
    ],
    rating: 4.8,
    totalSessions: 67,
    createdAt: new Date("2025-10-10T13:20:00Z"), // October 2025
  },
  {
    email: "tutor6@example.com",
    name: "Vũ Quang Hải",
    subjects: ["Vật lý", "Toán"],
    grades: [11, 12],
    hourlyRate: 320000,
    bio: "Giảng viên Đại học Khoa học Tự nhiên, chuyên dạy Vật lý và Toán nâng cao. 10 năm kinh nghiệm, nhiều học sinh đỗ các trường top như Bách Khoa, ĐH Quốc gia. Phương pháp giảng dạy logic, hệ thống, tập trung vào tư duy giải quyết vấn đề.",
    bankAccount: "MB Bank - 7788990011 - Vu Quang Hai",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample11", name: "Bằng Thạc sĩ Vật lý" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample12", name: "Chứng chỉ Giảng viên xuất sắc" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample13", name: "Giải Nhất Olympic Vật lý" }),
    ],
    rating: 4.9,
    totalSessions: 103,
    createdAt: new Date("2025-10-25T08:00:00Z"), // October 2025
  },
  {
    email: "tutor7@example.com",
    name: "Đặng Thu Hà",
    subjects: ["Tiếng Anh", "Tiếng Việt"],
    grades: [6, 7, 8, 9],
    hourlyRate: 260000,
    bio: "Cử nhân Sư phạm Tiếng Anh, IELTS 7.5. Chuyên dạy Tiếng Anh giao tiếp và Tiếng Việt cho học sinh THCS. 5 năm kinh nghiệm, phương pháp giảng dạy sinh động, tương tác cao. Giúp học sinh tự tin giao tiếp và yêu thích học ngoại ngữ.",
    bankAccount: "VPBank - 2233445566 - Dang Thu Ha",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample14", name: "IELTS 7.5" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample15", name: "Bằng Sư phạm Tiếng Anh" }),
    ],
    rating: 4.7,
    totalSessions: 41,
    createdAt: new Date("2025-11-12T15:30:00Z"), // November 2025
  },
  {
    email: "tutor8@example.com",
    name: "Bùi Văn Kiên",
    subjects: ["Tin học", "Toán"],
    grades: [10, 11, 12],
    hourlyRate: 290000,
    bio: "Kỹ sư Công nghệ Thông tin, tốt nghiệp Bách Khoa Hà Nội. Dạy Tin học cơ bản, lập trình và Toán tin. 4 năm kinh nghiệm, đã hướng dẫn học sinh đạt giải trong các kỳ thi HSG Tin học. Phương pháp thực hành kết hợp lý thuyết.",
    bankAccount: "Agribank - 9988776655 - Bui Van Kien",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample16", name: "Bằng Kỹ sư CNTT" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample17", name: "Chứng chỉ Python" }),
    ],
    rating: 4.6,
    totalSessions: 28,
    createdAt: new Date("2025-11-28T10:20:00Z"), // November 2025
  },
  {
    email: "tutor9@example.com",
    name: "Ngô Thị Mai",
    subjects: ["Hóa học"],
    grades: [10, 11, 12],
    hourlyRate: 310000,
    bio: "Thạc sĩ Hóa học, giảng viên Đại học Sư phạm. 9 năm kinh nghiệm dạy Hóa học THPT và ôn thi THPT Quốc gia. Chuyên sâu về Hóa hữu cơ và Hóa vô cơ. Phương pháp giảng dạy rõ ràng, dễ nhớ với nhiều mẹo ghi nhớ hiệu quả.",
    bankAccount: "Sacombank - 4455667788 - Ngo Thi Mai",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample18", name: "Bằng Thạc sĩ Hóa học" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample19", name: "Chứng chỉ Giảng viên" }),
    ],
    rating: 4.8,
    totalSessions: 78,
    createdAt: new Date("2025-12-15T12:45:00Z"), // December 2025
  },
  {
    email: "tutor10@example.com",
    name: "Trịnh Quốc Anh",
    subjects: ["Toán", "Vật lý", "Hóa học"],
    grades: [10, 11, 12],
    hourlyRate: 340000,
    bio: "Giáo viên dạy kèm chuyên nghiệp với 12 năm kinh nghiệm. Tốt nghiệp Sư phạm Toán-Lý-Hóa loại Xuất sắc. Đã giúp hơn 200 học sinh đạt điểm cao trong kỳ thi THPT và đỗ các trường đại học danh tiếng. Phương pháp giảng dạy tổng hợp, bám sát chương trình.",
    bankAccount: "VietinBank - 6677889900 - Trinh Quoc Anh",
    certificates: [
      JSON.stringify({ url: "https://drive.google.com/file/d/sample20", name: "Bằng Sư phạm Toán-Lý-Hóa" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample21", name: "Giáo viên xuất sắc 2023" }),
      JSON.stringify({ url: "https://drive.google.com/file/d/sample22", name: "Chứng chỉ Quản lý giáo dục" }),
    ],
    rating: 5.0,
    totalSessions: 156,
    createdAt: new Date("2026-01-20T16:00:00Z"), // January 2026
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Spirit Animals
  console.log("\n📚 Seeding Spirit Animals...");
  for (const animal of spiritAnimals) {
    const created = await prisma.spiritAnimal.upsert({
      where: { slug: animal.slug },
      update: animal,
      create: animal,
    });
    console.log(`✅ Created/Updated: ${created.name} (${created.slug})`);
  }

  // Seed Parents
  console.log("\n👨‍👩‍👧‍👦 Seeding Parents...");
  for (const parentData of parents) {
    const parent = await prisma.user.upsert({
      where: { email: parentData.email },
      update: {
        name: parentData.name,
        role: "PARENT",
        updatedAt: parentData.createdAt,
      },
      create: {
        id: `parent_${parentData.email.split("@")[0]}`,
        email: parentData.email,
        name: parentData.name,
        emailVerified: true,
        role: "PARENT",
        createdAt: parentData.createdAt,
        updatedAt: parentData.createdAt,
      },
    });
    console.log(`✅ Created/Updated: ${parent.name} (${parent.email}) - Created: ${parentData.createdAt.toLocaleDateString()}`);
  }

  // Seed Tutors
  console.log("\n👨‍🏫 Seeding Tutors...");
  for (const tutorData of tutors) {
    // Create or get user
    const user = await prisma.user.upsert({
      where: { email: tutorData.email },
      update: {
        name: tutorData.name,
        role: "TUTOR",
        updatedAt: tutorData.createdAt,
      },
      create: {
        id: `tutor_${tutorData.email.split("@")[0]}`,
        email: tutorData.email,
        name: tutorData.name,
        emailVerified: true,
        role: "TUTOR",
        createdAt: tutorData.createdAt,
        updatedAt: tutorData.createdAt,
      },
    });

    // Create tutor profile
    const tutor = await prisma.tutor.upsert({
      where: { userId: user.id },
      update: {
        subjects: tutorData.subjects,
        grades: tutorData.grades,
        hourlyRate: tutorData.hourlyRate,
        bio: tutorData.bio,
        bankAccount: tutorData.bankAccount,
        certificates: tutorData.certificates,
        rating: tutorData.rating,
        totalSessions: tutorData.totalSessions,
        verified: true,
      },
      create: {
        userId: user.id,
        subjects: tutorData.subjects,
        grades: tutorData.grades,
        hourlyRate: tutorData.hourlyRate,
        bio: tutorData.bio,
        bankAccount: tutorData.bankAccount,
        certificates: tutorData.certificates,
        rating: tutorData.rating,
        totalSessions: tutorData.totalSessions,
        verified: true,
      },
    });

    console.log(`✅ Created/Updated: ${user.name} - ${tutor.subjects.join(", ")} - Created: ${tutorData.createdAt.toLocaleDateString()}`);
  }

  console.log("\n✨ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
