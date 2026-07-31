CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO `courses`
(`id`,`slug`,`title`,`description`,`status`,`created_at`,`updated_at`)
VALUES
('course:general-chemistry','general-chemistry','Жалпы химия','Атом құрылысынан реакцияларға дейінгі негізгі курс','published',unixepoch(),unixepoch()),
('course:chemistry-calculations','chemistry-calculations','Химиялық есептер','Моль, масса және ерітінді есептері','published',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `modules`
(`id`,`course_id`,`title`,`position`,`created_at`,`updated_at`)
VALUES
('module:atoms','course:general-chemistry','Атомдар аралы',1,unixepoch(),unixepoch()),
('module:reactions','course:general-chemistry','Реакциялар зертханасы',2,unixepoch(),unixepoch()),
('module:moles','course:chemistry-calculations','Зат мөлшері',1,unixepoch(),unixepoch()),
('module:solutions','course:chemistry-calculations','Ерітінділер',2,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
(`id`,`module_id`,`slug`,`title`,`objective`,`status`,`position`,`xp_reward`,`created_at`,`updated_at`)
VALUES
('lesson:atom-composition','module:atoms','atom-composition','Атом және оның құрамы','Атомның негізгі бөлшектерін сипаттау','published',1,50,unixepoch(),unixepoch()),
('lesson:isotopes','module:atoms','isotopes','Изотоптар','Изотоптарды салыстыру','published',2,50,unixepoch(),unixepoch()),
('lesson:energy-levels','module:atoms','energy-levels','Энергетикалық деңгейлер','Энергетикалық деңгейлерді түсіндіру','published',3,50,unixepoch(),unixepoch()),
('lesson:electron-config','module:atoms','electron-config','Атомның электрондық құрылысы','Электрондардың қабаттарда орналасуын түсіндіру','published',4,50,unixepoch(),unixepoch()),
('lesson:balancing','module:reactions','reaction-balancing','Реакцияларды теңестіру','Масса сақталу заңын қолдану','published',1,50,unixepoch(),unixepoch()),
('lesson:reaction-types','module:reactions','reaction-types','Реакция түрлері','Реакцияларды түрлері бойынша жіктеу','published',2,50,unixepoch(),unixepoch()),
('lesson:mole','module:moles','mole-concept','Моль ұғымы','Зат мөлшерін есептеу','published',1,50,unixepoch(),unixepoch()),
('lesson:concentration','module:solutions','solution-concentration','Ерітінді концентрациясы','Массалық үлесті есептеу','published',1,50,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
(`id`,`lesson_id`,`title`,`pass_score`,`status`,`created_at`,`updated_at`)
VALUES
('quiz:atoms-final','lesson:electron-config','Атомдар аралы: қорытынды тест',70,'published',unixepoch(),unixepoch()),
('quiz:reactions-final','lesson:reaction-types','Реакциялар: қорытынды тест',70,'published',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `questions`
(`id`,`quiz_id`,`type`,`prompt`,`correct_answer`,`explanation`,`position`,`created_at`,`updated_at`)
VALUES
('question:periodic-sodium','quiz:atoms-final','single','Периодтық кестеде натрий қай санатқа жатады?','Сілтілік металл','Натрий I топтағы сілтілік металл.',1,unixepoch(),unixepoch()),
('question:balanced-water','quiz:atoms-final','single','Қай теңдеу теңестірілген?','2H₂ + O₂ → 2H₂O','Екі жақта да 4 H және 2 O атомы бар.',2,unixepoch(),unixepoch()),
('question:electron-charge','quiz:atoms-final','single','Электронның заряды қандай?','Теріс','Электронның заряды −1.',3,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `achievements`
(`id`,`code`,`title`,`description`,`xp_reward`)
VALUES
('achievement:first-step','FIRST_STEP','Алғашқы қадам','Бірінші сабақты аяқта',0),
('achievement:atom-explorer','ATOM_EXPLORER','Атом зерттеушісі','Атомдар модулін аяқта',0),
('achievement:periodic-expert','PERIODIC_EXPERT','Периодтық жүйе білгірі','20 элементті зертте',0),
('achievement:reaction-master','REACTION_MASTER','Реакция шебері','10 реакцияны теңестір',0),
('achievement:lab-specialist','LAB_SPECIALIST','Зертхана маманы','3 тәжірибені аяқта',0),
('achievement:streak-seven','SEVEN_DAY_STREAK','7 күндік серия','7 күн қатарынан оқы',0);
--> statement-breakpoint
INSERT OR IGNORE INTO `chemical_reactions`
(`id`,`equation`,`balanced_equation`,`type`,`hint`,`created_at`,`updated_at`)
VALUES
('reaction:water','H₂ + O₂ → H₂O','2H₂ + O₂ → 2H₂O','Қосылу','Алдымен оттекті теңестір',unixepoch(),unixepoch()),
('reaction:salt','Na + Cl₂ → NaCl','2Na + Cl₂ → 2NaCl','Қосылу','Хлор екі атомнан тұрады',unixepoch(),unixepoch()),
('reaction:neutralization','HCl + NaOH → NaCl + H₂O','HCl + NaOH → NaCl + H₂O','Бейтараптану','Теңдеу дайын',unixepoch(),unixepoch()),
('reaction:carbonate','CaCO₃ → CaO + CO₂','CaCO₃ → CaO + CO₂','Айырылу','Кальций мен көміртекті сана',unixepoch(),unixepoch()),
('reaction:zinc','Zn + HCl → ZnCl₂ + H₂','Zn + 2HCl → ZnCl₂ + H₂','Орынбасу','Өнімде екі хлор бар',unixepoch(),unixepoch()),
('reaction:silver','AgNO₃ + NaCl → AgCl + NaNO₃','AgNO₃ + NaCl → AgCl + NaNO₃','Алмасу','Нитрат тобын бүтін сана',unixepoch(),unixepoch()),
('reaction:methane','CH₄ + O₂ → CO₂ + H₂O','CH₄ + 2O₂ → CO₂ + 2H₂O','Жану','Оттекті соңында теңестір',unixepoch(),unixepoch()),
('reaction:iron','Fe + O₂ → Fe₂O₃','4Fe + 3O₂ → 2Fe₂O₃','Тотығу','2 мен 3-тің ортақ еселігін тап',unixepoch(),unixepoch()),
('reaction:ammonia','N₂ + H₂ → NH₃','N₂ + 3H₂ → 2NH₃','Қосылу','Алдымен азотты теңестір',unixepoch(),unixepoch()),
('reaction:chlorate','KClO₃ → KCl + O₂','2KClO₃ → 2KCl + 3O₂','Айырылу','Оттекке ортақ еселік қолдан',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `laboratory_experiments`
(`id`,`title`,`description`,`safety`,`status`,`created_at`,`updated_at`)
VALUES
('experiment:neutralization','Қышқыл мен негізді бейтараптандыру','Индикатор түсінің өзгеруін бақылау','Тек виртуалды ортада орындаңыз','published',unixepoch(),unixepoch()),
('experiment:co2','Көмірқышқыл газын алу','Газ көпіршіктерінің бөлінуін бақылау','Үйде қайталамаңыз','published',unixepoch(),unixepoch()),
('experiment:precipitate','Тұнба түзілу реакциясы','Ақ AgCl тұнбасының түзілуін бақылау','Нақты реактивтерді мұғалімсіз қолданбаңыз','published',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `chemical_elements`
(`id`,`atomic_number`,`symbol`,`name_kk`,`details`,`created_at`,`updated_at`)
VALUES
('element:1',1,'H','Сутек','{"international":"Hydrogen","mass":"1.008","period":1,"group":1,"state":"газ","uses":"Отын элементтері және аммиак өндірісі","safety":"Жанғыш газ"}',unixepoch(),unixepoch()),
('element:2',2,'He','Гелий','{"international":"Helium","mass":"4.003","period":1,"group":18,"state":"газ","uses":"Криогеника және МРТ","safety":"Жабық кеңістікте оттекті ығыстырады"}',unixepoch(),unixepoch()),
('element:3',3,'Li','Литий','{"international":"Lithium","mass":"6.94","period":2,"group":1,"state":"қатты","uses":"Аккумуляторлар","safety":"Сумен белсенді әрекеттеседі"}',unixepoch(),unixepoch()),
('element:4',4,'Be','Бериллий','{"international":"Beryllium","mass":"9.012","period":2,"group":2,"state":"қатты","uses":"Аэроғарыш қорытпалары","safety":"Шаңын жұту қауіпті"}',unixepoch(),unixepoch()),
('element:5',5,'B','Бор','{"international":"Boron","mass":"10.81","period":2,"group":13,"state":"қатты","uses":"Боросиликат шыны","safety":"Қорғаныс құралдарын қолданыңыз"}',unixepoch(),unixepoch()),
('element:6',6,'C','Көміртек','{"international":"Carbon","mass":"12.011","period":2,"group":14,"state":"қатты","uses":"Болат және органикалық қосылыстар","safety":"Шаңын жұтпаңыз"}',unixepoch(),unixepoch()),
('element:7',7,'N','Азот','{"international":"Nitrogen","mass":"14.007","period":2,"group":15,"state":"газ","uses":"Тыңайтқыш өндірісі","safety":"Тұншығу қаупі бар"}',unixepoch(),unixepoch()),
('element:8',8,'O','Оттек','{"international":"Oxygen","mass":"15.999","period":2,"group":16,"state":"газ","uses":"Медицина және металлургия","safety":"Жануды күшейтеді"}',unixepoch(),unixepoch()),
('element:9',9,'F','Фтор','{"international":"Fluorine","mass":"18.998","period":2,"group":17,"state":"газ","uses":"Фторполимерлер","safety":"Өте улы және коррозиялық"}',unixepoch(),unixepoch()),
('element:10',10,'Ne','Неон','{"international":"Neon","mass":"20.180","period":2,"group":18,"state":"газ","uses":"Жарықтандыру","safety":"Оттекті ығыстырады"}',unixepoch(),unixepoch()),
('element:11',11,'Na','Натрий','{"international":"Sodium","mass":"22.990","period":3,"group":1,"state":"қатты","uses":"Химия өнеркәсібі","safety":"Сумен қатты әрекеттеседі"}',unixepoch(),unixepoch()),
('element:12',12,'Mg','Магний','{"international":"Magnesium","mass":"24.305","period":3,"group":2,"state":"қатты","uses":"Жеңіл қорытпалар","safety":"Жанып тұрғанда су қолданбаңыз"}',unixepoch(),unixepoch()),
('element:13',13,'Al','Алюминий','{"international":"Aluminium","mass":"26.982","period":3,"group":13,"state":"қатты","uses":"Құрылыс және көлік","safety":"Ұнтағы жанғыш"}',unixepoch(),unixepoch()),
('element:14',14,'Si','Кремний','{"international":"Silicon","mass":"28.085","period":3,"group":14,"state":"қатты","uses":"Микрочиптер және күн панельдері","safety":"Шаңнан қорғаныңыз"}',unixepoch(),unixepoch()),
('element:15',15,'P','Фосфор','{"international":"Phosphorus","mass":"30.974","period":3,"group":15,"state":"қатты","uses":"Тыңайтқыштар","safety":"Ақ фосфор улы"}',unixepoch(),unixepoch()),
('element:16',16,'S','Күкірт','{"international":"Sulfur","mass":"32.06","period":3,"group":16,"state":"қатты","uses":"Күкірт қышқылы","safety":"Жану өнімі тітіркендіреді"}',unixepoch(),unixepoch()),
('element:17',17,'Cl','Хлор','{"international":"Chlorine","mass":"35.45","period":3,"group":17,"state":"газ","uses":"Суды залалсыздандыру","safety":"Улы газ"}',unixepoch(),unixepoch()),
('element:18',18,'Ar','Аргон','{"international":"Argon","mass":"39.948","period":3,"group":18,"state":"газ","uses":"Дәнекерлеу","safety":"Оттекті ығыстырады"}',unixepoch(),unixepoch()),
('element:19',19,'K','Калий','{"international":"Potassium","mass":"39.098","period":4,"group":1,"state":"қатты","uses":"Тыңайтқыштар","safety":"Сумен өте белсенді"}',unixepoch(),unixepoch()),
('element:20',20,'Ca','Кальций','{"international":"Calcium","mass":"40.078","period":4,"group":2,"state":"қатты","uses":"Құрылыс және медицина","safety":"Таза металл сумен әрекеттеседі"}',unixepoch(),unixepoch());
