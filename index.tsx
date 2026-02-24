import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push("/monitor");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        SAFE PULSE 🚀
      </Text>

      <Text style={styles.caption}>
        Informal Workers Safety Monitoring System
      </Text>

      <Text style={styles.subtitle}>
        Predict. Prevent. Protect.
      </Text>

      <TouchableOpacity
  style={[styles.button, { marginTop: 15, backgroundColor: "#FFD700" }]}
  onPress={() => router.push("/supervisor")}
>
  <Text style={[styles.buttonText, { color: "#0A1F44" }]}>
    Open Supervisor Dashboard
  </Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1F44",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  caption: {
    fontSize: 16,
    color: "#00D4FF",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#cccccc",
    marginTop: 10,
    fontStyle: "italic",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#00D4FF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "#0A1F44",
    fontWeight: "bold",
    fontSize: 16,
  },
});
