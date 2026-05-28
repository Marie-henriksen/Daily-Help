import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import {
  EASY_TASKS,
  MEDIUM_TASKS,
  HARD_TASKS,
  Task,
  Goal,
  getBrainFactForDay,
  getDayNumberSince,
} from "./gameLogic";

const REINFORCEMENTS = [
  "Nice job",
  "You’re doing great",
  "Small steps count",
  "Proud of you",
  "Keep going",
  "You showed up today",
  "Beautiful progress",
  "You did that",
  "Well done",
  "Soft but steady",
];

type Tab = "today" | "rewards" | "stats";

interface TaskState {
  completed: boolean;
}

interface StoredState {
  startDate: string;
  streak: number;
  tokens: number;
  coupons: number;
  taskState: Record<string, TaskState>;
  extraTasks: Task[];
  goals: Goal[];
  dailyCompletion: Record<string, number>;
}

interface CalendarProps {
  dailyCompletion: Record<string, number>;
}

const STORAGE_KEY = "daily-help-state-v1";

const defaultStartDate = new Date().toISOString().slice(0, 10);

const saveState = (state: StoredState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadState = (): StoredState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        startDate: defaultStartDate,
        streak: 1,
        tokens: 0,
        coupons: 0,
        taskState: {},
        extraTasks: [],
        goals: [],
        dailyCompletion: {},
      };
    }

    const parsed = JSON.parse(raw) as StoredState;

    return {
      startDate: parsed.startDate || defaultStartDate,
      streak: parsed.streak ?? 1,
      tokens: parsed.tokens ?? 0,
      coupons: parsed.coupons ?? 0,
      taskState: parsed.taskState || {},
      extraTasks: parsed.extraTasks || [],
      goals: parsed.goals || [],
      dailyCompletion: parsed.dailyCompletion || {},
    };
  } catch {
    return {
      startDate: defaultStartDate,
      streak: 1,
      tokens: 0,
      coupons: 0,
      taskState: {},
      extraTasks: [],
      goals: [],
      dailyCompletion: {},
    };
  }
};

