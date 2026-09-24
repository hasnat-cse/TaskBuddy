import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          Your previous tasks will appear here.
        </Text>

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
});
