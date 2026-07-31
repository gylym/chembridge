import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { passwordSchema, usernameSchema } from "../server/auth-validation";

const prisma = new PrismaClient();

async function main() {
  const loginArg = process.argv.findIndex((value) => value === "--login");
  const username = usernameSchema.parse(
    loginArg >= 0 ? process.argv[loginArg + 1] : process.env.ADMIN_LOGIN,
  );
  const password = passwordSchema.parse(process.env.ADMIN_PASSWORD);
  const name = (process.env.ADMIN_NAME ?? "ChemBridge әкімшісі").trim();
  const email = (process.env.ADMIN_EMAIL ?? `${username}@accounts.chembridge.local`).toLowerCase();
  const passwordHash = await hash(password, 11);

  await prisma.user.upsert({
    where: { username },
    update: {
      name,
      passwordHash,
      role: Role.admin,
      status: UserStatus.active,
      deletedAt: null,
    },
    create: {
      username,
      email,
      name,
      passwordHash,
      role: Role.admin,
      status: UserStatus.active,
      level: "Студент",
    },
  });
  console.log(`Әкімші аккаунты дайын: ${username}`);
}

main()
  .finally(async () => prisma.$disconnect());