const Calendar: React.FC<CalendarProps> = ({ dailyCompletion }) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const lastDay = new Date(year, month + 1, 0);

  const days: {
    day: number;
    dateStr: string;
    status: number;
  }[] = [];

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(i).padStart(2, "0")}`;

    const status = dailyCompletion[dateStr] ?? 0;

    days.push({
      day: i,
      dateStr,
      status,
    });
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-title">Your month</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "6px",
          marginTop: "8px",
        }}
      >
        {days.map(({ day, dateStr, status }) => (
          <div
            key={dateStr}
            style={{
              height: 32,
              borderRadius: "10px",
              background: "#f8f3e7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#4f5f4a",
              position: "relative",
            }}
          >
            {day}

            {status > 0 && (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    status === 2
                      ? "var(--sage-dark)"
                      : "var(--sage)",
                  position: "absolute",
                  bottom: 4,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const initial = loadState();

  const [reinforcement, setReinforcement] = useState<string | null>(null);

  const [startDate] = useState<string>(initial.startDate);
  const [streak, setStreak] = useState<number>(initial.streak);
  const [tokens, setTokens] = useState<number>(initial.tokens);
  const [coupons, setCoupons] = useState<number>(initial.coupons);

  const [taskState, setTaskState] = useState<Record<string, TaskState>>(
    initial.taskState
  );

  const [extraTasks, setExtraTasks] = useState<Task[]>(
    initial.extraTasks
  );

  const [goals, setGoals] = useState<Goal[]>(initial.goals);

  const [dailyCompletion, setDailyCompletion] = useState<
    Record<string, number>
  >(initial.dailyCompletion);

  const [extraTaskInput, setExtraTaskInput] =
    useState<string>("");

  const [goalInput, setGoalInput] =
    useState<string>("");

  const [showTasks, setShowTasks] =
    useState<boolean>(false);

  const [activeTab, setActiveTab] =
    useState<Tab>("today");

  const [showWelcome, setShowWelcome] =
    useState<boolean>(true);

  const currentDay = getDayNumberSince(startDate);

  useEffect(() => {
    saveState({
      startDate,
      streak,
      tokens,
      coupons,
      taskState,
      extraTasks,
      goals,
      dailyCompletion,
    });
  }, [
    startDate,
    streak,
    tokens,
    coupons,
    taskState,
    extraTasks,
    goals,
    dailyCompletion,
  ]);

  const allTasksForToday: Task[] = useMemo(() => {
    return [
      ...EASY_TASKS.slice(0, 2),
      ...MEDIUM_TASKS.slice(0, 1),
      ...HARD_TASKS.slice(0, 1),
      ...extraTasks,
    ];
  }, [extraTasks]);

  const completedCount = useMemo(
    () =>
      allTasksForToday.filter(
        (t) => taskState[t.id]?.completed
      ).length,
    [allTasksForToday, taskState]
  );

  const completionPercent = allTasksForToday.length
    ? Math.round(
        (completedCount / allTasksForToday.length) * 100
      )
    : 0;

  const brainFact = getBrainFactForDay(currentDay);

  const handleToggleTask = (task: Task) => {
    setTaskState((prev) => {
      const prevCompleted =
        prev[task.id]?.completed ?? false;

      const newCompleted = !prevCompleted;

      if (newCompleted) {
        const msg =
          REINFORCEMENTS[
            Math.floor(
              Math.random() *
                REINFORCEMENTS.length
            )
          ];

        setReinforcement(msg);

        setTimeout(() => {
          setReinforcement(null);
        }, 2000);

        if (task.difficulty === "hard") {
          setCoupons((c) => c + 1);
        } else {
          setTokens(
            (t) => t + task.baseTokens
          );
        }
      } else {
        if (task.difficulty === "hard") {
          setCoupons((c) =>
            Math.max(0, c - 1)
          );
        } else {
          setTokens((t) =>
            Math.max(
              0,
              t - task.baseTokens
            )
          );
        }
      }

      const todayStr = new Date()
        .toISOString()
        .slice(0, 10);

      const total = allTasksForToday.length;

      const done = Object.values({
        ...prev,
        [task.id]: {
          completed: newCompleted,
        },
      }).filter((t) => t.completed).length;

      setDailyCompletion((prevCal) => ({
        ...prevCal,
        [todayStr]:
          done === 0
            ? 0
            : done === total
            ? 2
            : 1,
      }));

      return {
        ...prev,
        [task.id]: {
          completed: newCompleted,
        },
      };
    });
  };

  const handleAddExtraTask = () => {
    const trimmed =
      extraTaskInput.trim();

    if (!trimmed) return;

    const newTask: Task = {
      id: `extra-${Date.now()}`,
      title: trimmed,
      difficulty: "medium",
      baseTokens: 2,
      isExtra: true,
    };

    setExtraTasks((prev) => [
      ...prev,
      newTask,
    ]);

    setExtraTaskInput("");
  };

  const handleAddGoal = () => {
    const trimmed = goalInput.trim();

    if (!trimmed) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: trimmed,
    };

    setGoals((prev) => [
      ...prev,
      newGoal,
    ]);

    setGoalInput("");
  };

  const handleOpenDay = () => {
    setShowTasks(true);
    setActiveTab("today");
  };

  const storeItems = [
    {
      id: "theme-sage",
      name: "Calm Sage Theme",
      cost: 20,
    },
    {
      id: "skip-day",
      name: "Skip Day (keep streak)",
      cost: 15,
    },
    {
      id: "double-tokens",
      name: "Double Tokens (today)",
      cost: 25,
    },
  ];

  const handleBuyItem = (cost: number) => {
    if (tokens < cost) return;

    setTokens((t) => t - cost);
  };

  const totalTasks =
    allTasksForToday.length;

  const easyCount =
    allTasksForToday.filter(
      (t) => t.difficulty === "easy"
    ).length;

  const mediumCount =
    allTasksForToday.filter(
      (t) => t.difficulty === "medium"
    ).length;

  const hardCount =
    allTasksForToday.filter(
      (t) => t.difficulty === "hard"
    ).length;

  return (
    <div className="app-root">
      <div className="app-card">
        {reinforcement && (
          <div
            className="fade-in"
            style={{
              background:
                "var(--sage-light)",
              color: "var(--brown)",
              padding: "12px 16px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "16px",
              fontWeight: 600,
            }}
          >
            {reinforcement}
          </div>
        )}

        <header className="app-header">
          <div className="app-title">
            Daily Help
          </div>

          <div className="token-pill">
            <span>🪙 {tokens}</span>
            <span>• 🎟 {coupons}</span>
          </div>
        </header>

        {showWelcome && (
          <div
            className="fade-in"
            style={{
              textAlign: "center",
              padding: "30px 10px",
            }}
          >
            <h2
              style={{
                color: "var(--brown)",
                fontSize: "22px",
                marginBottom: "10px",
                fontWeight: 700,
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#4f5f4a",
                marginBottom: "24px",
              }}
            >
              How are you doing today?
            </p>

            <button
  className="button button-primary"
  style={{ padding: "10px 22px", fontSize: "14px" }}
  onClick={() => {
    setShowWelcome(false);
    setActiveTab("today");
    setShowTasks(true);
  }}
>
  Let’s get going
</button>

          </div>
        )}

        {!showWelcome && (
          <>
            <Calendar
              dailyCompletion={
                dailyCompletion
              }
            />

            <button
              className="streak-card"
              onClick={handleOpenDay}
            >
              <div className="streak-top">
                <div>
                  <div className="streak-label">
                    Current streak
                  </div>

                  <div className="streak-value">
                    {streak} days 🔥
                  </div>
                </div>

                <div className="progress-ring">
                  {completionPercent}%
                </div>
              </div>

              <div className="streak-day">
                Day {currentDay} • Tap to
                view today’s tasks
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;