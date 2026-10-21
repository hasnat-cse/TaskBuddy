import { Task } from "@/types/task";

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function carryForwardTasks(tasks: Task[]): Task[] {
  const today = getToday();

  const tasksToCarryForward = tasks.filter(
    (task) => !task.completed && task.date !== today && !task.carriedForward,
  );

  const carriedForwardTasks = tasksToCarryForward.map((task) => ({
    ...task,
    id: `${task.id}-${today}`,
    date: today,
    carriedForward: false,
  }));

  const updatedTasks = tasks.map((task) =>
    tasksToCarryForward.some((taskToCarry) => taskToCarry.id === task.id)
      ? { ...task, carriedForward: true }
      : task,
  );

  return [...updatedTasks, ...carriedForwardTasks];
}
