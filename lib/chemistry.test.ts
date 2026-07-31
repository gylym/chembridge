import { describe, expect, it } from "vitest";
import {
  calculateServerXp,
  gradeQuiz,
  isEquationBalanced,
  levelFromXp,
} from "./chemistry";

describe("reaction balancing", () => {
  it("accepts a balanced equation with unicode subscripts", () => {
    expect(isEquationBalanced("2H₂ + O₂ → 2H₂O")).toBe(true);
  });

  it("rejects an unbalanced equation", () => {
    expect(isEquationBalanced("H₂ + O₂ → H₂O")).toBe(false);
  });

  it("supports grouped atoms in parentheses", () => {
    expect(isEquationBalanced("FeCl₃ + 3NaOH → Fe(OH)₃ + 3NaCl")).toBe(true);
    expect(isEquationBalanced("BaCl₂ + Na₂SO₄ → BaSO₄ + 2NaCl")).toBe(true);
  });
});

describe("XP service", () => {
  it("calculates XP from a trusted reason instead of a client value", () => {
    expect(calculateServerXp("LESSON")).toBe(50);
    expect(calculateServerXp("QUIZ", 75)).toBe(60);
  });

  it("calculates levels deterministically", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(900)).toBe(4);
  });
});

describe("quiz grading", () => {
  it("grades and awards proportional XP", () => {
    expect(gradeQuiz(4, 5)).toEqual({ score: 80, passed: true, xp: 64 });
  });
});
