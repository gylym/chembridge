CREATE TABLE IF NOT EXISTS `grade_levels` (
  `id` text PRIMARY KEY NOT NULL,
  `code` text NOT NULL,
  `title` text NOT NULL,
  `position` integer NOT NULL DEFAULT 0,
  `status` text NOT NULL DEFAULT 'published',
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE UNIQUE INDEX IF NOT EXISTS `grade_levels_code_uidx` ON `grade_levels` (`code`);

CREATE TABLE IF NOT EXISTS `subject_sections` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `position` integer NOT NULL DEFAULT 0,
  `status` text NOT NULL DEFAULT 'draft',
  `created_by` text REFERENCES `users`(`id`),
  `updated_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE UNIQUE INDEX IF NOT EXISTS `subject_sections_slug_uidx` ON `subject_sections` (`slug`);

CREATE TABLE IF NOT EXISTS `pages` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `seo_title` text,
  `seo_description` text,
  `status` text NOT NULL DEFAULT 'draft',
  `scheduled_at` integer,
  `published_at` integer,
  `created_by` text REFERENCES `users`(`id`),
  `updated_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE UNIQUE INDEX IF NOT EXISTS `pages_slug_uidx` ON `pages` (`slug`);
CREATE INDEX IF NOT EXISTS `pages_status_idx` ON `pages` (`status`,`published_at`);

CREATE TABLE IF NOT EXISTS `page_sections` (
  `id` text PRIMARY KEY NOT NULL,
  `page_id` text NOT NULL REFERENCES `pages`(`id`),
  `section_key` text NOT NULL,
  `type` text NOT NULL,
  `title` text,
  `body` text,
  `payload` text,
  `position` integer NOT NULL DEFAULT 0,
  `is_visible` integer NOT NULL DEFAULT 1,
  `status` text NOT NULL DEFAULT 'draft',
  `created_by` text REFERENCES `users`(`id`),
  `updated_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE UNIQUE INDEX IF NOT EXISTS `page_sections_page_key_uidx` ON `page_sections` (`page_id`,`section_key`);
CREATE INDEX IF NOT EXISTS `page_sections_page_position_idx` ON `page_sections` (`page_id`,`position`);

CREATE TABLE IF NOT EXISTS `global_texts` (
  `id` text PRIMARY KEY NOT NULL,
  `key` text NOT NULL,
  `locale` text NOT NULL DEFAULT 'kk',
  `value` text NOT NULL,
  `description` text,
  `updated_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE UNIQUE INDEX IF NOT EXISTS `global_texts_key_uidx` ON `global_texts` (`key`);

CREATE TABLE IF NOT EXISTS `navigation_items` (
  `id` text PRIMARY KEY NOT NULL,
  `menu` text NOT NULL DEFAULT 'main',
  `label` text NOT NULL,
  `href` text NOT NULL,
  `icon` text,
  `position` integer NOT NULL DEFAULT 0,
  `is_visible` integer NOT NULL DEFAULT 1,
  `required_role` text,
  `parent_id` text,
  `updated_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE INDEX IF NOT EXISTS `navigation_menu_position_idx` ON `navigation_items` (`menu`,`position`);

CREATE TABLE IF NOT EXISTS `media_assets` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `url` text NOT NULL,
  `mime_type` text NOT NULL,
  `alt_text` text NOT NULL,
  `caption` text,
  `folder` text NOT NULL DEFAULT 'general',
  `size_bytes` integer,
  `uploaded_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch()),
  `deleted_at` integer
);
CREATE INDEX IF NOT EXISTS `media_assets_folder_idx` ON `media_assets` (`folder`,`created_at`);

CREATE TABLE IF NOT EXISTS `content_versions` (
  `id` text PRIMARY KEY NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `version` integer NOT NULL,
  `snapshot` text NOT NULL,
  `change_note` text,
  `created_by` text NOT NULL REFERENCES `users`(`id`),
  `created_at` integer NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS `content_versions_entity_version_uidx` ON `content_versions` (`entity_type`,`entity_id`,`version`);
CREATE INDEX IF NOT EXISTS `content_versions_entity_idx` ON `content_versions` (`entity_type`,`entity_id`,`created_at`);

INSERT OR IGNORE INTO `grade_levels` (`id`,`code`,`title`,`position`,`status`) VALUES
 ('grade:7','7','7-сынып',7,'published'),('grade:8','8','8-сынып',8,'published'),
 ('grade:9','9','9-сынып',9,'published'),('grade:10','10','10-сынып',10,'published'),
 ('grade:11','11','11-сынып',11,'published'),('grade:student','student','Студент',12,'published');

INSERT OR IGNORE INTO `pages` (`id`,`slug`,`title`,`status`,`published_at`) VALUES
 ('page:home','home','Басты бет','published',unixepoch());
INSERT OR IGNORE INTO `page_sections` (`id`,`page_id`,`section_key`,`type`,`title`,`body`,`position`,`is_visible`,`status`) VALUES
 ('section:home:hero','page:home','hero','hero','Химияны зертте, тәжірибе жаса, білімді байланыстыр','ChemBridge — теорияны интерактивті тәжірибемен байланыстыратын оқу платформасы.',1,1,'published'),
 ('section:home:features','page:home','features','cards','Платформа мүмкіндіктері','Сабақтар, периодтық кесте, реакциялар және виртуалды зертхана.',2,1,'published');
INSERT OR IGNORE INTO `global_texts` (`id`,`key`,`locale`,`value`,`description`) VALUES
 ('text:brand:tagline','brand.tagline','kk','Химияны зертте, тәжірибе жаса, білімді байланыстыр','Басты ұран'),
 ('text:auth:login','auth.login','kk','Кіру','Навигация батырмасы'),
 ('text:auth:register','auth.register','kk','Тіркелу','Навигация батырмасы');
INSERT OR IGNORE INTO `navigation_items` (`id`,`menu`,`label`,`href`,`icon`,`position`,`is_visible`) VALUES
 ('nav:dashboard','app','Бақылау тақтасы','dashboard','LayoutDashboard',1,1),
 ('nav:lessons','app','Сабақтар','world','BookOpen',2,1),
 ('nav:quizzes','app','Тесттер','quizzes','ClipboardCheck',3,1),
 ('nav:periodic','app','Периодтық кесте','periodic','Atom',4,1),
 ('nav:reactions','app','Реакциялар','reactions','TestTube2',5,1),
 ('nav:lab','app','Зертхана','laboratory','FlaskConical',6,1),
 ('nav:profile','app','Профиль','profile','UserRound',7,1);

INSERT OR IGNORE INTO `chemical_reactions` (`id`,`equation`,`balanced_equation`,`type`,`hint`,`created_at`,`updated_at`) VALUES
 ('reaction:25','Mg + O2 → MgO','2Mg + O2 → 2MgO','Қосылу','Оттек атомдарының санын алдымен теңестір.',unixepoch(),unixepoch()),
 ('reaction:26','Al + O2 → Al2O3','4Al + 3O2 → 2Al2O3','Қосылу','Al2O3 алдына жұп коэффициент қой.',unixepoch(),unixepoch()),
 ('reaction:27','Fe + O2 → Fe2O3','4Fe + 3O2 → 2Fe2O3','Қосылу','Өнім алдына 2 қойып баста.',unixepoch(),unixepoch()),
 ('reaction:28','K + H2O → KOH + H2','2K + 2H2O → 2KOH + H2','Орынбасу','Сутек газы екі атомды.',unixepoch(),unixepoch()),
 ('reaction:29','Ca + H2O → Ca(OH)2 + H2','Ca + 2H2O → Ca(OH)2 + H2','Орынбасу','Өнімдегі екі OH тобын сана.',unixepoch(),unixepoch()),
 ('reaction:30','Mg + HCl → MgCl2 + H2','Mg + 2HCl → MgCl2 + H2','Орынбасу','MgCl2 үшін екі хлор қажет.',unixepoch(),unixepoch()),
 ('reaction:31','Fe + HCl → FeCl2 + H2','Fe + 2HCl → FeCl2 + H2','Орынбасу','Хлорды екіге жеткіз.',unixepoch(),unixepoch()),
 ('reaction:32','CuO + H2 → Cu + H2O','CuO + H2 → Cu + H2O','Тотықсыздану','Барлық коэффициент 1 болуы мүмкін.',unixepoch(),unixepoch()),
 ('reaction:33','C + O2 → CO2','C + O2 → CO2','Жану','Көміртек толық жанғанда CO2 түзіледі.',unixepoch(),unixepoch()),
 ('reaction:34','S + O2 → SO2','S + O2 → SO2','Жану','Екі жақтағы оттекті сана.',unixepoch(),unixepoch()),
 ('reaction:35','P + O2 → P2O5','4P + 5O2 → 2P2O5','Жану','Өнім алдына 2 қойып баста.',unixepoch(),unixepoch()),
 ('reaction:36','C2H6 + O2 → CO2 + H2O','2C2H6 + 7O2 → 4CO2 + 6H2O','Жану','Алдымен көміртек, кейін сутекті теңестір.',unixepoch(),unixepoch()),
 ('reaction:37','C3H8 + O2 → CO2 + H2O','C3H8 + 5O2 → 3CO2 + 4H2O','Жану','Көміртек саны 3, сутек саны 8.',unixepoch(),unixepoch()),
 ('reaction:38','C2H5OH + O2 → CO2 + H2O','C2H5OH + 3O2 → 2CO2 + 3H2O','Жану','Этанолдағы оттекті де жалпы санға қос.',unixepoch(),unixepoch()),
 ('reaction:39','H2O2 → H2O + O2','2H2O2 → 2H2O + O2','Айырылу','Оттек газы O2 түрінде бөлінеді.',unixepoch(),unixepoch()),
 ('reaction:40','KClO3 → KCl + O2','2KClO3 → 2KCl + 3O2','Айырылу','Сол жақтағы оттекті 6-ға жеткіз.',unixepoch(),unixepoch()),
 ('reaction:41','NaHCO3 → Na2CO3 + CO2 + H2O','2NaHCO3 → Na2CO3 + CO2 + H2O','Айырылу','Натрийді жұп ету үшін 2 қой.',unixepoch(),unixepoch()),
 ('reaction:42','CuCO3 → CuO + CO2','CuCO3 → CuO + CO2','Айырылу','Коэффициенттердің бәрі 1.',unixepoch(),unixepoch()),
 ('reaction:43','NH3 + HCl → NH4Cl','NH3 + HCl → NH4Cl','Қосылу','Атомдарды тікелей санап көр.',unixepoch(),unixepoch()),
 ('reaction:44','SO3 + H2O → H2SO4','SO3 + H2O → H2SO4','Қосылу','Күкірт пен сутек бірден тең.',unixepoch(),unixepoch()),
 ('reaction:45','CaO + H2O → Ca(OH)2','CaO + H2O → Ca(OH)2','Қосылу','OH топтарын атомдарға бөліп сана.',unixepoch(),unixepoch()),
 ('reaction:46','BaCl2 + Na2SO4 → BaSO4 + NaCl','BaCl2 + Na2SO4 → BaSO4 + 2NaCl','Алмасу','Натрий мен хлор үшін NaCl алдына 2 қой.',unixepoch(),unixepoch()),
 ('reaction:47','CuSO4 + NaOH → Cu(OH)2 + Na2SO4','CuSO4 + 2NaOH → Cu(OH)2 + Na2SO4','Алмасу','Cu(OH)2 үшін екі OH тобы керек.',unixepoch(),unixepoch()),
 ('reaction:48','FeCl3 + NaOH → Fe(OH)3 + NaCl','FeCl3 + 3NaOH → Fe(OH)3 + 3NaCl','Алмасу','Үш хлор үш NaCl береді.',unixepoch(),unixepoch()),
 ('reaction:49','Pb(NO3)2 + KI → PbI2 + KNO3','Pb(NO3)2 + 2KI → PbI2 + 2KNO3','Алмасу','Йодид пен нитратты екіден сана.',unixepoch(),unixepoch()),
 ('reaction:50','Na2CO3 + HCl → NaCl + H2O + CO2','Na2CO3 + 2HCl → 2NaCl + H2O + CO2','Алмасу','Екі натрий екі NaCl түзеді.',unixepoch(),unixepoch()),
 ('reaction:51','Ca(OH)2 + HNO3 → Ca(NO3)2 + H2O','Ca(OH)2 + 2HNO3 → Ca(NO3)2 + 2H2O','Бейтараптану','Екі OH тобына екі қышқыл молекуласы қажет.',unixepoch(),unixepoch()),
 ('reaction:52','H2SO4 + KOH → K2SO4 + H2O','H2SO4 + 2KOH → K2SO4 + 2H2O','Бейтараптану','K2SO4 үшін екі калий қажет.',unixepoch(),unixepoch()),
 ('reaction:53','N2 + H2 → NH3','N2 + 3H2 → 2NH3','Қосылу','Алдымен азотты 2NH3 арқылы теңестір.',unixepoch(),unixepoch()),
 ('reaction:54','CO + O2 → CO2','2CO + O2 → 2CO2','Жану','Көміртек оксидтерін жұпта.',unixepoch(),unixepoch());

INSERT OR IGNORE INTO `laboratory_experiments` (`id`,`title`,`description`,`safety`,`status`,`created_at`,`updated_at`) VALUES
 ('lab:9','Қызыл қырыққабат индикаторы','Виртуалды табиғи индикатор арқылы қышқыл және сілті ортасын салыстыру.','Тек виртуалды симуляция; ерітінділерді дәмін татып тексеруге болмайды.','published',unixepoch(),unixepoch()),
 ('lab:10','Темірдің мыс иондарын орынбасуы','Темір мен мыс(II) сульфаты арасындағы орынбасу реакциясын бақылау.','Нақты тұз ерітінділерімен тек зертханада, қорғаныш құралымен жұмыс істейді.','published',unixepoch(),unixepoch()),
 ('lab:11','Судың электролиз моделі','Электр тогы әсерінен сутек пен оттектің бөліну қатынасын модельдеу.','Бұл тек төмен кернеулі виртуалды модель; үйде қайталамаңыз.','published',unixepoch(),unixepoch()),
 ('lab:12','Ерігіштік және кристалдану','Температура өзгергенде тұздың ерігіштігі мен кристал түзілуін бақылау.','Ыстық ерітінділер күйдіруі мүмкін; симуляциядан тыс мұғалім бақылауы қажет.','published',unixepoch(),unixepoch());

INSERT OR IGNORE INTO `experiment_steps` (`id`,`experiment_id`,`instruction`,`position`) VALUES
 ('labstep:9:1','lab:9','Индикатор ерітіндісін өлшеуіш ыдысқа құй.',1),
 ('labstep:9:2','lab:9','Қышқыл үлгісін қосып, түс өзгерісін белгіле.',2),
 ('labstep:9:3','lab:9','Сілті үлгісімен нәтижені салыстыр.',3),
 ('labstep:10:1','lab:10','Мыс(II) сульфаты ерітіндісін пробиркаға құй.',1),
 ('labstep:10:2','lab:10','Темір пластинасын ерітіндіге орналастыр.',2),
 ('labstep:10:3','lab:10','Қаптама мен ерітінді түсінің өзгерісін бақыла.',3),
 ('labstep:11:1','lab:11','Су молекулалары бар виртуалды ұяшықты дайында.',1),
 ('labstep:11:2','lab:11','Төмен кернеулі ток көзін қос.',2),
 ('labstep:11:3','lab:11','Газ көлемдерінің 2:1 қатынасын салыстыр.',3),
 ('labstep:12:1','lab:12','Тұзды жылы суға біртіндеп қос.',1),
 ('labstep:12:2','lab:12','Қаныққан ерітіндіні баяу салқындат.',2),
 ('labstep:12:3','lab:12','Кристалдардың пайда болуын бақыла.',3);

INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`pass_score`,`status`,`created_at`,`updated_at`) VALUES
 ('quiz:bank:7',NULL,'7-сынып сұрақтар банкі',70,'published',unixepoch(),unixepoch()),
 ('quiz:bank:8',NULL,'8-сынып сұрақтар банкі',70,'published',unixepoch(),unixepoch()),
 ('quiz:bank:9',NULL,'9-сынып сұрақтар банкі',70,'published',unixepoch(),unixepoch()),
 ('quiz:bank:10',NULL,'10-сынып сұрақтар банкі',70,'published',unixepoch(),unixepoch()),
 ('quiz:bank:11',NULL,'11-сынып сұрақтар банкі',70,'published',unixepoch(),unixepoch()),
 ('quiz:bank:student',NULL,'Студент сұрақтар банкі',70,'published',unixepoch(),unixepoch());

WITH facts(grade, topic_no, topic, statement, answer, explanation) AS (
  VALUES
  ('7',1,'Зат және дене','Зат — денені құрайтын материал.','зат','Дене нақты пішінге ие, ал зат сол денені құрайды.'),
  ('7',2,'Қоспалар','Қоспаны физикалық әдістермен бөлуге болады.','сүзу, буландыру немесе айдау','Бөлу әдісі компоненттердің физикалық қасиеттеріне тәуелді.'),
  ('7',3,'Физикалық құбылыс','Физикалық құбылыста жаңа зат түзілмейді.','жаңа зат түзілмейді','Заттың күйі не пішіні ғана өзгереді.'),
  ('7',4,'Химиялық құбылыс','Химиялық құбылыста жаңа зат түзіледі.','жаңа зат түзіледі','Түс, газ, тұнба не жылу өзгерісі белгі болуы мүмкін.'),
  ('7',5,'Қауіпсіздік','Зертханалық жұмысты нұсқаулықты оқудан бастайды.','нұсқаулықты оқу','Қорғаныш көзілдірігі мен мұғалім бақылауы міндетті.'),
  ('8',1,'Атом құрылысы','Атомдық нөмір протон санына тең.','протон саны','Бейтарап атомда протон мен электрон саны тең.'),
  ('8',2,'Изотоптар','Изотоптардың протон саны бірдей, нейтрон саны әртүрлі.','нейтрон саны','Бір элементтің изотоптары бірдей атомдық нөмірге ие.'),
  ('8',3,'Периодтық жүйе','Период саны электрондық қабаттар санын көрсетеді.','электрондық қабаттар саны','Топтағы элементтердің сыртқы электрондық құрылысы ұқсас.'),
  ('8',4,'Иондық байланыс','Иондық байланыс электрон беру және қабылдау арқылы түзіледі.','электрон алмасу','Көбіне металл мен бейметалл арасында түзіледі.'),
  ('8',5,'Коваленттік байланыс','Коваленттік байланыста ортақ электрон жұбы болады.','ортақ электрон жұбы','Бейметалл атомдары электрондарын ортақ пайдаланады.'),
  ('9',1,'Масса сақталуы','Реакцияда әр элемент атомдарының саны сақталады.','атомдар саны сақталады','Теңдеуді коэффициенттермен теңестіреді, индекстер өзгермейді.'),
  ('9',2,'Қышқылдар','Қышқыл ортада pH 7-ден төмен.','pH < 7','Қышқыл ерітіндіде сутек иондары басым.'),
  ('9',3,'Негіздер','Сілтілік ортада pH 7-ден жоғары.','pH > 7','Сілті ерітіндіде гидроксид иондары басым.'),
  ('9',4,'Бейтараптану','Қышқыл мен негіз әрекеттескенде тұз және су түзіледі.','тұз және су','Бұл — бейтараптану реакциясы.'),
  ('9',5,'Белсенділік қатары','Белсендірек металл ерітіндіден белсенділігі төмен металды ығыстырады.','орынбасу реакциясы','Металдардың белсенділік қатары өнімді болжауға көмектеседі.'),
  ('10',1,'Зат мөлшері','Бір мольде Авогадро санына тең бөлшек бар.','6.02×10^23','Зат мөлшері n әрпімен белгіленеді.'),
  ('10',2,'Молярлық масса','Молярлық масса M=m/n формуласымен табылады.','M=m/n','Өлшем бірлігі көбіне г/моль.'),
  ('10',3,'Концентрация','Молярлық концентрация C=n/V формуласымен есептеледі.','C=n/V','Ерітінді көлемі литрмен алынады.'),
  ('10',4,'Реакция жылдамдығы','Температура артқанда тиімді соқтығысулар жиілейді.','жылдамдық артады','Концентрация мен жанасу ауданы да жылдамдыққа әсер етеді.'),
  ('10',5,'Катализатор','Катализатор белсендіру энергиясын төмендетеді.','белсендіру энергиясын төмендетеді','Катализатор реакция соңында жұмсалмайды.'),
  ('11',1,'Органикалық химия','Алкандарда тек дара көміртек-көміртек байланысы бар.','дара байланыс','Алкандардың жалпы формуласы CnH2n+2.'),
  ('11',2,'Алкендер','Алкендерде кемінде бір қос байланыс бар.','қос байланыс','Алкендердің жалпы формуласы CnH2n.'),
  ('11',3,'Тепе-теңдік','Ле Шателье принципі сыртқы әсерге жүйенің жауабын болжайды.','әсерді әлсірететін бағыт','Жүйе өзгерісті азайтатын бағытқа ығысады.'),
  ('11',4,'Тотығу-тотықсыздану','Тотығу кезінде электрон беріледі.','электрон беру','Тотықсыздану кезінде электрон қабылданады.'),
  ('11',5,'Электрохимия','Гальваникалық элемент химиялық энергияны электр энергиясына айналдырады.','химиялықтан электрлікке','Электрондар сыртқы тізбек арқылы қозғалады.'),
  ('student',1,'Термодинамика','Термодинамиканың бірінші заңы энергияның сақталуын білдіреді.','энергия сақталады','ΔU=Q−W таңба келісіміне сай қолданылады.'),
  ('student',2,'Энтальпия','Экзотермиялық процесте жүйенің энтальпиясы кемиді.','ΔH < 0','Жылу қоршаған ортаға беріледі.'),
  ('student',3,'Кинетика','Реакция реті тәжірибелік жылдамдық теңдеуінен анықталады.','тәжірибелік дерек','Стехиометриялық коэффициент әрдайым реакция ретіне тең емес.'),
  ('student',4,'Химиялық тепе-теңдік','Тепе-теңдік константасы температураға тәуелді.','температура','Катализатор K мәнін өзгертпейді.'),
  ('student',5,'Аналитикалық химия','Эквиваленттік нүктеде реагенттер стехиометриялық қатынаста болады.','стехиометриялық қатынас','Индикатордың соңғы нүктесі эквиваленттік нүктеге жуықтайды.')
),
variants(variant, question_prefix) AS (
  VALUES
  (1,'Негізгі анықтаманы толықтыр: '),
  (2,'Дұрыс ғылыми тұжырымды ата: '),
  (3,'Қысқа жауап бер: '),
  (4,'Бұл ереженің негізгі жауабы қандай: '),
  (5,'Тақырыпты бекіт: '),
  (6,'Қолданбалы сұрақ: ')
),
bank AS (
  SELECT grade, topic_no, topic, statement, answer, explanation, variant, question_prefix,
         ROW_NUMBER() OVER (PARTITION BY grade ORDER BY topic_no, variant) AS position
  FROM facts CROSS JOIN variants
)
INSERT OR IGNORE INTO `questions`
 (`id`,`quiz_id`,`type`,`prompt`,`correct_answer`,`explanation`,`position`,`created_at`,`updated_at`)
SELECT
 'question:bank:' || grade || ':' || topic_no || ':' || variant,
 'quiz:bank:' || grade,
 CASE WHEN variant = 6 THEN 'formula' ELSE 'single' END,
 question_prefix || topic || '. ' || statement,
 answer,
 explanation,
 position,
 unixepoch(),
 unixepoch()
FROM bank;
