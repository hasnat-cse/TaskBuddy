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
          {tasks
            .filter((task) => task.date === getToday())
            .map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskItem,
                  task.completed && styles.completedTaskItem,
                ]}
              >
                {editingTaskId === task.id ? (
                  <>
                    <TextInput
                      value={editingTaskTitle}
                      onChangeText={setEditingTaskTitle}
                      style={styles.editInput}
                      autoFocus
                    />

                    <View style={styles.taskActions}>
                      <Pressable onPress={saveEditedTask}>
                        <Text style={styles.editText}>Save</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setEditingTaskId(null);
                          setEditingTaskTitle("");
                        }}
                      >
                        <Text style={styles.deleteText}>Cancel</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Pressable
                      onPress={() => toggleTask(task.id)}
                      style={styles.taskContent}
                    >
                      <Text
                        style={[
                          styles.taskTitle,
                          task.completed && styles.completedTaskTitle,
                        ]}
                      >
                        {task.completed ? "☑" : "☐"} {task.title}
                      </Text>

                      {task.completed && task.completedAt && (
                        <Text style={styles.completedAt}>
                          Completed at{" "}
                          {new Date(task.completedAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Text>
                      )}
                    </Pressable>

                    <View style={styles.taskActions}>
                      <Pressable onPress={() => startEditingTask(task)}>
                        <Text style={styles.editText}>Edit</Text>
                      </Pressable>

                      <Pressable onPress={() => deleteTask(task.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            ))}
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
    backgroundColor: "#f8f8f8",
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
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
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  editText: {
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
  completedAt: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.6,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  completedTaskItem: {
    opacity: 0.7,
  },
});
