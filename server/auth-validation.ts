import { z } from "zod";

export const reservedUsernames = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "support",
  "moderator",
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Логин кемінде 3 таңбадан тұруы керек")
  .max(24, "Логин 24 таңбадан ұзын болмауы керек")
  .regex(/^[a-z0-9._]+$/, "Логинде тек латын әріптері, цифр, нүкте және _ қолдануға болады")
  .refine((value) => !reservedUsernames.has(value), "Бұл логинді қолдануға болмайды");

export const passwordSchema = z
  .string()
  .min(10, "Құпиясөз кемінде 10 таңбадан тұруы керек")
  .max(128, "Құпиясөз тым ұзын")
  .regex(/[a-zA-Z]/, "Құпиясөзде кемінде бір әріп болуы керек")
  .regex(/[0-9]/, "Құпиясөзде кемінде бір цифр болуы керек");

export const educationLevels = [
  "7-сынып",
  "8-сынып",
  "9-сынып",
  "10-сынып",
  "11-сынып",
  "Студент",
] as const;

export const registerInput = z.object({
  name: z.string().trim().min(2, "Аты-жөніңізді енгізіңіз").max(100),
  username: usernameSchema,
  password: passwordSchema,
  passwordConfirm: z.string(),
  level: z.enum(educationLevels),
  email: z.string().trim().email("Email форматы дұрыс емес").max(200).optional().or(z.literal("")),
  acceptedTerms: z.literal(true, { error: "Қолдану шарттарымен келісу қажет" }),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Құпиясөздер сәйкес келмейді",
});

export const loginInput = z.object({
  username: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(128),
  remember: z.boolean().default(false),
});
