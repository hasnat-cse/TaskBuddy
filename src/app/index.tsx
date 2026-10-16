import TaskItem from "@/components/TaskItem";
import { Task } from "@/types/task";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const TASKS_STORAGE_KEY = "taskbuddy_tasks";

function carryForwardTasks(tasks: Task[]) {
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

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

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

  const todayTasks = tasks.filter((task) => task.date === getToday());
  const completedToday = todayTasks.filter((task) => task.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>TaskBuddy</Text>
        <Text style={styles.subtitle}>
          {todayTasks.length === 0
            ? "No tasks for today"
            : `${completedToday} of ${todayTasks.length} tasks completed`}
        </Text>

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

        <ScrollView style={styles.taskList}>
          {todayTasks.length > 0 && (
            <Text style={styles.taskSectionTitle}>Today's tasks</Text>
          )}
          {todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>You're all caught up!</Text>
              <Text style={styles.emptyStateText}>
                Add a task above to get started.
              </Text>
            </View>
          ) : (
            todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isEditing={editingTaskId === task.id}
                editingTitle={editingTaskTitle}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => startEditingTask(task)}
                onDelete={() => deleteTask(task.id)}
                onSave={saveEditedTask}
                onCancel={() => {
                  setEditingTaskId(null);
                  setEditingTaskTitle("");
                }}
                onEditingTitleChange={setEditingTaskTitle}
              />
            ))
          )}
        </ScrollView>
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
    fontSize: 16,
    marginTop: 4,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    padding: 24,
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
  taskSectionTitle: {
    marginTop: 32,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
});
