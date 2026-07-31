import { PrismaClient, PublishStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: "general-chemistry" },
    update: {},
    create: {
      slug: "general-chemistry",
      title: "Жалпы химия",
      description: "Атом құрылысынан реакцияларға дейінгі негізгі курс",
      status: PublishStatus.published,
      modules: {
        create: [
          {
            title: "Атомдар аралы",
            position: 1,
            lessons: {
              create: [
                {
                  slug: "atom-composition",
                  title: "Атом және оның құрамы",
                  objective: "Атомның негізгі бөлшектерін сипаттау",
                  position: 1,
                  status: PublishStatus.published,
                },
                {
                  slug: "electron-config",
                  title: "Атомның электрондық құрылысы",
                  objective: "Электрондардың энергетикалық деңгейлерде орналасуын түсіндіру",
                  position: 2,
                  status: PublishStatus.published,
                },
              ],
            },
          },
          {
            title: "Реакциялар зертханасы",
            position: 2,
            lessons: {
              create: [
                {
                  slug: "reaction-balancing",
                  title: "Реакцияларды теңестіру",
                  objective: "Масса сақталу заңын қолданып коэффициенттерді қою",
                  position: 1,
                  status: PublishStatus.published,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.achievement.createMany({
    data: [
      { code: "FIRST_STEP", title: "Алғашқы қадам", description: "Бірінші сабақты аяқта" },
      { code: "ATOM_EXPLORER", title: "Атом зерттеушісі", description: "Атомдар модулін аяқта" },
      { code: "PERIODIC_EXPERT", title: "Периодтық жүйе білгірі", description: "20 элементті зертте" },
      { code: "REACTION_MASTER", title: "Реакция шебері", description: "10 реакцияны теңестір" },
      { code: "LAB_SPECIALIST", title: "Зертхана маманы", description: "3 тәжірибені аяқта" },
      { code: "SEVEN_DAY_STREAK", title: "7 күндік серия", description: "7 күн қатарынан оқы" },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded ${course.title}`);
}

main()
  .finally(async () => prisma.$disconnect());
