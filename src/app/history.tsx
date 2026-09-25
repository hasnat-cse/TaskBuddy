import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Task } from "@/types/task";

const TASKS_STORAGE_KEY = "taskbuddy_tasks";

export default function HistoryScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function loadTasks() {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);

      if (!storedTasks) {
        return;
      }

      setTasks(JSON.parse(storedTasks));
    }

    loadTasks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          Your previous tasks will appear here.
        </Text>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>
                {task.completed ? "☑" : "☐"} {task.title}
              </Text>

              <Text style={styles.taskDate}>{task.date}</Text>
            </View>
          ))}
        </View>

        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Today</Text>
          </Pressable>
        </Link>
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
    marginTop: 8,
  },
  backButton: {
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
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
  taskDate: {
    fontSize: 14,
    marginTop: 8,
  },
});
