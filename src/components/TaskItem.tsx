import { Task } from "@/types/task";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type TaskItemProps = {
  task: Task;
  isEditing: boolean;
  editingTitle: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditingTitleChange: (title: string) => void;
};

export default function TaskItem({
  task,
  isEditing,
  editingTitle,
  onToggle,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditingTitleChange,
}: TaskItemProps) {
  return (
    <View style={[styles.taskItem, task.completed && styles.completedTaskItem]}>
      {isEditing ? (
        <>
          <TextInput
            value={editingTitle}
            onChangeText={onEditingTitleChange}
            style={styles.editInput}
            autoFocus
          />

          <View style={styles.taskActions}>
            <Pressable onPress={onSave}>
              <Text style={styles.editText}>Save</Text>
            </Pressable>

            <Pressable onPress={onCancel}>
              <Text style={styles.deleteText}>Cancel</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Pressable onPress={onToggle} style={styles.taskContent}>
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
            <Pressable onPress={onEdit}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>

            <Pressable onPress={onDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
  },
  completedTaskItem: {
    opacity: 0.7,
  },
  taskTitle: {
    fontSize: 16,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  completedAt: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.6,
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
  deleteText: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
});
