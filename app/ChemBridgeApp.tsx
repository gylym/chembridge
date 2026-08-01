/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Atom,
  Award,
  BarChart3,
  Beaker,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  GraduationCap,
  Home,
  Eye,
  EyeOff,
  FileText,
  Languages,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Play,
  Presentation,
  NotebookPen,
  Video,
  MessageSquare,
  Download,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TestTube2,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { z } from "zod";
import { equationDifference, gradeQuiz, isEquationBalanced } from "../lib/chemistry";
import { curriculumLessons, elements, experiments, gradeLevels, reactions, type ChemicalElement, type CurriculumLesson, type GradeLevel } from "../lib/data";
import { messages } from "../messages/kk";
import { apiRequest, appPath, clearApiToken, saveApiToken, uploadMediaFile } from "../lib/api-client";

export type View =
  | "home"
  | "dashboard"
  | "world"
  | "lesson"
  | "periodic"
  | "reactions"
  | "laboratory"
  | "quizzes"
  | "videos"
  | "syllabuses"
  | "presentations"
  | "assignments"
  | "feedback"
  | "profile"
  | "teacher"
  | "admin"
  | "auth";

const navItems = [
  ["dashboard", messages.nav.dashboard, LayoutDashboard],
  ["world", messages.nav.world, GraduationCap],
  ["periodic", messages.nav.periodic, Atom],
  ["reactions", messages.nav.reactions, TestTube2],
  ["laboratory", messages.nav.laboratory, FlaskConical],
  ["quizzes", messages.nav.quizzes, ClipboardCheck],
  ["videos", "Видеосабақтар", Video],
  ["syllabuses", "Силлабустар", FileText],
  ["presentations", "Презентациялар", Presentation],
  ["assignments", "Тапсырмалар", NotebookPen],
] as const;

const APP_VIEWS: View[] = ["dashboard", "world", "lesson", "periodic", "reactions", "laboratory", "quizzes", "videos", "syllabuses", "presentations", "assignments", "feedback", "profile", "teacher", "admin"];

const categoryNames: Record<string, string> = {
  all: "Барлығы",
  alkali: "Сілтілік металдар",
  alkaline: "Сілтілік-жер",
  transition: "Ауыспалы металдар",
  "post-transition": "Басқа металдар",
  metalloid: "Металлоидтар",
  nonmetal: "Бейметалдар",
  halogen: "Галогендер",
  noble: "Инертті газдар",
  lanthanide: "Лантаноидтар",
  actinide: "Актиноидтар",
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="ChemBridge">
      <span className="brand-mark"><Atom size={22} /></span>
      {!compact && <span>Chem<span>Bridge</span></span>}
    </button>
  );
}

function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap" aria-label={label ?? `Прогресс ${value}%`}>
      <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
      {label && <small>{label}</small>}
    </div>
  );
}

type PublicCmsContent = {
  sections: Array<{ pageId: string; sectionKey: string; type: string; title: string | null; body: string | null; payload: unknown; position: number }>;
  texts: Array<{ key: string; locale: string; value: string }>;
  navigation: Array<{ menu: string; label: string; href: string; icon: string | null; position: number; requiredRole: string | null }>;
  elements: Array<{ atomicNumber: number; symbol: string; nameKk: string; details: unknown }>;
  reactions: Array<{ id: string; equation: string; balancedEquation: string; type: string; hint: string }>;
  laboratories: Array<{ id: string; title: string; description: string; safety: string; objective: string; learningOutcome: string; equipment: string; reagents: string; expectedObservation: string; equation: string; explanation: string; conclusion: string; visualEffect: string }>;
  laboratorySteps: Array<{ experimentId: string; instruction: string; position: number }>;
  videos: Array<{ id: string; title: string; slug: string; description: string; youtubeVideoId: string; author: string; level: string; topic: string; durationMinutes: number; difficulty: string; position: number }>;
  syllabuses: Array<{ id: string; title: string; description: string; level: string; academicYear: string; semester: string; language: string; author: string; pdfUrl: string; fileSizeBytes: number | null; version: string }>;
  presentations: Array<{ id: string; title: string; description: string; level: string; topic: string; author: string; fileUrl: string; fileName: string; mimeType: string; fileSizeBytes: number | null; slideCount: number | null; position: number }>;
  assignments: Array<{ id: string; title: string; description: string; instructions: string; level: string; topic: string; author: string; fileUrl: string; fileName: string; mimeType: string; fileSizeBytes: number | null; estimatedMinutes: number | null; position: number }>;
};

