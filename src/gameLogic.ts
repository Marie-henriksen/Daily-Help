export type Difficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  title: string;
  difficulty: Difficulty;
  baseTokens: number;
  isExtra?: boolean;
}

export interface Goal {
  id: string;
  title: string;
}

export const EASY_TASKS: Task[] = [
  { id: "empty-dishwasher", title: "Empty the dishwasher", difficulty: "easy", baseTokens: 1 },
  { id: "make-bed", title: "Make your bed", difficulty: "easy", baseTokens: 1 },
  { id: "wipe-counters", title: "Wipe kitchen counters", difficulty: "easy", baseTokens: 1 },
];

export const MEDIUM_TASKS: Task[] = [
  { id: "vacuum-living-room", title: "Vacuum the living room", difficulty: "medium", baseTokens: 2 },
  { id: "fold-laundry", title: "Fold a load of laundry", difficulty: "medium", baseTokens: 2 },
  { id: "clean-bathroom-sink", title: "Clean the bathroom sink", difficulty: "medium", baseTokens: 2 },
];

export const HARD_TASKS: Task[] = [
  { id: "deep-clean-kitchen", title: "Deep-clean the kitchen", difficulty: "hard", baseTokens: 0 },
  { id: "organize-closet", title: "Organize one closet", difficulty: "hard", baseTokens: 0 },
  { id: "declutter-room", title: "Declutter one room", difficulty: "hard", baseTokens: 0 },
];

const BRAIN_FACTS: string[] = [
  "Your brain loves patterns. Doing a task at the same time each day reduces decision fatigue.",
  "Small wins release dopamine, which reinforces habits and makes it easier to repeat them.",
  "Consistency matters more than intensity — 10 minutes daily beats 2 hours once a week.",
  "Linking a task to an existing habit (like coffee) makes it easier to remember.",
  "Checking off tasks gives your brain a sense of closure, which reduces stress.",
  "Breaking tasks into tiny steps lowers resistance and makes starting easier.",
  "Visual progress (like streaks) keeps your brain motivated to not 'break the chain'.",
  "Your environment shapes your habits — a tidy space makes action feel lighter.",
  "Self-compassion after a missed day helps you restart faster than self-criticism.",
  "Habits become automatic when your brain stops needing to 'decide' each time.",
];

export function getBrainFactForDay(day: number): string | null {
  if (day <= 10) {
    return BRAIN_FACTS[(day - 1) % BRAIN_FACTS.length];
  }
  const offset = day - 11;
  if (offset % 5 === 0) {
    const index = (10 + offset / 5) % BRAIN_FACTS.length;
    return BRAIN_FACTS[index];
  }
  return null;
}

export function getDayNumberSince(startDateISO: string): number {
  const start = new Date(startDateISO);
  const today = new Date();
  const diffMs = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}
