import { Task } from "@/types/task";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const TASKS_STORAGE_KEY = "taskbuddy_tasks";

function carryForwardTasks(tasks: Task[]): Task[] {
  const today = getToday();
  const yesterday = getYesterday();

  const carriedForwardTasks = tasks
    .filter(
      (task) =>
        !task.completed &&
        task.date === yesterday &&
        !task.carryForwardDisabled,
    )
    .filter(
      (task) =>
        !tasks.some(
          (existingTask) =>
            existingTask.carriedForwardFrom === task.id &&
            existingTask.date === today,
        ),
    )
    .map((task) => ({
      ...task,
      id: `${task.id}-${today}`,
      date: today,
      carriedForwardFrom: task.id,
    }));

  return [...tasks, ...carriedForwardTasks];
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  async function loadTasks() {
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);

    if (!storedTasks) {
      return;
    }

    const parsedTasks: Task[] = JSON.parse(storedTasks);

    setTasks(carryForwardTasks(parsedTasks));
  }

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
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
    };
    setTasks((currentTasks) => [...currentTasks, newTask]);
    setNewTaskTitle("");
  }

  function deleteTask(id: string) {
    setTasks((currentTasks) => {
      const taskToDelete = currentTasks.find((task) => task.id === id);

      if (!taskToDelete) {
        return currentTasks;
      }

      if (taskToDelete.carriedForwardFrom) {
        return currentTasks
          .filter((task) => task.id !== id)
          .map((task) =>
            task.id === taskToDelete.carriedForwardFrom
              ? { ...task, carryForwardDisabled: true }
              : task,
          );
      }

      return currentTasks.filter((task) => task.id !== id);
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>TaskBuddy</Text>
        <Text style={styles.subtitle}>Tasks</Text>

        <TextInput
          style={styles.input}
          placeholder="What do you want to do?"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />

        <Pressable style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </Pressable>

        <Link href="/history" asChild>
          <Pressable style={styles.historyButton}>
            <Text style={styles.historyButtonText}>View History</Text>
          </Pressable>
        </Link>

        <View style={styles.taskList}>
          {tasks
            .filter((task) => task.date === getToday())
            .map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Pressable onPress={() => toggleTask(task.id)}>
                  <Text style={styles.taskTitle}>
                    {task.completed ? "☑" : "☐"} {task.title}
                  </Text>
                </Pressable>

                <Pressable onPress={() => deleteTask(task.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    marginTop: 4,
  },
  emptyState: {
    marginTop: 48,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
  taskList: {
    marginTop: 32,
    gap: 12,
  },
  taskItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  taskTitle: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 24,
  },
  addButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#333",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteText: {
    fontSize: 14,
    marginTop: 8,
  },
  historyButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
