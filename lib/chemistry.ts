export type ParsedEquation = {
  left: Record<string, number>;
  right: Record<string, number>;
};

const SUBSCRIPTS: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
};

export function normalizeFormula(value: string) {
  return value.replace(/[₀-₉]/g, (char) => SUBSCRIPTS[char]).trim();
}

function parseFormula(formula: string): Record<string, number> {
  const clean = normalizeFormula(formula);
  if (!clean) throw new Error(`«${formula}» формуласы танылмады`);
  let cursor = 0;
  const readNumber = () => {
    const start = cursor;
    while (/\d/.test(clean[cursor] ?? "")) cursor += 1;
    return start === cursor ? 1 : Number(clean.slice(start, cursor));
  };
  const parseGroup = (insideParentheses = false): Record<string, number> => {
    const atoms: Record<string, number> = {};
    while (cursor < clean.length) {
      if (clean[cursor] === ")") {
        if (!insideParentheses) throw new Error(`«${formula}» формуласында жақша дұрыс емес`);
        cursor += 1;
        return atoms;
      }
      if (clean[cursor] === "(") {
        cursor += 1;
        const nested = parseGroup(true);
        const multiplier = readNumber();
        for (const [element, amount] of Object.entries(nested)) {
          atoms[element] = (atoms[element] ?? 0) + amount * multiplier;
        }
        continue;
      }
      const elementMatch = clean.slice(cursor).match(/^([A-Z][a-z]?)/);
      if (!elementMatch) throw new Error(`«${formula}» формуласы танылмады`);
      const element = elementMatch[1];
      cursor += element.length;
      atoms[element] = (atoms[element] ?? 0) + readNumber();
    }
    if (insideParentheses) throw new Error(`«${formula}» формуласында жақша жабылмаған`);
    return atoms;
  };
  const atoms = parseGroup();
  if (cursor !== clean.length) throw new Error(`«${formula}» формуласы танылмады`);
  return atoms;
}

function parseSide(side: string): Record<string, number> {
  const result: Record<string, number> = {};
  const compounds = side.split("+").map((part) => part.trim()).filter(Boolean);

  if (!compounds.length) throw new Error("Реакция бөлігі бос");

  for (const compound of compounds) {
    const normalized = normalizeFormula(compound);
    const coefficientMatch = normalized.match(/^(\d+)\s*(.+)$/);
    const coefficient = coefficientMatch ? Number(coefficientMatch[1]) : 1;
    const formula = coefficientMatch ? coefficientMatch[2] : normalized;
    const atoms = parseFormula(formula);

    for (const [element, amount] of Object.entries(atoms)) {
      result[element] = (result[element] ?? 0) + amount * coefficient;
    }
  }

  return result;
}

export function parseEquation(equation: string): ParsedEquation {
  const parts = equation.split(/\s*(?:→|->|=)\s*/);
  if (parts.length !== 2) {
    throw new Error("Теңдеуде бір ғана → белгісі болуы керек");
  }
  return { left: parseSide(parts[0]), right: parseSide(parts[1]) };
}

export function isEquationBalanced(equation: string) {
  const { left, right } = parseEquation(equation);
  const elements = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...elements].every((element) => left[element] === right[element]);
}

export function equationDifference(equation: string) {
  const { left, right } = parseEquation(equation);
  const elements = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...elements]
    .filter((element) => left[element] !== right[element])
    .map((element) => ({
      element,
      left: left[element] ?? 0,
      right: right[element] ?? 0,
    }));
}

export type XpReason = "LESSON" | "QUIZ" | "EXPERIMENT" | "DAILY_CHALLENGE";

const XP_AWARDS: Record<XpReason, number> = {
  LESSON: 50,
  QUIZ: 80,
  EXPERIMENT: 70,
  DAILY_CHALLENGE: 35,
};

export function calculateServerXp(reason: XpReason, score = 100) {
  const base = XP_AWARDS[reason];
  if (reason === "QUIZ") {
    return Math.round(base * Math.max(0, Math.min(score, 100)) / 100);
  }
  return base;
}

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

export function gradeQuiz(correct: number, total: number) {
  if (total <= 0) return { score: 0, passed: false, xp: 0 };
  const score = Math.round((correct / total) * 100);
  return {
    score,
    passed: score >= 70,
    xp: calculateServerXp("QUIZ", score),
  };
}
