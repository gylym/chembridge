# ChemBridge

ChemBridge — мектеп оқушылары мен студенттерге арналған қазақ тіліндегі интерактивті химия оқу платформасы. MVP теорияны, оқу картасын, 118 элементтік периодтық кестені, реакция теңестіруді, 2D виртуалды зертхананы, тесттерді және геймификацияны бір өнімге біріктіреді.

## Мүмкіндіктер

- Қазақ тіліндегі responsive, keyboard-friendly интерфейс және ашық/қараңғы тақырып
- Оқушы dashboard-ы: нақты XP, деңгей, аяқталған сабақтар және келесі әрекет
- Құрылымды сабақ, формула, интерактив сұрақ және автоматты progress
- Іздеу, санат сүзгісі және толық element detail бар 118 элементтік кесте
- 54 реакция, формула parser-і, coefficient checker және сатылы hint
- Мақсат, қадам, бақылау, теңдеу және қорытындысы бар 12 мини-зертхана
- YouTube privacy-enhanced embed қолданатын видеосабақтар каталогы
- R2 upload немесе қауіпсіз сыртқы URL арқылы PDF силлабустар
- Оқушыдан әкімші inbox-ына түсетін жеке кері байланыс
- Автоматты бағалау, түсіндірме және қайта тапсыруы бар тест
- Мұғалімнің lesson draft/review студиясы
- Әкімшінің role-management және контент статистикасы
- Серверлік XP service және қайталанбайтын XP transaction моделі

## Архитектура

Қосымша modular monolith ретінде бір репозиторийде орналасады:

- `app/` — Next.js App Router беттері, route handler және UI composition
- `lib/` — chemistry parser, XP/quiz business logic және seed-like content
- `messages/` — интерфейс мәтіндерінің локализация қабаты
- `db/` — Drizzle ORM арқылы реляциялық домен моделі
- `tests/` — unit және server-render тексерістері

UI, business rules және persistence access бөлек сақталған. Hosted Sites нұсқасы Cloudflare D1 қолданады. PostgreSQL/Prisma adapter-і жергілікті және сыртқы deployment үшін де дайын.

## Технологиялар

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React 19, Framer Motion, Lucide, Zod, Drizzle ORM, Cloudflare D1, Vitest және Vinext/Sites.

## Жергілікті іске қосу

Node.js 22.13+ қажет.

```bash
pnpm install
pnpm dev
```

Сайт әдетте `http://localhost:3000` мекенжайында ашылады.

## Environment variables

`.env.example` файлын `.env.local` етіп көшіріңіз.

```env
SITE_URL=http://localhost:3000
ADMIN_LOGIN=chembridge_owner
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_NAME=ChemBridge әкімшісі
ADMIN_EMAIL=
```

Жергілікті PostgreSQL нұсқасында алғашқы әкімшіні қауіпсіз құру:

```bash
pnpm admin:create -- --login chembridge_owner
```

Құпиясөз `ADMIN_PASSWORD` арқылы беріледі, bcrypt-пен хэштеледі және консольге
шығарылмайды. Қалыпты `/register` формасы әрқашан тек оқушы аккаунтын жасайды.
Hosted Sites нұсқасында бұрын bootstrap жасалған owner-әкімші сақталады; ол
жаңа логинмен тіркелген аккаунтты `/admin` панелінен әкімші немесе мұғалім ете
алады.

## Авторизация және әкімші панелі

- `/login` — email немесе логин және құпиясөз арқылы кіру
- `/register` — аты-жөні, бірегей логин, оқу деңгейі және optional email арқылы тіркелу
- Құпиясөздер bcrypt арқылы қорғалады, сессиялар D1/PostgreSQL-де тек хэш түрінде сақталады
- HttpOnly, SameSite cookie және mutation rate limiting қолданылады
- `school_student`, `university_student`, `teacher`, `content_admin`, `admin` рөлдері server-side тексеріледі
- Әкімші қолданушыларды іздейді, рөлін/күйін өзгертеді, сессияларын тоқтатады
- Соңғы белсенді әкімшіні төмендетуге немесе бұғаттауға тыйым салынған
- Курстар, модульдер, сабақтар, контент блоктары, тесттер, сұрақтар, элементтер,
  реакциялар, зертханалар, жетістіктер, күнделікті тапсырмалар және сайт
  баптаулары бір admin редакторынан басқарылады
- Рөл, күй және контент өзгерістері әкімшілік журналға жазылады

Құпия кілттер репозиторийге жазылмайды. Қолданба тек өзінің revocable server session-ына сенеді; hosting identity header-і logout-тан кейін аккаунтты автоматты қалпына келтірмейді.

## Дерекқор және migration

```bash
pnpm db:generate
```

Команда `db/schema.ts` өзгерістерінен Drizzle SQL migration жасайды. Hosted deployment migration-дарды D1-ге қолданады. PostgreSQL контейнерін іске қосу:

```bash
docker compose up -d postgres
pnpm db:prisma:generate
pnpm db:prisma:migrate
pnpm db:seed
```

## Тексеру

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm test:rendered
pnpm test:migrations
```

Unit тесттер реакция теңестіруді, XP есебін және quiz бағалауын қамтиды.

## Demo аккаунттар

Local интерактивті preview үшін:

| Рөл | Email | Құпиясөз |
| --- | --- | --- |
| Оқушы | `student@chembridge.kz` | `Demo123!` |
| Мұғалім | `teacher@chembridge.kz` | `Teacher123!` |
| Әкімші | `admin@chembridge.kz` | `Admin123!` |

Бұл мәліметтер тек local seed үшін. Production-да әлсіз demo парольдері және автоматты demo-login қолданылмайды.

## Deployment

1. `pnpm build` орындаңыз.
2. D1 migration файлдарының generated және review жасалғанын тексеріңіз.
3. Sites project version сақтап, private access-пен deploy жасаңыз.
4. Hosted `SITE_URL` мәнін deployment URL-ге орнатыңыз.

## Қауіпсіздік ескертпелері

- Барлық server input Zod арқылы тексеріледі.
- XP клиенттен қабылданбайды; trusted server reason бойынша есептеледі.
- Бір сабақ үшін XP unique transaction арқылы бір рет беріледі.
- Role checks келесі толық CRUD route handler-лерінде server-side policy ретінде кеңейтілуі тиіс.
- Оқу зертханасы қауіпті тәжірибелерді үйде қайталауды ұсынбайды.

## Қауіпсіздік және persistence

Hosted нұсқада app-owned HttpOnly session, server-side RBAC, origin тексерісі, rate limiting, audit log және D1 persistence қолданылады. Прогресс, тест нәтижесі, XP транзакциясы, зертхана қадамы, мұғалім сабақтары, кері байланыс және әкімші өзгерістері серверде сақталады.

PostgreSQL үшін толық Prisma schema және seed adapter берілген. Hosted Sites ортасы D1 қолданатындықтан, Prisma/PostgreSQL adapter жергілікті немесе сыртқы Node.js deployment-қа арналған.

## MVP шектеулері

Сабақ контенті құрылымды блоктармен сақталады; күрделі collaborative rich-text редактор, видеоны толық көру аналитикасы және email арқылы автоматты password recovery MVP-ге кірмейді.
