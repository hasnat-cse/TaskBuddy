import { loadTasks, saveTasks } from "@/services/taskStorage";
import { carryForwardTasks, getToday } from "@/services/taskUtils";
import { Task } from "@/types/task";
import { useEffect, useState } from "react";

export function useTasks() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  useEffect(() => {
    async function loadSavedTasks() {
      const savedTasks = await loadTasks();
      setTasks(carryForwardTasks(savedTasks));
      setIsLoaded(true);
    }

    loadSavedTasks();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    saveTasks(tasks);
  }, [tasks, isLoaded]);

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: task.completed
                ? undefined
                : new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      date: getToday(),
      carriedForward: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setNewTaskTitle("");
  }

  function deleteTask(id: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  }

  function saveEditedTask() {
    const title = editingTaskTitle.trim();

    if (!title || !editingTaskId) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editingTaskId ? { ...task, title } : task,
      ),
    );

    setEditingTaskId(null);
    setEditingTaskTitle("");
  }

  function cancelEditingTask() {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  }

  return {
    tasks,
    newTaskTitle,
    setNewTaskTitle,
    editingTaskId,
    editingTaskTitle,
    setEditingTaskTitle,
    toggleTask,
    addTask,
    deleteTask,
    startEditingTask,
    saveEditedTask,
    cancelEditingTask,
  };
}