function HomeView({ onStart, onPeriodic, cms }: { onStart: () => void; onPeriodic: () => void; cms: PublicCmsContent | null }) {
  const hero = cms?.sections.find((section) => section.pageId === "page:home" && section.sectionKey === "hero");
  const features = cms?.sections.find((section) => section.pageId === "page:home" && section.sectionKey === "features");
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Химияны жаңаша үйрен</div>
          <h1>{hero?.title ?? <>Химияны зертте.<br />Тәжірибе жаса.<br /><span>Білімді байланыстыр.</span></>}</h1>
          <p>{hero?.body ?? "Теориядан тәжірибеге дейінгі біртұтас оқу кеңістігі. Атомдарды зерттеп, реакцияларды теңестіріп, қауіпсіз виртуалды зертханада тәжірибе жаса."}</p>
          <div className="hero-actions">
            <button className="button primary" onClick={onStart}>Оқуды бастау <ChevronRight size={18} /></button>
            <button className="button secondary" onClick={onPeriodic}>Кестені зерттеу <Atom size={18} /></button>
          </div>
          <div className="hero-proof">
            <div><strong>118</strong><span>элемент</span></div>
            <div><strong>{cms?.reactions.length ?? reactions.length}</strong><span>реакция жаттығуы</span></div>
            <div><strong>{cms?.laboratories.length ?? experiments.length}</strong><span>виртуалды тәжірибе</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="ChemBridge оқу жүйесінің көрінісі">
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <div className="atom-core"><Atom size={54} /></div>
          <div className="float-card float-a"><span className="mini-element">O<small>8</small></span><div><strong>Оттек</strong><small>Бейметалл</small></div></div>
          <div className="float-card float-b"><Award size={24} /><div><strong>+50 XP</strong><small>Сабақ аяқталды</small></div></div>
          <div className="float-card float-c"><Beaker size={24} /><div><strong>pH = 7</strong><small>Бейтарап орта</small></div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading"><span>Бір платформа. Толық тәжірибе.</span><h2>{features?.title ?? "Химияның әр бөлшегін түсін"}</h2><p>{features?.body ?? "Оқу, тәжірибе және прогресс бір-бірімен байланысқан."}</p></div>
        <div className="feature-grid">
          {[
            [BookOpen, "Құрылымды сабақтар", "Қысқа теория, формулалар және бірден бекітетін интерактив сұрақтар.", "cyan"],
            [Atom, "Периодтық кесте", "118 элементті санат, қасиет және қолданылуы бойынша зертте.", "violet"],
            [TestTube2, "Реакция конструкторы", "Коэффициенттерді өзің қойып, қадамдық hint арқылы теңестір.", "green"],
            [FlaskConical, "Мини-зертхана", "Қауіпсіз 2D тәжірибелерде түс, газ және тұнба өзгерісін бақыла.", "amber"],
          ].map(([Icon, title, text, color]) => (
            <article className="feature-card" key={String(title)}>
              <span className={`feature-icon ${color}`}><Icon size={24} /></span>
              <h3>{title as string}</h3><p>{text as string}</p>
              <button onClick={title === "Периодтық кесте" ? onPeriodic : onStart}>Зерттеу <ChevronRight size={16} /></button>
            </article>
          ))}
        </div>
      </section>

      <section className="section periodic-preview">
        <div className="preview-copy">
          <div className="eyebrow"><Atom size={15} /> Интерактивті анықтамалық</div>
          <h2>Периодтық кестені жаттама. Оның логикасын түсін.</h2>
          <p>Элементтерді санат бойынша ажырат, қасиеттерін салыстыр және күнделікті өмірдегі қолданылуын тап.</p>
          <button className="text-link" onClick={onPeriodic}>Барлық 118 элементті ашу <ChevronRight size={17} /></button>
        </div>
        <div className="mini-table">
          {elements.slice(0, 20).map((element) => (
            <button className={`element category-${element.category}`} key={element.number} onClick={onPeriodic}>
              <small>{element.number}</small><strong>{element.symbol}</strong><span>{element.name}</span>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}

function levelForUser(level: string): GradeLevel {
  return gradeLevels.includes(level as GradeLevel) ? level as GradeLevel : "10-сынып";
}

function DashboardView({ go, actor, openLesson, lessons, completedIds }: { go: (view: View) => void; actor: SessionUser | null; openLesson: (lessonId: string) => void; lessons: CurriculumLesson[]; completedIds: Set<string> }) {
  const level = levelForUser(actor?.level ?? "10-сынып");
  const levelLessons = lessons.filter((lesson) => lesson.grade === level);
  const recommended = levelLessons.find((lesson) => !completedIds.has(lesson.id)) ?? levelLessons[0] ?? lessons[0];
  const firstName = actor?.name.trim().split(/\s+/)[0] || "оқушы";
  const xp = actor?.xp ?? 0;
  const currentLevel = Math.max(1, Math.floor(xp / 500) + 1);
  return (
    <div className="page-shell">
      <div className="page-title"><div><span>{level} · Жеке оқу жоспары</span><h1>Қайырлы күн, {firstName}!</h1><p>Бүгінгі ұсыныс: «{recommended.title}». Алдымен сабақты оқып, соңынан 3 сұраққа жауап бер.</p></div><button className="button primary" onClick={() => openLesson(recommended.id)}>Ұсынылған сабақты ашу <Play size={17} /></button></div>
      <section className="dashboard-guide" aria-label="Оқу реті">
        <div><span>1</span><strong>Сыныбыңды тексер</strong><small>{level}</small></div>
        <ChevronRight />
        <div><span>2</span><strong>Сабақты оқы</strong><small>10–12 минут</small></div>
        <ChevronRight />
        <div><span>3</span><strong>3 сұрақты орында</strong><small>Нәтиже бірден шығады</small></div>
      </section>
      <div className="stat-grid">
        <article><span className="stat-icon cyan"><Zap /></span><div><small>Жалпы XP</small><strong>{xp}</strong><em>Сабақ пен тесттен жиналады</em></div></article>
        <article><span className="stat-icon violet"><Gauge /></span><div><small>Деңгей</small><strong>{currentLevel}</strong><em>{500 - xp % 500} XP келесі деңгейге</em></div></article>
        <article><span className="stat-icon green"><Target /></span><div><small>Сенің прогресің</small><strong>{levelLessons.filter((lesson) => completedIds.has(lesson.id)).length}/{levelLessons.length} сабақ</strong><em>{level}</em></div></article>
        <article><span className="stat-icon amber"><Sparkles /></span><div><small>Келесі әрекет</small><strong>1 сабақ</strong><em>Оқуды дәл қазір баста</em></div></article>
      </div>
      <div className="dashboard-grid">
        <section className="panel continue-card">
          <div className="panel-head"><div><span>Саған ұсынылады</span><h2>{recommended.title}</h2></div><span className="course-tag">{recommended.unit}</span></div>
          <div className="lesson-visual"><div className="nucleus"><span /><span /><span /></div><div className="electron-ring ring-a" /><div className="electron-ring ring-b" /></div>
          <div className="lesson-progress"><div><strong>{recommended.minutes} минут</strong><span>Соңында 3 сұрақ</span></div><Progress value={completedIds.has(recommended.id) ? 100 : 0} label={completedIds.has(recommended.id) ? "Аяқталған" : "Келесі әрекет"} /></div>
          <button className="button primary wide" onClick={() => openLesson(recommended.id)}>Сабақты бастау <ChevronRight size={17} /></button>
        </section>
        <section className="panel daily-card">
          <div className="panel-head"><div><span>Ұсынылған жаттығу</span><h2>Реакцияны теңестір</h2></div></div>
          <div className="equation">H₂ + O₂ <span>→</span> H₂O</div>
          <p>Сутек пен оттектің жану реакциясына дұрыс коэффициенттерді қой.</p>
          <button className="button secondary wide" onClick={() => go("reactions")}>Тапсырманы орындау</button>
        </section>
        <section className="panel quick-actions-card">
          <div className="panel-head"><div><span>Жылдам өту</span><h2>Қайда барғың келеді?</h2></div></div>
          <button onClick={() => go("world")}><BookOpen /><span><strong>Сабақтар каталогы</strong><small>Сынып пен тақырыпты таңда</small></span><ChevronRight /></button>
          <button onClick={() => go("quizzes")}><ClipboardCheck /><span><strong>Тесттер</strong><small>Деңгей бойынша 3 сұрақ</small></span><ChevronRight /></button>
          <button onClick={() => go("periodic")}><Atom /><span><strong>Периодтық кесте</strong><small>Элементті тауып, карточкасын аш</small></span><ChevronRight /></button>
        </section>
      </div>
    </div>
  );
}

function WorldView({ actor, openLesson, lessons, completedIds }: { actor: SessionUser | null; openLesson: (lessonId: string) => void; lessons: CurriculumLesson[]; completedIds: Set<string> }) {
  const [grade, setGrade] = useState<GradeLevel>(levelForUser(actor?.level ?? "10-сынып"));
  const [unit, setUnit] = useState("Барлық тақырып");
  const available = lessons.filter((lesson) => lesson.grade === grade);
  const units = ["Барлық тақырып", ...Array.from(new Set(available.map((lesson) => lesson.unit)))];
  const visible = available.filter((lesson) => unit === "Барлық тақырып" || lesson.unit === unit);
  return (
    <div className="page-shell">
      <div className="page-title"><div><span>Сынып бойынша бағдарлама</span><h1>Химия сабақтары</h1><p>Алдымен сыныпты, кейін тақырыпты таңда. Әр сабақ қысқа теориядан, мысалдан және 3 сұрақтан тұрады.</p></div><div className="world-score"><BookOpen size={20} /><span>Таңдалған деңгей</span><strong>{grade}</strong></div></div>
      <section className="catalog-filters" aria-label="Сабақтарды сүзу">
        <label>Сынып немесе деңгей<select value={grade} onChange={(e) => { setGrade(e.target.value as GradeLevel); setUnit("Барлық тақырып"); }}>{gradeLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Тақырып<select value={unit} onChange={(e) => setUnit(e.target.value)}>{units.map((item) => <option key={item}>{item}</option>)}</select></label>
        <div><strong>{visible.length} сабақ табылды</strong><span>Әр сабақ: шамамен 10 минут + 3 сұрақ</span></div>
      </section>
      <div className="lesson-catalog">
        {visible.map((lesson, index) => (
          <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="lesson-catalog-card" key={lesson.id}>
            <span className="catalog-number">{String(index + 1).padStart(2, "0")}</span>
            <div><span>{completedIds.has(lesson.id) ? "Аяқталған" : lesson.unit}</span><h2>{lesson.title}</h2><p>{lesson.objective}</p><div className="catalog-meta"><span><BookOpen /> {lesson.minutes} минут</span><span><ClipboardCheck /> 3 сұрақ</span><span><Zap /> +{lesson.xp} XP</span></div></div>
            <button className="button secondary" onClick={() => openLesson(lesson.id)}>{completedIds.has(lesson.id) ? "Қайталау" : "Сабақты ашу"} <ChevronRight /></button>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function LessonAttachments({ lesson, blockType }: { lesson: CurriculumLesson; blockType: string }) {
  const items = lesson.attachments?.filter((item) => item.blockType === blockType) ?? [];
  if (!items.length) return null;
  return <div className="lesson-attachments">{items.map((item) => item.mimeType.startsWith("image/")
    ? <figure key={item.id}><img src={item.url} alt={item.altText} /><figcaption>{item.title}</figcaption></figure>
    : <a key={item.id} href={item.url} target="_blank" rel="noreferrer"><FileText /><span><strong>{item.title}</strong><small>PDF құжатын ашу</small></span><Download /></a>)}</div>;
}

function LessonView({ go, lesson, onCompleted }: { go: (view: View) => void; lesson: CurriculumLesson; onCompleted: (lessonId: string) => void }) {
  const [answers, setAnswers] = useState<Array<number | null>>(() => lesson.quiz.map(() => null));
  const [completed, setCompleted] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  async function completeLesson() {
    const allCorrect = lesson.quiz.every((question, index) => answers[index] === question.answer);
    if (!allCorrect) {
      setSaveMessage("Сабақты аяқтау үшін төмендегі 3 сұраққа да дұрыс жауап беріңіз.");
      document.querySelector(".lesson-question")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setCompleted(true);
    try {
      const saved = await apiRequest<{ awardedXp: number }>("/api/progress", {
        method: "POST",
        body: JSON.stringify({ lessonId: lesson.id, percent: 100, answers }),
      });
      onCompleted(lesson.id);
      setSaveMessage(saved.awardedXp ? `Прогресс сақталды · +${saved.awardedXp} XP` : "Прогресс сақталды");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Прогресс сақталмады");
    }
  }
  return (
    <div className="lesson-page page-shell">
      <button className="back-link" onClick={() => go("world")}><ChevronLeft size={17} /> Сабақтар каталогына қайту</button>
      <div className="lesson-layout">
        <article className="lesson-content">
          <div className="lesson-kicker"><span>{lesson.grade}</span><span>{lesson.minutes} минут</span><span>+{lesson.xp} XP</span></div>
          <h1>{lesson.title}</h1>
          <div className="objective"><Target size={22} /><div><strong>Оқу мақсаты</strong><p>{lesson.objective}</p></div></div>
          <h2>Қарапайым түсіндірме</h2>
          {lesson.theory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <LessonAttachments lesson={lesson} blockType="theory" />
          {lesson.formula && <div className="formula">{lesson.formula}</div>}
          <LessonAttachments lesson={lesson} blockType="formula" />
          <h2>Мысал</h2>
          <p>{lesson.example}</p>
          <LessonAttachments lesson={lesson} blockType="example" />
          <div className="remember"><Sparkles size={22} /><div><strong>Есте сақта</strong><p>{lesson.remember}</p></div></div>
          <LessonAttachments lesson={lesson} blockType="remember" />
          <section className="lesson-question">
            <span>Сабақ соңындағы 3 сұрақтық тексеру</span>
            {lesson.quiz.map((question, questionIndex) => <div className="lesson-mini-question" key={question.question}>
              <h2>{questionIndex + 1}. {question.question}</h2>
              <div className="answer-grid">
                {question.options.map((answer, index) => <button className={answers[questionIndex] === index ? (index === question.answer ? "correct" : "wrong") : ""} onClick={() => { setAnswers((current) => current.map((value, i) => i === questionIndex ? index : value)); setSaveMessage(""); }} key={answer}>{answer}{answers[questionIndex] === index && (index === question.answer ? <Check /> : <X />)}</button>)}
              </div>
              {answers[questionIndex] !== null && <p className={answers[questionIndex] === question.answer ? "feedback success" : "feedback error"}>{answers[questionIndex] === question.answer ? `Дұрыс! ${question.explanation}` : `Қайта ойланып көр. ${question.explanation}`}</p>}
            </div>)}
          </section>
          <button className="button primary wide finish-button" onClick={completeLesson}>{completed ? <><Check /> Сабақ аяқталды · +{lesson.xp} XP</> : <>Сабақты аяқтау <ChevronRight size={18} /></>}</button>
          {saveMessage && <p className="save-message" role="status">{saveMessage}</p>}
          <button className="button secondary wide lesson-test-link" onClick={() => go("quizzes")}>Осы деңгейдің 3 сұрақтық тестіне өту <ClipboardCheck /></button>
        </article>
        <aside className="lesson-sidebar">
          <span>Сабақ қалай өтеді?</span><Progress value={completed ? 100 : answers.every((answer) => answer !== null) ? 85 : 55} label={completed ? "Сақталды" : "Оқу барысы"} />
          <h3>{lesson.unit}</h3>
          {["Мақсатты оқы", "Теорияны түсін", "Мысалды қара", "3 сұраққа жауап бер", "Сабақты аяқта"].map((item, i) => <div className={completed || i < (answers.every((answer) => answer !== null) ? 4 : 3) ? "done lesson-step" : "lesson-step"} key={item}><span>{completed || i < (answers.every((answer) => answer !== null) ? 4 : 3) ? <Check /> : i + 1}</span>{item}</div>)}
        </aside>
      </div>
    </div>
  );
}

function PeriodicView({ items = elements }: { items?: readonly ChemicalElement[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [selected, setSelected] = useState<ChemicalElement | null>(null);
  const filtered = useMemo(() => items.filter((element) => (category === "all" || element.category === category) && (period === "all" || element.period === Number(period)) && (stateFilter === "all" || element.state === stateFilter) && `${element.name} ${element.international} ${element.symbol} ${element.number}`.toLowerCase().includes(query.toLowerCase())), [category, period, stateFilter, query, items]);
  return (
    <div className="page-shell">
      <div className="page-title"><div><span>Интерактивті анықтамалық</span><h1>Периодтық кесте</h1><p>118 элементті қасиеті, санаты және қолданылуы бойынша зертте.</p></div><div className="table-count"><Atom /><strong>{filtered.length}</strong><span>элемент көрсетілді</span></div></div>
      <section className="periodic-guide" aria-label="Периодтық кестені қолдану жолы">
        <div><span>1</span><p><strong>Элементті тап</strong> Атауын, таңбасын немесе нөмірін жаз.</p></div>
        <div><span>2</span><p><strong>Түсті түсін</strong> Бір түстегі элементтер бір санатқа жатады.</p></div>
        <div><span>3</span><p><strong>Карточканы аш</strong> Элементті басып, қасиеті мен қауіпсіздігін оқы.</p></div>
      </section>
      <div className="filter-bar">
        <label className="search-field"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Мысалы: Оттек, O немесе 8" aria-label="Элементті іздеу" /></label>
        <label><span className="sr-only">Санат</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{Object.entries(categoryNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">Период</span><select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="all">Барлық период</option>{[1, 2, 3, 4, 5, 6, 7].map((value) => <option value={value} key={value}>{value}-период</option>)}</select></label>
        <label><span className="sr-only">Агрегаттық күй</span><select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}><option value="all">Барлық күй</option>{Array.from(new Set(items.map((item) => item.state))).map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="category-legend"><button className={category === "all" ? "active" : ""} onClick={() => { setCategory("all"); setQuery(""); }}>Барлығын көрсету</button>{Object.entries(categoryNames).slice(1).map(([key, value]) => <button className={category === key ? "active" : ""} onClick={() => setCategory(key)} key={key}><span className={`dot category-${key}`} />{value}</button>)}</div>
      <p className="periodic-hint"><Atom /> Карточканы ашу үшін кез келген элементті басыңыз. Мысалы, <button onClick={() => setSelected(items[7])}>Оттекті ашу</button>.</p>
      {filtered.length ? <div className="periodic-grid">{filtered.map((element) => <button onClick={() => setSelected(element)} className={`periodic-element category-${element.category}`} key={element.number}><small>{element.number}</small><strong>{element.symbol}</strong><span>{element.name}</span><em>{element.mass}</em></button>)}</div> : <div className="empty-state"><Search size={32} /><h2>Элемент табылмады</h2><p>Іздеу сөзін немесе санатты өзгертіп көр.</p></div>}
      <AnimatePresence>{selected && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setSelected(null)}><motion.div role="dialog" aria-modal="true" aria-label={`${selected.name} элементі`} className="element-modal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Жабу"><X /></button>
        <div className="element-hero"><div className={`big-element category-${selected.category}`}><small>{selected.number}</small><strong>{selected.symbol}</strong><span>{selected.mass}</span></div><div><span>{categoryNames[selected.category]}</span><h2>{selected.name}</h2><p>{selected.international}</p></div></div>
        <div className="element-facts"><div><span>Атомдық нөмірі</span><strong>{selected.number}</strong></div><div><span>Период / Топ</span><strong>{selected.period} / {selected.group ?? "—"}</strong></div><div><span>Агрегаттық күйі</span><strong>{selected.state}</strong></div><div><span>Электрондық конфигурация</span><strong>{selected.config}</strong></div></div>
        <div className="detail-section"><h3>Тарихы</h3><p>{selected.history}</p><h3>Қолданылуы</h3><p>{selected.uses}</p><h3><ShieldCheck size={17} /> Қауіпсіздік</h3><p>{selected.safety}</p></div>
        <div className="reaction-example"><span>Реакция мысалы</span><strong>{selected.symbol === "O" ? "2H₂ + O₂ → 2H₂O" : `${selected.symbol} + O₂ → ${selected.symbol}O`}</strong></div>
      </motion.div></motion.div>}</AnimatePresence>
    </div>
  );
}

type ReactionItem = { raw: string; balanced: string; type: string; hint: string };

function ReactionView({ items = reactions }: { items?: readonly ReactionItem[] }) {
  const [selected, setSelected] = useState(0);
  const [typeFilter, setTypeFilter] = useState("Барлығы");
  const [equation, setEquation] = useState(items[0].raw);
  const [result, setResult] = useState<"idle" | "correct" | "wrong" | "error">("idle");
  const [hintLevel, setHintLevel] = useState(0);
  const reaction = items[selected] ?? items[0];
  const reactionTypes = ["Барлығы", ...Array.from(new Set(items.map((item) => item.type)))];
  const visibleReactions = items.map((item, index) => ({ item, index })).filter(({ item }) => typeFilter === "Барлығы" || item.type === typeFilter);
  function choose(index: number) { setSelected(index); setEquation(items[index].raw); setResult("idle"); setHintLevel(0); }
  function check() {
    try { setResult(isEquationBalanced(equation) ? "correct" : "wrong"); } catch { setResult("error"); }
  }
  let differences: ReturnType<typeof equationDifference> = [];
  if (result === "wrong") { try { differences = equationDifference(equation); } catch { differences = []; } }
  return (
    <div className="page-shell">
      <div className="page-title"><div><span>{items.length} жаттығуы бар интерактивті құрал</span><h1>Реакция конструкторы</h1><p>Реакцияны таңда, формула алдына коэффициент қой, кейін екі жақтағы атомдарды тексер.</p></div><span className="safety-chip"><ShieldCheck size={17} /> Қауіпсіз оқу ортасы</span></div>
      <section className="reaction-guide"><div><span>1</span><strong>Реакцияны таңда</strong></div><ChevronRight /><div><span>2</span><strong>Коэффициентті өзгерт</strong></div><ChevronRight /><div><span>3</span><strong>«Тексеру» батырмасын бас</strong></div></section>
      <div className="reaction-layout">
        <aside className="reaction-list"><div className="reaction-list-head"><div><h2>Реакциялар банкі</h2><small>{visibleReactions.length} тапсырма</small></div><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Реакция түрі">{reactionTypes.map((type) => <option key={type}>{type}</option>)}</select></div>{visibleReactions.map(({ item, index }) => <button className={selected === index ? "active" : ""} onClick={() => choose(index)} key={item.raw}><span>{index + 1}</span><div><strong>{item.raw}</strong><small>{item.type}</small></div><ChevronRight /></button>)}</aside>
        <section className="reaction-workbench">
          <div className="workbench-top"><div><span>Таңдалған реакция</span><h2>{reaction.type} реакциясы</h2></div><span className="difficulty">Орташа</span></div>
          <label className="equation-input"><span>Реакция теңдеуі</span><input value={equation} onChange={(e) => { setEquation(e.target.value); setResult("idle"); }} aria-describedby="formula-help" /><small id="formula-help">Мысал: 2H₂ + O₂ → 2H₂O. Коэффициентті формуланың алдына жаз.</small></label>
          <div className="coefficient-note"><strong>Маңызды:</strong> H₂ ішіндегі кішкентай ₂ индексін өзгертпеңіз. Тек формула алдына 2H₂ сияқты коэффициент қойыңыз.</div>
          <div className="atom-balance">
            <h3>Атомдар теңгерімі</h3>
            {result === "wrong" && differences.length > 0 ? differences.map((diff) => <div key={diff.element}><strong>{diff.element}</strong><span>{diff.left} сол жақта</span><div className="balance-line"><i style={{ width: `${Math.min(100, diff.left * 25)}%` }} /><i style={{ width: `${Math.min(100, diff.right * 25)}%` }} /></div><span>{diff.right} оң жақта</span></div>) : <div className="balance-placeholder"><Atom size={30} /><p>«Тексеру» батырмасын басқанда атомдар саны салыстырылады.</p></div>}
          </div>
          {result !== "idle" && <div className={`reaction-feedback ${result}`}>
            {result === "correct" ? <><Check /><div><strong>Теңдеу теңестірілген!</strong><p>{reaction.balanced} · {reaction.type}. Барлық элемент атомдарының саны екі жақта да тең.</p></div></> : result === "wrong" ? <><X /><div><strong>Әзірге тең емес</strong><p>Қызыл көрсеткіштердегі атом сандарын салыстыр. Дұрыс жауап әлі көрсетілмейді.</p></div></> : <><X /><div><strong>Формула танылмады</strong><p>Элемент таңбаларын бас әріптен жазып, реагенттерді + арқылы бөліңіз.</p></div></>}
          </div>}
          {hintLevel > 0 && <div className="hint-box"><Sparkles size={19} /><div><strong>Hint {hintLevel}/2</strong><p>{hintLevel === 1 ? reaction.hint : `Дұрыс коэффициенттер үлгісі: ${reaction.balanced.replace(/\d/g, "□")}`}</p></div></div>}
          <div className="workbench-actions"><button className="button secondary" onClick={() => setHintLevel((v) => Math.min(2, v + 1))}><Sparkles size={17} /> Hint алу</button><button className="button primary" onClick={check}><Check size={17} /> Тексеру</button></div>
        </section>
      </div>
    </div>
  );
}

type ExperimentItem = { id?: string; title: string; reagents: readonly string[]; color: string; result: string; equation: string; objective?: string; learningOutcome?: string; equipment?: readonly string[]; safety?: string; explanation?: string; conclusion?: string; visualEffect?: string; steps?: readonly string[] };

function LaboratoryView({ items = experiments }: { items?: readonly ExperimentItem[] }) {
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState(0);
  const experiment = items[selected] ?? items[0];
  const steps = experiment.steps?.length ? [...experiment.steps] : ["Қауіпсіздік нұсқаулығын оқы", "Бірінші реактивті ыдысқа қос", "Екінші реактивті абайлап қос", "Өзгерісті бақыла және қорытынды жаса"];
  const advance = async () => {
    const next = Math.min(steps.length, step + 1);
    setStep(next);
    if (experiment.id) {
      await apiRequest("/api/laboratory/progress", { method: "POST", body: JSON.stringify({ experimentId: experiment.id, currentStep: next }) }).catch(() => undefined);
    }
  };
  return (
    <div className="page-shell">
      <div className="page-title"><div><span>{items.length} қауіпсіз симуляция</span><h1>Мини-зертхана</h1><p>Тәжірибені таңда да, оң жақтағы қадамдарды ретімен орында. Соңында реакция белгісі мен теңдеуін көресің.</p></div><span className="safety-chip"><ShieldCheck size={17} /> Үйде қайталамаңыз</span></div>
      <section className="lab-guide"><div><span>1</span><strong>Тәжірибені таңда</strong></div><div><span>2</span><strong>Қауіпсіздікті оқы</strong></div><div><span>3</span><strong>4 қадамды орында</strong></div><div><span>4</span><strong>Нәтижені түсін</strong></div></section>
      <div className="experiment-tabs">{items.map((item, i) => <button className={selected === i ? "active" : ""} onClick={() => { setSelected(i); setStep(0); }} key={item.title}><FlaskConical />{item.title}</button>)}</div>
      <section className="lab-brief panel"><div><span>Тәжірибенің мақсаты</span><h2>{experiment.objective ?? experiment.result}</h2></div><div><span>Нені үйренеміз?</span><p>{experiment.learningOutcome ?? "Реакция белгісін бақылап, теңдеумен түсіндіреміз."}</p></div><div><span>Қажетті құралдар</span><p>{experiment.equipment?.join(" · ") ?? "Пробирка · тамшуыр · қорғаныш көзілдірігі"}</p></div><div><span>Қауіпсіздік</span><p>{experiment.safety ?? "Бұл виртуалды тәжірибе. Нақты реактивтерді мұғалімсіз қолданба."}</p></div></section>
      <div className="lab-layout">
        <aside className="lab-shelf"><h2>Реактив сөресі</h2>{experiment.reagents.map((reagent, i) => <button className={step > i + 1 ? "used" : ""} disabled={step === 0 || step >= steps.length} key={reagent} onClick={() => void advance()}><span className={`bottle bottle-${i}`}><i /></span><strong>{reagent}</strong><small>{i === 2 ? "Индикатор" : "Виртуалды реактив"}</small></button>)}<div className="safety-note"><ShieldCheck /><p><strong>Қауіпсіздік</strong> {experiment.safety ?? "Бұл — тек виртуалды симуляция. Нақты реактивтерді мұғалімсіз қолданба."}</p></div></aside>
        <section className="lab-bench">
          <div className="bench-grid" />
          <div className={`flask-scene step-${step}`}>
            <div className="gas-bubbles">{[0, 1, 2, 3, 4].map((i) => <i key={i} style={{ left: `${25 + i * 12}%`, animationDelay: `${i * 0.25}s` }} />)}</div>
            <div className="lab-flask"><div className="liquid" style={{ background: step >= 3 ? experiment.color : "#1e9db5" }}><span /></div></div>
            <div className="dropper"><span /></div>
          </div>
          <div className="bench-label"><strong>{step === 0 ? "Тәжірибені бастауға дайын" : step < steps.length ? `Қадам ${step}: ${steps[step - 1]}` : "Реакция аяқталды"}</strong><span>{step >= Math.max(2, steps.length - 1) ? `${experiment.visualEffect === "gas" ? "Газ бөлінді: " : experiment.visualEffect === "precipitate" ? "Тұнба түзілді: " : "Өзгеріс байқалды: "}${experiment.result}` : "Қазір көрсетілген бір әрекетті ғана орында."}</span></div>
        </section>
        <aside className="lab-steps"><h2>Тәжірибе қадамдары</h2><p className="lab-step-help">Келесі қадам алдыңғы әрекет аяқталғанда ашылады.</p>{steps.map((item, i) => <button disabled={i > step} onClick={() => i <= step && setStep(i + 1)} className={step > i ? "done" : step === i ? "current" : ""} key={item}><span>{step > i ? <Check /> : i + 1}</span><p>{item}</p></button>)}{step >= steps.length && <div className="lab-result"><Award /><strong>Бақылау нәтижесі</strong><p>{experiment.result}</p><span>{experiment.equation}</span><strong>Түсіндірме</strong><p>{experiment.explanation ?? "Жаңа заттар түзілгендіктен реакция белгісі байқалды."}</p><strong>Қорытынды</strong><p>{experiment.conclusion ?? "Бақыланған өзгеріс химиялық реакция жүргенін дәлелдейді."}</p></div>}{step >= steps.length ? <button className="button secondary wide" onClick={() => setStep(0)}>Қайта бастау</button> : <button className="button primary wide" onClick={() => void advance()}>{step === 0 ? "Тәжірибені бастау" : "Келесі қадам"} <ChevronRight size={17} /></button>}</aside>
      </div>
    </div>
  );
}

function QuizView({ actor, lessons }: { actor: SessionUser | null; lessons: CurriculumLesson[] }) {
  const [grade, setGrade] = useState<GradeLevel>(levelForUser(actor?.level ?? "10-сынып"));
  const lessonsForGrade = lessons.filter((lesson) => lesson.grade === grade);
  const [lessonId, setLessonId] = useState(lessonsForGrade[0]?.id ?? lessons[0].id);
  const selectedLesson = lessons.find((lesson) => lesson.id === lessonId && lesson.grade === grade) ?? lessonsForGrade[0] ?? lessons[0];
  const questions = selectedLesson.quiz;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [serverXp, setServerXp] = useState<number | null>(null);
  const result = gradeQuiz(Object.entries(answers).filter(([key, value]) => questions[Number(key)].answer === value).length, questions.length);
  function resetQuiz(nextGrade?: GradeLevel, nextLessonId?: string) {
    const resolvedGrade = nextGrade ?? grade;
    const fallback = lessons.find((item) => item.grade === resolvedGrade)?.id ?? lessons[0].id;
    setLessonId(nextLessonId ?? fallback);
    setAnswers({});
    setCurrent(0);
    setFinished(false);
    setServerXp(null);
  }
  async function submitQuiz() {
    try {
      const saved = await apiRequest<{ xp: number }>("/api/quizzes/attempts", {
        method: "POST",
        body: JSON.stringify({
          quizId: `quiz:${selectedLesson.id.replace("lesson:", "")}`,
          answers: questions.map((question, index) => ({
            questionId: `${selectedLesson.id}:q${index + 1}`,
            answer: question.options[answers[index] ?? -1] ?? "",
          })),
        }),
      });
      setServerXp(saved.xp);
    } catch {
      setServerXp(result.xp);
    }
    setFinished(true);
  }
  if (finished) return <div className="page-shell quiz-result"><span className="result-ring">{result.score}<small>%</small></span><h1>{result.passed ? "Керемет нәтиже!" : "Тақырыпты тағы бір қарап шық"}</h1><p>«{selectedLesson.title}» тестінде {questions.length} сұрақтың {Math.round(result.score / 100 * questions.length)}-іне дұрыс жауап бердің.</p><div className="quiz-review">{questions.map((question, index) => <article className={answers[index] === question.answer ? "correct" : "wrong"} key={question.question}><span>{answers[index] === question.answer ? <Check /> : <X />}</span><div><strong>{question.question}</strong><p>Дұрыс жауап: {question.options[question.answer]}. {question.explanation}</p></div></article>)}</div><div className="result-stats"><div><Zap /><strong>+{serverXp ?? result.xp} XP</strong><span>Жиналды</span></div><div><Trophy /><strong>{result.passed ? "Өтті" : "Қайталау"}</strong><span>Нәтиже</span></div></div><button className="button primary" onClick={() => resetQuiz()}>Қайта тапсыру</button></div>;
  const q = questions[current];
  return (
    <div className="page-shell quiz-shell">
      <div className="page-title"><div><span>Деңгей бойынша тесттер</span><h1>Қысқа білім тексеру</h1><p>Сыныпты және тақырыпты таңда. Әр тестте түсіндірмесі бар 3 сұрақ.</p></div></div>
      <div className="quiz-filters"><label>Сынып<select value={grade} onChange={(e) => { const next = e.target.value as GradeLevel; setGrade(next); resetQuiz(next); }}>{gradeLevels.map((item) => <option key={item}>{item}</option>)}</select></label><label>Тақырып<select value={selectedLesson.id} onChange={(e) => resetQuiz(undefined, e.target.value)}>{lessonsForGrade.map((lesson) => <option value={lesson.id} key={lesson.id}>{lesson.title}</option>)}</select></label></div>
      <div className="quiz-top"><div><span>{grade} · {selectedLesson.unit}</span><h2>{selectedLesson.title}</h2></div><strong>{current + 1} / {questions.length}</strong></div>
      <Progress value={(current + 1) / questions.length * 100} />
      <div className="quiz-card"><span className="question-type">Бір дұрыс жауап</span><h2>{q.question}</h2><div className="quiz-options">{q.options.map((option, i) => <button className={answers[current] === i ? "selected" : ""} onClick={() => setAnswers({ ...answers, [current]: i })} key={option}><span>{String.fromCharCode(65 + i)}</span>{option}{answers[current] === i && <Check />}</button>)}</div></div>
      <div className="quiz-nav"><button className="button secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}><ChevronLeft /> Алдыңғы</button>{current < questions.length - 1 ? <button className="button primary" disabled={answers[current] === undefined} onClick={() => setCurrent(current + 1)}>Келесі <ChevronRight /></button> : <button className="button primary" disabled={Object.keys(answers).length !== questions.length} onClick={submitQuiz}>Тестті аяқтау <Check /></button>}</div>
    </div>
  );
}

function VideoLessonsView({ items, actor }: { items: PublicCmsContent["videos"]; actor: SessionUser | null }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(actor?.level ?? "Барлығы");
  const [selected, setSelected] = useState<PublicCmsContent["videos"][number] | null>(null);
  const visible = items.filter((item) => (level === "Барлығы" || item.level === level) && `${item.title} ${item.topic} ${item.author}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-shell"><div className="page-title"><div><span>Қауіпсіз YouTube сабақтары</span><h1>Видеосабақтар</h1><p>Деңгейіңді таңдап, тақырыпты қысқа видеомен қайтала. Видео автоматты түрде қосылмайды.</p></div><span className="role-chip"><Video /> {visible.length} видео</span></div><div className="filter-bar"><label className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Видео немесе тақырып іздеу" /></label><label><span className="sr-only">Деңгей</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Барлығы</option>{gradeLevels.map((item) => <option key={item}>{item}</option>)}</select></label></div>{visible.length ? <div className="video-grid">{visible.map((item) => <article className="panel video-card" key={item.id}><button className="video-preview" onClick={() => setSelected(item)} aria-label={`${item.title} видеосын ашу`}><img src={`https://i.ytimg.com/vi/${item.youtubeVideoId}/hqdefault.jpg`} alt="" loading="lazy" /><span><Play /></span></button><div><span>{item.level} · {item.durationMinutes} минут</span><h2>{item.title}</h2><p>{item.description}</p><small>{item.topic} · {item.author}</small><button className="button primary wide" onClick={() => setSelected(item)}>Видеоны көру <Play /></button></div></article>)}</div> : <div className="empty-state"><Video /><h2>Видео табылмады</h2><p>Іздеу сөзін немесе деңгейді өзгертіп көр.</p></div>}{selected && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}><div className="video-modal" role="dialog" aria-modal="true" aria-label={selected.title} onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Жабу"><X /></button><h2>{selected.title}</h2><p>{selected.description}</p><div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${selected.youtubeVideoId}`} title={selected.title} allow="accelerometer; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div></div></div>}</div>;
}

function SyllabusView({ items, actor }: { items: PublicCmsContent["syllabuses"]; actor: SessionUser | null }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(actor?.level ?? "Барлығы");
  const visible = items.filter((item) => (level === "Барлығы" || item.level === level) && `${item.title} ${item.author} ${item.academicYear}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-shell"><div className="page-title"><div><span>Оқу құжаттары</span><h1>Силлабустар</h1><p>Пән бағдарламасын деңгей және оқу жылы бойынша тауып, қауіпсіз PDF ретінде аш.</p></div><span className="role-chip"><FileText /> {visible.length} құжат</span></div><div className="filter-bar"><label className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Силлабус іздеу" /></label><label><span className="sr-only">Деңгей</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Барлығы</option>{gradeLevels.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="syllabus-list">{visible.map((item) => <article className="panel syllabus-card" key={item.id}><span className="syllabus-icon"><FileText /></span><div><span>{item.level} · {item.academicYear} · {item.semester}</span><h2>{item.title}</h2><p>{item.description}</p><small>{item.author} · {item.language} · v{item.version}</small></div><div><a className="button secondary" href={item.pdfUrl} target="_blank" rel="noreferrer">Алдын ала көру</a><a className="button primary" href={item.pdfUrl} download>Жүктеу <Download /></a></div></article>)}</div>{!visible.length && <div className="empty-state"><FileText /><h2>Силлабус табылмады</h2><p>Әзірге осы сүзгіге сай жарияланған құжат жоқ.</p></div>}</div>;
}

type LearningResource = {
  id: string; title: string; description: string; level: string; topic: string; author: string;
  fileUrl: string; fileName: string; fileSizeBytes: number | null; position: number;
  instructions?: string; slideCount?: number | null; estimatedMinutes?: number | null;
};

function LearningResourcesView({ kind, items, actor }: { kind: "presentations" | "assignments"; items: LearningResource[]; actor: SessionUser | null }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState(actor?.level ?? "Барлығы");
  const isPresentation = kind === "presentations";
  const Icon = isPresentation ? Presentation : NotebookPen;
  const visible = items.filter((item) => (level === "Барлығы" || item.level === level) && `${item.title} ${item.topic} ${item.author}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-shell"><div className="page-title"><div><span>{isPresentation ? "Сабаққа дайын слайдтар" : "Жүктеп алатын оқу жұмыстары"}</span><h1>{isPresentation ? "Презентациялар" : "Тапсырмалар"}</h1><p>{isPresentation ? "PPT және PPTX презентацияларын сынып пен тақырып бойынша тауып, жүктеп алыңыз." : "PDF және Word форматындағы тапсырмаларды жүктеп, сабақта немесе үйде орындаңыз."}</p></div><span className="role-chip"><Icon /> {visible.length} материал</span></div><div className="filter-bar"><label className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isPresentation ? "Презентация іздеу" : "Тапсырма іздеу"} /></label><label><span className="sr-only">Деңгей</span><select value={level} onChange={(e) => setLevel(e.target.value)}><option>Барлығы</option>{gradeLevels.map((item) => <option key={item}>{item}</option>)}</select></label></div>{visible.length ? <div className="resource-grid">{visible.map((item) => <article className="panel resource-card" key={item.id}><span className={`resource-icon ${isPresentation ? "presentation" : "assignment"}`}><Icon /></span><div className="resource-copy"><span>{item.level} · {item.topic}</span><h2>{item.title}</h2><p>{item.description}</p>{item.instructions && <small className="resource-instructions">{item.instructions}</small>}<small>{item.author}{item.slideCount ? ` · ${item.slideCount} слайд` : ""}{item.estimatedMinutes ? ` · ${item.estimatedMinutes} минут` : ""}</small></div><div className="resource-actions"><span>{item.fileName.split(".").pop()?.toUpperCase()}</span><a className="button primary" href={item.fileUrl} download>Жүктеу <Download /></a></div></article>)}</div> : <div className="empty-state"><Icon /><h2>Материал табылмады</h2><p>Іздеу сөзін немесе деңгейді өзгертіп көріңіз.</p></div>}</div>;
}

function FeedbackView() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setNotice("");
    const form = e.currentTarget; const values = Object.fromEntries(new FormData(form));
    try { await apiRequest("/api/feedback", { method: "POST", body: JSON.stringify(values) }); form.reset(); setNotice("Хабарламаңыз әкімшіге жіберілді. Рақмет!"); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Хабарлама жіберілмеді"); }
    finally { setBusy(false); }
  }
  return <div className="page-shell"><div className="page-title"><div><span>Бізге жазыңыз</span><h1>Кері байланыс</h1><p>Техникалық мәселе, сабақтағы қате немесе ұсынысың болса, әкімшіге жеке хабарлама жібер.</p></div><span className="role-chip"><MessageSquare /> Жеке арна</span></div><form className="panel feedback-form" onSubmit={submit}><label>Санат<select name="category" required><option value="technical">Техникалық мәселе</option><option value="lesson">Сабақ бойынша сұрақ</option><option value="incorrect">Қате ақпарат</option><option value="suggestion">Ұсыныс</option><option value="account">Аккаунт мәселесі</option><option value="other">Басқа</option></select></label><label>Тақырып<input name="subject" minLength={3} maxLength={160} required placeholder="Мәселені қысқаша жазыңыз" /></label><label>Хабарлама<textarea name="message" minLength={10} maxLength={5000} required placeholder="Не болғанын және қандай көмек қажет екенін толық түсіндіріңіз" /></label><label>Қатысты бет <span className="optional">міндетті емес</span><input name="relatedPage" placeholder="Мысалы: Сабақтар / Атом құрылысы" /></label>{notice && <p className="save-message" role="status">{notice}</p>}<button className="button primary" type="submit" disabled={busy}>{busy ? "Жіберілуде…" : "Әкімшіге жіберу"} <MessageSquare /></button><small>Хабарламаны тек әкімшілер көреді. Құпиясөз немесе басқа құпия дерек жазбаңыз.</small></form></div>;
}

function ProfileView({ actor, lessons }: { actor: SessionUser | null; lessons: CurriculumLesson[] }) {
  const name = actor?.name ?? "ChemBridge оқушысы";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const xp = actor?.xp ?? 0;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const roleLabel = actor?.role === "admin" ? "Бас әкімші" : actor?.role === "content_admin" ? "Контент әкімшісі" : actor?.role === "teacher" ? "Мұғалім" : actor?.role === "university_student" || actor?.level === "Студент" ? "Студент" : "Мектеп оқушысы";
  return <div className="page-shell"><div className="profile-head"><div className="profile-avatar">{initials}</div><div><span>{roleLabel} · {actor?.level ?? "Оқу деңгейі"}</span><h1>{name}</h1><p>@{actor?.username ?? "chembridge"} · Жеке оқу профилі</p></div><button className="button secondary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}><Settings /> Аккаунт ақпараты</button></div><div className="profile-grid"><section className="panel profile-level"><span>{level}-деңгей</span><h2>Химия зерттеушісі</h2><Progress value={(xp % 500) / 5} label={`${500 - xp % 500} XP қалды`} /><div><strong>{xp} XP</strong><span>Жалпы тәжірибе</span></div></section><section className="panel profile-stats"><div><BookOpen /><strong>{lessons.filter((lesson) => lesson.grade === levelForUser(actor?.level ?? "10-сынып")).length}</strong><span>Деңгейдегі сабақ</span></div><div><ClipboardCheck /><strong>3</strong><span>Әр сабақтағы тексеру сұрағы</span></div><div><Sparkles /><strong>{actor?.level ?? "—"}</strong><span>Оқу бағдарламасы</span></div></section></div></div>;
}

function TeacherView() {
  const [title, setTitle] = useState("");
  const [lessons, setLessons] = useState<string[]>([]);
  const [status, setStatus] = useState("draft");
  const [notice, setNotice] = useState("");
  const [stats, setStats] = useState({ students: 0, lessons: 0, averageProgress: 0 });
  useEffect(() => {
    apiRequest<Array<{ title: string }>>("/api/teacher/lessons").then((items) => setLessons(items.map((item) => item.title))).catch(() => undefined);
    apiRequest<typeof stats>("/api/teacher/stats").then(setStats).catch(() => undefined);
  }, []);
  async function addLesson(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiRequest("/api/teacher/lessons", { method: "POST", body: JSON.stringify({ title, objective: String(form.get("objective") ?? ""), status }) });
      setLessons((current) => [...current, title.trim()]); setTitle(""); setNotice("Сабақ жоба ретінде серверде сақталды");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Сабақ сақталмады"); }
  }
  return <div className="page-shell">
    <div className="page-title"><div><span>Мұғалім кеңістігі</span><h1>Контент студиясы</h1><p>Сабақты жоба ретінде құрып, әкімші тексеруіне жіберіңіз.</p></div><span className="role-chip"><GraduationCap /> Мұғалім</span></div>
    <div className="teacher-stats"><article><Users /><div><strong>{stats.students}</strong><span>Белсенді оқушы</span></div></article><article><BookOpen /><div><strong>{stats.lessons || lessons.length}</strong><span>Сабақ</span></div></article><article><BarChart3 /><div><strong>{stats.averageProgress}%</strong><span>Нақты орташа прогресс</span></div></article></div>
    <div className="teacher-grid"><section className="panel course-manager"><div className="panel-head"><div><span>Менің контентім</span><h2>Сабақтар</h2></div></div>{lessons.map((lesson, i) => <div className="lesson-row" key={lesson}><span>{i + 1}</span><div><strong>{lesson}</strong><small>Дерекқорда сақталған</small></div></div>)}{!lessons.length && <p className="empty-state">Әзірге сабақ жоқ.</p>}</section>
      <form className="panel lesson-form" onSubmit={addLesson}><span>Жаңа сабақ</span><h2>Сабақ құру</h2><label>Сабақ атауы<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Мысалы: Валенттік электрондар" required /></label><label>Оқу мақсаты<textarea name="objective" placeholder="Оқушы сабақ соңында нені біледі?" required minLength={10} /></label><label>Күйі<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="draft">Жоба</option><option value="in_review">Тексеруге жіберу</option></select></label>{notice && <p className="save-message" role="status">{notice}</p>}<button className="button primary wide" type="submit">Сабақты сақтау <Check /></button></form>
    </div>
  </div>;
}

type SessionUser = {
  id: string;
  username: string | null;
  name: string;
  role: "student" | "school_student" | "university_student" | "teacher" | "content_admin" | "admin";
  status: "active" | "suspended" | "deleted";
  level: string;
  xp: number;
};

type AdminUser = SessionUser & { email: string; createdAt: number; lastLoginAt: number | null };
type AdminSection = "users" | "pages" | "pageSections" | "texts" | "navigation" | "grades" | "subjects" | "courses" | "modules" | "lessons" | "blocks" | "quizzes" | "questions" | "elements" | "reactions" | "laboratories" | "videos" | "syllabuses" | "presentations" | "assignments" | "feedback" | "achievements" | "challenges" | "media" | "settings" | "audit";
type AdminOption = { id: string; label: string };
type AdminOptions = { courses: AdminOption[]; modules: AdminOption[]; lessons: AdminOption[]; quizzes: AdminOption[] };
type CreateField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "file" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  options?: Array<{ value: string; label: string }>;
};

const adminSections: Array<[AdminSection, string]> = [
  ["users", "Қолданушылар"],
  ["pages", "Сайт беттері"],
  ["pageSections", "Бет секциялары"],
  ["texts", "Жалпы мәтіндер"],
  ["navigation", "Навигация"],
  ["grades", "Оқу деңгейлері"],
  ["subjects", "Пән бөлімдері"],
  ["courses", "Курстар"],
  ["modules", "Модульдер"],
  ["lessons", "Сабақтар"],
  ["quizzes", "Тесттер"],
  ["questions", "Сұрақтар"],
  ["elements", "Периодтық кесте"],
  ["reactions", "Реакциялар"],
  ["laboratories", "Зертхана"],
  ["videos", "Видеосабақтар"],
  ["syllabuses", "Силлабустар"],
  ["presentations", "Презентациялар"],
  ["assignments", "Тапсырмалар"],
  ["feedback", "Кері байланыс"],
  ["achievements", "Жетістіктер"],
  ["challenges", "Күнделікті тапсырмалар"],
  ["media", "Медиа кітапхана"],
  ["settings", "Сайт баптаулары"],
  ["audit", "Әкімшілік журнал"],
];

const statusOptions = [
  { value: "draft", label: "Жоба" },
  { value: "in_review", label: "Тексерілуде" },
  { value: "scheduled", label: "Жоспарланған" },
  { value: "published", label: "Жарияланған" },
  { value: "archived", label: "Архивте" },
];

function relationOptions(items: AdminOption[], emptyLabel?: string) {
  return [
    ...(emptyLabel ? [{ value: "", label: emptyLabel }] : []),
    ...items.map((item) => ({ value: item.id, label: item.label })),
  ];
}

function resourceMimeType(file: File) {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ({
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  } as Record<string, string>)[extension ?? ""] ?? "application/octet-stream";
}

function createFields(section: AdminSection, options: AdminOptions): CreateField[] {
  const base = { required: true } as const;
  switch (section) {
    case "pages": return [
      { ...base, name: "title", label: "Бет атауы" },
      { ...base, name: "slug", label: "URL атауы", placeholder: "about" },
      { name: "seoTitle", label: "SEO тақырыбы" },
      { name: "seoDescription", label: "SEO сипаттамасы", type: "textarea" },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "pageSections": return [
      { ...base, name: "pageId", label: "Бет ID", placeholder: "page:home" },
      { ...base, name: "sectionKey", label: "Секция кілті", placeholder: "hero" },
      { ...base, name: "type", label: "Секция түрі", placeholder: "hero, cards, text" },
      { name: "title", label: "Тақырыбы" },
      { name: "body", label: "Мәтіні", type: "textarea" },
      { name: "payload", label: "Қосымша құрылымды дерек (JSON)", type: "textarea", defaultValue: "{}" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { ...base, name: "isVisible", label: "Көрінуі", type: "select", options: [{ value: "1", label: "Көрінеді" }, { value: "0", label: "Жасырын" }], defaultValue: "1" },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "texts": return [
      { ...base, name: "key", label: "Мәтін кілті", placeholder: "home.hero.title" },
      { ...base, name: "locale", label: "Тіл", defaultValue: "kk" },
      { ...base, name: "value", label: "Мәтін", type: "textarea" },
      { name: "description", label: "Редакторға түсіндірме", type: "textarea" },
    ];
    case "navigation": return [
      { ...base, name: "menu", label: "Мәзір", defaultValue: "app" },
      { ...base, name: "label", label: "Атауы" },
      { ...base, name: "href", label: "Маршрут", placeholder: "dashboard" },
      { name: "icon", label: "Lucide иконкасы", placeholder: "LayoutDashboard" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { ...base, name: "isVisible", label: "Көрінуі", type: "select", options: [{ value: "1", label: "Көрінеді" }, { value: "0", label: "Жасырын" }], defaultValue: "1" },
      { name: "requiredRole", label: "Қажетті рөл" },
      { name: "parentId", label: "Ата-ана пункт ID" },
    ];
    case "grades": return [
      { ...base, name: "code", label: "Код", placeholder: "7" },
      { ...base, name: "title", label: "Атауы", placeholder: "7-сынып" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "published" },
    ];
    case "subjects": return [
      { ...base, name: "slug", label: "URL атауы", placeholder: "inorganic" },
      { ...base, name: "title", label: "Бөлім атауы" },
      { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "media": return [
      { ...base, name: "file", label: "Файл", type: "file" },
      { ...base, name: "title", label: "Медиа атауы" },
      { ...base, name: "altText", label: "Alt мәтін" },
      { ...base, name: "folder", label: "Қалта", defaultValue: "general" },
    ];
    case "courses": return [
      { ...base, name: "title", label: "Курс атауы", placeholder: "Мысалы: Жалпы химия" },
      { ...base, name: "slug", label: "URL атауы", placeholder: "zhalpy-himiya" },
      { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "modules": return [
      { ...base, name: "courseId", label: "Курс", type: "select", options: relationOptions(options.courses) },
      { ...base, name: "title", label: "Модуль атауы" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { name: "prerequisiteId", label: "Алдыңғы міндетті модуль", type: "select", options: relationOptions(options.modules, "Міндетті модуль жоқ") },
    ];
    case "lessons": return [
      { ...base, name: "moduleId", label: "Модуль", type: "select", options: relationOptions(options.modules) },
      { ...base, name: "gradeLevel", label: "Сынып", type: "select", options: gradeLevels.map((item) => ({ value: item, label: item })), defaultValue: "7-сынып" },
      { ...base, name: "title", label: "Сабақ атауы" },
      { ...base, name: "objective", label: "Оқу мақсаты", type: "textarea" },
      { ...base, name: "theory", label: "Сабақтың негізгі мазмұны", type: "textarea", placeholder: "Теорияны қысқа абзацтармен жазыңыз" },
      { name: "formula", label: "Формула немесе химиялық теңдеу", type: "textarea" },
      { ...base, name: "example", label: "Түсінікті мысал", type: "textarea" },
      { ...base, name: "remember", label: "Есте сақта блогы", type: "textarea" },
      { name: "materials", label: "Қосымша материалдар (сілтемелер мен түсіндірме)", type: "textarea" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { ...base, name: "xpReward", label: "XP марапаты", type: "number", defaultValue: 50 },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "blocks": return [
      { ...base, name: "lessonId", label: "Сабақ", type: "select", options: relationOptions(options.lessons) },
      { ...base, name: "type", label: "Блок түрі", type: "select", options: [
        { value: "theory", label: "Теория" }, { value: "heading", label: "Тақырыпша" },
        { value: "formula", label: "Формула" }, { value: "example", label: "Мысал" },
        { value: "remember", label: "Есте сақта" }, { value: "question", label: "Интерактивті сұрақ" },
        { value: "definition", label: "Анықтама" }, { value: "key_concept", label: "Негізгі ұғым" },
        { value: "chemical_equation", label: "Химиялық теңдеу" }, { value: "real_life", label: "Өмірлік мысал" },
        { value: "youtube", label: "YouTube видео" }, { value: "pdf", label: "PDF материал" },
        { value: "warning", label: "Ескерту" }, { value: "safety", label: "Қауіпсіздік" }, { value: "summary", label: "Қорытынды" }, { value: "materials", label: "Қосымша материалдар" },
      ] },
      { ...base, name: "content", label: "Мазмұны", type: "textarea" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
    ];
    case "quizzes": return [
      { name: "lessonId", label: "Сабақ", type: "select", options: relationOptions(options.lessons, "Сабаққа байланыстырылмаған") },
      { ...base, name: "title", label: "Тест атауы" },
      { ...base, name: "passScore", label: "Өту пайызы", type: "number", defaultValue: 70 },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "questions": return [
      { ...base, name: "quizId", label: "Тест", type: "select", options: relationOptions(options.quizzes) },
      { ...base, name: "type", label: "Сұрақ түрі", type: "select", options: [
        { value: "single", label: "Бір дұрыс жауап" }, { value: "multiple", label: "Бірнеше дұрыс жауап" },
        { value: "true_false", label: "Дұрыс / бұрыс" }, { value: "matching", label: "Сәйкестендіру" },
        { value: "formula", label: "Формула енгізу" }, { value: "reaction", label: "Реакцияны теңестіру" },
      ] },
      { ...base, name: "prompt", label: "Сұрақ", type: "textarea" },
      { ...base, name: "correctAnswer", label: "Дұрыс жауап", type: "textarea" },
      { ...base, name: "explanation", label: "Түсіндірме", type: "textarea" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
    ];
    case "elements": return [
      { ...base, name: "atomicNumber", label: "Атомдық нөмір", type: "number" },
      { ...base, name: "symbol", label: "Таңбасы", placeholder: "Fe" },
      { ...base, name: "nameKk", label: "Қазақша атауы" },
      { ...base, name: "details", label: "Толық мәлімет (JSON)", type: "textarea", defaultValue: "{\n  \"internationalName\": \"\",\n  \"atomicMass\": 0,\n  \"category\": \"\"\n}" },
    ];
    case "reactions": return [
      { ...base, name: "equation", label: "Реакция теңдеуі" },
      { ...base, name: "balancedEquation", label: "Теңестірілген теңдеу" },
      { ...base, name: "type", label: "Реакция түрі" },
      { ...base, name: "hint", label: "Кеңес", type: "textarea" },
    ];
    case "laboratories": return [
      { ...base, name: "title", label: "Тәжірибе атауы" },
      { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "objective", label: "Тәжірибенің мақсаты", type: "textarea" },
      { ...base, name: "learningOutcome", label: "Нені үйренеміз?", type: "textarea" },
      { ...base, name: "equipment", label: "Құралдар (әр жолға біреу)", type: "textarea" },
      { ...base, name: "reagents", label: "Реактивтер (әр жолға біреу)", type: "textarea" },
      { ...base, name: "safety", label: "Қауіпсіздік нұсқаулығы", type: "textarea" },
      { ...base, name: "expectedObservation", label: "Күтілетін бақылау", type: "textarea" },
      { ...base, name: "equation", label: "Химиялық теңдеу" },
      { ...base, name: "explanation", label: "Түсіндірме", type: "textarea" },
      { ...base, name: "conclusion", label: "Қорытынды", type: "textarea" },
      { ...base, name: "visualEffect", label: "Визуалды белгі", type: "select", options: [{ value: "color", label: "Түс өзгеруі" }, { value: "gas", label: "Газ бөлінуі" }, { value: "precipitate", label: "Тұнба" }, { value: "temperature", label: "Температура" }, { value: "dissolve", label: "Еру" }, { value: "crystallize", label: "Кристалдану" }] },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "draft" },
    ];
    case "videos": return [
      { ...base, name: "title", label: "Видео атауы" },
      { ...base, name: "description", label: "Қысқа сипаттама", type: "textarea" }, { ...base, name: "youtubeUrl", label: "YouTube сілтемесі", placeholder: "https://www.youtube.com/watch?v=..." },
      { ...base, name: "author", label: "Автор немесе мұғалім", defaultValue: "ChemBridge" }, { ...base, name: "level", label: "Деңгей", type: "select", options: gradeLevels.map((item) => ({ value: item, label: item })) },
      { name: "courseId", label: "Курс", type: "select", options: relationOptions(options.courses, "Курссыз") }, { ...base, name: "topic", label: "Тақырып" },
      { ...base, name: "durationMinutes", label: "Ұзақтығы (минут)", type: "number", defaultValue: 10 }, { ...base, name: "difficulty", label: "Қиындығы", defaultValue: "Бастапқы" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 }, { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "published" },
    ];
    case "syllabuses": return [
      { ...base, name: "title", label: "Силлабус атауы" }, { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "level", label: "Деңгей", type: "select", options: gradeLevels.map((item) => ({ value: item, label: item })) }, { name: "courseId", label: "Курс", type: "select", options: relationOptions(options.courses, "Курссыз") },
      { ...base, name: "academicYear", label: "Оқу жылы", defaultValue: "2026–2027" }, { ...base, name: "semester", label: "Семестр", defaultValue: "1-семестр" },
      { ...base, name: "language", label: "Тілі", defaultValue: "Қазақша" }, { ...base, name: "author", label: "Автор немесе мекеме" },
      { name: "file", label: "PDF файл (немесе төменде сілтеме)", type: "file" }, { name: "pdfUrl", label: "Сыртқы PDF сілтемесі", placeholder: "https://example.kz/syllabus.pdf" }, { ...base, name: "version", label: "Нұсқа", defaultValue: "1.0" },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "published" },
    ];
    case "presentations": return [
      { ...base, name: "title", label: "Презентация атауы" }, { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "level", label: "Сынып", type: "select", options: gradeLevels.map((item) => ({ value: item, label: item })) }, { name: "courseId", label: "Курс", type: "select", options: relationOptions(options.courses, "Курссыз") },
      { ...base, name: "topic", label: "Тақырып" }, { ...base, name: "author", label: "Автор", defaultValue: "ChemBridge" },
      { ...base, name: "file", label: "PPT немесе PPTX файл", type: "file" }, { name: "slideCount", label: "Слайд саны", type: "number" },
      { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 }, { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "published" },
    ];
    case "assignments": return [
      { ...base, name: "title", label: "Тапсырма атауы" }, { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "instructions", label: "Орындау нұсқаулығы", type: "textarea" }, { ...base, name: "level", label: "Сынып", type: "select", options: gradeLevels.map((item) => ({ value: item, label: item })) },
      { name: "courseId", label: "Курс", type: "select", options: relationOptions(options.courses, "Курссыз") }, { ...base, name: "topic", label: "Тақырып" },
      { ...base, name: "author", label: "Автор", defaultValue: "ChemBridge" }, { ...base, name: "file", label: "PDF немесе Word файл", type: "file" },
      { name: "estimatedMinutes", label: "Орындау уақыты (минут)", type: "number", defaultValue: 20 }, { ...base, name: "position", label: "Реті", type: "number", defaultValue: 1 },
      { ...base, name: "status", label: "Күйі", type: "select", options: statusOptions, defaultValue: "published" },
    ];
    case "achievements": return [
      { ...base, name: "code", label: "Код", placeholder: "atom_master" },
      { ...base, name: "title", label: "Жетістік атауы" },
      { ...base, name: "description", label: "Сипаттамасы", type: "textarea" },
      { ...base, name: "xpReward", label: "XP марапаты", type: "number", defaultValue: 100 },
    ];
    case "challenges": return [
      { ...base, name: "challengeDate", label: "Күні", type: "date" },
      { ...base, name: "title", label: "Тапсырма атауы" },
      { ...base, name: "payload", label: "Тапсырма шарты (JSON)", type: "textarea", defaultValue: "{\"type\":\"lesson\",\"target\":1}" },
      { ...base, name: "xpReward", label: "XP марапаты", type: "number", defaultValue: 35 },
    ];
    case "settings": return [
      { ...base, name: "key", label: "Баптау кілті", placeholder: "home.announcement" },
      { ...base, name: "value", label: "Мәні (JSON)", type: "textarea", defaultValue: "{\"kk\":\"\"}" },
    ];
    default: return [];
  }
}

type LessonEditorAttachment = { id: string; blockId: string; title: string; url: string; mimeType: string; altText: string };
type LessonEditorBlock = { type: "theory" | "formula" | "example" | "remember"; content: string; position: number; attachments: LessonEditorAttachment[] };
type LessonEditorQuestion = { id?: string; prompt: string; options: string[]; correctAnswerIndex: number; explanation: string; position: number };
type LessonEditorData = {
  lesson: { id: string; slug: string; title: string; objective: string; gradeLevel: string; status: string; position: number; xpReward: number };
  blocks: Array<{ id: string; type: string; content: string; position: number }>;
  attachments: LessonEditorAttachment[];
  quiz: { id: string; title: string; passScore: number; status: string } | null;
  questions: Array<{ id: string; prompt: string; correctAnswer: string; explanation: string; position: number; options: string | null }>;
};

const lessonBlockLabels: Record<LessonEditorBlock["type"], string> = {
  theory: "Қарапайым түсіндірме",
  formula: "Формула немесе теңдеу",
  example: "Мысал",
  remember: "Есте сақта",
};

function LessonAdminEditor({ lessonId, onClose, onSaved }: { lessonId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [lesson, setLesson] = useState<LessonEditorData["lesson"] | null>(null);
  const [blocks, setBlocks] = useState<LessonEditorBlock[]>([]);
  const [quiz, setQuiz] = useState({ title: "Сабақ соңындағы тексеру", passScore: 67, status: "published" });
  const [questions, setQuestions] = useState<LessonEditorQuestion[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<LessonEditorData>(`/api/admin/lesson-editor/${encodeURIComponent(lessonId)}`).then((data) => {
      if (!active) return;
      setLesson(data.lesson);
      const orderedTypes: LessonEditorBlock["type"][] = ["theory", "formula", "example", "remember"];
      setBlocks(orderedTypes.map((type, index) => {
        const matching = data.blocks.filter((block) => block.type === type);
        const blockIds = new Set(matching.map((block) => block.id));
        return {
          type,
          content: matching.map((block) => block.content).filter(Boolean).join("\n\n"),
          position: index + 1,
          attachments: data.attachments.filter((attachment) => blockIds.has(attachment.blockId)),
        };
      }));
      setQuiz(data.quiz ? { title: data.quiz.title, passScore: data.quiz.passScore, status: data.quiz.status } : { title: "Сабақ соңындағы тексеру", passScore: 67, status: "published" });
      const staticLesson = curriculumLessons.find((item) => item.id === lessonId);
      setQuestions([0, 1, 2].map((index) => {
        const stored = data.questions.find((item) => item.position === index + 1);
        const fallback = staticLesson?.quiz[index];
        const options = questionOptions(stored?.options, fallback?.options ?? [stored?.correctAnswer ?? "Дұрыс жауап", "2-нұсқа", "3-нұсқа", "4-нұсқа"]);
        return {
          id: stored?.id,
          prompt: stored?.prompt ?? fallback?.question ?? "",
          options,
          correctAnswerIndex: Math.max(0, options.findIndex((option) => option === (stored?.correctAnswer ?? fallback?.options[fallback.answer]))),
          explanation: stored?.explanation ?? fallback?.explanation ?? "",
          position: index + 1,
        };
      }));
    }).catch((error) => setNotice(error instanceof Error ? error.message : "Сабақ жүктелмеді"));
    return () => { active = false; };
  }, [lessonId]);

  async function uploadFile(type: LessonEditorBlock["type"], file: File) {
    setUploading(type);
    setNotice("");
    try {
      const uploaded = await uploadMediaFile(file, {
        title: file.name,
        altText: `${lessonBlockLabels[type]}: ${file.name}`,
        folder: `lessons-${type}`,
      });
      setBlocks((current) => current.map((block) => block.type === type ? {
        ...block,
        attachments: [...block.attachments, { id: uploaded.id, blockId: "", title: file.name, url: uploaded.url, mimeType: file.type, altText: `${lessonBlockLabels[type]}: ${file.name}` }],
      } : block));
      setNotice("Файл жүктелді. Енді сабақты сақтаңыз.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Файл жүктелмеді");
    } finally {
      setUploading(null);
    }
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lesson) return;
    setBusy(true);
    setNotice("");
    try {
      await apiRequest(`/api/admin/lesson-editor/${encodeURIComponent(lessonId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          lesson,
          blocks: blocks.map((block) => ({ type: block.type, content: block.content, position: block.position, attachmentIds: block.attachments.map((item) => item.id) })),
          quiz,
          questions,
        }),
      });
      setNotice("Сабақтың барлық бөлімдері сақталды");
      await onSaved();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Сабақ сақталмады");
    } finally {
      setBusy(false);
    }
  }

  if (!lesson) return <div className="content-editor"><div className="panel-head"><h2>Сабақ жүктелуде…</h2><button type="button" className="icon-button" onClick={onClose}><X /></button></div>{notice && <p className="save-message">{notice}</p>}</div>;
  return <form className="content-editor lesson-admin-editor" onSubmit={save}>
    <div className="panel-head"><div><span>Толық сабақ редакторы</span><h2>{lesson.title}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Редакторды жабу"><X /></button></div>
    <div className="lesson-editor-meta">
      <label>Сабақ атауы<input value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} required /></label>
      <label>Сынып<select value={lesson.gradeLevel || "10-сынып"} onChange={(e) => setLesson({ ...lesson, gradeLevel: e.target.value })}>{gradeLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Күйі<select value={lesson.status} onChange={(e) => setLesson({ ...lesson, status: e.target.value })}>{statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
      <label>Реті<input type="number" min="1" value={lesson.position} onChange={(e) => setLesson({ ...lesson, position: Number(e.target.value) })} required /></label>
      <label>XP марапаты<input type="number" min="0" value={lesson.xpReward} onChange={(e) => setLesson({ ...lesson, xpReward: Number(e.target.value) })} required /></label>
    </div>
    <label>Оқу мақсаты<textarea value={lesson.objective} onChange={(e) => setLesson({ ...lesson, objective: e.target.value })} required /></label>
    {blocks.map((block) => <section className="lesson-editor-block" key={block.type}>
      <div className="lesson-editor-block-head"><div><strong>{lessonBlockLabels[block.type]}</strong><small>Мәтінді өзгертіп, сурет немесе PDF тіркей аласыз</small></div><label className="button secondary file-button">{uploading === block.type ? "Жүктелуде…" : "Файл қосу"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf" disabled={uploading !== null} onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadFile(block.type, file); e.currentTarget.value = ""; }} /></label></div>
      <textarea aria-label={lessonBlockLabels[block.type]} value={block.content} onChange={(e) => setBlocks((current) => current.map((item) => item.type === block.type ? { ...item, content: e.target.value } : item))} required={block.type !== "formula"} />
      {!!block.attachments.length && <div className="lesson-editor-files">{block.attachments.map((file) => <div key={file.id}>{file.mimeType.startsWith("image/") ? <img src={file.url} alt={file.altText} /> : <FileText />}<span><strong>{file.title}</strong><small>{file.mimeType === "application/pdf" ? "PDF" : "Сурет"}</small></span><button type="button" onClick={() => setBlocks((current) => current.map((item) => item.type === block.type ? { ...item, attachments: item.attachments.filter((attachment) => attachment.id !== file.id) } : item))} aria-label={`${file.title} файлын алып тастау`}><X /></button></div>)}</div>}
    </section>)}
    <section className="lesson-editor-quiz">
      <div className="lesson-editor-block-head"><div><strong>Сабақ соңындағы 3 сұрақтық тексеру</strong><small>Әр сұрақта 4 жауап нұсқасы және бір дұрыс жауап болуы керек</small></div><label>Жариялау күйі<select value={quiz.status} onChange={(e) => setQuiz({ ...quiz, status: e.target.value })}>{statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label></div>
      {questions.map((question, questionIndex) => <div className="lesson-editor-question" key={question.position}>
        <strong>{questionIndex + 1}-сұрақ</strong>
        <label>Сұрақ мәтіні<textarea value={question.prompt} onChange={(e) => setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, prompt: e.target.value } : item))} required /></label>
        <div className="lesson-editor-options">{question.options.map((option, optionIndex) => <label key={optionIndex}><input type="radio" name={`correct-${questionIndex}`} checked={question.correctAnswerIndex === optionIndex} onChange={() => setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, correctAnswerIndex: optionIndex } : item))} /><span>{optionIndex + 1}-нұсқа</span><input value={option} onChange={(e) => setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, options: item.options.map((value, i) => i === optionIndex ? e.target.value : value) } : item))} required /></label>)}</div>
        <label>Жауап түсіндірмесі<textarea value={question.explanation} onChange={(e) => setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, explanation: e.target.value } : item))} required /></label>
      </div>)}
    </section>
    {notice && <p className="save-message" role="status">{notice}</p>}
    <button className="button primary wide" type="submit" disabled={busy || uploading !== null}><Check /> {busy ? "Сақталуда…" : "Сабақтың барлық өзгерісін сақтау"}</button>
  </form>;
}

type ElementDetailsEditor = {
  international: string;
  mass: string;
  group: number | null;
  period: number;
  category: string;
  state: string;
  config: string;
  history: string;
  uses: string;
  safety: string;
};

const elementCategories = [
  ["alkali", "Сілтілік металдар"], ["alkaline", "Сілтілік-жер металдары"],
  ["transition", "Ауыспалы металдар"], ["post-transition", "Басқа металдар"],
  ["metalloid", "Металлоидтар"], ["nonmetal", "Бейметалдар"],
  ["halogen", "Галогендер"], ["noble", "Инертті газдар"],
  ["lanthanide", "Лантаноидтар"], ["actinide", "Актиноидтар"],
] as const;

function ElementAdminEditor({ item, onClose, onSaved }: { item: Record<string, unknown>; onClose: () => void; onSaved: () => Promise<void> }) {
  const parsedDetails = (() => {
    try { return typeof item.details === "string" ? JSON.parse(item.details) as Partial<ElementDetailsEditor> : item.details as Partial<ElementDetailsEditor>; }
    catch { return {}; }
  })();
  const [atomicNumber, setAtomicNumber] = useState(Number(item.atomicNumber ?? 1));
  const [symbol, setSymbol] = useState(String(item.symbol ?? ""));
  const [nameKk, setNameKk] = useState(String(item.nameKk ?? ""));
  const [details, setDetails] = useState<ElementDetailsEditor>({
    international: String(parsedDetails?.international ?? symbol),
    mass: String(parsedDetails?.mass ?? "—"),
    group: parsedDetails?.group === null || parsedDetails?.group === undefined ? null : Number(parsedDetails.group),
    period: Number(parsedDetails?.period ?? 1),
    category: String(parsedDetails?.category ?? "nonmetal"),
    state: String(parsedDetails?.state ?? "қатты"),
    config: String(parsedDetails?.config ?? ""),
    history: String(parsedDetails?.history ?? ""),
    uses: String(parsedDetails?.uses ?? ""),
    safety: String(parsedDetails?.safety ?? ""),
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      await apiRequest("/api/admin/content/elements", { method: "PATCH", body: JSON.stringify({ id: item.id, values: { atomicNumber, symbol, nameKk, details: JSON.stringify(details) } }) });
      await onSaved();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Элемент сақталмады"); }
    finally { setBusy(false); }
  }
  return <form className="content-editor element-admin-editor" onSubmit={save}>
    <div className="panel-head"><div><span>Периодтық кесте редакторы</span><h2>{nameKk || symbol}</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div>
    <div className="element-editor-grid">
      <label>Атомдық нөмір<input type="number" min="1" max="118" value={atomicNumber} onChange={(e) => setAtomicNumber(Number(e.target.value))} required /></label>
      <label>Химиялық таңба<input value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={3} required /></label>
      <label>Қазақша атауы<input value={nameKk} onChange={(e) => setNameKk(e.target.value)} required /></label>
      <label>Халықаралық атауы<input value={details.international} onChange={(e) => setDetails({ ...details, international: e.target.value })} required /></label>
      <label>Атомдық массасы<input value={details.mass} onChange={(e) => setDetails({ ...details, mass: e.target.value })} required /></label>
      <label>Период<input type="number" min="1" max="7" value={details.period} onChange={(e) => setDetails({ ...details, period: Number(e.target.value) })} required /></label>
      <label>Топ<input type="number" min="1" max="18" value={details.group ?? ""} onChange={(e) => setDetails({ ...details, group: e.target.value ? Number(e.target.value) : null })} placeholder="Лантаноид/актиноид үшін бос" /></label>
      <label>Санаты<select value={details.category} onChange={(e) => setDetails({ ...details, category: e.target.value })}>{elementCategories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label>Агрегаттық күйі<select value={details.state} onChange={(e) => setDetails({ ...details, state: e.target.value })}><option>қатты</option><option>сұйық</option><option>газ</option><option>жасанды</option></select></label>
    </div>
    <label>Электрондық конфигурация<textarea value={details.config} onChange={(e) => setDetails({ ...details, config: e.target.value })} required /></label>
    <label>Ашылу тарихы<textarea value={details.history} onChange={(e) => setDetails({ ...details, history: e.target.value })} required /></label>
    <label>Қолданылуы<textarea value={details.uses} onChange={(e) => setDetails({ ...details, uses: e.target.value })} required /></label>
    <label>Қауіпсіздік ақпараты<textarea value={details.safety} onChange={(e) => setDetails({ ...details, safety: e.target.value })} required /></label>
    {notice && <p className="save-message" role="status">{notice}</p>}
    <button className="button primary wide" type="submit" disabled={busy}><Check /> {busy ? "Сақталуда…" : "Элементті сақтау"}</button>
  </form>;
}

function AdminView({ actor, onContentChanged }: { actor: SessionUser; onContentChanged: () => Promise<void> }) {
  const [section, setSection] = useState<AdminSection>(actor.role === "admin" ? "users" : "pages");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [content, setContent] = useState<Array<Record<string, unknown>>>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);
  const [options, setOptions] = useState<AdminOptions>({ courses: [], modules: [], lessons: [], quizzes: [] });
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: string; version: number; changeNote: string | null; createdAt: number; createdBy: string }>>([]);
  const [stats, setStats] = useState({ users: 0, lessons: 0, elements: 0, reactions: 0, unreadFeedback: 0 });

  async function load() {
    setLoading(true);
    try {
      if (section === "users") {
        const result = await apiRequest<{ items: AdminUser[] }>(`/api/admin/users?search=${encodeURIComponent(search)}`);
        setUsers(result.items);
      } else if (section === "audit") {
        const result = await apiRequest<{ items: Array<Record<string, unknown>> }>("/api/admin/audit");
        setContent(result.items);
      } else if (section === "feedback") {
        const result = await apiRequest<{ items: Array<Record<string, unknown>> }>(`/api/admin/feedback?search=${encodeURIComponent(search)}`);
        setContent(result.items);
      } else {
        const result = await apiRequest<{ items: Array<Record<string, unknown>>; options: AdminOptions }>(`/api/admin/content/${section}?search=${encodeURIComponent(search)}&deleted=${showDeleted ? "1" : "0"}`);
        setContent(result.items);
        setOptions(result.options);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Деректерді жүктеу мүмкін болмады");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
    // load is intentionally refreshed only when the selected admin section changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, showDeleted]);
  useEffect(() => { apiRequest<typeof stats>("/api/admin/stats").then(setStats).catch(() => undefined); }, []);

  async function updateUser(userId: string, values: Partial<AdminUser>) {
    try {
      await apiRequest("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId, ...values }),
      });
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, ...values } : user));
      setNotice("Қолданушы деректері жаңартылды");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Өзгеріс сақталмады");
      await load();
    }
  }

  async function saveContent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);
    try {
      if (["presentations", "assignments"].includes(section)) {
        const file = formData.get("file");
        if (file instanceof File && file.size > 0) {
          const uploaded = await uploadMediaFile(file, {
            title: String(values.title ?? selected.title ?? file.name),
            altText: `${section === "presentations" ? "Презентация" : "Тапсырма"} файлы`,
            folder: section,
          });
          values.fileUrl = uploaded.url;
          values.fileName = file.name;
          values.mimeType = resourceMimeType(file);
          values.fileSizeBytes = String(file.size);
        }
        delete values.file;
      }
      await apiRequest(section === "feedback" ? "/api/admin/feedback" : `/api/admin/content/${section}`, {
        method: "PATCH",
        body: JSON.stringify(section === "feedback" ? { id: selected.id, status: values.status, internalNote: values.internalNote } : { id: selected.id, values }),
      });
      setNotice("Контент қауіпсіз сақталды");
      setSelected(null);
      await Promise.all([load(), onContentChanged()]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Контент сақталмады");
    }
  }

  async function addContent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);
    try {
      if (section === "media") {
        const file = formData.get("file");
        if (!(file instanceof File) || file.size === 0) throw new Error("Файлды таңдаңыз");
        await uploadMediaFile(file, {
          title: String(values.title ?? file.name),
          altText: String(values.altText ?? file.name),
          folder: String(values.folder ?? "general"),
        });
      } else {
        if (section === "syllabuses") {
          const file = formData.get("file");
          if (file instanceof File && file.size > 0) {
            const uploaded = await uploadMediaFile(file, {
              title: String(values.title ?? "Силлабус"),
              altText: "Силлабус PDF",
              folder: "syllabuses",
            });
            values.pdfUrl = uploaded.url;
          }
          delete values.file;
        }
        if (["presentations", "assignments"].includes(section)) {
          const file = formData.get("file");
          if (!(file instanceof File) || file.size === 0) throw new Error("Файлды таңдаңыз");
          const uploaded = await uploadMediaFile(file, {
            title: String(values.title ?? file.name),
            altText: `${section === "presentations" ? "Презентация" : "Тапсырма"} файлы`,
            folder: section,
          });
          values.fileUrl = uploaded.url;
          values.fileName = file.name;
          values.mimeType = resourceMimeType(file);
          values.fileSizeBytes = String(file.size);
          delete values.file;
        }
        await apiRequest(`/api/admin/content/${section}`, {
          method: "POST",
          body: JSON.stringify({ values }),
        });
      }
      setNotice("Жаңа контент сәтті қосылды");
      setCreating(false);
      await Promise.all([load(), onContentChanged()]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Жаңа контент қосылмады");
    }
  }

  async function resetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passwordTarget) return;
    const temporaryPassword = String(new FormData(e.currentTarget).get("temporaryPassword") ?? "");
    try {
      await apiRequest("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId: passwordTarget.id, temporaryPassword }),
      });
      setNotice(`${passwordTarget.name}: уақытша құпиясөз орнатылып, сессиялар тоқтатылды`);
      setPasswordTarget(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Құпиясөз жаңартылмады");
    }
  }

  async function openContent(item: Record<string, unknown>) {
    setSelected(item);
    setCreating(false);
    if (section === "feedback") { setVersions([]); return; }
    try {
      const result = await apiRequest<{ items: typeof versions }>(`/api/admin/versions?entity=${encodeURIComponent(section)}&id=${encodeURIComponent(String(item.id))}`);
      setVersions(result.items);
    } catch {
      setVersions([]);
    }
  }

  async function toggleDeleted(id: string, restore: boolean) {
    if (!restore && !window.confirm("Бұл контент soft delete арқылы архивке жіберіледі. Жалғастырасыз ба?")) return;
    try {
      await apiRequest(`/api/admin/content/${section}`, { method: "DELETE", body: JSON.stringify({ id, restore }) });
      setNotice(restore ? "Контент қалпына келтірілді" : "Контент архивке жіберілді");
      setSelected(null);
      await Promise.all([load(), onContentChanged()]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Әрекет орындалмады");
    }
  }

  async function restoreVersion(versionId: string) {
    if (!selected || !window.confirm("Таңдалған нұсқа ағымдағы контенттің орнына қойылады. Жалғастырасыз ба?")) return;
    try {
      await apiRequest("/api/admin/versions", { method: "POST", body: JSON.stringify({ versionId, entity: section, entityId: selected.id }) });
      setNotice("Контенттің алдыңғы нұсқасы қалпына келтірілді");
      setSelected(null);
      await Promise.all([load(), onContentChanged()]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Нұсқа қалпына келмеді");
    }
  }

  const contentTitle = (item: Record<string, unknown>) =>
    String(item.title ?? item.subject ?? item.nameKk ?? item.equation ?? item.symbol ?? item.code ?? item.id);
  const editableFields = selected
    ? Object.entries(selected).filter(([key, value]) =>
      (section !== "feedback" || ["status", "internalNote"].includes(key))
      &&
      !["id", "createdAt", "updatedAt", "moduleId", "lessonId"].includes(key)
      && !(section === "videos" && key === "slug")
      && !(["presentations", "assignments"].includes(section) && ["fileName", "mimeType", "fileSizeBytes"].includes(key))
      && (typeof value === "string" || typeof value === "number"))
    : [];

  return (
    <div className="page-shell admin-shell">
      <div className="page-title">
        <div><span>Жүйені басқару</span><h1>Әкімші панелі</h1><p>Тіркелушілерді, рөлдерді және ChemBridge контентін бір жерден басқарыңыз.</p></div>
        <span className="role-chip admin"><ShieldCheck /> Әкімші</span>
      </div>
      <div className="admin-stats">
        <article><Users /><strong>{stats.users}</strong><span>Қолданушы</span></article>
        <article><BookOpen /><strong>{stats.lessons}</strong><span>Сабақ</span></article>
        <article><Atom /><strong>{stats.elements}</strong><span>Элемент</span></article>
        <article><TestTube2 /><strong>{stats.reactions}</strong><span>Реакция · {stats.unreadFeedback} жаңа хат</span></article>
      </div>
      <div className="admin-workspace">
        <nav className="admin-tabs" aria-label="Әкімші бөлімдері">
          {adminSections.filter(([id]) => actor.role === "admin" || (id !== "users" && id !== "settings" && id !== "audit")).map(([id, label]) => <button key={id} className={section === id ? "active" : ""} onClick={() => { setSection(id); setSelected(null); setCreating(false); }}>{label}</button>)}
        </nav>
        <section className="panel admin-content">
          <div className="panel-head">
            <div><span>{adminSections.find(([id]) => id === section)?.[1]}</span><h2>{section === "users" ? "Тіркелушілерді басқару" : section === "audit" ? "Соңғы әкімшілік әрекеттер" : "Контент редакторы"}</h2></div>
            {section !== "audit" && <div className="admin-toolbar">
              <form className="search-field" onSubmit={(e) => { e.preventDefault(); void load(); }}><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Іздеу" aria-label="Іздеу" /></form>
              {section !== "users" && section !== "feedback" && <button className="button secondary" type="button" onClick={() => setShowDeleted((value) => !value)}>{showDeleted ? "Белсенді контент" : "Жойылғандар"}</button>}
              {section !== "users" && section !== "feedback" && section !== "elements" && <button className="button primary add-content-button" type="button" onClick={() => { setCreating(true); setSelected(null); }}><Plus /> Жаңа контент</button>}
            </div>}
          </div>
          {notice && <p className="save-message" role="status">{notice}</p>}
          {loading ? <p className="empty-state">Жүктелуде…</p> : section === "users" ? (
            <div className="admin-list">
              {users.map((user) => <article className="admin-user-card" key={user.id}>
                <div className="admin-user-main"><span className="user-avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{user.name}</strong><small>@{user.username ?? "chatgpt"} · {user.level}</small></div></div>
                <label><span className="sr-only">Рөлі</span><select value={user.role} onChange={(e) => void updateUser(user.id, { role: e.target.value as AdminUser["role"] })}><option value="student">Оқушы (ескі)</option><option value="school_student">Мектеп оқушысы</option><option value="university_student">Студент</option><option value="teacher">Мұғалім</option><option value="content_admin">Контент әкімшісі</option><option value="admin">Бас әкімші</option></select></label>
                <label><span className="sr-only">Күйі</span><select value={user.status} onChange={(e) => void updateUser(user.id, { status: e.target.value as AdminUser["status"] })}><option value="active">Белсенді</option><option value="suspended">Бұғатталған</option><option value="deleted">Жойылған</option></select></label>
                <div className="admin-user-actions"><button onClick={() => setPasswordTarget(user)}>Құпиясөзді жаңарту</button><button onClick={() => void apiRequest("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId: user.id, revokeSessions: true }) }).then(() => setNotice("Қолданушы сессиялары тоқтатылды")).catch((error) => setNotice(error instanceof Error ? error.message : "Әрекет орындалмады"))}>Сессияларды тоқтату</button></div>
              </article>)}
              {!users.length && <p className="empty-state">Қолданушы табылмады.</p>}
              {passwordTarget && <form className="password-reset-panel" onSubmit={resetPassword}><div><strong>{passwordTarget.name}</strong><small>Кемінде 10 таңба, әріп және цифр</small></div><input name="temporaryPassword" type="password" minLength={10} autoComplete="new-password" placeholder="Уақытша құпиясөз" required /><button className="button primary" type="submit">Орнату</button><button className="button secondary" type="button" onClick={() => setPasswordTarget(null)}>Бас тарту</button></form>}
            </div>
          ) : (
            <div className="content-admin-grid">
              <div className="admin-list">
                {content.map((item) => <button className="content-row" key={String(item.id)} onClick={() => section !== "audit" && void openContent(item)}>
                  <div><strong>{section === "audit" ? String(item.action) : contentTitle(item)}</strong><small>{section === "audit" ? `${String(item.actorName)} · ${String(item.entityType)}` : String(item.status ?? item.symbol ?? item.type ?? "Өңдеуге дайын")}</small></div>
                  {section !== "audit" && <Settings />}
                </button>)}
                {!content.length && <p className="empty-state">Бұл бөлімде дерек табылмады.</p>}
              </div>
              {creating && <form className="content-editor create-editor" onSubmit={addContent}>
                <div className="panel-head"><div><span>Жаңа жазба</span><h2>{adminSections.find(([id]) => id === section)?.[1]} қосу</h2></div><button type="button" className="icon-button" onClick={() => setCreating(false)} aria-label="Форманы жабу"><X /></button></div>
                {createFields(section, options).map((field) => <label key={field.name}>{field.label}
                  {field.type === "textarea"
                    ? <textarea name={field.name} defaultValue={field.defaultValue} placeholder={field.placeholder} required={field.required} />
                    : field.type === "select"
                      ? <select name={field.name} defaultValue={field.defaultValue ?? field.options?.[0]?.value} required={field.required}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                      : <input name={field.name} type={field.type ?? "text"} defaultValue={field.type === "file" ? undefined : field.defaultValue} accept={field.type === "file" ? section === "presentations" ? ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" : section === "assignments" ? ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : section === "syllabuses" ? ".pdf,application/pdf" : "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,.ppt,.pptx,.doc,.docx" : undefined} placeholder={field.placeholder} required={field.required} min={field.type === "number" ? 0 : undefined} />}
                </label>)}
                <button className="button primary wide" type="submit"><Plus /> Контентті қосу</button>
              </form>}
              {selected && section === "lessons" && <LessonAdminEditor lessonId={String(selected.id)} onClose={() => setSelected(null)} onSaved={async () => {
                setNotice("Сабақтың барлық бөлімдері сақталды");
                setSelected(null);
                await Promise.all([load(), onContentChanged()]);
              }} />}
              {selected && section === "elements" && <ElementAdminEditor item={selected} onClose={() => setSelected(null)} onSaved={async () => {
                setNotice("Элемент мәліметтері сақталды");
                setSelected(null);
                await Promise.all([load(), onContentChanged()]);
              }} />}
              {selected && section !== "lessons" && section !== "elements" && <form className="content-editor" onSubmit={saveContent}>
                <div className="panel-head"><div><span>Редактор</span><h2>{contentTitle(selected)}</h2></div><button type="button" className="icon-button" onClick={() => setSelected(null)} aria-label="Редакторды жабу"><X /></button></div>
                {section === "feedback" && <div className="feedback-context"><strong>{String(selected.userName ?? "Қолданушы")}</strong><small>@{String(selected.username ?? "—")} · {String(selected.email ?? "")}</small><p>{String(selected.message ?? "")}</p>{Boolean(selected.relatedPage) && <span>Қатысты бет: {String(selected.relatedPage)}</span>}</div>}
                {["presentations", "assignments"].includes(section) && <label>Файлды ауыстыру (міндетті емес)<input name="file" type="file" accept={section === "presentations" ? ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" : ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"} /><small>Қазіргі файл: {String(selected.fileName ?? "—")}</small></label>}
                {editableFields.map(([key, value]) => <label key={key}>{key}{key === "status" ? <select name={key} defaultValue={String(value)}>{(section === "feedback" ? [{ value: "new", label: "Жаңа" }, { value: "read", label: "Оқылды" }, { value: "resolved", label: "Шешілді" }] : statusOptions).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <textarea name={key} defaultValue={String(value ?? "")} />}</label>)}
                <button className="button primary wide" type="submit"><Check /> Өзгерісті сақтау</button>
                {section !== "feedback" && <button className="button secondary wide" type="button" onClick={() => void toggleDeleted(String(selected.id), showDeleted)}>{showDeleted ? "Қалпына келтіру" : "Архивке жіберу"}</button>}
                {section !== "feedback" && <div className="version-history"><strong>Нұсқалар тарихы</strong>{versions.length ? versions.map((version) => <button type="button" key={version.id} onClick={() => void restoreVersion(version.id)}><span>v{version.version} · {version.createdBy}</span><small>{version.changeNote || "Өзгеріс сақталды"}</small></button>) : <small>Алдыңғы нұсқа әлі жоқ</small>}</div>}
              </form>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const clientRegisterSchema = z.object({
  name: z.string().trim().min(2, "Аты-жөніңізді енгізіңіз"),
  username: z.string().trim().toLowerCase().min(3, "Логин кемінде 3 таңба").max(24).regex(/^[a-z0-9._]+$/, "Тек латын әріптері, цифр, нүкте және _"),
  password: z.string().min(10, "Құпиясөз кемінде 10 таңба").regex(/[a-zA-Z]/, "Кемінде бір әріп қажет").regex(/[0-9]/, "Кемінде бір цифр қажет"),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, { path: ["passwordConfirm"], message: "Құпиясөздер сәйкес келмейді" });

function AuthView({ onSuccess, initialMode = "login" }: { onSuccess: (user: SessionUser) => void; initialMode?: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErrors({}); setNotice("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (mode === "register") {
      const validation = clientRegisterSchema.safeParse(values);
      if (!validation.success) { setErrors(Object.fromEntries(validation.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return; }
    }
    setBusy(true);
    try {
      const remember = mode === "login" && values.remember === "on";
      const result = await apiRequest<{ user: SessionUser; token: string }>(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(mode === "login" ? {
        username: String(values.username ?? ""), password: String(values.password ?? ""), remember: values.remember === "on",
      } : {
        name: String(values.name ?? ""), username: String(values.username ?? ""), email: String(values.email ?? ""),
        password: String(values.password ?? ""), passwordConfirm: String(values.passwordConfirm ?? ""),
        level: String(values.level ?? "10-сынып"), acceptedTerms: values.acceptedTerms === "on",
      }) });
      saveApiToken(result.token, remember);
      onSuccess(result.user);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Сұрау орындалмады"); }
    finally { setBusy(false); }
  }
  function changeMode(next: "login" | "register") {
    setMode(next); setErrors({}); setNotice("");
    window.history.replaceState(null, "", appPath(next === "login" ? "/login" : "/register"));
  }
  return <div className="auth-page">
    <section className="auth-aside"><Brand /><div><span className="eyebrow"><ShieldCheck /> Қауіпсіз оқу кеңістігі</span><h1>Химиямен<br />бірге өс.</h1><p>Оқу прогресің, жетістіктерің және тәжірибе нәтижелерің бір жерде қауіпсіз сақталады.</p></div><div className="auth-quote"><Atom /><p>«Ғылым — жауаптар жинағы емес, дұрыс сұрақ қоя білу өнері.»</p></div></section>
    <section className="auth-form-wrap"><button className="back-link" onClick={() => { window.location.href = appPath("/"); }}><ChevronLeft /> Басты бетке</button>
      <form className="auth-form" onSubmit={submit} noValidate>
        <span>{mode === "login" ? "Қош келдіңіз!" : "Жаңа оқу жолы"}</span>
        <h2>{mode === "login" ? "Аккаунтқа кіру" : "Жаңа аккаунт ашу"}</h2>
        <p>{mode === "login" ? "Email немесе логин мен құпиясөзді енгізіңіз." : "Деңгейіңізге сәйкес мектеп оқушысы немесе студент рөлі автоматты беріледі."}</p>
        {mode === "register" && <><label>Аты-жөні<input name="name" autoComplete="name" placeholder="Айару Қасымова" aria-invalid={!!errors.name} />{errors.name && <small>{errors.name}</small>}</label><label>Email <span className="optional">аккаунтты қалпына келтіру үшін</span><input name="email" type="email" autoComplete="email" placeholder="name@example.com" /></label></>}
        <label>{mode === "login" ? "Email немесе логин" : "Логин"}<input name="username" autoComplete="username" placeholder={mode === "login" ? "name@example.com немесе aiyaru_10" : "мысалы: aiyaru_10"} aria-invalid={!!errors.username} />{errors.username && <small>{errors.username}</small>}</label>
        <label>Құпиясөз<div className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Кемінде 10 таңба" aria-invalid={!!errors.password} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Құпиясөзді жасыру" : "Құпиясөзді көрсету"}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{errors.password && <small>{errors.password}</small>}</label>
        {mode === "register" && <><label>Құпиясөзді қайталау<input name="passwordConfirm" type={showPassword ? "text" : "password"} autoComplete="new-password" aria-invalid={!!errors.passwordConfirm} />{errors.passwordConfirm && <small>{errors.passwordConfirm}</small>}</label><label>Оқу деңгейі<select name="level"><option>7-сынып</option><option>8-сынып</option><option>9-сынып</option><option>10-сынып</option><option>11-сынып</option><option>Студент</option></select></label><label className="check-label"><input name="acceptedTerms" type="checkbox" /> Қолдану шарттарымен келісемін</label></>}
        {mode === "login" && <label className="check-label"><input name="remember" type="checkbox" /> Мені есте сақтау</label>}
        {notice && <p className="auth-error" role="alert">{notice}</p>}
        <button className="button primary wide" type="submit" disabled={busy}>{busy ? "Күте тұрыңыз…" : mode === "login" ? "Кіру" : "Тіркелу"} <ChevronRight /></button>
        <p className="switch-mode">{mode === "login" ? "Аккаунтыңыз жоқ па?" : "Аккаунтыңыз бар ма?"} <button type="button" onClick={() => changeMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Тіркелу" : "Кіру"}</button></p>
      </form>
    </section>
  </div>;
}

type LearningContentResponse = {
  lessons: Array<{ id: string; title: string; objective: string; gradeLevel: string | null; xpReward: number; unit: string; course: string }>;
  blocks: Array<{ id: string; lessonId: string; type: string; content: string; position: number }>;
  attachments: Array<{ lessonId: string; blockType: string; id: string; title: string; url: string; mimeType: string; altText: string; position: number }>;
  questions: Array<{ lessonId: string; prompt: string; correctAnswer: string; explanation: string; position: number; options: string | null }>;
};

function questionOptions(value: string | null | undefined, fallback: string[]) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length === 4 && parsed.every((item) => typeof item === "string") ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mergeLearningContent(content: LearningContentResponse) {
  const merged = curriculumLessons.map((lesson) => {
    const lessonOverride = content.lessons.find((item) => item.id === lesson.id);
    const blocks = content.blocks.filter((item) => item.lessonId === lesson.id);
    const theories = blocks.filter((item) => ["theory", "heading"].includes(item.type)).map((item) => item.content);
    const example = blocks.find((item) => item.type === "example")?.content;
    const remember = blocks.find((item) => item.type === "remember")?.content;
    const formula = blocks.find((item) => item.type === "formula")?.content;
    const questions = content.questions.filter((item) => item.lessonId === lesson.id);
    return {
      ...lesson,
      grade: gradeLevels.includes(lessonOverride?.gradeLevel as GradeLevel) ? lessonOverride!.gradeLevel as GradeLevel : lesson.grade,
      title: lessonOverride?.title ?? lesson.title,
      objective: lessonOverride?.objective ?? lesson.objective,
      unit: lessonOverride?.unit ?? lesson.unit,
      xp: lessonOverride?.xpReward ?? lesson.xp,
      theory: theories.length ? theories : lesson.theory,
      example: example ?? lesson.example,
      remember: remember ?? lesson.remember,
      attachments: content.attachments.filter((item) => item.lessonId === lesson.id),
      formula: formula ?? lesson.formula,
      quiz: lesson.quiz.map((question, index) => {
        const override = questions.find((item) => item.position === index + 1);
        if (!override) return question;
        const options = questionOptions(override.options, question.options);
        const answerIndex = options.findIndex((option) => option.toLocaleLowerCase("kk") === override.correctAnswer.toLocaleLowerCase("kk"));
        return {
          ...question,
          question: override.prompt,
          options,
          answer: answerIndex >= 0 ? answerIndex : question.answer,
          explanation: override.explanation,
        };
      }),
    };
  });
  const known = new Set(merged.map((lesson) => lesson.id));
  const created = content.lessons.filter((lesson) => !known.has(lesson.id)).map((lesson): CurriculumLesson => {
    const blocks = content.blocks.filter((item) => item.lessonId === lesson.id);
    const rawGrade = gradeLevels.includes(lesson.gradeLevel as GradeLevel) ? lesson.gradeLevel as GradeLevel : gradeLevels.find((grade) => `${lesson.course} ${lesson.unit}`.includes(grade)) ?? "10-сынып";
    const questions = content.questions.filter((item) => item.lessonId === lesson.id).slice(0, 3);
    return {
      id: lesson.id, grade: rawGrade, unit: lesson.unit, title: lesson.title, minutes: 10, xp: lesson.xpReward,
      objective: lesson.objective,
      theory: blocks.filter((item) => ["theory", "heading", "definition", "key_concept"].includes(item.type)).map((item) => item.content),
      formula: blocks.find((item) => ["formula", "chemical_equation"].includes(item.type))?.content,
      example: blocks.find((item) => ["example", "real_life"].includes(item.type))?.content ?? "Бұл сабаққа мысалды әкімші редактордан толықтыра алады.",
      remember: blocks.find((item) => ["remember", "summary"].includes(item.type))?.content ?? "Негізгі ұғымдарды өз сөзіңмен қайталап көр.",
      attachments: content.attachments.filter((item) => item.lessonId === lesson.id),
      quiz: questions.length === 3 ? questions.map((question) => {
        const options = questionOptions(question.options, [question.correctAnswer, "Басқа жауап", "Берілгені жеткіліксіз", "Жауабы жоқ"]);
        return { question: question.prompt, options, answer: Math.max(0, options.indexOf(question.correctAnswer)), explanation: question.explanation };
      }) : [1, 2, 3].map((number) => ({ question: `${number}. Сабақтың негізгі идеясын түсіндің бе?`, options: ["Иә", "Жоқ", "Қайталау керек", "Білмеймін"], answer: 0, explanation: "Сабақ мазмұнын тағы бір рет қысқаша қайтала." })),
    };
  });
  return [...merged, ...created];
}

export default function ChemBridgeApp({
  initialView = "home",
  initialAuthMode = "login",
}: {
  initialView?: View;
  initialAuthMode?: "login" | "register";
}) {
  const [view, setView] = useState<View>(initialView);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [actor, setActor] = useState<SessionUser | null>(null);
  const [learningLessons, setLearningLessons] = useState(curriculumLessons);
  const [publicCms, setPublicCms] = useState<PublicCmsContent | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState(curriculumLessons[0].id);
  const inApp = APP_VIEWS.includes(view);
  const refreshPublicContent = useCallback(async () => {
    const [learning, cms] = await Promise.all([
      apiRequest<LearningContentResponse>("/api/learning-content"),
      apiRequest<PublicCmsContent>("/api/public-content"),
    ]);
    setLearningLessons(mergeLearningContent(learning));
    setPublicCms(cms);
  }, []);
  useEffect(() => {
    apiRequest<SessionUser>("/api/session")
      .then((user) => { setActor(user); setSignedIn(true); })
      .catch(() => {
        if (APP_VIEWS.includes(initialView) && !["periodic", "reactions", "laboratory"].includes(initialView)) {
          setView("auth");
          window.history.replaceState(null, "", appPath("/login"));
        }
      })
      .finally(() => setSessionChecked(true));
    void refreshPublicContent().catch(() => undefined);
  }, [initialView, refreshPublicContent]);
  useEffect(() => {
    if (!signedIn) return;
    apiRequest<{ progress: Array<{ lessonId: string; percent: number }> }>("/api/progress")
      .then((result) => setCompletedLessonIds(result.progress.filter((item) => item.percent === 100).map((item) => item.lessonId)))
      .catch(() => undefined);
  }, [signedIn]);
  const go = (next: View) => {
    if (APP_VIEWS.includes(next) && !signedIn && !["periodic", "reactions", "laboratory"].includes(next)) {
      setView("auth");
      window.history.pushState(null, "", appPath("/login"));
    } else if (next === "admin" && !["admin", "content_admin"].includes(actor?.role ?? "")) {
      setView("dashboard");
    } else if (next === "teacher" && !["teacher", "admin"].includes(actor?.role ?? "")) {
      setView("dashboard");
    } else {
      setView(next);
    }
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    go("lesson");
  };
  const selectedLesson = learningLessons.find((lesson) => lesson.id === selectedLessonId) ?? learningLessons[0];
  const completedIds = new Set(completedLessonIds);
  const cmsReactions: ReactionItem[] = publicCms?.reactions.length
    ? publicCms.reactions.map((item) => ({ raw: item.equation, balanced: item.balancedEquation, type: item.type, hint: item.hint }))
    : [...reactions];
  const cmsExperiments: ExperimentItem[] = publicCms?.laboratories.length
    ? publicCms.laboratories.map((item, index) => {
      const fallback = experiments.find((experiment) => experiment.title === item.title);
      return fallback ?? {
        id: item.id,
        title: item.title,
        reagents: item.reagents.split(/\r?\n/).filter(Boolean),
        color: ["#22d3ee", "#8b5cf6", "#14b8a6", "#f59e0b"][index % 4],
        result: item.expectedObservation || item.description,
        equation: item.equation || "Реакция теңдеуін әкімші толықтырады",
        objective: item.objective || item.description,
        learningOutcome: item.learningOutcome,
        equipment: item.equipment.split(/\r?\n/).filter(Boolean),
        safety: item.safety,
        explanation: item.explanation,
        conclusion: item.conclusion,
        visualEffect: item.visualEffect,
        steps: publicCms?.laboratorySteps.filter((step) => step.experimentId === item.id).map((step) => step.instruction),
      };
    })
    : [...experiments];
  const cmsElements: ChemicalElement[] = publicCms?.elements.length
    ? publicCms.elements.map((item) => {
      const fallback = elements[item.atomicNumber - 1];
      const details = typeof item.details === "string"
        ? (() => { try { return JSON.parse(item.details) as Record<string, unknown>; } catch { return {}; } })()
        : (item.details && typeof item.details === "object" ? item.details as Record<string, unknown> : {});
      return {
        ...fallback,
        number: item.atomicNumber,
        symbol: item.symbol,
        name: item.nameKk,
        international: String(details.international ?? fallback.international),
        mass: String(details.mass ?? fallback.mass),
        period: Number(details.period ?? fallback.period),
        group: details.group === null ? null : Number(details.group ?? fallback.group),
        state: String(details.state ?? fallback.state),
        uses: String(details.uses ?? fallback.uses),
        safety: String(details.safety ?? fallback.safety),
      };
    })
    : [...elements];
  const navLabel = (id: string, fallback: string) =>
    publicCms?.navigation.find((item) => item.menu === "app" && item.href === id)?.label ?? fallback;
  async function logout() {
    await apiRequest("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    clearApiToken();
    setActor(null);
    setSignedIn(false);
    setCompletedLessonIds([]);
    window.sessionStorage.clear();
    setView("auth");
    window.history.replaceState(null, "", appPath("/login"));
  }
  const initials = actor?.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CB";

  if (!sessionChecked && inApp && !["periodic", "reactions", "laboratory"].includes(view)) return <main className={dark ? "theme-dark" : ""}><div className="route-loading" role="status">Аккаунт тексерілуде…</div></main>;

  if (view === "auth") return <main className={dark ? "theme-dark" : ""}><AuthView initialMode={initialAuthMode} onSuccess={(user) => { setActor(user); setSignedIn(true); setView("dashboard"); window.history.replaceState(null, "", appPath("/dashboard")); }} /></main>;

  return (
    <main className={dark ? "theme-dark" : ""}>
      {inApp && <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-top"><Brand /><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Мәзірді жабу"><X /></button></div>
        <nav aria-label="Негізгі навигация">
          <button className="home-link" onClick={() => go("home")}><Home /> Басты бет</button>
          <span>Оқу</span>
          {navItems.map(([id, label, Icon]) => <button className={view === id || (id === "world" && view === "lesson") ? "active" : ""} onClick={() => go(id)} key={id}><Icon />{navLabel(id, label)}{id === "world" && <small>{completedLessonIds.length}</small>}</button>)}
          {actor && ["student", "school_student", "university_student"].includes(actor.role) && <button className={view === "feedback" ? "active" : ""} onClick={() => go("feedback")}><MessageSquare /> Кері байланыс</button>}
          <span>Басқару</span>
          {(actor?.role === "admin" || actor?.role === "content_admin") && <button className={view === "admin" ? "active" : ""} onClick={() => go("admin")}><ShieldCheck /> Әкімші панелі</button>}
        </nav>
        <div className="sidebar-user"><button onClick={() => go("profile")}><span>{initials}</span><div><strong>{actor?.name ?? "ChemBridge оқушысы"}</strong><small>{actor?.level ?? "Оқу профилі"} · {actor?.xp ?? 0} XP</small></div><ChevronRight /></button><button className="logout-link" onClick={() => void logout()}><LogOut /> Жүйеден шығу</button></div>
      </aside>}
      <div className={inApp ? "app-main" : ""}>
        <header className={inApp ? "app-header" : "public-header"}>
          {inApp ? <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Мәзірді ашу"><Menu /></button> : <Brand />}
          {!inApp && <nav><button onClick={() => go("home")}>Мүмкіндіктер</button><button onClick={() => go("world")}>Сабақтар</button><button onClick={() => go("periodic")}>Периодтық кесте</button><button onClick={() => go("laboratory")}>Зертхана</button></nav>}
          <div className="header-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "Ашық тақырып" : "Қараңғы тақырып"}>{dark ? <Sun /> : <Moon />}</button><button className="icon-button language" aria-label="Тілді таңдау"><Languages /><span>ҚАЗ</span></button>{!inApp && <button className="login-button" onClick={() => go(signedIn ? "dashboard" : "auth")}><LogIn /> {signedIn ? "Кабинет" : "Кіру"}</button>}{inApp && <button className="header-avatar" onClick={() => go("profile")} aria-label="Профиль">{initials}</button>}</div>
        </header>
        <AnimatePresence mode="wait"><motion.div key={view} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
          {view === "home" && <HomeView cms={publicCms} onStart={() => go(signedIn ? "dashboard" : "auth")} onPeriodic={() => go("periodic")} />}
          {view === "dashboard" && <DashboardView go={go} actor={actor} openLesson={openLesson} lessons={learningLessons} completedIds={completedIds} />}
          {view === "world" && <WorldView actor={actor} openLesson={openLesson} lessons={learningLessons} completedIds={completedIds} />}
          {view === "lesson" && <LessonView go={go} lesson={selectedLesson} onCompleted={(lessonId) => setCompletedLessonIds((current) => current.includes(lessonId) ? current : [...current, lessonId])} />}
          {view === "periodic" && <PeriodicView items={cmsElements} />}
          {view === "reactions" && <ReactionView items={cmsReactions} />}
          {view === "laboratory" && <LaboratoryView items={cmsExperiments} />}
          {view === "quizzes" && <QuizView actor={actor} lessons={learningLessons} />}
          {view === "videos" && <VideoLessonsView items={publicCms?.videos ?? []} actor={actor} />}
          {view === "syllabuses" && <SyllabusView items={publicCms?.syllabuses ?? []} actor={actor} />}
          {view === "presentations" && <LearningResourcesView kind="presentations" items={publicCms?.presentations ?? []} actor={actor} />}
          {view === "assignments" && <LearningResourcesView kind="assignments" items={publicCms?.assignments ?? []} actor={actor} />}
          {view === "feedback" && actor && <FeedbackView />}
          {view === "profile" && <ProfileView actor={actor} lessons={learningLessons} />}
          {view === "admin" && actor && (actor.role === "admin" || actor.role === "content_admin") && <AdminView actor={actor} onContentChanged={refreshPublicContent} />}
        </motion.div></AnimatePresence>
        {!inApp && <footer><Brand /><p>Химияны зертте. Тәжірибе жаса. Білімді байланыстыр.</p><div><button onClick={() => go("admin")}>Әкімшілік</button><button onClick={() => go("auth")}>Кіру</button></div><small>© 2026 ChemBridge. Қауіпсіз ғылыми білім.</small></footer>}
      </div>
      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Мәзірді жабу" />}
    </main>
  );
}
