import { Task } from "@/types/task";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_STORAGE_KEY = "taskbuddy_tasks";

export async function loadTasks(): Promise<Task[]> {
  const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);

  if (!storedTasks) {
    return [];
  }

  return JSON.parse(storedTasks) as Task[];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
