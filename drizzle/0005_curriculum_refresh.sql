INSERT OR IGNORE INTO `courses`
(`id`,`slug`,`title`,`description`,`status`,`created_at`,`updated_at`)
VALUES
('course:grade-7','grade-7','7-сынып химиясы','7-сынып бағдарламасы','published',unixepoch(),unixepoch()),
('course:grade-8','grade-8','8-сынып химиясы','8-сынып бағдарламасы','published',unixepoch(),unixepoch()),
('course:grade-9','grade-9','9-сынып химиясы','9-сынып бағдарламасы','published',unixepoch(),unixepoch()),
('course:grade-10','grade-10','10-сынып химиясы','10-сынып бағдарламасы','published',unixepoch(),unixepoch()),
('course:grade-11','grade-11','11-сынып химиясы','11-сынып бағдарламасы','published',unixepoch(),unixepoch()),
('course:student','student-chemistry','Студент химиясы','Жоғары оқу орнының бастапқы деңгейі','published',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `modules`
(`id`,`course_id`,`title`,`position`,`created_at`,`updated_at`)
VALUES
('module:grade-7','course:grade-7','7-сынып негіздері',1,unixepoch(),unixepoch()),
('module:grade-8','course:grade-8','8-сынып негіздері',1,unixepoch(),unixepoch()),
('module:grade-9','course:grade-9','9-сынып негіздері',1,unixepoch(),unixepoch()),
('module:grade-10','course:grade-10','10-сынып негіздері',1,unixepoch(),unixepoch()),
('module:grade-11','course:grade-11','11-сынып негіздері',1,unixepoch(),unixepoch()),
('module:student','course:student','Студенттік химия',1,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
(`id`,`module_id`,`slug`,`title`,`objective`,`status`,`position`,`xp_reward`,`created_at`,`updated_at`)
VALUES
('lesson:7-substances','module:grade-7','7-substances','Заттар және олардың қасиеттері','Дене, зат және қасиет ұғымдарын ажырату','published',1,50,unixepoch(),unixepoch()),
('lesson:7-mixtures','module:grade-7','7-mixtures','Заттар мен қоспалар','Таза зат пен қоспаны салыстыру','published',2,50,unixepoch(),unixepoch()),
('lesson:7-safety','module:grade-7','7-safety','Зертханалық қауіпсіздік','Негізгі қауіпсіздік ережелерін қолдану','published',3,50,unixepoch(),unixepoch()),
('lesson:8-periodic','module:grade-8','8-periodic','Периодтық жүйе','Период пен топтың мағынасын түсіндіру','published',2,50,unixepoch(),unixepoch()),
('lesson:8-bonding','module:grade-8','8-bonding','Химиялық байланыс','Иондық және коваленттік байланысты ажырату','published',3,50,unixepoch(),unixepoch()),
('lesson:9-acids','module:grade-9','9-acids','Қышқылдар мен негіздер','Ортаны pH арқылы ажырату','published',2,50,unixepoch(),unixepoch()),
('lesson:9-metals','module:grade-9','9-metals','Металдардың белсенділігі','Орынбасу реакцияларын болжау','published',3,50,unixepoch(),unixepoch()),
('lesson:10-rate','module:grade-10','10-rate','Реакция жылдамдығы','Реакция жылдамдығына әсер ететін факторларды түсіндіру','published',3,50,unixepoch(),unixepoch()),
('lesson:11-organic','module:grade-11','11-organic','Органикалық химия','Көмірсутектердің негізгі кластары мен ерекшеліктерін тану','published',1,50,unixepoch(),unixepoch()),
('lesson:11-equilibrium','module:grade-11','11-equilibrium','Химиялық тепе-теңдік','Жағдай өзгерісінің тепе-теңдікке әсерін болжау','published',2,50,unixepoch(),unixepoch()),
('lesson:11-electrochem','module:grade-11','11-electrochem','Электрохимия','Тотығу-тотықсыздану мен электр тогының байланысын түсіндіру','published',3,50,unixepoch(),unixepoch()),
('lesson:student-thermo','module:student','student-thermo','Термодинамиканың бірінші заңы','Энергия сақталу заңын есептерде қолдану','published',1,50,unixepoch(),unixepoch()),
('lesson:student-kinetics','module:student','student-kinetics','Химиялық кинетика','Жылдамдық теңдеуі мен реакция ретін түсіндіру','published',2,50,unixepoch(),unixepoch()),
('lesson:student-analysis','module:student','student-analysis','Аналитикалық химия','Титрлеу арқылы концентрацияны есептеу','published',3,50,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
(`id`,`lesson_id`,`title`,`pass_score`,`status`,`created_at`,`updated_at`)
VALUES
('quiz:7-substances','lesson:7-substances','Заттар және олардың қасиеттері: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:7-mixtures','lesson:7-mixtures','Заттар мен қоспалар: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:7-safety','lesson:7-safety','Зертханалық қауіпсіздік: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:atom-composition','lesson:atom-composition','Атом құрылысы: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:8-periodic','lesson:8-periodic','Периодтық жүйе: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:8-bonding','lesson:8-bonding','Химиялық байланыс: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:balancing','lesson:balancing','Химиялық реакциялар: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:9-acids','lesson:9-acids','Қышқылдар мен негіздер: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:9-metals','lesson:9-metals','Металдардың белсенділігі: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:mole','lesson:mole','Химиялық есептеулер: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:concentration','lesson:concentration','Ерітінділер: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:10-rate','lesson:10-rate','Реакция жылдамдығы: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:11-organic','lesson:11-organic','Органикалық химия: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:11-equilibrium','lesson:11-equilibrium','Химиялық тепе-теңдік: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:11-electrochem','lesson:11-electrochem','Электрохимия: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:student-thermo','lesson:student-thermo','Термодинамика: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:student-kinetics','lesson:student-kinetics','Кинетика: 3 сұрақ',67,'published',unixepoch(),unixepoch()),
('quiz:student-analysis','lesson:student-analysis','Аналитикалық химия: 3 сұрақ',67,'published',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `chemical_reactions`
(`id`,`equation`,`balanced_equation`,`type`,`hint`,`created_at`,`updated_at`)
VALUES
('reaction:magnesium','Mg + O₂ → MgO','2Mg + O₂ → 2MgO','Қосылу','Оттек екі атомнан тұрады',unixepoch(),unixepoch()),
('reaction:aluminium','Al + O₂ → Al₂O₃','4Al + 3O₂ → 2Al₂O₃','Тотығу','Оттекке ортақ еселік тап',unixepoch(),unixepoch()),
('reaction:ethane','C₂H₆ + O₂ → CO₂ + H₂O','2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O','Жану','Оттекті соңында теңестір',unixepoch(),unixepoch()),
('reaction:phosphorus','P + O₂ → P₂O₅','4P + 5O₂ → 2P₂O₅','Қосылу','Өнім алдына 2 қой',unixepoch(),unixepoch()),
('reaction:sulfur-dioxide','SO₂ + O₂ → SO₃','2SO₂ + O₂ → 2SO₃','Қосылу','Күкірттен баста',unixepoch(),unixepoch()),
('reaction:copper-oxide','CuO + H₂ → Cu + H₂O','CuO + H₂ → Cu + H₂O','Орынбасу','Теңдеу дайын',unixepoch(),unixepoch()),
('reaction:iron-hydroxide','FeCl₃ + NaOH → Fe(OH)₃ + NaCl','FeCl₃ + 3NaOH → Fe(OH)₃ + 3NaCl','Алмасу','Үш хлорға үш натрий қажет',unixepoch(),unixepoch()),
('reaction:barium-sulfate','BaCl₂ + Na₂SO₄ → BaSO₄ + NaCl','BaCl₂ + Na₂SO₄ → BaSO₄ + 2NaCl','Алмасу','Хлор мен натрийді сана',unixepoch(),unixepoch()),
('reaction:ammonia-oxidation','NH₃ + O₂ → NO + H₂O','4NH₃ + 5O₂ → 4NO + 6H₂O','Тотығу','Азот пен сутектен баста',unixepoch(),unixepoch()),
('reaction:propane','C₃H₈ + O₂ → CO₂ + H₂O','C₃H₈ + 5O₂ → 3CO₂ + 4H₂O','Жану','Көміртек пен сутектен баста',unixepoch(),unixepoch()),
('reaction:peroxide','H₂O₂ → H₂O + O₂','2H₂O₂ → 2H₂O + O₂','Айырылу','Сол жаққа 2 қой',unixepoch(),unixepoch()),
('reaction:calcium-water','Ca + H₂O → Ca(OH)₂ + H₂','Ca + 2H₂O → Ca(OH)₂ + H₂','Орынбасу','Өнімде төрт сутек бар',unixepoch(),unixepoch()),
('reaction:carbon-monoxide','CO + O₂ → CO₂','2CO + O₂ → 2CO₂','Жану','Оксидтердің алдына бірдей сан қой',unixepoch(),unixepoch()),
('reaction:permanganate','KMnO₄ → K₂MnO₄ + MnO₂ + O₂','2KMnO₄ → K₂MnO₄ + MnO₂ + O₂','Айырылу','Калийді теңестіру үшін 2 қой',unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `laboratory_experiments`
(`id`,`title`,`description`,`safety`,`status`,`created_at`,`updated_at`)
VALUES
('experiment:magnesium','Магнийдің жануы','Жарқын ақ жарық пен MgO түзілуін бақылау','Тек виртуалды ортада орындаңыз','published',unixepoch(),unixepoch()),
('experiment:peroxide','Сутек пероксидінің ыдырауы','Катализатор әсерінен оттек бөлінуін бақылау','Үйде қайталамаңыз','published',unixepoch(),unixepoch()),
('experiment:iron-hydroxide','Темір(III) гидроксиді тұнбасы','Қоңыр тұнбаның түзілуін бақылау','Нақты реактивтерді мұғалімсіз қолданбаңыз','published',unixepoch(),unixepoch()),
('experiment:copper-hydroxide','Көк мыс(II) гидроксиді','Көк тұнбаның түзілуін бақылау','Нақты реактивтерді мұғалімсіз қолданбаңыз','published',unixepoch(),unixepoch()),
('experiment:limewater','Әк суымен CO₂ анықтау','Ерітіндінің лайлануын бақылау','Тек виртуалды ортада орындаңыз','published',unixepoch(),unixepoch());
